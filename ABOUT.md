# About Aquanet

## 🌊 Project Overview

Aquanet is a modern, professional social networking platform designed specifically for the fisheries intelligence and robotics collaboration community. It combines cutting-edge web technologies with a user-friendly interface to facilitate seamless communication and collaboration among professionals in the industry.

## 🎯 Mission

To empower fisheries professionals and robotics enthusiasts by providing a secure, intuitive platform for sharing knowledge, collaborating on projects, and building meaningful professional connections.

## 💡 Vision

Creating a global community where fisheries intelligence and robotics innovation converge, driving sustainable practices and technological advancement in the fishing industry.

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS 4 with custom utilities
- **UI Library**: shadcn/ui with Radix UI primitives
- **Icons**: lucide-react
- **State Management**: React Hooks
- **Fonts**: Averia Gruesa Libre, Josefin Sans, Nunito

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **Email**: Nodemailer with Gmail SMTP
- **Security**: bcryptjs for password hashing

### Infrastructure
- **Hosting**: Vercel (recommended)
- **Database**: MongoDB Atlas
- **Email Service**: Gmail SMTP
- **Version Control**: Git/GitHub

## 🔑 Key Features

### 1. Secure Authentication
- Email/password login and signup
- JWT-based session management
- Secure password hashing with bcryptjs
- Rate limiting on auth endpoints
- Session verification on protected routes

### 2. Advanced Password Management
- 3-step forgot password flow with OTP
- 6-digit OTP with 10-minute expiration
- Password strength meter (5-bar indicator)
- Admin notifications on password changes
- Email verification system

### 3. Professional Dashboard
- LinkedIn-like interface
- Floating glassmorphic navbar
- Sticky profile card with user details
- Real-time notification system
- Social feed for posts and updates
- Components library showcase

### 4. User Experience
- Smooth animations and transitions
- Loading states with skeleton screens
- Toast notifications for feedback
- Network strength indicator
- Responsive design for all devices
- Accessibility features (ARIA labels)

### 5. Security & Performance
- Server-side rate limiting
- IPv4-forced MongoDB connections
- Exponential backoff retry mechanism
- Image lazy loading optimization
- Efficient state management
- CORS protection

## 📊 Technology Decisions

### Why Next.js 16?
- Latest breaking changes with improved performance
- App Router for better code organization
- Built-in API routes for backend
- Automatic code splitting and optimization
- Excellent TypeScript support

### Why MongoDB?
- Flexible schema for user data
- Scalable for growing user base
- Easy integration with Mongoose
- Cloud hosting with MongoDB Atlas
- Strong community support

### Why Tailwind CSS?
- Utility-first approach for rapid development
- Highly customizable design system
- Excellent responsive design support
- Small bundle size with PurgeCSS
- Great developer experience

### Why shadcn/ui?
- Unstyled, accessible components
- Built on Radix UI primitives
- Easy to customize and extend
- Copy-paste component approach
- No dependency lock-in

## 🎨 Design Philosophy

### Principles
1. **Simplicity** - Clean, uncluttered interface
2. **Professionalism** - Business-appropriate styling
3. **Accessibility** - WCAG compliance considerations
4. **Performance** - Fast load times and smooth interactions
5. **Responsiveness** - Works on all device sizes

### Color Palette
- **Primary**: Emerald/Teal (trust, growth)
- **Secondary**: Blue (professionalism)
- **Accent**: Orange (energy, innovation)
- **Neutral**: Gray scale (clarity)

### Typography
- **Headings**: Josefin Sans (modern, clean)
- **Body**: Nunito (readable, friendly)
- **Display**: Averia Gruesa Libre (distinctive)

## 🔐 Security Measures

### Authentication
- JWT tokens with secure expiration
- Bcryptjs password hashing (10 salt rounds)
- Secure token storage (httpOnly cookies)
- Session verification on protected routes

### Data Protection
- MongoDB connection with IPv4 forcing
- Input validation and sanitization
- Rate limiting on sensitive endpoints
- CORS protection
- HTTPS enforcement in production

### Email Security
- Gmail App Passwords (not regular passwords)
- Secure SMTP connection
- OTP-based verification
- Admin notification system

## 📈 Scalability

### Current Capacity
- Handles thousands of concurrent users
- MongoDB Atlas auto-scaling
- Vercel serverless functions
- CDN for static assets

### Future Improvements
- Redis caching layer
- Database indexing optimization
- GraphQL API option
- Real-time WebSocket support
- Microservices architecture

## 🚀 Deployment

### Recommended Hosting
- **Frontend/Backend**: Vercel
- **Database**: MongoDB Atlas
- **Email**: Gmail SMTP or SendGrid
- **CDN**: Vercel Edge Network

### Environment Setup
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NEXT_PUBLIC_APP_URL=https://aquanet.com
```

## 📚 Documentation

### For Developers
- API endpoint documentation
- Component library guide
- Database schema reference
- Deployment instructions
- Troubleshooting guide

### For Users
- Getting started guide
- Feature tutorials
- FAQ section
- Support contact information

## 🤝 Community

### Contributing
We welcome contributions from the community! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Code of Conduct
- Be respectful and inclusive
- Follow coding standards
- Write clear commit messages
- Test your changes thoroughly

## 📞 Support

### Getting Help
- Check the README.md for common issues
- Review API documentation
- Check GitHub issues for solutions
- Contact the development team

### Reporting Bugs
- Use GitHub Issues
- Include detailed reproduction steps
- Provide error messages and logs
- Specify your environment

## 🎓 Learning Resources

### Official Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MongoDB](https://docs.mongodb.com)
- [Mongoose](https://mongoosejs.com/docs)

### Tutorials
- Next.js App Router guide
- Tailwind CSS utility-first approach
- MongoDB data modeling
- JWT authentication patterns

## 🏆 Achievements

### Milestones
- ✅ Secure authentication system
- ✅ Advanced password management
- ✅ Professional dashboard UI
- ✅ Real-time notifications
- ✅ Responsive design
- ✅ Production-ready deployment

### Future Goals
- 🎯 Mobile app (React Native)
- 🎯 Real-time chat system
- 🎯 Video conferencing integration
- 🎯 Advanced analytics dashboard
- 🎯 AI-powered recommendations

## 📄 License

Aquanet is open source and available under the MIT License. See LICENSE file for details.

## 👥 Team

Built with passion by the Aquanet development team, dedicated to advancing fisheries intelligence and robotics collaboration.

### Core Team
- **Project Lead**: Soumyajyoti Banik
- **Full Stack Developer**: Development Team
- **UI/UX Designer**: Design Team

## 🙏 Acknowledgments

Special thanks to:
- The Next.js community
- shadcn/ui contributors
- MongoDB team
- All our users and supporters

## 📞 Contact

- **Email**: contact@aquanet.com
- **GitHub**: https://github.com/emphaticHarp/aquanet
- **Website**: https://aquanet.com

---

**Last Updated**: April 2026
**Version**: 1.0.0
**Status**: Production Ready

*Aquanet - Mega Ideas, Mega Impact 🇮🇳*
