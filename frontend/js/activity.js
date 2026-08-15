/* ========================================================
   VaultGuard - Activity Log & Audit History JS
   ======================================================== */

async function loadActivityLogs() {
  const container = document.getElementById('activity-logs-list');
  if (!container) return;

  try {
    const data = await apiRequest('/activity?limit=50');
    const logs = data.logs || [];

    if (logs.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px; color:var(--text-muted);">
          <i class="fa-solid fa-list-check" style="font-size:2.5rem; margin-bottom:12px; color:var(--text-dim);"></i>
          <p>No activity records recorded yet.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = logs.map(log => {
      const dateStr = new Date(log.created_at).toLocaleString();
      let iconClass = 'fa-circle-info';
      let iconColor = 'var(--accent-blue)';

      if (log.action.includes('Login')) {
        iconClass = 'fa-right-to-bracket';
        iconColor = 'var(--accent-green)';
      } else if (log.action.includes('Failed')) {
        iconClass = 'fa-triangle-exclamation';
        iconColor = 'var(--accent-red)';
      } else if (log.action.includes('Revealed')) {
        iconClass = 'fa-eye';
        iconColor = 'var(--accent-yellow)';
      } else if (log.action.includes('Added') || log.action.includes('Created')) {
        iconClass = 'fa-plus';
        iconColor = 'var(--accent-cyan)';
      } else if (log.action.includes('Deleted')) {
        iconClass = 'fa-trash-can';
        iconColor = 'var(--accent-red)';
      }

      return `
        <div style="display:flex; align-items:flex-start; gap:16px; padding:16px; background-color:var(--bg-input); border-radius:var(--radius-md); margin-bottom:12px; border-left:3px solid ${iconColor};">
          <div style="width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; color:${iconColor}; flex-shrink:0;">
            <i class="fa-solid ${iconClass}"></i>
          </div>
          <div style="flex:1;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
              <strong style="font-size:0.95rem; color:var(--text-main);">${escapeHtml(log.action)}</strong>
              <span style="font-size:0.75rem; color:var(--text-dim);"><i class="fa-regular fa-clock"></i> ${dateStr}</span>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted);">${escapeHtml(log.description)}</p>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    showToast(err.message || 'Failed to load activity logs.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadActivityLogs();
});
