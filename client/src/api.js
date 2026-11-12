const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('spyrix_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error('Cannot reach the SPYRIX API. Check that the backend is running.');
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) {
      localStorage.removeItem('spyrix_token');
      window.dispatchEvent(new Event('spyrix:unauthorized'));
    }
    throw new Error(payload.message || 'Something went wrong. Please try again.');
  }
  return payload;
}

export { API_BASE };
