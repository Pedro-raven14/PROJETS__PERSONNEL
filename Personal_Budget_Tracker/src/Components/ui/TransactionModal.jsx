import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { CATEGORIES } from '../../data/categories';

const TODAY = new Date().toISOString().split('T')[0];

const EMPTY_FORM = {
  type:        'depense',
  categorie:   'alimentation',
  description: '',
  montant:     '',
  date:        TODAY,
  note:        '',
  statut:      'paye',
};

const TransactionModal = ({ isOpen, onClose, transactionToEdit = null }) => {
  const { ajouterTransaction, modifierTransaction } = useBudget();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(transactionToEdit);

  // Remplir le formulaire si on modifie
  useEffect(() => {
    if (isOpen) {
      if (transactionToEdit) {
        setForm({ ...transactionToEdit });
      } else {
        setForm({ ...EMPTY_FORM, date: TODAY });
      }
      setErrors({});
    }
  }, [isOpen, transactionToEdit]);

  // Filtrer les catégories selon le type sélectionné
  const categoriesFiltrees = CATEGORIES.filter((c) => c.type === form.type);

  const handleTypeChange = (type) => {
    const defaultCat = CATEGORIES.find((c) => c.type === type);
    setForm((f) => ({ ...f, type, categorie: defaultCat?.id ?? '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = 'La description est requise';
    if (!form.montant || Number(form.montant) <= 0) e.montant = 'Montant invalide';
    if (!form.date) e.date = 'La date est requise';
    if (!form.categorie) e.categorie = 'La catégorie est requise';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }

    const payload = { ...form, montant: Number(form.montant) };

    if (isEdit) {
      modifierTransaction(transactionToEdit.id, payload);
    } else {
      ajouterTransaction(payload);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">
            {isEdit ? 'Modifier la transaction' : 'Ajouter une transaction'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Type</label>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              {['revenu', 'depense'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                    form.type === t
                      ? t === 'revenu'
                        ? 'bg-emerald-500 text-white shadow'
                        : 'bg-red-500 text-white shadow'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t === 'revenu' ? 'Revenu' : 'Dépense'}
                </button>
              ))}
            </div>
          </div>

          {/* Catégorie */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Catégorie</label>
            <select
              value={form.categorie}
              onChange={(e) => setForm((f) => ({ ...f, categorie: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            >
              {categoriesFiltrees.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            {errors.categorie && <p className="mt-1 text-xs text-red-500">{errors.categorie}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <input
              type="text"
              placeholder="Ex : Courses du mois"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
          </div>

          {/* Montant + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Montant</label>
              <div className="relative">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={form.montant}
                  onChange={(e) => setForm((f) => ({ ...f, montant: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-8 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">€</span>
              </div>
              {errors.montant && <p className="mt-1 text-xs text-red-500">{errors.montant}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
              {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
            </div>
          </div>

          {/* Statut */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Statut</label>
            <select
              value={form.statut}
              onChange={(e) => setForm((f) => ({ ...f, statut: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            >
              <option value="paye">Payé</option>
              <option value="en_attente">En attente</option>
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Note <span className="text-slate-400 font-normal">(optionnelle)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Informations complémentaires..."
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
