# AquaNet Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Your `.env.local` is already configured with:
- MongoDB connection
- JWT secret
- Email configuration (update with your Gmail credentials)

### 3. Create Uploads Directory
```bash
mkdir -p public/uploads
```

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 👥 Setting Up Your Team

### Step 1: Create User Accounts
Each team member needs to register. You can use the seed script or create accounts manually.

#### Option A: Manual Registration (Recommended)
Since you don't have a registration page yet, you can create users directly in MongoDB:

1. Open MongoDB Compass or mongosh
2. Connect to your database
3. Insert users into the `users` collection:

```javascript
db.users.insertMany([
  {
    name: "Your Name",
    email: "your.email@example.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU7u3oi", // "password123"
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Team Member 2",
    email: "member2@example.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU7u3oi",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Add 3 more team members...
])
```

**Note**: The hashed password above is `password123`. Each user can change it later.

#### Option B: Create a Registration Page
Add a registration page at `app/register/page.tsx` (similar to login page).

### Step 2: First Login
1. Go to [http://localhost:3000/login](http://localhost:3000/login)
2. Login with any of the created accounts
3. You'll be redirected to the dashboard

### Step 3: Start Collaborating!
1. **Create your first post**: Share a project update
2. **Upload media**: Add images or videos of your work
3. **Connect with team**: Send connection requests
4. **Start chatting**: Use the messaging feature

## 📧 Email Configuration (Optional)

To enable password reset via email:

1. Create a Gmail App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App Passwords
   - Generate a new app password

2. Update `.env.local`:
```env
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=AquaNet <your.email@gmail.com>
```

## 🗄️ Database Collections

Your MongoDB database will have these collections:
- `users` - Team member accounts
- `posts` - All posts with media
- `messages` - Chat messages
- `connections` - Connection requests

## 🔧 Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution**: Check your `MONGODB_URI` in `.env.local`

### Issue: "File upload fails"
**Solution**: Ensure `public/uploads` directory exists and has write permissions

### Issue: "Images don't display"
**Solution**: Check that files are in `public/uploads/` and restart the dev server

### Issue: "Token expired"
**Solution**: Logout and login again. Tokens expire after 7 days.

### Issue: "Posts not loading"
**Solution**: Check browser console for errors. Ensure MongoDB is running.

## 🎨 Customization

### Change Theme Colors
Edit `app/dashboard/page.tsx` and update gradient classes:
```typescript
// Current: green/emerald theme
from-green-500 to-emerald-600

// Change to blue theme:
from-blue-500 to-cyan-600
```

### Add More Team Members
Simply create more user accounts in MongoDB. The system supports unlimited users.

### Modify Upload Limits
Edit `app/api/upload/route.ts`:
```typescript
const maxSize = 50 * 1024 * 1024; // Change 50MB to your preferred size
```

## 📱 Mobile Access

The dashboard is fully responsive! Team members can access it from:
- 💻 Desktop browsers
- 📱 Mobile phones
- 📲 Tablets

## 🔐 Security Tips

1. **Change Default Passwords**: Have each team member change their password
2. **Use Strong JWT Secret**: Update `JWT_SECRET` in `.env.local`
3. **Enable HTTPS**: Use HTTPS in production
4. **Backup Database**: Regularly backup your MongoDB database
5. **Keep Dependencies Updated**: Run `npm update` regularly

## 🚀 Deployment (Optional)

### Deploy to Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

**Note**: For file uploads in production, use cloud storage (AWS S3, Cloudinary) instead of local storage.

### Deploy to Your Own Server
1. Build the project: `npm run build`
2. Start production server: `npm start`
3. Use PM2 or similar for process management
4. Set up Nginx as reverse proxy

## 📊 Monitoring Usage

Check your MongoDB database to see:
- Number of posts created
- Messages sent
- Active users
- Storage used

## 🎯 Best Practices for Your Team

1. **Daily Updates**: Post project progress daily
2. **Use Descriptive Titles**: Make posts searchable
3. **Tag Team Members**: Mention relevant people in posts
4. **Organize Media**: Use consistent naming for uploads
5. **Regular Backups**: Backup important project media

## 💡 Feature Requests

Want to add more features? Check `FEATURES.md` for the roadmap!

Common requests:
- [ ] Video calls integration
- [ ] File attachments (PDFs, docs)
- [ ] Task management
- [ ] Calendar integration
- [ ] Project milestones

## 🆘 Need Help?

1. Check browser console for errors
2. Review MongoDB logs
3. Check `FEATURES.md` for documentation
4. Verify all environment variables are set

---

**Happy Collaborating! 🎉**

Your team now has a powerful platform to share progress, communicate, and stay connected throughout your project!
