"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Eye, EyeOff, Mail, User, Lock, UserCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { signup } from './actions';

const SignupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  name: z.string().min(1, { message: 'Name is required' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters long' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

interface FormData {
  email: string;
  name: string;
  username: string;
  password: string;
}

interface FormErrors {
  email: string;
  name: string;
  username: string;
  password: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ 
    email: '', 
    name: '', 
    username: '', 
    password: '' 
  });
  const [errors, setErrors] = useState<FormErrors>({ 
    email: '', 
    name: '', 
    username: '', 
    password: '' 
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '', checks: [] };
    
    const checks = [
      { test: password.length >= 8, label: 'At least 8 characters', id: 'length' },
      { test: /[a-z]/.test(password), label: 'Lowercase letter', id: 'lowercase' },
      { test: /[A-Z]/.test(password), label: 'Uppercase letter', id: 'uppercase' },
      { test: /\d/.test(password), label: 'Number', id: 'number' },
      { test: /[!@#$%^&*(),.?":{}|<>]/.test(password), label: 'Special character', id: 'special' },
      { test: password.length >= 12, label: '12+ characters (recommended)', id: 'longLength' }
    ];
    
    const score = checks.filter(check => check.test).length;
    
    let label = '';
    let color = '';
    
    if (score <= 2) {
      label = 'Weak';
      color = '#E14048';
    } else if (score <= 3) {
      label = 'Fair';
      color = '#f59e0b';
    } else if (score <= 4) {
      label = 'Good';
      color = '#22c55e';
    } else {
      label = 'Strong';
      color = '#059669';
    }
    
    return { score, label, color, checks };
  };

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

    const result = SignupSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0] || '',
        name: fieldErrors.name?.[0] || '',
        username: fieldErrors.username?.[0] || '',
        password: fieldErrors.password?.[0] || '',
      });
      setIsLoading(false);
      return;
    }

    setErrors({ email: '', name: '', username: '', password: '' });
    setApiError(null);

    try {
      const response = await signup(formData);

      if (!response.success) {
        setApiError(response.message);
        setIsLoading(false);
        return;
      }

      // Success - redirect to OTP page
      router.push('/otp');
    } catch (error) {
      console.error('Error signing up:', error);
      setApiError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const getFieldIcon = (fieldName: string) => {
    const iconProps = {
      className: `w-5 h-5 transition-colors duration-200`,
      style: {
        color: focusedField === fieldName ? '#E14048' : 
               errors[fieldName as keyof FormErrors] ? '#E14048' : 
               // Only show green for email and password validation, not username
               (fieldName !== 'username' && formData[fieldName as keyof FormData]) ? 
               (fieldName === 'password' ? 
                 (calculatePasswordStrength(formData.password).score >= 3 ? '#22c55e' : '#f59e0b') : 
                 '#22c55e') : 
               '#9ca3af'
      }
    };

    switch (fieldName) {
      case 'email': return <Mail {...iconProps} />;
      case 'name': return <User {...iconProps} />;
      case 'username': return <UserCheck {...iconProps} />;
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
      case 'username':
        // Only show basic length validation, not "looks good" until backend confirms
        return value.length >= 3 
          ? { isValid: true, message: 'Minimum length met' }
          : null;
      case 'password':
        const strength = calculatePasswordStrength(value);
        if (value.length >= 6) {
          return { 
            isValid: strength.score >= 3, 
            message: `Password strength: ${strength.label}`,
            strength 
          };
        }
        return null;
      case 'name':
        return value.length >= 1 
          ? { isValid: true, message: 'Name entered' }
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
                           // Special handling for password strength
                           (name === 'password' && hasValue) ? 
                             (calculatePasswordStrength(formData.password).score >= 3 ? '#22c55e' : '#f59e0b') :
                           // Only show green border for email and name, not username
                           (name !== 'username' && name !== 'password' && hasValue) ? '#4ade80' :
                           '#d1d5db',
              borderWidth: '2px'
            }}
            className={`w-full pl-12 transition-all duration-200
              ${type === 'password' ? 'pr-20' : 'pr-12'} py-4 rounded-xl
              ${hasError ? 'focus:ring-4' : 
                isFocused ? 'focus:ring-4' :
                hasValue ? 'focus:ring-4' :
                'focus:ring-4'}
              focus:outline-none text-base placeholder-gray-400
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
          
          {/* Validation icon */}
          {validation && name !== 'username' && name !== 'password' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {validation.isValid ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5" style={{ color: '#E14048' }} />
              )}
            </div>
          )}
          
          {/* Password strength icon - positioned to not conflict with eye button */}
          {name === 'password' && validation && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
              {validation.isValid ? (
                <CheckCircle2 className="w-5 h-5" style={{ color: validation.strength?.color }} />
              ) : (
                <AlertCircle className="w-5 h-5" style={{ color: validation.strength?.color || '#E14048' }} />
              )}
            </div>
          )}
          
          {/* Username field gets no validation icon until backend response */}
          {name === 'username' && hasError && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <AlertCircle className="w-5 h-5" style={{ color: '#E14048' }} />
            </div>
          )}
        </div>
        
        {/* Validation message */}
        {validation && name !== 'username' && name !== 'password' && (
          <div className={`flex items-center gap-2 text-sm ${
            validation.isValid ? 'text-green-600' : ''
          }`} style={!validation.isValid ? { color: '#E14048' } : {}}>
            {validation.isValid ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{validation.message}</span>
          </div>
        )}
        
        {/* Password strength display */}
        {name === 'password' && formData.password && (
          <div className="space-y-3">
            {/* Strength indicator */}
            <div className="flex items-center gap-2 text-sm">
              <span style={{ color: validation?.strength?.color || '#9ca3af' }} className="font-medium">
                {validation?.message || 'Password strength: Weak'}
              </span>
            </div>
            
            {/* Strength bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300" 
                style={{ 
                  backgroundColor: validation?.strength?.color || '#E14048',
                  width: `${((validation?.strength?.score || 0) / 6) * 100}%`
                }}
              />
            </div>
            
            {/* Requirements checklist */}
            <div className="grid grid-cols-1 gap-1 text-xs">
              {validation?.strength?.checks.map((check, index) => (
                <div key={check.id} className="flex items-center gap-2">
                  {check.test ? (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-gray-300"></div>
                  )}
                  <span className={check.test ? 'text-green-600' : 'text-gray-500'}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Username validation message only shows errors from backend */}
        {name === 'username' && hasError && (
          <div className="flex items-center gap-2 text-sm" style={{ color: '#E14048' }}>
            <AlertCircle className="w-4 h-4" />
            <span>{errors.username}</span>
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
                  Join the Community
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-3" style={{ color: '#0F1217' }}>
                  Create Your Account
                </h1>
                <p className="text-lg" style={{ color: '#0F1217', opacity: 0.7 }}>
                  Join thousands of sleuths protecting the digital world
                </p>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {renderFormField('name', 'Full Name', 'text', 'Enter your full name')}
                {renderFormField('username', 'Username', 'text', 'Choose a unique username')}
                {renderFormField('email', 'Email Address', 'email', 'Enter your email address')}
                {renderFormField('password', 'Password', 'password', 'Create a strong password')}

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
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Sign Up
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </div>

                {/* Terms */}
                <p className="text-xs text-center leading-relaxed" style={{ color: '#0F1217', opacity: 0.6 }}>
                  By creating an account, you agree to our{' '}
                  <Link href="/terms" className="font-medium hover:underline" style={{ color: '#E14048' }}>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="font-medium hover:underline" style={{ color: '#E14048' }}>
                    Privacy Policy
                  </Link>
                </p>

                {/* Login Link */}
                <div className="text-center pt-6 border-t" style={{ borderColor: '#A5918A', borderOpacity: 0.3 }}>
                  <p style={{ color: '#0F1217', opacity: 0.8 }}>
                    Already have an account?{' '}
                    <Link 
                      href="/login" 
                      className="font-semibold transition-colors hover:opacity-80"
                      style={{ color: '#E14048' }}
                    >
                      Sign in
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
              <div className="absolute top-1/4 left-1/4 w-32 h-32 border rounded-full" style={{ borderColor: '#FFFFFF', borderOpacity: 0.2 }}></div>
              <div className="absolute top-3/4 right-1/4 w-24 h-24 border rounded-full" style={{ borderColor: '#FFFFFF', borderOpacity: 0.2 }}></div>
              <div className="absolute top-1/2 left-1/2 w-16 h-16 border rounded-full transform -translate-x-1/2 -translate-y-1/2" style={{ borderColor: '#FFFFFF', borderOpacity: 0.2 }}></div>
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
                  The world needs more{' '}
                  <span style={{ color: '#E14048' }}>
                    Sleuths
                  </span>
                </h2>
                <p className="text-xl leading-relaxed max-w-sm" style={{ color: '#FFFFFF', opacity: 0.9 }}>
                  Join our community of digital detectives and help make the internet a safer place for everyone.
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-6 pt-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>50K+</div>
                    <div className="text-sm" style={{ color: '#FFFFFF', opacity: 0.7 }}>Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>1M+</div>
                    <div className="text-sm" style={{ color: '#FFFFFF', opacity: 0.7 }}>Scams Detected</div>
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