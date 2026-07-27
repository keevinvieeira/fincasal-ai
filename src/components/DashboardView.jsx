import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Wallet, ArrowDownRight, ArrowUpRight, ShieldCheck, Heart, AlertTriangle, Sparkles, TrendingUp, UserCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { CATEGORIES_CONFIG } from '../utils/nlpParser';

export default function DashboardView({
  transactions,
  profile,
  budgetConfig,
  onNavigateToRebalancer
}) {

  // 1. CÁLCULO DAS RECEITAS E GASTOS
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0) || (profile.incomePartner1 + profile.incomePartner2);

  const totalSpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const remainingBalance = totalIncome - totalSpent;
  const savingsRate = totalIncome > 0 ? ((transactions.filter(t => t.pillar === 'future').reduce((acc, t) => acc + t.amount, 0) / totalIncome) * 100).toFixed(1) : 0;

  // 2. CÁLCULOS DOS 3 PILARES 50/30/20
  const spentNeeds = transactions.filter(t => t.pillar === 'needs').reduce((acc, t) => acc + t.amount, 0);
  const spentWants = transactions.filter(t => t.pillar === 'wants').reduce((acc, t) => acc + t.amount, 0);
  const spentFuture = transactions.filter(t => t.pillar === 'future').reduce((acc, t) => acc + t.amount, 0);

  const targetNeedsPct = budgetConfig.targetNeeds || 50;
  const targetWantsPct = budgetConfig.targetWants || 30;
  const targetFuturePct = budgetConfig.targetFuture || 20;

  const targetNeedsAmount = (totalIncome * targetNeedsPct) / 100;
  const targetWantsAmount = (totalIncome * targetWantsPct) / 100;
  const targetFutureAmount = (totalIncome * targetFuturePct) / 100;

  const actualNeedsPct = totalIncome > 0 ? ((spentNeeds / totalIncome) * 100).toFixed(1) : 0;
  const actualWantsPct = totalIncome > 0 ? ((spentWants / totalIncome) * 100).toFixed(1) : 0;
  const actualFuturePct = totalIncome > 0 ? ((spentFuture / totalIncome) * 100).toFixed(1) : 0;

  // 3. DIVISÃO ENTRE O CASAL (ELE VS ELA)
  const spentPartner1 = transactions.filter(t => t.type === 'expense' && t.user === profile.partner1).reduce((acc, t) => acc + t.amount, 0);
  const spentPartner2 = transactions.filter(t => t.type === 'expense' && t.user === profile.partner2).reduce((acc, t) => acc + t.amount, 0);

  const totalPartnerIncome1 = profile.incomePartner1 || 1;
  const totalPartnerIncome2 = profile.incomePartner2 || 1;
  const combinedIncome = totalPartnerIncome1 + totalPartnerIncome2;
  const sharePartner1Pct = ((totalPartnerIncome1 / combinedIncome) * 100).toFixed(0);
  const sharePartner2Pct = ((totalPartnerIncome2 / combinedIncome) * 100).toFixed(0);

  // 4. DADOS PARA GRÁFICOS
  const doughnutData = [
    { name: 'Necessidades (50%)', value: spentNeeds, color: '#3b82f6' },
    { name: 'Desejos (30%)', value: spentWants, color: '#f59e0b' },
    { name: 'Futuro (20%)', value: spentFuture, color: '#10b981' }
  ];

  const coupleData = [
    { name: profile.partner1, valor: spentPartner1, color: '#3b82f6' },
    { name: profile.partner2, valor: spentPartner2, color: '#a855f7' }
  ];

  // Agrupamento por Categorias
  const categoryTotals = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const categoryData = Object.entries(categoryTotals)
    .map(([catName, amount]) => ({
      category: catName,
      amount,
      icon: CATEGORIES_CONFIG[catName]?.icon || '📦',
      color: CATEGORIES_CONFIG[catName]?.color || '#94a3b8'
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Rebalance Warning Banner */}
      {parseFloat(actualNeedsPct) > 50 && (
        <div className="glass-panel border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900/60 p-4 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-amber-300 text-sm md:text-base">
                  Atenção: Contas Fixas Elevadas ({actualNeedsPct}% da Renda)
                </h3>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Rebalanceador Recomendado
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Suas contas fixas (moradia, luz, mercado) estão consumindo mais que os 50% tradicionais. O app rebalanceou a meta para <strong>{targetNeedsPct}%</strong> para o casal manter o equilíbrio sem estresse.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToRebalancer}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>Ajustar Regra 50/30/20</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Renda Total */}
        <div className="glass-card p-5 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Renda do Casal</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>{profile.partner1} ({sharePartner1Pct}%)</span> + <span>{profile.partner2} ({sharePartner2Pct}%)</span>
            </div>
          </div>
        </div>

        {/* Gastos Totais */}
        <div className="glass-card p-5 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gastos Totais</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-400">R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {((totalSpent / (totalIncome || 1)) * 100).toFixed(1)}% da renda familiar comprometida
            </div>
          </div>
        </div>

        {/* Saldo Livre */}
        <div className="glass-card p-5 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Saldo Livre</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black ${remainingBalance >= 0 ? 'text-blue-400' : 'text-rose-500'}`}>
              R$ {remainingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {remainingBalance >= 0 ? 'Sobra positiva este mês 👍' : 'Atenção ao saldo negativo! ⚠️'}
            </div>
          </div>
        </div>

        {/* Taxa de Reserva (Futuro) */}
        <div className="glass-card p-5 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Taxa de Poupança</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-300">{savingsRate}%</div>
            <div className="text-[11px] text-purple-400/80 font-medium mt-1">
              R$ {spentFuture.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} guardados no Pilar Futuro 🛡️
            </div>
          </div>
        </div>

      </div>

      {/* Os 3 Pilares da Regra 50/30/20 */}
      <div className="glass-panel p-6 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              🎯 Alocação Orçamentária dos 3 Pilares (Regra 50/30/20)
            </h2>
            <p className="text-xs text-slate-400">
              Comparativo entre o teto estipulado e os gastos reais registrados no Chat
            </p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300">
            Regra Ativa: {targetNeedsPct} / {targetWantsPct} / {targetFuturePct}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pilar 1: Necessidades */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏠</span>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-200">Necessidades</h4>
                  <p className="text-[10px] text-slate-400">Moradia, Contas, Saúde, Mercado</p>
                </div>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Meta: {targetNeedsPct}%
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">R$ {spentNeeds.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className={spentNeeds <= targetNeedsAmount ? 'text-blue-400' : 'text-rose-400'}>
                  {actualNeedsPct}% da renda
                </span>
              </div>

              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    spentNeeds <= targetNeedsAmount ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'
                  }`}
                  style={{ width: `${Math.min((spentNeeds / (targetNeedsAmount || 1)) * 100, 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Teto: R$ {targetNeedsAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span>{spentNeeds <= targetNeedsAmount ? 'Dentro da meta ✅' : 'Excedido ⚠️'}</span>
              </div>
            </div>
          </div>

          {/* Pilar 2: Desejos */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍿</span>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-200">Desejos</h4>
                  <p className="text-[10px] text-slate-400">Lazer, Restaurante, Compras</p>
                </div>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Meta: {targetWantsPct}%
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">R$ {spentWants.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className={spentWants <= targetWantsAmount ? 'text-amber-400' : 'text-rose-400'}>
                  {actualWantsPct}% da renda
                </span>
              </div>

              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    spentWants <= targetWantsAmount ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-orange-500 to-rose-500'
                  }`}
                  style={{ width: `${Math.min((spentWants / (targetWantsAmount || 1)) * 100, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Teto: R$ {targetWantsAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span>{spentWants <= targetWantsAmount ? 'Dentro da meta ✅' : 'Excedido ⚠️'}</span>
              </div>
            </div>
          </div>

          {/* Pilar 3: Futuro */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-200">Futuro & Reserva</h4>
                  <p className="text-[10px] text-slate-400">Investimentos & Poupança</p>
                </div>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Meta: {targetFuturePct}%
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">R$ {spentFuture.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className={spentFuture >= targetFutureAmount ? 'text-emerald-400' : 'text-amber-400'}>
                  {actualFuturePct}% da renda
                </span>
              </div>

              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((spentFuture / (targetFutureAmount || 1)) * 100, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Meta Mínima: R$ {targetFutureAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span>{spentFuture >= targetFutureAmount ? 'Meta batida! 🏆' : 'Em progresso 🚀'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Distribuição dos Pilares */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Distribuição Real de Gastos por Pilar
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={doughnutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {doughnutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Gasto']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-800">
            <div>
              <div className="text-blue-400 font-bold">Necessidades</div>
              <div className="text-slate-300 font-black">R$ {spentNeeds.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-amber-400 font-bold">Desejos</div>
              <div className="text-slate-300 font-black">R$ {spentWants.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-emerald-400 font-bold">Futuro</div>
              <div className="text-slate-300 font-black">R$ {spentFuture.toFixed(0)}</div>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Gastos por Cônjuge (Ele vs Ela) */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-400" />
              Gastos por Membro ({profile.partner1} vs {profile.partner2})
            </h3>
            <span className="text-xs text-slate-400">Divisão Proporcional à Renda</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coupleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  formatter={(val) => [`R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Registrado']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="valor" radius={[12, 12, 0, 0]}>
                  {coupleData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{profile.avatar1} <strong>{profile.partner1}</strong>: R$ {spentPartner1.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{profile.avatar2} <strong>{profile.partner2}</strong>: R$ {spentPartner2.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Top Categories List */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="font-extrabold text-slate-100 text-base">
          📊 Maiores Ofensores Orçamentários por Categoria
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryData.slice(0, 6).map((cat, idx) => (
            <div key={idx} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 bg-slate-800 rounded-xl">{cat.icon}</span>
                <div>
                  <h5 className="font-bold text-xs text-slate-200">{cat.category}</h5>
                  <p className="text-[11px] text-slate-400">
                    {((cat.amount / (totalSpent || 1)) * 100).toFixed(1)}% do total gasto
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-black text-sm text-slate-100">
                  R$ {cat.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
