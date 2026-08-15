/* ========================================================
   VaultGuard - Interactive Password Generator Module
   ======================================================== */

function generateClientPassword({
  length = 16,
  uppercase = true,
  lowercase = true,
  numbers = true,
  symbols = true
} = {}) {
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let allowedChars = '';
  let requiredChars = [];

  if (uppercase) {
    allowedChars += upperChars;
    requiredChars.push(upperChars[Math.floor(Math.random() * upperChars.length)]);
  }
  if (lowercase) {
    allowedChars += lowerChars;
    requiredChars.push(lowerChars[Math.floor(Math.random() * lowerChars.length)]);
  }
  if (numbers) {
    allowedChars += numberChars;
    requiredChars.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
  }
  if (symbols) {
    allowedChars += symbolChars;
    requiredChars.push(symbolChars[Math.floor(Math.random() * symbolChars.length)]);
  }

  if (!allowedChars) {
    allowedChars = lowerChars + numberChars;
    requiredChars.push(lowerChars[Math.floor(Math.random() * lowerChars.length)]);
  }

  const remaining = Math.max(0, length - requiredChars.length);
  const passwordArr = [...requiredChars];

  for (let i = 0; i < remaining; i++) {
    passwordArr.push(allowedChars[Math.floor(Math.random() * allowedChars.length)]);
  }

  // Shuffle
  for (let i = passwordArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArr[i], passwordArr[j]] = [passwordArr[j], passwordArr[i]];
  }

  return passwordArr.join('');
}

function evaluateStrength(pwd) {
  if (!pwd) return { score: 0, label: 'Weak', class: 'badge-weak' };

  let score = 0;
  if (pwd.length >= 8) score += 20;
  if (pwd.length >= 12) score += 20;
  if (pwd.length >= 16) score += 10;
  if (/[A-Z]/.test(pwd)) score += 15;
  if (/[a-z]/.test(pwd)) score += 10;
  if (/[0-9]/.test(pwd)) score += 10;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 15;

  let label = 'Weak';
  let badgeClass = 'badge-weak';

  if (score >= 80) {
    label = 'Very Strong';
    badgeClass = 'badge-strong';
  } else if (score >= 60) {
    label = 'Strong';
    badgeClass = 'badge-strong';
  } else if (score >= 40) {
    label = 'Medium';
    badgeClass = 'badge-medium';
  }

  return { score, label, class: badgeClass };
}

function copyTextToClipboard(text, successMsg = 'Password copied to clipboard!') {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg, 'success');
    }).catch(() => {
      fallbackCopyText(text, successMsg);
    });
  } else {
    fallbackCopyText(text, successMsg);
  }
}

function fallbackCopyText(text, successMsg) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successMsg, 'success');
  } catch (err) {
    showToast('Failed to copy to clipboard.', 'error');
  }
  document.body.removeChild(textArea);
}
