import React from 'react';
import { Calendar, PlusSquare, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ActionButton: React.FC<{ 
  label: string; 
  intent?: string; 
  Icon?: React.ElementType;
  onClick?: () => void;
  tooltip?: string;
}> = ({ label, intent = 'primary', Icon, onClick, tooltip }) => {
  const base = 'inline-flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-md font-medium whitespace-nowrap transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md';
  const variants: Record<string, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    green: 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
    indigo: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
    yellow: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2',
  };
  const Cls = variants[intent] ?? variants.primary;
  
  return (
    <button 
      className={`${base} ${Cls}`} 
      onClick={onClick}
      title={tooltip || label}
      aria-label={tooltip || label}
    >
      {Icon ? <Icon className="w-3 h-3 sm:w-4 sm:h-4" /> : null}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.split(' ')[0]}</span>
    </button>
  );
};

const HeaderSection: React.FC = () => {
  const navigate = useNavigate();

  const handleAddStudent = () => {
    // Naviguer vers la page étudiants avec un paramètre pour ouvrir le modal
    navigate('/directeur/etudiant?action=add');
    toast.success('Redirection vers la page étudiants...', {
      icon: '👨‍🎓',
      duration: 2000,
    });
  };

  const handleAddFormateur = () => {
    // Naviguer vers la page formateurs avec un paramètre pour ouvrir le formulaire
    navigate('/directeur/formateur?action=add');
    toast.success('Redirection vers la page formateurs...', {
      icon: '👨‍🏫',
      duration: 2000,
    });
  };

  const handleCreatePromotion = () => {
    // Naviguer vers la page promotions avec un paramètre pour ouvrir le modal
    navigate('/directeur/promotion?action=add');
    toast.success('Redirection vers la page promotions...', {
      icon: '🎓',
      duration: 2000,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Tableau de bord — Directeur</h1>
        <p className="text-sm text-gray-500">Vue d'ensemble et actions rapides</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ActionButton 
          label="Ajouter étudiant" 
          intent="green" 
          Icon={PlusSquare} 
          onClick={handleAddStudent}
          tooltip="Naviguer vers la page étudiants et ouvrir le formulaire d'ajout"
        />
        <ActionButton 
          label="Ajouter formateur" 
          intent="indigo" 
          Icon={UserPlus} 
          onClick={handleAddFormateur}
          tooltip="Naviguer vers la page formateurs et ouvrir le formulaire d'ajout"
        />
        <ActionButton 
          label="Créer promotion" 
          intent="primary" 
          Icon={Calendar} 
          onClick={handleCreatePromotion}
          tooltip="Naviguer vers la page promotions et ouvrir le formulaire de création"
        />
      </div>
    </div>
  );
};

export default HeaderSection;