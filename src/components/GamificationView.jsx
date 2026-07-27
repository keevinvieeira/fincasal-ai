import React from 'react';
import { Trophy, Flame, Target, Award, Sparkles, CheckCircle2, Shield, Star, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GamificationView({ gamification, setGamification, profile }) {

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleClaimQuest = (questId, rewardXP) => {
    triggerConfetti();

    setGamification(prev => {
      const newXP = prev.xp + rewardXP;
      let newLevel = prev.level;
      let newNext = prev.xpNextLevel;

      if (newXP >= prev.xpNextLevel) {
        newLevel += 1;
        newNext += 300;
      }

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        xpNextLevel: newNext,
        quests: prev.quests.map(q => q.id === questId ? { ...q, completed: true } : q)
      };
    });
  };

  const levelProgress = ((gamification.xp / gamification.xpNextLevel) * 100).toFixed(0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Level Hero Header */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/20 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-purple-500 to-pink-500 flex items-center justify-center text-4xl shadow-xl shadow-purple-500/30">
                🏆
              </div>
              <span className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full border-2 border-slate-900">
                Nv. {gamification.level}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-xs uppercase font-extrabold tracking-wider text-purple-400">Nível Financeiro do Casal</span>
                <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {profile.partner1} {profile.avatar1} & {profile.partner2} {profile.avatar2}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white mt-1">
                {gamification.levelTitle}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Continuem registrando os gastos no Chat e batendo metas para evoluir de nível juntos!
              </p>
            </div>
          </div>

          {/* XP Counter Box */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-center space-y-2 min-w-[200px]">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Experiência do Casal</div>
            <div className="text-2xl font-black text-amber-300 flex items-center justify-center gap-1">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400 animate-pulse" />
              <span>{gamification.xp} / {gamification.xpNextLevel} XP</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 font-semibold">{levelProgress}% para o Nível {gamification.level + 1}</div>
          </div>

        </div>
      </div>

      {/* Quests / Missões da Semana */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              Missões Ativas da Semana
            </h3>
            <p className="text-xs text-slate-400">Conclua desafios orçamentários para ganhar XP e avançar o casal de nível</p>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs font-bold">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{gamification.streakDays} Dias de Sequência</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gamification.quests.map((quest) => (
            <div
              key={quest.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                quest.completed
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                    {quest.completed && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {quest.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{quest.description}</p>
                </div>
                <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs px-2.5 py-1 rounded-xl font-black shrink-0">
                  +{quest.rewardXP} XP
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400">Progresso</span>
                  <span className="text-purple-300">{quest.progress} / {quest.total}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((quest.progress / quest.total) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {!quest.completed && quest.progress >= quest.total && (
                <button
                  onClick={() => handleClaimQuest(quest.id, quest.rewardXP)}
                  className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" /> Resgatar Recompensa (+{quest.rewardXP} XP)
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Badges / Galeria de Insígnias */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Galeria de Insígnias & Conquistas do Casal
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {gamification.badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
                badge.unlocked
                  ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-950/40 border-slate-800 opacity-50 grayscale'
              }`}
            >
              <div className="text-4xl mx-auto w-12 h-12 flex items-center justify-center relative">
                <span>{badge.icon}</span>
                {!badge.unlocked && (
                  <Lock className="w-4 h-4 text-slate-400 absolute bottom-0 right-0 bg-slate-900 rounded-full p-0.5" />
                )}
              </div>
              <div>
                <h5 className="font-extrabold text-xs text-white">{badge.title}</h5>
                <p className="text-[10px] text-slate-400 mt-1">{badge.description}</p>
              </div>
              <div className="pt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  badge.unlocked ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-500'
                }`}>
                  {badge.unlocked ? 'Desbloqueado 🏆' : 'Bloqueado 🔒'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
