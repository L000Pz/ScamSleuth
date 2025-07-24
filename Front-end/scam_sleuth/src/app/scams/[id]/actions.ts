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
  date: string; // Keep as original UTC string from backend
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
}

// Updated API response types for comments based on new structure
export interface CommentApiResponseItem {
  comments: {
    comment_id: number;
    root_id: number | null;
    review_id: number;
    writer_id: number;
    writer_role: string;
    comment_content: string;
    created_at: string; // UTC timestamp from backend
  };
  writerDetails: {
    username: string;
    name: string;
    profile_picture_id: number | null;
  };
}

// Transformed comment type for frontend - keep timestamp as original UTC string
export interface Comment {
  id: string;
  author: {
    name: string;
    username: string;
    profile_picture_id: number | null;
    writer_id: number;
  };
  content: string;
  timestamp: string; // Keep as original UTC string from backend
  likes: number;
  replies: Comment[];
  root_id: number | null;
  review_id: number;
}

export interface CommentSubmission {
  reviewId: string;
  content: string;
  parentCommentId?: string; // For replies - this will be the root_id
}

// Updated helper function to build nested comment tree WITHOUT timestamp conversion
function buildCommentTree(apiResponseItems: CommentApiResponseItem[]): Comment[] {
  const commentMap = new Map<number, Comment>();
  const rootComments: Comment[] = [];

  // First pass: create all comment objects using the new structure
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
      timestamp: apiComment.created_at, // Keep original UTC string from backend
      likes: Math.floor(Math.random() * 20), // Mock likes since API doesn't provide them
      replies: [],
      root_id: apiComment.root_id,
      review_id: apiComment.review_id
    };

    commentMap.set(apiComment.comment_id, comment);
  });

  // Second pass: build the tree structure
  apiResponseItems.forEach(item => {
    const { comments: apiComment } = item;
    const comment = commentMap.get(apiComment.comment_id);
    if (!comment) return;

    if (apiComment.root_id === null) {
      // This is a root comment
      rootComments.push(comment);
    } else {
      // This is a reply, add it to the parent's replies
      const parentComment = commentMap.get(apiComment.root_id);
      if (parentComment) {
        parentComment.replies.push(comment);
      }
    }
  });

  // Sort comments by timestamp (newest first for root, oldest first for replies)
  rootComments.sort((a, b) => new Date(b.timestamp + 'Z').getTime() - new Date(a.timestamp + 'Z').getTime());
  
  // Sort replies within each comment (oldest first)
  rootComments.forEach(comment => {
    comment.replies.sort((a, b) => new Date(a.timestamp + 'Z').getTime() - new Date(b.timestamp + 'Z').getTime());
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

    const reviewRes = await fetch(`http://localhost:8080/Public/publicManager/reviewId?review_id=${id}`, {
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
      date: reviewData.review.review_date, // Keep original UTC string from backend
      content: reviewData.content,
      media: reviewData.media || [],
      writer: {
        username: reviewData.reviewWriterDetails.username,
        name: reviewData.reviewWriterDetails.name,
        profile_picture_id: reviewData.reviewWriterDetails.profile_picture_id,
        contact_info: reviewData.reviewWriterDetails.contact_info
      }
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
    excerpt: string;
  }>;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const response = await fetch('http://localhost:8080/Public/publicManager/recentReviews', {
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
        date: review.review_date, // Keep original UTC string from backend
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

// Updated function to get comments with new API response structure
export async function getReviewComments(reviewId: string): Promise<{
  success: boolean;
  data?: Comment[];
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const response = await fetch(`http://localhost:8080/Public/publicManager/ReviewComments?review_id=${reviewId}`, {
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

    // Build the nested comment tree using the new structure
    const transformedComments = buildCommentTree(apiResponseItems);

    return { success: true, data: transformedComments };
  } catch (error) {
    console.error('Error in getReviewComments:', error);
    return { success: false, error: 'Failed to fetch comments' };
  }
}

// Submit a new comment - using real API
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

    // Prepare the request body according to API spec
    const requestBody = {
      root_id: commentData.parentCommentId ? parseInt(commentData.parentCommentId) : null,
      review_id: parseInt(commentData.reviewId),
      comment_content: commentData.content
    };

    const response = await fetch('http://localhost:8080/User/userManagement/WriteReviewComment', {
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
      return { success: false, error: 'Failed to submit comment' };
    }

    const responseText = await response.text();
    console.log('Comment submission response:', responseText);

    // Get current user info for the newly created comment
    const currentUser = await getCurrentUser();
    
    if (!currentUser.success || !currentUser.data) {
      return { success: false, error: 'Failed to get user information' };
    }

    // Create a mock comment object that represents the newly submitted comment
    // In a real scenario, the API should return the created comment with its ID
    const newComment: Comment = {
      id: Date.now().toString(), // Temporary ID until we refresh comments
      author: {
        name: currentUser.data.name,
        username: currentUser.data.username,
        profile_picture_id: currentUser.data.profile_picture_id,
        writer_id: 0 // We don't have the writer_id from getCurrentUser
      },
      content: commentData.content,
      timestamp: new Date().toISOString().replace('Z', ''), // Current time as UTC string without Z
      likes: 0,
      replies: [],
      root_id: commentData.parentCommentId ? parseInt(commentData.parentCommentId) : null,
      review_id: parseInt(commentData.reviewId)
    };

    return { success: true, data: newComment };
  } catch (error) {
    console.error('Error in submitComment:', error);
    return { success: false, error: 'Failed to submit comment' };
  }
}

// Like/unlike a comment - keeping mock implementation
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

    // Mock implementation - replace with actual API call when available
    const newLikeCount = isLiked ? Math.floor(Math.random() * 20) + 1 : Math.floor(Math.random() * 15);
    
    return { success: true, newLikeCount };
  } catch (error) {
    console.error('Error in toggleCommentLike:', error);
    return { success: false, error: 'Failed to toggle like' };
  }
}

// Download media file
export async function downloadMedia(mediaId: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    return { success: true };
  } catch (error) {
    console.error('Error in downloadMedia:', error);
    return { success: false, error: 'Failed to download media' };
  }
}

// Get user info for current user (for comment submission)
export async function getCurrentUser(): Promise<{
  success: boolean;
  data?: {
    name: string;
    username: string;
    profile_picture_id: number | null;
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
      `http://localhost:8080/IAM/authentication/ReturnByToken?token=${encodeURIComponent(token)}`,
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
        profile_picture_id: userInfo.profile_picture_id
      }
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return { success: false, error: 'Failed to get user info' };
  }
}

// Check if user is authenticated
export async function checkUserAuthentication(): Promise<{
  isAuthenticated: boolean;
  user?: {
    name: string;
    username: string;
    profile_picture_id: number | null;
  };
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { isAuthenticated: false };
    }

    const response = await fetch(
      `http://localhost:8080/IAM/authentication/ReturnByToken?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: { 
          'Accept': '*/*' 
        },
      }
    );

    if (!response.ok) {
      return { isAuthenticated: false };
    }

    const userInfo = await response.json();

    return {
      isAuthenticated: true,
      user: {
        name: userInfo.name,
        username: userInfo.username,
        profile_picture_id: userInfo.profile_picture_id
      }
    };
  } catch (error) {
    console.error('Error checking authentication:', error);
    return { isAuthenticated: false };
  }
}