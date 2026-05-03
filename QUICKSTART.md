# 🚀 AquaNet Quick Start Guide

## Get Started in 3 Minutes!

### Step 1: Seed the Database (30 seconds)
```bash
npm run seed
```

This creates:
- ✅ 5 team member accounts
- ✅ 3 sample posts
- ✅ All with password: `password123`

### Step 2: Create Uploads Folder (10 seconds)
```bash
mkdir public/uploads
```

### Step 3: Start the Server (10 seconds)
```bash
npm run dev
```

### Step 4: Login! (1 minute)
1. Open [http://localhost:3000/login](http://localhost:3000/login)
2. Login with:
   - **Email**: `soumya@aquanet.com`
   - **Password**: `password123`

## 🎉 You're Ready!

### What You Can Do Now:

#### 1. **Create a Post**
- Click the "What's on your mind?" box
- Type your message
- Click "Post"

#### 2. **Upload Media**
- Click "Photo/Video" button
- Select an image or video
- Add text (optional)
- Click "Post"

#### 3. **Like Posts**
- Click the "Like" button under any post
- Watch the counter update!

#### 4. **Chat with Team**
- Click the chat icon (💬) in top right
- Select a team member
- Start messaging!

#### 5. **Connect with Team**
- Look at the right sidebar
- Click "Connect" next to team members
- Build your network!

## 📧 All User Accounts

Login with any of these:

| Name | Email | Password |
|------|-------|----------|
| Soumyajyoti Banik | soumya@aquanet.com | password123 |
| Team Member 2 | member2@aquanet.com | password123 |
| Team Member 3 | member3@aquanet.com | password123 |
| Team Member 4 | member4@aquanet.com | password123 |
| Team Member 5 | member5@aquanet.com | password123 |

## 🎯 Try These Features:

### Post with Image
1. Click "Photo/Video"
2. Select an image from your computer
3. Add text: "Check out our project progress! 🚀"
4. Click "Post"

### Post with Video
1. Click "Photo/Video"
2. Select a video file (MP4, WebM)
3. Add text: "Demo of our latest feature 🎥"
4. Click "Post"

### Send a Message
1. Click chat icon (💬)
2. Select "Team Member 2"
3. Type: "Hey! Let's discuss the project"
4. Press Enter

### Like Multiple Posts
1. Scroll through the feed
2. Click "Like" on posts you enjoy
3. See the green highlight!

## 🔄 Reset Everything

Want to start fresh?

```bash
npm run seed
```

This will:
- Delete old users and posts
- Create fresh accounts
- Add new sample posts

## 📱 Test on Mobile

1. Find your computer's IP address:
   ```bash
   ipconfig
   ```

2. On your phone, visit:
   ```
   http://YOUR_IP:3000
   ```

3. Login and test the mobile experience!

## 🎨 Customize Your Profile

Each user has a unique avatar with their initial. The colors are automatically generated!

## 💡 Pro Tips

1. **Upload Project Photos**: Share daily progress
2. **Use Emojis**: Make posts more engaging 🎉
3. **Like Everything**: Show team support ❤️
4. **Chat Often**: Quick communication is key 💬
5. **Connect All**: Build your team network 🤝

## 🐛 Something Not Working?

### Posts not loading?
- Check MongoDB connection in `.env.local`
- Restart the dev server

### Can't upload files?
- Make sure `public/uploads` folder exists
- Check file size (max 50MB)

### Chat not working?
- Refresh the page
- Check browser console for errors

## 🎓 Learn More

- **Full Features**: See `FEATURES.md`
- **Setup Guide**: See `SETUP.md`
- **API Docs**: Check API routes in `app/api/`

## 🚀 Next Steps

1. **Invite Your Team**: Share login credentials
2. **Create Real Posts**: Share actual project updates
3. **Upload Media**: Add images/videos of your work
4. **Stay Connected**: Use chat for quick discussions
5. **Track Progress**: Review posts to see how far you've come!

---

**That's it! You're now ready to collaborate with your team! 🎉**

Need help? Check the other documentation files or the code comments.

Happy collaborating! 🚀
