// Motor NLP Inteligente para Classificação de Gastos e Receitas em Português

export const CATEGORIES_CONFIG = {
  // NECESSIDADES (50%)
  Alimentação: { pillar: 'needs', icon: '🛒', color: '#10b981', keywords: ['mercado', 'supermercado', 'feira', 'padaria', 'sacolão', 'açougue', 'compras mês', 'arroz', 'carne'] },
  Moradia: { pillar: 'needs', icon: '🏠', color: '#3b82f6', keywords: ['aluguel', 'apartamento', 'condomínio', 'iptu', 'reforma', 'gás', 'manutenção casa'] },
  'Contas Essenciais': { pillar: 'needs', icon: '💡', color: '#06b6d4', keywords: ['luz', 'energia', 'água', 'saneamento', 'internet', 'wifi', 'celular', 'plano celular'] },
  Saúde: { pillar: 'needs', icon: '💊', color: '#ec4899', keywords: ['farmácia', 'remédio', 'médico', 'consulta', 'exame', 'plano de saúde', 'dentista'] },
  Transporte: { pillar: 'needs', icon: '🚗', color: '#6366f1', keywords: ['combustível', 'gasolina', 'etanol', 'uber', '99', 'ônibus', 'metrô', 'estacionamento', 'ipva', 'mecânico'] },

  // DESEJOS (30%)
  'Lazer & Passeios': { pillar: 'wants', icon: '🍿', color: '#f59e0b', keywords: ['cinema', 'filme', 'passeio', 'show', 'teatro', 'parque', 'viagem', 'hotel', 'praia'] },
  Restaurante: { pillar: 'wants', icon: '🍽️', color: '#f97316', keywords: ['restaurante', 'almoço fora', 'jantar', 'iFood', 'delivery', 'pizza', 'hambúrguer', 'lanche', 'bar', 'cerveja', 'café'] },
  'Assinaturas & Tech': { pillar: 'wants', icon: '📺', color: '#8b5cf6', keywords: ['netflix', 'spotify', 'prime', 'disney', 'youtube', 'hbomax', 'game', 'psn', 'xbox', 'steam', 'chatgpt'] },
  'Compras Pessoais': { pillar: 'wants', icon: '🛍️', color: '#d946ef', keywords: ['roupa', 'sapato', 'tênis', 'cosmético', 'maquiagem', 'presente', 'salão', 'barbeiro', 'cabelo', 'shopping'] },
  'Outros Gastos': { pillar: 'wants', icon: '📦', color: '#94a3b8', keywords: ['outros', 'gasto', 'despesa', 'avulso'] },

  // FUTURO (20%)
  'Reserva de Emergência': { pillar: 'future', icon: '🛡️', color: '#10b981', keywords: ['reserva', 'emergência', 'guardar', 'poupança', 'reserva de emergência'] },
  Investimentos: { pillar: 'future', icon: '📈', color: '#059669', keywords: ['investimento', 'ações', 'fii', 'tesouro', 'cdb', 'cripto', 'btc', 'aporte'] },

  // ENTRADAS / RENDA
  'Salário & Rendimentos': { pillar: 'income', icon: '💰', color: '#22c55e', keywords: ['salário', 'salario', 'pagamento', 'prolabore', 'remuneração'] },
  'Freelance & Bicos': { pillar: 'income', icon: '💻', color: '#10b981', keywords: ['freelance', 'freela', 'bico', 'job', 'serviço'] },
  'Vendas & Extras': { pillar: 'income', icon: '🏷️', color: '#34d399', keywords: ['venda', 'vendi', 'desapego', 'extra', 'comissão', 'comissao', 'bônus', 'bonus'] },
  'Rendimentos & Dividendos': { pillar: 'income', icon: '📊', color: '#059669', keywords: ['rendimento', 'dividendo', 'juros', 'lucro'] },
  'Reembolso & Cashback': { pillar: 'income', icon: '🔄', color: '#14b8a6', keywords: ['reembolso', 'cashback', 'estorno'] },
  'Outras Entradas': { pillar: 'income', icon: '✨', color: '#6ee7b7', keywords: ['pix', 'receita', 'recebi', 'ganhei', 'ganho', 'faturei', 'faturamento', 'depósito', 'deposito', 'entrada'] }
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parseTransactionMessage(text, currentUserName = 'Kevin') {
  if (!text || typeof text !== 'string') return null;

  const rawText = text.trim();
  const lower = rawText.toLowerCase();

  // 1. Extração abrangente do valor financeiro (suporta 2.800, 2.800 mil, 10.000,00, 150,50, 2k, etc.)
  const amountPattern = /(?:r\$\s*)?(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d+(?:[,\.]\d{1,2})?|\d+)\s*(mil\b|k\b)?/i;
  const match = lower.match(amountPattern);
  
  if (!match) {
    return {
      success: false,
      error: 'Não consegui identificar o valor. Tente digitar por exemplo: "Mercado 150" ou "Aluguel 2.800"'
    };
  }

  const rawMatchedText = match[0];
  const numStr = match[1];
  const multiplier = match[2] ? match[2].toLowerCase() : null;

  let baseAmount = 0;

  if (/\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?/.test(numStr)) {
    // Milhares formato BR (2.800 ou 10.000,50)
    const cleanStr = numStr.replace(/\./g, '').replace(',', '.');
    baseAmount = parseFloat(cleanStr);
  } else if (/\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?/.test(numStr)) {
    // Milhares formato US (2,800.50)
    const cleanStr = numStr.replace(/,/g, '');
    baseAmount = parseFloat(cleanStr);
  } else if (/[,\.]/.test(numStr)) {
    // Decimais comuns (150,50 ou 2.8)
    baseAmount = parseFloat(numStr.replace(',', '.'));
  } else {
    // Inteiros simples (2800, 150)
    baseAmount = parseFloat(numStr);
  }

  if (isNaN(baseAmount) || baseAmount <= 0) {
    return {
      success: false,
      error: 'Valor inválido. Por favor envie um valor maior que zero.'
    };
  }

  let amount = baseAmount;
  if (multiplier) {
    if (baseAmount < 1000) {
      amount = baseAmount * 1000;
    }
  }

  // 2. Determinar se é Receita ou Despesa
  const incomeCategories = Object.entries(CATEGORIES_CONFIG).filter(([_, cfg]) => cfg.pillar === 'income');
  const incomeKeywords = incomeCategories.flatMap(([_, cfg]) => cfg.keywords);
  const isIncome = incomeKeywords.some(kw => lower.includes(kw));
  const type = isIncome ? 'income' : 'expense';

  // 3. Encontrar Categoria e Pilar
  let matchedCategory = isIncome ? 'Salário & Rendimentos' : 'Outros Gastos';
  let matchedPillar = isIncome ? 'income' : 'wants'; // Default para gastos avulsos se não encontrar

  let bestScore = 0;
  for (const [catName, config] of Object.entries(CATEGORIES_CONFIG)) {
    if (isIncome && config.pillar !== 'income') continue;
    if (!isIncome && config.pillar === 'income') continue;

    for (const kw of config.keywords) {
      if (lower.includes(kw)) {
        if (kw.length > bestScore) {
          bestScore = kw.length;
          matchedCategory = catName;
          matchedPillar = config.pillar;
        }
      }
    }
  }

  // 4. Checar se é conta fixa
  const fixedKeywords = ['fixo', 'fixa', 'mensal', 'aluguel', 'luz', 'água', 'condomínio', 'internet', 'plano', 'escola', 'faculdade'];
  const isFixed = fixedKeywords.some(kw => lower.includes(kw)) || matchedPillar === 'needs';

  // 5. Descrição amigável (remove o número e termos de moeda do texto para ficar limpo)
  let description = rawText
    .replace(new RegExp(escapeRegExp(rawMatchedText), 'i'), '')
    .replace(/\b(reais|real|conto|pila|r\$|mil|k)\b/gi, '')
    .replace(/\b(fixo|fixa|para|de|do|da|com|no|na)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!description) {
    description = matchedCategory;
  } else {
    // Capitaliza primeira letra
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }

  // 6. Resposta Gamificada do Bot & Ganho de XP
  const xpEarned = type === 'income' ? 30 : (matchedPillar === 'future' ? 25 : 15);
  const formattedAmount = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const botResponses = {
    needs: [
      `✅ Anotado, ${currentUserName}! R$ ${formattedAmount} em *${description}* (${matchedCategory} - Necessidades). Mantendo a casa em ordem! 🏠✨`,
      `👍 Registrado com sucesso! R$ ${formattedAmount} (${matchedCategory}). Contas essenciais devidamente contabilizadas. 💡`
    ],
    wants: [
      `🎉 Registrado! R$ ${formattedAmount} em *${description}* (${matchedCategory} - Desejos). Aproveite com sabedoria! 🍿`,
      `✅ Lançamento feito: R$ ${formattedAmount} em *${description}*. Lembre-se de monitorar a meta de desejos do mês! 🎯`
    ],
    future: [
      `🚀 EXCELENTE! R$ ${formattedAmount} em *${description}* direcionados para o Pilar FUTURO! Vocês estão mais perto da liberdade financeira! 🛡️💰`,
      `⭐ Orgulho do casal! R$ ${formattedAmount} investidos na reserva/futuro! +${xpEarned} XP garantidos! 🏆`
    ],
    income: [
      `💰 BOA! Receita de R$ ${formattedAmount} registrada (*${description}*). O saldo do casal agradece! 📈🎉`,
      `💵 Entrada de R$ ${formattedAmount} confirmada! Que essa prosperidade só aumente! 🙏✨`
    ]
  };

  const pool = botResponses[matchedPillar] || botResponses.needs;
  const botReply = pool[Math.floor(Math.random() * pool.length)];

  return {
    success: true,
    data: {
      id: Date.now().toString(),
      type,
      amount,
      description,
      category: matchedCategory,
      pillar: matchedPillar,
      isFixed,
      user: currentUserName,
      date: new Date().toISOString(),
      xpEarned,
      rawText
    },
    botReply
  };
}
