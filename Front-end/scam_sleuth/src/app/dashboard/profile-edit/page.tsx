"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

// Define the Zod schema for form validation
const ProfileSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters long' }),
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters long' }).optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function EditProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form data
    const result = ProfileSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0] || '',
        email: fieldErrors.email?.[0] || '',
        username: fieldErrors.username?.[0] || '',
        currentPassword: fieldErrors.currentPassword?.[0] || '',
        newPassword: fieldErrors.newPassword?.[0] || '',
        confirmPassword: fieldErrors.confirmPassword?.[0] || ''
      });
      setIsLoading(false);
      return;
    }

    // Clear errors if validation passes
    setErrors({
      name: '',
      email: '',
      username: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setApiError(null);

    try {
      // Add your update profile API call here
      // const response = await updateProfile(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect back to dashboard on success
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      setApiError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-[76px]">
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex w-[1240px] h-[610px]">
        {/* Left Column - Form */}
        <div className="w-3/5 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[40px] font-bold">Edit Profile</h2>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
          
          <form className="space-y-4 mx-[30px]" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[20px] font-bold mb-1">Username</label>
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
              <label className="block text-[20px] font-bold mb-1">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                required
                disabled={isLoading}
              />
              {errors.currentPassword && <p className="text-red-500 text-sm">{errors.currentPassword}</p>}
            </div>

            <div>
              <label className="block text-[20px] font-bold mb-1">New Password (Optional)</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
              {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword}</p>}
            </div>

            <div>
              <label className="block text-[20px] font-bold mb-1">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                disabled={isLoading || !formData.newPassword}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>

            {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}
            
            <div className="mt-6">
              <Button 
                type="submit" 
                variant="outline" 
                className="block mx-auto w-[250px] h-[40px] py-2 text-[20px] leading-none font-bold"
                disabled={isLoading}
              >
                {isLoading ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column - Image and Text */}
        <div className="w-2/5 bg-gradient-to-t from-black via-black/40 via-40% via-cardWhite to-red flex flex-col items-center justify-center p-8">
          <Image src={heroImage} alt="Detective Dog" width={278} height={319} className="mb-4" />
          <p className="text-[40px] font-bold text-white text-left">
            Keep your <span style={{ color: "#E14048" }}>profile</span>
          </p>
          <p className="text-[40px] font-bold text-white text-left">up to date!</p>
        </div>
      </div>
    </div>
  );
}