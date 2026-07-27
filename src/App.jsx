import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatView from './components/ChatView';
import DashboardView from './components/DashboardView';
import RebalancerView from './components/RebalancerView';
import GamificationView from './components/GamificationView';
import TransactionsView from './components/TransactionsView';

import {
  getProfile, saveProfile,
  getBudgetConfig, saveBudgetConfig,
  getTransactions, saveTransactions,
  getChatMessages, saveChatMessages,
  getGamification, saveGamification
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  
  const [profile, setProfile] = useState(() => getProfile());
  const [activeUser, setActiveUser] = useState(() => getProfile().partner1);
  const [budgetConfig, setBudgetConfig] = useState(() => getBudgetConfig());
  const [transactions, setTransactions] = useState(() => getTransactions());
  const [chatMessages, setChatMessages] = useState(() => getChatMessages());
  const [gamification, setGamification] = useState(() => getGamification());

  // Efeitos de persistência
  useEffect(() => { saveProfile(profile); }, [profile]);
  useEffect(() => { saveBudgetConfig(budgetConfig); }, [budgetConfig]);
  useEffect(() => { saveTransactions(transactions); }, [transactions]);
  useEffect(() => { saveChatMessages(chatMessages); }, [chatMessages]);
  useEffect(() => { saveGamification(gamification); }, [gamification]);

  // Função para adicionar nova transação via Chat ou Manual
  const handleAddTransaction = (newTxData, xpEarned = 15) => {
    setTransactions(prev => [newTxData, ...prev]);

    // Incrementar XP e Checar Nível
    setGamification(prev => {
      const updatedXP = prev.xp + xpEarned;
      let newLevel = prev.level;
      let nextThreshold = prev.xpNextLevel;

      if (updatedXP >= prev.xpNextLevel) {
        newLevel += 1;
        nextThreshold += 300;
      }

      return {
        ...prev,
        xp: updatedXP,
        level: newLevel,
        xpNextLevel: nextThreshold
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Navbar Superior */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        gamification={gamification}
        activeUser={activeUser}
        setActiveUser={setActiveUser}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'chat' && (
          <ChatView
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            activeUser={activeUser}
            setActiveUser={setActiveUser}
            profile={profile}
            onAddTransaction={handleAddTransaction}
            gamification={gamification}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            profile={profile}
            budgetConfig={budgetConfig}
            onNavigateToRebalancer={() => setActiveTab('rebalancer')}
          />
        )}

        {activeTab === 'rebalancer' && (
          <RebalancerView
            profile={profile}
            onSaveProfile={(newProf) => setProfile(newProf)}
            budgetConfig={budgetConfig}
            onSaveBudgetConfig={(newCfg) => setBudgetConfig(newCfg)}
            transactions={transactions}
          />
        )}

        {activeTab === 'gamification' && (
          <GamificationView
            gamification={gamification}
            setGamification={setGamification}
            profile={profile}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            setTransactions={setTransactions}
            profile={profile}
          />
        )}
      </main>

      {/* Rodapé Elegante */}
      <footer className="py-4 px-6 border-t border-slate-800/60 text-center text-xs text-slate-400 bg-slate-950/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            FinCasal <span className="text-emerald-400 font-bold">AI</span> • Fricção Zero & Orçamento 50/30/20 em Dupla
          </div>
          <div className="text-[11px] text-slate-400">
            {profile.partner1} 💙 & {profile.partner2} 💜 • Nível {gamification.level} ({gamification.levelTitle})
          </div>
        </div>
      </footer>

    </div>
  );
}
