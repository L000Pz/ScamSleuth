"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { signup } from './actions';

const SignupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  name: z.string().min(1, { message: 'Name is required' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters long' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', name: '', username: '', password: '' });
  const [errors, setErrors] = useState({ email: '', name: '', username: '', password: '' });
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const result = SignupSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email ? fieldErrors.email[0] : '',
        name: fieldErrors.name ? fieldErrors.name[0] : '',
        username: fieldErrors.username ? fieldErrors.username[0] : '',
        password: fieldErrors.password ? fieldErrors.password[0] : '',
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

      router.push('/otp');
    } catch (error) {
      console.error('Error signing up:', error);
      setApiError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 sm:p-6 lg:p-[76px] min-h-screen">
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex flex-col lg:flex-row w-full max-w-[1240px]">
        <div className="w-full lg:w-3/5 p-4 sm:p-6 lg:p-8">
          <h2 className="text-2xl sm:text-3xl lg:text-[40px] text-center font-bold mb-6">Sign up now!</h2>
          
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
                disabled={isLoading}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-base sm:text-lg lg:text-[20px] font-bold mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                required
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-base sm:text-lg lg:text-[20px] font-bold mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                required
                disabled={isLoading}
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
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
                disabled={isLoading}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}
            
            <div className="mt-6 sm:mt-8 lg:mt-[50px]">
              <Button 
                type="submit" 
                variant="outline" 
                className="block mx-auto w-full sm:w-[250px] h-[40px] py-2 text-base sm:text-lg lg:text-[20px] leading-none font-bold"
                disabled={isLoading}
              >
                {isLoading ? 'Signing up...' : 'Sign up'}
              </Button>
            </div>
          </form>

          <p className="text-center text-sm mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </div>

        <div className="hidden lg:flex w-2/5 bg-gradient-to-t from-black via-black/40 via-40% via-cardWhite to-red flex-col items-center justify-center p-8">
          <Image src={heroImage} alt="Detective Dog" width={278} height={319} className="mb-4" />
          <p className="text-[40px] font-bold text-white text-left">
            The world needs more <span style={{ color: "#E14048" }}>Sleuths</span>.
          </p>
          <p className="text-[40px] font-bold text-white text-left">Sign up and make a difference.</p>
        </div>
      </div>
    </div>
  );
}