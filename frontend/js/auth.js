/* ========================================================
   VaultGuard - Authentication State Manager
   ======================================================== */

// Check authentication state on protected pages
function checkAuth() {
  const token = localStorage.getItem('vg_token');
  const path = window.location.pathname;

  const isAuthPage = path.endsWith('login.html') || path.endsWith('register.html');

  if (!token && !isAuthPage) {
    window.location.href = 'login.html';
    return null;
  }

  if (token && isAuthPage) {
    window.location.href = 'dashboard.html';
    return null;
  }

  const userJson = localStorage.getItem('vg_user');
  return userJson ? JSON.parse(userJson) : null;
}

// User Logout
function logoutUser() {
  localStorage.removeItem('vg_token');
  localStorage.removeItem('vg_user');
  showToast('Logged out of VaultGuard session.', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 500);
}

// Populate user profile info in Topbar / Sidebar
function renderUserInfo() {
  const user = checkAuth();
  if (!user) return;

  const userNameElems = document.querySelectorAll('.user-name-display');
  const userEmailElems = document.querySelectorAll('.user-email-display');
  const userAvatarElems = document.querySelectorAll('.user-avatar-display');

  userNameElems.forEach(el => el.textContent = user.full_name || 'Enterprise User');
  userEmailElems.forEach(el => el.textContent = user.email || 'user@company.com');
  userAvatarElems.forEach(el => {
    const initials = (user.full_name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    el.textContent = initials;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderUserInfo();
});
