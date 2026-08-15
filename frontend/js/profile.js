/* ========================================================
   VaultGuard - User Profile JS
   ======================================================== */

async function loadUserProfile() {
  try {
    const data = await apiRequest('/users/profile');
    const user = data.user || {};

    const nameInput = document.getElementById('profile-fullname');
    const emailInput = document.getElementById('profile-email');
    const roleElem = document.getElementById('profile-role');
    const createdElem = document.getElementById('profile-created-at');

    if (nameInput) nameInput.value = user.full_name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (roleElem) roleElem.textContent = user.role || 'USER';
    if (createdElem && user.created_at) {
      createdElem.textContent = new Date(user.created_at).toLocaleDateString();
    }
  } catch (err) {
    showToast(err.message || 'Failed to load user profile.', 'error');
  }
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  const name = document.getElementById('profile-fullname')?.value;
  const email = document.getElementById('profile-email')?.value;

  try {
    const data = await apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ full_name: name, email })
    });

    localStorage.setItem('vg_user', JSON.stringify(data.user));
    showToast('Profile details updated successfully.', 'success');
    renderUserInfo();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleChangeMasterPassword(e) {
  e.preventDefault();
  const currentPassword = document.getElementById('master-current-pwd')?.value;
  const newPassword = document.getElementById('master-new-pwd')?.value;
  const confirmPassword = document.getElementById('master-confirm-pwd')?.value;

  if (newPassword !== confirmPassword) {
    showToast('New passwords do not match.', 'warning');
    return;
  }

  try {
    await apiRequest('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    });

    showToast('Master password updated successfully.', 'success');
    document.getElementById('change-password-form')?.reset();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();

  const profileForm = document.getElementById('profile-details-form');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }

  const pwdForm = document.getElementById('change-password-form');
  if (pwdForm) {
    pwdForm.addEventListener('submit', handleChangeMasterPassword);
  }
});
