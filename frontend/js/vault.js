/* ========================================================
   VaultGuard - Vault & Password Management JS
   ======================================================== */

let currentVaultPasswords = [];
let activeCategoryFilter = 'All';

async function loadVaultPasswords() {
  const tableBody = document.getElementById('vault-table-body');
  const emptyState = document.getElementById('vault-empty-state');
  const tableContainer = document.getElementById('vault-table-container');

  if (!tableBody) return;

  try {
    const searchVal = document.getElementById('vault-search-input')?.value || '';
    let query = `?search=${encodeURIComponent(searchVal)}`;
    if (activeCategoryFilter !== 'All' && activeCategoryFilter !== 'Favorites') {
      query += `&category=${encodeURIComponent(activeCategoryFilter)}`;
    } else if (activeCategoryFilter === 'Favorites') {
      query += `&favorite=true`;
    }

    const data = await apiRequest(`/passwords${query}`);
    currentVaultPasswords = data.passwords || [];

    renderVaultTable(currentVaultPasswords);
  } catch (err) {
    showToast(err.message || 'Failed to load credentials vault.', 'error');
  }
}

function renderVaultTable(passwords) {
  const tableBody = document.getElementById('vault-table-body');
  const emptyState = document.getElementById('vault-empty-state');
  const tableContainer = document.getElementById('vault-table-container');

  if (!passwords || passwords.length === 0) {
    if (tableContainer) tableContainer.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (tableContainer) tableContainer.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';

  tableBody.innerHTML = passwords.map(pwd => {
    const favClass = pwd.favorite ? 'active' : '';
    const starIcon = pwd.favorite ? 'fa-solid fa-star' : 'fa-regular fa-star';

    let categoryBadge = `<span class="badge badge-category">${pwd.category || 'Work'}</span>`;
    let strengthBadge = `<span class="badge ${pwd.strength_score >= 60 ? 'badge-strong' : (pwd.strength_score >= 40 ? 'badge-medium' : 'badge-weak')}">${pwd.strength_label}</span>`;

    return `
      <tr>
        <td>
          <div class="service-cell">
            <i class="favorite-star ${favClass} ${starIcon}" onclick="toggleFavoritePassword(${pwd.id})"></i>
            <div class="service-icon-box">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <div>${escapeHtml(pwd.service_name)}</div>
              ${pwd.folder_name ? `<div style="font-size:0.75rem; color:var(--text-dim);"><i class="fa-regular fa-folder"></i> ${escapeHtml(pwd.folder_name)}</div>` : ''}
            </div>
          </div>
        </td>
        <td>
          <span style="font-family:monospace; font-weight:600;">${escapeHtml(pwd.username)}</span>
        </td>
        <td>${categoryBadge}</td>
        <td>
          ${pwd.website_url ? `<a href="${escapeHtml(pwd.website_url)}" target="_blank" rel="noopener" style="font-size:0.85rem;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open</a>` : '<span style="color:var(--text-dim);">-</span>'}
        </td>
        <td>${strengthBadge}</td>
        <td>
          <div class="action-buttons-group">
            <button class="btn-icon" title="View Password" onclick="openRevealModal(${pwd.id}, '${escapeHtml(pwd.service_name)}')">
              <i class="fa-regular fa-eye"></i>
            </button>
            <button class="btn-icon" title="Copy Password" onclick="quickCopyPassword(${pwd.id})">
              <i class="fa-regular fa-copy"></i>
            </button>
            <a class="btn-icon" title="Edit Credential" href="edit-password.html?id=${pwd.id}">
              <i class="fa-regular fa-pen-to-square"></i>
            </a>
            <button class="btn-icon" title="Delete Credential" onclick="confirmDeletePassword(${pwd.id}, '${escapeHtml(pwd.service_name)}')">
              <i class="fa-regular fa-trash-can" style="color:var(--accent-red);"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Favorite Toggle
async function toggleFavoritePassword(id) {
  try {
    const data = await apiRequest(`/passwords/${id}/favorite`, { method: 'PATCH' });
    showToast(data.favorite ? 'Marked as favorite.' : 'Removed from favorites.', 'success');
    loadVaultPasswords();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Quick Copy Password
async function quickCopyPassword(id) {
  try {
    const data = await apiRequest(`/passwords/${id}/reveal`);
    copyTextToClipboard(data.decrypted_password, `Copied password for ${data.service_name}`);
  } catch (err) {
    showToast(err.message || 'Failed to decrypt credential.', 'error');
  }
}

// Reveal Modal Handling
let revealTimerInterval = null;

async function openRevealModal(id, serviceName) {
  try {
    const data = await apiRequest(`/passwords/${id}/reveal`);
    const modal = document.getElementById('reveal-modal');
    const serviceTitle = document.getElementById('reveal-service-title');
    const pwdInput = document.getElementById('reveal-password-field');
    const countdownElem = document.getElementById('reveal-countdown');

    if (!modal) return;

    if (serviceTitle) serviceTitle.textContent = serviceName;
    if (pwdInput) pwdInput.value = data.decrypted_password;

    modal.classList.add('active');

    // Auto-close countdown (15 seconds security window)
    let secondsLeft = 15;
    if (countdownElem) countdownElem.textContent = `Auto-hiding in ${secondsLeft}s`;

    clearInterval(revealTimerInterval);
    revealTimerInterval = setInterval(() => {
      secondsLeft--;
      if (countdownElem) countdownElem.textContent = `Auto-hiding in ${secondsLeft}s`;
      if (secondsLeft <= 0) {
        closeRevealModal();
      }
    }, 1000);

  } catch (err) {
    showToast(err.message || 'Failed to reveal password.', 'error');
  }
}

function closeRevealModal() {
  const modal = document.getElementById('reveal-modal');
  const pwdInput = document.getElementById('reveal-password-field');
  if (modal) modal.classList.remove('active');
  if (pwdInput) pwdInput.value = '';
  clearInterval(revealTimerInterval);
}

// Delete Confirmation
async function confirmDeletePassword(id, serviceName) {
  if (confirm(`Are you sure you want to delete the credential for "${serviceName}"? This action cannot be undone.`)) {
    try {
      await apiRequest(`/passwords/${id}`, { method: 'DELETE' });
      showToast(`Credential for ${serviceName} deleted.`, 'success');
      loadVaultPasswords();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
}

// Utility: HTML Escaping
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Category Chip Filter setup
document.addEventListener('DOMContentLoaded', () => {
  loadVaultPasswords();

  const searchInput = document.getElementById('vault-search-input');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadVaultPasswords();
      }, 300);
    });
  }

  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategoryFilter = chip.getAttribute('data-category') || 'All';
      loadVaultPasswords();
    });
  });
});
