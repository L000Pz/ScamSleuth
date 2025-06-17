/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, ArrowLeft, User, Eye, EyeOff, Download, FileText, Heart, MessageCircle, Share2, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Maximize2, ImageIcon, Video, File } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  getPublicReview, 
  getReviewComments, 
  submitComment, 
  toggleCommentLike, 
  downloadMedia, 
  getCurrentUser,
  type TransformedReview,
  type Comment,
  type CommentSubmission
} from './actions';

// Utility function to get media URLs
const getMediaUrl = (mediaId: number): string => {
  return `http://localhost:8080/Media/mediaManager/Get?id=${mediaId}`;
};

interface MediaItem {
  media_id: number;
  type: 'image' | 'video' | 'document';
  name?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReviewPage({ params }: PageProps) {
  const router = useRouter();
  const [review, setReview] = useState<TransformedReview | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewingIds, setPreviewingIds] = useState<Set<number>>(new Set());
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [separatedMedia, setSeparatedMedia] = useState<{
    visualMedia: MediaItem[];
    documents: MediaItem[];
  }>({ visualMedia: [], documents: [] });
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  
  // Media library states
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Helper function to determine media type - actually working detection
  const getMediaType = async (mediaId: number): Promise<'image' | 'video' | 'document'> => {
    try {
      // Try to load the media URL and check the response
      const response = await fetch(getMediaUrl(mediaId), { 
        method: 'GET',
        headers: {
          'Range': 'bytes=0-1023' // Only get first 1KB to check file type
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        console.log(`Media ID ${mediaId} - Content-Type: ${contentType}`); // Debug log
        
        // Check content type
        if (contentType.includes('image/')) {
          return 'image';
        } else if (contentType.includes('video/')) {
          return 'video';
        } else if (
          contentType.includes('pdf') ||
          contentType.includes('msword') ||
          contentType.includes('document') ||
          contentType.includes('text/') ||
          contentType.includes('application/')
        ) {
          return 'document';
        }
        
        // If no content-type, try to determine from response data
        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        // Check file signatures (magic numbers)
        if (bytes.length >= 4) {
          // PNG signature
          if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
            return 'image';
          }
          // JPEG signature
          if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
            return 'image';
          }
          // GIF signature
          if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
            return 'image';
          }
          // MP4 signature
          if (bytes.length >= 8 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
            return 'video';
          }
          // AVI signature
          if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
            return 'video';
          }
          // PDF signature
          if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
            return 'document';
          }
        }
      }
    } catch (error) {
      console.warn('Failed to detect media type for ID:', mediaId, error);
    }
    
    // Final fallback - default to image
    console.log(`Media ID ${mediaId} - Defaulting to image`);
    return 'image';
  };

  // Separate media items into visual (images/videos) and documents - now async
  const separateMedia = async (media: any[]): Promise<{ visualMedia: MediaItem[], documents: MediaItem[] }> => {
    const visualMedia: MediaItem[] = [];
    const documents: MediaItem[] = [];

    // Process media items sequentially to avoid overwhelming the server
    for (const item of media) {
      const mediaType = await getMediaType(item.media_id);
      const mediaItem: MediaItem = {
        media_id: item.media_id,
        type: mediaType,
        name: `Media ${item.media_id}`
      };

      if (mediaItem.type === 'image' || mediaItem.type === 'video') {
        visualMedia.push(mediaItem);
      } else {
        documents.push(mediaItem);
      }
    }

    return { visualMedia, documents };
  };

  // Resolve params promise
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  // Fetch review data
  useEffect(() => {
    const fetchReviewData = async () => {
      if (!resolvedParams) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch review and comments in parallel
        const [reviewResult, commentsResult, userResult] = await Promise.all([
          getPublicReview(resolvedParams.id),
          getReviewComments(resolvedParams.id),
          getCurrentUser()
        ]);

        if (reviewResult.success && reviewResult.data) {
          setReview(reviewResult.data);
        } else {
          setError(reviewResult.error || 'Failed to load review');
          return;
        }

        if (commentsResult.success && commentsResult.data) {
          setComments(commentsResult.data);
        }

        if (userResult.success && userResult.data) {
          setCurrentUser(userResult.data);
        }

        // Process media types after review is loaded
        if (reviewResult.success && reviewResult.data && reviewResult.data.media.length > 0) {
          setIsLoadingMedia(true);
          try {
            const separated = await separateMedia(reviewResult.data.media);
            setSeparatedMedia(separated);
          } catch (error) {
            console.error('Error processing media:', error);
            // Fallback to simple separation if type detection fails
            setSeparatedMedia({
              visualMedia: reviewResult.data.media.map(item => ({
                media_id: item.media_id,
                type: 'image' as const,
                name: `Media ${item.media_id}`
              })),
              documents: []
            });
          } finally {
            setIsLoadingMedia(false);
          }
        }

      } catch (err) {
        console.error('Error fetching review data:', err);
        setError('Failed to load review');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviewData();
  }, [resolvedParams]);

  const handleMediaDownload = async (mediaId: number) => {
    setDownloadingIds(prev => new Set(prev).add(mediaId));
    
    try {
      const result = await downloadMedia(mediaId);
      
      if (result.success) {
        // Open the media URL in a new tab for download
        const downloadUrl = getMediaUrl(mediaId);
        window.open(downloadUrl, '_blank');
      } else {
        console.error('Download failed:', result.error);
      }
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setTimeout(() => {
        setDownloadingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(mediaId);
          return newSet;
        });
      }, 1000);
    }
  };

  const togglePreview = (mediaId: number) => {
    setPreviewingIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mediaId)) {
        newSet.delete(mediaId);
      } else {
        newSet.add(mediaId);
      }
      return newSet;
    });
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !review || isSubmittingComment) return;

    setIsSubmittingComment(true);

    try {
      const commentData: CommentSubmission = {
        reviewId: review.id,
        content: newComment.trim()
      };

      const result = await submitComment(commentData);

      if (result.success && result.data) {
        setComments(prev => [result.data!, ...prev]);
        setNewComment('');
      } else {
        console.error('Comment submission failed:', result.error);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    const isCurrentlyLiked = likedComments.has(commentId);
    
    try {
      const result = await toggleCommentLike(commentId, !isCurrentlyLiked);
      
      if (result.success) {
        setLikedComments(prev => {
          const newSet = new Set(prev);
          if (isCurrentlyLiked) {
            newSet.delete(commentId);
          } else {
            newSet.add(commentId);
          }
          return newSet;
        });

        // Update the comment's like count
        if (result.newLikeCount !== undefined) {
          setComments(prev => prev.map(comment => 
            comment.id === commentId 
              ? { ...comment, likes: result.newLikeCount! }
              : comment
          ));
        }
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  // Media library functions
  const openMediaLibrary = (index: number) => {
    setSelectedMediaIndex(index);
    setZoom(1);
    setRotation(0);
  };

  const closeMediaLibrary = () => {
    setSelectedMediaIndex(null);
    setZoom(1);
    setRotation(0);
  };

  const previousMedia = () => {
    if (selectedMediaIndex === null) return;
    const { visualMedia } = separatedMedia;
    setSelectedMediaIndex((selectedMediaIndex - 1 + visualMedia.length) % visualMedia.length);
    setZoom(1);
    setRotation(0);
  };

  const nextMedia = () => {
    if (selectedMediaIndex === null) return;
    const { visualMedia } = separatedMedia;
    setSelectedMediaIndex((selectedMediaIndex + 1) % visualMedia.length);
    setZoom(1);
    setRotation(0);
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  const CommentAvatar = ({ author, size = "w-8 h-8" }: { author: Comment['author']; size?: string }) => {
    const [imageError, setImageError] = useState(false);

    if (author.profile_picture_id && !imageError) {
      return (
        <div className={`${size} rounded-full overflow-hidden border-2 border-gray-200 shadow-md flex-shrink-0`}>
          <Image
            src={getMediaUrl(author.profile_picture_id)}
            alt={author.name}
            width={32}
            height={32}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            unoptimized
          />
        </div>
      );
    }

    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-red via-red/80 to-red/60 flex items-center justify-center flex-shrink-0 border-2 border-gray-200 shadow-md`}>
        <User className="w-4 h-4 text-white" />
      </div>
    );
  };

  const ProfilePicture = ({ size = "w-12 h-12" }: { size?: string }) => {
    const [imageError, setImageError] = useState(false);

    if (review?.writer.profile_picture_id && !imageError) {
      return (
        <div className={`${size} rounded-full overflow-hidden shadow-lg border-2 border-gray-200`}>
          <Image
            src={getMediaUrl(review.writer.profile_picture_id)}
            alt={review.writer.name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            unoptimized
          />
        </div>
      );
    }

    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-red via-red/80 to-red/60 flex items-center justify-center shadow-lg border-2 border-gray-200`}>
        <User className="w-6 h-6 text-white" />
      </div>
    );
  };

  // Media Library Modal Component
  const MediaLibraryModal = () => {
    if (selectedMediaIndex === null) return null;

    const { visualMedia } = separatedMedia;
    if (visualMedia.length === 0) return null;
    
    const currentMedia = visualMedia[selectedMediaIndex];

    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-white font-semibold">
                  {currentMedia.type === 'image' ? 'Image' : 'Video'} {selectedMediaIndex + 1} of {visualMedia.length}
                </h3>
                <span className="text-white/70 text-sm">{currentMedia.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {currentMedia.type === 'image' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={zoomOut}
                      disabled={zoom <= 0.5}
                      className="text-white hover:bg-white/20"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-white text-sm min-w-[60px] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={zoomIn}
                      disabled={zoom >= 3}
                      className="text-white hover:bg-white/20"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={rotate}
                      className="text-white hover:bg-white/20"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMediaDownload(currentMedia.media_id)}
                  disabled={downloadingIds.has(currentMedia.media_id)}
                  className="text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeMediaLibrary}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          {visualMedia.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="lg"
                onClick={previousMedia}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full w-12 h-12"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={nextMedia}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full w-12 h-12"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Media content */}
          <div className="absolute inset-0 pt-16 pb-8 px-4 flex items-center justify-center">
            {currentMedia.type === 'image' ? (
              <div 
                className="bg-gray-800 rounded-lg p-4 transition-transform duration-200 max-w-full max-h-full"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`
                }}
              >
                <Image
                  src={getMediaUrl(currentMedia.media_id)}
                  alt={currentMedia.name || 'Media'}
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain rounded"
                  unoptimized
                />
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-4 max-w-full max-h-full">
                <video
                  src={getMediaUrl(currentMedia.media_id)}
                  controls
                  className="max-w-full max-h-full rounded"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {visualMedia.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4">
              <div className="flex items-center justify-center gap-2 overflow-x-auto">
                {visualMedia.map((media, index) => (
                  <button
                    key={media.media_id}
                    onClick={() => setSelectedMediaIndex(index)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === selectedMediaIndex 
                        ? 'border-red scale-110' 
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                      {media.type === 'image' ? (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      ) : (
                        <Video className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red border-t-transparent"></div>
          <p className="text-black font-medium">Loading review...</p>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="bg-cardWhite border border-red rounded-xl p-6 text-center max-w-md shadow-lg">
          <p className="text-red font-medium mb-4">{error || 'Review not found'}</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/scams')}
            className="border-red text-red hover:bg-red hover:text-white"
          >
            Back to Reviews
          </Button>
        </div>
      </div>
    );
  }

  const { visualMedia, documents } = separatedMedia;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-2 font-medium text-[16px]" 
          onClick={() => router.push('/scams')}
        >
          <ArrowLeft size={20} />
          Back to Reviews
        </Button>

        {/* Main Content */}
        <Card className="shadow-xl border-0 bg-cardWhite mb-8 overflow-hidden">
          <CardContent className="p-0">
            {/* Header with Author Info */}
            <div className="bg-gradient-to-r from-cardWhite to-gray-50 p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <ProfilePicture />
                  <div>
                    <h3 className="font-semibold text-black text-lg">{review.writer.name}</h3>
                    <p className="text-gray-600 text-sm">@{review.writer.username}</p>
                    {review.writer.contact_info && (
                      <p className="text-gray-500 text-xs mt-1">{review.writer.contact_info}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-black bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                  <Calendar size={16} />
                  <span className="text-sm font-medium">{review.date}</span>
                </div>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-black leading-tight">
                {review.title}
              </h1>
            </div>

            {/* Media Library Section - Images and Videos */}
            {(visualMedia.length > 0 || isLoadingMedia) && (
              <div className="p-6 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-black flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-red" />
                  Media Gallery
                  {!isLoadingMedia && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({visualMedia.length} {visualMedia.length === 1 ? 'item' : 'items'})
                    </span>
                  )}
                </h2>
                
                {isLoadingMedia ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {visualMedia.map((media, index) => (
                      <div 
                        key={media.media_id}
                        className="relative group cursor-pointer bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-red/30"
                        onClick={() => openMediaLibrary(index)}
                      >
                        <div className="aspect-square relative">
                          {media.type === 'image' ? (
                            <Image
                              src={getMediaUrl(media.media_id)}
                              alt={media.name || 'Media'}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center relative">
                              <Video className="w-8 h-8 text-gray-400" />
                              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                VIDEO
                              </div>
                            </div>
                          )}
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <div className="bg-white/90 rounded-full p-2">
                                <Maximize2 className="w-4 h-4 text-black" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Media info */}
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-black truncate">
                              {media.type === 'image' ? 'Image' : 'Video'} {index + 1}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMediaDownload(media.media_id);
                              }}
                              disabled={downloadingIds.has(media.media_id)}
                              className="p-1 hover:bg-red/10 rounded text-red disabled:opacity-50 transition-colors"
                            >
                              {downloadingIds.has(media.media_id) ? (
                                <div className="animate-spin rounded-full h-3 w-3 border border-red border-t-transparent" />
                              ) : (
                                <Download className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Review Content */}
            <div className="p-6 md:p-8 bg-white">
              <div 
                        className="content-display"
                        style={{
                          fontSize: '16px',
                          lineHeight: '1.7',
                          color: '#374151'
                        }}
                        dangerouslySetInnerHTML={{ __html: review.content }} 
                      />

              {/* Documents Section - Only show if there are documents */}
              {documents.length > 0 && (
                <div className="mt-10 pt-8 border-t border-gray-200">
                  <h2 className="text-xl font-semibold mb-6 text-black flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red" />
                    Documents & Files
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({documents.length} file{documents.length > 1 ? 's' : ''})
                    </span>
                  </h2>
                  
                  <div className="space-y-4">
                    {documents.map((media, index) => (
                      <div key={media.media_id} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 shadow-sm">
                        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <File className="w-4 h-4 text-black" />
                              <span className="text-sm font-medium text-black">
                                Document {index + 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => togglePreview(media.media_id)}
                                className="flex items-center gap-2 border-gray-300 text-black hover:bg-black hover:text-white"
                              >
                                {previewingIds.has(media.media_id) ? (
                                  <>
                                    <EyeOff className="w-4 h-4" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4" />
                                    Preview
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMediaDownload(media.media_id)}
                                disabled={downloadingIds.has(media.media_id)}
                                className="flex items-center gap-2 border-red text-black hover:bg-red hover:text-white disabled:opacity-50"
                              >
                                {downloadingIds.has(media.media_id) ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-red border-t-transparent" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                                {downloadingIds.has(media.media_id) ? 'Opening...' : 'Download'}
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {previewingIds.has(media.media_id) && (
                          <div className="p-4 bg-white">
                            <div className="relative bg-gray-100 rounded-lg overflow-hidden min-h-[200px] flex items-center justify-center">
                              <File className="w-16 h-16 text-gray-400" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="shadow-xl border-0 bg-cardWhite">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-black flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-red" />
                Discussion
                <span className="text-lg font-normal text-gray-600">
                  ({comments.length} comments)
                </span>
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-gray-300 text-black hover:bg-gray-100"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>

            {/* Add Comment */}
            {currentUser && (
              <div className="mb-8 bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex gap-3">
                  <CommentAvatar author={currentUser} />
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts about this review..."
                      className="w-full p-4 border border-gray-300 rounded-lg text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-red focus:border-red transition-all"
                      rows={4}
                    />
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-xs text-gray-500">
                        Be respectful and constructive in your comments
                      </p>
                      <Button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim() || isSubmittingComment}
                        className="bg-red hover:bg-red/90 text-white px-6 py-2 disabled:opacity-50 border-0"
                      >
                        {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-black mb-2">No comments yet</h3>
                  <p className="text-gray-600">Be the first to share your thoughts about this review.</p>
                </div>
              ) : (
                comments.map((comment: Comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <CommentAvatar author={comment.author} />
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-black text-sm">{comment.author.name}</span>
                          <span className="text-gray-500 text-xs">@{comment.author.username}</span>
                          <span className="text-gray-500 text-xs">•</span>
                          <span className="text-gray-500 text-xs">{comment.timestamp}</span>
                        </div>
                        <p className="text-black text-sm leading-relaxed">{comment.content}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <button 
                          onClick={() => handleCommentLike(comment.id)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
                            likedComments.has(comment.id)
                              ? 'text-red bg-red/10 border-red/20'
                              : 'text-gray-500 hover:text-red hover:bg-red/10 border-gray-300 hover:border-red/20'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${likedComments.has(comment.id) ? 'fill-current' : ''}`} />
                          <span>{comment.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 border border-gray-300 transition-all">
                          <MessageCircle className="w-4 h-4" />
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline"
            onClick={() => router.push('/scams')}
            className="flex items-center gap-2 border-gray-300 text-black hover:bg-black hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Reviews
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/report')}
            className="flex items-center gap-2 border-red text-black hover:bg-red hover:text-white transition-colors"
          >
            Report Similar Scam
          </Button>
        </div>
      </div>

      {/* Media Library Modal */}
      <MediaLibraryModal />
    </div>
  );
}