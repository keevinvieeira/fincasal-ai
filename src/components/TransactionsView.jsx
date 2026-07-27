import React, { useState } from 'react';
import { Search, Filter, Plus, Trash2, Download, Upload, ArrowUpCircle, ArrowDownCircle, Calendar, Tag, User } from 'lucide-react';
import { CATEGORIES_CONFIG } from '../utils/nlpParser';

export default function TransactionsView({
  transactions,
  setTransactions,
  profile,
  onResetData
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');

  // Modal para adicionar gasto manual rápido
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newType, setNewType] = useState('expense');
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Alimentação');
  const [newUser, setNewUser] = useState(profile.partner1);

  // Filtragem
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPillar = selectedPillar === 'all' || t.pillar === selectedPillar;
    const matchesUser = selectedUser === 'all' || t.user === selectedUser;

    return matchesSearch && matchesPillar && matchesUser;
  });

  const handleDelete = (id) => {
    if (confirm('Deseja realmente apagar este lançamento?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleAddManual = (e) => {
    e.preventDefault();
    if (!newDesc || !newAmount || parseFloat(newAmount) <= 0) return;

    const catConfig = CATEGORIES_CONFIG[newCategory] || { pillar: 'wants' };

    const newTx = {
      id: Date.now().toString(),
      type: newType,
      amount: parseFloat(newAmount),
      description: newDesc,
      category: newCategory,
      pillar: newType === 'income' ? 'income' : catConfig.pillar,
      user: newUser,
      date: new Date().toISOString(),
      isFixed: false
    };

    setTransactions(prev => [newTx, ...prev]);
    setIsAddModalOpen(false);
    setNewDesc('');
    setNewAmount('');
  };

  // Exportar / Importar JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fincasal_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (Array.isArray(parsed)) {
            setTransactions(parsed);
            alert('✅ Backup importado com sucesso!');
          }
        } catch (err) {
          alert('⚠️ Erro ao ler o arquivo JSON.');
        }
      };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            📝 Extrato Completo de Gastos e Receitas
          </h2>
          <p className="text-xs text-slate-400">
            Gerencie, edite e acompanhe todos os registros de {profile.partner1} & {profile.partner2}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Lançamento Manual
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-blue-400" /> Exportar Backup
          </button>

          <label className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-purple-400" /> Importar
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por descrição ou categoria..."
            className="w-full bg-slate-900/90 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {/* Filter Pilar */}
          <select
            value={selectedPillar}
            onChange={(e) => setSelectedPillar(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:outline-none"
          >
            <option value="all">Todos os Pilares</option>
            <option value="needs">Moradia & Necessidades (50%)</option>
            <option value="wants">Lazer & Desejos (30%)</option>
            <option value="future">Investimentos & Futuro (20%)</option>
            <option value="income">Receitas (Salários)</option>
          </select>

          {/* Filter User */}
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:outline-none"
          >
            <option value="all">Quem Lancou: Todos</option>
            <option value={profile.partner1}>{profile.avatar1} {profile.partner1}</option>
            <option value={profile.partner2}>{profile.avatar2} {profile.partner2}</option>
          </select>
        </div>

      </div>

      {/* Transactions Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 uppercase text-[10px] font-extrabold text-slate-400 tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Pilar Orçamentário</th>
                <th className="px-6 py-4">Quem Lançou</th>
                <th className="px-6 py-4 text-right">Valor R$</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'income';

                return (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                      {new Date(tx.date).toLocaleDateString('pt-BR')}
                    </td>

                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                      {isIncome ? (
                        <ArrowUpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <ArrowDownCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>{tx.description}</span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg">
                        {tx.category}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                        tx.pillar === 'needs'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : tx.pillar === 'wants'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : tx.pillar === 'future'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {tx.pillar === 'needs' ? 'Necessidades (50%)' : tx.pillar === 'wants' ? 'Desejos (30%)' : tx.pillar === 'future' ? 'Futuro (20%)' : 'Receita'}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap font-bold">
                      <span className={tx.user === profile.partner1 ? 'text-blue-400' : 'text-purple-400'}>
                        {tx.user === profile.partner1 ? profile.avatar1 : profile.avatar2} {tx.user}
                      </span>
                    </td>

                    <td className={`px-6 py-4 text-right font-black text-sm whitespace-nowrap ${
                      isIncome ? 'text-emerald-400' : 'text-slate-100'
                    }`}>
                      {isIncome ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    Nenhum lançamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adicionar Manual */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-slate-700 space-y-4">
            <h3 className="font-extrabold text-lg text-white">Novo Lançamento Manual</h3>

            <form onSubmit={handleAddManual} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('expense')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      newType === 'expense' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('income')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      newType === 'income' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Receita
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aluguel, Supermercado..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-900 text-white text-xs rounded-xl px-3 py-2 border border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Valor R$</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-slate-900 text-white text-sm font-bold rounded-xl px-3 py-2 border border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Categoria</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-900 text-white text-xs rounded-xl px-3 py-2 border border-slate-700"
                >
                  {Object.keys(CATEGORIES_CONFIG).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Quem Lançou</label>
                <select
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                  className="w-full bg-slate-900 text-white text-xs rounded-xl px-3 py-2 border border-slate-700"
                >
                  <option value={profile.partner1}>{profile.avatar1} {profile.partner1}</option>
                  <option value={profile.partner2}>{profile.avatar2} {profile.partner2}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
