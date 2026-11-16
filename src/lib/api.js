// Client for the Google Apps Script backend (see backend/README.md).
// This is the web-app URL from Deploy → Manage deployments. If you ever create a new
// deployment (not just a new version), paste the new URL here.
const API_URL = 'https://script.google.com/macros/s/AKfycbwAOlDykPKIN13tK8tWirZGhgT4tI06L-gZu0f1q74G_Rm5RIQ5lji6sGjeyP0FWAbn/exec';

export const apiConfigured = Boolean(API_URL);
export const TOKEN_KEY = 'zf_token';
export const ADMIN_KEY = 'zf_admin';

// The admin session lives in sessionStorage, so it ends when the browser tab is closed.
export const getAdminToken = () => {
  try { return sessionStorage.getItem(ADMIN_KEY); } catch { return null; }
};
export const setAdminToken = (token) => {
  try {
    if (token) sessionStorage.setItem(ADMIN_KEY, token); else sessionStorage.removeItem(ADMIN_KEY);
  } catch { /* storage unavailable */ }
};

export class ApiError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token); else localStorage.removeItem(TOKEN_KEY);
  } catch { /* storage unavailable */ }
};

/**
 * POST { action, token, ...payload } to the backend.
 * `text/plain` keeps this a "simple" CORS request, which Apps Script requires.
 */
export async function api(action, payload = {}) {
  if (!API_URL) {
    throw new ApiError('The online store isn’t connected yet. Please contact us and we’ll help you directly.', 'NOT_CONFIGURED');
  }
  let res;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, token: getToken(), adminToken: getAdminToken(), ...payload }),
    });
  } catch {
    throw new ApiError('We couldn’t reach the store. Please check your connection and try again.', 'NETWORK');
  }
  let json;
  try { json = await res.json(); } catch { throw new ApiError('Unexpected response from the store. Please try again.', 'BAD_RESPONSE'); }
  if (!json.ok) throw new ApiError(json.error || 'Something went wrong.', 'SERVER');
  return json.data;
}

/** Shrinks a screenshot in the browser so it uploads quickly (max 1400px, JPEG). */
export const imageToDataUrl = (file, maxSide = 1400, quality = 0.82) =>
  new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) return reject(new Error('Please choose an image file (JPG or PNG).'));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file couldn’t be read as an image.')); };
    img.src = url;
  });
