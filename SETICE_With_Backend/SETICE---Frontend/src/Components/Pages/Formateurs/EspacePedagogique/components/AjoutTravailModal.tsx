import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Loader2 } from "lucide-react";
import { API_URL } from '../../../../../config/api';

interface AjoutTravailModalProps {
  show: boolean;
  onClose: () => void;
  espace: any;
  onSave?: (data: any) => Promise<any>;
  travaux?: any[];
  setTravaux?: React.Dispatch<React.SetStateAction<any[]>>;
}

const AjoutTravailModal: React.FC<AjoutTravailModalProps> = ({
  show,
  onClose,
  espace,
  onSave,
  travaux,
  setTravaux,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    type: "devoir",
    dateDebut: "",
    dateFin: "",
    points: 100,
  });

  const travailTypes = [
    { value: "devoir", label: "Devoir" },
    { value: "projet", label: "Projet" },
    { value: "examen", label: "Examen" },
    { value: "présentation", label: "Présentation" },
    { value: "quiz", label: "Quiz" },
    { value: "exercice", label: "Exercice" },
  ];

  // Fonction pour formater la date au format "05-12-2025"
  const formatDateInput = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Fonction pour parser la date du format "05-12-2025"
  // const parseDateInput = (dateString: string): Date => {
  //   const [day, month, year] = dateString.split('-').map(Number);
  //   return new Date(year, month - 1, day);
  // };

  useEffect(() => {
    if (show) {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      setFormData({
        titre: "",
        description: "",
        type: "devoir",
        dateDebut: formatDateInput(tomorrow),
        dateFin: formatDateInput(nextWeek),
        points: 100,
      });
    }
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        titre: formData.titre,
        description: formData.description,
        type: formData.type,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        points: formData.points,
      };

      console.log("Données envoyées au backend:", dataToSend);

      if (onSave) {
        // Nouvelle méthode avec onSave callback
        await onSave(dataToSend);
      } else {
        // Ancienne méthode (backward compatibility)
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_URL}/espace-pedagogique/${espace.id}/travaux`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(dataToSend),
          }
        );

        if (res.ok) {
          const newTravail = await res.json();
          if (travaux && setTravaux) {
            setTravaux([...travaux, newTravail]);
          }
        }
      }

      onClose();
    } catch (error) {
      console.error("Erreur création travail:", error);
      alert("Erreur lors de la création du travail");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />
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
                  Créer un nouveau travail
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {espace?.nom} • {espace?.matiere?.nom}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="space-y-6">
              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du travail *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titre}
                  onChange={(e) =>
                    setFormData({ ...formData, titre: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Ex: Devoir sur les fonctions trigonométriques"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Décrivez les consignes, les attentes et les critères d'évaluation..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de travail *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    {travailTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Points */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    required
                    value={formData.points}
                    onChange={(e) =>
                      setFormData({ ...formData, points: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date de début */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline mr-2" size={16} />
                    Date de début *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dateDebut}
                    onChange={(e) =>
                      setFormData({ ...formData, dateDebut: e.target.value })
                    }
                    pattern="\d{2}-\d{2}-\d{4}"
                    placeholder="JJ-MM-AAAA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    title="Format: JJ-MM-AAAA (ex: 05-12-2025)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: JJ-MM-AAAA
                  </p>
                </div>

                {/* Date de fin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline mr-2" size={16} />
                    Date de fin *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dateFin}
                    onChange={(e) =>
                      setFormData({ ...formData, dateFin: e.target.value })
                    }
                    pattern="\d{2}-\d{2}-\d{4}"
                    placeholder="JJ-MM-AAAA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    title="Format: JJ-MM-AAAA (ex: 15-12-2025)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: JJ-MM-AAAA
                  </p>
                </div>
              </div>

              {/* Aide pour le format de date */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Clock className="mr-2" size={16} />
                  Format des dates
                </h4>
                <p className="text-sm text-blue-700">
                  Utilisez le format <strong>JJ-MM-AAAA</strong> (ex: 05-12-2025)
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Le travail sera disponible du {formData.dateDebut} au {formData.dateFin}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !formData.dateDebut || !formData.dateFin}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Création...
                  </>
                ) : (
                  "Créer le travail"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AjoutTravailModal;