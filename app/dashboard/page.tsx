'use client';

import { useState, useEffect } from 'react';
import { 
  LogOut, Settings, Heart, MessageCircle, Share2, Search,
  ThumbsUp, Send, MoreHorizontal, Zap, Lock, MapPin, Calendar, Mail, Phone, BookOpen, CreditCard, ChevronDown,
  Image as ImageIcon, Video, FileText, CheckCircle, Award, Sparkles, User, Bell, Trash2, Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Post {
  id: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  badge?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'Soumyajyoti Banik',
      role: 'Team Member',
      company: 'Aquanet',
      avatar: 'SB',
      content: 'Excited to announce that I\'ve joined the Aquanet team! Looking forward to collaborating with amazing people in fisheries intelligence and robotics. Let\'s revolutionize the industry together!',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 5,
      shares: 3,
      liked: false,
      badge: 'New Member',
    },
    {
      id: '2',
      author: 'MegaBotics',
      role: 'Company',
      company: 'MegaBotics Inc.',
      avatar: 'MB',
      content: 'Introducing Aquanet - Empowering Fisheries Intelligence & Robotics Collaboration. Join us in revolutionizing the fishing industry with AI-powered solutions. Together, we\'re building the future of sustainable fisheries!',
      image: '/logo.png',
      timestamp: '1 day ago',
      likes: 156,
      comments: 32,
      shares: 18,
      liked: false,
      badge: 'Verified',
    },
    {
      id: '3',
      author: 'Dr. Amit Verma',
      role: 'Lead Researcher',
      company: 'Aquanet',
      avatar: 'AV',
      content: 'Our latest research shows a 45% improvement in fisheries efficiency using AI-powered robotics. The future is here, and it\'s sustainable! Check out our full report in the comments.',
      timestamp: '3 hours ago',
      likes: 89,
      comments: 12,
      shares: 7,
      liked: false,
    },
  ]);

  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [postContent, setPostContent] = useState('');

  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Soumyajyoti liked your post', timestamp: '5 minutes ago', read: false },
    { id: 2, message: 'New comment on your post', timestamp: '1 hour ago', read: false },
    { id: 3, message: 'You have a new connection request', timestamp: '2 hours ago', read: true },
    { id: 4, message: 'Your post reached 100 likes', timestamp: '3 hours ago', read: true },
  ]);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch('/api/auth/verify');
        if (!res.ok) {
          setSessionExpired(true);
          toast.error('Session expired', {
            description: 'Please log in again to continue.',
          });
          setTimeout(() => {
            router.push('/');
          }, 2000);
          return;
        }

        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        setSessionExpired(true);
        toast.error('Session verification failed', {
          description: 'Please log in again.',
        });
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } finally {
        setIsVerifying(false);
      }
    };

    verifySession();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('user');
    router.push('/');
  };

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handlePostSubmit = () => {
    if (postContent.trim()) {
      const newPost: Post = {
        id: Date.now().toString(),
        author: user?.email?.split('@')[0] || 'User',
        role: 'Team Member',
        company: 'Aquanet',
        avatar: 'U',
        content: postContent,
        timestamp: 'now',
        likes: 0,
        comments: 0,
        shares: 0,
        liked: false,
      };
      setPosts([newPost, ...posts]);
      setPostContent('');
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-nunito">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (sessionExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <Lock className="w-4 h-4" />
            <AlertTitle>Session Expired</AlertTitle>
            <AlertDescription>
              Your session has expired. Please log in again to continue.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header - Floating Navbar */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-6xl">
        <div className="bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/20 px-6 py-3 flex items-center justify-between">
          {/* Logo - Left */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Image 
              src="/aqua1.png" 
              alt="Aquanet Logo" 
              width={120} 
              height={122}
              className="drop-shadow-sm"
              style={{ height: 'auto', width: 'auto' }}
            />
            <div className="bg-orange-100 rounded-full px-4 py-2 flex items-center gap-2 whitespace-nowrap">
              <span className="text-xs font-bold">
                <span className="text-orange-600">Mega Ideas</span>
                <span className="text-gray-600">, Mega </span>
                <span className="text-emerald-600">Impact</span>
              </span>
              <Image 
                src="/Flag_of_India.png" 
                alt="India Flag" 
                width={24} 
                height={16}
                className="drop-shadow-sm rounded-md"
                style={{ height: 'auto', width: 'auto' }}
              />
            </div>
          </div>

          {/* Search Bar - Middle */}
          <div className="flex-1 max-w-sm mx-3">
            <div className="flex items-center bg-gray-100/50 rounded-full px-4 py-2 hover:bg-gray-100 transition-colors group">
              <Search className="w-4 h-4 text-gray-500 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent ml-3 outline-none w-full text-sm text-gray-700 placeholder-gray-500 font-nunito"
              />
            </div>
          </div>

          {/* Notification Icon */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900 relative">
                  <Bell className="w-5 h-5" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80" sideOffset={25}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 font-josefin">Notifications</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={markAllAsRead}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                      title="Mark all as read"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={clearAllNotifications}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                      title="Clear all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {notifications.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notif.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notif.read ? 'bg-gray-300' : 'bg-blue-600'}`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 font-nunito">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-nunito">No notifications</p>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Actions - Profile Dropdown */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-gray-200 bg-gray-100 rounded-full px-3 py-2 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {user?.email?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <span className="text-sm font-semibold text-gray-900 hidden sm:inline max-w-[100px] truncate">
                    {user?.email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" sideOffset={19}>
                <DropdownMenuLabel className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-gray-900">{user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>View Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span>Help & Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content - Add top padding for floating navbar */}
      <main className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Profile */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card - Modern Design */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow sticky top-24">
              {/* Top Section with Avatar */}
              <div className="relative pt-8 pb-6 px-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full border-4 border-white flex items-center justify-center text-3xl font-bold text-white shadow-lg mx-auto mb-4">
                  {user?.email?.[0]?.toUpperCase() || 'A'}
                </div>
                <h2 className="text-xl font-bold text-gray-900 font-josefin">
                  {user?.email?.split('@')[0] || 'User'}
                </h2>
                <p className="text-sm text-emerald-600 font-semibold mt-1">
                  {user?.role === 'member' ? 'Team Member' : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </p>
                <div className="mt-3 inline-block px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Active Member
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

              {/* Details Section */}
              <div className="px-6 py-6 space-y-4">
                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-semibold">Email</p>
                    <p className="text-sm text-gray-900 font-nunito truncate">{user?.email || 'user@example.com'}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold">Phone</p>
                    <p className="text-sm text-gray-900 font-nunito">+91 98765 43210</p>
                  </div>
                </div>

                {/* Education */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold">Education</p>
                    <p className="text-sm text-gray-900 font-nunito">B.Tech CS • IIT Bombay</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold">Location</p>
                    <p className="text-sm text-gray-900 font-nunito">Mumbai, Maharashtra</p>
                  </div>
                </div>

                {/* Member ID */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold">Member ID</p>
                    <p className="text-sm text-gray-900 font-mono font-semibold">AQ-2024-001</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold">Skills</p>
                    <p className="text-sm text-gray-900 font-nunito">AI, Robotics, ML</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-gray-100">
                <p className="text-xs text-gray-600 text-center font-nunito">
                  Member since <span className="font-semibold text-gray-900">January 2024</span>
                </p>
              </div>
            </div>
          </div>

          {/* Center - Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                  {user?.email?.[0]?.toUpperCase() || 'A'}
                </div>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share your thoughts, updates, or achievements..."
                  className="flex-1 bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all py-2 rounded-lg font-semibold text-sm">
                  <ImageIcon className="w-4 h-4" />
                  Photo
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all py-2 rounded-lg font-semibold text-sm">
                  <Video className="w-4 h-4" />
                  Video
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all py-2 rounded-lg font-semibold text-sm">
                  <FileText className="w-4 h-4" />
                  Article
                </button>
                <button
                  onClick={handlePostSubmit}
                  disabled={!postContent.trim()}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-2 rounded-lg transition-all font-semibold text-sm shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Post
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow overflow-hidden">
                {/* Post Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md">
                        {post.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 text-sm">{post.author}</h3>
                          {post.badge && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                              {post.badge === 'Verified' ? <CheckCircle className="w-3 h-3" /> : <Award className="w-3 h-3" />}
                              {post.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-xs font-semibold">{post.role} at {post.company}</p>
                        <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.timestamp}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                <div className="px-6 py-4">
                  <p className="text-gray-900 text-sm leading-relaxed font-nunito">{post.content}</p>
                </div>

                {/* Post Image */}
                {post.image && (
                  <div className="px-6 pb-4">
                    <div className="rounded-lg overflow-hidden bg-gray-100 h-64 flex items-center justify-center border border-gray-200">
                      <Image
                        src={post.image}
                        alt="Post"
                        width={400}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Post Stats */}
                <div className="px-6 py-3 border-t border-gray-100 flex justify-between text-xs text-gray-600 bg-gray-50">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold">{post.likes} likes</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="font-semibold">{post.comments} comments</span>
                    <span className="font-semibold">{post.shares} shares</span>
                  </div>
                </div>

                {/* Post Actions */}
                <div className="px-6 py-4 flex justify-around border-t border-gray-100">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all font-semibold text-sm ${
                      likedPosts.has(post.id)
                        ? 'text-red-600 bg-red-50 hover:bg-red-100'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                    Like
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-gray-100 transition-all font-semibold text-sm text-gray-600">
                    <MessageCircle className="w-5 h-5" />
                    Comment
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-gray-100 transition-all font-semibold text-sm text-gray-600">
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Sidebar - Components List */}
          <div className="lg:col-span-1 space-y-6">
            {/* Components Widget */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 font-josefin">Components</h3>
              </div>

              <div className="space-y-3">
                <div className="hover:bg-blue-50 p-3 rounded-lg transition-colors cursor-pointer border-l-4 border-blue-600">
                  <p className="font-semibold text-gray-900 text-sm">Alert</p>
                  <p className="text-gray-600 text-xs mt-1">UI Component • Alert Dialog</p>
                </div>
                <div className="hover:bg-blue-50 p-3 rounded-lg transition-colors cursor-pointer border-l-4 border-green-600">
                  <p className="font-semibold text-gray-900 text-sm">Button</p>
                  <p className="text-gray-600 text-xs mt-1">UI Component • Interactive</p>
                </div>
                <div className="hover:bg-blue-50 p-3 rounded-lg transition-colors cursor-pointer border-l-4 border-purple-600">
                  <p className="font-semibold text-gray-900 text-sm">Input OTP</p>
                  <p className="text-gray-600 text-xs mt-1">UI Component • Form Input</p>
                </div>
                <div className="hover:bg-blue-50 p-3 rounded-lg transition-colors cursor-pointer border-l-4 border-orange-600">
                  <p className="font-semibold text-gray-900 text-sm">Skeleton</p>
                  <p className="text-gray-600 text-xs mt-1">UI Component • Loading State</p>
                </div>
                <div className="hover:bg-blue-50 p-3 rounded-lg transition-colors cursor-pointer border-l-4 border-red-600">
                  <p className="font-semibold text-gray-900 text-sm">Sonner</p>
                  <p className="text-gray-600 text-xs mt-1">UI Component • Toast Notifications</p>
                </div>
                <div className="hover:bg-blue-50 p-3 rounded-lg transition-colors cursor-pointer border-l-4 border-indigo-600">
                  <p className="font-semibold text-gray-900 text-sm">Dropdown Menu</p>
                  <p className="text-gray-600 text-xs mt-1">UI Component • Menu</p>
                </div>
                <div className="hover:bg-blue-50 p-3 rounded-lg transition-colors cursor-pointer border-l-4 border-cyan-600">
                  <p className="font-semibold text-gray-900 text-sm">NetworkIndicator</p>
                  <p className="text-gray-600 text-xs mt-1">Custom Component • Network Status</p>
                </div>
              </div>

              <button className="w-full mt-4 text-blue-600 font-semibold text-sm hover:text-blue-700 hover:bg-blue-50 py-2 rounded-lg transition-all">
                View all components →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
