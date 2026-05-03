import connectDB from '../lib/mongodb';
import Message from '../models/Message';

async function cleanMessages() {
  try {
    await connectDB();
    
    console.log('🗑️  Deleting all messages...');
    const result = await Message.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} messages`);
    
    console.log('✨ Database cleaned! You can now send new encrypted messages.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning messages:', error);
    process.exit(1);
  }
}

cleanMessages();
