"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { fetchScamTypes, submitScamReport, uploadFile, deleteFile, type ScamType } from './actions';
import { z } from 'zod';
import { Upload, X, File, AlertCircle, CheckCircle2, DollarSign, ArrowRight, ArrowLeft } from 'lucide-react';

const ReportSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  scam_type_id: z.number().min(1, { message: 'Please select a scam type' }),
  scam_date: z.string().min(1, { message: 'Date is required' }),
  financial_loss: z.number().min(0, { message: 'Financial loss must be 0 or greater' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  media: z.array(z.number())
});

interface UploadedFile {
  id: number;
  name: string;
}

interface FormData {
  title: string;
  scam_type_id: number;
  scam_date: string;
  financial_loss: number;
  description: string;
  media: number[];
}

export default function ReportScamPage() {
  const router = useRouter();
  const [scamTypes, setScamTypes] = useState<ScamType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [hasFinancialFocus, setHasFinancialFocus] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDragOver, setIsDragOver] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    scam_type_id: 0,
    scam_date: '',
    financial_loss: 0,
    description: '',
    media: []
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

    // Prevent default drag behaviors on the entire document
    const preventDefault = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDocumentDrop = (e: DragEvent) => {
      e.preventDefault();
      // Only allow drops in our designated drop zone
    };

    document.addEventListener('dragenter', preventDefault);
    document.addEventListener('dragover', preventDefault);
    document.addEventListener('drop', handleDocumentDrop);

    loadScamTypes();

    // Cleanup event listeners
    return () => {
      document.removeEventListener('dragenter', preventDefault);
      document.removeEventListener('dragover', preventDefault);
      document.removeEventListener('drop', handleDocumentDrop);
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndProcessFiles(e.target.files);
      // Clear the input so the same file can be selected again
      e.target.value = '';
    }
  };

  const handleUploadFiles = async (files: File[] = selectedFiles) => {
    if (files.length === 0) {
      setFileUploadError('Please select files to upload first');
      return;
    }

    setIsUploading(true);
    setFileUploadError(null);
    
    for (const file of files) {
      try {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        
        const { mediaId, error: uploadError } = await uploadFile(formDataUpload);
        
        if (uploadError) {
          setFileUploadError(`Error uploading ${file.name}: ${uploadError}`);
          continue;
        }

        if (mediaId !== null && mediaId !== undefined) {
          const newFile = { id: mediaId, name: file.name };
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
          }, {} as Record<string, string>)
        );
        setIsLoading(false);
        return;
      }

      const { success, error: submitError } = await submitScamReport(updatedFormData);

      if (success) {
        router.push('/dashboard/activities');
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
    
    if (name === 'financial_loss') {
      // Remove commas and convert to number for storage
      const numericValue = value.replace(/,/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: Number(numericValue) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'scam_type_id' ? Number(value) : value
      }));
    }
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-US');
  };

  const handleFinancialFocus = () => {
    if (formData.financial_loss === 0) {
      setHasFinancialFocus(true);
    }
  };

  const handleFinancialBlur = () => {
    setHasFinancialFocus(false);
    // If the field is empty when user leaves, reset to 0
    if (!formData.financial_loss) {
      setFormData(prev => ({ ...prev, financial_loss: 0 }));
    }
  };

  const validateAndProcessFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    const validFiles = fileArray.filter(file => {
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

    if (validFiles.length > 0) {
      setFileUploadError(null);
      setSelectedFiles(validFiles);
      // Automatically upload files
      handleUploadFiles(validFiles);
    }

    return validFiles;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndProcessFiles(files);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.scam_type_id > 0;
      case 2:
        return formData.scam_date && formData.description.length >= 10;
      case 3:
        return true; // Optional step
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Basic Information</h3>
              <p className="text-gray-600">Let&apos;s start with the basics about the scam</p>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3">
                Report Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-all text-lg"
                placeholder="Brief, descriptive title of the scam"
                required
              />
              {formErrors.title && (
                <div className="flex items-center gap-2 mt-2">
                  <AlertCircle className="w-4 h-4 text-red" />
                  <p className="text-red text-sm">{formErrors.title}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3">
                Scam Type *
              </label>
              <select
                name="scam_type_id"
                value={formData.scam_type_id}
                onChange={handleInputChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-all bg-white text-lg"
                required
              >
                <option value="">Choose the type of scam</option>
                {scamTypes.map((type) => (
                  <option key={type.scam_type_id} value={type.scam_type_id}>
                    {type.scam_type}
                  </option>
                ))}
              </select>
              {formErrors.scam_type_id && (
                <div className="flex items-center gap-2 mt-2">
                  <AlertCircle className="w-4 h-4 text-red" />
                  <p className="text-red text-sm">{formErrors.scam_type_id}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Incident Details</h3>
              <p className="text-gray-600">Tell us when it happened and what occurred</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-3">
                  Date of Incident *
                </label>
                <input
                  type="date"
                  name="scam_date"
                  value={formData.scam_date}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-all text-lg"
                  required
                />
                {formErrors.scam_date && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertCircle className="w-4 h-4 text-red" />
                    <p className="text-red text-sm">{formErrors.scam_date}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-3">
                  Financial Loss (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="financial_loss"
                    value={hasFinancialFocus && formData.financial_loss === 0 ? '' : formatCurrency(formData.financial_loss)}
                    onChange={handleInputChange}
                    onFocus={handleFinancialFocus}
                    onBlur={handleFinancialBlur}
                    className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-all text-lg"
                    placeholder="0"
                  />
                </div>
                {formErrors.financial_loss && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertCircle className="w-4 h-4 text-red" />
                    <p className="text-red text-sm">{formErrors.financial_loss}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3">
                Tell us what happened *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-all resize-none text-lg"
                placeholder="Provide detailed information about the scam, including how it happened, what methods were used, and any other relevant details..."
                rows={8}
                required
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm text-gray-500">
                  {formData.description.length < 10 ? 
                    `${10 - formData.description.length} more characters needed` : 
                    `${formData.description.length} characters`
                  }
                </div>
                {formData.description.length >= 10 && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
              </div>
              {formErrors.description && (
                <div className="flex items-center gap-2 mt-2">
                  <AlertCircle className="w-4 h-4 text-red" />
                  <p className="text-red text-sm">{formErrors.description}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Evidence (Optional)</h3>
              <p className="text-gray-600">Upload any supporting documents or images</p>
            </div>

            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all relative ${
                isDragOver 
                  ? 'border-red bg-red/5 scale-105' 
                  : 'border-gray-300 hover:border-red/50'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {isUploading && (
                <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-red/30 border-t-red rounded-full animate-spin"></div>
                    <span className="text-red font-medium">Uploading files...</span>
                  </div>
                </div>
              )}
              
              <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                isDragOver ? 'text-red' : 'text-gray-400'
              }`} />
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                multiple
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer transition-colors ${
                  isUploading ? 'text-gray-400' : isDragOver ? 'text-red' : 'text-gray-600 hover:text-red'
                }`}
              >
                <span className="font-medium text-lg">
                  {isDragOver 
                    ? 'Drop files here!' 
                    : isUploading 
                    ? 'Uploading...' 
                    : 'Click to upload files'
                  }
                </span>
                {!isDragOver && !isUploading && ' or drag and drop'}
                <br />
                <span className="text-gray-400 mt-2 block">
                  Images, PDFs, Word documents (max 5MB each)
                </span>
              </label>
            </div>

            {fileUploadError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red" />
                <p className="text-red text-sm">{fileUploadError}</p>
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Uploaded Files:</h4>
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700 flex-1">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeUploadedFile(file.id)}
                      className="p-1 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-red" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-black via-black to-red text-white py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-3 h-3 bg-red rounded-full animate-pulse"></div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Report a Scam</h1>
          </div>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl">
            Help protect others by sharing your experience. Your report helps build a safer community.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="bg-cardWhite rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Form Section */}
            <div className="w-full lg:w-3/5 p-6 md:p-8 lg:p-12">
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">Step {currentStep} of 3</span>
                  <span className="text-sm text-gray-500">{Math.round((currentStep / 3) * 100)}% Complete</span>
                </div>
                <div className="relative mb-4">
                  <div className="flex justify-between items-center">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                            step <= currentStep
                              ? 'bg-red text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {step < currentStep ? <CheckCircle2 className="w-4 h-4" /> : step}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Connecting line */}
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-0">
                    <div 
                      className="h-full bg-red transition-all duration-300"
                      style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span className={`${currentStep >= 1 ? 'text-red font-medium' : ''}`}>Basic Info</span>
                  <span className={`${currentStep >= 2 ? 'text-red font-medium' : ''}`}>Details</span>
                  <span className={`${currentStep >= 3 ? 'text-red font-medium' : ''}`}>Evidence</span>
                </div>
              </div>

              {/* Step Content */}
              <div className="min-h-[400px]">
                {renderStep()}
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                  <AlertCircle className="w-5 h-5 text-red" />
                  <p className="text-red font-medium">{error}</p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 h-12 px-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceedToNextStep()}
                    className="flex items-center gap-2 bg-red hover:bg-red/90 text-white h-12 px-6"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-red to-red/90 hover:from-red/90 hover:to-red text-white h-12 px-8"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Report'
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Hero Section */}
            <div className="hidden lg:flex w-2/5 bg-gradient-to-b from-black via-red/20 to-red relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-red/80"></div>
              <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
                <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
                  <Image
                    src={heroImage}
                    alt="Detective Dog"
                    width={280}
                    height={320}
                    className="drop-shadow-2xl"
                  />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold text-white leading-tight">
                    Help <span className="text-red">Protect</span> Others
                  </h2>
                  <p className="text-xl text-white/90 leading-relaxed">
                    Your report helps create a safer digital world for everyone.
                  </p>
                  
                  {/* Step-specific content */}
                  <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    {currentStep === 1 && (
                      <>
                        <h3 className="text-lg font-semibold text-white mb-3">Getting Started</h3>
                        <p className="text-white/80 text-sm">
                          Start by giving your report a clear title and selecting the type of scam you encountered.
                        </p>
                      </>
                    )}
                    {currentStep === 2 && (
                      <>
                        <h3 className="text-lg font-semibold text-white mb-3">Share Details</h3>
                        <p className="text-white/80 text-sm">
                          Tell us when it happened and describe the incident. The more details you provide, the better we can help others.
                        </p>
                      </>
                    )}
                    {currentStep === 3 && (
                      <>
                        <h3 className="text-lg font-semibold text-white mb-3">Add Evidence</h3>
                        <p className="text-white/80 text-sm">
                          Upload any screenshots, emails, or documents that support your report. This step is optional but helpful.
                        </p>
                      </>
                    )}
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