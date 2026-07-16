import { useMemo, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { useBudget } from '../../context/BudgetContext';
import { getCategoryById } from '../../data/categories';
import CategoryIcon from '../ui/CategoryIcon';

const fmt = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

const MOIS_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const DONUT_COLORS = ['#8B5CF6','#10B981','#0EA5E9','#F59E0B','#EC4899','#EF4444','#6366F1','#F97316'];

const Statistiques = () => {
  const { transactions } = useBudget();

  const now = new Date();
  const [viewMode, setViewMode] = useState('mois');   // mois | trimestre | annee
  const [annee,    setAnnee]    = useState(now.getFullYear());

  // ── Filtrage selon le mode ──────────────────────────────────
  const txFiltrees = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      if (d.getFullYear() !== annee) return false;
      if (viewMode === 'mois')      return d.getMonth() === now.getMonth();
      if (viewMode === 'trimestre') {
        const q = Math.floor(now.getMonth() / 3);
        return Math.floor(d.getMonth() / 3) === q;
      }
      return true; // annee
    });
  }, [transactions, annee, viewMode]);

  // ── Donut ──────────────────────────────────────────────────
  const donutData = useMemo(() => {
    const map = {};
    txFiltrees.filter((t) => t.type === 'depense').forEach((t) => {
      map[t.categorie] = (map[t.categorie] ?? 0) + t.montant;
    });
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map)
      .map(([id, montant]) => ({
        id,
        label: getCategoryById(id)?.label ?? id,
        montant,
        pct: total > 0 ? Math.round((montant / total) * 100) : 0,
      }))
      .sort((a, b) => b.montant - a.montant);
  }, [txFiltrees]);

  const totalDepenses = donutData.reduce((s, d) => s + d.montant, 0);

  // ── Barres mensuelles ──────────────────────────────────────
  const barData = useMemo(() => {
    return Array.from({ length: 12 }, (_, m) => {
      const mTx = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === annee && d.getMonth() === m;
      });
      return {
        mois:     MOIS_FR[m],
        Revenus:  mTx.filter((t) => t.type === 'revenu').reduce((s, t) => s + t.montant, 0),
        Dépenses: mTx.filter((t) => t.type === 'depense').reduce((s, t) => s + t.montant, 0),
      };
    });
  }, [transactions, annee]);

  // ── Top 5 catégories ───────────────────────────────────────
  const top5 = donutData.slice(0, 5);

  // Tooltip donut
  const TooltipDonut = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0].payload;
    return (
      <div className="rounded-xl bg-white p-3 shadow-lg border border-slate-100 text-sm">
        <p className="font-semibold text-slate-700">{item.label}</p>
        <p className="text-slate-500">{fmt(item.montant)} · {item.pct}%</p>
      </div>
    );
  };

  const anneesDisponibles = useMemo(() => {
    const years = new Set(transactions.map((t) => new Date(t.date).getFullYear()));
    years.add(now.getFullYear());
    return [...years].sort((a, b) => b - a);
  }, [transactions]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* En-tête */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Statistiques</h1>
            <p className="mt-1 text-sm text-slate-400">Vision d'ensemble de vos finances.</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none"
            >
              <option value="mois">Mois</option>
              <option value="trimestre">Trimestre</option>
              <option value="annee">Année</option>
            </select>
            <select
              value={annee}
              onChange={(e) => setAnnee(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none"
            >
              {anneesDisponibles.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Ligne graphiques ── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Donut */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="mb-1 font-semibold text-slate-800">Répartition des dépenses</h2>
            <p className="mb-4 text-xs text-slate-400">Total {fmt(totalDepenses)}</p>
            {donutData.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-slate-400">Aucune dépense</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="montant"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={2}
                      label={({ pct }) => `${pct}%`}
                      labelLine={false}
                    >
                      {donutData.map((entry, i) => (
                        <Cell key={entry.id} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<TooltipDonut />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
                  {donutData.map((item, i) => (
                    <div key={item.id} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      {item.label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Barres */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="mb-1 font-semibold text-slate-800">Évolution mensuelle</h2>
            <p className="mb-4 text-xs text-slate-400">Revenus et dépenses empilés</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 0, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Revenus"  fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Dépenses" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Top 5 ── */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <h2 className="mb-1 font-semibold text-slate-800">Top 5 des catégories</h2>
          <p className="mb-6 text-xs text-slate-400">Les plus dépensières ce mois-ci</p>

          {top5.length === 0 ? (
            <p className="text-slate-400 text-sm">Aucune dépense sur cette période.</p>
          ) : (
            <ul className="space-y-5">
              {top5.map((item, i) => (
                <li key={item.id} className="flex items-center gap-4">
                  <CategoryIcon categorieId={item.id} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-700">{item.label}</span>
                      <span className="text-sm font-semibold text-slate-700">
                        {fmt(item.montant)} · {item.pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${item.pct}%`,
                          backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
};

export default Statistiques;
