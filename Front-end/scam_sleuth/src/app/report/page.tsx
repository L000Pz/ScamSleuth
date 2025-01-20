"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { fetchScamTypes, submitScamReport, uploadFile, deleteFile, type ScamType } from './actions';
import { z } from 'zod';

const ReportSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  scam_type_id: z.number().min(1, { message: 'Please select a scam type' }),
  scam_date: z.string().min(1, { message: 'Date is required' }),
  financial_loss: z.number().min(0, { message: 'Financial loss must be 0 or greater' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  media: z.array(z.number())
});

export default function ReportScamPage() {
  const router = useRouter();
  const [scamTypes, setScamTypes] = useState<ScamType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  interface UploadedFile {
    id: number;
    name: string;
  }
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    scam_type_id: 0,
    scam_date: '',
    financial_loss: 0,
    description: '',
    media: [] as number[]
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      const validFiles = files.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          setFileUploadError('File size should not exceed 5MB');
          return false;
        }
        
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          setFileUploadError('Only images (JPEG, PNG, GIF), PDF, and Word documents are allowed');
          return false;
        }

        return true;
      });

      setSelectedFiles(validFiles);
      if (validFiles.length > 0) {
        setFileUploadError(null);
      }
    }
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) {
      setFileUploadError('Please select files to upload first');
      return;
    }

    setIsUploading(true);
    setFileUploadError(null);
    
    for (const file of selectedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const { mediaId, error: uploadError } = await uploadFile(formData);
        console.log('Upload response:', { mediaId, error: uploadError });
        
        if (uploadError) {
          setFileUploadError(`Error uploading ${file.name}: ${uploadError}`);
          continue;
        }

        if (mediaId !== null && mediaId !== undefined) {
          const newFile = { id: mediaId, name: file.name };
          console.log('Adding new file:', newFile);
          setUploadedFiles(prev => [...prev, newFile]);
          setFormData(prev => ({
            ...prev,
            media: [...prev.media, mediaId]
          }));
        } else {
          setFileUploadError(`Failed to get media ID for ${file.name}`);
        }
      } catch (err) {
        console.error('Upload error:', err);
        setFileUploadError(`Failed to upload ${file.name}`);
      }
    }
    
    setIsUploading(false);
    setSelectedFiles([]);
  };

  const removeUploadedFile = async (id: number) => {
    try {
      const { success, error } = await deleteFile(id);
      
      if (success) {
        setUploadedFiles(prev => prev.filter(file => file.id !== id));
        setFormData(prev => ({
          ...prev,
          media: prev.media.filter(mediaId => mediaId !== id)
        }));
      } else {
        setError(error || 'Failed to remove file');
      }
    } catch (err) {
      console.error('Error removing file:', err);
      setError('Failed to remove file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFormErrors({});

    try {
      const updatedFormData = {
        ...formData,
        scam_date: new Date(formData.scam_date).toISOString(),
      };

      const validationResult = ReportSchema.safeParse(updatedFormData);

      if (!validationResult.success) {
        const fieldErrors = validationResult.error.flatten().fieldErrors;
        setFormErrors(
          Object.entries(fieldErrors).reduce((acc, [key, value]) => {
            acc[key] = value?.[0] || '';
            return acc;
          }, {} as {[key: string]: string})
        );
        setIsLoading(false);
        return;
      }

      const { success, error: submitError } = await submitScamReport(updatedFormData);

      if (success) {
        router.push('/scams');
      } else {
        setError(submitError || 'Failed to submit report');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('An unexpected error occurred. Please try again.');
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
    <div className="min-h-screen w-full p-4 md:p-8 lg:p-12">
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden max-w-6xl mx-auto flex flex-col lg:flex-row">
        <div className="w-full lg:w-3/5 p-4 md:p-6 lg:p-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl text-center font-bold mb-6">Report a Scam</h2>
          
          <form className="space-y-4 max-w-xl mx-auto" onSubmit={handleSubmit}>
            <div>
              <label className="block text-lg md:text-xl font-bold mb-1">Title</label>
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
              <label className="block text-lg md:text-xl font-bold mb-1">Scam Type</label>
              <select
                name="scam_type_id"
                value={formData.scam_type_id}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                required
              >
                <option key="default" value="">Select a scam type</option>
                {scamTypes.map((type) => (
                  <option key={type.scam_type_id} value={type.scam_type_id}>
                    {type.scam_type}
                  </option>
                ))}
              </select>
              {formErrors.scam_type_id && <p className="text-red-500 text-sm">{formErrors.scam_type_id}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg md:text-xl font-bold mb-1">Date of Incident</label>
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
                <label className="block text-lg md:text-xl font-bold mb-1">Financial Loss (USD)</label>
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
            </div>

            <div>
              <label className="block text-lg md:text-xl font-bold mb-1">Description</label>
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

            <div>
              <label className="block text-lg md:text-xl font-bold mb-1">Upload Evidence (Optional)</label>
              <div className="space-y-2">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                  multiple
                />
                
                <Button 
                  type="button"
                  onClick={handleUploadFiles}
                  disabled={isUploading || selectedFiles.length === 0}
                  className="w-full"
                >
                  {isUploading ? 'Uploading...' : 'Upload Selected Files'}
                </Button>

                {fileUploadError && <p className="text-red-500 text-sm mt-1">{fileUploadError}</p>}
                
                {uploadedFiles.length > 0 && (
                  <div key="uploaded-files-section" className="mt-2">
                    <p className="font-medium">Uploaded Files:</p>
                    <ul key="uploaded-files-list" className="space-y-1">
                      {uploadedFiles.map((file) => (
                        <li key={`file-${file.id}`} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeUploadedFile(file.id)}
                            className="text-red-500 text-sm hover:text-red-700"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="mt-8">
              <Button 
                type="submit"
                variant="outline"
                disabled={isLoading}
                className="block mx-auto w-full md:w-64 h-10 text-lg font-bold"
              >
                {isLoading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        </div>

        <div className="hidden lg:flex w-full lg:w-2/5 bg-gradient-to-t from-black via-black/40 via-40% to-red p-8 flex-col items-center justify-center">
          <div className="relative w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72">
            <Image
              src={heroImage}
              alt="Detective Dog"
              layout="responsive"
              className="object-contain"
            />
          </div>
          <div className="text-center mt-4">
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
              Report a <span className="text-red-500">Scam</span>
            </p>
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
              Help protect others.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}