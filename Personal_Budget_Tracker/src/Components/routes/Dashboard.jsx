import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, ArrowDownRight, Wallet, PiggyBank,
  TrendingUp, ArrowRight,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useBudget } from '../../context/BudgetContext';
import { getCategoryById, BUDGET_CATEGORIES } from '../../data/categories';
import CategoryIcon from '../ui/CategoryIcon';

// ── Formatage monétaire ──────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

// ── Couleurs du donut ────────────────────────────────────────
const DONUT_COLORS = [
  '#8B5CF6','#10B981','#0EA5E9','#F59E0B','#EC4899','#EF4444','#6366F1','#F97316',
];

// ── Utilitaire mois ─────────────────────────────────────────
const MOIS_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

const Dashboard = () => {
  const { transactions, preferences } = useBudget();

  const now         = new Date();
  const anneeActu   = now.getFullYear();
  const moisActu    = now.getMonth(); // 0-indexed

  // ── Transactions du mois courant ───────────────────────────
  const txMois = useMemo(() =>
    transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === anneeActu && d.getMonth() === moisActu;
    }), [transactions, anneeActu, moisActu]);

  // ── KPIs ──────────────────────────────────────────────────
  const revenusMois  = useMemo(() => txMois.filter((t) => t.type === 'revenu').reduce((s, t) => s + t.montant, 0),  [txMois]);
  const depensesMois = useMemo(() => txMois.filter((t) => t.type === 'depense').reduce((s, t) => s + t.montant, 0), [txMois]);
  const soldeMois    = useMemo(() => revenusMois - depensesMois, [revenusMois, depensesMois]);
  const epargneMois  = soldeMois > 0 ? soldeMois : 0;
  const tauxEpargne  = revenusMois > 0 ? Math.round((epargneMois / revenusMois) * 100) : 0;

  // ── Transactions du mois précédent (pour la tendance) ─────
  const prevMois  = moisActu === 0 ? 11 : moisActu - 1;
  const prevAnnee = moisActu === 0 ? anneeActu - 1 : anneeActu;
  const txPrevMois = useMemo(() =>
    transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === prevAnnee && d.getMonth() === prevMois;
    }), [transactions, prevMois, prevAnnee]);
  const soldePrevMois = useMemo(() => {
    const r = txPrevMois.filter((t) => t.type === 'revenu').reduce((s, t) => s + t.montant, 0);
    const d = txPrevMois.filter((t) => t.type === 'depense').reduce((s, t) => s + t.montant, 0);
    return r - d;
  }, [txPrevMois]);
  const tendance = soldePrevMois !== 0
    ? Math.round(((soldeMois - soldePrevMois) / Math.abs(soldePrevMois)) * 100)
    : 0;

  // ── Graphique courbes 6 derniers mois ─────────────────────
  const chartCourbes = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const offset = 5 - i;
      let m = moisActu - offset;
      let y = anneeActu;
      if (m < 0) { m += 12; y -= 1; }
      const mTx = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === y && d.getMonth() === m;
      });
      const revenus  = mTx.filter((t) => t.type === 'revenu').reduce((s, t) => s + t.montant, 0);
      const depenses = mTx.filter((t) => t.type === 'depense').reduce((s, t) => s + t.montant, 0);
      return { mois: MOIS_FR[m], revenus, depenses };
    });
  }, [transactions, moisActu, anneeActu]);

  // ── Donut dépenses par catégorie ──────────────────────────
  const chartDonut = useMemo(() => {
    const map = {};
    txMois.filter((t) => t.type === 'depense').forEach((t) => {
      map[t.categorie] = (map[t.categorie] ?? 0) + t.montant;
    });
    return Object.entries(map)
      .map(([id, montant]) => ({ id, label: getCategoryById(id)?.label ?? id, montant }))
      .sort((a, b) => b.montant - a.montant);
  }, [txMois]);

  // ── 5 dernières transactions ───────────────────────────────
  const dernieresTransactions = useMemo(() =>
    [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [transactions]);

  const nbRevenusMois = txMois.filter((t) => t.type === 'revenu').length;
  const nbDepensesMois = txMois.filter((t) => t.type === 'depense').length;

  // ── Tooltip personnalisé courbes ──────────────────────────
  const TooltipCourbes = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl bg-white p-3 shadow-lg border border-slate-100 text-sm">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.dataKey === 'revenus' ? 'Revenus' : 'Dépenses'} : {fmt(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Titre ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Bonjour, {preferences.nom} 👋
          </h1>
          <p className="mt-1 text-slate-500">Voici l'état de vos finances ce mois-ci.</p>
        </div>

        {/* ── KPI Cards ── */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Solde total */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Solde total</p>
                <p className="mt-1 text-3xl font-bold text-slate-800">{fmt(soldeMois)}</p>
              </div>
              <div className="rounded-xl bg-sky-50 p-2.5 text-sky-500">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <p className={`mt-3 flex items-center text-sm font-medium ${tendance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              <TrendingUp className="mr-1 h-4 w-4" />
              {tendance >= 0 ? '+' : ''}{tendance}% vs mois dernier
            </p>
          </div>

          {/* Revenus */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Revenus</p>
                <p className="mt-1 text-3xl font-bold text-slate-800">{fmt(revenusMois)}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-500">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              {nbRevenusMois} revenu{nbRevenusMois > 1 ? 's' : ''} ce mois
            </p>
          </div>

          {/* Dépenses */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Dépenses</p>
                <p className="mt-1 text-3xl font-bold text-slate-800">{fmt(depensesMois)}</p>
              </div>
              <div className="rounded-xl bg-red-50 p-2.5 text-red-500">
                <ArrowDownRight className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              {nbDepensesMois} transaction{nbDepensesMois > 1 ? 's' : ''}
            </p>
          </div>

          {/* Épargne */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Épargne du mois</p>
                <p className="mt-1 text-3xl font-bold text-slate-800">{fmt(epargneMois)}</p>
              </div>
              <div className="rounded-xl bg-violet-50 p-2.5 text-violet-500">
                <PiggyBank className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{tauxEpargne}% de vos revenus</span>
                <span>Objectif 50%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-sky-400 transition-all"
                  style={{ width: `${Math.min(tauxEpargne * 2, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Graphiques ── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-5">

          {/* Courbes 60% */}
          <div className="col-span-3 rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="mb-1 font-semibold text-slate-800">Revenus vs Dépenses</h2>
            <p className="mb-4 text-xs text-slate-400">6 derniers mois</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartCourbes} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="gradDep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0EA5E9" stopOpacity={0.20} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<TooltipCourbes />} />
                <Area type="monotone" dataKey="revenus"  stroke="#10B981" strokeWidth={2} fill="url(#gradRev)" />
                <Area type="monotone" dataKey="depenses" stroke="#0EA5E9" strokeWidth={2} fill="url(#gradDep)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Donut 40% */}
          <div className="col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="mb-1 font-semibold text-slate-800">Dépenses par catégorie</h2>
            <p className="mb-4 text-xs text-slate-400">Ce mois-ci</p>
            {chartDonut.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-slate-400">
                Aucune dépense ce mois
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={chartDonut}
                      dataKey="montant"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {chartDonut.map((entry, i) => (
                        <Cell key={entry.id} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="mt-2 space-y-1">
                  {chartDonut.slice(0, 5).map((item, i) => (
                    <li key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
                        />
                        <span className="text-slate-600">{item.label}</span>
                      </div>
                      <span className="font-medium text-slate-700">{fmt(item.montant)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* ── Transactions récentes ── */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-100">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-800">Transactions récentes</h2>
            <Link
              to="/transactions"
              className="flex items-center gap-1 text-sm font-medium text-sky-500 hover:text-sky-600"
            >
              Voir toutes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="divide-y divide-slate-50">
            {dernieresTransactions.map((t) => {
              const cat = getCategoryById(t.categorie);
              const dateStr = new Date(t.date).toLocaleDateString('fr-FR');
              return (
                <li key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition">
                  <CategoryIcon categorieId={t.categorie} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-slate-800">{t.description}</p>
                    <p className="text-xs text-slate-400">{cat?.label} · {dateStr}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.statut === 'paye'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {t.statut === 'paye' ? 'Payé' : 'En attente'}
                    </span>
                    <span
                      className={`font-semibold ${
                        t.type === 'revenu' ? 'text-emerald-500' : 'text-slate-700'
                      }`}
                    >
                      {t.type === 'revenu' ? '+' : '-'}{fmt(t.montant)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
