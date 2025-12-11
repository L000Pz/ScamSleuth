// components/ImagePickerModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadFile, deleteFile } from '@/app/admin-dashboard/write-review/actions';

interface UploadedImage {
  id: number;
  name: string;
  url: string;
}

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  uploadedFiles: Array<{ id: number; name: string }>;
  onFileUploaded: (file: { id: number; name: string }) => void;
  onFileDeleted: (id: number) => void;
}

export default function ImagePickerModal({
  isOpen,
  onClose,
  onSelect,
  uploadedFiles,
  onFileUploaded,
  onFileDeleted
}: ImagePickerModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);

  // تبدیل media IDs به URLs
  useEffect(() => {
    const imageFiles = uploadedFiles
      .filter(file => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
      })
      .map(file => ({
        ...file,
        url: `${process.env.NEXT_PUBLIC_API_URL}/Media/mediaManager/Get/${file.id}`
      }));
    
    setImages(imageFiles);
  }, [uploadedFiles]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      // چک کردن نوع فایل
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        continue;
      }

      // چک کردن سایز (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should not exceed 5MB');
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);

        const { mediaId, error: uploadError } = await uploadFile(formData);

        if (uploadError) {
          setError(uploadError);
          continue;
        }

        if (mediaId !== null) {
          onFileUploaded({ id: mediaId, name: file.name });
        }
      } catch (err) {
        console.error('Upload error:', err);
        setError('Failed to upload image');
      }
    }

    setIsUploading(false);
  };

  const handleDelete = async (id: number) => {
    try {
      const { success, error } = await deleteFile(id);
      if (success) {
        onFileDeleted(id);
      } else {
        setError(error || 'Failed to delete image');
      }
    } catch (err) {
      setError('Failed to delete image');
    }
  };

  const handleImageSelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold">Select or Upload Image</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Upload Section */}
        <div className="p-6 border-b">
          <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
            <div className="text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                {isUploading ? 'Uploading...' : 'Click to upload images'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>

          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        {/* Images Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {images.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No images uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => handleImageSelect(image.url)}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image.id);
                      }}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Image name */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">
                    {image.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}