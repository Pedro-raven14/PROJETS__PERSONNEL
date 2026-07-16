import React, { useState, useEffect, useMemo, useCallback } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import { Eye, Edit, Trash2, Plus, MoreVertical } from "lucide-react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { API_URL } from '../../../../config/api';


export interface Promotion {
  id: number;
  anneeAcademique: string;
  filiere: string;
  options: string; // Note: 'options' au pluriel comme dans l'entité
  dateCreation: string | Date;
  statut: "Active" | "Archivée";
  etudiants?: any[]; // Relation optionnelle
  equipes?: any[];
  espacesPedagogiques?: any[];
}

export interface PromotionFormData {
  anneeAcademique: string;
  filiere: string;
  options: string;
  statut: "Active" | "Archivée";
}

// interface FilterOptions {
//   filiere: string;
//   annee: string;
//   statut: string;
//   sortBy: string;
// }


const promotionApiService = {
  async getAllPromotions(): Promise<Promotion[]> {
    try {
      const response = await axios.get<Promotion[]>(`${API_URL}/promotion`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des promotions:", error);
      toast.error("Erreur lors du chargement des promotions");
      throw error;
    }
  },

  async createPromotion(promotionData: PromotionFormData): Promise<string> {
    try {
      // Formatage des données pour correspondre à l'entité
      const formattedData = {
        ...promotionData,
        dateCreation: new Date().toISOString(),
      };
      
      const response = await axios.post<string>(
        `${API_URL}/promotion`,
        formattedData
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de la promotion:", error);
      toast.error("Erreur lors de la création de la promotion");
      throw error;
    }
  },

  async updatePromotion(id: number, promotionData: PromotionFormData): Promise<string> {
    try {
      const response = await axios.put<string>(
        `${API_URL}/promotion/${id}`,
        promotionData
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la promotion:", error);
      toast.error("Erreur lors de la mise à jour de la promotion");
      throw error;
    }
  },

  async deletePromotion(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/promotion/${id}`);
      toast.success("Promotion supprimée avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression de la promotion:", error);
      toast.error("Erreur lors de la suppression de la promotion");
      throw error;
    }
  },
};

/* ========================= ACTION MENU ========================= */
interface ActionMenuProps {
  row: Promotion;
  onEdit: (promotion: Promotion) => void;
  onDelete: (id: number) => Promise<void>;
  onView: (id: number) => void;
}

const ActionMenuPortal = ({
  position,
  onClose,
  onEdit,
  onDelete,
  onView,
  row,
  isDeleting,
}: {
  position: { top: number; left: number };
  onClose: () => void;
  onEdit: (promotion: Promotion) => void;
  onDelete: (id: number) => Promise<void>;
  onView: (id: number) => void;
  row: Promotion;
  isDeleting: boolean;
}) => {
  useEffect(() => {
    const close = () => onClose();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [onClose]);

  // Calculer la position optimale pour éviter le débordement
  const getOptimalPosition = () => {
    const menuWidth = 160; // Largeur du menu
    const menuHeight = 120; // Hauteur approximative du menu
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let { top, left } = position;
    
    // Ajuster horizontalement si le menu dépasse à droite
    if (left + menuWidth > viewportWidth) {
      left = viewportWidth - menuWidth - 10;
    }
    
    // Ajuster horizontalement si le menu dépasse à gauche
    if (left < 10) {
      left = 10;
    }
    
    // Ajuster verticalement si le menu dépasse en bas
    if (top + menuHeight > viewportHeight) {
      top = viewportHeight - menuHeight - 10;
    }
    
    // Ajuster verticalement si le menu dépasse en haut
    if (top < 10) {
      top = 10;
    }
    
    return { top, left };
  };

  const optimalPosition = getOptimalPosition();

  const handleDelete = async () => {
    try {
      await onDelete(row.id);
    } finally {
      onClose();
    }
  };

  return createPortal(
    <>
      {/* overlay invisible */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
      />

      <div
        className="fixed z-[9999] w-40 bg-white rounded-lg shadow-xl border border-gray-200"
        style={{
          top: optimalPosition.top,
          left: optimalPosition.left,
        }}
      >
        <MenuItem 
          icon={Eye} 
          label="Voir" 
          onClick={() => {
            onView(row.id);
            onClose();
          }} 
        />
        <MenuItem 
          icon={Edit} 
          label="Modifier" 
          onClick={() => {
            onEdit(row);
            onClose();
          }} 
        />
        <MenuItem
          icon={Trash2}
          label={isDeleting ? "Suppression..." : "Supprimer"}
          danger
          onClick={handleDelete}
          disabled={isDeleting}
        />
      </div>
    </>,
    document.body
  );
};

  // Composant ActionMenu avec fermeture globale
  const ActionMenuComponent: React.FC<ActionMenuProps & { globalMenuClose: number }> = ({
    row,
    onEdit,
    onDelete,
    onView,
    globalMenuClose,
  }) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [menuPos, setMenuPos] = useState<null | { top: number; left: number }>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fermer le menu lors des événements globaux
    useEffect(() => {
      if (globalMenuClose > 0) {
        setMenuPos(null);
      }
    }, [globalMenuClose]);

    const openMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 160;
      const menuHeight = 120;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Position par défaut : en bas à gauche du bouton
      let top = rect.bottom + 6;
      let left = rect.left - menuWidth + rect.width;
      
      // Si le menu dépasse en bas, l'afficher au-dessus
      if (top + menuHeight > viewportHeight && rect.top > menuHeight) {
        top = rect.top - menuHeight - 6;
      }
      
      // Si le menu dépasse à gauche, l'afficher à droite
      if (left < 10) {
        left = rect.right - menuWidth;
      }
      
      // Si le menu dépasse encore à droite, l'ajuster
      if (left + menuWidth > viewportWidth) {
        left = viewportWidth - menuWidth - 10;
      }
      
      // Assurer que le menu reste dans les limites
      top = Math.max(10, Math.min(top, viewportHeight - menuHeight - 10));
      left = Math.max(10, Math.min(left, viewportWidth - menuWidth - 10));

      setMenuPos({ top, left });
    };

    const closeMenu = () => setMenuPos(null);

    const handleDelete = async (id: number) => {
      setIsDeleting(true);
      try {
        await onDelete(id);
      } finally {
        setIsDeleting(false);
      }
    };

    return (
      <>
        <button
          ref={buttonRef}
          onClick={openMenu}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          disabled={isDeleting}
        >
          <MoreVertical size={18} className="text-gray-600" />
        </button>

        {menuPos && (
          <ActionMenuPortal
            position={menuPos}
            onClose={closeMenu}
            onEdit={onEdit}
            onDelete={handleDelete}
            onView={onView}
            row={row}
            isDeleting={isDeleting}
          />
        )}
      </>
    );
  };

interface MenuItemProps {
  icon: React.ComponentType<any>;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon: Icon,
  label,
  onClick,
  danger = false,
  disabled = false,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 ${
      danger ? "text-red-600" : "text-gray-700"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    <Icon size={16} className="mr-2" />
    {label}
  </button>
);

/* ========================= MODAL ========================= */
interface PromotionModalProps {
  show: boolean;
  promotion: Promotion | null;
  onClose: () => void;
  onSubmit: (data: PromotionFormData) => Promise<void>;
  isSubmitting: boolean;
}

const PromotionModal: React.FC<PromotionModalProps> = ({
  show,
  promotion,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [form, setForm] = useState<PromotionFormData>({
    anneeAcademique: "",
    filiere: "",
    options: "",
    statut: "Active",
  });

  useEffect(() => {
    if (promotion) {
      // Extraction des données nécessaires pour le formulaire
      const { id, dateCreation, etudiants, equipes, espacesPedagogiques, ...rest } = promotion;
      setForm(rest);
    } else {
      // Réinitialiser le formulaire pour une nouvelle promotion
      setForm({
        anneeAcademique: "",
        filiere: "",
        options: "",
        statut: "Active",
      });
    }
  }, [promotion]);

  if (!show) return null;

  const handleSubmit = async () => {
    try {
      await onSubmit(form);
    } catch (error) {
      // L'erreur est déjà gérée par le service
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">
          {promotion ? "Modifier" : "Ajouter"} une promotion
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Année académique *
            </label>
            <input
              placeholder="Ex: 2025-2026"
              className="w-full px-3 py-2 border rounded-md"
              value={form.anneeAcademique}
              onChange={(e) => setForm({ ...form, anneeAcademique: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filière *
            </label>
            <input
              placeholder="Ex: Informatique"
              className="w-full px-3 py-2 border rounded-md"
              value={form.filiere}
              onChange={(e) => setForm({ ...form, filiere: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Options
            </label>
            <input
              placeholder="Ex: Développement Web"
              className="w-full px-3 py-2 border rounded-md"
              value={form.options}
              onChange={(e) => setForm({ ...form, options: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={form.statut}
              onChange={(e) => setForm({ ...form, statut: e.target.value as "Active" | "Archivée" })}
            >
              <option value="Active">Active</option>
              <option value="Archivée">Archivée</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Chargement..." : "Valider"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ========================= PAGE PRINCIPALE ========================= */
const Promotion = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalMenuClose, setGlobalMenuClose] = useState(0); // Pour forcer la fermeture des menus

  // Vérifier les paramètres URL pour ouvrir automatiquement le modal
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      setSelectedPromotion(null);
      setShowModal(true);
      // Nettoyer le paramètre URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Fermer tous les menus lors du scroll ou redimensionnement
  useEffect(() => {
    const handleGlobalEvents = () => {
      // Incrémenter pour déclencher la fermeture des menus
      setGlobalMenuClose(prev => prev + 1);
    };

    window.addEventListener('scroll', handleGlobalEvents, true);
    window.addEventListener('resize', handleGlobalEvents);
    
    return () => {
      window.removeEventListener('scroll', handleGlobalEvents, true);
      window.removeEventListener('resize', handleGlobalEvents);
    };
  }, []);

  // Charger les promotions au montage du composant
  const loadPromotions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await promotionApiService.getAllPromotions();
      setPromotions(data);
    } catch (error) {
      // L'erreur est déjà gérée par le service
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  const handleSubmit = async (data: PromotionFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedPromotion) {
        // Mise à jour d'une promotion existante
        const message = await promotionApiService.updatePromotion(selectedPromotion.id, data);
        toast.success(message);
      } else {
        // Création d'une nouvelle promotion
        const message = await promotionApiService.createPromotion(data);
        toast.success(message);
      }
      
      // Recharger la liste des promotions
      await loadPromotions();
      setShowModal(false);
    } catch (error) {
      // L'erreur est déjà gérée par le service
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await promotionApiService.deletePromotion(id);
      // Mettre à jour l'état local après suppression
      setPromotions(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      // L'erreur est déjà gérée par le service
    }
  };

  const handleView = (id: number) => {
    const promotion = promotions.find(p => p.id === id);
    if (promotion) {
      toast.success(`Promotion ${promotion.anneeAcademique} - ${promotion.filiere}`);
      // Ici, vous pouvez naviguer vers une page de détails ou ouvrir un modal détaillé
    }
  };

  const columns = useMemo<TableColumn<Promotion>[]>(
    () => [
      { 
        name: "ID", 
        selector: (r) => r.id.toString(),
        sortable: true,
        width: "80px" 
      },
      { 
        name: "Année académique", 
        selector: (r) => r.anneeAcademique,
        sortable: true 
      },
      { 
        name: "Filière", 
        selector: (r) => r.filiere,
        sortable: true 
      },
      { 
        name: "Options", 
        selector: (r) => r.options || "-",
        sortable: true 
      },
      {
        name: "Date création",
        selector: (r) => {
          const date = new Date(r.dateCreation);
          return date.toLocaleDateString('fr-FR');
        },
        sortable: true,
      },
      {
        name: "Statut",
        cell: (r) => (
          <span
            className={`px-2 py-1 rounded text-xs ${
              r.statut === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {r.statut}
          </span>
        ),
        sortable: true,
      },
      {
        name: "Actions",
        cell: (row) => (
          <ActionMenuComponent
            row={row}
            onEdit={(promotion) => {
              setSelectedPromotion(promotion);
              setShowModal(true);
            }}
            onDelete={handleDelete}
            onView={handleView}
            globalMenuClose={globalMenuClose}
          />
        ),
        ignoreRowClick: true,
        width: "100px"
      },
    ],
    []
  );

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des promotions</h1>
          {/*<p className="text-gray-600">Total: {promotions.length} promotion(s)</p>*/}
        </div>
        <button
          onClick={() => {
            setSelectedPromotion(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={18} /> Ajouter une promotion
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des promotions...</p>
          </div>
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Aucune promotion trouvée</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus size={18} /> Créer une promotion
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <DataTable
            columns={columns}
            data={promotions}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            highlightOnHover
            responsive
            noDataComponent={<div className="p-4 text-center">Aucune donnée disponible</div>}
            progressPending={isLoading}
            customStyles={{
              headRow: {
                style: {
                  backgroundColor: "#f9fafb",
                  border: "none",
                },
              },
              headCells: {
                style: {
                  paddingLeft: "16px",
                  paddingRight: "16px",
                  fontWeight: "600",
                  color: "#374151",
                },
              },
              cells: {
                style: {
                  paddingLeft: "16px",
                  paddingRight: "16px",
                  paddingTop: "12px",
                  paddingBottom: "12px",
                  position: "relative",
                  overflow: "visible",
                },
              },
              rows: {
                style: {
                  borderBottom: "1px solid #f3f4f6",
                  overflow: "visible",
                  position: "relative",
                  "&:hover": {
                    backgroundColor: "#f8fafc",
                  },
                },
              },
              table: {
                style: {
                  overflow: "visible",
                },
              },
              tableWrapper: {
                style: {
                  overflow: "visible",
                },
              },
            }}
          />
        </div>
      )}

      <PromotionModal
        show={showModal}
        promotion={selectedPromotion}
        onClose={() => {
          setShowModal(false);
          setSelectedPromotion(null);
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Promotion;