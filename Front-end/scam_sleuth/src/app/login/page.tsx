"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight, Users, Shield } from 'lucide-react';

import { login } from './actions';

const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ 
    email: '', 
    password: '' 
  });
  const [errors, setErrors] = useState<FormErrors>({ 
    email: '', 
    password: '' 
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear API error when user modifies form
    if (apiError) {
      setApiError(null);
    }
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    const result = LoginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0] || '',
        password: fieldErrors.password?.[0] || '',
      });
      setIsLoading(false);
      return;
    }

    setErrors({ email: '', password: '' });
    setApiError(null);

    try {
      const response = await login(formData);
      
      if (!response.success) {
        setApiError(response.message);
        setIsLoading(false);
        return;
      }

      // Check role to determine where to redirect
      if (response.data.role === 'admin') {
        // Admin login successful
        router.push('/admin-dashboard');
      } else {
        // Regular user login
        if (!response.data.is_verified) {
          router.push('/otp');
          return;
        }
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldIcon = (fieldName: string) => {
    const iconProps = {
      className: `w-5 h-5 transition-colors duration-200`,
      style: {
        color: focusedField === fieldName ? '#E14048' : 
               errors[fieldName as keyof FormErrors] ? '#E14048' : 
               formData[fieldName as keyof FormData] ? '#22c55e' : 
               '#9ca3af'
      }
    };

    switch (fieldName) {
      case 'email': return <Mail {...iconProps} />;
      case 'password': return <Lock {...iconProps} />;
      default: return null;
    }
  };

  const getFieldValidation = (fieldName: string) => {
    const value = formData[fieldName as keyof FormData];
    const error = errors[fieldName as keyof FormErrors];
    
    if (error) {
      return { isValid: false, message: error };
    }
    
    if (!value) return null;
    
    switch (fieldName) {
      case 'email':
        return z.string().email().safeParse(value).success 
          ? { isValid: true, message: 'Valid email format' }
          : null;
      case 'password':
        return value.length >= 6 
          ? { isValid: true, message: 'Password entered' }
          : null;
      default:
        return null;
    }
  };

  const renderFormField = (
    name: keyof FormData, 
    label: string, 
    type: string = 'text', 
    placeholder: string = ''
  ) => {
    const validation = getFieldValidation(name);
    const hasError = !!errors[name];
    const isFocused = focusedField === name;
    const hasValue = !!formData[name];

    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold mb-1" style={{ color: '#0F1217' }}>
          {label} <span style={{ color: '#E14048' }}>*</span>
        </label>
        <div className="relative group">
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 z-10 transition-all duration-200`}>
            {getFieldIcon(name)}
          </div>
          <input
            type={type === 'password' && showPassword ? 'text' : type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            onFocus={() => handleFocus(name)}
            onBlur={handleBlur}
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: hasError ? '#E14048' : 
                           isFocused ? '#E14048' :
                           hasValue ? '#4ade80' :
                           '#d1d5db',
              borderWidth: '2px'
            }}
            className={`w-full pl-12 transition-all duration-200
              ${type === 'password' ? 'pr-20' : 'pr-12'} py-4 rounded-xl
              focus:ring-4 focus:outline-none text-base placeholder-gray-400
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
            `}
            placeholder={placeholder}
            required
            disabled={isLoading}
          />
          
          {/* Password visibility toggle */}
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-20"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
          
          {/* Validation icon with hover tooltip */}
          {validation && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 group">
              {validation.isValid ? (
                <div className="relative">
                  <CheckCircle2 className="w-5 h-5 text-green-500 cursor-help" />
                  {/* Tooltip */}
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {validation.message}
                    <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              ) : (
                <AlertCircle className="w-5 h-5" style={{ color: '#E14048' }} />
              )}
            </div>
          )}
        </div>
        
        {/* Validation message - only show errors, not success messages */}
        {validation && !validation.isValid && (
          <div className="flex items-center gap-2 text-sm" style={{ color: '#E14048' }}>
            <AlertCircle className="w-4 h-4" />
            <span>{validation.message}</span>
          </div>
        )}
      </div>
    );
  };

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
                  Welcome Back
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-3" style={{ color: '#0F1217' }}>
                  Sign In to Your Account
                </h1>
                <p className="text-lg" style={{ color: '#0F1217', opacity: 0.7 }}>
                  Continue your journey as a digital sleuth
                </p>
              </div>



              {/* Form */}
              <div className="space-y-6">
                {renderFormField('email', 'Email Address', 'email', 'Enter your email address')}
                {renderFormField('password', 'Password', 'password', 'Enter your password')}

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link 
                    href="/forgot-password" 
                    className="text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: '#E14048' }}
                  >
                    Forgot your password?
                  </Link>
                </div>

                {/* API Error */}
                {apiError && (
                  <div className="flex items-center gap-3 p-4 border rounded-xl" style={{ backgroundColor: '#fef2f2', borderColor: '#E14048' }}>
                    <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#E14048' }} />
                    <p className="text-sm font-medium" style={{ color: '#E14048' }}>{apiError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <Button 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full h-14 font-bold text-lg rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0"
                    style={{ 
                      background: `linear-gradient(to right, #E14048, #c73530)`,
                      color: '#FFFFFF'
                    }}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing In...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Sign In
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center pt-6 border-t" style={{ borderColor: 'rgba(165, 145, 138, 0.3)' }}>
                  <p style={{ color: '#0F1217', opacity: 0.8 }}>
                    Don&apos;t have an account?{' '}
                    <Link 
                      href="/signup" 
                      className="font-semibold transition-colors hover:opacity-80"
                      style={{ color: '#E14048' }}
                    >
                      Sign up
                    </Link>
                  </p>
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
                  Welcome back,{' '}
                  <span style={{ color: '#E14048' }}>
                    Sleuth
                  </span>
                </h2>
                <p className="text-xl leading-relaxed max-w-sm" style={{ color: '#FFFFFF', opacity: 0.9 }}>
                  Continue your mission to make the digital world safer for everyone.
                </p>
                
                {/* Features */}
                <div className="grid grid-cols-1 gap-4 pt-8">
                  <div className="flex items-center gap-3 text-left">
                    <Shield className="w-6 h-6 flex-shrink-0" style={{ color: '#E14048' }} />
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#FFFFFF' }}>Secure Platform</div>
                      <div className="text-xs" style={{ color: '#FFFFFF', opacity: 0.7 }}>Your data is protected</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <Users className="w-6 h-6 flex-shrink-0" style={{ color: '#E14048' }} />
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#FFFFFF' }}>Community Driven</div>
                      <div className="text-xs" style={{ color: '#FFFFFF', opacity: 0.7 }}>Join thousands of sleuths</div>
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