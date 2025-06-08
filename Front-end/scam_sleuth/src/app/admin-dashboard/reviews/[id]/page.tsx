/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef, JSX } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  ArrowLeft, 
  Trash2, 
  Save, 
  Edit, 
  User, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Loader2,
  ImageIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getPublicReview, deleteReview, updateReview } from './actions';
import LexicalEditor from '@/components/LexicalEditor';
import { getHtmlFromEditor } from '@/components/editor/lexicalHtmlConversion';

interface MediaItem {
  media_id: number;
}

interface ReviewData {
  id: string;
  title: string;
  date: string;
  content: string;
  media: MediaItem[];
}

interface ReviewParams {
  params: Promise<{
    id: string;
  }>;
}

type SaveStatus = 'idle' | 'success' | 'error';

export default function ReviewPage({ params }: ReviewParams): JSX.Element {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const [review, setReview] = useState<ReviewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const fetchReview = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getPublicReview(resolvedParams.id);
        
        if (result.success && result.data) {
          setReview(result.data);
          setEditedTitle(result.data.title);
        } else {
          setError(result.error || 'Failed to fetch review');
        }
      } catch (error) {
        setError('Failed to load review');
        console.error('Error fetching review:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReview();
  }, [resolvedParams.id]);

  const handleDelete = async (): Promise<void> => {
    try {
      setIsDeleting(true);
      const result = await deleteReview(resolvedParams.id);
      
      if (result.success) {
        router.push('/admin-dashboard/reviews');
        router.refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      setError('Failed to delete review');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEditorChange = (editorState: any, editor: any): void => {
    if (!editorRef.current) {
      editorRef.current = editor;
    }
  };

  const toggleEdit = (): void => {
    setIsEditing(!isEditing);
    setSaveStatus('idle');
  };

  const handleSave = async (): Promise<void> => {
    if (!review) return;
    
    try {
      setIsSaving(true);
      setSaveStatus('idle');
      
      let content = '';
      if (editorRef.current) {
        content = await getHtmlFromEditor(editorRef.current);
      }

      if (!content) {
        setError('Content cannot be empty');
        setSaveStatus('error');
        return;
      }

      if (!editedTitle.trim()) {
        setError('Title cannot be empty');
        setSaveStatus('error');
        return;
      }

      const result = await updateReview({
        id: resolvedParams.id,
        title: editedTitle.trim(),
        content
      });

      if (result.success) {
        setReview({
          ...review,
          title: editedTitle.trim(),
          content
        });
        setIsEditing(false);
        setSaveStatus('success');
        setError(null);
        
        // Auto-hide success status after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error saving review:', error);
      setError('Failed to save review');
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleImageError = (mediaId: number): void => {
    setImageErrors(prev => new Set(prev).add(mediaId));
  };

  const LoadingSpinner = (): JSX.Element => (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-600 font-medium">Loading review...</p>
      </div>
    </div>
  );

  const ErrorState = (): JSX.Element => (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Review</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  const ImagePlaceholder = ({ index }: { index: number }): JSX.Element => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500">
      <ImageIcon className="w-12 h-12 mb-2" />
      <p className="text-sm font-medium">Image unavailable</p>
      <p className="text-xs">Evidence {index + 1}</p>
    </div>
  );

  const DeleteConfirmModal = (): JSX.Element | null => {
    if (!showDeleteConfirm) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Review</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this review? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 bg-red hover:bg-red/10 text-white border-0 disabled:opacity-50 disabled:bg-gray-400"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <LoadingSpinner />;
  if (error && !review) return <ErrorState />;
  if (!review) return <ErrorState />;

  return (
    <>
      <style jsx global>{`
        .content-display p {
          margin-bottom: 1rem;
        }
        .content-display ul, .content-display ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        .content-display li {
          margin-bottom: 0.5rem;
        }
        .content-display h1, .content-display h2, .content-display h3, 
        .content-display h4, .content-display h5, .content-display h6 {
          margin: 1.5rem 0 1rem 0;
          font-weight: 600;
        }
        .content-display h1 { font-size: 2rem; }
        .content-display h2 { font-size: 1.5rem; }
        .content-display h3 { font-size: 1.25rem; }
        .content-display blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
        }
        .content-display strong {
          font-weight: 600;
        }
        .content-display em {
          font-style: italic;
        }
        .content-display [dir="rtl"] {
          direction: rtl;
          text-align: right;
        }
      `}</style>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-fit" 
              onClick={() => router.push('/admin-dashboard/reviews')}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Reviews</span>
            </Button>

            <div className="flex items-center gap-3">
              {/* Save Status Indicator */}
              {saveStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Saved successfully</span>
                </div>
              )}

              {isEditing ? (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={toggleEdit}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={toggleEdit}
                    className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-8">
              <div className="flex items-center gap-3 text-gray-600 mb-4">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">{formatDate(review.date)}</span>
                <span className="text-gray-400">•</span>
                <Clock className="w-4 h-4" />
                <span className="text-sm">Last updated {formatDate(review.date)}</span>
              </div>
              
              {isEditing ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full text-3xl md:text-4xl font-bold p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="Enter review title..."
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  {review.title}
                </h1>
              )}
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="min-h-[400px]">
                {isEditing ? (
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <LexicalEditor
                      initialContent={review.content}
                      onChange={handleEditorChange}
                      height="500px"
                    />
                  </div>
                ) : (
                  <div className="max-w-none">
                    {/* Debug info - remove this in production */}
                    {process.env.NODE_ENV === 'development' && (
                      <details className="mb-4 p-2 bg-gray-100 rounded text-xs">
                        <summary>Debug Content (click to expand)</summary>
                        <div className="mt-2">
                          <p><strong>Content length:</strong> {review.content?.length || 0}</p>
                          <p><strong>Content type:</strong> {typeof review.content}</p>
                          <pre className="mt-2 whitespace-pre-wrap bg-white p-2 rounded max-h-40 overflow-auto">
                            {review.content || 'No content'}
                          </pre>
                        </div>
                      </details>
                    )}
                    
                    {review.content && review.content.trim() ? (
                      <div 
                        className="content-display"
                        style={{
                          fontSize: '16px',
                          lineHeight: '1.7',
                          color: '#374151'
                        }}
                        dangerouslySetInnerHTML={{ __html: review.content }} 
                      />
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-4xl mb-4">📝</div>
                        <p className="text-lg font-medium">No content available</p>
                        <p className="text-sm">This review doesn&apos;t have any content yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Media Section */}
              {review.media && review.media.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Evidence & Attachments
                    <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {review.media.length} {review.media.length === 1 ? 'item' : 'items'}
                    </span>
                  </h2>
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    {review.media.map((media, index) => (
                      <div 
                        key={media.media_id} 
                        className="group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="aspect-video relative overflow-hidden">
                          {imageErrors.has(media.media_id) ? (
                            <ImagePlaceholder index={index} />
                          ) : (
                            <Image
                              src={`http://localhost:8080/Media/mediaManager/Get?id=${media.media_id}`}
                              alt={`Evidence ${index + 1}`}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              onError={() => handleImageError(media.media_id)}
                              unoptimized // Since this is an external API that may not support optimization
                            />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                        </div>
                        <div className="p-4">
                          <p className="text-sm font-medium text-gray-700">
                            Evidence {index + 1}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Media ID: {media.media_id}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmModal />
    </>
  );
}