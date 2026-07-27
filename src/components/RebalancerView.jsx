import React, { useState } from 'react';
import { Sliders, Sparkles, AlertCircle, CheckCircle, Calculator, TrendingDown, ArrowRight, ShieldCheck, Heart, RefreshCw } from 'lucide-react';

export default function RebalancerView({
  profile,
  onSaveProfile,
  budgetConfig,
  onSaveBudgetConfig,
  transactions
}) {
  const [income1, setIncome1] = useState(profile.incomePartner1);
  const [income2, setIncome2] = useState(profile.incomePartner2);

  const [targetNeeds, setTargetNeeds] = useState(budgetConfig.targetNeeds || 60);
  const [targetWants, setTargetWants] = useState(budgetConfig.targetWants || 25);
  const [targetFuture, setTargetFuture] = useState(budgetConfig.targetFuture || 15);

  const [partner1Name, setPartner1Name] = useState(profile.partner1);
  const [partner2Name, setPartner2Name] = useState(profile.partner2);

  const totalIncome = (parseFloat(income1) || 0) + (parseFloat(income2) || 0);

  // Gastos fixos reais cadastrados no pilar 'needs'
  const currentFixedNeeds = transactions
    .filter(t => t.pillar === 'needs')
    .reduce((acc, t) => acc + t.amount, 0);

  const fixedPctOfIncome = totalIncome > 0 ? ((currentFixedNeeds / totalIncome) * 100).toFixed(1) : 0;

  // Presets de Rebalanceamento
  const applyPreset = (needs, wants, future) => {
    setTargetNeeds(needs);
    setTargetWants(wants);
    setTargetFuture(future);
  };

  const handleSave = () => {
    onSaveProfile({
      ...profile,
      partner1: partner1Name,
      partner2: partner2Name,
      incomePartner1: parseFloat(income1) || 0,
      incomePartner2: parseFloat(income2) || 0
    });

    onSaveBudgetConfig({
      targetNeeds,
      targetWants,
      targetFuture,
      isRebalanced: targetNeeds !== 50
    });

    alert('✅ Configurações e regra 50/30/20 rebalanceada salvas com sucesso!');
  };

  // Cálculo da Meta em Reais
  const needsR$ = (totalIncome * targetNeeds) / 100;
  const wantsR$ = (totalIncome * targetWants) / 100;
  const futureR$ = (totalIncome * targetFuture) / 100;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl space-y-2 relative overflow-hidden border border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Calculadora & Motor de Rebalanceamento Orçamentário
            </h2>
            <p className="text-xs text-slate-300">
              Adapte a Metodologia 50/30/20 à realidade atual das contas fixas do casal
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1: Renda & Nomes do Casal */}
        <div className="glass-panel p-6 rounded-3xl space-y-5 lg:col-span-1">
          <h3 className="font-extrabold text-slate-100 text-sm uppercase tracking-wider flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            Configuração da Renda do Casal
          </h3>

          {/* Nome e Renda Par 1 */}
          <div className="space-y-2 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <span>{profile.avatar1}</span> Nome do 1º Membro
            </label>
            <input
              type="text"
              value={partner1Name}
              onChange={(e) => setPartner1Name(e.target.value)}
              className="w-full bg-slate-800 text-white text-xs rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-blue-500"
            />

            <label className="text-xs font-bold text-slate-300 block pt-1">
              Renda Mensal R$ ({partner1Name})
            </label>
            <input
              type="number"
              value={income1}
              onChange={(e) => setIncome1(e.target.value)}
              className="w-full bg-slate-800 text-white text-sm font-bold rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Nome e Renda Par 2 */}
          <div className="space-y-2 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <span>{profile.avatar2}</span> Nome do 2º Membro
            </label>
            <input
              type="text"
              value={partner2Name}
              onChange={(e) => setPartner2Name(e.target.value)}
              className="w-full bg-slate-800 text-white text-xs rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
            />

            <label className="text-xs font-bold text-slate-300 block pt-1">
              Renda Mensal R$ ({partner2Name})
            </label>
            <input
              type="number"
              value={income2}
              onChange={(e) => setIncome2(e.target.value)}
              className="w-full bg-slate-800 text-white text-sm font-bold rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Renda Consolidada */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl text-center space-y-1">
            <div className="text-xs font-bold text-emerald-400">Renda Total Familiar</div>
            <div className="text-2xl font-black text-white">
              R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Coluna 2: Seletor de Presets & Diagnóstico */}
        <div className="glass-panel p-6 rounded-3xl space-y-6 lg:col-span-2">
          
          {/* Diagnóstico das Contas Fixas */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                Diagnóstico de Contas Fixas Atuais
              </h4>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                parseFloat(fixedPctOfIncome) <= 50 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {fixedPctOfIncome}% Comprometido
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Gastos em Necessidades (Aluguel, Luz, Mercado, etc.): <strong>R$ {currentFixedNeeds.toFixed(2)}</strong>.
              {parseFloat(fixedPctOfIncome) > 50 ? (
                <span className="text-amber-300 block mt-1">
                  💡 Como suas contas fixas estão em {fixedPctOfIncome}%, recomendamos selecionar a regra rebalanceada <strong>60% / 25% / 15%</strong> ou <strong>65% / 20% / 15%</strong> abaixo para evitar frustrações financeiras.
                </span>
              ) : (
                <span className="text-emerald-300 block mt-1">
                  🎉 Excelente! Suas contas fixas representam {fixedPctOfIncome}%, perfeito para a regra clássica 50/30/20!
                </span>
              )}
            </p>
          </div>

          {/* Seleção de Presets da Regra */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-slate-200">Escolha o Modelo de Alocação:</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Preset 1: Clássica 50/30/20 */}
              <button
                type="button"
                onClick={() => applyPreset(50, 30, 20)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  targetNeeds === 50 && targetWants === 30 && targetFuture === 20
                    ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/40 text-white'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-extrabold text-sm flex items-center justify-between">
                  <span>50 / 30 / 20</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Padrão</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  50% Necessidades<br />30% Desejos<br />20% Futuro
                </div>
              </button>

              {/* Preset 2: Rebalanceada 60/25/15 (Recomendada) */}
              <button
                type="button"
                onClick={() => applyPreset(60, 25, 15)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  targetNeeds === 60 && targetWants === 25 && targetFuture === 15
                    ? 'bg-amber-600/20 border-amber-500 ring-2 ring-amber-500/40 text-white'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-extrabold text-sm flex items-center justify-between text-amber-300">
                  <span>60 / 25 / 15</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">Recomendado ⭐</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  60% Necessidades (Fixas Alta)<br />25% Desejos<br />15% Futuro
                </div>
              </button>

              {/* Preset 3: Defensiva 65/20/15 */}
              <button
                type="button"
                onClick={() => applyPreset(65, 20, 15)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  targetNeeds === 65 && targetWants === 20 && targetFuture === 15
                    ? 'bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/40 text-white'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-extrabold text-sm flex items-center justify-between">
                  <span>65 / 20 / 15</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Defensivo</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  65% Necessidades<br />20% Desejos<br />15% Futuro
                </div>
              </button>

            </div>
          </div>

          {/* Simulação Visual do Teto em Reais */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
              Teto Máximo Mensal Resultante para a Renda de R$ {totalIncome.toLocaleString('pt-BR')}
            </h4>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-950/40 p-3 rounded-xl border border-blue-500/20">
                <div className="text-[11px] text-blue-400 font-bold">Necessidades ({targetNeeds}%)</div>
                <div className="text-base font-black text-white mt-1">R$ {needsR$.toFixed(2)}</div>
              </div>
              <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/20">
                <div className="text-[11px] text-amber-400 font-bold">Desejos ({targetWants}%)</div>
                <div className="text-base font-black text-white mt-1">R$ {wantsR$.toFixed(2)}</div>
              </div>
              <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/20">
                <div className="text-[11px] text-emerald-400 font-bold">Futuro ({targetFuture}%)</div>
                <div className="text-base font-black text-white mt-1">R$ {futureR$.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Botão de Salvar Alterações */}
          <button
            onClick={handleSave}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Salvar Nova Regra Rebalanceada para o Casal</span>
          </button>

        </div>

      </div>

    </div>
  );
}
