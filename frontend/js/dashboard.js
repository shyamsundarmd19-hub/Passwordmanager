/* ========================================================
   VaultGuard - Main Dashboard Metrics & Activity JS
   ======================================================== */

async function loadDashboardMetrics() {
  try {
    const data = await apiRequest('/passwords/metrics');
    const m = data.metrics || {};

    // Stat Cards
    const totalElem = document.getElementById('dash-total-credentials');
    const strongElem = document.getElementById('dash-strong-passwords');
    const weakElem = document.getElementById('dash-weak-passwords');
    const favElem = document.getElementById('dash-favorites');
    const scoreElem = document.getElementById('dash-security-score');

    if (totalElem) totalElem.textContent = m.total_credentials || 0;
    if (strongElem) strongElem.textContent = m.strong_passwords || 0;
    if (weakElem) weakElem.textContent = m.weak_passwords || 0;
    if (favElem) favElem.textContent = m.favorites_count || 0;
    if (scoreElem) scoreElem.textContent = m.security_score || 100;

    // Security score color bar
    const scoreText = document.getElementById('dash-score-status-text');
    if (scoreText) {
      if (m.security_score >= 80) {
        scoreText.textContent = 'Excellent Vault Health';
        scoreText.style.color = 'var(--accent-green)';
      } else if (m.security_score >= 60) {
        scoreText.textContent = 'Good Vault Health';
        scoreText.style.color = 'var(--accent-blue)';
      } else {
        scoreText.textContent = 'Action Required';
        scoreText.style.color = 'var(--accent-red)';
      }
    }

    // Security Alerts Box
    const alertsContainer = document.getElementById('dash-security-alerts-box');
    if (alertsContainer) {
      let alertHtml = '';
      if (m.weak_passwords > 0) {
        alertHtml += `
          <div style="display:flex; align-items:center; gap:12px; padding:12px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); border-radius:var(--radius-md); margin-bottom:10px;">
            <i class="fa-solid fa-triangle-exclamation" style="color:var(--accent-red); font-size:1.2rem;"></i>
            <div>
              <strong style="color:var(--text-main);">${m.weak_passwords} weak passwords detected</strong>
              <div style="font-size:0.8rem; color:var(--text-muted);">Consider updating these credentials to high-entropy passwords.</div>
            </div>
          </div>
        `;
      }
      if (m.reused_passwords > 0) {
        alertHtml += `
          <div style="display:flex; align-items:center; gap:12px; padding:12px; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.2); border-radius:var(--radius-md); margin-bottom:10px;">
            <i class="fa-solid fa-clone" style="color:var(--accent-yellow); font-size:1.2rem;"></i>
            <div>
              <strong style="color:var(--text-main);">${m.reused_passwords} reused passwords detected</strong>
              <div style="font-size:0.8rem; color:var(--text-muted);">Using identical passwords across multiple services increases security risk.</div>
            </div>
          </div>
        `;
      }
      if (!alertHtml) {
        alertHtml = `
          <div style="display:flex; align-items:center; gap:12px; padding:12px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.2); border-radius:var(--radius-md);">
            <i class="fa-solid fa-shield-check" style="color:var(--accent-green); font-size:1.2rem;"></i>
            <div>
              <strong style="color:var(--text-main);">No critical security issues detected</strong>
              <div style="font-size:0.8rem; color:var(--text-muted);">Your vault maintains standard enterprise security rules.</div>
            </div>
          </div>
        `;
      }
      alertsContainer.innerHTML = alertHtml;
    }

  } catch (err) {
    console.error('Error loading dashboard metrics:', err.message);
  }
}

async function loadRecentlyAddedCredentials() {
  const container = document.getElementById('dash-recent-credentials-list');
  if (!container) return;

  try {
    const data = await apiRequest('/passwords?limit=5');
    const passwords = data.passwords || [];

    if (passwords.length === 0) {
      container.innerHTML = `<p style="color:var(--text-dim); text-align:center; padding:20px;">No credentials saved yet.</p>`;
      return;
    }

    container.innerHTML = passwords.slice(0, 5).map(pwd => `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background-color:var(--bg-input); border-radius:var(--radius-md); margin-bottom:10px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="service-icon-box">
            <i class="fa-solid fa-server"></i>
          </div>
          <div>
            <div style="font-weight:600;">${pwd.service_name}</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">${pwd.username}</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <span class="badge ${pwd.strength_score >= 60 ? 'badge-strong' : 'badge-medium'}">${pwd.strength_label}</span>
          <a class="btn-icon" href="vault.html" title="Open Vault"><i class="fa-solid fa-arrow-right"></i></a>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading recent credentials:', err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardMetrics();
  loadRecentlyAddedCredentials();
});
