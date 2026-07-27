// Cloudflare Workers & Pages Advanced Asset Worker Router
const JULY_DATE = '2026-07-15T12:00:00.000Z';
const JULY_KEY = '2026-07';
const ALLOWED_KEYS = ['profile', 'config', 'transactions', 'chatMessages', 'wishlist', 'gamification'];

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
    level: 1,
    levelTitle: 'Iniciantes das Finanças 🌱',
    xp: 0,
    xpNextLevel: 100,
    streakDays: 1,
    quests: [
      { id: 'q1', title: 'Primeiro Registro do Casal', description: 'Cadastrar a primeira conta ou salário no Chat', rewardXP: 50, completed: false },
      { id: 'q2', title: 'Meta de Lazer sob Controle', description: 'Manter os gastos de lazer dentro da meta mensal', rewardXP: 100, completed: false }
    ],
    badges: [
      { id: 'b1', icon: '🔥', title: 'Fogo nos Registros', description: 'Primeiro registro realizado', unlocked: false },
      { id: 'b2', icon: '🛡️', title: 'Reserva Protegida', description: 'Meta de reserva iniciada', unlocked: false },
      { id: 'b3', icon: '🛍️', title: 'Primeiro Desejo Realizado', description: 'Comprou um item da Wishlist com XP', unlocked: false }
    ]
  },
  updatedAt: 1700000000000
};

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Content-Type': 'application/json'
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = getCorsHeaders();

    if (url.pathname === '/api/debug') {
      return new Response(JSON.stringify({
        hasKV: !!(env && env.FINCASAL_KV),
        envKeys: env ? Object.keys(env) : []
      }), { headers });
    }

    if (url.pathname === '/api/sync') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
      }

      if (request.method === 'GET') {
        try {
          if (env && env.FINCASAL_KV) {
            const dataStr = await env.FINCASAL_KV.get('dbState');
            if (dataStr) {
              return new Response(dataStr, { headers });
            }
          }
        } catch (e) {}
        return new Response(JSON.stringify(DEFAULT_STATE), { headers });
      }

      if (request.method === 'POST') {
        try {
          const rawBody = await request.text();
          const body = JSON.parse(rawBody);
          const sanitizedPayload = {};
          for (const key of ALLOWED_KEYS) {
            if (Object.prototype.hasOwnProperty.call(body, key)) {
              sanitizedPayload[key] = body[key];
            }
          }

          let currentData = DEFAULT_STATE;
          if (env && env.FINCASAL_KV) {
            const dataStr = await env.FINCASAL_KV.get('dbState');
            if (dataStr) {
              try { currentData = JSON.parse(dataStr); } catch (e) {}
            }
          }

          const updatedData = { ...currentData, ...sanitizedPayload, updatedAt: Date.now() };
          if (env && env.FINCASAL_KV) {
            await env.FINCASAL_KV.put('dbState', JSON.stringify(updatedData));
          }

          return new Response(JSON.stringify({ success: true, updatedAt: updatedData.updatedAt, kvActive: !!(env && env.FINCASAL_KV) }), { headers });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: 'Invalid payload' }), { status: 400, headers });
        }
      }
    }

    return env.ASSETS ? env.ASSETS.fetch(request) : fetch(request);
  }
};
