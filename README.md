# Aquanet - Fisheries Intelligence & Robotics Collaboration Platform

A modern, professional social networking platform built with Next.js 16, designed for fisheries intelligence and robotics collaboration. Features real-time authentication, secure password management, and an intuitive LinkedIn-like interface.

## 🌟 Features

### Authentication & Security
- **Secure Login/Signup** - JWT-based authentication with secure token management
- **Forgot Password Flow** - 3-step OTP-based password reset with 10-minute expiration
- **Email Verification** - OTP verification system with 6-digit codes
- **Password Strength Meter** - 5-bar visual indicator for password requirements
- **Rate Limiting** - Server-side rate limiting on authentication endpoints
- **Admin Alerts** - Email notifications when passwords are changed

### Dashboard Features
- **Floating Navbar** - Glassmorphic design with backdrop blur effects
- **Profile Card** - Identity card-style profile with sticky positioning
- **Notification System** - Real-time notifications with mark as read and clear all functionality
- **Components Library** - Showcase of all UI components used in the project
- **Social Feed** - Create, view, and interact with posts
- **Profile Dropdown** - Quick access to settings, profile, and logout

### UI/UX Enhancements
- **Professional Styling** - Clean, modern design without unnecessary bulk
- **Responsive Layout** - Works seamlessly on desktop and mobile devices
- **Smooth Animations** - Sliding animations and fade effects on dropdowns
- **Network Indicator** - Live network strength monitoring
- **Loading States** - Animated spinners and skeleton loaders
- **Toast Notifications** - User-friendly feedback messages

### Technology Stack
- **Framework** - Next.js 16 with App Router
- **Styling** - Tailwind CSS 4 with custom utilities
- **UI Components** - shadcn/ui with Radix UI primitives
- **Icons** - lucide-react for all icon needs
- **Database** - MongoDB with Mongoose 9.x
- **Authentication** - JWT tokens with secure storage
- **Email** - Nodemailer with Gmail SMTP
- **Fonts** - Averia Gruesa Libre, Josefin Sans, Nunito

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB instance
- Gmail account with App Password for email

### Installation

1. Clone the repository:
```bash
git clone https://github.com/emphaticHarp/aquanet.git
cd aquanet
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env.local`:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aquanet

# JWT
JWT_SECRET=your-secret-key-here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@aquanet.com
ADMIN_EMAIL=admin@aquanet.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Test Credentials
```
Email: test@example.com
Password: password123
```

## 📁 Project Structure

```
aquanet/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── login/
│   │       ├── signup/
│   │       ├── forgot-password/
│   │       ├── reset-password/
│   │       ├── verify-otp/
│   │       ├── verify/
│   │       └── logout/
│   ├── dashboard/
│   ├── forgot-password/
│   ├── page.tsx (Login)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── alert.tsx
│   │   ├── button.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input-otp.tsx
│   │   ├── skeleton.tsx
│   │   └── sonner.tsx
│   └── NetworkIndicator.tsx
├── lib/
│   ├── db.ts (MongoDB connection)
│   ├── mailer.ts (Email service)
│   ├── models/
│   │   └── user.ts
│   └── utils.ts
├── scripts/
│   ├── createTestUser.js
│   ├── testEmail.js
│   └── testOTP.js
└── public/
    ├── aqua1.png
    ├── Flag_of_India.png
    └── logo.png
```

## 🔐 Authentication Flow

### Login
1. User enters email and password
2. Server validates credentials against MongoDB
3. JWT token generated and stored securely
4. User redirected to dashboard
5. Session verified on dashboard load

### Signup
1. User provides email and password
2. Password strength validated (minimum 8 characters)
3. User created in MongoDB with hashed password
4. Automatic login after signup
5. Welcome email sent

### Forgot Password
1. **Step 1** - User enters email, OTP sent via email
2. **Step 2** - User enters 6-digit OTP (10-minute expiration)
3. **Step 3** - User sets new password with strength meter
4. Admin notified of password change
5. User redirected to login

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/reset-password` - Reset password with OTP
- `GET /api/auth/verify` - Verify current session

### Health
- `GET /api/health` - API health check

## 🎨 UI Components

### shadcn/ui Components
- **Alert** - Alert dialogs and notifications
- **Button** - Reusable button component
- **Dropdown Menu** - Profile and notification menus
- **Input OTP** - 6-digit OTP input field
- **Skeleton** - Loading state placeholders
- **Sonner** - Toast notifications

### Custom Components
- **NetworkIndicator** - Live network strength monitoring
- **Profile Card** - User identity card with details
- **Notification Dropdown** - Real-time notifications

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-factor authentication on Gmail
2. Generate App Password (not regular password)
3. Use App Password in `SMTP_PASS` environment variable

### Email Templates
- Welcome email on signup
- OTP verification email
- Password reset confirmation
- Admin notification on password change

## 🔧 Database Schema

### User Model
```javascript
{
  email: String (unique),
  password: String (hashed with bcryptjs),
  role: String (default: 'member'),
  createdAt: Date,
  updatedAt: Date,
  resetToken: String (optional),
  resetTokenExpiry: Date (optional),
  otpCode: String (optional),
  otpExpiry: Date (optional)
}
```

## 🚨 Error Handling

- **IPv6 DNS Issues** - Forced IPv4 with `family: 4` option
- **Connection Timeouts** - 30-second timeout with 3 retries
- **Pre-save Hooks** - Removed for Mongoose 9.x compatibility
- **Rate Limiting** - 5 requests per minute per IP on auth endpoints

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Sticky components for better UX
- Touch-friendly button sizes

## 🎯 Performance Optimizations

- Image lazy loading with `loading="eager"` for LCP
- Optimized font loading with preconnect
- Backdrop blur with GPU acceleration
- Efficient state management with React hooks
- Debounced network monitoring

## 🔒 Security Features

- JWT token-based authentication
- Bcryptjs password hashing (10 salt rounds)
- Server-side rate limiting
- HTTPS-only in production
- Secure cookie handling
- Input validation and sanitization
- CORS protection

## 📝 Scripts

### Create Test User
```bash
node scripts/createTestUser.js
```

### Test Email Configuration
```bash
node scripts/testEmail.js
```

### Test OTP System
```bash
node scripts/testOTP.js
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Check `MONGODB_URI` format
- Verify IP whitelist in MongoDB Atlas
- Ensure network connectivity
- Check firewall settings

### Email Not Sending
- Verify Gmail App Password (not regular password)
- Check SMTP credentials in `.env.local`
- Ensure 2FA is enabled on Gmail
- Check spam folder

### OTP Expiration
- OTP expires after 10 minutes
- User can request new OTP
- Check server time synchronization

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [MongoDB](https://www.mongodb.com)
- [Mongoose](https://mongoosejs.com)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👥 Team

Built with ❤️ by the Aquanet team for fisheries intelligence and robotics collaboration.

---

**Last Updated:** April 2026
**Version:** 1.0.0
**Status:** Production Ready
