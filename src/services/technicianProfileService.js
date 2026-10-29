import { INITIAL_TECHNICIANS } from '../data/mockData';

const STORAGE_KEY = 'blueprint_technicians_profiles_v1';

const getRelayProfilesUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RELAY_API_URL) {
    return `${import.meta.env.VITE_RELAY_API_URL.replace('/remote-support', '')}/profiles`;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5175/api/profiles';
  }
  return null;
};

class TechnicianProfileService {
  constructor() {
    this.listeners = new Set();
    this.broadcastChannel = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('blueprint_tech_profile_sync');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'TECH_PROFILES_UPDATED') {
            this.notifyListeners(event.data.profiles);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            this.notifyListeners(parsed);
          } catch {
            // Ignorar payload inválido
          }
        }
      });

      this.syncFromRelay();
    }
  }

  async syncFromRelay() {
    const relayUrl = getRelayProfilesUrl();
    if (!relayUrl) return;
    try {
      const res = await fetch(relayUrl);
      if (res.ok) {
        const remoteProfiles = await res.json();
        if (Array.isArray(remoteProfiles) && remoteProfiles.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteProfiles));
          this.notifyListeners(remoteProfiles);
        }
      }
    } catch {
      // Servidor relay opcional no activo
    }
  }

  async pushToRelay(profiles) {
    const relayUrl = getRelayProfilesUrl();
    if (!relayUrl) return;
    try {
      await fetch(relayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profiles })
      });
    } catch {
      // Servidor relay opcional no activo
    }
  }

  getProfiles() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading tech profiles:', e);
    }
    this.saveProfiles(INITIAL_TECHNICIANS);
    return INITIAL_TECHNICIANS;
  }

  saveProfiles(profiles) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'TECH_PROFILES_UPDATED', profiles });
      }
      this.pushToRelay(profiles);
      this.notifyListeners(profiles);
    } catch (e) {
      console.error('Error saving tech profiles:', e);
    }
    return profiles;
  }

  updateAvatar(techId, newAvatarUrl) {
    const profiles = this.getProfiles();
    const updated = profiles.map(t => {
      if (t.id === techId) {
        return { ...t, avatar: newAvatarUrl };
      }
      return t;
    });
    return this.saveProfiles(updated);
  }

  addPortfolioReference(techId, referenceData) {
    const profiles = this.getProfiles();
    const updated = profiles.map(t => {
      if (t.id === techId) {
        const newRef = {
          id: `ref-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title: referenceData.title || 'Trabajo Técnico Especializado',
          category: referenceData.category || 'Mantenimiento General',
          imageUrl: referenceData.imageUrl || '',
          description: referenceData.description || 'Detalle del procedimiento técnico ejecutado.',
          date: referenceData.date || new Date().toISOString().substring(0, 10)
        };
        const currentPortfolio = Array.isArray(t.portfolio) ? t.portfolio : [];
        return {
          ...t,
          portfolio: [newRef, ...currentPortfolio]
        };
      }
      return t;
    });
    return this.saveProfiles(updated);
  }

  removePortfolioReference(techId, referenceId) {
    const profiles = this.getProfiles();
    const updated = profiles.map(t => {
      if (t.id === techId && Array.isArray(t.portfolio)) {
        return {
          ...t,
          portfolio: t.portfolio.filter(r => r.id !== referenceId)
        };
      }
      return t;
    });
    return this.saveProfiles(updated);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners(profiles) {
    this.listeners.forEach(fn => {
      try {
        fn(profiles);
      } catch {
        // Ignorar error individual de suscriptor
      }
    });
  }
}

export const techProfileService = new TechnicianProfileService();
