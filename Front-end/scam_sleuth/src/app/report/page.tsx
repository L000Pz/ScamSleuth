"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { fetchScamTypes, submitScamReport, type ScamType } from './actions';
import { z } from 'zod';

// Define the Zod schema for form validation
const ReportSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  scam_type_id: z.number().min(1, { message: 'Please select a scam type' }),
  scam_date: z.string().min(1, { message: 'Date is required' }),
  financial_loss: z.number().min(0, { message: 'Financial loss must be 0 or greater' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  media_id: z.number()
});

export default function ReportScamPage() {
  const router = useRouter();
  const [scamTypes, setScamTypes] = useState<ScamType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const [formData, setFormData] = useState({
    title: '',
    scam_type_id: 0,
    scam_date: '',
    financial_loss: 0,
    description: '',
    media_id: 0
  });

  useEffect(() => {
    const loadScamTypes = async () => {
      const { data, error } = await fetchScamTypes();
      if (data) {
        setScamTypes(data);
      } else if (error) {
        setError(error);
      }
    };

    loadScamTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data using Zod schema
    const result = ReportSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setFormErrors(
        Object.entries(fieldErrors).reduce((acc, [key, value]) => {
          acc[key] = value?.[0] || '';
          return acc;
        }, {} as {[key: string]: string})
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setFormErrors({});

    const { success, error } = await submitScamReport(formData);

    if (success) {
      router.push('/scams');
    } else {
      setError(error || 'Failed to submit report');
    }

    setIsLoading(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'financial_loss' || name === 'scam_type_id' 
        ? Number(value) 
        : value
    }));
  };

  return (
    <div className="flex items-center justify-center p-[76px]">
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex w-[1240px]">
        {/* Left Column - Form */}
        <div className="w-3/5 p-8">
          <h2 className="text-[40px] text-center font-bold mb-6">Report a Scam</h2>
          
          <form className="space-y-4 mx-[30px]" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[20px] font-bold mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                placeholder="Brief title describing the scam"
                required
              />
              {formErrors.title && <p className="text-red-500 text-sm">{formErrors.title}</p>}
            </div>

            <div>
              <label className="block text-[20px] font-bold mb-1">Scam Type</label>
              <select
                name="scam_type_id"
                value={formData.scam_type_id}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select a scam type</option>
                    {scamTypes.map((type) => (
                    <option key={type.scam_type_id} value={type.scam_type_id}>
                        {type.scam_type}
                </option>
                ))}
              </select>
              {formErrors.scam_type_id && <p className="text-red-500 text-sm">{formErrors.scam_type_id}</p>}
            </div>

            <div>
              <label className="block text-[20px] font-bold mb-1">Date of Incident</label>
              <input
                type="date"
                name="scam_date"
                value={formData.scam_date}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                required
              />
              {formErrors.scam_date && <p className="text-red-500 text-sm">{formErrors.scam_date}</p>}
            </div>

            <div>
              <label className="block text-[20px] font-bold mb-1">Financial Loss (USD)</label>
              <input
                type="number"
                name="financial_loss"
                min="0"
                step="0.01"
                value={formData.financial_loss}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                placeholder="0.00"
                required
              />
              {formErrors.financial_loss && <p className="text-red-500 text-sm">{formErrors.financial_loss}</p>}
            </div>

            <div>
              <label className="block text-[20px] font-bold mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                placeholder="Provide details about how the scam occurred..."
                rows={4}
                required
              />
              {formErrors.description && <p className="text-red-500 text-sm">{formErrors.description}</p>}
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="mt-[50px]">
              <Button 
                type="submit"
                variant="outline"
                disabled={isLoading}
                className="block mx-auto w-[250px] h-[40px] py-2 text-[20px] leading-none font-bold"
              >
                {isLoading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column - Image and Text */}
        <div className="w-2/5 bg-gradient-to-t from-black via-black/40 via-40% via-cardWhite to-red flex flex-col items-center justify-center p-8">
          <Image src={heroImage} alt="Detective Dog" width={278} height={319} className="mb-4" />
          <p className="text-[40px] font-bold text-white text-left">
            Report a <span style={{ color: "#E14048" }}>Scam</span>
          </p>
          <p className="text-[40px] font-bold text-white text-left">Help protect others.</p>
        </div>
      </div>
    </div>
  );
}