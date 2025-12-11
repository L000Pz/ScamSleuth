/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from 'next/headers';

export interface PublicReviewResponse {
  review: {
    review_id: number;
    title: string;
    writer_id: number;
    scam_type_id: number;
    review_date: string;
    review_content_id: number;
    views: number;
  };
  content: string;
  media: Array<{
    review_id: number;
    media_id: number;
  }>;
  reviewWriterDetails: {
    username: string;
    name: string;
    profile_picture_id: number | null;
    contact_info: string;
  };
}

export interface TransformedReview {
  id: string;
  title: string;
  date: string;
  rawDate: string;
  content: string;
  media: Array<{
    review_id: number;
    media_id: number;
  }>;
  writer: {
    username: string;
    name: string;
    profile_picture_id: number | null;
    contact_info: string;
  };
  views: number;
}

export interface CommentApiResponseItem {
  comments: {
    comment_id: number;
    root_id: number | null;
    review_id: number;
    writer_id: number;
    writer_role: string;
    comment_content: string;
    created_at: string;
  };
  writerDetails: {
    username: string;
    name: string;
    profile_picture_id: number | null;
  };
}

export interface Comment {
  id: string;
  author: {
    name: string;
    username: string;
    profile_picture_id: number | null;
    writer_id: number;
  };
  content: string;
  timestamp: string;
  rawTimestamp: string;
  likes: number;
  replies: Comment[];
  root_id: number | null;
  review_id: number;
  isAdminComment: boolean;
}

export interface CommentSubmission {
  reviewId: string;
  content: string;
  parentCommentId?: string;
}

interface UserInfo {
  admin_id?: number;
  username: string;
  email: string;
  name: string;
  contact_info: string;
  bio: string | null;
  profile_picture_id: number | null;
  token: string;
  role: string;
  is_verified?: boolean;
}

async function getUserInfoFromToken(token: string): Promise<UserInfo | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/IAM/authentication/ReturnByToken?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: {
          'Accept': '*/*'
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch user info from ReturnByToken: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: UserInfo = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user info from ReturnByToken:', error);
    return null;
  }
}

function formatSmartTimestamp(utcString: string): string {
  try {
    const utcIsoString = utcString.endsWith('Z') ? utcString : utcString + 'Z';
    const date = new Date(utcIsoString);
    
    if (isNaN(date.getTime())) {
      return utcString;
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'Just now';
    }
    
    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', ' •');
  } catch (error) {
    return utcString;
  }
}

function buildCommentTree(apiResponseItems: CommentApiResponseItem[]): Comment[] {
  const commentMap = new Map<number, Comment>();
  const rootComments: Comment[] = [];

  apiResponseItems.forEach(item => {
    const { comments: apiComment, writerDetails } = item;
    
    const comment: Comment = {
      id: apiComment.comment_id.toString(),
      author: {
        name: writerDetails.name,
        username: writerDetails.username,
        profile_picture_id: writerDetails.profile_picture_id,
        writer_id: apiComment.writer_id
      },
      content: apiComment.comment_content,
      timestamp: formatSmartTimestamp(apiComment.created_at),
      rawTimestamp: apiComment.created_at,
      likes: Math.floor(Math.random() * 20),
      replies: [],
      root_id: apiComment.root_id,
      review_id: apiComment.review_id,
      isAdminComment: apiComment.writer_role === 'admin'
    };

    commentMap.set(apiComment.comment_id, comment);
  });

  apiResponseItems.forEach(item => {
    const { comments: apiComment } = item;
    const comment = commentMap.get(apiComment.comment_id);
    if (!comment) return;

    if (apiComment.root_id === null) {
      rootComments.push(comment);
    } else {
      const parentComment = commentMap.get(apiComment.root_id);
      if (parentComment) {
        parentComment.replies.push(comment);
      }
    }
  });

  rootComments.sort((a, b) => new Date(b.rawTimestamp + 'Z').getTime() - new Date(a.rawTimestamp + 'Z').getTime());
  
  rootComments.forEach(comment => {
    comment.replies.sort((a, b) => new Date(a.rawTimestamp + 'Z').getTime() - new Date(b.rawTimestamp + 'Z').getTime());
  });

  return rootComments;
}

export async function getPublicReview(id: string): Promise<{
  success: boolean;
  data?: TransformedReview;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const reviewRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/reviewId?review_id=${id}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*'
      },
      cache: 'no-store'
    });

    if (!reviewRes.ok) {
      console.error('API call failed:', reviewRes.status);
      return { success: false, error: 'Failed to fetch data' };
    }

    const reviewData: PublicReviewResponse = await reviewRes.json();

    const transformedReview: TransformedReview = {
      id: reviewData.review.review_id.toString(),
      title: reviewData.review.title,
      date: formatSmartTimestamp(reviewData.review.review_date),
      rawDate: reviewData.review.review_date,
      content: reviewData.content,
      media: reviewData.media || [],
      writer: {
        username: reviewData.reviewWriterDetails.username,
        name: reviewData.reviewWriterDetails.name,
        profile_picture_id: reviewData.reviewWriterDetails.profile_picture_id,
        contact_info: reviewData.reviewWriterDetails.contact_info
      },
      views: reviewData.review.views
    };

    return { success: true, data: transformedReview };
  } catch (error) {
    console.error('Error in getPublicReview:', error);
    return { success: false, error: 'Failed to fetch review' };
  }
}

export async function getRecentReviews(limit: number = 2): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    title: string;
    author: string;
    date: string;
    rawDate: string;
    excerpt: string;
  }>;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/recentReviews`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Recent reviews API call failed:', response.status);
      return { success: false, error: 'Failed to fetch recent reviews' };
    }

    const reviews = await response.json();

    const transformedReviews = reviews
      .slice(0, limit)
      .map((review: any) => ({
        id: review.review_id.toString(),
        title: review.title,
        author: 'Anonymous',
        date: formatSmartTimestamp(review.review_date),
        rawDate: review.review_date,
        excerpt: review.title.length > 80 
          ? review.title.substring(0, 80) + '...' 
          : review.title
      }));

    return { success: true, data: transformedReviews };
  } catch (error) {
    console.error('Error in getRecentReviews:', error);
    return { success: false, error: 'Failed to fetch recent reviews' };
  }
}

export async function getReviewComments(reviewId: string): Promise<{
  success: boolean;
  data?: Comment[];
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/ReviewComments?review_id=${reviewId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Comments API call failed:', response.status);
      return { success: false, error: 'Failed to fetch comments' };
    }

    const apiResponseItems: CommentApiResponseItem[] = await response.json();

    if (!Array.isArray(apiResponseItems)) {
      console.error('Invalid comments response format');
      return { success: false, error: 'Invalid comments data format' };
    }

    const transformedComments = buildCommentTree(apiResponseItems);

    return { success: true, data: transformedComments };
  } catch (error) {
    console.error('Error in getReviewComments:', error);
    return { success: false, error: 'Failed to fetch comments' };
  }
}

export async function submitComment(commentData: CommentSubmission): Promise<{
  success: boolean;
  data?: Comment;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'Authentication required to post comments' };
    }

    const currentUser = await getCurrentUser();
    
    if (!currentUser.success || !currentUser.data) {
      return { success: false, error: 'Failed to get user information' };
    }

    let apiUrl = '';
    if (currentUser.data.role === 'admin') {
      apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/Admin/adminManagement/WriteReviewComment`;
    } else {
      apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/User/userManagement/WriteReviewComment`;
    }

    const requestBody = {
      root_id: commentData.parentCommentId ? parseInt(commentData.parentCommentId) : null,
      review_id: parseInt(commentData.reviewId),
      comment_content: commentData.content
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': '*/*'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Comment submission failed:', response.status, errorText);
      return { success: false, error: `Failed to submit comment: ${errorText}` };
    }

    const responseText = await response.text();
    console.log('Comment submission response:', responseText);
    
    const writerId = currentUser.data.writer_id || 0; 
    const now = new Date().toISOString().replace('Z', '');

    const newComment: Comment = {
      id: Date.now().toString(),
      author: {
        name: currentUser.data.name,
        username: currentUser.data.username,
        profile_picture_id: currentUser.data.profile_picture_id,
        writer_id: writerId,
      },
      content: commentData.content,
      timestamp: 'Just now',
      rawTimestamp: now,
      likes: 0,
      replies: [],
      root_id: commentData.parentCommentId ? parseInt(commentData.parentCommentId) : null,
      review_id: parseInt(commentData.reviewId),
      isAdminComment: currentUser.data.role === 'admin'
    };

    return { success: true, data: newComment };
  } catch (error) {
    console.error('Error in submitComment:', error);
    return { success: false, error: 'Failed to submit comment' };
  }
}

export async function toggleCommentLike(commentId: string, isLiked: boolean): Promise<{
  success: boolean;
  newLikeCount?: number;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'Authentication required to like comments' };
    }

    const newLikeCount = isLiked ? Math.floor(Math.random() * 20) + 1 : Math.floor(Math.random() * 15);
    
    return { success: true, newLikeCount };
  } catch (error) {
    console.error('Error in toggleCommentLike:', error);
    return { success: false, error: 'Failed to toggle like' };
  }
}

export async function downloadMedia(mediaId: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'Authentication required to download media.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in downloadMedia:', error);
    return { success: false, error: 'Failed to prepare media for download.' };
  }
}

export async function getCurrentUser(): Promise<{
  success: boolean;
  data?: {
    name: string;
    username: string;
    profile_picture_id: number | null;
    role: string;
    writer_id?: number;
  };
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/IAM/authentication/ReturnByToken?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: { 
          'Accept': '*/*' 
        },
      }
    );

    if (!response.ok) {
      return { success: false, error: 'Failed to get user info' };
    }

    const userInfo = await response.json();

    return {
      success: true,
      data: {
        name: userInfo.name,
        username: userInfo.username,
        profile_picture_id: userInfo.profile_picture_id,
        role: userInfo.role,
        writer_id: userInfo.admin_id || userInfo.user_id || null,
      }
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return { success: false, error: 'Failed to get user info' };
  }
}

export async function checkUserAuthentication(): Promise<{
  isAuthenticated: boolean;
  user?: {
    name: string;
    username: string;
    profile_picture_id: number | null;
    role: string;
  };
}> {
  try {
    const currentUserResult = await getCurrentUser();

    if (currentUserResult.success && currentUserResult.data) {
      return { isAuthenticated: true, user: currentUserResult.data };
    } else {
      return { isAuthenticated: false };
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    return { isAuthenticated: false };
  }
}

export async function deleteReviewComment(commentId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'Authentication required to delete comments.' };
    }

    const userInfo = await getUserInfoFromToken(token);

    if (!userInfo || userInfo.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Admin privileges required to delete comments.' };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Admin/adminManagement/DeleteReviewComment?comment_id=${commentId}`, {
      method: 'DELETE',
      headers: {
        'Accept': '*/*',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response for deleteReviewComment:', {
        status: response.status,
        text: errorText
      });
      return {
        success: false,
        error: `Failed to delete comment: ${errorText || response.statusText}`
      };
    }

    const responseData = await response.text();
    const message = responseData.startsWith('"') && responseData.endsWith('"')
      ? responseData.slice(1, -1)
      : responseData;

    return {
      success: true,
      message: message || 'Comment deleted successfully.'
    };

  } catch (error) {
    console.error('Error deleting review comment:', error);
    return { success: false, error: 'An unexpected error occurred while deleting the comment.' };
  }
}

export async function incrementReviewView(reviewId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/View?review_id=${reviewId}`, {
      method: 'PUT',
      headers: {
        'Accept': '*/*',
        'Authorization': `Bearer ${token || ''}`,
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to increment review view:', response.status, errorText);
      return { success: false, error: `Failed to increment view: ${errorText || response.statusText}` };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in incrementReviewView:', error);
    return { success: false, error: 'An unexpected error occurred while incrementing view.' };
  }
}