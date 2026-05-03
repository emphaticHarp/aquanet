import { config } from 'dotenv';
import { resolve } from 'path';
import CryptoJS from 'crypto-js';

// This needs to run before imports
process.env.MONGODB_URI = 'mongodb://soumyajyotibanik07_db_user:aEC6925lRhiJoQXn@ac-uaiwqz5-shard-00-00.vjf1ua9.mongodb.net:27017,ac-uaiwqz5-shard-00-01.vjf1ua9.mongodb.net:27017,ac-uaiwqz5-shard-00-02.vjf1ua9.mongodb.net:27017/aquanet?ssl=true&replicaSet=atlas-c0fhh9-shard-0&authSource=admin&retryWrites=true&w=majority';

import connectDB from '../lib/mongodb';
import Message from '../models/Message';

const ENCRYPTION_KEY = 'aquanet_secure_messaging_encryption_key_2024';

function decryptMessage(encryptedMessage: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
    const originalText = decrypted.toString(CryptoJS.enc.Utf8);
    return originalText || '[DECRYPTION FAILED]';
  } catch (error) {
    return '[DECRYPTION ERROR]';
  }
}

async function inspectMessages() {
  try {
    await connectDB();
    
    console.log('📋 Fetching all messages...\n');
    const messages = await Message.find({}).lean();
    
    console.log(`Found ${messages.length} messages:\n`);
    
    messages.forEach((msg, index) => {
      console.log(`Message ${index + 1}:`);
      console.log(`  From: ${msg.senderName} → To: ${msg.receiverName}`);
      console.log(`  Encrypted field: ${msg.encrypted}`);
      console.log(`  Stored text (first 60 chars): ${msg.text.substring(0, 60)}`);
      console.log(`  Full stored text: ${msg.text}`);
      
      const decrypted = decryptMessage(msg.text);
      console.log(`  Decrypted result: "${decrypted}"`);
      console.log(`  Decryption success: ${decrypted !== '[DECRYPTION FAILED]' && decrypted !== '[DECRYPTION ERROR]'}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

inspectMessages();
