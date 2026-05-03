'use client';

import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Leaf, ArrowLeft, ShieldCheck, Loader2, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { NetworkIndicator } from '@/components/NetworkIndicator';

// Password strength scorer
function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: 'Very weak', color: 'bg-red-500' };
  if (score === 2) return { score, label: 'Weak', color: 'bg-orange-400' };
  if (score === 3) return { score, label: 'Fair', color: 'bg-yellow-400' };
  if (score === 4) return { score, label: 'Strong', color: 'bg-emerald-500' };
  return { score, label: 'Very strong', color: 'bg-green-600' };
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step 1: Email
  const [email, setEmail] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Step 2: OTP verification
  const [otp, setOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpTimeLeft, setOtpTimeLeft] = useState(600); // 10 minutes
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Step 3: New password
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Flow state
  const [step, setStep] = useState<'email' | 'otp' | 'password' | 'done'>('email');

  const strength = getStrength(password);
  const passwordsMatch = confirm.length > 0 && password === confirm;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

  // Password requirements
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // OTP timer countdown
  useEffect(() => {
    if (step === 'otp' && otpTimeLeft > 0) {
      const timer = setTimeout(() => setOtpTimeLeft(otpTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (otpTimeLeft === 0 && step === 'otp') {
      toast.error('OTP expired', {
        description: 'Please request a new OTP',
      });
      setStep('email');
      setOtp('');
    }
  }, [otpTimeLeft, step]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSendingOtp(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Something went wrong', {
          description: 'Please check your email and try again.',
        });
        return;
      }
      toast.success('OTP sent successfully', {
        description: `Check your inbox at ${email}`,
      });
      setStep('otp');
      setResendTimer(60); // 60 second cooldown
    } catch {
      toast.error('Connection error', {
        description: 'Unable to send OTP. Please try again.',
      });
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Invalid OTP', {
        description: 'Please enter the full 6-digit code',
      });
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error('Invalid OTP', {
          description: data.message || 'Please check and try again',
        });
        return;
      }
      toast.success('OTP verified', {
        description: 'Now set your new password',
      });
      setStep('password');
    } catch {
      toast.error('Connection error', {
        description: 'Unable to verify OTP. Please try again.',
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Step 3: Reset password
  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match', {
        description: 'Please ensure both passwords are identical',
      });
      return;
    }
    if (strength.score < 2) {
      toast.error('Password too weak', {
        description: 'Please choose a stronger password',
      });
      return;
    }
    setResetting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error('Reset failed', {
          description: data.message || 'Please try again',
        });
        return;
      }
      setStep('done');
      toast.success('Password reset successfully', {
        description: 'Redirecting to login...',
      });
      setTimeout(() => router.push('/'), 2500);
    } catch {
      toast.error('Connection error', {
        description: 'Unable to reset password. Please try again.',
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <NetworkIndicator />
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200 p-8">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image 
              src="/logo.png" 
              alt="Aquanet Logo" 
              width={180} 
              height={180} 
              className="drop-shadow-md" 
              style={{ height: 'auto' }}
              loading="eager"
              priority
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1 font-josefin flex items-center gap-2 justify-center">
            <Leaf className="w-6 h-6 text-green-600" />
            Forgot Password
          </h2>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mt-3 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${['email', 'otp', 'password', 'done'].indexOf(step) >= 0 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
            <div className={`h-0.5 w-10 transition-all ${['otp', 'password', 'done'].indexOf(step) >= 0 ? 'bg-green-600' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${['otp', 'password', 'done'].indexOf(step) >= 0 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
            <div className={`h-0.5 w-10 transition-all ${['password', 'done'].indexOf(step) >= 0 ? 'bg-green-600' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${['password', 'done'].indexOf(step) >= 0 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>3</div>
          </div>

          {/* ── STEP 1: Email ── */}
          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="space-y-4 animate-in fade-in duration-300">
              <p className="text-sm text-gray-600 font-nunito text-center mb-2">
                Enter your email and we'll send a 6-digit OTP.
              </p>
              <div className="space-y-1">
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 font-nunito">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-green-50/50 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-nunito text-sm transition-all"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={sendingOtp}
                className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-semibold py-2.5 rounded-lg transition-all font-nunito shadow-md disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sendingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : 'Send OTP'}
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP Verification ── */}
          {step === 'otp' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <Alert variant="default" className="border-green-300 bg-green-50">
                <Mail className="w-4 h-4 text-green-600" />
                <AlertTitle className="text-green-800 font-josefin">OTP sent</AlertTitle>
                <AlertDescription className="text-green-700 font-nunito text-xs">
                  A 6-digit code was sent to <span className="font-semibold">{email}</span>. It expires in 10 minutes.
                </AlertDescription>
              </Alert>

              {/* OTP input */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 font-nunito">
                  Enter OTP
                </label>
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
                
                {/* Copy OTP button */}
                {otp.length === 6 && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(otp);
                      setCopiedOtp(true);
                      setTimeout(() => setCopiedOtp(false), 2000);
                      toast.success('OTP copied to clipboard');
                    }}
                    className="w-full flex items-center justify-center gap-2 text-xs text-green-600 hover:text-green-700 font-medium py-2 transition-colors"
                    aria-label="Copy OTP to clipboard"
                  >
                    {copiedOtp ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy OTP
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* OTP Timer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-nunito">
                  <span className="text-gray-600">Time remaining:</span>
                  <span className={`font-semibold ${otpTimeLeft < 60 ? 'text-red-600' : 'text-green-600'}`}>
                    {Math.floor(otpTimeLeft / 60)}:{String(otpTimeLeft % 60).padStart(2, '0')}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all ${otpTimeLeft > 300 ? 'bg-green-600' : otpTimeLeft > 60 ? 'bg-yellow-500' : 'bg-red-600'}`}
                    style={{ width: `${(otpTimeLeft / 600) * 100}%` }}
                    role="progressbar"
                    aria-valuenow={otpTimeLeft}
                    aria-valuemin={0}
                    aria-valuemax={600}
                    aria-label="OTP expiration timer"
                  />
                </div>
              </div>

              {/* Verify button */}
              <button
                onClick={handleVerifyOtp}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && otp.length === 6 && !verifyingOtp) {
                    handleVerifyOtp();
                  }
                }}
                disabled={verifyingOtp || otp.length !== 6}
                className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-semibold py-2.5 rounded-lg transition-all font-nunito shadow-md disabled:cursor-not-allowed flex items-center justify-center gap-2"
                aria-label="Verify OTP code"
              >
                {verifyingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying OTP...
                  </>
                ) : 'Verify OTP'}
              </button>

              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-nunito text-center">
                  Didn't receive it?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setOtp('');
                      setStep('email');
                    }}
                    disabled={resendTimer > 0}
                    className={`font-medium transition-colors ${resendTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:text-green-700'}`}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </p>
              </div>

              {/* Back button */}
              <button
                type="button"
                onClick={() => {
                  setOtp('');
                  setStep('email');
                  setResendTimer(0);
                }}
                className="w-full text-gray-600 hover:text-gray-700 font-medium py-2 text-sm transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to email
              </button>
            </div>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === 'password' && (
            <form onSubmit={handleReset} className="space-y-5 animate-in fade-in duration-300">
              <Alert variant="default" className="border-green-300 bg-green-50">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <AlertTitle className="text-green-800 font-josefin">OTP Verified</AlertTitle>
                <AlertDescription className="text-green-700 font-nunito text-xs">
                  Now set your new password
                </AlertDescription>
              </Alert>

              {/* New password */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 font-nunito">
                  New password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2.5 bg-green-50/50 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-nunito text-sm transition-all"
                    required
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Strength meter */}
                {password.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-nunito font-medium ${
                      strength.score <= 1 ? 'text-red-500' :
                      strength.score === 2 ? 'text-orange-500' :
                      strength.score === 3 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>{strength.label}</p>

                    {/* Requirements */}
                    <div className="space-y-1 mt-2">
                      <div className={`flex items-center gap-2 text-xs font-nunito ${requirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                        {requirements.length ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        At least 8 characters
                      </div>
                      <div className={`flex items-center gap-2 text-xs font-nunito ${requirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                        {requirements.uppercase ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        One uppercase letter
                      </div>
                      <div className={`flex items-center gap-2 text-xs font-nunito ${requirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                        {requirements.number ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        One number
                      </div>
                      <div className={`flex items-center gap-2 text-xs font-nunito ${requirements.special ? 'text-green-600' : 'text-gray-500'}`}>
                        {requirements.special ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        One special character
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1">
                <label htmlFor="confirm" className="block text-xs font-medium text-gray-700 font-nunito">
                  Confirm new password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600 pointer-events-none" />
                  <input
                    id="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={`w-full pl-10 pr-12 py-2.5 bg-green-50/50 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 placeholder-gray-500 font-nunito text-sm transition-all ${
                      passwordsMismatch ? 'border-red-400 focus:ring-red-400' :
                      passwordsMatch ? 'border-green-500 focus:ring-green-500' :
                      'border-green-300 focus:ring-green-500'
                    }`}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    title={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordsMismatch && (
                  <p className="text-xs text-red-500 font-nunito flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Passwords do not match
                  </p>
                )}
                {passwordsMatch && (
                  <p className="text-xs text-green-600 font-nunito flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={resetting || passwordsMismatch}
                className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-semibold py-2.5 rounded-lg transition-all font-nunito shadow-md disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Resetting...
                  </>
                ) : 'Reset Password'}
              </button>

              {/* Back button */}
              <button
                type="button"
                onClick={() => {
                  setPassword('');
                  setConfirm('');
                  setStep('otp');
                }}
                className="w-full text-gray-600 hover:text-gray-700 font-medium py-2 text-sm transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to OTP
              </button>
            </form>
          )}

          {/* ── Done ── */}
          {step === 'done' && (
            <div className="text-center space-y-4 mt-2 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8 text-green-600" />
              </div>
              <Alert variant="default" className="border-green-300 bg-green-50">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <AlertTitle className="text-green-800 font-josefin">Password updated</AlertTitle>
                <AlertDescription className="text-green-700 font-nunito text-xs">
                  Your password has been reset. The admin has been notified. Redirecting to login...
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-green-200 flex justify-center">
            <Link href="/" className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-nunito font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
