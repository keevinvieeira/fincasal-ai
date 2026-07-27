// Motor NLP Inteligente para Classificação de Gastos e Receitas em Português

export const CATEGORIES_CONFIG = {
  // NECESSIDADES (50%)
  Alimentação: { pillar: 'needs', icon: '🛒', color: '#10b981', keywords: ['mercado', 'supermercado', 'feira', 'padaria', 'sacolão', 'açougue', 'compras mês', 'arroz', 'carne'] },
  Moradia: { pillar: 'needs', icon: '🏠', color: '#3b82f6', keywords: ['aluguel', 'condomínio', 'iptu', 'reforma', 'gás', 'manutenção casa'] },
  'Contas Essenciais': { pillar: 'needs', icon: '💡', color: '#06b6d4', keywords: ['luz', 'energia', 'água', 'saneamento', 'internet', 'wifi', 'celular', 'plano celular'] },
  Saúde: { pillar: 'needs', icon: '💊', color: '#ec4899', keywords: ['farmácia', 'remédio', 'médico', 'consulta', 'exame', 'plano de saúde', 'dentista'] },
  Transporte: { pillar: 'needs', icon: '🚗', color: '#6366f1', keywords: ['combustível', 'gasolina', 'etanol', 'uber', '99', 'ônibus', 'metrô', 'estacionamento', 'ipva', 'mecânico'] },

  // DESEJOS (30%)
  'Lazer & Passeios': { pillar: 'wants', icon: '🍿', color: '#f59e0b', keywords: ['cinema', 'filme', 'passeio', 'show', 'teatro', 'parque', 'viagem', 'hotel', 'praia'] },
  Restaurante: { pillar: 'wants', icon: '🍽️', color: '#f97316', keywords: ['restaurante', 'almoço fora', 'jantar', 'iFood', 'delivery', 'pizza', 'hambúrguer', 'lanche', 'bar', 'cerveja', 'café'] },
  'Assinaturas & Tech': { pillar: 'wants', icon: '📺', color: '#8b5cf6', keywords: ['netflix', 'spotify', 'prime', 'disney', 'youtube', 'hbomax', 'game', 'psn', 'xbox', 'steam', 'chatgpt'] },
  'Compras Pessoais': { pillar: 'wants', icon: '🛍️', color: '#d946ef', keywords: ['roupa', 'sapato', 'tênis', 'cosmético', 'maquiagem', 'presente', 'salão', 'barbeiro', 'cabelo', 'shopping'] },

  // FUTURO (20%)
  'Reserva de Emergência': { pillar: 'future', icon: '🛡️', color: '#10b981', keywords: ['reserva', 'emergência', 'guardar', 'poupança', 'reserva de emergência'] },
  Investimentos: { pillar: 'future', icon: '📈', color: '#059669', keywords: ['investimento', 'ações', 'fii', 'tesouro', 'cdb', 'cripto', 'btc', 'aporte'] },
  'Quitação de Dívidas': { pillar: 'future', icon: '⚖️', color: '#14b8a6', keywords: ['dívida', 'empréstimo', 'acordo', 'parcela', 'quitação', 'renegociação'] },

  // RECEITAS
  'Salário & Rendimentos': { pillar: 'income', icon: '💰', color: '#22c55e', keywords: ['salário', 'pagamento', 'proventos', 'freelance', 'pix recebido', 'venda', 'extra', 'rendimento', 'bônus', 'décimo'] }
};

export function parseTransactionMessage(text, currentUserName = 'Kevin') {
  if (!text || typeof text !== 'string') return null;

  const rawText = text.trim();
  const lower = rawText.toLowerCase();

  // 1. Extração do valor financeiro (ex: R$ 150,50 ou 150.50 ou 150)
  // Regex procura números com vírgula ou ponto
  const amountMatch = lower.match(/(?:r\$\s*)?(\d+(?:[\.,]\d{1,2})?)/i);
  
  if (!amountMatch) {
    return {
      success: false,
      error: 'Não consegui identificar o valor. Tente digitar por exemplo: "Mercado 150" ou "Aluguel 1200"'
    };
  }

  const amountStr = amountMatch[1].replace(',', '.');
  const amount = parseFloat(amountStr);

  if (isNaN(amount) || amount <= 0) {
    return {
      success: false,
      error: 'Valor inválido. Por favor envie um valor maior que zero.'
    };
  }

  // 2. Determinar se é Receita ou Despesa
  const isIncomeKeyword = CATEGORIES_CONFIG['Salário & Rendimentos'].keywords.some(kw => lower.includes(kw)) || lower.includes('receita') || lower.includes('ganhei');
  const type = isIncomeKeyword ? 'income' : 'expense';

  // 3. Encontrar Categoria e Pilar
  let matchedCategory = type === 'income' ? 'Salário & Rendimentos' : 'Outros';
  let matchedPillar = type === 'income' ? 'income' : 'wants'; // Default para gastos avulsos se não encontrar

  if (type === 'expense') {
    let bestScore = 0;

    for (const [catName, config] of Object.entries(CATEGORIES_CONFIG)) {
      if (catName === 'Salário & Rendimentos') continue;

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
  }

  // 4. Checar se é conta fixa
  const fixedKeywords = ['fixo', 'fixa', 'mensal', 'aluguel', 'luz', 'água', 'condomínio', 'internet', 'plano', 'escola', 'faculdade'];
  const isFixed = fixedKeywords.some(kw => lower.includes(kw)) || matchedPillar === 'needs';

  // 5. Descrição amigável (remove o número do texto para ficar limpo)
  let description = rawText
    .replace(/(?:r\$\s*)?\d+(?:[\.,]\d{1,2})?/gi, '')
    .replace(/\b(fixo|fixa|para|de|do|da|com|no|na)\b/gi, '')
    .trim();

  if (!description) {
    description = matchedCategory;
  } else {
    // Capitaliza primeira letra
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }

  // 6. Resposta Gamificada do Bot & Ganho de XP
  const xpEarned = type === 'income' ? 30 : (matchedPillar === 'future' ? 25 : 15);
  
  const botResponses = {
    needs: [
      `✅ Anotado, ${currentUserName}! R$ ${amount.toFixed(2)} em *${description}* (${matchedCategory} - Necessidades). Mantendo a casa em ordem! 🏠✨`,
      `👍 Registrado com sucesso! R$ ${amount.toFixed(2)} (${matchedCategory}). Contas essenciais devidamente contabilizadas. 💡`
    ],
    wants: [
      `🎉 Registrado! R$ ${amount.toFixed(2)} em *${description}* (${matchedCategory} - Desejos). Aproveite com sabedoria! 🍿`,
      `✅ Lançamento feito: R$ ${amount.toFixed(2)} em *${description}*. Lembre-se de monitorar a meta de desejos do mês! 🎯`
    ],
    future: [
      `🚀 EXCELENTE! R$ ${amount.toFixed(2)} em *${description}* direcionados para o Pilar FUTURO! Vocês estão mais perto da liberdade financeira! 🛡️💰`,
      `⭐ Orgulho do casal! R$ ${amount.toFixed(2)} investidos na reserva/futuro! +${xpEarned} XP garantidos! 🏆`
    ],
    income: [
      `💰 BOA! Receita de R$ ${amount.toFixed(2)} registrada (*${description}*). O saldo do casal agradece! 📈🎉`,
      `💵 Entrada de R$ ${amount.toFixed(2)} confirmada! Que essa prosperidade só aumente! 🙏✨`
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
