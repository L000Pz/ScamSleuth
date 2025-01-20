"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { login } from './actions';

// Define the Zod schema for form validation
const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

interface AdminData {
  admin_id: number;
  username: string;
  email: string;
  name: string;
  contact_info: string;
  password: string;
}

interface UserData {
  user_id: number;
  username: string;
  email: string;
  name: string;
  password: string;
  is_verified: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form data using Zod schema
    const result = LoginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email ? fieldErrors.email[0] : '',
        password: fieldErrors.password ? fieldErrors.password[0] : '',
      });
      return;
    }

    // Clear errors if validation passes
    setErrors({ email: '', password: '' });
    setApiError(null);

    try {
      const response = await login(formData);
      
      if (!response.success) {
        setApiError(response.message);
        return;
      }

      // Check if response contains admin data
      if ('admin' in response.data) {
        // Admin login successful
        router.refresh();
        router.push('/admin-dashboard');
      } else {
        // Regular user login
        if (!response.data.users.is_verified) {
          router.push('/otp');
          return;
        }
        router.refresh();
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setApiError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center p-4 sm:p-6 lg:p-[76px] min-h-screen">
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex flex-col lg:flex-row w-full max-w-[1240px]">
        {/* Left Column - Form */}
        <div className="w-full lg:w-3/5 p-4 sm:p-6 lg:p-8">
          <h2 className="text-2xl sm:text-3xl lg:text-[40px] text-center font-bold mb-6">Log In</h2>
          
          <form className="space-y-4 mx-2 sm:mx-4 lg:mx-[30px]" onSubmit={handleSubmit}>
            <div>
              <label className="block text-base sm:text-lg lg:text-[20px] font-bold mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                required
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-base sm:text-lg lg:text-[20px] font-bold mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                required
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}
            
            <div className="mt-6 sm:mt-8 lg:mt-[50px]">
              <Button 
                type="submit" 
                variant="outline" 
                className="block mx-auto w-full sm:w-[250px] h-[40px] py-2 text-base sm:text-lg lg:text-[20px] leading-none font-bold"
              >
                Log In
              </Button>
            </div>
          </form>

          <p className="text-center text-sm mt-4">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Right Column - Image and Text - Hidden on mobile */}
        <div className="hidden lg:flex w-2/5 bg-gradient-to-t from-black via-black/40 via-40% via-cardWhite to-red flex-col items-center justify-center p-8">
          <Image 
            src={heroImage} 
            alt="Detective Dog" 
            width={278} 
            height={319} 
            className="mb-4"
          />
          <p className="text-[40px] font-bold text-white text-left">
            Welcome back, <span style={{ color: "#E14048" }}>Sleuth</span>.
          </p>
          <p className="text-[40px] font-bold text-white text-left">Continue your journey.</p>
        </div>
      </div>
    </div>
  );
}