import React from 'react';
import { Edit2, Share2, MapPin, Calendar, BookOpen, Globe, Github} from 'lucide-react';

interface ProfileHeaderProps {
  etudiant: any;
  onEdit: () => void;
  onShare: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ etudiant, onEdit, onShare }) => {
  const generateColorFromInitials = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return "#" + (hash >>> 0).toString(16).padStart(6, "0").slice(0, 6);
  };

  const initials = `${etudiant.utilisateur.prenom?.charAt(0) || ''}${etudiant.utilisateur.nom?.charAt(0) || ''}`.toUpperCase();
  const color = generateColorFromInitials(initials);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-lg"
              style={{ 
                backgroundColor: `${color}20`, 
                color: color 
              }}
            >
              {initials}
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {etudiant.utilisateur.prenom} {etudiant.utilisateur.nom}
            </h1>
            <p className="text-gray-600 mb-1">Full-Stack Developer</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{etudiant.centre}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{etudiant.promotion.nom}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Matricule: <strong>{etudiant.matricule}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">•</span>
          <span>Niveau: <strong>{etudiant.niveau}</strong></span>
        </div>
        {etudiant.githubUrl && (
          <a 
            href={etudiant.githubUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
        )}
        {etudiant.portfolioUrl && (
          <a 
            href={etudiant.portfolioUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Globe className="w-4 h-4" />
            Portfolio
          </a>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;