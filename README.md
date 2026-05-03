# 🌊 AquaNet - Team Collaboration Platform

A modern, full-stack social network platform built for team collaboration, featuring real-time messaging, media uploads, and project progress tracking.

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black)
![React](https://img.shields.io/badge/React-19.2.4-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-cyan)

## ✨ Features

- 📝 **Create Posts** with text, images, and videos
- 💬 **Real-time Messaging** with team members
- ❤️ **Like & Engage** with posts
- 🤝 **Team Connections** and networking
- 📸 **Media Upload** (images up to 50MB, videos supported)
- 🌙 **Dark Mode** support
- 📱 **Fully Responsive** design
- 🔐 **Secure Authentication** with JWT
- 💾 **MongoDB** database integration

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed the Database
```bash
npm run seed
```

This creates 5 team member accounts and sample posts.

### 3. Create Uploads Folder
```bash
mkdir public/uploads
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Login
Open [http://localhost:3000/login](http://localhost:3000/login)

**Login Credentials:**
- Email: `soumya@aquanet.com`
- Password: `password123`

(Or use any of the 5 seeded accounts - see `QUICKSTART.md`)

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 3 minutes
- **[FEATURES.md](FEATURES.md)** - Complete feature documentation
- **[SETUP.md](SETUP.md)** - Detailed setup guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical overview

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.2.4** - React framework with App Router
- **React 19.2.4** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **Shadcn/ui** - UI components
- **React Icons** - Icon library

### Backend
- **Next.js API Routes** - Serverless functions
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service

## 📁 Project Structure

```
aquanet/
├── app/
│   ├── api/              # API routes
│   │   ├── posts/        # Post CRUD operations
│   │   ├── messages/     # Messaging system
│   │   ├── users/        # User management
│   │   └── upload/       # File upload handler
│   ├── dashboard/        # Main dashboard page
│   ├── login/            # Login & password reset
│   └── layout.tsx        # Root layout
├── components/ui/        # Reusable UI components
├── lib/                  # Utility functions
│   ├── api.ts           # API client
│   ├── mongodb.ts       # Database connection
│   └── email.ts         # Email service
├── models/              # Mongoose schemas
│   ├── User.ts
│   ├── Post.ts
│   ├── Message.ts
│   └── Connection.ts
├── public/
│   └── uploads/         # Uploaded files
└── scripts/
    └── seed.ts          # Database seeding
```

## 🎯 Use Cases

Perfect for:
- 👥 Small team collaboration (5-10 members)
- 📊 Project progress tracking
- 📸 Sharing visual updates
- 💬 Quick team communication
- 🎉 Celebrating milestones

## 🔐 Environment Variables

Create a `.env.local` file (already configured):

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=AquaNet <your_email@gmail.com>
```

## 📝 API Endpoints

### Posts
- `GET /api/posts` - Fetch all posts
- `POST /api/posts` - Create a new post
- `POST /api/posts/[id]/like` - Toggle like
- `POST /api/posts/[id]/comment` - Add comment
- `DELETE /api/posts/[id]` - Delete post

### Messages
- `GET /api/messages?userId={id}` - Get messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get conversations

### Users
- `GET /api/users` - Get all team members
- `POST /api/users/[id]/connect` - Send connection request

### Upload
- `POST /api/upload` - Upload image or video

## 🎨 Features in Detail

### Post Creation
- Write text posts
- Upload images (JPEG, PNG, GIF, WebP)
- Upload videos (MP4, WebM, QuickTime)
- Preview before posting
- Delete your own posts

### Messaging
- Real-time chat interface
- Message history
- Unread indicators
- Online/offline status

### Engagement
- Like/unlike posts
- Real-time like counters
- Comment system (backend ready)
- Share functionality

### Team Management
- View all team members
- Send connection requests
- Track connection status
- Team member profiles

## 🚧 Roadmap

- [ ] Comment UI implementation
- [ ] WebSocket integration for real-time updates
- [ ] Cloud storage (AWS S3/Cloudinary)
- [ ] Notification system
- [ ] User profile pages
- [ ] Post editing
- [ ] Search functionality
- [ ] Pagination

## 🤝 Contributing

This is a team project. To contribute:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit for review

## 📄 License

This project is private and intended for team use only.

## 🙏 Acknowledgments

- **Megabotics** - Mega Ideas, Mega Impact
- Built with ❤️ for team collaboration

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review the code comments
3. Contact the team lead

---

**Made with 🌊 by the AquaNet Team**

Start collaborating today! 🚀
