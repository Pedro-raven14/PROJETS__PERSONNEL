import { useState, useEffect } from 'react';
import { X, Hash, Lock } from 'lucide-react';
import api from '../../Config/api';

const CreateRoomModal = ({ onClose, onRoomCreated }) => {
  const [name, setName]           = useState('');
  const [description, setDesc]    = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleNameChange = (e) => {
    setName(e.target.value.toLowerCase().replace(/\s+/g, '-'));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Le nom du salon est requis.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/rooms', {
        name: name.trim(),
        description: description.trim() || undefined,
        isPrivate,
      });
      onRoomCreated(data);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Carte */}
      <div
        className="w-full rounded-2xl"
        style={{
          maxWidth: 440,
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          padding: 24,
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
            Créer un salon
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md flex items-center justify-center transition-colors"
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Nom du salon */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--color-text-secondary)' }}>
              Nom du salon
            </label>
            <div
              className="flex items-center gap-2 rounded-lg px-3"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1.5px solid var(--color-border)',
              }}
            >
              <Hash size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="mon-salon"
                maxLength={50}
                autoFocus
                style={{
                  flex: 1,
                  padding: '11px 0',
                  fontSize: 14,
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Minuscules, chiffres et tirets uniquement.
            </p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--color-text-secondary)' }}>
              Description{' '}
              <span className="normal-case font-normal" style={{ color: 'var(--color-text-muted)' }}>(optionnel)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDesc(e.target.value)}
              placeholder="De quoi parle ce salon ?"
              maxLength={200}
              className="rounded-lg px-4"
              style={{
                padding: '11px 14px',
                fontSize: 14,
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1.5px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          {/* Toggle Salon privé */}
          <div
            className="flex items-center justify-between rounded-xl cursor-pointer transition-colors"
            onClick={() => setIsPrivate(!isPrivate)}
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--color-bg-tertiary)',
              border: `1.5px solid ${isPrivate ? 'var(--color-accent)' : 'var(--color-border)'}`,
            }}
          >
            <div className="flex items-center gap-3">
              <Lock size={15} style={{ color: isPrivate ? 'var(--color-accent)' : 'var(--color-text-muted)', flexShrink: 0 }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Salon privé</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Seuls les invités peuvent voir ce salon</p>
              </div>
            </div>
            {/* Toggle switch */}
            <div
              className="flex-shrink-0 rounded-full relative transition-colors"
              style={{
                width: 40, height: 22,
                backgroundColor: isPrivate ? 'var(--color-accent)' : 'var(--color-bg-active)',
              }}
            >
              <div
                className="absolute top-0.5 rounded-full bg-white transition-transform"
                style={{
                  width: 16, height: 16,
                  transform: isPrivate ? 'translateX(20px)' : 'translateX(3px)',
                }}
              />
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <p
              className="text-sm px-3.5 py-2.5 rounded-lg"
              style={{
                backgroundColor: 'rgba(225,112,85,0.15)',
                border: '1px solid rgba(225,112,85,0.3)',
                color: 'var(--color-danger)',
              }}
            >
              {error}
            </p>
          )}

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{
                border: 'none',
                backgroundColor: 'var(--color-bg-hover)',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-active)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{
                border: 'none',
                backgroundColor: !name.trim() || loading ? 'var(--color-text-muted)' : 'var(--color-accent)',
                cursor: !name.trim() || loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => name.trim() && !loading && (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
              onMouseLeave={e => name.trim() && !loading && (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
            >
              {loading ? 'Création...' : 'Créer le salon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
