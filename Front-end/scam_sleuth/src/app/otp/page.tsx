'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Shield, CheckCircle2, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { authorize, resendCode } from './actions';

export default function CodeVerificationPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [focusedField, setFocusedField] = useState(false);

  useEffect(() => {
    const generateInitialCode = async () => {
      const response = await resendCode();
      setIsLoading(false);
      if (!response.success) {
        setIsError(true);
        setMessage("Couldn't send verification code. Please try again.");
      } else {
        setMessage('Verification code sent to your email!');
        setIsError(false);
      }
    };

    generateInitialCode();
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only allow digits, max 6
    setCode(value);
    
    // Clear messages when user starts typing
    if (message && isError) {
      setMessage('');
      setIsError(false);
    }
  };

  const handleSubmit = async () => {
    if (code.length !== 6) {
      setMessage('Please enter a 6-digit verification code.');
      setIsError(true);
      return;
    }

    setIsVerifying(true);
    setIsError(false);
    setMessage('');
    
    const response = await authorize(code);

    if (!response.success) {
      setMessage(response.message);
      setIsError(true);
      setIsVerifying(false);
      return;
    }

    setMessage('Code verified! Redirecting to dashboard...');
    setIsError(false);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setIsError(false);
    setMessage('Sending new code...');
    
    const response = await resendCode();
    
    setMessage(response.message);
    setIsError(!response.success);
    setIsResending(false);
  };

  const handleFocus = () => {
    setFocusedField(true);
  };

  const handleBlur = () => {
    setFocusedField(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#BBB8AF' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" style={{ borderTopColor: '#E14048' }}></div>
          <p className="text-lg font-medium" style={{ color: '#0F1217' }}>Sending verification code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#BBB8AF' }}>
      <div className="flex items-center justify-center p-4 sm:p-6 lg:p-16 min-h-screen">
        <div className="rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row w-full max-w-7xl relative" style={{ backgroundColor: '#E2E0D1' }}>
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br opacity-20 rounded-full -translate-x-16 -translate-y-16" style={{ background: 'linear-gradient(to bottom right, #E14048, transparent)' }}></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br opacity-20 rounded-full translate-x-20 translate-y-20" style={{ background: 'linear-gradient(to bottom right, #A5918A, transparent)' }}></div>
          
          {/* Form Section */}
          <div className="w-full lg:w-3/5 p-6 sm:p-8 lg:p-12 relative z-10">
            <div className="max-w-md mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: '#E14048', color: '#FFFFFF' }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FFFFFF' }}></div>
                  Email Verification
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-3" style={{ color: '#0F1217' }}>
                  Verify Your Email
                </h1>
                <p className="text-lg" style={{ color: '#0F1217', opacity: 0.7 }}>
                  We&apos;ve sent a 6-digit code to your email address
                </p>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Verification Code Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#0F1217' }}>
                    Verification Code <span style={{ color: '#E14048' }}>*</span>
                  </label>
                  <div className="relative group">
                    <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 z-10 transition-all duration-200`}>
                      <Mail 
                        className="w-5 h-5 transition-colors duration-200" 
                        style={{ 
                          color: focusedField ? '#E14048' : 
                                 isError ? '#E14048' : 
                                 code.length === 6 ? '#22c55e' : 
                                 '#9ca3af' 
                        }} 
                      />
                    </div>
                    <input
                      type="text"
                      name="code"
                      value={code}
                      onChange={handleCodeChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderColor: isError ? '#E14048' : 
                                     focusedField ? '#E14048' :
                                     code.length === 6 ? '#22c55e' :
                                     '#d1d5db',
                        borderWidth: '2px'
                      }}
                      className="w-full pl-12 pr-12 py-4 rounded-xl transition-all duration-200 text-center text-lg font-mono tracking-widest focus:ring-4 focus:outline-none placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="000000"
                      maxLength={6}
                      required
                      disabled={isVerifying}
                    />
                    
                    {/* Validation icon */}
                    {code.length > 0 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {code.length === 6 ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Helper text */}
                  <p className="text-xs text-center" style={{ color: '#0F1217', opacity: 0.6 }}>
                    Enter the 6-digit code from your email
                  </p>
                </div>

                {/* Message Display */}
                {message && (
                  <div className={`flex items-center gap-3 p-4 border rounded-xl ${
                    isError ? 'border-red-200' : 'border-green-200'
                  }`} style={{ 
                    backgroundColor: isError ? '#fef2f2' : '#f0fdf4',
                    borderColor: isError ? '#E14048' : '#22c55e'
                  }}>
                    {isError ? (
                      <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#E14048' }} />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500" />
                    )}
                    <p className={`text-sm font-medium ${
                      isError ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {message}
                    </p>
                  </div>
                )}

                {/* Verify Button */}
                <div className="pt-4">
                  <Button 
                    onClick={handleSubmit}
                    disabled={isVerifying || code.length !== 6}
                    className="w-full h-14 font-bold text-lg rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0"
                    style={{ 
                      background: `linear-gradient(to right, #E14048, #c73530)`,
                      color: '#FFFFFF'
                    }}
                  >
                    {isVerifying ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Verifying...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Verify Code
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </div>

                {/* Resend Code */}
                <div className="text-center pt-6 border-t" style={{ borderColor: 'rgba(165, 145, 138, 0.3)' }}>
                  <p className="mb-3" style={{ color: '#0F1217', opacity: 0.8 }}>
                    Didn&apos;t receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResending}
                    className="inline-flex items-center gap-2 font-semibold transition-colors hover:opacity-80 disabled:opacity-50"
                    style={{ color: '#E14048' }}
                  >
                    {isResending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Resend Code
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="hidden lg:flex w-2/5 relative overflow-hidden" style={{ background: `linear-gradient(to bottom right, #0F1217, #E14048)` }}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 border rounded-full" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}></div>
              <div className="absolute top-3/4 right-1/4 w-24 h-24 border rounded-full" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}></div>
              <div className="absolute top-1/2 left-1/2 w-16 h-16 border rounded-full transform -translate-x-1/2 -translate-y-1/2" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}></div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: `radial-gradient(circle, rgba(225, 64, 72, 0.2), transparent)` }}></div>
                  <Image
                    src={heroImage}
                    alt="Detective Dog"
                    width={320}
                    height={370}
                    className="relative z-10 drop-shadow-2xl"
                  />
                </div>
              </div>
              
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight" style={{ color: '#FFFFFF' }}>
                  Almost there,{' '}
                  <span style={{ color: '#E14048' }}>
                    Sleuth
                  </span>
                </h2>
                <p className="text-xl leading-relaxed max-w-sm" style={{ color: '#FFFFFF', opacity: 0.9 }}>
                  Verify your email to complete your registration and start protecting the digital world.
                </p>
                
                {/* Security Features */}
                <div className="grid grid-cols-1 gap-4 pt-8">
                  <div className="flex items-center gap-3 text-left">
                    <Shield className="w-6 h-6 flex-shrink-0" style={{ color: '#E14048' }} />
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#FFFFFF' }}>Secure Verification</div>
                      <div className="text-xs" style={{ color: '#FFFFFF', opacity: 0.7 }}>Your account is protected</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <Mail className="w-6 h-6 flex-shrink-0" style={{ color: '#E14048' }} />
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#FFFFFF' }}>Email Confirmation</div>
                      <div className="text-xs" style={{ color: '#FFFFFF', opacity: 0.7 }}>Verify your identity</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}