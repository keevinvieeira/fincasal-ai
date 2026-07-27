// Gerenciador de Persistência e Dados Iniciais Reais do Casal

const STORAGE_KEYS = {
  TRANSACTIONS: 'fincasal_transactions_v1',
  PROFILE: 'fincasal_profile_v1',
  BUDGET_CONFIG: 'fincasal_budget_config_v1',
  GAMIFICATION: 'fincasal_gamification_v1',
  CHAT_MESSAGES: 'fincasal_chat_messages_v1'
};

const DEFAULT_PROFILE = {
  partner1: 'Kevin',
  partner2: 'Esposa',
  incomePartner1: 4500,
  incomePartner2: 4000,
  avatar1: '💙',
  avatar2: '💜',
  splitMethod: 'proportional' // 'proportional' ou 'equal'
};

const DEFAULT_BUDGET_CONFIG = {
  // Regra Padrão 50/30/20 rebalanceável
  targetNeeds: 60,   // 60% para necessidades (rebalanceado pois contas fixas estão altas)
  targetWants: 25,    // 25% desejos
  targetFuture: 15,   // 15% futuro
  isRebalanced: true  // Indica que foi ajustado para contas fixas altas
};

const INITIAL_TRANSACTIONS = [
  // Mês Atual
  { id: '1', type: 'income', amount: 4500, description: 'Salário Kevin', category: 'Salário & Rendimentos', pillar: 'income', user: 'Kevin', date: new Date(Date.now() - 86400000 * 20).toISOString(), isFixed: true },
  { id: '2', type: 'income', amount: 4000, description: 'Salário Esposa', category: 'Salário & Rendimentos', pillar: 'income', user: 'Esposa', date: new Date(Date.now() - 86400000 * 20).toISOString(), isFixed: true },
  
  // Necessidades (Contas Fixas & Mercado)
  { id: '3', type: 'expense', amount: 1800, description: 'Aluguel & Condomínio', category: 'Moradia', pillar: 'needs', user: 'Kevin', date: new Date(Date.now() - 86400000 * 18).toISOString(), isFixed: true },
  { id: '4', type: 'expense', amount: 350, description: 'Conta de Luz (Energia)', category: 'Contas Essenciais', pillar: 'needs', user: 'Esposa', date: new Date(Date.now() - 86400000 * 15).toISOString(), isFixed: true },
  { id: '5', type: 'expense', amount: 120, description: 'Internet Fibra', category: 'Contas Essenciais', pillar: 'needs', user: 'Kevin', date: new Date(Date.now() - 86400000 * 14).toISOString(), isFixed: true },
  { id: '6', type: 'expense', amount: 420, description: 'Supermercado Mensal', category: 'Alimentação', pillar: 'needs', user: 'Esposa', date: new Date(Date.now() - 86400000 * 10).toISOString(), isFixed: false },
  { id: '7', type: 'expense', amount: 250, description: 'Gasolina Carro', category: 'Transporte', pillar: 'needs', user: 'Kevin', date: new Date(Date.now() - 86400000 * 8).toISOString(), isFixed: false },
  { id: '8', type: 'expense', amount: 180, description: 'Remédios & Farmácia', category: 'Saúde', pillar: 'needs', user: 'Esposa', date: new Date(Date.now() - 86400000 * 5).toISOString(), isFixed: false },

  // Desejos (Lazer, Restaurante)
  { id: '9', type: 'expense', amount: 120, description: 'Jantar de Sexta - Pizza', category: 'Restaurante', pillar: 'wants', user: 'Kevin', date: new Date(Date.now() - 86400000 * 6).toISOString(), isFixed: false },
  { id: '10', type: 'expense', amount: 85, description: 'Cinema & Pipoca', category: 'Lazer & Passeios', pillar: 'wants', user: 'Esposa', date: new Date(Date.now() - 86400000 * 3).toISOString(), isFixed: false },
  { id: '11', type: 'expense', amount: 55, description: 'Assinatura Netflix + Spotify', category: 'Assinaturas & Tech', pillar: 'wants', user: 'Kevin', date: new Date(Date.now() - 86400000 * 12).toISOString(), isFixed: true },

  // Futuro (Reserva)
  { id: '12', type: 'expense', amount: 800, description: 'Aporte Reserva de Emergência', category: 'Reserva de Emergência', pillar: 'future', user: 'Kevin', date: new Date(Date.now() - 86400000 * 10).toISOString(), isFixed: false },
  { id: '13', type: 'expense', amount: 500, description: 'Aporte Tesouro Direto', category: 'Investimentos', pillar: 'future', user: 'Esposa', date: new Date(Date.now() - 86400000 * 4).toISOString(), isFixed: false }
];

const INITIAL_CHAT_MESSAGES = [
  { id: 'm1', sender: 'Kevin', type: 'text', content: 'Mercado 420', timestamp: new Date(Date.now() - 86400000 * 10).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  { id: 'm2', sender: 'Bot', type: 'bot', content: '✅ Anotado, Kevin! R$ 420,00 em Alimentação (Necessidades). Mantendo a casa em ordem! 🛒✨', timestamp: new Date(Date.now() - 86400000 * 10).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  { id: 'm3', sender: 'Esposa', type: 'text', content: 'Cinema com refri 85', timestamp: new Date(Date.now() - 86400000 * 3).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  { id: 'm4', sender: 'Bot', type: 'bot', content: '🎉 Lançado! R$ 85,00 em Lazer & Passeios (Desejos). Bom filme! 🍿 (+15 XP)', timestamp: new Date(Date.now() - 86400000 * 3).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  { id: 'm5', sender: 'Esposa', type: 'text', content: 'Aporte investimento 500', timestamp: new Date(Date.now() - 86400000 * 4).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  { id: 'm6', sender: 'Bot', type: 'bot', content: '🚀 EXCELENTE! R$ 500,00 adicionados ao Pilar FUTURO! Vocês ganharam +25 XP! 🛡️💰', timestamp: new Date(Date.now() - 86400000 * 4).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
];

const DEFAULT_GAMIFICATION = {
  level: 3,
  levelTitle: 'Mestres do Planejamento 🏆',
  xp: 340,
  xpNextLevel: 500,
  streakDays: 5,
  quests: [
    { id: 'q1', title: 'Registro Sem Fricção', description: 'Registrar gastos por 5 dias seguidos no Chat', progress: 5, total: 5, completed: true, rewardXP: 100 },
    { id: 'q2', title: 'Escudo do Futuro', description: 'Garantir no mínimo 15% em Reserva e Investimentos neste mês', progress: 1300, total: 1275, completed: true, rewardXP: 150 },
    { id: 'q3', title: 'Rebalanceamento Ativo', description: 'Rebalancear as metas de contas fixas na calculadora', progress: 1, total: 1, completed: true, rewardXP: 80 },
    { id: 'q4', title: 'Teto dos Desejos', description: 'Manter a categoria Lazer & Restaurante abaixo de R$ 800', progress: 260, total: 800, completed: false, rewardXP: 120 }
  ],
  badges: [
    { id: 'b1', icon: '🔥', title: 'Fogo nos Registros', description: '5 dias seguidos mandando mensagens no Chat', unlocked: true },
    { id: 'b2', icon: '🛡️', title: 'Casal Inabalável', description: 'Ultrapassou R$ 1.000 no pilar Futuro', unlocked: true },
    { id: 'b3', icon: '⚖️', title: 'Mestres da Regra', description: 'Criou uma regra 50/30/20 rebalanceada personalizada', unlocked: true },
    { id: 'b4', icon: '💎', title: 'Super Economia', description: 'Reduziu contas fixas em 10%', unlocked: false },
    { id: 'b5', icon: '👑', title: 'Nível 10 da Liberdade', description: 'Alcançar o Nível Máximo de Liberdade Financeira', unlocked: false }
  ]
};

// Funções Helpers de Carga e Salvamento

export function getProfile() {
  const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
}

export function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function getBudgetConfig() {
  const saved = localStorage.getItem(STORAGE_KEYS.BUDGET_CONFIG);
  return saved ? JSON.parse(saved) : DEFAULT_BUDGET_CONFIG;
}

export function saveBudgetConfig(config) {
  localStorage.setItem(STORAGE_KEYS.BUDGET_CONFIG, JSON.stringify(config));
}

export function getTransactions() {
  const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
}

export function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function getChatMessages() {
  const saved = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
  return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
}

export function saveChatMessages(messages) {
  localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
}

export function getGamification() {
  const saved = localStorage.getItem(STORAGE_KEYS.GAMIFICATION);
  return saved ? JSON.parse(saved) : DEFAULT_GAMIFICATION;
}

export function saveGamification(gamification) {
  localStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(gamification));
}

export function resetToDefaults() {
  localStorage.clear();
  return {
    profile: DEFAULT_PROFILE,
    config: DEFAULT_BUDGET_CONFIG,
    transactions: INITIAL_TRANSACTIONS,
    chatMessages: INITIAL_CHAT_MESSAGES,
    gamification: DEFAULT_GAMIFICATION
  };
}
