/* ========================================================
   VaultGuard - Unified API Client & Toast Notification System
   ======================================================== */

const API_BASE_URL = '/api';

/**
 * Toast Notification Helper
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconClass = 'fa-circle-info';
  if (type === 'success') iconClass = 'fa-circle-check';
  if (type === 'error') iconClass = 'fa-triangle-exclamation';
  if (type === 'warning') iconClass = 'fa-triangle-exclamation';

  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <i class="fa-solid ${iconClass}"></i>
      <span>${message}</span>
    </div>
    <button onclick="this.parentElement.remove()" style="background:none; border:none; color:inherit; cursor:pointer;">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 4000);
}

/**
 * Main API Request Wrapper
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('vg_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        // Token expired or invalid
        localStorage.removeItem('vg_token');
        localStorage.removeItem('vg_user');
        window.location.href = 'login.html';
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error(data.message || 'API request failed.');
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err.message);
    throw err;
  }
}
