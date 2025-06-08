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
  date: string;
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

export interface Comment {
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

export interface CommentSubmission {
  reviewId: string;
  content: string;
  parentCommentId?: string; // For replies
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
      date: new Date(reviewData.review.review_date).toLocaleDateString(),
      content: reviewData.content,
      media: reviewData.media || [], // Ensure media is always an array
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

    // Transform the data to match the component's expected format
    const transformedReviews = reviews
      .slice(0, limit) // Take only the first reviews based on limit
      .map((review: any) => ({
        id: review.review_id.toString(),
        title: review.title,
        author: 'Anonymous', // API doesn't provide author info directly
        date: new Date(review.review_date).toLocaleDateString(),
        excerpt: review.title.length > 80 
          ? review.title.substring(0, 80) + '...' 
          : review.title // Use title as excerpt since no description is provided
      }));

    return { success: true, data: transformedReviews };
  } catch (error) {
    console.error('Error in getRecentReviews:', error);
    return { success: false, error: 'Failed to fetch recent reviews' };
  }
}

// Get comments for a specific review
export async function getReviewComments(reviewId: string): Promise<{
  success: boolean;
  data?: Comment[];
  error?: string;
}> {
  try {
    // For now, return mock data since the API endpoint for comments might not exist yet
    // You can replace this with actual API call when available
    
    const mockComments: Comment[] = [
      {
        id: '1',
        author: {
          name: 'Sarah Johnson',
          username: 'sarah_j',
          profile_picture_id: null
        },
        content: 'This is very helpful information. Thank you for sharing your experience to help others avoid this scam.',
        timestamp: '2 hours ago',
        likes: 15,
        replies: []
      },
      {
        id: '2',
        author: {
          name: 'Mike Chen',
          username: 'mike_c',
          profile_picture_id: null
        },
        content: 'I almost fell for a similar scam last month. Thanks for the warning!',
        timestamp: '4 hours ago',
        likes: 8,
        replies: []
      }
    ];

    return { success: true, data: mockComments };
  } catch (error) {
    console.error('Error in getReviewComments:', error);
    return { success: false, error: 'Failed to fetch comments' };
  }
}

// Submit a new comment
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

    // For now, return mock success since comment API might not be implemented yet
    // You can replace this with actual API call when available
    
    const newComment: Comment = {
      id: Date.now().toString(),
      author: {
        name: 'Current User',
        username: 'current_user',
        profile_picture_id: null
      },
      content: commentData.content,
      timestamp: 'Just now',
      likes: 0,
      replies: []
    };

    return { success: true, data: newComment };
  } catch (error) {
    console.error('Error in submitComment:', error);
    return { success: false, error: 'Failed to submit comment' };
  }
}

// Like/unlike a comment
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

    // Mock implementation - replace with actual API call
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

    // Create download URL - this should match your media API endpoint
    const downloadUrl = `http://localhost:8080/Media/mediaManager/Get?id=${mediaId}`;
    
    // In a real implementation, you might want to:
    // 1. Verify user has permission to download
    // 2. Log the download activity
    // 3. Handle different file types appropriately
    
    return { success: true };
  } catch (error) {
    console.error('Error in downloadMedia:', error);
    return { success: false, error: 'Failed to download media' };
  }
}

// Get media file URL for preview - this is a client-side utility function
// Move this to a separate utils file or define it in the component

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