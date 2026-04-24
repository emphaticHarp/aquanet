'use client';

import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { NetworkIndicator } from '@/components/NetworkIndicator';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [selectedRole, setSelectedRole] = useState<'member' | 'admin' | 'researcher'>('member');
  const [errors, setErrors] = useState<{ email?: boolean; password?: boolean }>({});
  const [rememberMe, setRememberMe] = useState(true);

  // Rate limiting: max 5 attempts per minute
  const MAX_ATTEMPTS = 5;
  const RATE_LIMIT_WINDOW = 60000; // 1 minute

  // Load remember me preference
  useEffect(() => {
    const saved = localStorage.getItem('rememberMe');
    if (saved === 'true') {
      const savedEmail = localStorage.getItem('savedEmail');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    // Form validation
    if (!email || !password) {
      toast.error('Validation error', {
        description: 'Please fill in all fields',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Invalid email', {
        description: 'Please enter a valid email address',
      });
      setErrors({ email: true });
      return;
    }

    if (password.length < 6) {
      toast.error('Invalid password', {
        description: 'Password must be at least 6 characters',
      });
      setErrors({ password: true });
      return;
    }

    // Check rate limiting
    if (attemptCount >= MAX_ATTEMPTS) {
      setRateLimitError(true);
      toast.error('Too many login attempts', {
        description: 'Please try again in a minute',
      });
      return;
    }

    setIsLoading(true);
    setAttemptCount(prev => prev + 1);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsLoading(false);

        if (response.status === 429) {
          setRateLimitError(true);
          toast.error('Too many login attempts', { description: data.message });
          return;
        }

        if (data.message === 'Account not found') {
          setErrors({ email: true });
        } else if (data.message === 'Invalid credentials') {
          setErrors({ password: true });
        }

        toast.error(data.message || 'Login failed', {
          description: data.message === 'Invalid credentials'
            ? 'The password you entered is incorrect. Please try again.'
            : data.message === 'Account not found'
            ? 'No account exists with this email. Please check and try again.'
            : 'Please check your credentials and try again.',
        });

        // Clear error state after animation completes (2 seconds)
        setTimeout(() => {
          setErrors({});
        }, 2000);

        return;
      }

      // Success path — don't call setIsLoading(false) here, let it redirect
      setErrors({});
      
      // Save remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('savedEmail', email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('savedEmail');
      }
      
      toast.success('Login successful', {
        description: 'Welcome back to Aquanet!',
      });

      localStorage.setItem('user', JSON.stringify(data.user));
      setEmail('');
      setPassword('');
      setAttemptCount(0);
      setRateLimitError(false);

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (error: any) {
      setIsLoading(false);
      toast.error('Connection error', {
        description: 'Unable to connect to the server. Please try again.',
      });
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && !rateLimitError) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  // Reset rate limit after window expires
  useEffect(() => {
    if (attemptCount > 0) {
      const timer = setTimeout(() => {
        setAttemptCount(0);
        setRateLimitError(false);
      }, RATE_LIMIT_WINDOW);
      return () => clearTimeout(timer);
    }
  }, [attemptCount]);

  // Leaf SVG component
  const LeafIcon = ({ className, style }: { className: string; style?: React.CSSProperties }) => (
    <svg className={className} style={style} viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 10 Q70 30 60 60 Q50 80 30 70 Q20 50 50 10" />
      <path d="M50 20 L50 70" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      <NetworkIndicator />
      {/* Falling leaves container */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Leaf 1 */}
        <div className="absolute left-[10%] top-0 leaf-fall-1">
          <LeafIcon className="w-12 h-12 text-green-600 opacity-70" />
        </div>

        {/* Leaf 2 */}
        <div className="absolute left-[20%] top-0 leaf-fall-2" style={{ animationDelay: '2s' }}>
          <LeafIcon className="w-10 h-10 text-emerald-500 opacity-60" />
        </div>

        {/* Leaf 3 */}
        <div className="absolute left-[30%] top-0 leaf-fall-3" style={{ animationDelay: '1s' }}>
          <LeafIcon className="w-14 h-14 text-green-500 opacity-50" />
        </div>

        {/* Leaf 4 */}
        <div className="absolute left-[40%] top-0 leaf-fall-1" style={{ animationDelay: '3s' }}>
          <LeafIcon className="w-11 h-11 text-teal-600 opacity-65" />
        </div>

        {/* Leaf 5 */}
        <div className="absolute left-[50%] top-0 leaf-fall-2" style={{ animationDelay: '0.5s' }}>
          <LeafIcon className="w-9 h-9 text-green-600 opacity-70" />
        </div>

        {/* Leaf 6 */}
        <div className="absolute left-[60%] top-0 leaf-fall-3" style={{ animationDelay: '2.5s' }}>
          <LeafIcon className="w-12 h-12 text-emerald-600 opacity-55" />
        </div>

        {/* Leaf 7 */}
        <div className="absolute left-[70%] top-0 leaf-fall-1" style={{ animationDelay: '1.5s' }}>
          <LeafIcon className="w-10 h-10 text-green-500 opacity-60" />
        </div>

        {/* Leaf 8 */}
        <div className="absolute left-[80%] top-0 leaf-fall-2" style={{ animationDelay: '3.5s' }}>
          <LeafIcon className="w-13 h-13 text-teal-500 opacity-50" />
        </div>

        {/* Leaf 9 */}
        <div className="absolute left-[90%] top-0 leaf-fall-3" style={{ animationDelay: '0.8s' }}>
          <LeafIcon className="w-11 h-11 text-green-600 opacity-65" />
        </div>

        {/* Leaf 10 */}
        <div className="absolute left-[15%] top-0 leaf-fall-1" style={{ animationDelay: '4s' }}>
          <LeafIcon className="w-9 h-9 text-emerald-500 opacity-70" />
        </div>
      </div>

      {/* Main container - Two column layout */}
      <div className="w-full max-w-5xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left side - Logo & Branding */}
          <div className="flex flex-col items-center lg:items-start justify-center hidden lg:flex">
            <div className="mb-6 relative">
              <Image 
                src="/aqua.png" 
                alt="Aquanet Logo" 
                width={280} 
                height={280}
                className="drop-shadow-md"
                style={{ height: 'auto', width: 'auto' }}
                loading="eager"
                priority
              />
              <div className="mt-4 text-center lg:text-left">
                <p className="text-sm text-green-700 font-semibold mb-1 font-nunito">Empowering Fisheries Intelligence</p>
                <p className="text-xs text-gray-600 font-nunito">Powered by MegaBotics</p>
              </div>
            </div>
            
            {/* Description */}
            <div className="mb-5 text-left">
              <p className="text-xs text-gray-700 leading-relaxed font-nunito mb-3">
                Connect with industry experts, access real-time insights, and collaborate on fisheries research and robotics innovation.
              </p>
            </div>

            {/* Features list */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-gray-900 font-nunito mb-2">Key Features:</h4>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Leaf className="w-2.5 h-2.5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 font-nunito">AI-Powered Analytics</p>
                  <p className="text-xs text-gray-600 font-nunito">Real-time data insights</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Leaf className="w-2.5 h-2.5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 font-nunito">Smart Networking</p>
                  <p className="text-xs text-gray-600 font-nunito">Connect with peers globally</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Leaf className="w-2.5 h-2.5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 font-nunito">Secure Platform</p>
                  <p className="text-xs text-gray-600 font-nunito">Enterprise-grade security</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden">
              {/* Subtle gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 via-transparent to-emerald-50/10 pointer-events-none" />
              
              <div className="relative z-10">
                {/* Logo at top of form */}
                <div className="flex justify-center mb-4">
                  <Image 
                    src="/logo.png" 
                    alt="MegaBotics Logo" 
                    width={240} 
                    height={240}
                    className="drop-shadow-sm"
                    style={{ height: 'auto' }}
                    loading="eager"
                    priority
                  />
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1 font-josefin">Welcome Back</h2>
                  <p className="text-xs text-gray-500 font-nunito mb-2">Sign in to your Aquanet account</p>
                  <p className="text-xs text-gray-600 font-nunito leading-relaxed">Access your dashboard, collaborate with experts, and explore fisheries intelligence</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Email Input */}
                  <div className="space-y-1">
                    <label htmlFor="email" className="block text-xs font-semibold text-gray-700 font-nunito">
                      Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none" />
                      <input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrors({ ...errors, email: false });
                        }}
                        onKeyDown={handleKeyDown}
                        className={`w-full pl-10 pr-3 py-2 bg-gray-50 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all font-nunito text-sm shadow-sm focus:shadow-md ${
                          errors.email 
                            ? 'border-red-400 bg-red-50/50 focus:ring-red-400 animate-pulse' 
                            : 'border-gray-200 focus:ring-green-500 focus:bg-white focus:border-green-400'
                        }`}
                        required
                        disabled={rateLimitError || isLoading}
                        aria-label="Email address"
                        aria-invalid={errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1">
                    <label htmlFor="password" className="block text-xs font-semibold text-gray-700 font-nunito">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors({ ...errors, password: false });
                        }}
                        onKeyDown={handleKeyDown}
                        className={`w-full pl-10 pr-10 py-2 bg-gray-50 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all font-nunito text-sm shadow-sm focus:shadow-md ${
                          errors.password 
                            ? 'border-red-400 bg-red-50/50 focus:ring-red-400 animate-pulse' 
                            : 'border-gray-200 focus:ring-green-500 focus:bg-white focus:border-green-400'
                        }`}
                        required
                        disabled={rateLimitError || isLoading}
                        aria-label="Password"
                        aria-invalid={errors.password}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={rateLimitError || isLoading}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-1 pt-1">
                    <label className="block text-xs font-semibold text-gray-700 font-nunito">
                      Role
                    </label>
                    {isLoading ? (
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'member', label: 'Member', icon: '👤' },
                          { id: 'admin', label: 'Admin', icon: '🔐' },
                          { id: 'researcher', label: 'Researcher', icon: '🔬' }
                        ].map((role) => (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => setSelectedRole(role.id as any)}
                            disabled={rateLimitError || isLoading}
                            className={`py-2 px-2 rounded-lg border-2 transition-all text-xs font-nunito font-medium flex flex-col items-center gap-1 shadow-sm hover:shadow-md ${
                              selectedRole === role.id
                                ? 'border-green-500 bg-green-50 text-green-900 shadow-md'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50/30'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <span className="text-base">{role.icon}</span>
                            <span className="text-xs">{role.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Remember & Forgot */}
                  {!isLoading && (
                    <div className="flex items-center justify-between text-xs pt-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                          disabled={rateLimitError}
                        />
                        <span className="text-gray-600 group-hover:text-gray-700 font-nunito">Keep signed in</span>
                      </label>
                      <a href="/forgot-password" className="text-green-600 hover:text-green-700 font-semibold transition-colors font-nunito">
                        Forgot Password?
                      </a>
                    </div>
                  )}

                  {/* Loading State Feedback */}
                  {isLoading && (
                    <div className="space-y-2 pt-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-full animate-pulse" />
                      </div>
                      <p className="text-xs text-gray-600 font-nunito text-center">Verifying credentials...</p>
                    </div>
                  )}

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isLoading || rateLimitError}
                    className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 disabled:from-gray-300 disabled:via-gray-300 disabled:to-gray-300 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 mt-5 font-nunito shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:shadow-sm text-sm"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Signing in...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
