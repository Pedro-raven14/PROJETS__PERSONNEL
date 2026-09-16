import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { BUDGET_CATEGORIES } from '../../data/categories';
import CategoryIcon from '../ui/CategoryIcon';
import { filterByMonth } from '../../utils/formatters';

// Slider avec barre de progression colorée
const BudgetSlider = ({ cat, depense, budget, onChange, formatMontant }) => {
  const pct      = budget > 0 ? Math.min(Math.round((depense / budget) * 100), 100) : 0;
  const barColor = pct >= 100 ? '#EF4444' : pct >= 80 ? '#F59E0B' : '#0EA5E9';
  const MAX      = 5000;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-3">
        <CategoryIcon categorieId={cat.id} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-800">{cat.label}</span>
            <span className="text-sm text-slate-500">
              {formatMontant(depense)} / {formatMontant(budget)} · {pct}%
            </span>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min="0"
          max={MAX}
          step="50"
          value={budget}
          onChange={(e) => onChange(cat.id, e.target.value)}
          className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-sky-500"
        />
        <input
          type="number"
          min="0"
          max={MAX}
          step="50"
          value={budget}
          onChange={(e) => onChange(cat.id, e.target.value)}
          className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-center text-slate-700 focus:border-sky-400 focus:outline-none"
        />
      </div>

      {/* Barre de progression */}
      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
};

const Parametres = () => {
  const {
    budgets, preferences, transactions,
    mettreAJourBudget, mettreAJourPreferences, formatMontant,
  } = useBudget();
  const [saved, setSaved] = useState(false);

  // Dépenses du mois par catégorie
  const now   = new Date();
  const depensesMap = {};
  filterByMonth(transactions, now.getFullYear(), now.getMonth())
    .filter((t) => t.type === 'depense')
    .forEach((t) => { depensesMap[t.categorie] = (depensesMap[t.categorie] ?? 0) + t.montant; });

  const handleBudgetChange = (id, val) => mettreAJourBudget(id, val);
  const handlePrefChange   = (key, val) => mettreAJourPreferences({ [key]: val });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Paramètres</h1>
          <p className="mt-1 text-sm text-slate-400">Personnalisez votre expérience Budget Tracker.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* ── Budgets mensuels ── */}
          <div className="lg:col-span-2">
            <h2 className="mb-1 font-semibold text-slate-800">Budget mensuel</h2>
            <p className="mb-5 text-sm text-slate-400">Définissez une limite pour chaque catégorie.</p>
            <div className="space-y-4">
              {BUDGET_CATEGORIES.map((cat) => (
                <BudgetSlider
                  key={cat.id}
                  cat={cat}
                  depense={depensesMap[cat.id] ?? 0}
                  budget={budgets[cat.id] ?? 0}
                  onChange={handleBudgetChange}
                  formatMontant={formatMontant}
                />
              ))}
            </div>
          </div>

          {/* ── Préférences ── */}
          <div>
            <h2 className="mb-1 font-semibold text-slate-800">Préférences</h2>
            <p className="mb-5 text-sm text-slate-400">Configuration de l'application.</p>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-6">

              {/* Nom */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Votre prénom</label>
                <input
                  type="text"
                  value={preferences.nom}
                  onChange={(e) => handlePrefChange('nom', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="Votre prénom"
                />
              </div>

              {/* Devise */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Devise par défaut</label>
                <select
                  value={preferences.devise}
                  onChange={(e) => handlePrefChange('devise', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-sky-400 focus:outline-none"
                >
                  <option value="€">€ Euro</option>
                  <option value="$">$ Dollar</option>
                  <option value="£">£ Livre sterling</option>
                  <option value="CHF">CHF Franc suisse</option>
                </select>
              </div>

              {/* Premier jour */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Premier jour de la semaine</label>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                  {['lundi', 'dimanche'].map((j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => handlePrefChange('premierJour', j)}
                      className={`rounded-lg py-2 text-sm font-medium capitalize transition ${
                        preferences.premierJour === j
                          ? 'bg-white text-sky-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {j.charAt(0).toUpperCase() + j.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Notifications</p>
                  <p className="text-xs text-slate-400">Alertes de dépassement de budget</p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePrefChange('notifications', !preferences.notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.notifications ? 'bg-sky-500' : 'bg-slate-200'
                  }`}
                  role="switch"
                  aria-checked={preferences.notifications}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Bouton sauvegarder */}
              <button
                onClick={handleSave}
                className={`w-full rounded-xl py-2.5 text-sm font-semibold transition ${
                  saved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-sky-500 text-white hover:bg-sky-600'
                }`}
              >
                {saved ? '✓ Sauvegardé !' : 'Sauvegarder les préférences'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Parametres;
