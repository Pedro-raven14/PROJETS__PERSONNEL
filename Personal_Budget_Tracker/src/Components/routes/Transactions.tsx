import React, { useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { CATEGORIES, getCategoryById } from '../../data/categories';
import CategoryIcon from '../ui/CategoryIcon';
import TransactionModal from '../ui/TransactionModal';
import { isInPeriod, Transaction } from '../../utils/formatters';

const PAGE_SIZE = 10;

type Periode = 'mois' | 'trimestre' | 'annee' | 'tout';

const PERIODES: { label: string; value: Periode }[] = [
  { label: 'Ce mois',      value: 'mois'      },
  { label: 'Ce trimestre', value: 'trimestre' },
  { label: 'Cette année',  value: 'annee'     },
  { label: 'Tout',         value: 'tout'      },
];

const Transactions: React.FC = () => {
  const { transactions, supprimerTransaction, formatMontant } = useBudget();

  // ── Filtres ──
  const [recherche, setRecherche] = useState('');
  const [categFil,  setCategFil]  = useState('toutes');
  const [typeFil,   setTypeFil]   = useState('tous');
  const [periode,   setPeriode]   = useState<Periode>('mois');
  const [page,      setPage]      = useState(1);

  // ── Modal ──
  const [modalOpen, setModalOpen] = useState(false);
  const [toEdit,    setToEdit]    = useState<Transaction | null>(null);

  // ── Confirmation suppression ──
  const [toDelete, setToDelete] = useState<string | null>(null);

  const openNew  = () => { setToEdit(null);  setModalOpen(true); };
  const openEdit = (t: Transaction) => { setToEdit(t); setModalOpen(true); };

  const confirmerSuppression = (id: string) => setToDelete(id);
  const executerSuppression  = () => {
    if (toDelete) { supprimerTransaction(toDelete); setToDelete(null); }
  };

  // Réinitialise la page à chaque changement de filtre
  function handleFilter<T>(setter: React.Dispatch<React.SetStateAction<T>>) {
    return (val: T) => { setter(val); setPage(1); };
  }

  // ── Transactions filtrées ──
  const filtrees = useMemo(() => {
    return transactions
      .filter((t) => isInPeriod(t.date, periode))
      .filter((t) => categFil === 'toutes' || t.categorie === categFil)
      .filter((t) => typeFil  === 'tous'   || t.type === typeFil)
      .filter((t) => !recherche || t.description.toLowerCase().includes(recherche.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, periode, categFil, typeFil, recherche]);

  const totalPages  = Math.max(1, Math.ceil(filtrees.length / PAGE_SIZE));
  const pageCurrent = Math.min(page, totalPages);
  const paginated   = filtrees.slice((pageCurrent - 1) * PAGE_SIZE, pageCurrent * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── En-tête page ── */}
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-800">Transactions</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              {filtrees.length} entrée{filtrees.length > 1 ? 's' : ''} sur la période
            </p>
          </div>
          <button
            onClick={openNew}
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouvelle Transaction</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>

        {/* ── Filtres ── */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une transaction..."
                value={recherche}
                onChange={(e) => { setRecherche(e.target.value); setPage(1); }}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>
            {/* Catégorie */}
            <select
              value={categFil}
              onChange={(e) => handleFilter(setCategFil)(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-sky-400 focus:outline-none"
            >
              <option value="toutes">Toutes les catégories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            {/* Type */}
            <select
              value={typeFil}
              onChange={(e) => handleFilter(setTypeFil)(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-sky-400 focus:outline-none"
            >
              <option value="tous">Tous les types</option>
              <option value="revenu">Revenus</option>
              <option value="depense">Dépenses</option>
            </select>
          </div>

          {/* Période */}
          <div className="mt-3 flex flex-wrap gap-2">
            {PERIODES.map((p) => (
              <button
                key={p.value}
                onClick={() => handleFilter(setPeriode)(p.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  periode === p.value
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tableau ── */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          {/* En-tête tableau */}
          <div className="hidden grid-cols-[auto_1fr_auto_auto_auto] gap-4 border-b border-slate-100 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:grid">
            <span>Catégorie</span>
            <span>Description</span>
            <span>Date</span>
            <span className="text-right">Montant</span>
            <span className="text-right">Actions</span>
          </div>

          {paginated.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Search className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p>Aucune transaction trouvée</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {paginated.map((t) => {
                const cat     = getCategoryById(t.categorie);
                const dateStr = new Date(t.date).toLocaleDateString('fr-FR');
                return (
                  <li
                    key={t.id}
                    className="grid grid-cols-[auto_1fr_auto] gap-4 px-6 py-4 hover:bg-slate-50 transition sm:grid-cols-[auto_1fr_auto_auto_auto] sm:items-center"
                  >
                    {/* Catégorie */}
                    <div className="flex items-center gap-3">
                      <CategoryIcon categorieId={t.categorie} size="sm" />
                      <span className="hidden text-sm font-medium text-slate-700 sm:block">{cat?.label}</span>
                    </div>

                    {/* Description */}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{t.description}</p>
                      <p className="text-xs text-slate-400 sm:hidden">{cat?.label} · {dateStr}</p>
                    </div>

                    {/* Date */}
                    <span className="hidden text-sm text-slate-500 sm:block">{dateStr}</span>

                    {/* Montant */}
                    <span
                      className={`text-sm font-semibold sm:text-right ${
                        t.type === 'revenu' ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    >
                      {t.type === 'revenu' ? '+' : '-'}{formatMontant(t.montant)}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(t)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-sky-50 hover:text-sky-500"
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => confirmerSuppression(t.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
              <p className="text-sm text-slate-400">
                Page {pageCurrent} sur {totalPages} · {PAGE_SIZE * (pageCurrent - 1) + 1}–{Math.min(PAGE_SIZE * pageCurrent, filtrees.length)} / {filtrees.length}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pageCurrent === 1}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={pageCurrent === totalPages}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal ajout/modification */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setToEdit(null); }}
        transactionToEdit={toEdit}
      />

      {/* Dialog confirmation suppression */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setToDelete(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-2 font-bold text-slate-800">Supprimer la transaction ?</h3>
            <p className="mb-5 text-sm text-slate-500">Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setToDelete(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={executerSuppression}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
