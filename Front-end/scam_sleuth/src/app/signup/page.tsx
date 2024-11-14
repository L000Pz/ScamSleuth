// src/app/signup/page.tsx
"use client"
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

// Define the Zod schema
const SignupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  name: z.string().min(1, { message: 'Name is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', name: '', password: '' });
  const [errors, setErrors] = useState({ email: '', name: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form data
    const result = SignupSchema.safeParse(formData);
    
    if (!result.success) {
      // Collect and display errors
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email ? fieldErrors.email[0] : '',
        name: fieldErrors.name ? fieldErrors.name[0] : '',
        password: fieldErrors.password ? fieldErrors.password[0] : '',
      });
      return;
    }

    // Clear errors if valid
    setErrors({ email: '', name: '', password: '' });

    // Redirect to OTP page
    router.push('/otp');
  };

  return (
    <div className="flex items-center justify-center p-[76px]">
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex w-[1240px] h-[610px]">
        
        {/* Left Column - Form */}
        <div className="w-3/5 p-8">
          <h2 className="text-[40px] text-center font-bold mb-6">Sign up now!</h2>
          
          <form className="space-y-4 mx-[30px]" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[20px] font-bold mb-1">Email</label>
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
              <label className="block text-[20px] font-bold mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                required
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-[20px] font-bold mb-1">Password</label>
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

            <div className="mt-[50px]">
              <Button type="submit" variant="outline" className="block mx-auto w-[250px] h-[40px] py-2 text-[20px] leading-none font-bold">
                Sign up
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

        {/* Right Column - Image and Text */}
        <div className="w-2/5 bg-gradient-to-t from-black via-black/40 via-40% via-cardWhite to-red flex flex-col items-center justify-center p-8">
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
