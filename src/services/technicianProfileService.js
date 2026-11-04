import { INITIAL_TECHNICIANS, OFFICIAL_PHONE_DISPLAY } from '../data/mockData';
import { supabaseRest, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'blueprint_technicians_profiles_v2';

const normalizePhones = (profiles) =>
  (profiles || []).map(p => ({
    ...p,
    phone: OFFICIAL_PHONE_DISPLAY
  }));

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
            this.notifyListeners(normalizePhones(event.data.profiles));
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
            this.notifyListeners(normalizePhones(parsed));
          } catch {
            // Ignorar payload inválido
          }
        }
      });

      this.syncRemoteProfiles();
    }
  }

  async syncRemoteProfiles() {
    if (isSupabaseConfigured()) {
      try {
        const rows = await supabaseRest.select('technicians', 'select=id,avatar,portfolio&order=id.asc');
        if (Array.isArray(rows) && rows.length > 0) {
          const base = this.getProfiles();
          const merged = base.map(t => {
            const remote = rows.find(r => r.id === t.id);
            if (!remote) return { ...t, phone: OFFICIAL_PHONE_DISPLAY };
            return {
              ...t,
              phone: OFFICIAL_PHONE_DISPLAY,
              avatar: remote.avatar ? remote.avatar : t.avatar,
              portfolio: Array.isArray(remote.portfolio) && remote.portfolio.length > 0 ? remote.portfolio : t.portfolio
            };
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          this.notifyListeners(merged);
          return;
        }
      } catch {
        // Si Supabase aún no tiene datos, probar relay local
      }
    }

    const relayUrl = getRelayProfilesUrl();
    if (!relayUrl) return;
    try {
      const res = await fetch(relayUrl);
      if (res.ok) {
        const remoteProfiles = await res.json();
        if (Array.isArray(remoteProfiles) && remoteProfiles.length > 0) {
          const normalized = normalizePhones(remoteProfiles);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
          this.notifyListeners(normalized);
        }
      }
    } catch {
      // Servidor relay opcional no activo
    }
  }

  async pushRemoteProfiles(profiles) {
    const normalized = normalizePhones(profiles);

    if (isSupabaseConfigured()) {
      try {
        const rows = normalized.map(t => ({
          id: t.id,
          name: t.name,
          title: t.title,
          node_badge: t.nodeBadge || t.vehicle || 'Nodo QuintoNodo',
          phone: OFFICIAL_PHONE_DISPLAY,
          avatar: t.avatar || '',
          vehicle: t.vehicle || '',
          plate: t.plate || '',
          lat: t.lat || 4.678,
          lng: t.lng || -74.056,
          portfolio: Array.isArray(t.portfolio) ? t.portfolio : [],
          updated_at: new Date().toISOString()
        }));
        await supabaseRest.upsert('technicians', rows, 'id');
      } catch {
        // Ignorar fallo de red temporal
      }
    }

    const relayUrl = getRelayProfilesUrl();
    if (!relayUrl) return;
    try {
      await fetch(relayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profiles: normalized })
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
        if (Array.isArray(parsed) && parsed.length > 0) return normalizePhones(parsed);
      }
    } catch (e) {
      console.warn('Error reading tech profiles:', e);
    }
    const defaults = normalizePhones(INITIAL_TECHNICIANS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    } catch {
      // Ignorar cuota
    }
    return defaults;
  }

  saveProfiles(profiles) {
    const normalized = normalizePhones(profiles);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'TECH_PROFILES_UPDATED', profiles: normalized });
      }
      this.pushRemoteProfiles(normalized);
      this.notifyListeners(normalized);
    } catch (e) {
      console.error('Error saving tech profiles:', e);
    }
    return normalized;
  }

  updateAvatar(techId, newAvatarUrl) {
    const profiles = this.getProfiles();
    const updated = profiles.map(t => (t.id === techId ? { ...t, avatar: newAvatarUrl } : t));
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
