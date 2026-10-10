/**
 * API Service for AI Relationship Companion
 * Handles HTTP requests, JWT token storage, error formatting, and endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const TOKEN_KEY = 'ai_companion_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.error || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
};

export const api = {
  // Auth
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    guestLogin: () => request('/auth/guest', { method: 'POST' }),
    getMe: () => request('/auth/me')
  },

  // Chats
  chats: {
    upload: (formDataOrJson) => {
      if (formDataOrJson instanceof FormData) {
        return request('/chats/upload', {
          method: 'POST',
          body: formDataOrJson
        });
      }
      return request('/chats/upload', {
        method: 'POST',
        body: JSON.stringify(formDataOrJson)
      });
    },
    getAll: () => request('/chats'),
    getById: (id) => request(`/chats/${id}`),
    delete: (id) => request(`/chats/${id}`, { method: 'DELETE' }),
    analyze: (id, payload = {}) => request(`/chats/${id}/analyze`, { method: 'POST', body: JSON.stringify(payload) }),
    getSample: () => request('/chats/sample')
  },

  // Companion Chat
  companion: {
    sendMessage: (payload) => request('/companion/message', { method: 'POST', body: JSON.stringify(payload) }),
    getHistory: () => request('/companion/history'),
    clearHistory: () => request('/companion/history', { method: 'DELETE' })
  },

  // Memories
  memories: {
    getAll: () => request('/companion/memories'),
    create: (memory) => request('/companion/memories', { method: 'POST', body: JSON.stringify(memory) }),
    update: (id, updates) => request(`/companion/memories/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
    delete: (id) => request(`/companion/memories/${id}`, { method: 'DELETE' }),
    clearAll: () => request('/companion/memories', { method: 'DELETE' })
  },

  // Settings & System
  settings: {
    get: () => request('/settings'),
    update: (updates) => request('/settings', { method: 'PUT', body: JSON.stringify(updates) }),
    wipeData: () => request('/settings/wipe-data', { method: 'POST' })
  },

  // Health
  health: {
    check: () => request('/health')
  }
};
