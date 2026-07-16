// Définition des catégories avec leurs icônes Lucide et couleurs
export const CATEGORIES = [
  // Dépenses
  { id: 'alimentation',  label: 'Alimentation', type: 'depense',  icon: 'Utensils',     color: '#10B981', bgColor: 'bg-emerald-100',   textColor: 'text-emerald-600' },
  { id: 'transport',     label: 'Transport',    type: 'depense',  icon: 'Car',          color: '#0EA5E9', bgColor: 'bg-sky-100',        textColor: 'text-sky-600'     },
  { id: 'logement',      label: 'Logement',     type: 'depense',  icon: 'Home',         color: '#8B5CF6', bgColor: 'bg-violet-100',     textColor: 'text-violet-600'  },
  { id: 'shopping',      label: 'Shopping',     type: 'depense',  icon: 'ShoppingCart', color: '#F59E0B', bgColor: 'bg-amber-100',      textColor: 'text-amber-600'   },
  { id: 'loisirs',       label: 'Loisirs',      type: 'depense',  icon: 'Gamepad2',     color: '#EC4899', bgColor: 'bg-pink-100',       textColor: 'text-pink-600'    },
  { id: 'sante',         label: 'Santé',        type: 'depense',  icon: 'Heart',        color: '#EF4444', bgColor: 'bg-red-100',        textColor: 'text-red-600'     },
  { id: 'factures',      label: 'Factures',     type: 'depense',  icon: 'Zap',          color: '#F59E0B', bgColor: 'bg-yellow-100',     textColor: 'text-yellow-600'  },
  { id: 'education',     label: 'Éducation',    type: 'depense',  icon: 'BookOpen',     color: '#6366F1', bgColor: 'bg-indigo-100',     textColor: 'text-indigo-600'  },
  { id: 'autre_depense', label: 'Autre',        type: 'depense',  icon: 'MoreHorizontal',color: '#64748B',bgColor: 'bg-slate-100',      textColor: 'text-slate-600'   },
  // Revenus
  { id: 'salaire',       label: 'Salaire',      type: 'revenu',   icon: 'Briefcase',    color: '#10B981', bgColor: 'bg-emerald-100',   textColor: 'text-emerald-600' },
  { id: 'freelance',     label: 'Freelance',    type: 'revenu',   icon: 'Laptop',       color: '#0EA5E9', bgColor: 'bg-sky-100',        textColor: 'text-sky-600'     },
  { id: 'investissement',label: 'Investissement',type:'revenu',   icon: 'TrendingUp',   color: '#8B5CF6', bgColor: 'bg-violet-100',     textColor: 'text-violet-600'  },
  { id: 'cadeau',        label: 'Cadeau',       type: 'revenu',   icon: 'Gift',         color: '#EC4899', bgColor: 'bg-pink-100',       textColor: 'text-pink-600'    },
  { id: 'autre_revenu',  label: 'Autre revenu', type: 'revenu',   icon: 'MoreHorizontal',color: '#64748B',bgColor: 'bg-slate-100',      textColor: 'text-slate-600'   },
];

export const getCategoryById = (id) =>
  CATEGORIES.find((c) => c.id === id) ?? null;

export const getCategoriesByType = (type) =>
  CATEGORIES.filter((c) => c.type === type);

// Catégories de dépenses qui peuvent avoir un budget mensuel
export const BUDGET_CATEGORIES = CATEGORIES.filter((c) => c.type === 'depense');
