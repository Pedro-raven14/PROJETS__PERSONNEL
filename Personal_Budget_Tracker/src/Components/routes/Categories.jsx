import React, { useMemo } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { BUDGET_CATEGORIES, CATEGORIES, getCategoryById } from '../../data/categories';
import CategoryIcon from '../ui/CategoryIcon';
import { filterByMonth } from '../../utils/formatters';

const Categories = () => {
  const { transactions, budgets, formatMontant } = useBudget();

  const now   = new Date();
  const annee = now.getFullYear();
  const mois  = now.getMonth();

  // Dépenses du mois par catégorie
  const depensesParCategorie = useMemo(() => {
    const map = {};
    filterByMonth(transactions, annee, mois)
      .filter((t) => t.type === 'depense')
      .forEach((t) => {
        map[t.categorie] = (map[t.categorie] ?? 0) + t.montant;
      });
    return map;
  }, [transactions, annee, mois]);

  // Revenus du mois par catégorie
  const revenusParCategorie = useMemo(() => {
    const map = {};
    filterByMonth(transactions, annee, mois)
      .filter((t) => t.type === 'revenu')
      .forEach((t) => {
        map[t.categorie] = (map[t.categorie] ?? 0) + t.montant;
      });
    return map;
  }, [transactions, annee, mois]);

  // Catégories de dépenses (avec budget)
  const cartesBudget = BUDGET_CATEGORIES.map((cat) => {
    const depense = depensesParCategorie[cat.id] ?? 0;
    const budget  = budgets[cat.id] ?? 0;
    const pct     = budget > 0 ? Math.min(Math.round((depense / budget) * 100), 100) : 0;
    return { ...cat, depense, budget, pct };
  });

  // Catégories de revenus
  const cartesRevenu = CATEGORIES.filter((c) => c.type === 'revenu').map((cat) => ({
    ...cat,
    total: revenusParCategorie[cat.id] ?? 0,
  }));

  const barColor = (pct) => {
    if (pct >= 100) return 'bg-red-500';
    if (pct >= 80)  return 'bg-orange-400';
    return 'bg-sky-400';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Catégories</h1>
          <p className="mt-1 text-sm text-slate-400">Suivez la consommation de chaque catégorie ce mois-ci.</p>
        </div>

        {/* ── Dépenses ── */}
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Dépenses</h2>
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cartesBudget.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <CategoryIcon categorieId={cat.id} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{cat.label}</p>
                  <p className="text-xs text-slate-400">
                    {cat.budget > 0 ? `Budget ${formatMontant(cat.budget)}` : 'Pas de budget défini'}
                  </p>
                </div>
                {cat.pct >= 100 && cat.budget > 0 && (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-500">
                    100%
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600">{formatMontant(cat.depense)} dépensés</span>
                {cat.budget > 0 && (
                  <span
                    className={`font-semibold ${
                      cat.pct >= 100 ? 'text-red-500' : cat.pct >= 80 ? 'text-orange-500' : 'text-slate-500'
                    }`}
                  >
                    {cat.pct}%
                  </span>
                )}
              </div>

              {cat.budget > 0 && (
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full transition-all ${barColor(cat.pct)}`}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Revenus ── */}
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Revenus</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cartesRevenu.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <CategoryIcon categorieId={cat.id} size="md" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{cat.label}</p>
                  <p className="text-xs text-slate-400">Revenu</p>
                </div>
                {cat.total > 0 && (
                  <span className="font-semibold text-emerald-500">{formatMontant(cat.total)}</span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Categories;
