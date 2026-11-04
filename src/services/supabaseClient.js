// Cliente ligero y nativo para Supabase PostgREST v1 (Sin dependencias pesadas)
// Lee automáticamente VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en Vercel o desarrollo local

const cleanUrl = (url) => (url || '').trim().replace(/\/+$/, '');

export const getSupabaseCredentials = () => {
  const url = cleanUrl(import.meta.env?.VITE_SUPABASE_URL);
  const key = (import.meta.env?.VITE_SUPABASE_ANON_KEY || '').trim();
  return {
    url,
    key,
    isConfigured: Boolean(url && key && url.startsWith('https://'))
  };
};

export const isSupabaseConfigured = () => getSupabaseCredentials().isConfigured;

const buildHeaders = (key, extra = {}) => ({
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
  ...extra
});

export const supabaseRest = {
  async select(table, queryParams = 'select=*') {
    const { url, key, isConfigured } = getSupabaseCredentials();
    if (!isConfigured) return null;

    const response = await fetch(`${url}/rest/v1/${table}?${queryParams}`, {
      method: 'GET',
      headers: buildHeaders(key)
    });
    if (!response.ok) {
      throw new Error(`Supabase SELECT ${table} HTTP ${response.status}`);
    }
    return response.json();
  },

  async insert(table, payload) {
    const { url, key, isConfigured } = getSupabaseCredentials();
    if (!isConfigured) return null;

    const response = await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: buildHeaders(key, { Prefer: 'return=representation' }),
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Supabase INSERT ${table} HTTP ${response.status}`);
    }
    return response.json();
  },

  async upsert(table, payload, onConflict = 'id') {
    const { url, key, isConfigured } = getSupabaseCredentials();
    if (!isConfigured) return null;

    const response = await fetch(`${url}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
      method: 'POST',
      headers: buildHeaders(key, { Prefer: 'resolution=merge-duplicates,return=representation' }),
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Supabase UPSERT ${table} HTTP ${response.status}`);
    }
    return response.json();
  },

  async update(table, matchQuery, payload) {
    const { url, key, isConfigured } = getSupabaseCredentials();
    if (!isConfigured) return null;

    const response = await fetch(`${url}/rest/v1/${table}?${matchQuery}`, {
      method: 'PATCH',
      headers: buildHeaders(key, { Prefer: 'return=representation' }),
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Supabase UPDATE ${table} HTTP ${response.status}`);
    }
    return response.json();
  }
};
