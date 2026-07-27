import React from 'react';
import { MessageSquare, LayoutDashboard, Sliders, Trophy, ListOrdered, Sparkles, User, Heart } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, profile, gamification, activeUser, setActiveUser }) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Level Indicator */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Heart className="w-6 h-6 fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  FinCasal <span className="text-emerald-400 font-black">AI</span>
                </h1>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Fricção Zero
                </span>
              </div>
              <p className="text-xs text-slate-400">Controle Orçamentário 50/30/20 em Dupla</p>
            </div>
          </div>

          {/* Mobile Profile Switcher */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setActiveUser(profile.partner1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                activeUser === profile.partner1
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span>{profile.avatar1}</span> {profile.partner1}
            </button>
            <button
              onClick={() => setActiveUser(profile.partner2)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                activeUser === profile.partner2
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span>{profile.avatar2}</span> {profile.partner2}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80 w-full md:w-auto justify-center overflow-x-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard 50/30/20</span>
          </button>

          <button
            onClick={() => setActiveTab('rebalancer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'rebalancer'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Rebalanceador</span>
          </button>

          <button
            onClick={() => setActiveTab('gamification')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'gamification'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Gamificação</span>
            <span className="bg-purple-400/20 text-purple-300 text-[10px] px-1.5 py-0.2 rounded-full border border-purple-400/30 font-bold">
              Nv. {gamification.level}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Extrato</span>
          </button>
        </nav>

        {/* Desktop Profile Switcher & Level Progress */}
        <div className="hidden md:flex items-center gap-4">
          {/* Level Progress */}
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-lg">⭐</span>
            <div>
              <div className="text-[11px] font-bold text-slate-200">
                Nível {gamification.level}
              </div>
              <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                <div
                  className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(gamification.xp / gamification.xpNextLevel) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Profile Switcher */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveUser(profile.partner1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeUser === profile.partner1
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{profile.avatar1}</span>
              <span>{profile.partner1}</span>
            </button>
            <button
              onClick={() => setActiveUser(profile.partner2)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeUser === profile.partner2
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{profile.avatar2}</span>
              <span>{profile.partner2}</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
