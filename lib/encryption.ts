import CryptoJS from 'crypto-js';

// Encryption key - in production, use environment variable
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'aquanet-secure-messaging-key-2024';

/**
 * Encrypt a message using AES encryption
 */
export function encryptMessage(message: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return message; // Fallback to unencrypted if encryption fails
  }
}

/**
 * Decrypt a message using AES decryption
 */
export function decryptMessage(encryptedMessage: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
    const originalMessage = decrypted.toString(CryptoJS.enc.Utf8);
    return originalMessage || encryptedMessage; // Fallback if decryption fails
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedMessage; // Return as-is if decryption fails
  }
}

/**
 * Check if a message is encrypted (basic check)
 */
export function isEncrypted(message: string): boolean {
  // AES encrypted messages typically contain these characters
  return message.includes('U2FsdGVk') || /^[A-Za-z0-9+/=]+$/.test(message);
}
