/* ========================================================
   VaultGuard - Security Center Audit JS
   ======================================================== */

async function loadSecurityCenterData() {
  try {
    const data = await apiRequest('/passwords/metrics');
    const m = data.metrics || {};

    const scoreBig = document.getElementById('sec-overall-score');
    const weakCount = document.getElementById('sec-weak-count');
    const reusedCount = document.getElementById('sec-reused-count');

    if (scoreBig) scoreBig.textContent = m.security_score || 100;
    if (weakCount) weakCount.textContent = m.weak_passwords || 0;
    if (reusedCount) reusedCount.textContent = m.reused_passwords || 0;

    // Render security breakdown progress bars
    const total = m.total_credentials || 1;
    const strongPct = Math.round(((m.strong_passwords || 0) / total) * 100);
    const mediumPct = Math.round(((m.medium_passwords || 0) / total) * 100);
    const weakPct = Math.round(((m.weak_passwords || 0) / total) * 100);

    const barStrong = document.getElementById('sec-bar-strong');
    const barMedium = document.getElementById('sec-bar-medium');
    const barWeak = document.getElementById('sec-bar-weak');

    if (barStrong) barStrong.style.width = `${strongPct}%`;
    if (barMedium) barMedium.style.width = `${mediumPct}%`;
    if (barWeak) barWeak.style.width = `${weakPct}%`;

  } catch (err) {
    console.error('Error loading security center:', err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadSecurityCenterData();
});
