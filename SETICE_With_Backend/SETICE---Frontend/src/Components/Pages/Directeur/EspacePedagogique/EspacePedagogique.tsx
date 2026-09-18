import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import {
  Search,
  Filter,
  Eye,
  Ban,
  Edit,
  Trash2,
  MoreVertical,
  User,
  X,
  Loader2
} from "lucide-react";
import { FaPlus } from "react-icons/fa";
import AjoutEspaceModal from "./components/AjoutEspaceModal";
import { createPortal } from "react-dom";
import { API_URL } from '../../../../config/api';
import { useEmailService } from '../../../../hooks/useEmailService';
import toast from 'react-hot-toast';

const ActionMenuPortal = ({
  position,
  onClose,
  onAction,
}: {
  position: { top: number; left: number };
  onClose: () => void;
  onAction: (action: "view" | "edit" | "delete" | "deactivate") => void;
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
    const menuWidth = 192; // w-48 = 12rem = 192px
    const menuHeight = 160; // Hauteur approximative du menu
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

  return createPortal(
    <>
      {/* overlay invisible */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
      />

      <div
        className="fixed z-[9999] w-48 bg-white rounded-xl shadow-xl border border-gray-200"
        style={{
          top: optimalPosition.top,
          left: optimalPosition.left,
        }}
      >
        <MenuItem icon={Eye} label="Voir" onClick={() => onAction("view")} />
        <MenuItem icon={Edit} label="Modifier" onClick={() => onAction("edit")} />
        <MenuItem icon={Ban} label="Désactiver" onClick={() => onAction("deactivate")} />
        <MenuItem
          icon={Trash2}
          label="Supprimer"
          danger
          onClick={() => onAction("delete")}
        />
      </div>
    </>,
    document.body
  );
};

const MenuItem = ({
  icon: Icon,
  label,
  onClick,
  danger,
}: any) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm transition
      ${danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"}
    `}
  >
    <Icon size={16} className="mr-3" />
    {label}
  </button>
);


const EspacePedagogique = () => {
  const [showAjoutEspaceModal, setShowAjoutEspaceModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [espaces, setEspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewStudents, setViewStudents] = useState<any[]>([]);
  const [viewEspace, setViewEspace] = useState<any | null>(null);
  const [addingStudent, setAddingStudent] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [globalMenuClose, setGlobalMenuClose] = useState(0); // Pour forcer la fermeture des menus

  // Hook pour l'envoi d'emails
  const { sendCredentials } = useEmailService();

  const handleChange = ({ selectedRows }: { selectedRows: any }) => {
    setSelectedRows(selectedRows);
  };

  const fetchEspaces = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/espace-pedagogique`);
      let data = res.data;
      if (data?.result) data = data.result;
      else if (data?.results) data = data.results;
      if (!Array.isArray(data)) data = [];
      setEspaces(data);
    } catch (err) {
      console.error("Erreur fetch espaces:", err);
      setEspaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEspaces();
  }, []);

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

  const filteredEspaces = espaces.filter((r: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      String(r.nom || '').toLowerCase().includes(term) ||
      String((r.matiere && (r.matiere.nom || r.matiere)) || '').toLowerCase().includes(term) ||
      String((r.formateur && r.formateur.utilisateur && r.formateur.utilisateur.nom) || '').toLowerCase().includes(term)
    );
  });

  // Composant ActionMenu séparé
  const ActionMenu = ({ row }: { row: any }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [menuPos, setMenuPos] = useState<null | { top: number; left: number }>(null);

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
      const menuWidth = 192; // w-48 = 12rem = 192px
      const menuHeight = 160; // Hauteur approximative du menu
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

    const handleAction = async (
      action: "view" | "edit" | "delete" | "deactivate"
    ) => {
      closeMenu();

      switch (action) {
        case "view":
          setViewEspace(row);
          setShowViewModal(true);
          try {
            const res = await axios.get(
              `${API_URL}/espace-pedagogique/${row.id}/etudiants`
            );
            setViewStudents(res.data || []);
          } catch {
            setViewStudents([]);
          }
          break;

        case "edit":
          console.log("Edit", row.id);
          break;

        case "deactivate":
          console.log("Deactivate", row.id);
          break;

        case "delete":
          if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'espace "${row.nom}" ?\n\nCette action supprimera également tous les travaux et soumissions associés.`)) {
            try {
              await axios.delete(`${API_URL}/espace-pedagogique/${row.id}`);
              toast.success('Espace pédagogique supprimé avec succès');
              // Recharger la liste des espaces
              fetchEspaces();
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              toast.error('Erreur lors de la suppression de l\'espace pédagogique');
            }
          }
          break;
      }
    };

    return (
      <>
        <button
          ref={buttonRef}
          onClick={openMenu}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <MoreVertical size={18} className="text-gray-600" />
        </button>

        {menuPos && (
          <ActionMenuPortal
            position={menuPos}
            onClose={closeMenu}
            onAction={handleAction}
          />
        )}
      </>
    );
  };


  const columns = [
    {
      name: "N°",
      width: "70px",
      cell: (row: any, rowIndex?: number) => (
        <span className="text-gray-600 font-medium">
          {(rowIndex !== undefined ? rowIndex + 1 : filteredEspaces.indexOf(row) + 1) || "-"}
        </span>
      ),
    },
    {
      name: "Nom de l'espace",
      cell: (row: any) => (
        <span className="font-medium text-gray-900">{row.nom}</span>
      ),
      sortable: true,
    },
    {
      name: "Description",
      cell: (row: any) => (
        <div className="max-w-xs truncate text-gray-600">
          {row.description}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Matière",
      cell: (row: any) => (
        <span className="text-gray-700">
          {row.matiere && typeof row.matiere === 'object' ? row.matiere.nom : row.matiere || ''}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Formateur",
      minWidth: "180px",
      cell: (row: any) => {
        const f = row.formateur;
        if (!f || !f.utilisateur) return '';
        const nom = f.utilisateur.nom || '';
        const prenom = f.utilisateur.prenom || '';
        return (
          <span className="text-gray-900">{`${nom} ${prenom}`.trim()}</span>
        );
      },
      sortable: true,
    },
    {
      name: "Promotion",
      cell: (row: any) => {
        const p = row.promotion;
        if (!p) return '';
        return (
          <div>
            <div className="font-medium text-gray-900">
              {p.filiere || ''}/{p.options || ''}
            </div>
            <div className="text-gray-500 text-xs mt-1">
              {p.anneeAcademique || ''}
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      name: <span className="text-sm font-semibold text-gray-700">Action</span>,
      width: "100px",
      center: true,
      cell: (row: any) => (
        <ActionMenu row={row} />
      ),
    },
  ];

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const payload = {
      nom: String(formData.get('nom') || ''),
      prenom: String(formData.get('prenom') || ''),
      email: String(formData.get('email') || ''),
      telephone: String(formData.get('telephone') || ''),
      matricule: String(formData.get('matricule') || ''),
      centre: String(formData.get('centre') || ''),
      niveau: String(formData.get('niveau') || ''),
      promotionId: viewEspace?.promotion?.id,
    };

    try {
      setAddingStudent(true);
      const response = await axios.post(`${API_URL}/etudiant`, payload);
      
      // Vérifier si des identifiants sont retournés
      if (response.data && response.data.user && response.data.generatedPassword) {
        const credentials = {
          email: response.data.user.email,
          password: response.data.generatedPassword,
          nom: response.data.user.nom,
          prenom: response.data.user.prenom
        };
        
        // Envoyer l'email avec les identifiants
        await sendCredentials(credentials);
      }
      
      // Refresh student list
      const res = await axios.get(`${API_URL}/espace-pedagogique/${viewEspace.id}/etudiants`);
      setViewStudents(res.data || []);
      form.reset();
      toast.success('Étudiant ajouté avec succès');
    } catch (err) {
      console.error('Erreur ajout etudiant', err);
      toast.error('Erreur lors de l\'ajout de l\'étudiant');
    } finally {
      setAddingStudent(false);
    }
  };

  const studentColumns = [
    {
      name: 'N°',
      width: '60px',
      cell: (row: any, index?: number) => (
        <span className="text-gray-600">
          {(index !== undefined ? index + 1 : viewStudents.indexOf(row) + 1) || "-"}
        </span>
      ),
    },
    {
      name: 'Nom',
      selector: (row: any) => `${row.utilisateur?.nom || ''} ${row.utilisateur?.prenom || ''}`.trim(),
      sortable: true,
    },
    {
      name: 'Email',
      selector: (row: any) => row.utilisateur?.email || '',
      sortable: true,
    },
    {
      name: 'Matricule',
      selector: (row: any) => row.matricule || '',
      sortable: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Espaces pédagogiques
            </h1>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Gérez vos espaces, affectez des matières et suivez les étudiants de chaque promotion.
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
            onClick={() => setShowAjoutEspaceModal(true)}
          >
            <FaPlus className="mr-2" />
            Ajouter un espace
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative"> {/* Ajout de relative ici */}
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Rechercher un espace, matière, formateur..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 md:p-6">
          {/* Selected Rows Info */}
          {selectedRows.length > 0 && (
            <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-700 font-medium">
                {selectedRows.length} Espace(s) pédagogique(s) sélectionné(s)
              </span>
              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          )}

          {/* DataTable */}
          <DataTable
            pagination
            responsive
            selectableRows
            onSelectedRowsChange={handleChange}
            customStyles={{
              headRow: {
                style: {
                  backgroundColor: "#f0f9ff",
                  border: "none",
                  marginBottom: "8px",
                  padding: "12px",
                  fontWeight: "600",
                  color: "#1f2937",
                  fontSize: "0.875rem",
                },
              },
              headCells: {
                style: {
                  paddingLeft: "16px",
                  paddingRight: "16px",
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
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  backgroundColor: "white",
                  overflow: "visible",
                  position: "relative",
                  "&:hover": {
                    borderColor: "#3b82f6",
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
            columns={columns}
            data={filteredEspaces}
            progressPending={loading}
            noDataComponent={
              <div className="min-h-[350px] flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <div className="text-gray-400 text-3xl">📚</div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Aucun Espace Pédagogique
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Commencez par créer votre premier espace pédagogique
                  </p>
                  <button
                    className="inline-flex items-center justify-center bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    onClick={() => setShowAjoutEspaceModal(true)}
                  >
                    <FaPlus className="mr-2" />
                    Créer un espace
                  </button>
                </div>
              </div>
            }
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-gray-500 text-sm">
          2025 Fait/Pedrito - Tous droits réservés
        </p>
      </div>

      {/* Modals */}
      <AjoutEspaceModal
        show={showAjoutEspaceModal}
        onClose={() => setShowAjoutEspaceModal(false)}
        onEspaceAdded={fetchEspaces}
      />

      {/* View Students Modal */}
      {showViewModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 transition-opacity"
            onClick={() => setShowViewModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Étudiants - {viewEspace?.nom || ''}
                    </h2>
                    <div className="text-gray-600 text-sm mt-1">
                      <strong>Promotion:</strong> {viewEspace?.promotion ?
                        `${viewEspace.promotion.filiere}/${viewEspace.promotion.options} (${viewEspace.promotion.anneeAcademique})` :
                        'Aucune'}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* Students Table */}
                <div className="mb-6">
                  {viewStudents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucun étudiant dans cet espace
                    </div>
                  ) : (
                    <DataTable
                      noHeader
                      dense
                      pagination
                      paginationPerPage={5}
                      customStyles={{
                        headRow: {
                          style: {
                            backgroundColor: "#f9fafb",
                            border: "none",
                          },
                        },
                        rows: {
                          style: {
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            marginBottom: "4px",
                          },
                        },
                      }}
                      columns={studentColumns}
                      data={viewStudents}
                    />
                  )}
                </div>

                <hr className="my-6 border-gray-200" />

                {/* Add Student Form */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User size={20} className="mr-2" />
                    Ajouter un étudiant
                  </h3>
                  <form onSubmit={handleAddStudent}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom *
                        </label>
                        <input
                          name="nom"
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Nom"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom *
                        </label>
                        <input
                          name="prenom"
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Prénom"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          name="email"
                          type="email"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Email"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone
                        </label>
                        <input
                          name="telephone"
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Téléphone"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Matricule *
                        </label>
                        <input
                          name="matricule"
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Matricule"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Centre
                        </label>
                        <input
                          name="centre"
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Centre"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Niveau
                        </label>
                        <input
                          name="niveau"
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Niveau"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={addingStudent}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {addingStudent ? (
                          <>
                            <Loader2 size={18} className="animate-spin mr-2" />
                            Ajout...
                          </>
                        ) : (
                          "Ajouter l'étudiant"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Floating Action Button for mobile */}
      <button
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-50"
        aria-label="Ajouter un espace"
        onClick={() => setShowAjoutEspaceModal(true)}
      >
        <FaPlus size={20} />
      </button>
    </div>
  );
};

export default EspacePedagogique;