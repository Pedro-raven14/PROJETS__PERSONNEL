import React, { useState, useEffect } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import axios from "axios";
import { X, MoreVertical, UserPlus, Trash2 } from "lucide-react"; // Import des icônes nécessaires
import { API_URL } from '../../../../config/api';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { useEmailService } from '../../../../hooks/useEmailService';

type Formateur = {
  id: number;
  utilisateur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    actif: boolean;
    dateCreation: string;
    role: string;
  };
  specialite: string;
};

type EspacePedagogique = {
  id: number;
  nom: string;
  description?: string;
  formateur?: {
    id: number;
    utilisateur: {
      nom: string;
      prenom: string;
    };
  };
  promotion?: {
    id: number;
    filiere: string;
    options: string;
    anneeAcademique: string;
  };
  matiere?: {
    id: number;
    nom: string;
  };
};

const Formateur: React.FC = () => {
  // =======================
  // STATES
  // =======================
  const [searchParams, setSearchParams] = useSearchParams();
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Hook pour l'envoi d'emails
  const { sendCredentials } = useEmailService();

  // États pour la modal d'assignation
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedFormateurId, setSelectedFormateurId] = useState<number | null>(null);
  const [espacesPedagogiques, setEspacesPedagogiques] = useState<EspacePedagogique[]>([]);
  const [selectedEspaceId, setSelectedEspaceId] = useState<number | null>(null);
  const [loadingEspaces, setLoadingEspaces] = useState(false);

  // État pour le menu déroulant des actions
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Champs formulaire
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [specialite, setSpecialite] = useState("JAVA");
  const [actif, setActif] = useState(true);

  // Vérifier les paramètres URL pour ouvrir automatiquement le formulaire
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      setShowForm(true);
      // Nettoyer le paramètre URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Fetch data on mount
  useEffect(() => {
    const fetchFormateurs = async () => {
      try {
        const response = await axios.get(`${API_URL}/formateur`);
        setFormateurs(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des formateurs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFormateurs();
  }, []);

  // Fermer le menu des actions quand on clique ailleurs ou scroll
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    const handleScroll = () => {
      // Fermer le menu lors du scroll pour éviter les problèmes de positionnement
      setOpenMenuId(null);
    };

    if (openMenuId !== null) {
      document.addEventListener('click', handleClickOutside);
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        document.removeEventListener('click', handleClickOutside);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [openMenuId]);

  // =======================
  // FONCTIONS POUR L'ASSIGNATION
  // =======================
  const handleOpenAssignModal = async (formateurId: number) => {
    setSelectedFormateurId(formateurId);
    setSelectedEspaceId(null);
    setLoadingEspaces(true);
    
    try {
      // Récupérer la liste des espaces pédagogiques
      const response = await axios.get(`${API_URL}/espace-pedagogique`);
      setEspacesPedagogiques(response.data);
      setShowAssignModal(true);
    } catch (error) {
      console.error("Erreur lors de la récupération des espaces pédagogiques:", error);
      showNotification("Erreur lors du chargement des espaces pédagogiques", "error");
    } finally {
      setLoadingEspaces(false);
    }
  };

  const handleAssignFormateur = async () => {
    if (!selectedFormateurId || !selectedEspaceId) {
      showNotification("Veuillez sélectionner un espace pédagogique", "error");
      return;
    }

    try {
      // Envoyer l'assignation à l'API
      await axios.post(`${API_URL}/espace-pedagogique/assigner`, {
        espaceId: selectedEspaceId,
        formateurId: selectedFormateurId
      });
      
      showNotification("Formateur assigné avec succès !", "success");
      setShowAssignModal(false);
    } catch (error) {
      console.error("Erreur lors de l'assignation du formateur:", error);
      showNotification("Erreur lors de l'assignation du formateur", "error");
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#22c55e' : '#ef4444'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 2000;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.style.animation = 'slideOut 0.3s ease-out forwards';
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.parentNode.removeChild(messageDiv);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 300);
    }, 3000);
  };

  // =======================
  // RECHERCHE
  // =======================
  const filteredFormateurs = formateurs.filter(
    (f) =>
      f.utilisateur.nom.toLowerCase().includes(search.toLowerCase()) ||
      f.utilisateur.email.toLowerCase().includes(search.toLowerCase()) ||
      f.utilisateur.prenom.toLowerCase().includes(search.toLowerCase())
  );

  // =======================
  // FONCTION POUR RÉINITIALISER LE FORMULAIRE
  // =======================
  const resetForm = () => {
    setNom("");
    setPrenom("");
    setEmail("");
    setTelephone("");
    setSpecialite("JAVA");
    setActif(true);
  };

  // =======================
  // FONCTION POUR FERMER LE FORMULAIRE
  // =======================
  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  // =======================
  // AJOUT FORMATEUR
  // =======================
  const handleAddFormateur = async () => {
    if (!nom || !email) {
      showNotification('Veuillez valider tous les champs !', 'error');
      return;
    }
    
    const data = {
      nom,
      prenom,
      email,
      telephone,
      specialite,
    };

    try {
      const response = await axios.post(`${API_URL}/formateur`, data);
      
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
      
      // Refetch data
      const formateurResponse = await axios.get(`${API_URL}/formateur`);
      setFormateurs(formateurResponse.data);
      showNotification('Formateur ajouté avec succès !', 'success');
    } catch (error) {
      console.error("Erreur lors de l'ajout du formateur:", error);
      showNotification("Erreur lors de l'ajout du formateur", 'error');
    }

    // Reset formulaire et fermer
    resetForm();
    setShowForm(false);
  };

  // =======================
  // COMPOSANT MENU ACTIONS
  // =======================
  const ActionsMenu: React.FC<{ formateur: Formateur }> = ({ formateur }) => {
    const isOpen = openMenuId === formateur.id;
    const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, showAbove: false });

    const toggleMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      setOpenMenuId(isOpen ? null : formateur.id);
    };

    const handleAssign = (e: React.MouseEvent) => {
      e.stopPropagation();
      handleOpenAssignModal(formateur.id);
      setOpenMenuId(null);
    };

    const handleDelete = async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await axios.delete(`${API_URL}/formateur/${formateur.id}`);
        const response = await axios.get(`${API_URL}/formateur`);
        setFormateurs(response.data);
        showNotification('Formateur supprimé avec succès !', 'success');
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        showNotification("Erreur lors de la suppression", 'error');
      }
      setOpenMenuId(null);
    };

    // Calculer la position du menu
    React.useEffect(() => {
      if (isOpen && buttonRef) {
        const rect = buttonRef.getBoundingClientRect();
        const menuHeight = 100;
        const menuWidth = 160;
        
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Calculer la position optimale
        let top = rect.bottom + 4;
        let left = rect.right - menuWidth;
        let showAbove = false;
        
        // Si le menu dépasse en bas, l'afficher au-dessus
        if (top + menuHeight > viewportHeight && rect.top > menuHeight) {
          top = rect.top - menuHeight - 4;
          showAbove = true;
        }
        
        // Si le menu dépasse à droite, l'ajuster
        if (left < 0) {
          left = rect.left;
        }
        
        // Si le menu dépasse encore à droite
        if (left + menuWidth > viewportWidth) {
          left = viewportWidth - menuWidth - 10;
        }
        
        setMenuPosition({ top, left, showAbove });
      }
    }, [isOpen, buttonRef]);

    const MenuContent = () => (
      <div
        style={{
          position: 'fixed',
          top: menuPosition.top,
          left: menuPosition.left,
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          minWidth: '160px',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={handleAssign}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: 'none',
            background: 'transparent',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#374151',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <UserPlus size={16} color="#3b82f6" />
          Assigner
        </button>
        
        <button
          onClick={handleDelete}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: 'none',
            background: 'transparent',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#374151',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fef2f2';
            e.currentTarget.style.color = '#dc2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#374151';
          }}
        >
          <Trash2 size={16} color="#ef4444" />
          Supprimer
        </button>
      </div>
    );

    return (
      <div style={{ position: 'relative' }}>
        <button
          ref={setButtonRef}
          onClick={toggleMenu}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <MoreVertical size={16} color="#6b7280" />
        </button>

        {isOpen && (
          <>
            {/* Overlay pour fermer le menu en cliquant ailleurs */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999,
              }}
              onClick={() => setOpenMenuId(null)}
            />
            
            {/* Menu rendu dans un portail */}
            {createPortal(<MenuContent />, document.body)}
          </>
        )}
      </div>
    );
  };

  // =======================
  // COLONNES TABLEAU
  // =======================
  const columns: TableColumn<Formateur>[] = [
    {
      name: "Nom",
      selector: (row) => row.utilisateur.nom,
      sortable: true,
    },
    {
      name: "Prenom",
      selector: (row) => row.utilisateur.prenom,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.utilisateur.email,
    },
    {
      name: "Telephone",
      selector: (row) => row.utilisateur.telephone,
    },
    {
      name: "Spécialité",
      selector: (row) => row.specialite,
    },
    {
      name: "Statut",
      cell: (row) => (
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "12px",
            fontSize: "12px",
            backgroundColor: row.utilisateur.actif ? "#dcfce7" : "#fee2e2",
            color: row.utilisateur.actif ? "#166534" : "#991b1b",
          }}
        >
          {row.utilisateur.actif ? "Actif" : "Inactif"}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row) => <ActionsMenu formateur={row} />,
      ignoreRowClick: true,
      width: "80px",
      center: true,
    },
  ];

  // =======================
  // RENDER
  // =======================
  if (loading) {
    return (
      <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "20px", textAlign: "center" }}>
        <p>Chargement des formateurs...</p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: "1100px", 
      margin: "40px auto", 
      padding: "20px",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    }}>
      {/* TITRE + BOUTON */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 className="font-bold text-2xl">Gestion des Formateurs</h2>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: "#3b82f6",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "500",
            }}
          >
            <span style={{ fontSize: "18px" }}>+</span> Créer un formateur
          </button>
        )}
      </div>

      {/* FORMULAIRE AJOUT */}
      {showForm && (
        <div
          style={{
            marginBottom: "30px",
            padding: "20px",
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            position: "relative", // Pour positionner le bouton de fermeture
          }}
        >
          {/* BOUTON DE FERMETURE */}
          <button
            onClick={handleCloseForm}
            style={{
              position: "absolute",
              top: "15px",
              right: "15px",
              background: "transparent",
              border: "none",
              color: "#666",
              cursor: "pointer",
              fontSize: "20px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
              e.currentTarget.style.color = "#333";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#666";
            }}
            title="Fermer le formulaire"
          >
            ×
          </button>

          <h3 className="font-bold text-xl mb-4" style={{ paddingRight: "40px" }}>
            Ajouter un formateur
          </h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "15px" }}>
            <input
              placeholder="Nom *"
              value={nom}
              className="border border-gray-300"
              onChange={(e) => setNom(e.target.value)}
              style={{ 
                flex: "1 1 45%", 
                minWidth: "200px",
                padding: "10px", 
                borderRadius: "6px",
                border: "1px solid #d1d5db"
              }}
            />

            <input
              placeholder="Prénom *"
              value={prenom}
              className="border border-gray-300"
              onChange={(e) => setPrenom(e.target.value)}
              style={{ 
                flex: "1 1 45%", 
                minWidth: "200px",
                padding: "10px", 
                borderRadius: "6px",
                border: "1px solid #d1d5db"
              }}
            />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "15px" }}>
            <input
              placeholder="Email *"
              type="email"
              value={email}
              className="border border-gray-300"
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                flex: "1 1 45%", 
                minWidth: "200px",
                padding: "10px", 
                borderRadius: "6px",
                border: "1px solid #d1d5db"
              }}
            />

            <input
              placeholder="Téléphone"
              value={telephone}
              className="border border-gray-300"
              onChange={(e) => setTelephone(e.target.value)}
              style={{ 
                flex: "1 1 45%", 
                minWidth: "200px",
                padding: "10px", 
                borderRadius: "6px",
                border: "1px solid #d1d5db"
              }}
            />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "15px", alignItems: "center" }}>
            <select
              value={specialite}
              className="border border-gray-300"
              onChange={(e) => setSpecialite(e.target.value)}
              style={{ 
                flex: "1 1 45%", 
                minWidth: "200px",
                padding: "10px", 
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                backgroundColor: "white"
              }}
            >
              <option value="JAVA">Java</option>
              <option value="Formateur">Formateur</option>
              <option value="Responsable pédagogique">Responsable pédagogique</option>
              <option value="Python">Python</option>
              <option value="Web">Développement Web</option>
              <option value="Data">Data Science</option>
            </select>

            <label style={{ 
              display: "flex", 
              gap: "10px", 
              alignItems: "center",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              flex: "1 1 45%",
              minWidth: "200px"
            }}>
              <input
                type="checkbox"
                checked={actif}
                onChange={() => setActif(!actif)}
                style={{ width: "18px", height: "18px" }}
              />
              <span>Compte actif</span>
            </label>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              onClick={handleCloseForm}
              style={{
                background: "#f3f4f6",
                color: "#374151",
                padding: "10px 20px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e5e7eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
            >
              Annuler
            </button>
            <button
              onClick={handleAddFormateur}
              style={{
                background: "#22c55e",
                color: "#fff",
                padding: "10px 20px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#16a34a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#22c55e";
              }}
            >
              Enregistrer le formateur
            </button>
          </div>
        </div>
      )}

      {/* MODAL D'ASSIGNATION */}
      {showAssignModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            width: '500px',
            maxWidth: '90%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            position: 'relative',
          }}>
            {/* Bouton de fermeture pour la modal d'assignation */}
            <button
              onClick={() => setShowAssignModal(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '20px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#666';
              }}
              title="Fermer"
            >
              <X/>
            </button>
            
            <h3 style={{ marginBottom: '20px', color: '#333', paddingRight: '30px' }}>
              Assigner le formateur à un espace pédagogique
            </h3>
            
            {loadingEspaces ? (
              <p>Chargement des espaces pédagogiques...</p>
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Sélectionner un espace pédagogique :
                  </label>
                  <select
                    value={selectedEspaceId || ''}
                    onChange={(e) => setSelectedEspaceId(e.target.value ? Number(e.target.value) : null)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '14px',
                    }}
                  >
                    <option value="">-- Choisir un espace --</option>
                    {espacesPedagogiques.map((espace) => (
                      <option key={espace.id} value={espace.id}>
                        {espace.nom}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAssignFormateur}
                    disabled={!selectedEspaceId}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: selectedEspaceId ? '#3b82f6' : '#93c5fd',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: selectedEspaceId ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    Assigner
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TABLEAU */}
      <DataTable
        columns={columns}
        data={filteredFormateurs}
        pagination
        highlightOnHover
        fixedHeader
        fixedHeaderScrollHeight="400px" 
        subHeader
        subHeaderComponent={
          <input
            placeholder="Rechercher des formateurs..."
            value={search}
            className="border border-gray-300"
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              padding: "10px 12px", 
              width: "250px", 
              borderRadius: "6px",
              border: "1px solid #d1d5db"
            }}
          />
        }
        noDataComponent={<p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
          {search ? "Aucun formateur ne correspond à votre recherche" : "Aucun formateur trouvé"}
        </p>}
      />
    </div>
  );
};

export default Formateur;