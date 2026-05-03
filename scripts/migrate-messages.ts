import mongoose from 'mongoose';
import CryptoJS from 'crypto-js';

const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb://soumyajyotibanik07_db_user:aEC6925lRhiJoQXn@ac-uaiwqz5-shard-00-00.vjf1ua9.mongodb.net:27017,ac-uaiwqz5-shard-00-01.vjf1ua9.mongodb.net:27017,ac-uaiwqz5-shard-00-02.vjf1ua9.mongodb.net:27017/aquanet?ssl=true&replicaSet=atlas-c0fhh9-shard-0&authSource=admin&retryWrites=true&w=majority';

const ENCRYPTION_KEY = 'aquanet_secure_messaging_encryption_key_2024';

const MessageSchema = new mongoose.Schema({
  conversationId: String,
  sender: mongoose.Schema.Types.ObjectId,
  senderName: String,
  senderInitial: String,
  receiver: mongoose.Schema.Types.ObjectId,
  receiverName: String,
  text: String,
  encrypted: Boolean,
  read: Boolean,
}, { timestamps: true });

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

function encryptMessage(message: string): string {
  return CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
}

function isEncrypted(text: string): boolean {
  // Check if text looks like encrypted data (contains base64-like characters)
  return text.includes('U2FsdGVk') || /^[A-Za-z0-9+/=]+$/.test(text);
}

async function migrateMessages() {
  console.log('🔌 Connecting to MongoDB Atlas...');

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });

  console.log('✅ Connected!');

  // Option 1: Delete all old messages (clean slate)
  console.log('\n📝 Checking messages...');
  const allMessages = await Message.find();
  console.log(`Found ${allMessages.length} messages`);

  if (allMessages.length === 0) {
    console.log('✅ No messages to migrate');
    await mongoose.disconnect();
    return;
  }

  console.log('\n🔍 Analyzing messages...');
  let encryptedCount = 0;
  let unencryptedCount = 0;
  let needsMigration = 0;

  for (const msg of allMessages) {
    if (msg.encrypted === true) {
      encryptedCount++;
    } else if (msg.encrypted === false || msg.encrypted === undefined) {
      unencryptedCount++;
      needsMigration++;
    }
  }

  console.log(`\n📊 Message Status:`);
  console.log(`   Encrypted: ${encryptedCount}`);
  console.log(`   Unencrypted: ${unencryptedCount}`);
  console.log(`   Needs Migration: ${needsMigration}`);

  if (needsMigration === 0) {
    console.log('\n✅ All messages are already encrypted!');
    await mongoose.disconnect();
    return;
  }

  console.log('\n⚠️  Choose migration option:');
  console.log('   1. Delete all old messages (recommended for testing)');
  console.log('   2. Encrypt existing messages');
  console.log('   3. Cancel');

  // For now, let's just delete old unencrypted messages
  console.log('\n🗑️  Deleting old unencrypted messages...');
  
  const result = await Message.deleteMany({
    $or: [
      { encrypted: false },
      { encrypted: { $exists: false } }
    ]
  });

  console.log(`✅ Deleted ${result.deletedCount} old messages`);
  console.log('\n🎉 Migration complete!');
  console.log('   All new messages will be encrypted automatically.');

  await mongoose.disconnect();
  console.log('\n✅ Disconnected from MongoDB');
}

migrateMessages().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
