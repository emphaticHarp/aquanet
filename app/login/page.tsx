'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { FaLeaf, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationCircle, FaArrowLeft } from 'react-icons/fa';
import Image from 'next/image';
import NetworkIndicator from '@/components/NetworkIndicator';

// Falling Leaf Component
const FallingLeaf = ({ delay, duration, left, rotation }: { delay: number; duration: number; left: number; rotation: number }) => (
  <div
    className="absolute text-green-600 opacity-70"
    style={{
      top: '-50px',
      left: `${left}%`,
      fontSize: `${Math.random() * 20 + 15}px`,
      animation: `fall ${duration}s linear infinite`,
      animationDelay: `${delay}s`,
      transform: `rotate(${rotation}deg)`,
    }}
  >
    <FaLeaf />
  </div>
);

// Background Animation Component
const BackgroundAnimations = () => {
  const [leaves, setLeaves] = useState<Array<{ delay: number; duration: number; left: number; rotation: number }>>([]);

  useEffect(() => {
    // Generate falling leaves only on client
    const generatedLeaves = [...Array(15)].map((_, i) => ({
      delay: i * 0.8,
      duration: Math.random() * 5 + 8,
      left: Math.random() * 100,
      rotation: Math.random() * 360,
    }));
    setLeaves(generatedLeaves);
  }, []);

  return (
    <div className="absolute inset-0">
      {leaves.map((leaf, i) => (
        <FallingLeaf key={i} delay={leaf.delay} duration={leaf.duration} left={leaf.left} rotation={leaf.rotation} />
      ))}
    </div>
  );
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [shakeForm, setShakeForm] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  
  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showStepSkeleton, setShowStepSkeleton] = useState(false);

  // Simulate page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Check for caps lock
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockOn(true);
    } else {
      setCapsLockOn(false);
    }
  };

  // Password strength calculator
  const calculatePasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Medium', color: 'bg-yellow-500' };
    if (strength <= 4) return { strength, label: 'Strong', color: 'bg-green-500' };
    return { strength, label: 'Very Strong', color: 'bg-green-600' };
  };

  // Forgot Password Handlers
  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowForgotPassword(true);
    setForgotPasswordStep('email');
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
  };

  const handleSendOTP = async () => {
    if (!forgotEmail || !validateEmail(forgotEmail)) {
      setForgotPasswordError('Please enter a valid email address');
      return;
    }

    setIsResettingPassword(true);
    setForgotPasswordError('');

    try {
      const res = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      setIsResettingPassword(false);

      if (data.success) {
        setShowStepSkeleton(true);
        setTimeout(() => {
          setShowStepSkeleton(false);
          setForgotPasswordStep('otp');
          setForgotPasswordSuccess('OTP sent to your email!');
        }, 800);
      } else {
        setForgotPasswordError(data.message || 'Failed to send OTP');
      }
    } catch {
      setIsResettingPassword(false);
      setForgotPasswordError('Network error. Please try again.');
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setForgotPasswordError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsResettingPassword(true);
    setForgotPasswordError('');

    try {
      const res = await fetch('/api/auth/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp }),
      });

      const data = await res.json();
      setIsResettingPassword(false);

      if (data.success) {
        setShowStepSkeleton(true);
        setTimeout(() => {
          setShowStepSkeleton(false);
          setForgotPasswordStep('reset');
          setForgotPasswordSuccess('OTP verified successfully!');
        }, 800);
      } else {
        setForgotPasswordError(data.message || 'Invalid OTP');
      }
    } catch {
      setIsResettingPassword(false);
      setForgotPasswordError('Network error. Please try again.');
    }
  };

  const handleResetPassword = async () => {
    setForgotPasswordError('');

    if (newPassword.length < 8) {
      setForgotPasswordError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotPasswordError('Passwords do not match');
      return;
    }

    const { strength } = calculatePasswordStrength(newPassword);
    if (strength < 3) {
      setForgotPasswordError('Please use a stronger password');
      return;
    }

    setIsResettingPassword(true);

    try {
      const res = await fetch('/api/auth/forgot-password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp, newPassword }),
      });

      const data = await res.json();
      setIsResettingPassword(false);

      if (data.success) {
        setForgotPasswordSuccess('Password reset successfully!');
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordStep('email');
          setForgotEmail('');
          setOtp('');
          setNewPassword('');
          setConfirmPassword('');
          setForgotPasswordSuccess('');
        }, 2000);
      } else {
        setForgotPasswordError(data.message || 'Failed to reset password');
      }
    } catch {
      setIsResettingPassword(false);
      setForgotPasswordError('Network error. Please try again.');
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep('email');
    setForgotEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
  };

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  // Password validation
  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailTouched) {
      setEmailError(validateEmail(value));
    }
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordTouched) {
      setPasswordError(validatePassword(value));
    }
  };

  // Handle email blur
  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  // Handle password blur
  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    setPasswordError(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate all fields
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setEmailTouched(true);
    setPasswordTouched(true);
    
    if (emailErr || passwordErr) {
      return;
    }
    
    setIsLoading(true);
    setLoginError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!data.success) {
        setLoginError(data.message || 'Invalid email or password.');
        setShakeForm(true);
        setTimeout(() => setShakeForm(false), 600);
      } else {
        // Save token and redirect
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('savedEmail', email);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('savedEmail');
        }
        // Store in BOTH sessionStorage and localStorage so it survives navigation
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('sessionId', data.sessionId);
        localStorage.setItem('token', data.token);
        localStorage.setItem('sessionId', data.sessionId);
        // Redirect to dashboard
        window.location.replace('/dashboard');
      }
    } catch {
      setIsLoading(false);
      setLoginError('Network error. Please try again.');
      setShakeForm(true);
      setTimeout(() => setShakeForm(false), 600);
    }
  };

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const rememberMeValue = localStorage.getItem('rememberMe');
    if (savedEmail && rememberMeValue === 'true') {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <>
      <style>{`
        @keyframes fall {
          0% {
            top: -50px;
            transform: translateX(0) rotate(0deg);
            opacity: 0.7;
          }
          50% {
            transform: translateX(30px) rotate(180deg);
            opacity: 0.5;
          }
          100% {
            top: 100vh;
            transform: translateX(-30px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes sway {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.05);
          }
        }

        @keyframes float3d {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          33% {
            transform: translateY(-30px) translateX(20px) scale(1.1);
          }
          66% {
            transform: translateY(-15px) translateX(-20px) scale(0.95);
          }
        }

        @keyframes rotate3d {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.2);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        @keyframes slideSkew {
          0%, 100% {
            transform: skewY(-6deg) translateX(0);
          }
          50% {
            transform: skewY(-6deg) translateX(20px);
          }
        }

        @keyframes slideSkewReverse {
          0%, 100% {
            transform: skewY(6deg) translateX(0);
          }
          50% {
            transform: skewY(6deg) translateX(-20px);
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.4;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-10px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(10px);
          }
        }

        @keyframes shakeVertical {
          0%, 100% {
            transform: translateY(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateY(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateY(5px);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .sway-animation {
          animation: sway 3s ease-in-out infinite;
        }

        .floating-3d {
          animation: float3d 6s ease-in-out infinite;
        }

        .rotating-3d {
          animation: rotate3d 15s linear infinite;
        }

        .slide-skew {
          animation: slideSkew 8s ease-in-out infinite;
        }

        .slide-skew-reverse {
          animation: slideSkewReverse 8s ease-in-out infinite;
        }

        .ripple-effect {
          animation: ripple 3s ease-out infinite;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-shake {
          animation: shake 0.5s ease-out;
        }

        .animate-shakeVertical {
          animation: shakeVertical 0.5s ease-out;
        }

        .shake-container {
          animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }

        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }

        .input-focus-animation {
          transition: all 0.3s ease;
        }

        .input-focus-animation:focus {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
        }

        .label-float {
          transition: all 0.3s ease;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(20px);
          }
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.4s ease-out forwards;
        }

        .animate-slideOutRight {
          animation: slideOutRight 0.3s ease-out forwards;
        }
      `}</style>

      {pageLoading ? (
        // Skeleton Loading State
        <div className="min-h-screen flex overflow-hidden relative">
          {/* Left Side Skeleton */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 flex-col justify-center items-center p-8 text-white relative overflow-hidden">
            <div className="max-w-md relative z-10 w-full">
              {/* Logo Skeleton */}
              <div className="mb-6 flex justify-center">
                <Skeleton className="w-24 h-24 rounded-full bg-white/20" />
              </div>
              
              {/* Title Skeleton */}
              <Skeleton className="h-10 w-48 mx-auto mb-3 bg-white/20" />
              
              {/* Tagline Skeleton */}
              <Skeleton className="h-6 w-64 mx-auto mb-6 bg-white/20" />
              
              {/* Description Skeleton */}
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 mb-5 border border-white/30">
                <Skeleton className="h-4 w-full mb-2 bg-white/20" />
                <Skeleton className="h-4 w-3/4 bg-white/20" />
              </div>
              
              {/* Features Skeleton */}
              <div className="space-y-2 mb-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                    <Skeleton className="w-6 h-6 rounded-full bg-white/30" />
                    <Skeleton className="h-4 flex-1 bg-white/20" />
                  </div>
                ))}
              </div>
              
              {/* Footer Skeleton */}
              <div className="text-center pt-4 border-t border-white/30">
                <Skeleton className="h-3 w-20 mx-auto mb-1 bg-white/20" />
                <Skeleton className="h-6 w-32 mx-auto mb-1 bg-white/20" />
                <Skeleton className="h-3 w-40 mx-auto bg-white/20" />
              </div>
            </div>
          </div>

          {/* Right Side Skeleton */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
            <div className="w-full max-w-md">
              {/* Heading Skeleton */}
              <div className="mb-6">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-40" />
              </div>
              
              {/* Email Field Skeleton */}
              <div className="space-y-1.5 mb-4">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              
              {/* Password Field Skeleton */}
              <div className="space-y-1.5 mb-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              
              {/* Remember Me & Forgot Password Skeleton */}
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-32" />
              </div>
              
              {/* Button Skeleton */}
              <Skeleton className="h-10 w-full mb-5" />
              
              {/* Security Info Skeleton */}
              <div className="pt-4 border-t border-green-200">
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Actual Content
      <div className="min-h-screen flex overflow-hidden relative">
        {/* Network Indicator - Top Right */}
        <div className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
          <NetworkIndicator />
        </div>

        {/* Dramatic 3D Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Large Floating Orbs with Green Colors */}
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-green-400/40 to-emerald-600/40 rounded-full blur-3xl floating-3d" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-lime-500/40 to-green-600/40 rounded-full blur-3xl floating-3d" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-teal-400/40 to-green-600/40 rounded-full blur-2xl floating-3d" style={{ animationDelay: '3s' }} />
          <div className="absolute top-2/3 right-1/3 w-72 h-72 bg-gradient-to-br from-emerald-400/30 to-lime-500/30 rounded-full blur-3xl floating-3d" style={{ animationDelay: '4.5s' }} />
          
          {/* Rotating 3D Geometric Shapes */}
          <div className="absolute top-1/4 right-1/4 w-40 h-40 border-4 border-green-400/40 rounded-lg rotating-3d shadow-2xl" />
          <div className="absolute bottom-1/3 left-1/5 w-32 h-32 border-4 border-emerald-400/40 rounded-lg rotating-3d" style={{ animationDelay: '2s', animationDuration: '20s' }} />
          <div className="absolute top-1/2 right-1/3 w-24 h-24 border-4 border-lime-400/30 rounded-full rotating-3d" style={{ animationDelay: '4s', animationDuration: '12s' }} />
          
          {/* Ripple Effects */}
          <div className="absolute top-1/4 left-1/3 w-48 h-48 border-2 border-green-300/30 rounded-full ripple-effect" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 border-2 border-emerald-300/30 rounded-full ripple-effect" style={{ animationDelay: '1s' }} />
        </div>

        {/* Left Side - Nature Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 flex-col justify-center items-center p-8 text-white relative overflow-hidden shadow-2xl">
          {/* Falling Leaves Animation */}
          <BackgroundAnimations />

          {/* Decorative Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
          </div>

          {/* Content */}
          <div className="max-w-md relative z-10">
            {/* Logo */}
            <div className="mb-6">
              <div className="w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <Image 
                  src="/logo.png" 
                  alt="AquaNet Logo" 
                  width={96} 
                  height={96}
                  className="object-contain drop-shadow-xl"
                />
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl font-bold mb-3 drop-shadow-lg text-center">AquaNet</h1>

            {/* Tagline */}
            <p className="text-lg text-white mb-6 font-medium drop-shadow text-center">
              Smart Aquaculture Management Platform
            </p>

            {/* Description */}
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 mb-5 border border-white/30">
              <p className="text-sm text-white leading-relaxed text-center">
                Transform your aquaculture operations with intelligent monitoring, automated reporting, and data-driven insights.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">✓</span>
                </div>
                <p className="text-white text-sm font-medium">Automated Water Quality Analysis</p>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">✓</span>
                </div>
                <p className="text-white text-sm font-medium">Intelligent Predictive Analytics</p>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">✓</span>
                </div>
                <p className="text-white text-sm font-medium">Seamless System Integration</p>
              </div>
            </div>

            {/* Powered by Megabotics */}
            <div className="text-center pt-4 border-t border-white/30">
              <p className="text-xs text-white/80 mb-1">Powered by</p>
              <p className="text-xl font-bold text-white drop-shadow-lg mb-1">Megabotics</p>
              <p className="text-xs text-white/90 italic">Mega Ideas, Mega Impact</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 relative overflow-hidden">
          {/* Animated 3D Layered Background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-300/50 to-transparent slide-skew" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-emerald-300/50 to-transparent slide-skew-reverse" />
          </div>

          {/* Large 3D Floating Rings */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full border-4 border-green-400 floating-3d shadow-lg"
                style={{
                  width: `${120 + i * 60}px`,
                  height: `${120 + i * 60}px`,
                  left: `${-60 + i * 20}%`,
                  top: `${-60 + i * 20}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${6 + i}s`,
                }}
              />
            ))}
          </div>

          {/* Floating Gradient Orbs on Right Side */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-green-300/30 to-emerald-400/30 rounded-full blur-xl floating-3d" />
            <div className="absolute bottom-32 left-10 w-40 h-40 bg-gradient-to-br from-lime-300/30 to-green-400/30 rounded-full blur-xl floating-3d" style={{ animationDelay: '2s' }} />
          </div>

          {/* Login Form Content */}
          <div className="w-full max-w-md relative z-10">
            {!showForgotPassword ? (
              <>
            {/* Heading */}
            <div className="mb-6 animate-fadeInUp">
              <div className="flex items-center gap-2 mb-2">
                <FaLeaf className="text-green-600 text-lg animate-pulse" />
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              </div>
              <p className="text-gray-600 text-sm">
                Login to access your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Login Error Message with shadcn Alert */}
              {loginError && (
                <Alert variant="destructive" className="animate-fadeIn border-red-300 bg-red-50">
                  <FaExclamationCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 font-medium">
                    {loginError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Input Fields Container with Shake */}
              <div className={`space-y-4 ${shakeForm ? 'shake-container' : ''}`}>
                {/* Email Field */}
                <div className="space-y-1.5 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                  <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2 text-sm label-float">
                    <FaEnvelope className="text-green-600 text-sm" />
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={handleEmailBlur}
                      className={`h-10 pr-10 input-focus-animation transition-all duration-300 ${
                        emailError && emailTouched
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : email && !emailError
                          ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                          : 'border-green-200 focus:border-green-500 focus:ring-green-500'
                      } bg-white`}
                    />
                    {emailTouched && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-scaleIn">
                        {emailError ? (
                          <FaExclamationCircle className="text-red-500 animate-pulse" />
                        ) : email ? (
                          <FaCheckCircle className="text-green-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {emailError && emailTouched && (
                    <p className="text-xs text-red-600 flex items-center gap-1 animate-slideInRight">
                      <FaExclamationCircle className="text-xs" />
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                  <Label htmlFor="password" className="text-gray-700 font-medium flex items-center gap-2 text-sm label-float">
                    <FaLock className="text-green-600 text-sm" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={handlePasswordBlur}
                      onKeyUp={handleKeyPress}
                      className={`h-10 pr-20 input-focus-animation transition-all duration-300 ${
                        passwordError && passwordTouched
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : password && !passwordError
                          ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                          : 'border-green-200 focus:border-green-500 focus:ring-green-500'
                      } bg-white`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {passwordTouched && (
                        <div className="animate-scaleIn">
                          {passwordError ? (
                            <FaExclamationCircle className="text-red-500 animate-pulse" />
                          ) : password ? (
                            <FaCheckCircle className="text-green-500" />
                          ) : null}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none transition-all duration-200 hover:scale-110"
                        tabIndex={-1}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  {passwordError && passwordTouched && (
                    <p className="text-xs text-red-600 flex items-center gap-1 animate-slideInRight">
                      <FaExclamationCircle className="text-xs" />
                      {passwordError}
                    </p>
                  )}
                  {/* Caps Lock Warning */}
                  {capsLockOn && (
                    <p className="text-xs text-yellow-600 flex items-center gap-1 animate-slideInRight">
                      <FaExclamationCircle className="text-xs" />
                      Caps Lock is ON
                    </p>
                  )}
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm pt-1 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-green-300 text-green-600 transition-transform duration-200 hover:scale-110" 
                  />
                  <span className="text-gray-600 group-hover:text-gray-900 transition-colors duration-200">Remember me</span>
                </label>
                <a href="#" onClick={handleForgotPasswordClick} className="text-green-600 hover:text-green-700 font-medium transition-all duration-200 hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <div className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                <Button
                  type="submit"
                  disabled={isLoading || (emailTouched && !!emailError) || (passwordTouched && !!passwordError)}
                  className="w-full h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    'Login'
                  )}
                </Button>
              </div>
            </form>

            {/* Security info */}
            <div className="mt-5 pt-4 border-t border-green-200 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
              <div className="bg-green-50 rounded-lg p-2.5 hover:bg-green-100 transition-colors duration-200">
                <p className="text-xs text-gray-700 text-center flex items-center justify-center gap-1">
                  <FaLock className="text-green-600 animate-pulse" />
                  Secure Login • 256-bit Encryption
                </p>
              </div>
            </div>
            </>
            ) : (
              /* Forgot Password Flow */
              <div className="animate-fadeInUp">
                {/* Back Button */}
                <button
                  onClick={handleBackToLogin}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-all duration-200 hover:gap-3"
                >
                  <FaArrowLeft />
                  <span>Back to Login</span>
                </button>

                {showStepSkeleton ? (
                  /* Step Transition Skeleton */
                  <div className="space-y-6 animate-fadeIn">
                    {/* Title Skeleton */}
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-56" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    
                    {/* Content Skeleton */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                    
                    {/* Button Skeleton */}
                    <Skeleton className="h-10 w-full" />
                    
                    {/* Additional Info Skeleton */}
                    <div className="flex justify-center">
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ) : (
                  <>
                {forgotPasswordStep === 'email' && (
                  <div className="animate-slideInLeft">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <FaEnvelope className="text-green-600" />
                      Forgot Password?
                    </h2>
                    <p className="text-gray-600 text-sm mb-6">
                      Enter your email address and we'll send you an OTP to reset your password.
                    </p>

                    {forgotPasswordSuccess && (
                      <Alert className="mb-4 border-green-300 bg-green-50">
                        <FaCheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          {forgotPasswordSuccess}
                        </AlertDescription>
                      </Alert>
                    )}

                    {forgotPasswordError && (
                      <Alert variant="destructive" className="mb-4">
                        <FaExclamationCircle className="h-4 w-4" />
                        <AlertDescription>{forgotPasswordError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="forgot-email" className="flex items-center gap-2 mb-2">
                          <FaEnvelope className="text-green-600" />
                          Email Address
                        </Label>
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="Enter your email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="h-10"
                        />
                      </div>

                      <Button
                        onClick={handleSendOTP}
                        disabled={isResettingPassword}
                        className="w-full h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {isResettingPassword ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </span>
                        ) : 'Send OTP'}
                      </Button>
                    </div>
                  </div>
                )}

                {forgotPasswordStep === 'otp' && (
                  <div className="animate-slideInLeft">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <FaLock className="text-green-600" />
                      Verify OTP
                    </h2>
                    <p className="text-gray-600 text-sm mb-6">
                      Enter the 6-digit code sent to {forgotEmail}
                    </p>

                    {forgotPasswordSuccess && (
                      <Alert className="mb-4 border-green-300 bg-green-50">
                        <FaCheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          {forgotPasswordSuccess}
                        </AlertDescription>
                      </Alert>
                    )}

                    {forgotPasswordError && (
                      <Alert variant="destructive" className="mb-4">
                        <FaExclamationCircle className="h-4 w-4" />
                        <AlertDescription>{forgotPasswordError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>

                      <p className="text-xs text-center text-gray-500">
                        Enter the OTP sent to your email
                      </p>

                      <Button
                        onClick={handleVerifyOTP}
                        disabled={isResettingPassword || otp.length !== 6}
                        className="w-full h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {isResettingPassword ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying...
                          </span>
                        ) : 'Verify OTP'}
                      </Button>

                      <button
                        onClick={handleSendOTP}
                        className="w-full text-sm text-green-600 hover:text-green-700 font-medium transition-all duration-200 hover:underline"
                      >
                        Resend OTP
                      </button>
                    </div>
                  </div>
                )}

                {forgotPasswordStep === 'reset' && (
                  <div className="animate-slideInLeft">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <FaLock className="text-green-600" />
                      Reset Password
                    </h2>
                    <p className="text-gray-600 text-sm mb-4">
                      Create a new strong password for your account
                    </p>

                    {forgotPasswordSuccess && (
                      <Alert className="mb-4 border-green-300 bg-green-50 animate-fadeIn">
                        <FaCheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{forgotPasswordSuccess}</AlertDescription>
                      </Alert>
                    )}

                    {forgotPasswordError && (
                      <Alert variant="destructive" className="mb-4 animate-shake">
                        <FaExclamationCircle className="h-4 w-4" />
                        <AlertDescription>{forgotPasswordError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      {/* New Password */}
                      <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                        <Label htmlFor="new-password" className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                          <FaLock className="text-green-600" />
                          New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="h-10 pr-10 input-focus-animation transition-all duration-300 border-green-200 focus:border-green-500 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110"
                          >
                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>

                        {/* Segmented Strength Bar */}
                        {newPassword && (
                          <div className="mt-2 animate-fadeIn">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600">Password Strength:</span>
                              <span className={`text-xs font-semibold transition-colors duration-300 ${
                                calculatePasswordStrength(newPassword).strength <= 2 ? 'text-red-600' :
                                calculatePasswordStrength(newPassword).strength <= 3 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {calculatePasswordStrength(newPassword).label}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                  key={level}
                                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                                    level <= calculatePasswordStrength(newPassword).strength
                                      ? calculatePasswordStrength(newPassword).color
                                      : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Use 8+ chars with uppercase, lowercase, numbers & symbols
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        <Label htmlFor="confirm-password" className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                          <FaLock className="text-green-600" />
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`h-10 pr-16 input-focus-animation transition-all duration-300 bg-white ${
                              confirmPassword && newPassword !== confirmPassword
                                ? 'border-red-300 focus:border-red-500'
                                : confirmPassword && newPassword === confirmPassword
                                ? 'border-green-300 focus:border-green-500'
                                : 'border-green-200 focus:border-green-500'
                            }`}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {confirmPassword && (
                              <span className="animate-scaleIn">
                                {newPassword !== confirmPassword
                                  ? <FaExclamationCircle className="text-red-500 animate-pulse" />
                                  : <FaCheckCircle className="text-green-500" />
                                }
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110"
                            >
                              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1 animate-slideInRight">
                            <FaExclamationCircle className="text-xs" /> Passwords do not match
                          </p>
                        )}
                        {confirmPassword && newPassword === confirmPassword && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1 animate-slideInRight">
                            <FaCheckCircle className="text-xs" /> Passwords match
                          </p>
                        )}
                      </div>

                      {/* Reset Button */}
                      <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                        <Button
                          onClick={handleResetPassword}
                          disabled={isResettingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                          className="w-full h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isResettingPassword ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Resetting...
                            </span>
                          ) : 'Reset Password'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </>
  );
}
