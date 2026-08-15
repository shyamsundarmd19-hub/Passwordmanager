const crypto = require('crypto');

/**
 * Server-side Secure Password Generator
 */
function generatePassword({
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
    requiredChars.push(upperChars[crypto.randomInt(0, upperChars.length)]);
  }
  if (lowercase) {
    allowedChars += lowerChars;
    requiredChars.push(lowerChars[crypto.randomInt(0, lowerChars.length)]);
  }
  if (numbers) {
    allowedChars += numberChars;
    requiredChars.push(numberChars[crypto.randomInt(0, numberChars.length)]);
  }
  if (symbols) {
    allowedChars += symbolChars;
    requiredChars.push(symbolChars[crypto.randomInt(0, symbolChars.length)]);
  }

  if (!allowedChars) {
    allowedChars = lowerChars + numberChars;
    requiredChars.push(lowerChars[crypto.randomInt(0, lowerChars.length)]);
  }

  const remainingLength = Math.max(0, length - requiredChars.length);
  const passwordArray = [...requiredChars];

  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = crypto.randomInt(0, allowedChars.length);
    passwordArray.push(allowedChars[randomIndex]);
  }

  // Shuffle array using Fisher-Yates
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
}

/**
 * Evaluate password strength
 * Returns { score: number, label: string }
 */
function evaluatePasswordStrength(password) {
  if (!password) return { score: 0, label: 'Weak' };

  let score = 0;
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 20;
  if (password.length >= 16) score += 10;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[a-z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;

  let label = 'Weak';
  if (score >= 80) {
    label = 'Very Strong';
  } else if (score >= 60) {
    label = 'Strong';
  } else if (score >= 40) {
    label = 'Medium';
  }

  return { score, label };
}

module.exports = {
  generatePassword,
  evaluatePasswordStrength
};
