"use client"

import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { getScamTypes, submitReview, uploadFile, deleteFile } from './actions';
import LexicalEditor from '@/components/LexicalEditor';
import { getHtmlFromEditor } from '@/components/editor/lexicalHtmlConversion';

interface ScamType {
  scam_type_id: number;
  scam_type: string;
}

interface UploadedFile {
  id: number;
  name: string;
}

interface ReviewForm {
  title: string;
  scam_type_id: number;
  content: string;
  media: number[];
}

export default function WriteReviewPage() {
  const router = useRouter();
  const editorRef = useRef<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scamTypes, setScamTypes] = useState<ScamType[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  
  const [form, setForm] = useState<ReviewForm>({
    title: '',
    scam_type_id: 1,
    content: '',
    media: []
  });

  useEffect(() => {
    const fetchScamTypes = async () => {
      const result = await getScamTypes();
      
      if (result.success && result.data) {
        setScamTypes(result.data);
        if (result.data.length > 0) {
          setForm(prev => ({ ...prev, scam_type_id: result.data?.[0]?.scam_type_id ?? prev.scam_type_id }));
        }
      } else {
        setError(result.error || 'Failed to fetch scam types');
      }
    };

    fetchScamTypes();
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
        
        if (uploadError) {
          setFileUploadError(`Error uploading ${file.name}: ${uploadError}`);
          continue;
        }

        if (mediaId !== null) {
          const newFile = { id: mediaId, name: file.name };
          setUploadedFiles(prev => [...prev, newFile]);
          setForm(prev => ({
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
        setForm(prev => ({
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

  const handleSubmit = async (e?: React.FormEvent) => {
    // If the event exists, prevent default behavior
    if (e) {
      e.preventDefault();
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Get content from Lexical editor
      let content = '';
      if (editorRef.current) {
        content = await getHtmlFromEditor(editorRef.current);
      }
      
      if (!content) {
        setError('Content is required');
        setIsSubmitting(false);
        return;
      }

      if (!form.title.trim()) {
        setError('Title is required');
        setIsSubmitting(false);
        return;
      }

      const reviewData = {
        content,
        title: form.title.trim(),
        scam_type_id: form.scam_type_id,
        review_date: new Date().toISOString(),
        media: form.media
      };

      const result = await submitReview(reviewData);

      if (result.success) {
        router.push('/admin-dashboard/reviews');
      } else {
        setError(result.error || 'Failed to submit review');
      }
    } catch (error) {
      const err = error as Error;
      setError(err?.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditorChange = (editorState: any, editor: any) => {
    // Save a reference to the editor
    if (!editorRef.current) {
      editorRef.current = editor;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin-dashboard/reviews')}
            className="p-2"
            type="button"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-[40px] font-bold">Write a Review</h2>
        </div>
        <Button
          onClick={() => handleSubmit()}
          disabled={isSubmitting}
          className="rounded-full px-6 font-bold bg-black hover:bg-gray-800"
          type="button"
        >
          {isSubmitting ? (
            'Publishing...'
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Publish
            </>
          )}
        </Button>
      </div>

      {/* Removed form element and onSubmit to prevent default form submission */}
      <div className="space-y-6">
        <div className="bg-background rounded-xl p-6 shadow-md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter review title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Scam Type
              </label>
              <select
                value={form.scam_type_id}
                onChange={(e) => setForm(prev => ({ ...prev, scam_type_id: Number(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              >
                {scamTypes.map((type) => (
                  <option key={type.scam_type_id} value={type.scam_type_id}>
                    {type.scam_type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Attachments
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                    multiple
                  />
                  <Button 
                    type="button"
                    onClick={handleUploadFiles}
                    disabled={isUploading || selectedFiles.length === 0}
                    className="whitespace-nowrap"
                  >
                    {isUploading ? (
                      'Uploading...'
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Files
                      </>
                    )}
                  </Button>
                </div>

                {fileUploadError && (
                  <p className="text-red-500 text-sm">{fileUploadError}</p>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Uploaded Files:
                    </p>
                    <ul className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <li 
                          key={file.id}
                          className="flex items-center justify-between bg-white p-2 rounded-lg"
                        >
                          <span className="text-sm text-gray-600">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUploadedFile(file.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-xl p-6 shadow-md">
          <label className="block text-sm font-medium text-gray-500 mb-4">
            Content
          </label>
          
          {/* Lexical Editor */}
          <LexicalEditor
            height={500}
            placeholder="Start writing your review here..."
            onChange={handleEditorChange}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
          {error}
        </div>
      )}
    </div>
  );
}