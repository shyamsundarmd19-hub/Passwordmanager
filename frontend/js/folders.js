/* ========================================================
   VaultGuard - Folder Management JS
   ======================================================== */

let userFolders = [];

async function loadFolders() {
  const container = document.getElementById('folders-grid-container');
  if (!container) return;

  try {
    const data = await apiRequest('/folders');
    userFolders = data.folders || [];

    if (userFolders.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">
          <i class="fa-regular fa-folder-open" style="font-size:2.5rem; margin-bottom:12px; color:var(--text-dim);"></i>
          <p>No folders created yet. Click "Create Folder" to organize your credentials.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = userFolders.map(folder => `
      <div class="vg-card" style="margin-bottom:0; display:flex; flex-direction:column; justify-space-between;">
        <div>
          <div class="card-header-flex">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="width:40px; height:40px; border-radius:var(--radius-md); background:rgba(59,130,246,0.15); color:var(--accent-blue); display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
                <i class="fa-solid fa-folder"></i>
              </div>
              <div>
                <h4 style="font-size:1rem; font-weight:700; color:var(--text-main);">${escapeHtml(folder.folder_name)}</h4>
                <div style="font-size:0.75rem; color:var(--text-muted);">${folder.credential_count || 0} credentials</div>
              </div>
            </div>
            <div class="action-buttons-group">
              <button class="btn-icon" title="Edit Folder" onclick="openEditFolderModal(${folder.id}, '${escapeHtml(folder.folder_name)}', '${escapeHtml(folder.description || '')}')">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button class="btn-icon" title="Delete Folder" onclick="confirmDeleteFolder(${folder.id}, '${escapeHtml(folder.folder_name)}')">
                <i class="fa-regular fa-trash-can" style="color:var(--accent-red);"></i>
              </button>
            </div>
          </div>
          <p style="font-size:0.85rem; color:var(--text-muted); min-height:40px;">${folder.description ? escapeHtml(folder.description) : 'No description provided.'}</p>
        </div>
        <div style="margin-top:16px; pt-16; border-top:1px solid var(--border-color);">
          <a href="vault.html?folder=${folder.id}" class="btn-secondary" style="width:100%; display:inline-block; text-align:center; font-size:0.85rem; padding:8px 12px;">
            <i class="fa-regular fa-eye"></i> View Vault Credentials
          </a>
        </div>
      </div>
    `).join('');

    // Populate dropdowns in password forms
    populateFolderDropdowns(userFolders);

  } catch (err) {
    showToast(err.message || 'Failed to load folders.', 'error');
  }
}

function populateFolderDropdowns(folders) {
  const dropdown = document.getElementById('password-folder-select');
  if (!dropdown) return;

  const currentVal = dropdown.value;
  dropdown.innerHTML = `
    <option value="">(None - Unorganized)</option>
    ${folders.map(f => `<option value="${f.id}">${escapeHtml(f.folder_name)}</option>`).join('')}
  `;
  if (currentVal) dropdown.value = currentVal;
}

// Create/Edit Folder Modal Handlers
function openCreateFolderModal() {
  const modal = document.getElementById('folder-modal');
  const title = document.getElementById('folder-modal-title');
  const idInput = document.getElementById('folder-id-hidden');
  const nameInput = document.getElementById('folder-name-input');
  const descInput = document.getElementById('folder-desc-input');

  if (!modal) return;

  if (title) title.textContent = 'Create New Folder';
  if (idInput) idInput.value = '';
  if (nameInput) nameInput.value = '';
  if (descInput) descInput.value = '';

  modal.classList.add('active');
}

function openEditFolderModal(id, name, desc) {
  const modal = document.getElementById('folder-modal');
  const title = document.getElementById('folder-modal-title');
  const idInput = document.getElementById('folder-id-hidden');
  const nameInput = document.getElementById('folder-name-input');
  const descInput = document.getElementById('folder-desc-input');

  if (!modal) return;

  if (title) title.textContent = 'Edit Folder';
  if (idInput) idInput.value = id;
  if (nameInput) nameInput.value = name;
  if (descInput) descInput.value = desc;

  modal.classList.add('active');
}

function closeFolderModal() {
  const modal = document.getElementById('folder-modal');
  if (modal) modal.classList.remove('active');
}

async function handleFolderFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('folder-id-hidden')?.value;
  const name = document.getElementById('folder-name-input')?.value;
  const desc = document.getElementById('folder-desc-input')?.value;

  if (!name || !name.trim()) {
    showToast('Folder name is required.', 'warning');
    return;
  }

  try {
    if (id) {
      await apiRequest(`/folders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ folder_name: name, description: desc })
      });
      showToast('Folder updated successfully.', 'success');
    } else {
      await apiRequest('/folders', {
        method: 'POST',
        body: JSON.stringify({ folder_name: name, description: desc })
      });
      showToast('Folder created successfully.', 'success');
    }

    closeFolderModal();
    loadFolders();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function confirmDeleteFolder(id, name) {
  if (confirm(`Delete folder "${name}"? Stored credentials will remain in your main vault.`)) {
    try {
      await apiRequest(`/folders/${id}`, { method: 'DELETE' });
      showToast(`Folder "${name}" deleted.`, 'success');
      loadFolders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadFolders();

  const folderForm = document.getElementById('folder-form');
  if (folderForm) {
    folderForm.addEventListener('submit', handleFolderFormSubmit);
  }
});
