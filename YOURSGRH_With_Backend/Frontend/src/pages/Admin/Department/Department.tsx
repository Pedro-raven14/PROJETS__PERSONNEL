import { useEffect, useState } from "react";
import { Building2, Plus, Eye } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "../../../components/element/PageHeader";
import { Button } from "../../../components/UI/Button";
import { API_URL } from "../../../config/api";
import AjoutDepartement from "./AjoutDepartement";

type Equipe = {
  equipeId: number;
  nom: string;
  employes?: any[];
};

type Departement = {
  departId: number;
  nom: string;
  description: string;
  rendement: number;
  equipes: Equipe[];
};

const Department = () => {
  const [departments, setDepartments] = useState<Departement[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const navigate = useNavigate();

  // Détecter le rôle pour adapter les navigations
  const basePath = (() => {
    try { return JSON.parse(localStorage.getItem('employee') || 'null')?.role?.toLowerCase() === 'rh' ? '/rh' : '/admin'; }
    catch { return '/admin'; }
  })();

  const token = localStorage.getItem("token");

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/departement/getall`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // getall retourne { data, total, ... } avec pagination
      setDepartments(res.data.data ?? res.data);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  // Nombre total d'employés dans un département (somme des équipes)
  const countEmployes = (dept: Departement) =>
    dept.equipes.reduce((sum, eq) => sum + (eq.employes?.length ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Départements"
        subtitle={`${departments.length} département(s)`}
        actions={
          <Button onClick={() => setShowModal(true)}>
            <Plus style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
            Ajouter un département
          </Button>
        }
      />

      {/* Grille des départements */}
      {loading ? (
        <p style={{ color: 'var(--color-muted-foreground)', textAlign: 'center', padding: '2rem' }}>
          Chargement...
        </p>
      ) : departments.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Building2 style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 1rem', color: 'var(--color-muted-foreground)' }} />
          <p style={{ color: 'var(--color-muted-foreground)', margin: 0 }}>Aucun département créé</p>
          <Button style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>
            Créer le premier département
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {departments.map((dept) => {
            const nbEmployes = countEmployes(dept);
            return (
              <div key={dept.departId} className="stat-card">
                {/* En-tête */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem',
                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                    color: 'var(--color-primary)', flexShrink: 0,
                  }}>
                    <Building2 style={{ width: '18px', height: '18px' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{
                      margin: 0, fontFamily: 'var(--font-display)',
                      fontSize: '1rem', fontWeight: 600,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {dept.nom}
                    </h3>
                    {dept.description && (
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                        {dept.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>
                      {dept.equipes.length}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                      équipe(s)
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                      {nbEmployes}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                      employé(s)
                    </p>
                  </div>
                  {dept.rendement > 0 && (
                    <div>
                      <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-success)' }}>
                        {dept.rendement}%
                      </p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                        rendement
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate(`${basePath}/departments/${dept.departId}`)}
                  style={{
                    width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.375rem', padding: '0.4rem 0.75rem', borderRadius: '0.5rem',
                    border: '1px solid var(--color-border)', backgroundColor: 'transparent',
                    color: 'var(--color-foreground)', cursor: 'pointer',
                    fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.8125rem',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary-foreground)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-foreground)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
                  }}
                >
                  <Eye style={{ width: '14px', height: '14px' }} />
                  Consulter
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal — Ajouter un département */}
      {showModal && (
        <AjoutDepartement
          onClose={() => setShowModal(false)}
          onSuccess={fetchDepartments}
        />
      )}
    </div>
  );
};

export default Department;
