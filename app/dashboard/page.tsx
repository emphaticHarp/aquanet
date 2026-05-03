'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { postsAPI, messagesAPI, usersAPI, uploadAPI, presenceAPI } from '@/lib/api';
import NetworkIndicator from '@/components/NetworkIndicator';
import {
  FaHome,
  FaNetworkWired,
  FaChartBar,
  FaRobot,
  FaCog,
  FaBell,
  FaSearch,
  FaThumbsUp,
  FaComment,
  FaShare,
  FaUserPlus,
  FaSignOutAlt,
  FaWater,
  FaLeaf,
  FaEllipsisH,
  FaImage,
  FaVideo,
  FaSmile,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaCircle,
  FaLinkedin,
  FaBriefcase,
  FaCommentDots,
  FaPaperPlane,
  FaTimes,
  FaRegSmile,
  FaMoon,
  FaSun,
  FaTrash,
  FaPaperclip,
  FaLock,
  FaFile,
  FaDownload,
} from 'react-icons/fa';

// Dynamic import for emoji picker to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

// ─── Falling Leaves (client-only to avoid hydration mismatch) ─────────────────
function FallingLeaves() {
  const [leaves, setLeaves] = useState<Array<{
    id: number; left: number; delay: number; duration: number;
    size: number; rotation: number; opacity: number;
  }>>([]);

  useEffect(() => {
    setLeaves(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 12,
        duration: 10 + Math.random() * 8,
        size: 12 + Math.random() * 16,
        rotation: Math.random() * 360,
        opacity: 0.15 + Math.random() * 0.25,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* 3D floating orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-green-300/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 -right-32 w-80 h-80 bg-gradient-to-br from-teal-300/20 to-green-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-br from-lime-300/15 to-emerald-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      {/* Rotating 3D rings */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 border border-green-300/20 rounded-full" style={{ animation: 'spin3d 20s linear infinite' }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border border-emerald-300/15 rounded-full" style={{ animation: 'spin3d 30s linear infinite reverse' }} />
      {/* Falling leaves */}
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute text-green-500"
          style={{
            left: `${leaf.left}%`,
            top: '-40px',
            fontSize: `${leaf.size}px`,
            opacity: leaf.opacity,
            animation: `leafFall ${leaf.duration}s linear ${leaf.delay}s infinite`,
            transform: `rotate(${leaf.rotation}deg)`,
          }}
        >
          <FaLeaf />
        </div>
      ))}
      <style>{`
        @keyframes leafFall {
          0%   { top: -40px; transform: translateX(0) rotate(0deg); opacity: 0; }
          5%   { opacity: 1; }
          50%  { transform: translateX(40px) rotate(180deg); }
          95%  { opacity: 0.8; }
          100% { top: 100vh; transform: translateX(-40px) rotate(360deg); opacity: 0; }
        }
        @keyframes spin3d {
          from { transform: rotate(0deg) rotateX(20deg); }
          to   { transform: rotate(360deg) rotateX(20deg); }
        }
      `}</style>
    </div>
  );
}

// ─── LinkedIn section data ────────────────────────────────────────────────────
const LINKEDIN_PROFILE = {
  connections: 312,
  profileViews: 48,
  postImpressions: 1240,
};

const LINKEDIN_JOBS = [
  { id: 1, title: 'Aquaculture Data Analyst', company: 'BlueTech Labs', location: 'Remote', type: 'Full-time' },
  { id: 2, title: 'Marine IoT Engineer', company: 'OceanSense Inc.', location: 'Hybrid', type: 'Contract' },
  { id: 3, title: 'Fisheries AI Researcher', company: 'AquaNet R&D', location: 'On-site', type: 'Full-time' },
];

// ─── Chat types & data ────────────────────────────────────────────────────────
interface ChatMessage { 
  id: string | number; 
  from: 'me' | 'them'; 
  text: string; 
  time: string; 
  createdAt?: Date;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'file';
  fileName?: string;
  fileSize?: number;
}
interface ChatContact {
  id: string; name: string; email: string; role?: string; gradient: string; initial: string;
  online: boolean; unread: number; messages: ChatMessage[];
  lastMessage?: { text: string; time: Date } | null;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserInfo {
  name: string;
  email: string;
}

interface Post {
  _id: string;
  author: string;
  authorName: string;
  authorEmail: string;
  authorInitial: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: string[];
  likesCount: number;
  comments: Array<{
    _id: string;
    author: string;
    authorName: string;
    authorInitial: string;
    text: string;
    createdAt: Date;
  }>;
  shares: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  initial: string;
  role: string;
  gradient: string;
  connectionStatus: 'none' | 'pending' | 'accepted' | 'rejected';
}

// ─── Static data ──────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { icon: FaHome, label: 'Home', active: true },
  { icon: FaNetworkWired, label: 'Network' },
  { icon: FaWater, label: 'Monitoring' },
  { icon: FaChartBar, label: 'Reports' },
  { icon: FaRobot, label: 'Robots' },
  { icon: FaCog, label: 'Settings' },
];

const QUICK_STATS = [
  { label: 'Connections', value: '248' },
  { label: 'Active Sensors', value: '12' },
  { label: 'Reports', value: '34' },
];

const STORIES = [
  { id: 1, author: 'AquaBot-01', gradient: 'from-green-400 to-emerald-600', emoji: '🤖', label: 'Robot Patrol' },
  { id: 2, author: 'Tank A', gradient: 'from-blue-400 to-cyan-600', emoji: '💧', label: 'pH: 7.2' },
  { id: 3, author: 'Zone 3', gradient: 'from-teal-400 to-green-600', emoji: '🌿', label: 'All Clear' },
  { id: 4, author: 'Sensor-07', gradient: 'from-emerald-400 to-lime-600', emoji: '📡', label: 'Live Data' },
  { id: 5, author: 'Feed Sys', gradient: 'from-lime-400 to-green-500', emoji: '🐟', label: 'Cycle Done' },
];

const TRENDING_TOPICS = [
  { id: 1, tag: '#AquacultureTech', posts: '1.2k posts' },
  { id: 2, tag: '#WaterQuality2025', posts: '847 posts' },
  { id: 3, tag: '#SmartFarming', posts: '3.4k posts' },
];

const SYSTEM_STATUS = [
  { label: 'Water Sensors', status: 'online', color: 'bg-green-500' },
  { label: 'Robot Fleet', status: 'online', color: 'bg-green-500' },
  { label: 'Feed System', status: 'warning', color: 'bg-yellow-500' },
];

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return new Date(date).toLocaleDateString();
}


// ─── Chat Panel ───────────────────────────────────────────────────────────────
function ChatPanel({ userInitial, userId, open, onClose, contacts }: { userInitial: string; userId: string; open: boolean; onClose: () => void; contacts: ChatContact[] }) {
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const presenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const totalUnread = contacts.reduce((s, c) => s + c.unread, 0);

  // All hooks must be before any early return
  useEffect(() => {
    if (!open) {
      setTimeout(() => setActiveContact(null), 300);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (presenceIntervalRef.current) {
        clearInterval(presenceIntervalRef.current);
      }
    } else {
      // Start heartbeat when chat is open
      presenceAPI.sendHeartbeat();
      presenceIntervalRef.current = setInterval(() => {
        presenceAPI.sendHeartbeat();
      }, 10000); // Send heartbeat every 10 seconds
      
      // Poll for online users
      updatePresence();
      const presencePollInterval = setInterval(() => {
        updatePresence();
      }, 5000); // Check online status every 5 seconds
      
      return () => {
        clearInterval(presencePollInterval);
      };
    }
  }, [open]);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Load messages when contact is selected
  useEffect(() => {
    if (activeContact) {
      loadMessages(activeContact.id);
      // Start polling for new messages every 2 seconds
      pollingIntervalRef.current = setInterval(() => {
        loadMessages(activeContact.id, true);
      }, 2000);
      
      // Poll for typing status
      const typingPollInterval = setInterval(() => {
        checkTypingStatus();
      }, 1000); // Check typing status every second
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        clearInterval(typingPollInterval);
        presenceAPI.stopTyping(); // Stop typing when leaving conversation
      };
    }
  }, [activeContact]);

  const loadMessages = async (contactId: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const result = await messagesAPI.getMessages(contactId);
      if (result.success) {
        // Check if there are new messages
        const hasNewMessages = result.messages.length > messages.length;
        setMessages(result.messages);
        
        // Scroll to bottom if new messages arrived
        if (hasNewMessages && silent) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  const updatePresence = async () => {
    try {
      const result = await presenceAPI.getPresence();
      if (result.success) {
        setOnlineUsers(result.onlineUsers);
      }
    } catch (error) {
      console.error('Failed to update presence:', error);
    }
  };

  const checkTypingStatus = async () => {
    if (!activeContact) return;
    
    try {
      const conversationId = [userId, activeContact.id].sort().join('_');
      const result = await presenceAPI.getPresence(conversationId);
      if (result.success) {
        setOtherUserTyping(result.isTyping);
      }
    } catch (error) {
      console.error('Failed to check typing status:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setInput(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    
    // Send typing indicator
    if (!isTyping && activeContact) {
      setIsTyping(true);
      const conversationId = [userId, activeContact.id].sort().join('_');
      presenceAPI.sendTyping(conversationId);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      presenceAPI.stopTyping();
    }, 1000);
  };

  if (!open) return null;

  const openChat = (contact: ChatContact) => {
    setActiveContact(contact);
    setMessages([]);
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedFile) || !activeContact) return;
    
    setIsTyping(false);
    presenceAPI.stopTyping(); // Stop typing when message is sent

    try {
      let mediaUrl = '';
      let mediaType: 'image' | 'video' | 'file' | undefined;
      let fileName = '';
      let fileSize = 0;

      // Upload file if selected
      if (selectedFile) {
        console.log('Uploading file:', selectedFile.name, selectedFile.type, selectedFile.size);
        setUploadingFile(true);
        
        try {
          const uploadResult = await uploadAPI.uploadFile(selectedFile);
          console.log('Upload result:', uploadResult);
          
          if (uploadResult.success) {
            mediaUrl = uploadResult.mediaUrl;
            mediaType = uploadResult.mediaType;
            fileName = selectedFile.name;
            fileSize = selectedFile.size;
            console.log('File uploaded successfully:', mediaUrl);
          } else {
            console.error('Upload failed:', uploadResult.message);
            alert('Failed to upload file: ' + uploadResult.message);
            setUploadingFile(false);
            return;
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          alert('Failed to upload file. Please try again.');
          setUploadingFile(false);
          return;
        }
        
        setUploadingFile(false);
      }

      const tempMsg: ChatMessage = { 
        id: Date.now(), 
        from: 'me', 
        text: input.trim(), 
        time: 'Now',
        mediaUrl,
        mediaType,
        fileName,
        fileSize,
      };
      
      console.log('Sending message:', tempMsg);
      setMessages(prev => [...prev, tempMsg]);
      setInput('');
      removeFile();

      const result = await messagesAPI.sendMessage(
        activeContact.id,
        activeContact.name,
        tempMsg.text,
        mediaUrl,
        mediaType,
        fileName,
        fileSize
      );
      
      console.log('Message send result:', result);
      
      if (result.success) {
        // Update with server response
        setMessages(prev => 
          prev.map(msg => msg.id === tempMsg.id ? result.message : msg)
        );
      } else {
        console.error('Failed to send message:', result.message);
        alert('Failed to send message: ' + result.message);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
      setUploadingFile(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideDownChat {
          from { opacity:0; transform:translateY(-16px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes msgIn {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes chatPanelIn {
          from { opacity:0; transform:translateX(16px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .msg-bubble { animation: msgIn 0.2s ease-out; }
        .chat-panel-in { animation: chatPanelIn 0.25s cubic-bezier(0.16,1,0.3,1); }
      `}</style>

      {/* ── CONTACTS PANEL (Always visible when chat is open) ──────────────── */}
      <div
        className="fixed top-20 z-50 rounded-2xl overflow-hidden border border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-900"
        style={{
          right: '8px',
          width: '280px',
          height: '500px',
          animation: 'slideDownChat 0.3s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: '0 25px 60px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
        }}
      >
        {/* ── LEFT PANEL: Contacts ──────────────────────────────────────────── */}
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">

        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex-shrink-0 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
                <FaCommentDots className="text-white text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 leading-none">Messages</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">{contacts.filter((c: ChatContact) => c.online).length} online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {totalUnread > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full mr-1">{totalUnread} new</span>
              )}
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-green-400/30 focus:border-green-400 border border-transparent transition-all placeholder-gray-400 dark:text-gray-200"
            />
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact, idx) => {
            const isOnline = onlineUsers.includes(contact.id);
            return (
            <button
              key={contact.id}
              onClick={() => openChat(contact)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left group relative ${
                activeContact?.id === contact.id
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50'
                  : 'hover:bg-gray-50'
              } ${idx !== 0 ? 'border-t border-gray-50' : ''}`}
            >
              {/* Active indicator */}
              {activeContact?.id === contact.id && (
                <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full" />
              )}

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${contact.gradient} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                  {contact.initial}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={`text-sm font-semibold truncate ${activeContact?.id === contact.id ? 'text-green-700' : 'text-gray-900'}`}>
                    {contact.name}
                  </p>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
                    {contact.lastMessage ? new Date(contact.lastMessage.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 truncate pr-2">
                    {contact.lastMessage?.text || 'No messages yet'}
                  </p>
                  {contact.unread > 0 && (
                    <span className="w-4 h-4 bg-green-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center flex-shrink-0">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 bg-gray-50/50 dark:bg-gray-800/50">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">AquaNet Secure Messaging</p>
        </div>
      </div>
      </div>

      {/* ── CHAT CONVERSATION PANEL (Separate floating panel) ──────────────── */}
      {activeContact && (
        <div
          className="fixed top-20 z-50 rounded-2xl overflow-hidden border border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-900 chat-panel-in"
          style={{
            right: '304px', // Position to the left of contacts panel (280px + 8px gap + 16px spacing)
            width: '400px',
            height: '500px',
            boxShadow: '0 25px 60px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
          }}
        >
          <div className="flex flex-col h-full bg-white dark:bg-gray-900">

          {/* Chat header */}
          <div className="px-4 py-3 flex items-center justify-between flex-shrink-0 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${activeContact.gradient} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                  {activeContact.initial}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${onlineUsers.includes(activeContact.id) ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{activeContact.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {otherUserTyping ? (
                    <div className="flex items-center gap-1 text-[10px] text-green-600">
                      <span className="flex gap-0.5">
                        <span className="w-1 h-1 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-1 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-1 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                      <span className="font-medium">typing...</span>
                    </div>
                  ) : (
                    <>
                      <p className={`text-[10px] font-medium ${onlineUsers.includes(activeContact.id) ? 'text-green-600' : 'text-gray-400'}`}>
                        {onlineUsers.includes(activeContact.id) ? '● Active now' : '● Offline'}
                      </p>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1 text-[10px] text-green-600">
                        <FaLock className="text-[8px]" />
                        <span className="font-medium">Encrypted</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                <FaSearch className="text-xs" />
              </button>
              <button
                onClick={() => setActiveContact(null)}
                className="w-8 h-8 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            style={{ background: 'linear-gradient(180deg, #f8fffe 0%, #f0fdf4 100%)' }}
          >
            {/* Date separator */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[10px] text-gray-400 font-medium px-2 py-0.5 bg-white rounded-full border border-gray-200 shadow-sm">Today</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {messages.map((msg, i) => {
              const isMe = msg.from === 'me';
              const showAvatar = i === 0 || messages[i - 1]?.from !== msg.from;
              return (
                <div key={msg.id} className={`flex items-end gap-2 msg-bubble ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {/* Their avatar */}
                  {!isMe && (
                    <div className={`flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                      <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${activeContact.gradient} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                        {activeContact.initial}
                      </div>
                    </div>
                  )}

                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[78%]`}>
                    {/* Bubble */}
                    <div className={`rounded-2xl shadow-sm ${
                      isMe
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                    }`}>
                      {/* Media content */}
                      {msg.mediaUrl && (
                        <div className="overflow-hidden rounded-t-2xl">
                          {msg.mediaType === 'image' && (
                            <img 
                              src={msg.mediaUrl} 
                              alt="Shared image" 
                              className="max-w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(msg.mediaUrl, '_blank')}
                            />
                          )}
                          {msg.mediaType === 'video' && (
                            <video 
                              src={msg.mediaUrl} 
                              controls 
                              className="max-w-full max-h-64 object-cover"
                            />
                          )}
                          {msg.mediaType === 'file' && (
                            <a 
                              href={msg.mediaUrl} 
                              download={msg.fileName}
                              className={`flex items-center gap-3 px-3.5 py-2.5 hover:opacity-80 transition-opacity`}
                            >
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isMe ? 'bg-white/20' : 'bg-gray-100'}`}>
                                <FaFile className={`text-lg ${isMe ? 'text-white' : 'text-gray-600'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isMe ? 'text-white' : 'text-gray-900'}`}>
                                  {msg.fileName}
                                </p>
                                <p className={`text-xs ${isMe ? 'text-white/70' : 'text-gray-500'}`}>
                                  {msg.fileSize ? `${(msg.fileSize / 1024 / 1024).toFixed(2)} MB` : 'File'}
                                </p>
                              </div>
                              <FaDownload className={`text-sm ${isMe ? 'text-white' : 'text-gray-600'}`} />
                            </a>
                          )}
                        </div>
                      )}
                      {/* Text content */}
                      {msg.text && (
                        <div className="px-3.5 py-2.5 text-sm leading-relaxed">
                          {msg.text}
                        </div>
                      )}
                    </div>
                    {/* Time */}
                    <p className="text-[9px] text-gray-400 mt-1 px-1">{msg.time}</p>
                  </div>

                  {/* My avatar */}
                  {isMe && (
                    <div className={`flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                        {userInitial}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
            {/* File preview */}
            {selectedFile && (
              <div className="mb-2 relative">
                {filePreview && selectedFile.type.startsWith('image/') ? (
                  <div className="relative inline-block">
                    <img src={filePreview} alt="Preview" className="max-w-32 max-h-32 rounded-lg object-cover" />
                    <button
                      onClick={removeFile}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                ) : filePreview && selectedFile.type.startsWith('video/') ? (
                  <div className="relative inline-block">
                    <video src={filePreview} className="max-w-32 max-h-32 rounded-lg object-cover" />
                    <button
                      onClick={removeFile}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                    <FaFile className="text-gray-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{selectedFile.name}</span>
                    <button
                      onClick={removeFile}
                      className="ml-auto text-red-500 hover:text-red-600"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl px-3 py-2 border border-gray-200 dark:border-gray-700 focus-within:border-green-400 focus-within:bg-white dark:focus-within:bg-gray-700 focus-within:shadow-sm transition-all">
              {/* Emoji picker button */}
              <div className="relative" ref={emojiPickerRef}>
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-400 hover:text-yellow-500 transition-colors flex-shrink-0 p-0.5"
                >
                  <FaRegSmile className="text-base" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 z-50">
                    <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={400} />
                  </div>
                )}
              </div>

              {/* File upload button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="text-gray-400 hover:text-green-500 transition-colors flex-shrink-0 p-0.5"
              >
                <FaPaperclip className="text-base" />
              </button>

              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Write a message..."
                disabled={uploadingFile}
                className="flex-1 text-sm bg-transparent outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400"
              />
              <button
                onClick={sendMessage}
                disabled={(!input.trim() && !selectedFile) || uploadingFile}
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  (input.trim() || selectedFile) && !uploadingFile
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {uploadingFile ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaPaperPlane className="text-xs" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between mt-1.5 px-1">
              <p className="text-[9px] text-gray-400">Press Enter to send</p>
              <div className="flex items-center gap-1 text-[9px] text-green-600">
                <FaLock className="text-[7px]" />
                <span>End-to-end encrypted</span>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Skeleton Loading Screen ───────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar skeleton */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-9 w-64 rounded-full hidden md:block" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full" />
          <Skeleton className="w-9 h-9 rounded-full" />
          <Skeleton className="w-9 h-9 rounded-full" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Left sidebar skeleton */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col items-center text-center mb-4">
              <Skeleton className="w-16 h-16 rounded-full mb-3" />
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-9 w-full rounded-lg" />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </div>
        </aside>

        {/* Center feed skeleton */}
        <main className="flex-1 min-w-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex gap-3">
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              <Skeleton className="h-10 flex-1 rounded-full" />
            </div>
          </div>
          {/* Stories skeleton */}
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-28 h-40 rounded-xl flex-shrink-0" />
            ))}
          </div>
          {/* Post skeletons */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <div className="flex gap-4 pt-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </main>

        {/* Right panel skeleton */}
        <aside className="hidden xl:block w-72 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <Skeleton className="h-5 w-40 mb-2" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <Skeleton className="h-5 w-36 mb-2" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <Skeleton className="h-5 w-32 mb-2" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}


// ─── Main Component ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [chatContacts, setChatContacts] = useState<ChatContact[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [postText, setPostText] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; name: string } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalUnread = chatContacts.reduce((s, c) => s + c.unread, 0);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleConnect = (id: string, name: string) => {
    usersAPI.sendConnectionRequest(id).then((result) => {
      if (result.success) {
        setConnectedIds(prev => [...prev, id]);
        setToast({ message: 'Connection request sent to', name });
        setTimeout(() => setToast(null), 3500);
      }
    });
  };

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const result = await postsAPI.fetchPosts();
      if (result.success) {
        setPosts(result.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  // Fetch team members
  const fetchTeamMembers = async () => {
    try {
      const result = await usersAPI.getUsers();
      if (result.success) {
        setTeamMembers(result.users);
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error);
    }
  };

  // Fetch chat conversations
  const fetchConversations = async () => {
    try {
      const result = await messagesAPI.getConversations();
      if (result.success) {
        const formattedContacts: ChatContact[] = result.conversations.map((conv: any) => ({
          id: conv.id,
          name: conv.name,
          email: conv.email,
          role: 'Team Member',
          gradient: `from-${['teal', 'pink', 'violet', 'orange', 'blue'][Math.floor(Math.random() * 5)]}-500 to-${['cyan', 'rose', 'purple', 'amber', 'indigo'][Math.floor(Math.random() * 5)]}-600`,
          initial: conv.initial,
          online: conv.online || false,
          unread: conv.unread || 0,
          messages: [],
          lastMessage: conv.lastMessage,
        }));
        setChatContacts(formattedContacts);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  // Auth check + data loading
  useEffect(() => {
    document.title = 'Dashboard — AquaNet';
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ name: payload.name || 'Admin', email: payload.email || '' });
      setUserId(payload.userId);
      
      // Fetch all data
      Promise.all([
        fetchPosts(),
        fetchTeamMembers(),
        fetchConversations(),
      ]).finally(() => {
        setTimeout(() => setLoading(false), 800);
      });

      // Poll for new posts every 10 seconds
      const postsInterval = setInterval(() => {
        fetchPosts();
      }, 10000);

      // Poll for new conversations every 5 seconds
      const conversationsInterval = setInterval(() => {
        fetchConversations();
      }, 5000);

      return () => {
        clearInterval(postsInterval);
        clearInterval(conversationsInterval);
      };
    } catch {
      setUser({ name: 'Admin', email: '' });
      setTimeout(() => setLoading(false), 800);
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('sessionId');
    localStorage.removeItem('token');
    localStorage.removeItem('savedEmail');
    router.push('/login');
  };

  const toggleLike = async (postId: string) => {
    try {
      const result = await postsAPI.toggleLike(postId);
      if (result.success) {
        setPosts(prev => prev.map(post => 
          post._id === postId 
            ? { ...post, likesCount: result.likesCount, likes: result.liked ? [...post.likes, userId] : post.likes.filter(id => id !== userId) }
            : post
        ));
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreatePost = async () => {
    if (!postText.trim() && !selectedFile) return;

    setCreatingPost(true);
    try {
      let mediaUrl = '';
      let mediaType: 'image' | 'video' | undefined;

      // Upload file if selected
      if (selectedFile) {
        const uploadResult = await uploadAPI.uploadFile(selectedFile);
        if (uploadResult.success) {
          mediaUrl = uploadResult.mediaUrl;
          mediaType = uploadResult.mediaType;
        }
      }

      // Create post
      const result = await postsAPI.createPost(postText, mediaUrl, mediaType);
      if (result.success) {
        setPosts(prev => [result.post, ...prev]);
        setPostText('');
        removeFile();
        setToast({ message: 'Post created successfully!', name: '' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      setToast({ message: 'Failed to create post', name: '' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setCreatingPost(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? 'U';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative transition-colors duration-300">
      <FallingLeaves />

      {/* ── TOAST NOTIFICATION ─────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed top-6 left-1/2 z-[100] -translate-x-1/2 flex items-center gap-3 bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800 shadow-2xl rounded-2xl px-5 py-3.5"
          style={{ animation: 'toastIn 0.4s cubic-bezier(0.16,1,0.3,1)', minWidth: '320px' }}
        >
          <style>{`
            @keyframes toastIn {
              from { opacity:0; transform:translate(-50%,-16px) scale(0.95); }
              to   { opacity:1; transform:translate(-50%,0) scale(1); }
            }
          `}</style>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <FaUserPlus className="text-white text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none mb-0.5">Request Sent!</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {toast.message} <span className="font-medium text-green-700">{toast.name}</span>
            </p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-1"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>
      )}

      {/* ── TOP NAVBAR (floating) ──────────────────────────────────────────── */}
      <div className="sticky top-3 z-50 px-4">
        <nav className="max-w-7xl mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 shadow-xl rounded-2xl">
          <div className="px-4 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md flex-shrink-0">
              <FaLeaf className="text-white text-lg" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">
              Aqua<span className="text-green-600">Net</span>
            </span>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search AquaNet..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 border border-transparent focus:outline-none focus:border-green-400 focus:bg-white dark:focus:bg-gray-700 transition-colors"
              />
            </div>
          </div>

          {/* Nav icons + user */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Nav icon buttons */}
            {[
              { icon: FaHome, label: 'Home' },
              { icon: FaNetworkWired, label: 'Network' },
              { icon: FaWater, label: 'Monitor' },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                aria-label={label}
                className={`hidden sm:flex flex-col items-center justify-center w-10 h-10 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-green-600 transition-colors`}
              >
                <Icon className="text-lg" />
              </button>
            ))}

            {/* Notification bell */}
            <button
              aria-label="Notifications"
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600 transition-colors"
            >
              <FaBell className="text-lg" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* Messages icon */}
            <button
              aria-label="Messages"
              onClick={() => setChatOpen(o => !o)}
              className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${chatOpen ? 'bg-green-100 dark:bg-green-900/40 text-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600'}`}
            >
              <FaCommentDots className="text-lg" />
              {totalUnread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
              )}
            </button>

            {/* User avatar + name */}
            <div className="flex items-center gap-2 ml-1 pl-2 border-l border-gray-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {userInitial}
              </div>
              <span className="hidden lg:block text-sm font-medium text-gray-800 dark:text-gray-200 max-w-[100px] truncate">
                {user?.name}
              </span>
            </div>

            {/* Network Indicator */}
            <div className="ml-2 pl-2 border-l border-gray-200">
              <NetworkIndicator />
            </div>

            {/* Logout */}
            </div>
        </div>
        </nav>
      </div>

      {/* ── PAGE BODY ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-5 flex gap-5 relative z-10">

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col gap-4 w-60 flex-shrink-0">

          {/* Profile card */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            {/* Cover strip */}
            <div className="h-16 bg-gradient-to-r from-green-500 to-emerald-600" />
            <div className="px-4 pb-4 -mt-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-md mx-auto">
                {userInitial}
              </div>
              <div className="text-center mt-2">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  Aquaculture Manager
                </span>
              </div>
            </div>

            {/* Nav links */}
            <div className="border-t border-gray-100 dark:border-gray-700 px-2 py-2">
              {NAV_LINKS.map(({ icon: Icon, label, active }) => (
                <button
                  key={label}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={active ? 'text-green-600' : 'text-gray-400'} />
                  {label}
                </button>
              ))}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors mt-1 border-t border-gray-100 dark:border-gray-700 pt-2"
              >
                <FaSignOutAlt className="text-red-400" />
                Logout
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors mt-1"
              >
                <div className="flex items-center gap-3">
                  {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-400" />}
                  <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                {/* Toggle pill */}
                <div className={`w-10 h-5 rounded-full transition-colors duration-300 flex items-center px-0.5 ${darkMode ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Quick Stats</p>
            <div className="space-y-2">
              {QUICK_STATS.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                  <span className="text-sm font-bold text-green-700 dark:text-green-400">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LinkedIn-style analytics */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FaLinkedin className="text-blue-600 text-base" />
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Your Analytics</p>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Profile views</span>
                <span className="text-sm font-bold text-blue-600">{LINKEDIN_PROFILE.profileViews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Connections</span>
                <span className="text-sm font-bold text-blue-600">{LINKEDIN_PROFILE.connections}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Post impressions</span>
                <span className="text-sm font-bold text-blue-600">{LINKEDIN_PROFILE.postImpressions}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── CENTER FEED ──────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Create post box */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {userInitial}
              </div>
              <input
                type="text"
                placeholder={`What's on your mind, ${user?.name?.split(' ')[0] ?? 'there'}?`}
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 border border-transparent focus:outline-none focus:border-green-400 focus:bg-white dark:focus:bg-gray-700 transition-colors"
              />
            </div>

            {/* File preview */}
            {filePreview && (
              <div className="mb-3 relative">
                {selectedFile?.type.startsWith('image/') ? (
                  <img src={filePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                ) : (
                  <video src={filePreview} className="w-full h-48 object-cover rounded-lg" controls />
                )}
                <button
                  onClick={removeFile}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            )}

            <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <FaImage className="text-green-500" />
                  <span className="hidden sm:inline">Photo/Video</span>
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors">
                  <FaSmile className="text-yellow-500" />
                  <span className="hidden sm:inline">Feeling</span>
                </button>
              </div>
              <button
                onClick={handleCreatePost}
                disabled={(!postText.trim() && !selectedFile) || creatingPost}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingPost ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>

          {/* Stories / highlights row */}
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {/* Add story card */}
            <div className="flex-shrink-0 w-28 h-40 rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col items-center justify-end pb-3 cursor-pointer hover:shadow-md transition-shadow overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-200" />
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white border-4 border-white shadow flex items-center justify-center">
                <span className="text-green-600 text-xl font-bold leading-none">+</span>
              </div>
              <span className="relative text-xs font-semibold text-gray-700 text-center leading-tight">Create Story</span>
            </div>

            {STORIES.map((story) => (
              <div
                key={story.id}
                className={`flex-shrink-0 w-28 h-40 rounded-xl bg-gradient-to-b ${story.gradient} shadow-sm flex flex-col items-end justify-end p-2 cursor-pointer hover:shadow-md transition-shadow overflow-hidden relative`}
              >
                <div className="absolute top-2 left-2 w-9 h-9 rounded-full bg-white/30 backdrop-blur-sm border-2 border-white flex items-center justify-center text-lg">
                  {story.emoji}
                </div>
                <span className="relative text-xs font-semibold text-white drop-shadow text-left w-full leading-tight">
                  {story.author}
                </span>
                <span className="relative text-[10px] text-white/80 w-full leading-tight">{story.label}</span>
              </div>
            ))}
          </div>

          {/* Post cards */}
          {posts.map((post) => {
            const isLiked = post.likes.includes(userId);
            const timeAgo = getTimeAgo(new Date(post.createdAt));
            const avatarGradient = `from-${['green', 'teal', 'emerald', 'lime'][Math.floor(Math.random() * 4)]}-500 to-${['emerald', 'cyan', 'green', 'teal'][Math.floor(Math.random() * 4)]}-600`;
            
            return (
            <article key={post._id} className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              {/* Post header */}
              <div className="flex items-start justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                    {post.authorInitial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{post.authorName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{post.authorEmail} · {timeAgo}</p>
                  </div>
                </div>
                {post.author === userId && (
                  <button
                    onClick={async () => {
                      if (confirm('Delete this post?')) {
                        const result = await postsAPI.deletePost(post._id);
                        if (result.success) {
                          setPosts(prev => prev.filter(p => p._id !== post._id));
                        }
                      }
                    }}
                    aria-label="Delete post"
                    className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              {/* Post text */}
              <div className="px-4 pb-3">
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{post.text}</p>
              </div>

              {/* Post media */}
              {post.mediaUrl && (
                <div className="mb-3">
                  {post.mediaType === 'image' ? (
                    <img src={post.mediaUrl} alt="Post media" className="w-full max-h-96 object-cover" />
                  ) : (
                    <video src={post.mediaUrl} controls className="w-full max-h-96 object-cover" />
                  )}
                </div>
              )}

              {/* Like / comment counts */}
              <div className="px-4 pb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  {post.likesCount > 0 && (
                    <>
                      <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <FaThumbsUp className="text-white text-[8px]" />
                      </span>
                      <span>{post.likesCount}</span>
                    </>
                  )}
                </div>
                <span>{post.comments.length} comments · {post.shares} shares</span>
              </div>

              {/* Action buttons */}
              <div className="border-t border-gray-100 dark:border-gray-700 px-2 py-1 flex items-center">
                <button
                  onClick={() => toggleLike(post._id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isLiked
                      ? 'text-green-600 bg-green-50 dark:bg-green-900/30'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700'
                  }`}
                >
                  <FaThumbsUp />
                  <span>Like</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 transition-colors">
                  <FaComment />
                  <span>Comment</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 transition-colors">
                  <FaShare />
                  <span>Share</span>
                </button>
              </div>
            </article>
            );
          })}
        </main>

        {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
        <aside className="hidden xl:flex flex-col gap-4 w-72 flex-shrink-0">

          {/* My Team */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">My Team</p>
              <button className="text-xs text-green-600 hover:underline font-medium">See all</button>
            </div>
            <div className="space-y-3">
              {teamMembers.slice(0, 3).map((person) => (
                <div key={person.id} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${person.gradient} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                    {person.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{person.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{person.role}</p>
                  </div>
                  {connectedIds.includes(person.id) || person.connectionStatus === 'pending' ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 border border-gray-200 bg-gray-50 px-2.5 py-1 rounded-full flex-shrink-0">
                      <FaCheckCircle className="text-green-500 text-[10px]" />
                      Sent
                    </span>
                  ) : person.connectionStatus === 'accepted' ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-700 border border-green-300 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
                      <FaCheckCircle className="text-green-500 text-[10px]" />
                      Connected
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConnect(person.id, person.name)}
                      className="flex items-center gap-1 text-xs font-semibold text-green-700 border border-green-300 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
                    >
                      <FaUserPlus className="text-[10px]" />
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* LinkedIn Jobs */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FaBriefcase className="text-blue-600 text-sm" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Jobs For You</p>
            </div>
            <div className="space-y-3">
              {LINKEDIN_JOBS.map((job) => (
                <div key={job.id} className="group cursor-pointer">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">{job.title}</p>
                  <p className="text-xs text-gray-600">{job.company}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400 dark:text-gray-500">{job.location}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="text-xs text-green-600 font-medium">{job.type}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full text-xs text-blue-600 font-semibold border border-blue-200 rounded-full py-1.5 hover:bg-blue-50 transition-colors">
              Show all jobs
            </button>
          </div>

          {/* Trending in AquaNet */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Trending in AquaNet</p>
            <div className="space-y-3">
              {TRENDING_TOPICS.map((topic, idx) => (
                <div key={topic.id} className="flex items-start gap-3 cursor-pointer group">
                  <span className="text-xs font-bold text-gray-400 w-4 flex-shrink-0 mt-0.5">{idx + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                      {topic.tag}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{topic.posts}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status widget */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">            <div className="flex items-center gap-2 mb-3">
              <FaLeaf className="text-green-600 text-sm" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">System Status</p>
            </div>
            <div className="space-y-2.5">
              {SYSTEM_STATUS.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaCircle className={`text-[8px] ${item.color.replace('bg-', 'text-')}`} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    item.status === 'online'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.status === 'online' ? 'Online' : 'Warning'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
              <FaCheckCircle className="text-green-500 text-sm" />
              <span className="text-xs text-gray-500 dark:text-gray-400">2 of 3 systems nominal</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-2">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Powered by{' '}
              <span className="font-semibold text-green-600">Megabotics</span>
            </p>
            <p className="text-[10px] text-gray-300 mt-0.5">Mega Ideas, Mega Impact</p>
          </div>
        </aside>

      </div>

      {/* ── CHAT PANEL ─────────────────────────────────────────────────────── */}
      <ChatPanel userInitial={userInitial} userId={userId} open={chatOpen} onClose={() => setChatOpen(false)} contacts={chatContacts} />

    </div>
  );
}


