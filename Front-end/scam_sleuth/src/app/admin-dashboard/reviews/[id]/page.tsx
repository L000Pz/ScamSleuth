// app/admin-dashboard/reviews/[id]/page.tsx
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
import dynamic from 'next/dynamic';

// Dynamic import برای TinyMCE
const TinyMCEEditor = dynamic(() => import('@/components/TinyMCEEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Loading editor...</p>
    </div>
  )
});

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
  const [editedContent, setEditedContent] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const fetchReview = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getPublicReview(resolvedParams.id);
        
        if (result.success && result.data) {
          setReview(result.data);
          setEditedTitle(result.data.title);
          setEditedContent(result.data.content);
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

  const toggleEdit = (): void => {
    setIsEditing(!isEditing);
    setSaveStatus('idle');
  };

  const handleSave = async (): Promise<void> => {
    if (!review) return;
    
    try {
      setIsSaving(true);
      setSaveStatus('idle');

      if (!editedContent.trim()) {
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
        content: editedContent
      });

      if (result.success) {
        setReview({
          ...review,
          title: editedTitle.trim(),
          content: editedContent
        });
        setIsEditing(false);
        setSaveStatus('success');
        setError(null);
        
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

  if (isLoading || !mounted) return <LoadingSpinner />;
  if (error && !review) return <ErrorState />;
  if (!review) return <ErrorState />;

  return (
    <>
      <style jsx global>{`
        /* Reset Tailwind's aggressive list resets */
        .content-display ul,
        .content-display ol {
          list-style: revert !important;
          margin: revert !important;
          padding: revert !important;
        }

        .content-display li {
          display: list-item !important;
        }

        /* Base content styles */
        .content-display {
          font-size: 16px;
          line-height: 1.7;
          color: #374151;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        /* Paragraphs */
        .content-display p {
          margin-bottom: 1rem;
          line-height: 1.7;
        }

        .content-display p:last-child {
          margin-bottom: 0;
        }

        /* Headings */
        .content-display h1,
        .content-display h2,
        .content-display h3,
        .content-display h4,
        .content-display h5,
        .content-display h6 {
          margin: 1.5rem 0 1rem 0;
          font-weight: 600;
          line-height: 1.3;
        }

        .content-display h1 { font-size: 2rem; font-weight: 700; }
        .content-display h2 { font-size: 1.5rem; font-weight: 700; }
        .content-display h3 { font-size: 1.25rem; font-weight: 600; }
        .content-display h4 { font-size: 1.125rem; font-weight: 600; }
        .content-display h5 { font-size: 1rem; font-weight: 600; }
        .content-display h6 { font-size: 0.875rem; font-weight: 600; }

        /* Lists */
        .content-display ul {
          list-style-type: disc !important;
          margin: 1rem 0 !important;
          padding-left: 2.5rem !important;
        }

        .content-display ol {
          list-style-type: decimal !important;
          margin: 1rem 0 !important;
          padding-left: 2.5rem !important;
        }

        .content-display li {
          margin-bottom: 0.5rem !important;
          line-height: 1.6;
        }

        .content-display li:last-child {
          margin-bottom: 0 !important;
        }

        /* Nested lists */
        .content-display ul ul {
          list-style-type: circle !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
        }

        .content-display ul ul ul {
          list-style-type: square !important;
        }

        .content-display ol ol {
          list-style-type: lower-alpha !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
        }

        .content-display ol ol ol {
          list-style-type: lower-roman !important;
        }

        /* RTL support for lists */
        .content-display [dir="rtl"] ul,
        .content-display [dir="rtl"] ol {
          padding-right: 2.5rem !important;
          padding-left: 0 !important;
        }

        /* Text formatting */
        .content-display strong {
          font-weight: 700 !important;
        }

        .content-display em {
          font-style: italic !important;
        }

        .content-display u {
          text-decoration: underline !important;
        }

        .content-display s {
          text-decoration: line-through !important;
        }

        /* Blockquotes */
        .content-display blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }

        .content-display [dir="rtl"] blockquote {
          border-left: none;
          border-right: 4px solid #e5e7eb;
          padding-left: 0;
          padding-right: 1rem;
        }

        /* Code */
        .content-display code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.9em;
          color: #ef4444;
        }

        .content-display pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .content-display pre code {
          background: transparent;
          padding: 0;
          color: inherit;
          font-size: 0.875rem;
        }

        /* Tables */
        .content-display table {
          border-collapse: collapse !important;
          width: 100% !important;
          margin: 1rem 0 !important;
          border: 1px solid #e5e7eb !important;
        }

        .content-display table td,
        .content-display table th {
          border: 1px solid #e5e7eb !important;
          padding: 0.75rem !important;
          text-align: left;
        }

        .content-display table th {
          background: #f3f4f6 !important;
          font-weight: 600 !important;
        }

        .content-display [dir="rtl"] table td,
        .content-display [dir="rtl"] table th {
          text-align: right;
        }

        /* Images */
        .content-display img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
          display: block;
        }

        /* Links */
        .content-display a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .content-display a:hover {
          color: #2563eb;
        }

        /* Horizontal rules */
        .content-display hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2rem 0;
        }

        /* RTL direction support */
        .content-display [dir="rtl"] {
          direction: rtl !important;
          text-align: right !important;
        }

        .content-display [dir="ltr"] {
          direction: ltr !important;
          text-align: left !important;
        }

        /* Subscript and Superscript */
        .content-display sub {
          vertical-align: sub;
          font-size: 0.75em;
        }

        .content-display sup {
          vertical-align: super;
          font-size: 0.75em;
        }
      `}</style>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
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

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
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

            <div className="p-8">
              <div className="min-h-[400px]">
                {isEditing ? (
                  <TinyMCEEditor
                    value={editedContent}
                    onChange={setEditedContent}
                    height={500}
                    placeholder="Start editing your review..."
                  />
                ) : (
                  <div className="max-w-none">
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
                              src={`${process.env.NEXT_PUBLIC_API_URL}/Media/mediaManager/Get?id=${media.media_id}`}
                              alt={`Evidence ${index + 1}`}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              onError={() => handleImageError(media.media_id)}
                              unoptimized
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