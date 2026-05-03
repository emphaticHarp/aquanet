import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'aquanet_secure_messaging_encryption_key_2024';

function encryptMessage(message: string): string {
  return CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
}

function decryptMessage(encryptedMessage: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
    const originalText = decrypted.toString(CryptoJS.enc.Utf8);
    return originalText;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}

// Test
const testMessage = 'Hello, this is a test message!';
console.log('Original message:', testMessage);

const encrypted = encryptMessage(testMessage);
console.log('Encrypted:', encrypted);

const decrypted = decryptMessage(encrypted);
console.log('Decrypted:', decrypted);

console.log('Match:', testMessage === decrypted ? '✅ SUCCESS' : '❌ FAILED');
