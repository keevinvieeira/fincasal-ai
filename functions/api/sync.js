// Cloudflare Pages Function for Real-Time Sync
// Binding recomendado em Pages: KV Namespace "FINCASAL_KV"

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

function getSecureCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Type': 'application/json'
  };
}

export async function onRequestGet({ env }) {
  const corsHeaders = getSecureCorsHeaders();

  try {
    if (env && env.FINCASAL_KV) {
      const dataStr = await env.FINCASAL_KV.get('dbState');
      if (dataStr) {
        return new Response(dataStr, { headers: corsHeaders });
      }
    }
  } catch (e) {
    console.error('KV Error:', e);
  }

  return new Response(JSON.stringify(DEFAULT_STATE), { headers: corsHeaders });
}

export async function onRequestPost({ request, env }) {
  const corsHeaders = getSecureCorsHeaders();

  try {
    const rawBody = await request.text();
    if (!rawBody || rawBody.length > 2 * 1024 * 1024) { // Max 2MB payload guard
      return new Response(JSON.stringify({ success: false, error: 'Payload too large or empty' }), { status: 400, headers: corsHeaders });
    }

    const body = JSON.parse(rawBody);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON payload structure' }), { status: 400, headers: corsHeaders });
    }

    // Whitelist payload keys to prevent prototype pollution and arbitrary injection
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
        try {
          currentData = JSON.parse(dataStr);
        } catch (e) {
          console.error('Failed to parse stored KV data', e);
        }
      }
    }

    const updatedData = { ...currentData, ...sanitizedPayload, updatedAt: Date.now() };

    if (env && env.FINCASAL_KV) {
      await env.FINCASAL_KV.put('dbState', JSON.stringify(updatedData));
    }

    return new Response(JSON.stringify({ success: true, updatedAt: updatedData.updatedAt }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid request' }), { status: 400, headers: corsHeaders });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    }
  });
}
