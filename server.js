const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5173;
const DB_FILE = path.join(__dirname, 'db.json');

// Dados Padrão Iniciais
const JULY_DATE = '2026-07-15T12:00:00.000Z';
const JULY_KEY = '2026-07';

const DEFAULT_STATE = {
  profile: { partner1: 'Kevin', partner2: 'Milena', incomePartner1: 5000, incomePartner2: 4500, avatar1: '💙', avatar2: '💜' },
  config: { targetNeeds: 60, targetWants: 25, targetFuture: 15 },
  transactions: [
    { id: 'tx-inc-1', type: 'income', amount: 5000, description: 'Salário Kevin', category: 'Salário & Rendimentos', pillar: 'income', user: 'Kevin', date: JULY_DATE, monthKey: JULY_KEY },
    { id: 'tx-inc-2', type: 'income', amount: 4500, description: 'Salário Milena', category: 'Salário & Rendimentos', pillar: 'income', user: 'Milena', date: JULY_DATE, monthKey: JULY_KEY },
    { id: 'tx-1', type: 'expense', amount: 1800, description: 'Parcela Apartamento', category: 'Moradia', pillar: 'needs', user: 'Kevin', date: JULY_DATE, monthKey: JULY_KEY },
    { id: 'tx-2', type: 'expense', amount: 1350, description: 'Parcela Carro', category: 'Transporte', pillar: 'needs', user: 'Kevin', date: JULY_DATE, monthKey: JULY_KEY },
    { id: 'tx-3', type: 'expense', amount: 540, description: 'Condomínio', category: 'Moradia', pillar: 'needs', user: 'Kevin', date: JULY_DATE, monthKey: JULY_KEY },
    { id: 'tx-4', type: 'expense', amount: 230, description: 'Gás', category: 'Contas Essenciais', pillar: 'needs', user: 'Kevin', date: JULY_DATE, monthKey: JULY_KEY },
    { id: 'tx-5', type: 'expense', amount: 120, description: 'Luz', category: 'Contas Essenciais', pillar: 'needs', user: 'Kevin', date: JULY_DATE, monthKey: JULY_KEY },
    { id: 'tx-6', type: 'expense', amount: 100, description: 'Internet', category: 'Contas Essenciais', pillar: 'needs', user: 'Kevin', date: JULY_DATE, monthKey: JULY_KEY },
    { id: 'tx-7', type: 'expense', amount: 1500, description: 'Mercado Mensal', category: 'Alimentação', pillar: 'needs', user: 'Milena', date: JULY_DATE, monthKey: JULY_KEY }
  ],
  chatMessages: [
    { id: 'cm-1', sender: 'Kevin', type: 'text', content: 'Parcela apartamento 1800', timestamp: '21:06' },
    { id: 'cm-2', sender: 'Bot', type: 'bot', content: '✅ Anotado, Kevin! R$ 1.800,00 em Parcela Apartamento (Moradia - Necessidades). 🏠✨', timestamp: '21:06' },
    { id: 'cm-3', sender: 'Kevin', type: 'text', content: 'parcela carro 1350', timestamp: '21:06' },
    { id: 'cm-4', sender: 'Bot', type: 'bot', content: '✅ Anotado! R$ 1.350,00 em Parcela Carro (Transporte - Necessidades). 🚗', timestamp: '21:06' },
    { id: 'cm-5', sender: 'Kevin', type: 'text', content: 'mercado +-1500', timestamp: '21:08' },
    { id: 'cm-6', sender: 'Bot', type: 'bot', content: '✅ Anotado! R$ 1.500,00 em Mercado Mensal (Alimentação por Milena). 🛒✨ (+15 XP)', timestamp: '21:08' }
  ],
  wishlist: [
    { id: 'w1', name: 'Cafeteira Expressa de Cápsulas', price: 350, category: 'Compras Pessoais', purchased: false, xpRequired: 70, addedBy: 'Milena' },
    { id: 'w2', name: 'Air Fryer Grande 5 Litros', price: 450, category: 'Compras Pessoais', purchased: false, xpRequired: 90, addedBy: 'Kevin' },
    { id: 'w3', name: 'Fim de Semana na Pousada na Serra', price: 1200, category: 'Lazer & Passeios', purchased: false, xpRequired: 240, addedBy: 'Milena' },
    { id: 'w4', name: 'TV 55" 4K para a Sala', price: 2500, category: 'Compras Pessoais', purchased: false, xpRequired: 500, addedBy: 'Kevin' }
  ],
  gamification: {
    level: 3,
    levelTitle: 'Mestres do Planejamento 🏆',
    xp: 420,
    xpNextLevel: 500,
    streakDays: 5,
    quests: [
      { id: 'q1', title: 'Registro de Julho 2026', description: 'Cadastrar contas fixas do mês de Julho', progress: 7, total: 7, completed: true, rewardXP: 150 },
      { id: 'q2', title: 'Escudo do Futuro', description: 'Garantir no mínimo 15% em Reserva e Investimentos', progress: 500, total: 1000, completed: false, rewardXP: 150 }
    ],
    badges: [
      { id: 'b1', icon: '🔥', title: 'Fogo nos Registros', description: 'Todas as contas fixas cadastradas', unlocked: true },
      { id: 'b2', icon: '🛡️', title: 'Reserva Protegida', description: 'Meta de reserva iniciada', unlocked: true },
      { id: 'b3', icon: '🛍️', title: 'Primeiro Desejo Realizado', description: 'Comprou um item da Wishlist com XP', unlocked: false }
    ]
  },
  updatedAt: Date.now()
};

// Carregar ou Criar Banco de Dados Local
let dbState = DEFAULT_STATE;
if (fs.existsSync(DB_FILE)) {
  try {
    dbState = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    console.error('Erro ao ler db.json, usando padrão:', err);
  }
} else {
  fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
}

function saveDB() {
  dbState.updatedAt = Date.now();
  fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2));
  broadcastSSE(dbState);
}

// Suporte a Server-Sent Events (SSE) em Tempo Real
let sseClients = [];

function broadcastSSE(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => client.res.write(payload));
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.json': 'application/json',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  // Configuração CORS para conexões da rede local
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // SSE Real-Time Stream Endpoint
  if (req.url === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write(`data: ${JSON.stringify(dbState)}\n\n`);
    
    const clientId = Date.now();
    const newClient = { id: clientId, res };
    sseClients.push(newClient);

    req.on('close', () => {
      sseClients = sseClients.filter(c => c.id !== clientId);
    });
    return;
  }

  // API GET Sync
  if (req.method === 'GET' && req.url === '/api/sync') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(dbState));
    return;
  }

  // API POST Sync (Atualiza e Notifica Todos os Dispositivos)
  if (req.method === 'POST' && req.url === '/api/sync') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        dbState = { ...dbState, ...payload };
        saveDB();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, updatedAt: dbState.updatedAt }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Servir arquivos estáticos (index.html, manifest.json, etc.)
  let reqPath = req.url === '/' ? '/index.html' : req.url;
  let filePath = path.join(__dirname, reqPath);

  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'text/html';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor FinCasal AI rodando em http://0.0.0.0:${PORT}`);
  console.log(`🌐 Sincronização em tempo real ativa na sua rede local!`);
});
