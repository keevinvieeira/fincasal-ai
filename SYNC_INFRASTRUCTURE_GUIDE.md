# 🚀 Guia Definitivo de Sincronização em Tempo Real (PC ↔ Celular) & Persistência Cloudflare KV

Este documento registra a arquitetura completa, lições aprendidas e soluções técnicas implementadas no **Fincasal AI** para garantir sincronização instantânea (<100ms) e persistência permanente 24/7 entre múltiplos dispositivos sem colisão ou perda de dados.

---

## 📐 1. Arquitetura da Solução

```
 ┌──────────────────────┐                     ┌──────────────────────┐
 │    Dispositivo A     │                     │    Dispositivo B     │
 │     (PC / Chrome)    │                     │   (Celular / Safari) │
 └──────────┬───────────┘                     └──────────▲───────────┘
            │                                            │
   (1) Post Snapshot (150ms debounce)           (2) Escuta SSE (<100ms)
            │                                            │
            ▼                                            │
 ┌───────────────────────────────────────────────────────┴──────────┐
 │ Canal de Eventos em Tempo Real (https://ntfy.sh/fincasal_room_*)│
 └──────────────────────────┬───────────────────────────────────────┘
                            │
              (3) Persistência Assíncrona
                            │
                            ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │ Roteador Edge Cloudflare Worker (_worker.js) + Cloudflare KV     │
 └──────────────────────────────────────────────────────────────────┘
```

### Componentes Principais:
1. **Broadcast Atômico via SSE (Server-Sent Events)**: Utiliza canais leves para transmissão instantânea sem necessidade de servidores WebSocket complexos.
2. **Cloudflare Workers & KV**: Roteador Serverless (`_worker.js`) interceptando a rota `/api/sync` para ler e gravar dados globais na memória de ultra-baixa latência (Cloudflare Key-Value Store).
3. **Snapshot Atômico com Debounce (150ms)**: Mecanismo no React que aguarda o término de todas as re-renderizações antes de enviar 100% do estado unificado.

---

## ⚡ 2. Lições Aprendidas & Gargalos Críticos Resolvidos

### 🛑 Problema 1: "Minha mensagem aparecia e apagava no mesmo instante" (Race Condition)
- **Causa Raiz**: Quando uma ação gerava múltiplas alterações no React em milissegundos (ex: mensagem do usuário + resposta do Bot), o app enviava dois pacotes seguidos. O 2º pacote continha o estado antigo do Chat antes do React re-renderizar, sobrescrevendo a mensagem nova.
- **Solução**: Implementação do **Broadcasting Atômico Debounced (150ms)**.
  ```javascript
  const triggerSync = () => {
    isLocalChange.current = true;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      broadcastAtomicState(); // Envia Snapshot 100% Completo
    }, 150);
  };
  ```

### 🛑 Problema 2: Conexão SSE caindo / Loop de Reconexão
- **Causa Raiz**: Passar o parâmetro `?since=now` na URL SSE do `ntfy.sh` gerava erro `HTTP 400 Bad Request: invalid since parameter`.
- **Solução**: Usar URL limpa para estabelecer o fluxo de escuta contínuo:
  ```javascript
  ntfyEvtSource = new EventSource(`https://ntfy.sh/${NTFY_TOPIC}/sse`);
  ```

### 🛑 Problema 3: Deploy Falhando na Cloudflare (Wrangler 4.114.0 Error)
- **Causa Raiz**: O utilitário Wrangler bloqueia uploads que contêm `_worker.js` dentro do diretório de assets (`./dist`) por motivos de segurança.
- **Solução**:
  1. Adicionar o arquivo `.assetsignore` na raiz e na pasta `dist/`.
  2. Adicionar `main = "_worker.js"` no `wrangler.toml`.
  3. Criar o script de build dedicado `build.js`:
     ```javascript
     import fs from 'fs';
     fs.mkdirSync('dist', { recursive: true });
     fs.copyFileSync('index.html', 'dist/index.html');
     fs.copyFileSync('manifest.json', 'dist/manifest.json');
     fs.writeFileSync('dist/.assetsignore', '');
     if (fs.existsSync('_worker.js')) fs.copyFileSync('_worker.js', 'dist/_worker.js');
     ```

### 🛑 Problema 4: Banco KV mostrando 0 Reads e 0 Writes
- **Causa Raiz**: O binding do KV no Cloudflare precisa estar estritamente configurado no `wrangler.toml` vinculando o ID do namespace com o nome da variável:
  ```toml
  name = "fincasal-ai"
  main = "_worker.js"
  compatibility_date = "2026-07-27"

  [assets]
  directory = "./dist"

  [[kv_namespaces]]
  binding = "FINCASAL_KV"
  id = "52be802caa244186a21e6d3b68b2d8a6"
  ```

---

## 🛠️ 3. Estrutura dos Arquivos de Configuração

### `wrangler.toml`
Contém as definições do ambiente de publicação na nuvem Cloudflare:
```toml
name = "fincasal-ai"
main = "_worker.js"
compatibility_date = "2026-07-27"

[assets]
directory = "./dist"

[[kv_namespaces]]
binding = "FINCASAL_KV"
id = "52be802caa244186a21e6d3b68b2d8a6"
```

### `build.js`
Script Node.js executado durante a esteira de CI/CD (`npm run build`):
```javascript
import fs from 'fs';

fs.mkdirSync('dist', { recursive: true });
fs.copyFileSync('index.html', 'dist/index.html');
fs.copyFileSync('manifest.json', 'dist/manifest.json');
fs.writeFileSync('dist/.assetsignore', '');
if (fs.existsSync('_worker.js')) {
  fs.copyFileSync('_worker.js', 'dist/_worker.js');
}
console.log('Dist created with _worker.js and .assetsignore successfully!');
```

---

## 📝 4. Passo a Passo para Reutilizar em Projetos Futuros

1. **Copiar o `_worker.js` e `build.js`** para o novo projeto.
2. **Criar a Namespace KV na Cloudflare**:
   - No Dashboard da Cloudflare -> Workers & Pages -> KV -> Criar Namespace (ex: `MEU_APP_KV`).
   - Copiar o ID retornado (32 caracteres).
3. **Configurar o `wrangler.toml`** com o nome do aplicativo e o ID do KV.
4. **No Frontend (React/JS)**:
   - Implementar o `EventSource` apontando para o canal de sincronização.
   - Usar a técnica de **Debounced Atomic Snapshot (150ms)** ao atualizar o estado para evitar race conditions.

---
*Documento gerado automaticamente para referência futura do projeto.*
