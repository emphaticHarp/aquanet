import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb://soumyajyotibanik07_db_user:aEC6925lRhiJoQXn@ac-uaiwqz5-shard-00-00.vjf1ua9.mongodb.net:27017,ac-uaiwqz5-shard-00-01.vjf1ua9.mongodb.net:27017,ac-uaiwqz5-shard-00-02.vjf1ua9.mongodb.net:27017/aquanet?ssl=true&replicaSet=atlas-c0fhh9-shard-0&authSource=admin&retryWrites=true&w=majority';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  resetOTP: { type: String, default: null },
  resetOTPExpiry: { type: Date, default: null },
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
  author: mongoose.Schema.Types.ObjectId,
  authorName: String,
  authorEmail: String,
  authorInitial: String,
  text: String,
  mediaUrl: String,
  mediaType: String,
  likes: [mongoose.Schema.Types.ObjectId],
  likesCount: Number,
  comments: Array,
  shares: Number,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

async function seed() {
  console.log('🔌 Connecting to MongoDB Atlas...');

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });

  console.log('✅ Connected!');

  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create 5 team members
  console.log('👥 Creating team members...');
  
  const users = [
    {
      name: 'Soumyajyoti Banik',
      email: 'soumya@aquanet.com',
      password: hashedPassword,
    },
    {
      name: 'Team Member 2',
      email: 'member2@aquanet.com',
      password: hashedPassword,
    },
    {
      name: 'Team Member 3',
      email: 'member3@aquanet.com',
      password: hashedPassword,
    },
    {
      name: 'Team Member 4',
      email: 'member4@aquanet.com',
      password: hashedPassword,
    },
    {
      name: 'Team Member 5',
      email: 'member5@aquanet.com',
      password: hashedPassword,
    },
  ];

  // Delete existing users with these emails
  await User.deleteMany({ 
    email: { $in: users.map(u => u.email) } 
  });

  const createdUsers = await User.insertMany(users);
  console.log(`✅ Created ${createdUsers.length} team members`);

  // Create sample posts
  console.log('📝 Creating sample posts...');
  
  await Post.deleteMany({ 
    author: { $in: createdUsers.map(u => u._id) } 
  });

  const posts = [
    {
      author: createdUsers[0]._id,
      authorName: createdUsers[0].name,
      authorEmail: createdUsers[0].email,
      authorInitial: createdUsers[0].name.charAt(0).toUpperCase(),
      text: '🎉 Welcome to AquaNet! This is our team collaboration platform where we can share project updates, upload images and videos, and stay connected. Let\'s make this project amazing!',
      likes: [],
      likesCount: 0,
      comments: [],
      shares: 0,
    },
    {
      author: createdUsers[1]._id,
      authorName: createdUsers[1].name,
      authorEmail: createdUsers[1].email,
      authorInitial: createdUsers[1].name.charAt(0).toUpperCase(),
      text: '📊 Just completed the initial project setup. All dependencies are installed and the development environment is ready. Next step: implementing the core features!',
      likes: [createdUsers[0]._id],
      likesCount: 1,
      comments: [],
      shares: 0,
    },
    {
      author: createdUsers[2]._id,
      authorName: createdUsers[2].name,
      authorEmail: createdUsers[2].email,
      authorInitial: createdUsers[2].name.charAt(0).toUpperCase(),
      text: '💡 Had a great brainstorming session today! We came up with some innovative solutions for the project challenges. Can\'t wait to implement them!',
      likes: [createdUsers[0]._id, createdUsers[1]._id],
      likesCount: 2,
      comments: [],
      shares: 0,
    },
  ];

  await Post.insertMany(posts);
  console.log(`✅ Created ${posts.length} sample posts`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📧 Login credentials (all users have same password):');
  console.log('   Email   : soumya@aquanet.com');
  console.log('   Email   : member2@aquanet.com');
  console.log('   Email   : member3@aquanet.com');
  console.log('   Email   : member4@aquanet.com');
  console.log('   Email   : member5@aquanet.com');
  console.log('   Password: password123');

  await mongoose.disconnect();
  console.log('\n✅ Disconnected from MongoDB');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
