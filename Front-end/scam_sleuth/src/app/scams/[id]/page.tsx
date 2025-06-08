/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, ArrowLeft, User, Eye, EyeOff, Download, FileText, Heart, MessageCircle, Share2, Flag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Mock types based on your existing code
interface TransformedReview {
  id: string;
  title: string;
  date: string;
  content: string;
  writer: {
    name: string;
    username: string;
    contact_info?: string;
    profile_picture_id?: number | null;
  };
  media: Array<{
    media_id: number;
  }>;
}

interface Comment {
  id: string;
  author: {
    name: string;
    username: string;
    profile_picture_id: number | null;
  };
  content: string;
  timestamp: string;
  likes: number;
  replies: Comment[];
}

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [review, setReview] = useState<TransformedReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewingIds, setPreviewingIds] = useState<Set<number>>(new Set());
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  // Mock review data
  useEffect(() => {
    const mockReview: TransformedReview = {
      id: '1',
      title: 'Cryptocurrency Investment Scam - Lost $5,000 to Fake Trading Platform',
      date: '2 days ago',
      content: `<p>I want to share my experience with a cryptocurrency scam that cost me $5,000, hoping it will help others avoid the same mistake.</p>
      
      <p>It started when I received a message on social media from someone claiming to be a successful crypto trader. They showed me screenshots of their "profits" and convinced me to join their "exclusive trading platform."</p>
      
      <p>The website looked professional with real-time charts and everything. They asked for an initial investment of $500, which I sent via Bitcoin. At first, my dashboard showed profits, and they even let me withdraw $100 to build trust.</p>
      
      <p>Convinced by this "proof," I invested more money over several weeks, eventually reaching $5,000. When I tried to withdraw my funds, they demanded a "tax payment" of 20% before releasing the money. This is when I realized it was a scam.</p>
      
      <p><strong>Red flags I should have noticed:</strong></p>
      <ul>
        <li>Unsolicited contact on social media</li>
        <li>Pressure to invest quickly</li>
        <li>Unregulated trading platform</li>
        <li>Requests for additional fees to withdraw funds</li>
        <li>No physical address or proper licensing</li>
      </ul>
      
      <p>Please be extremely cautious with cryptocurrency investments and only use regulated, well-known platforms.</p>`,
      writer: {
        name: 'John Anderson',
        username: 'john_anderson',
        contact_info: 'john.anderson@email.com',
        profile_picture_id: null
      },
      media: [
        { media_id: 1 },
        { media_id: 2 }
      ]
    };

    setTimeout(() => {
      setReview(mockReview);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Mock comments data with nested structure
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: {
        name: 'Sarah Johnson',
        username: 'sarah_j',
        profile_picture_id: null
      },
      content: 'This is a very detailed and informative review. Thank you for sharing this important information with the community. These crypto scams are becoming increasingly sophisticated.',
      timestamp: '2 hours ago',
      likes: 15,
      replies: [
        {
          id: '1-1',
          author: {
            name: 'Mike Chen',
            username: 'mike_chen',
            profile_picture_id: null
          },
          content: 'I completely agree! More people need to be aware of these types of scams. The fake profit screenshots are a classic red flag.',
          timestamp: '1 hour ago',
          likes: 8,
          replies: [
            {
              id: '1-1-1',
              author: {
                name: 'Emma Wilson',
                username: 'emma_w',
                profile_picture_id: null
              },
              content: 'Absolutely, sharing experiences like this can save others from falling victim. I almost fell for something similar last month.',
              timestamp: '45 minutes ago',
              likes: 3,
              replies: []
            }
          ]
        },
        {
          id: '1-2',
          author: {
            name: 'David Kim',
            username: 'david_k',
            profile_picture_id: null
          },
          content: 'I had a similar experience with this type of scam. Thanks for the warning! The "tax payment" request is always the final red flag.',
          timestamp: '30 minutes ago',
          likes: 12,
          replies: []
        }
      ]
    },
    {
      id: '2',
      author: {
        name: 'Alex Rodriguez',
        username: 'alex_r',
        profile_picture_id: null
      },
      content: 'Great analysis! The evidence provided really helps understand the methods used by these scammers. The progression from small wins to larger losses is textbook manipulation.',
      timestamp: '4 hours ago',
      likes: 23,
      replies: [
        {
          id: '2-1',
          author: {
            name: 'Lisa Park',
            username: 'lisa_p',
            profile_picture_id: null
          },
          content: 'The screenshots were particularly helpful in identifying red flags. I\'ll definitely be more careful with any unsolicited investment offers.',
          timestamp: '3 hours ago',
          likes: 7,
          replies: []
        }
      ]
    },
    {
      id: '3',
      author: {
        name: 'Maria Santos',
        username: 'maria_s',
        profile_picture_id: null
      },
      content: 'I wish I had seen this review earlier. I almost fell for a similar scam last week. Thank you for the detailed breakdown! The part about the initial withdrawal to build trust really resonates with my experience.',
      timestamp: '6 hours ago',
      likes: 31,
      replies: []
    }
  ]);

  const handleMediaDownload = (mediaId: number) => {
    setDownloadingIds(prev => new Set(prev).add(mediaId));
    const downloadUrl = `http://localhost:8080/Media/mediaManager/Get?id=${mediaId}`;
    window.open(downloadUrl, '_blank');
    
    setTimeout(() => {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(mediaId);
        return newSet;
      });
    }, 1000);
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

  const handleLikeComment = (commentId: string, isReply: boolean = false, parentId?: string) => {
    const isLiked = likedComments.has(commentId);
    
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });

    setComments(prevComments => {
      return prevComments.map(comment => {
        if (!isReply && comment.id === commentId) {
          return { ...comment, likes: comment.likes + (isLiked ? -1 : 1) };
        }
        if (isReply && comment.id === parentId) {
          return {
            ...comment,
            replies: updateNestedReplies(comment.replies, commentId, isLiked)
          };
        }
        return comment;
      });
    });
  };

  const updateNestedReplies = (replies: Comment[], targetId: string, isLiked: boolean): Comment[] => {
    return replies.map(reply => {
      if (reply.id === targetId) {
        return { ...reply, likes: reply.likes + (isLiked ? -1 : 1) };
      }
      if (reply.replies && reply.replies.length > 0) {
        return {
          ...reply,
          replies: updateNestedReplies(reply.replies, targetId, isLiked)
        };
      }
      return reply;
    });
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        name: 'Current User',
        username: 'current_user',
        profile_picture_id: null
      },
      content: newComment,
      timestamp: 'Just now',
      likes: 0,
      replies: []
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyText.trim()) return;

    const reply: Comment = {
      id: `${parentId}-${Date.now()}`,
      author: {
        name: 'Current User',
        username: 'current_user',
        profile_picture_id: null
      },
      content: replyText,
      timestamp: 'Just now',
      likes: 0,
      replies: []
    };

    setComments(prevComments => {
      return prevComments.map(comment => {
        if (comment.id === parentId) {
          return { ...comment, replies: [...comment.replies, reply] };
        }
        return {
          ...comment,
          replies: addNestedReply(comment.replies, parentId, reply)
        };
      });
    });

    setReplyText('');
    setReplyingTo(null);
  };

  const addNestedReply = (replies: Comment[], targetId: string, newReply: Comment): Comment[] => {
    return replies.map(reply => {
      if (reply.id === targetId) {
        return { ...reply, replies: [...reply.replies, newReply] };
      }
      if (reply.replies && reply.replies.length > 0) {
        return {
          ...reply,
          replies: addNestedReply(reply.replies, targetId, newReply)
        };
      }
      return reply;
    });
  };

  const toggleReplies = (commentId: string) => {
    setShowReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const CommentAvatar = ({ author, size = "w-8 h-8" }: { author: Comment['author']; size?: string }) => {
    const [imageError, setImageError] = useState(false);
    
    if (author.profile_picture_id && !imageError) {
      return (
        <div className={`${size} rounded-full overflow-hidden border border-gray-200 flex-shrink-0`}>
          <Image
            src={`http://localhost:8080/Media/mediaManager/Get?id=${author.profile_picture_id}`}
            alt={`${author.name}'s profile`}
            width={32}
            height={32}
            className="w-full h-full object-cover"
            unoptimized={true}
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        </div>
      );
    }
    
    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 border border-gray-200`}>
        <User className="w-4 h-4 text-white" />
      </div>
    );
  };

  const CommentComponent = ({ comment, isReply = false, depth = 0 }: { comment: Comment; isReply?: boolean; depth?: number }) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isShowingReplies = showReplies.has(comment.id);
    const isLiked = likedComments.has(comment.id);
    const marginLeft = depth > 0 ? 'ml-6' : '';

    return (
      <div className={`${marginLeft} ${depth > 0 ? 'border-l border-gray-200 pl-4' : ''}`}>
        <div className="flex gap-3 mb-4">
          <CommentAvatar author={comment.author} />
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-900 text-sm">{comment.author.name}</span>
                <span className="text-gray-500 text-xs">@{comment.author.username}</span>
                <span className="text-gray-400 text-xs">•</span>
                <span className="text-gray-500 text-xs">{comment.timestamp}</span>
              </div>
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
            </div>
            
            <div className="flex items-center gap-6 mt-3 text-xs">
              <button
                onClick={() => handleLikeComment(comment.id, isReply, comment.id.split('-')[0])}
                className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-200 ${
                  isLiked 
                    ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium">{comment.likes}</span>
              </button>
              
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-2 px-3 py-1 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">Reply</span>
              </button>
              
              {hasReplies && (
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-medium">
                    {isShowingReplies ? 'Hide' : 'View'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                </button>
              )}

              <button className="flex items-center gap-2 px-3 py-1 rounded-full text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200">
                <Flag className="w-4 h-4" />
                <span className="font-medium">Report</span>
              </button>
            </div>

            {/* Reply Input */}
            {replyingTo === comment.id && (
              <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex gap-3">
                  <CommentAvatar author={{ name: 'You', username: 'you', profile_picture_id: null }} />
                  <div className="flex-1">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${comment.author.name}...`}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={!replyText.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-auto disabled:opacity-50"
                      >
                        Post Reply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 h-auto"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nested Replies */}
        {hasReplies && isShowingReplies && (
          <div className="space-y-3 mt-4">
            {comment.replies.map((reply: Comment) => (
              <CommentComponent 
                key={reply.id} 
                comment={reply} 
                isReply={true} 
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const ProfilePicture = ({ size = "w-12 h-12" }: { size?: string }) => {
    const [imageError, setImageError] = useState(false);
    
    if (review?.writer.profile_picture_id && !imageError) {
      return (
        <div className={`${size} rounded-full overflow-hidden border-2 border-gray-200 shadow-sm`}>
          <Image
            src={`http://localhost:8080/Media/mediaManager/Get?id=${review.writer.profile_picture_id}`}
            alt={`${review.writer.name}'s profile`}
            width={48}
            height={48}
            className="w-full h-full object-cover"
            unoptimized={true}
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        </div>
      );
    }
    
    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-red via-red/80 to-red/60 flex items-center justify-center shadow-sm border-2 border-gray-200`}>
        <User className="w-6 h-6 text-white" />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-700 font-medium">Loading review...</p>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center max-w-md shadow-lg">
          <p className="text-red-600 font-medium mb-4">{error || 'Review not found'}</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/scams')}
            className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
          >
            Back to Reviews
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-white transition-colors" 
          onClick={() => router.push('/scams')}
        >
          <ArrowLeft size={20} />
          Back to Reviews
        </Button>

        {/* Main Content */}
        <Card className="shadow-xl border-0 bg-white mb-8">
          <CardContent className="p-0">
            {/* Header with Author Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <ProfilePicture />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{review.writer.name}</h3>
                    <p className="text-gray-600 text-sm">@{review.writer.username}</p>
                    {review.writer.contact_info && (
                      <p className="text-gray-500 text-xs mt-1">{review.writer.contact_info}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                  <Calendar size={16} />
                  <span className="text-sm font-medium">{review.date}</span>
                </div>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {review.title}
              </h1>
            </div>

            {/* Review Content */}
            <div className="p-6 md:p-8 bg-white">
              <div 
                className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: review.content }} 
              />

              {/* Media Section */}
              {review.media && review.media.length > 0 && (
                <div className="mt-10 pt-8 border-t border-gray-200">
                  <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Evidence & Attachments
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({review.media.length} file{review.media.length > 1 ? 's' : ''})
                    </span>
                  </h2>
                  
                  <div className="space-y-6">
                    {review.media.map((media, index) => (
                      <div key={media.media_id} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 shadow-sm">
                        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-900">
                                Attachment {index + 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => togglePreview(media.media_id)}
                                className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-700 hover:text-white"
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
                                className="flex items-center gap-2 border-blue-300 text-blue-600 hover:bg-blue-600 hover:text-white disabled:opacity-50"
                              >
                                {downloadingIds.has(media.media_id) ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
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
                            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                                <FileText className="w-16 h-16 text-gray-400" />
                              </div>
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
        <Card className="shadow-xl border-0 bg-white">
          <CardContent className="p-6">
            {/* Comments Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                Discussion
                <span className="text-lg font-normal text-gray-600">
                  ({comments.reduce((total, comment) => total + 1 + comment.replies.length, 0)} comments)
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Add Comment */}
            <div className="mb-8 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex gap-3">
                <CommentAvatar author={{ name: 'You', username: 'you', profile_picture_id: null }} />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts about this review..."
                    className="w-full p-4 border border-gray-300 rounded-lg text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows={4}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-xs text-gray-500">
                      Be respectful and constructive in your comments
                    </p>
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 disabled:opacity-50"
                    >
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No comments yet</h3>
                  <p className="text-gray-500">Be the first to share your thoughts about this review.</p>
                </div>
              ) : (
                comments.map((comment: Comment) => (
                  <CommentComponent 
                    key={comment.id} 
                    comment={comment} 
                    isReply={false} 
                    depth={0}
                  />
                ))
              )}
            </div>

            {/* Load More Comments */}
            {comments.length > 0 && (
              <div className="text-center mt-8 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-2"
                >
                  Load More Comments
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline"
            onClick={() => router.push('/scams')}
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-700 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Reviews
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/report')}
            className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
          >
            Report Similar Scam
          </Button>
        </div>

        {/* Related Reviews Section */}
        <Card className="shadow-xl border-0 bg-white mt-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Related Reviews
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: '2',
                  title: 'Fake Investment Platform - Binary Options Scam',
                  author: 'Jane Smith',
                  date: '1 week ago',
                  excerpt: 'Lost $3,000 to a fake binary options trading platform that promised guaranteed returns...'
                },
                {
                  id: '3',
                  title: 'Romance Scam on Dating App - $8,000 Loss',
                  author: 'Michael Brown',
                  date: '2 weeks ago',
                  excerpt: 'Met someone on a dating app who gradually gained my trust over 3 months before asking for money...'
                }
              ].map((relatedReview) => (
                <div 
                  key={relatedReview.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/scams/${relatedReview.id}`)}
                >
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{relatedReview.title}</h4>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{relatedReview.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>By {relatedReview.author}</span>
                    <span>{relatedReview.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}