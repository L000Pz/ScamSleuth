"use client";

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { z } from 'zod';

// Define the Zod schema for form validation
const EditInfoSchema = z.object({
  email: z.string()
    .email({ message: 'Invalid email address' })
    .optional()
    .or(z.literal('')),
  lastPassword: z.string()
    .min(1, { message: 'Current password is required' }),
  newPassword: z.string()
    .min(6, { message: 'New password must be at least 6 characters long' })
    .optional()
    .or(z.literal(''))
}).refine((data) => {
  // If email is provided, new password must be provided
  if (data.email && !data.newPassword) {
    return false;
  }
  return true;
}, {
  message: "New password is required when changing email",
  path: ["newPassword"]
});

export default function AdminPage() {
  const [formData, setFormData] = useState({
    email: '',
    lastPassword: '',
    newPassword: ''
  });
  
  const [errors, setErrors] = useState({
    email: '',
    lastPassword: '',
    newPassword: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);

    try {
      // Validate form data
      const result = EditInfoSchema.safeParse(formData);

      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        setErrors({
          email: fieldErrors.email?.[0] || '',
          lastPassword: fieldErrors.lastPassword?.[0] || '',
          newPassword: fieldErrors.newPassword?.[0] || ''
        });
        setIsSubmitting(false);
        return;
      }

      // Clear validation errors
      setErrors({
        email: '',
        lastPassword: '',
        newPassword: ''
      });

      // Add your API call here
      // const response = await updateAdminInfo(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form on success
      setFormData({
        email: '',
        lastPassword: '',
        newPassword: ''
      });
      
    } catch (error) {
      console.error('Error updating info:', error);
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h2 className="text-[40px] font-bold mb-8">Edit Information</h2>
      
      <form className="space-y-6 max-w-4xl mx-auto" onSubmit={handleSubmit}>
        <div>
          <label className="block text-[20px] font-bold mb-2">New Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
            placeholder="Enter new email"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-[20px] font-bold mb-2">Last Password</label>
          <input
            type="password"
            name="lastPassword"
            value={formData.lastPassword}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
            placeholder="Enter current password"
            disabled={isSubmitting}
          />
          {errors.lastPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.lastPassword}</p>
          )}
        </div>

        <div>
          <label className="block text-[20px] font-bold mb-2">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
            placeholder="Enter new password"
            disabled={isSubmitting}
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
          )}
        </div>

        {apiError && (
          <p className="text-red-500 text-sm text-center">{apiError}</p>
        )}

        <div className="pt-4">
          <Button 
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full font-bold py-3"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </>
  );
}