import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as yup from "yup";
import { X, Loader2, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { API_URL } from '../../../../../config/api';

interface AjoutEspaceModalProps {
  show: boolean;
  onClose: () => void;
  onEspaceAdded?: () => void;
}

function AjoutEspaceModal({ show, onClose, onEspaceAdded }: AjoutEspaceModalProps) {
  const schema = yup.object().shape({
    nom: yup.string().required("Le nom est requis").max(25, "Maximum 25 caractères"),
    matiere: yup.string().required("La matière est requise").max(100, "Maximum 100 caractères"),
    description: yup.string().required("La description est requise").max(255, "Maximum 255 caractères"),
    filiere: yup.string().required("La filiere est requise").max(255, "Maximum 255 caractères"),
    options: yup.string().required("L'option est requise").max(255, "Maximum 255 caractères"),
    anneeAcademique: yup.string().required("L'anneeAcademique est requise").max(255, "Maximum 255 caractères"),
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nom: "",
      matiere: "",
      description: "",
      filiere: "",
      options: "",
      anneeAcademique: "",
    },
  });

  // CORRECTION ICI : Utiliser des valeurs par défaut pour éviter undefined
  const watchNom = watch("nom") || "";
  const watchMatiere = watch("matiere") || "";
  const watchDescription = watch("description") || "";

  // Matière autocomplete
  const DEFAULT_MATIERES = [
    "Mathématiques",
    "Physique",
    "Chimie",
    "Français",
    "Histoire",
    "Géographie",
    "Informatique",
    "Biologie",
    "Économie",
    "Anglais",
    "Espagnol",
    "Philosophie",
    "Arts Plastiques",
    "Musique",
    "Technologie",
    "Sciences de la Vie et de la Terre",
  ];

  const [filteredMatieres, setFilteredMatieres] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const q = watchMatiere.trim();
    if (!q) {
      setFilteredMatieres([]);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      return;
    }
    const filtered = DEFAULT_MATIERES.filter((m) => 
      m.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 8);
    setFilteredMatieres(filtered);
    setShowSuggestions(filtered.length > 0);
    setHighlightedIndex(-1);
  }, [watchMatiere]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleSelectSuggestion = (value: string) => {
    setValue("matiere", value, { shouldValidate: true, shouldDirty: true });
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleMatiereKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredMatieres.length === 0) {
      if (e.key === "ArrowDown" && filteredMatieres.length > 0) {
        setShowSuggestions(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    const len = filteredMatieres.length;
    if (e.key === "ArrowDown") {
      setHighlightedIndex((i) => (i + 1 + len) % len);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((i) => (i - 1 + len) % len);
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < len) {
        handleSelectSuggestion(filteredMatieres[highlightedIndex]);
        e.preventDefault();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      e.preventDefault();
    }
  };

  const ajouterEspace = async (data: any) => {
    setError("");
    try {
      await axios.post(
        `${API_URL}/espace-pedagogique`,
        {
          nom: data.nom,
          matiere: data.matiere,
          description: data.description,
          filiere: data.filiere,
          options: data.options,
          anneeAcademique: data.anneeAcademique,
        }
      );
      setSuccess("Espace pédagogique ajouté avec succès");
      setTimeout(() => {
        setSuccess("");
        if (onEspaceAdded) onEspaceAdded();
        reset();
        onClose();
      }, 900);
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message || "Erreur d'enregistrement de l'espace pédagogique";
      setError(serverMessage);
    }
  };

  const handleCancel = () => {
    reset();
    setError("");
    setSuccess("");
    onClose();
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Ajouter un espace pédagogique
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Remplissez les informations pour créer un nouvel espace
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-140px)]">
            <form onSubmit={handleSubmit(ajouterEspace)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'espace *
                  </label>
                  <input
                    type="text"
                    maxLength={25}
                    {...register("nom")}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                      errors.nom ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Nom de l'espace"
                  />
                  <div className="flex justify-between mt-1">
                    {errors.nom && (
                      <p className="text-red-600 text-sm">{errors.nom.message}</p>
                    )}
                    <span className="text-gray-500 text-sm">
                      {watchNom.length}/25
                    </span>
                  </div>
                </div>

                {/* Matière */}
                <div className="relative" ref={suggestionsRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matière *
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    {...register("matiere")}
                    onKeyDown={handleMatiereKeyDown}
                    autoComplete="off"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                      errors.matiere ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Sélectionnez ou saisissez une matière"
                  />
                  
                  {/* Suggestions */}
                  {showSuggestions && filteredMatieres.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredMatieres.map((m, idx) => (
                        <div
                          key={m}
                          className={`px-4 py-3 cursor-pointer transition-colors ${
                            highlightedIndex === idx
                              ? "bg-blue-50 text-blue-700"
                              : "hover:bg-gray-50 text-gray-900"
                          }`}
                          onMouseDown={() => handleSelectSuggestion(m)}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                        >
                          {m}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-1">
                    {errors.matiere && (
                      <p className="text-red-600 text-sm">{errors.matiere.message}</p>
                    )}
                    <span className="text-gray-500 text-sm">
                      {watchMatiere.length}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Filière, Option, Année */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filière
                  </label>
                  <input
                    type="text"
                    {...register('filiere')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Ex: Informatique"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Option
                  </label>
                  <input
                    type="text"
                    {...register('options')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Ex: Développement Web"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année académique
                  </label>
                  <input
                    type="text"
                    {...register('anneeAcademique')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="2024-2025"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  rows={3}
                  maxLength={255}
                  {...register("description")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none ${
                    errors.description ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Brève description de l'espace (objectifs, contenu, etc.)"
                />
                <div className="flex justify-between mt-1">
                  {errors.description && (
                    <p className="text-red-600 text-sm">{errors.description.message}</p>
                  )}
                  <span className="text-gray-500 text-sm">
                    {watchDescription.length}/255
                  </span>
                </div>
              </div>

              {/* Messages d'erreur/succès */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-700">
                    <Check size={16} className="mr-2" />
                    <span className="text-sm">{success}</span>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-gray-200 my-6" />

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default AjoutEspaceModal;