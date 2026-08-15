/* ========================================================
   VaultGuard - Settings & Preferences JS
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const autoLogoutSelect = document.getElementById('setting-autologout');
  const revealTimeoutSelect = document.getElementById('setting-reveal-timeout');

  if (autoLogoutSelect) {
    autoLogoutSelect.value = localStorage.getItem('vg_setting_autologout') || '15';
    autoLogoutSelect.addEventListener('change', (e) => {
      localStorage.setItem('vg_setting_autologout', e.target.value);
      showToast('Auto-logout preference saved.', 'success');
    });
  }

  if (revealTimeoutSelect) {
    revealTimeoutSelect.value = localStorage.getItem('vg_setting_reveal_timeout') || '15';
    revealTimeoutSelect.addEventListener('change', (e) => {
      localStorage.setItem('vg_setting_reveal_timeout', e.target.value);
      showToast('Password reveal timeout saved.', 'success');
    });
  }
});
