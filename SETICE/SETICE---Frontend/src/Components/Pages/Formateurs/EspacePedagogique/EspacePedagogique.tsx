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
  Calendar,
  Clock,
  FileText,
  X,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { FaPlus } from "react-icons/fa";
import AjoutTravailModal from "./components/AjoutTravailModal";
import { createPortal } from "react-dom";
import { API_URL } from '../../../../config/api';

const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(atob(payloadBase64));
    return payload.sub;
  } catch (e) {
    console.error("Token invalide", e);
    return null;
  }
};

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

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
      />

      <div
        className="fixed z-[9999] w-48 bg-white rounded-xl shadow-xl border border-gray-200"
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        <MenuItem icon={Eye} label="Voir les travaux" onClick={() => onAction("view")} />
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

const getTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case "devoir": return "bg-purple-100 text-purple-700";
    case "projet": return "bg-blue-100 text-blue-700";
    case "examen": return "bg-red-100 text-red-700";
    case "présentation": return "bg-green-100 text-green-700";
    case "quiz": return "bg-yellow-100 text-yellow-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const EspacePedagogique = () => {
  const [espaces, setEspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTravailModal, setShowTravailModal] = useState(false);
  const [selectedEspace, setSelectedEspace] = useState<any | null>(null);
  const [travaux, setTravaux] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTravaux, setViewTravaux] = useState<any[]>([]);
  const [viewEspace, setViewEspace] = useState<any | null>(null);
  const [loadingTravaux, setLoadingTravaux] = useState(false);
  const [showAddTravailModal, setShowAddTravailModal] = useState(false);

  // Utiliser selectedTravail dans une fonction pour éviter l'erreur
  const handleViewTravail = (travail: any) => {
    console.log('Viewing travail:', travail);
    // Logique pour afficher les détails du travail
  };

  const handleChange = ({ selectedRows }: { selectedRows: any }) => {
    setSelectedRows(selectedRows);
  };

  const fetchEspaces = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formateurId = getUserIdFromToken();

      if (!token || !formateurId) {
        console.error("Token ou formateurId manquant");
        return;
      }

      const res = await axios.get(
        `${API_URL}/espace-pedagogique/formateur/${formateurId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEspaces(res.data);
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

  const fetchTravauxByEspace = async (espaceId: number) => {
    setLoadingTravaux(true);
    try {
      const res = await axios.get(
        `${API_URL}/espace-pedagogique/${espaceId}/travaux`
      );
      setViewTravaux(res.data || []);
    } catch (err) {
      console.error("Erreur fetch travaux:", err);
      setViewTravaux([]);
    } finally {
      setLoadingTravaux(false);
    }
  };

  const handleViewEspace = async (row: any) => {
    setViewEspace(row);
    setShowViewModal(true);
    await fetchTravauxByEspace(row.id);
  };

  const handleAddTravail = () => {
    if (viewEspace) {
      setSelectedEspace(viewEspace);
      setShowAddTravailModal(true);
    }
  };

  const handleSubmitTravail = async (formData: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !viewEspace) return;

      const payload = {
        titre: formData.titre,
        description: formData.description,
        type: formData.type,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        // Si vous avez d'autres champs comme fichier, points, etc.
        points: formData.points || 100,
      };

      const res = await axios.post(
        `${API_URL}/espace-pedagogique/${viewEspace.id}/travaux`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Rafraîchir la liste des travaux
      await fetchTravauxByEspace(viewEspace.id);
      setShowAddTravailModal(false);
      return res.data;
    } catch (err) {
      console.error("Erreur création travail:", err);
      throw err;
    }
  };

  const filteredEspaces = espaces.filter((r: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      String(r.nom || '').toLowerCase().includes(term) ||
      String(r.matiere?.nom || '').toLowerCase().includes(term)
    );
  });

  const ActionMenu = ({ row }: { row: any }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [menuPos, setMenuPos] = useState<null | { top: number; left: number }>(null);

    const openMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 6, left: rect.left - 120 });
    };

    const closeMenu = () => setMenuPos(null);

    const handleAction = async (
      action: "view" | "edit" | "delete" | "deactivate"
    ) => {
      closeMenu();
      switch (action) {
        case "view":
          handleViewEspace(row);
          break;
        case "edit": console.log("Edit", row.id); break;
        case "deactivate": console.log("Deactivate", row.id); break;
        case "delete": console.log("Delete", row.id); break;
      }
    };

    return (
      <>
        <button
          ref={buttonRef}
          onClick={openMenu}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <MoreVertical size={18} />
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
      cell: (row: any, i?: number) => (
        <span className="text-gray-600 font-medium">
          {i !== undefined ? i + 1 : filteredEspaces.indexOf(row) + 1}
        </span>
      ) 
    },
    { 
      name: "Nom de l'espace", 
      cell: (row: any) => (
        <span className="font-medium text-gray-900">{row.nom}</span>
      ), 
      sortable: true 
    },
    { 
      name: "Description", 
      cell: (row: any) => (
        <div className="max-w-xs truncate text-gray-600">
          {row.description || "Aucune description"}
        </div>
      ), 
      sortable: true 
    },
    { 
      name: "Matière", 
      cell: (row: any) => (
        <span className="text-gray-700">
          {row.matiere?.nom || 'Non spécifiée'}
        </span>
      ), 
      sortable: true 
    },
    {
      name: "Promotion",
      cell: (row: any) => {
        const p = row.promotion;
        if (!p) return 'Non spécifiée';
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
      cell: (row: any) => <ActionMenu row={row} /> 
    },
  ];

  const travailColumns = [
    {
      name: "N°",
      width: "70px",
      cell: (row: any, index?: number) => (
        <span className="text-gray-600">
          {(index !== undefined ? index + 1 : viewTravaux.indexOf(row) + 1) || "-"}
        </span>
      ),
    },
    {
      name: "Titre",
      cell: (row: any) => (
        <div>
          <div className="font-medium text-gray-900">{row.titre}</div>
          <div className="text-gray-500 text-sm mt-1 truncate max-w-xs">
            {row.description}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Type",
      width: "120px",
      cell: (row: any) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(row.type)}`}>
          {row.type}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Début",
      width: "150px",
      cell: (row: any) => (
        <div className="text-gray-700">
          <div className="flex items-center text-sm">
            <Calendar size={14} className="mr-1" />
            {formatDate(row.debut)}
          </div>
          <div className="text-xs text-gray-500 flex items-center mt-1">
            <Clock size={12} className="mr-1" />
            {formatTime(row.debut)}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Fin",
      width: "150px",
      cell: (row: any) => (
        <div className="text-gray-700">
          <div className="flex items-center text-sm">
            <Calendar size={14} className="mr-1" />
            {formatDate(row.fin)}
          </div>
          <div className="text-xs text-gray-500 flex items-center mt-1">
            <Clock size={12} className="mr-1" />
            {formatTime(row.fin)}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Statut",
      width: "100px",
      cell: (row: any) => {
        const now = new Date();
        const debut = new Date(row.debut);
        const fin = new Date(row.fin);
        
        let status = "À venir";
        let bgColor = "bg-blue-100 text-blue-700";
        let icon = <Clock size={14} />;

        if (now < debut) {
          status = "À venir";
          bgColor = "bg-blue-100 text-blue-700";
          icon = <Clock size={14} />;
        } else if (now >= debut && now <= fin) {
          status = "En cours";
          bgColor = "bg-green-100 text-green-700";
          icon = <CheckCircle size={14} />;
        } else {
          status = "Terminé";
          bgColor = "bg-gray-100 text-gray-700";
          icon = <AlertCircle size={14} />;
        }

        return (
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgColor}`}>
            {icon}
            <span className="ml-1">{status}</span>
          </div>
        );
      },
    },
    {
      name: "Action",
      width: "100px",
      center: true,
      cell: (row: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewTravail(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Voir détails"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => console.log("Modifier", row.id)}
            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Mes Espaces pédagogiques
            </h1>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Gérez vos espaces, créez et suivez les travaux pour vos étudiants.
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
            onClick={() => setShowTravailModal(true)}
          >
            <FaPlus className="mr-2" />
            Créer un travail
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Rechercher un espace ou une matière..."
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
                },
              },
              rows: {
                style: {
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  backgroundColor: "white",
                  "&:hover": {
                    borderColor: "#3b82f6",
                    backgroundColor: "#f8fafc",
                  },
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
                    Vous n'avez pas encore d'espace pédagogique assigné
                  </p>
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

      {/* View Travaux Modal */}
      {showViewModal && viewEspace && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 transition-opacity"
            onClick={() => setShowViewModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Travaux - {viewEspace?.nom || ''}
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="text-gray-600 text-sm">
                        <strong>Matière:</strong> {viewEspace?.matiere?.nom || 'Non spécifiée'}
                      </div>
                      <div className="text-gray-600 text-sm">
                        <strong>Promotion:</strong> {viewEspace?.promotion ?
                          `${viewEspace.promotion.filiere}/${viewEspace.promotion.options} (${viewEspace.promotion.anneeAcademique})` :
                          'Aucune'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAddTravail}
                      className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <FaPlus className="mr-2" />
                      Nouveau travail
                    </button>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={20} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* Travaux Table */}
                <div className="mb-6">
                  {loadingTravaux ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                  ) : viewTravaux.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FileText className="text-gray-400" size={32} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Aucun travail pour cet espace
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Commencez par créer votre premier travail pour les étudiants
                      </p>
                      <button
                        onClick={handleAddTravail}
                        className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <FaPlus className="mr-2" />
                        Créer un travail
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <DataTable
                        noHeader
                        dense
                        pagination
                        paginationPerPage={5}
                        customStyles={{
                          headRow: {
                            style: {
                              backgroundColor: "#f9fafb",
                              borderBottom: "1px solid #e5e7eb",
                              fontSize: "0.875rem",
                              fontWeight: "600",
                              color: "#374151",
                            },
                          },
                          headCells: {
                            style: {
                              paddingLeft: "16px",
                              paddingRight: "16px",
                              paddingTop: "12px",
                              paddingBottom: "12px",
                            },
                          },
                          cells: {
                            style: {
                              paddingLeft: "16px",
                              paddingRight: "16px",
                              paddingTop: "14px",
                              paddingBottom: "14px",
                              fontSize: "0.875rem",
                            },
                          },
                          rows: {
                            style: {
                              border: "none",
                              borderBottom: "1px solid #e5e7eb",
                              backgroundColor: "white",
                              "&:hover": {
                                backgroundColor: "#f8fafc",
                              },
                              "&:last-child": {
                                borderBottom: "none",
                              },
                            },
                          },
                        }}
                        columns={travailColumns}
                        data={viewTravaux}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Travail Modal */}
      {showAddTravailModal && viewEspace && (
        <AjoutTravailModal
          show={showAddTravailModal}
          onClose={() => setShowAddTravailModal(false)}
          espace={viewEspace}
          onSave={handleSubmitTravail}
        />
      )}

      {/* Original Travail Modal (keep for backward compatibility) */}
      {showTravailModal && selectedEspace && (
        <AjoutTravailModal
          show={showTravailModal}
          onClose={() => setShowTravailModal(false)}
          espace={selectedEspace}
          travaux={travaux}
          setTravaux={setTravaux}
        />
      )}

      {/* Floating Action Button for mobile */}
      <button
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-50"
        aria-label="Ajouter un travail"
        onClick={() => setShowTravailModal(true)}
      >
        <FaPlus size={20} />
      </button>
    </div>
  );
};

export default EspacePedagogique;