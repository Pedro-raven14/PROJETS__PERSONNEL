import React, { useState, useEffect, useMemo, useCallback } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import { Trash2, Plus, Search, User, Mail, Calendar, BookOpen, GraduationCap, X, Check, Clock } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { API_URL } from '../../../../config/api';
import { useSearchParams } from 'react-router-dom';
import { useEmailService } from '../../../../hooks/useEmailService';

export interface Etudiant {
  id: number;
  matricule: string;
  centre: string;
  niveau: string;
  competences?: any;
  portfolioUrl?: string;
  githubUrl?: string;
  utilisateur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    actif: boolean;
    dateCreation: string;
    role: string;
  };
  promotion?: {
    id: number;
    anneeAcademique: string;
    filiere: string;
    options: string;
  };
  equipe?: {
    id: number;
    nom: string;
  };
}

export interface EtudiantFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  matricule: string;
  centre: string;
  niveau: string;
  competences?: any;
  portfolioUrl?: string;
  githubUrl?: string;
  promotionId?: number;
}

interface FiltreEtudiant {
  centre: string;
  niveau: string;
  actif: string;
  recherche: string;
}

const centres = ["Calavi", "Gbegamey", "Akpakpa", "Porto-novo", "Agla"];
const niveaux = ["1", "2", "3", "M1", "M2"];

// Service API réel pour les étudiants
const etudiantApiService = {
  async getAllEtudiants(): Promise<Etudiant[]> {
    try {
      console.log('Fetching students from:', `${API_URL}/etudiant`);
      const response = await axios.get<Etudiant[]>(`${API_URL}/etudiant`);
      console.log('Raw API response:', response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des étudiants:", error);
      if (axios.isAxiosError(error)) {
        console.error("Status:", error.response?.status);
        console.error("Data:", error.response?.data);
      }
      toast.error("Erreur lors du chargement des étudiants");
      throw error;
    }
  },

  async createEtudiant(etudiantData: EtudiantFormData): Promise<{ message: string; credentials?: { email: string; password: string; nom: string; prenom: string } }> {
    try {
      console.log('Sending student data:', etudiantData);
      console.log('API URL:', `${API_URL}/etudiant`);
      
      const response = await axios.post(`${API_URL}/etudiant`, etudiantData);
      console.log('Student creation response:', response.data);
      
      // Le backend devrait retourner les identifiants
      const { user, generatedPassword } = response.data;
      
      if (user && generatedPassword) {
        return {
          message: "Étudiant créé avec succès",
          credentials: {
            email: user.email,
            password: generatedPassword,
            nom: user.nom,
            prenom: user.prenom
          }
        };
      }
      
      return { message: "Étudiant créé avec succès" };
    } catch (error) {
      console.error("Erreur lors de la création de l'étudiant:", error);
      
      if (axios.isAxiosError(error)) {
        console.error("Status:", error.response?.status);
        console.error("Error data:", error.response?.data);
        
        // Messages d'erreur plus spécifiques
        if (error.response?.status === 409) {
          toast.error("Cet email ou matricule est déjà utilisé");
        } else if (error.response?.status === 400) {
          toast.error("Données invalides. Vérifiez les champs requis.");
        } else {
          toast.error(`Erreur ${error.response?.status}: ${error.response?.data?.message || 'Erreur lors de la création'}`);
        }
      } else {
        toast.error("Erreur lors de la création de l'étudiant");
      }
      
      throw error;
    }
  },

  async deleteEtudiant(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/etudiant/${id}`);
      toast.success("Étudiant supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'étudiant:", error);
      toast.error("Erreur lors de la suppression de l'étudiant");
      throw error;
    }
  }
};

/* ========================= ETUDIANT MODAL ========================= */
interface EtudiantModalProps {
  show: boolean;
  etudiant: Etudiant | null;
  onClose: () => void;
  onSubmit: (data: EtudiantFormData) => Promise<void>;
  isSubmitting: boolean;
  isEmailLoading?: boolean;
}

const EtudiantModal: React.FC<EtudiantModalProps> = ({
  show,
  etudiant,
  onClose,
  onSubmit,
  isSubmitting,
  isEmailLoading = false,
}) => {
  const [form, setForm] = useState<EtudiantFormData>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    matricule: "",
    centre: "",
    niveau: "",
    competences: null,
    portfolioUrl: "",
    githubUrl: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (etudiant) {
      setForm({
        nom: etudiant.utilisateur.nom,
        prenom: etudiant.utilisateur.prenom,
        email: etudiant.utilisateur.email,
        telephone: etudiant.utilisateur.telephone || "",
        matricule: etudiant.matricule,
        centre: etudiant.centre,
        niveau: etudiant.niveau,
        competences: etudiant.competences,
        portfolioUrl: etudiant.portfolioUrl || "",
        githubUrl: etudiant.githubUrl || "",
      });
    } else {
      setForm({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        matricule: "",
        centre: "",
        niveau: "",
        competences: null,
        portfolioUrl: "",
        githubUrl: "",
      });
    }
    setErrors({});
  }, [etudiant]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validation des champs requis
    if (!form.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!form.prenom.trim()) newErrors.prenom = "Le prénom est requis";
    
    // Validation email
    if (!form.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email invalide";
    }
    
    // Validation matricule
    if (!form.matricule.trim()) {
      newErrors.matricule = "Le matricule est requis";
    } else if (form.matricule.length < 3) {
      newErrors.matricule = "Le matricule doit contenir au moins 3 caractères";
    }
    
    // Validation centre et niveau
    if (!form.centre) newErrors.centre = "Le centre est requis";
    if (!form.niveau) newErrors.niveau = "Le niveau est requis";
    
    // Validation téléphone (optionnel mais format si fourni)
    if (form.telephone && form.telephone.trim() && !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(form.telephone)) {
      newErrors.telephone = "Format de téléphone invalide";
    }
    
    // Validation URLs (optionnelles mais format si fournies)
    if (form.portfolioUrl && form.portfolioUrl.trim() && !/^https?:\/\/.+/.test(form.portfolioUrl)) {
      newErrors.portfolioUrl = "L'URL du portfolio doit commencer par http:// ou https://";
    }
    
    if (form.githubUrl && form.githubUrl.trim() && !/^https?:\/\/.+/.test(form.githubUrl)) {
      newErrors.githubUrl = "L'URL GitHub doit commencer par http:// ou https://";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }
    
    try {
      await onSubmit(form);
    } catch (error) {
      // L'erreur est déjà gérée par le service
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              {etudiant ? "Modifier" : "Ajouter"} un étudiant
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                placeholder="Dupont"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.nom ? 'border-red-500' : 'border-gray-300'
                }`}
                value={form.nom}
                onChange={(e) => {
                  setForm({ ...form, nom: e.target.value });
                  if (errors.nom) setErrors({ ...errors, nom: '' });
                }}
                required
              />
              {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                placeholder="Jean"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.prenom ? 'border-red-500' : 'border-gray-300'
                }`}
                value={form.prenom}
                onChange={(e) => {
                  setForm({ ...form, prenom: e.target.value });
                  if (errors.prenom) setErrors({ ...errors, prenom: '' });
                }}
                required
              />
              {errors.prenom && <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                placeholder="jean.dupont@email.com"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                required
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                placeholder="+221 77 123 45 67"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.telephone ? 'border-red-500' : 'border-gray-300'
                }`}
                value={form.telephone}
                onChange={(e) => {
                  setForm({ ...form, telephone: e.target.value });
                  if (errors.telephone) setErrors({ ...errors, telephone: '' });
                }}
              />
              {errors.telephone && <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matricule *
              </label>
              <input
                placeholder="ETU2024001"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.matricule ? 'border-red-500' : 'border-gray-300'
                }`}
                value={form.matricule}
                onChange={(e) => {
                  setForm({ ...form, matricule: e.target.value });
                  if (errors.matricule) setErrors({ ...errors, matricule: '' });
                }}
                required
              />
              {errors.matricule && <p className="mt-1 text-sm text-red-600">{errors.matricule}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Centre *
              </label>
              <select
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.centre ? 'border-red-500' : 'border-gray-300'
                }`}
                value={form.centre}
                onChange={(e) => {
                  setForm({ ...form, centre: e.target.value });
                  if (errors.centre) setErrors({ ...errors, centre: '' });
                }}
                required
              >
                <option value="">Sélectionner un centre</option>
                {centres.map((centre) => (
                  <option key={centre} value={centre}>{centre}</option>
                ))}
              </select>
              {errors.centre && <p className="mt-1 text-sm text-red-600">{errors.centre}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau *
              </label>
              <select
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.niveau ? 'border-red-500' : 'border-gray-300'
                }`}
                value={form.niveau}
                onChange={(e) => {
                  setForm({ ...form, niveau: e.target.value });
                  if (errors.niveau) setErrors({ ...errors, niveau: '' });
                }}
                required
              >
                <option value="">Sélectionner un niveau</option>
                {niveaux.map((niveau) => (
                  <option key={niveau} value={niveau}>{niveau}</option>
                ))}
              </select>
              {errors.niveau && <p className="mt-1 text-sm text-red-600">{errors.niveau}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Portfolio
              </label>
              <input
                placeholder="https://monportfolio.com"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.portfolioUrl ? 'border-red-500' : 'border-gray-300'
                }`}
                value={form.portfolioUrl}
                onChange={(e) => {
                  setForm({ ...form, portfolioUrl: e.target.value });
                  if (errors.portfolioUrl) setErrors({ ...errors, portfolioUrl: '' });
                }}
              />
              {errors.portfolioUrl && <p className="mt-1 text-sm text-red-600">{errors.portfolioUrl}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL GitHub
              </label>
              <input
                placeholder="https://github.com/username"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.githubUrl ? 'border-red-500' : 'border-gray-300'
                }`}
                value={form.githubUrl}
                onChange={(e) => {
                  setForm({ ...form, githubUrl: e.target.value });
                  if (errors.githubUrl) setErrors({ ...errors, githubUrl: '' });
                }}
              />
              {errors.githubUrl && <p className="mt-1 text-sm text-red-600">{errors.githubUrl}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || isEmailLoading}
            >
              {isSubmitting || isEmailLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {isEmailLoading ? "Envoi email..." : etudiant ? "Mise à jour..." : "Création..."}
                </span>
              ) : etudiant ? (
                "Mettre à jour"
              ) : (
                "Ajouter l'étudiant"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================= PAGE PRINCIPALE ========================= */
const Etudiant = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [filteredEtudiants, setFilteredEtudiants] = useState<Etudiant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<Etudiant[]>([]);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedEtudiant, setSelectedEtudiant] = useState<Etudiant | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState<FiltreEtudiant>({
    centre: '',
    niveau: '',
    actif: '',
    recherche: ''
  });

  // Hook pour l'envoi d'emails
  const { sendCredentials, isLoading: isEmailLoading } = useEmailService();

  // Vérifier les paramètres URL pour ouvrir automatiquement le modal
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      setSelectedEtudiant(null);
      setShowModal(true);
      // Nettoyer le paramètre URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    actifs: 0,
    inactifs: 0,
    parCentre: {} as Record<string, number>,
    parNiveau: {} as Record<string, number>,
  });

  const loadEtudiants = useCallback(async () => {
    setIsLoading(true);
    try {
      const etudiantsData = await etudiantApiService.getAllEtudiants();
      
      // Debug: Log the API response
      console.log('API Response:', etudiantsData);
      console.log('Number of students:', etudiantsData.length);
      if (etudiantsData.length > 0) {
        console.log('First student structure:', etudiantsData[0]);
      }
      
      setEtudiants(etudiantsData);
      setFilteredEtudiants(etudiantsData);
      
      // Calculer les statistiques
      const total = etudiantsData.length;
      const actifs = etudiantsData.filter(e => e.utilisateur.actif).length;
      const inactifs = etudiantsData.filter(e => !e.utilisateur.actif).length;
      
      const parCentre: Record<string, number> = {};
      const parNiveau: Record<string, number> = {};
      
      etudiantsData.forEach(etudiant => {
        parCentre[etudiant.centre] = (parCentre[etudiant.centre] || 0) + 1;
        parNiveau[etudiant.niveau] = (parNiveau[etudiant.niveau] || 0) + 1;
      });
      
      setStats({
        total,
        actifs,
        inactifs,
        parCentre,
        parNiveau,
      });
      
      toast.success(`${total} étudiants chargés avec succès`);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast.error("Erreur lors du chargement des étudiants");
      // En cas d'erreur, initialiser avec des données vides
      setEtudiants([]);
      setFilteredEtudiants([]);
      setStats({
        total: 0,
        actifs: 0,
        inactifs: 0,
        parCentre: {},
        parNiveau: {},
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEtudiants();
  }, [loadEtudiants]);

  // Appliquer les filtres
  useEffect(() => {
    let result = [...etudiants];

    if (filters.recherche) {
      const recherche = filters.recherche.toLowerCase();
      result = result.filter(e =>
        e.utilisateur.nom.toLowerCase().includes(recherche) ||
        e.utilisateur.prenom.toLowerCase().includes(recherche) ||
        e.utilisateur.email.toLowerCase().includes(recherche) ||
        e.matricule.toLowerCase().includes(recherche) ||
        e.centre.toLowerCase().includes(recherche)
      );
    }

    if (filters.centre) {
      result = result.filter(e => e.centre === filters.centre);
    }

    if (filters.niveau) {
      result = result.filter(e => e.niveau === filters.niveau);
    }

    if (filters.actif) {
      const isActif = filters.actif === 'true';
      result = result.filter(e => e.utilisateur.actif === isActif);
    }

    setFilteredEtudiants(result);
    setToggleCleared(false);
  }, [filters, etudiants]);

  const handleSubmit = async (data: EtudiantFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedEtudiant) {
        // Pour la mise à jour, vous devrez implémenter l'endpoint PUT
        toast.error("Mise à jour non implémentée côté backend");
      } else {
        const result = await etudiantApiService.createEtudiant(data);
        toast.success(result.message);
        
        // Si des identifiants sont retournés, envoyer l'email
        if (result.credentials) {
          console.log('Envoi des identifiants par email...');
          await sendCredentials(result.credentials);
        }
      }
      
      await loadEtudiants();
      setShowModal(false);
      setSelectedEtudiant(null);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await etudiantApiService.deleteEtudiant(id);
      await loadEtudiants();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleRowSelected = useCallback((state: { selectedRows: Etudiant[] }) => {
    setSelectedRows(state.selectedRows);
  }, []);

  const columns = useMemo<TableColumn<Etudiant>[]>(
    () => [
      {
        name: "Matricule",
        selector: (row) => row.matricule,
        sortable: true,
        width: "120px",
        cell: (row) => (
          <span className="font-mono text-sm font-medium text-gray-700">{row.matricule}</span>
        )
      },
      {
        name: "Étudiant",
        cell: (row) => (
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-2 rounded-xl mr-3">
              <User size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {row.utilisateur.prenom} {row.utilisateur.nom}
              </div>
              <div className="text-sm text-gray-500 flex items-center mt-1">
                <Mail size={14} className="mr-1.5" />
                {row.utilisateur.email}
              </div>
            </div>
          </div>
        ),
        sortable: true,
        sortFunction: (a, b) => `${a.utilisateur.prenom} ${a.utilisateur.nom}`.localeCompare(`${b.utilisateur.prenom} ${b.utilisateur.nom}`),
        minWidth: "250px"
      },
      {
        name: "Centre",
        selector: (row) => row.centre,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center">
            <BookOpen size={16} className="mr-2.5 text-gray-400" />
            <span className="font-medium">{row.centre}</span>
          </div>
        ),
        width: "150px"
      },
      {
        name: "Niveau",
        selector: (row) => row.niveau,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center">
            <div className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-full text-sm font-medium">
              {row.niveau}
            </div>
          </div>
        ),
        width: "110px"
      },
      {
        name: "Statut",
        selector: (row) => row.utilisateur.actif,
        sortable: true,
        cell: (row) => {
          let className = "px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5";
          if (row.utilisateur.actif) {
            className += " bg-gradient-to-r from-green-100 to-green-50 text-green-700";
            return (
              <span className={className}>
                <Check size={14} />
                Actif
              </span>
            );
          } else {
            className += " bg-gradient-to-r from-red-100 to-red-50 text-red-700";
            return (
              <span className={className}>
                <Clock size={14} />
                Inactif
              </span>
            );
          }
        },
        width: "120px"
      },
      {
        name: "Date d'inscription",
        selector: (row) => row.utilisateur.dateCreation,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center text-sm">
            <Calendar size={14} className="mr-2.5 text-gray-400" />
            {new Date(row.utilisateur.dateCreation).toLocaleDateString('fr-FR')}
          </div>
        ),
        width: "150px"
      },
      {
        name: "Actions",
        cell: (row) => (
          <div className="relative">
            <button
              onClick={() => handleDelete(row.id)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
        ignoreRowClick: true,
        width: "80px",
        center: true
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* En-tête avec statistiques */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-3 rounded-2xl mr-4 shadow-md">
              <GraduationCap size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestion des étudiants</h1>
              <p className="text-gray-600 mt-1">
                {filteredEtudiants.length} étudiant{filteredEtudiants.length > 1 ? 's' : ''} trouvé{filteredEtudiants.length > 1 ? 's' : ''}
                {selectedRows.length > 0 && ` • ${selectedRows.length} sélectionné${selectedRows.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setSelectedEtudiant(null);
                setShowModal(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-medium flex items-center gap-2 shadow-md"
            >
              <Plus size={20} />
              <span className="hidden md:inline">Nouvel étudiant</span>
              <span className="md:hidden">Ajouter</span>
            </button>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total étudiants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <User size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Étudiants actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats.actifs}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Check size={20} className="text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Étudiants inactifs</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactifs}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <Clock size={20} className="text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Centres</p>
                <p className="text-2xl font-bold text-purple-600">{Object.keys(stats.parCentre).length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <BookOpen size={20} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="mb-6 space-y-4">
        {/* Barre de recherche */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un étudiant par nom, prénom, email, matricule..."
            className="w-full px-5 py-3.5 pl-14 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            value={filters.recherche}
            onChange={(e) => setFilters({ ...filters, recherche: e.target.value })}
          />
          <Search size={22} className="absolute left-5 top-3.5 text-gray-400" />
          {filters.recherche && (
            <button
              onClick={() => setFilters({ ...filters, recherche: '' })}
              className="absolute right-5 top-3.5 text-gray-400 hover:text-gray-600"
            >
              <X size={22} />
            </button>
          )}
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Centre</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.centre}
              onChange={(e) => setFilters({ ...filters, centre: e.target.value })}
            >
              <option value="">Tous les centres</option>
              {centres.map((centre) => (
                <option key={centre} value={centre}>{centre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.niveau}
              onChange={(e) => setFilters({ ...filters, niveau: e.target.value })}
            >
              <option value="">Tous les niveaux</option>
              {niveaux.map((niveau) => (
                <option key={niveau} value={niveau}>{niveau}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.actif}
              onChange={(e) => setFilters({ ...filters, actif: e.target.value })}
            >
              <option value="">Tous les statuts</option>
              <option value="true">Actifs</option>
              <option value="false">Inactifs</option>
            </select>
          </div>
        </div>

        {/* Indicateur de filtres actifs */}
        {(filters.centre || filters.niveau || filters.actif || filters.recherche) && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Filtres actifs:</span>
            {filters.recherche && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                Recherche: "{filters.recherche}"
                <button onClick={() => setFilters({ ...filters, recherche: '' })}>
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.centre && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                Centre: {filters.centre}
                <button onClick={() => setFilters({ ...filters, centre: '' })}>
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.niveau && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1">
                Niveau: {filters.niveau}
                <button onClick={() => setFilters({ ...filters, niveau: '' })}>
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.actif && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-1">
                Statut: {filters.actif === 'true' ? 'Actifs' : 'Inactifs'}
                <button onClick={() => setFilters({ ...filters, actif: '' })}>
                  <X size={14} />
                </button>
              </span>
            )}
            <button
              onClick={() => setFilters({ centre: '', niveau: '', actif: '', recherche: '' })}
              className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200 transition-colors"
            >
              Effacer tous les filtres
            </button>
          </div>
        )}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              <GraduationCap size={24} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600" />
            </div>
            <p className="mt-6 text-lg text-gray-600">Chargement des étudiants...</p>
            <p className="text-sm text-gray-400 mt-2">Veuillez patienter quelques instants</p>
          </div>
        ) : filteredEtudiants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl p-8 mb-6">
              <GraduationCap size={64} className="text-gray-300 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {etudiants.length === 0 ? "Aucun étudiant dans la base de données" : "Aucun étudiant trouvé avec ces filtres"}
            </h3>
            <p className="text-gray-500 max-w-md mb-8">
              {etudiants.length === 0 
                ? "Commencez par ajouter votre premier étudiant pour gérer votre liste."
                : "Essayez de modifier vos critères de recherche ou effacez les filtres."
              }
            </p>
            {etudiants.length === 0 ? (
              <button
                onClick={() => setShowModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-medium flex items-center gap-2"
              >
                <Plus size={20} />
                Ajouter un étudiant
              </button>
            ) : (
              <button
                onClick={() => setFilters({ centre: '', niveau: '', actif: '', recherche: '' })}
                className="px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-lg hover:from-gray-700 hover:to-gray-600 transition-all font-medium flex items-center gap-2"
              >
                <X size={20} />
                Effacer tous les filtres
              </button>
            )}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredEtudiants}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[5, 10, 15, 20]}
            paginationComponentOptions={{
              rowsPerPageText: 'Lignes par page:',
              rangeSeparatorText: 'sur',
              noRowsPerPage: false,
              selectAllRowsItem: false,
            }}
            highlightOnHover
            responsive
            selectableRows
            selectableRowsHighlight
            selectableRowsVisibleOnly
            onSelectedRowsChange={handleRowSelected}
            clearSelectedRows={toggleCleared}
            noDataComponent={<div className="p-8 text-center text-gray-500">Aucune donnée disponible</div>}
            progressPending={isLoading}
            customStyles={{
              table: {
                style: {
                  backgroundColor: 'transparent',
                },
              },
              headRow: {
                style: {
                  backgroundColor: '#f9fafb',
                  borderBottomWidth: '1px',
                  borderBottomColor: '#e5e7eb',
                },
              },
              headCells: {
                style: {
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  paddingTop: '1rem',
                  paddingBottom: '1rem',
                  paddingLeft: '1.5rem',
                  paddingRight: '1.5rem',
                },
              },
              rows: {
                style: {
                  backgroundColor: 'transparent',
                  '&:not(:last-of-type)': {
                    borderBottomWidth: '1px',
                    borderBottomStyle: 'solid',
                    borderBottomColor: '#f3f4f6',
                  },
                  '&:hover': {
                    backgroundColor: '#f9fafb',
                  },
                },
                selectedHighlightStyle: {
                  backgroundColor: '#eff6ff',
                },
              },
              cells: {
                style: {
                  paddingTop: '1rem',
                  paddingBottom: '1rem',
                  paddingLeft: '1.5rem',
                  paddingRight: '1.5rem',
                },
              },
              pagination: {
                style: {
                  backgroundColor: '#f9fafb',
                  borderTopWidth: '1px',
                  borderTopColor: '#e5e7eb',
                  padding: '1rem 1.5rem',
                },
              },
            }}
          />
        )}
      </div>

      {/* Modal */}
      <EtudiantModal
        show={showModal}
        etudiant={selectedEtudiant}
        onClose={() => {
          setShowModal(false);
          setSelectedEtudiant(null);
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEmailLoading={isEmailLoading}
      />
    </div>
  );
};

export default Etudiant;