const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

// Ensure 32-byte key derived from process.env.ENCRYPTION_KEY or hashed default fallback
const rawKey = process.env.ENCRYPTION_KEY || 'vaultguard_default_32byte_secret_key!';
const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey() {
  // If key is a 64-char hex string, convert to Buffer; otherwise SHA-256 hash it to guarantee 32 bytes
  if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
    return Buffer.from(rawKey, 'hex');
  }
  return crypto.createHash('sha256').update(String(rawKey)).digest();
}

/**
 * Encrypt a plain text password using AES-256-GCM
 * @param {string} text - Plain text password to encrypt
 * @returns {object} { ciphertext, iv, authTag }
 */
function encrypt(text) {
  if (!text) return { ciphertext: '', iv: '', authTag: '' };
  
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 12-byte IV standard for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag
  };
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * @param {string} ciphertext 
 * @param {string} ivHex 
 * @param {string} authTagHex 
 * @returns {string} Plaintext password
 */
function decrypt(ciphertext, ivHex, authTagHex) {
  if (!ciphertext || !ivHex || !authTagHex) return '';
  
  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('[Encryption Decrypt Error]', err.message);
    throw new Error('Failed to decrypt password payload - invalid key or corrupted data.');
  }
}

module.exports = {
  encrypt,
  decrypt
};
