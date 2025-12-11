/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from 'next/headers';

// Updated type definitions to match actual API response
export interface ReviewContent {
  review_content_id: number;
  review_content: string;
}

export interface Review {
  review_id: number;
  title: string;
  scam_type_id: number;
  review_date: string;
  review_content_id: number;
  writer_id?: number;
}

export interface AdminReview {
  admin_id: number;
  review_id: number;
}

export interface MediaItem {
  review_id: number;
  media_id: number;
}

export interface ReviewWriterDetails {
  username: string;
  name: string;
  profile_picture_id?: number | null;
  contact_info?: string;
}

export interface PublicReviewResponse {
  review: Review;
  content: string;
  media: MediaItem[];
  reviewWriterDetails?: ReviewWriterDetails;
}

export interface TransformedReviewData {
  id: string;
  title: string;
  date: string;
  content: string;
  media: MediaItem[];
  writer?: ReviewWriterDetails;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UpdateReviewParams {
  id: string;
  title: string;
  content: string;
}

// Enhanced error handling
class ReviewApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ReviewApiError';
  }
}

// Utility function for making authenticated requests
async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new ReviewApiError('Authentication token not found', 401);
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': '*/*',
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new ReviewApiError(
      `Request failed: ${response.statusText} - ${errorText}`,
      response.status,
      url
    );
  }

  return response;
}

/**
 * Fetches a public review by ID with enhanced error handling and type safety
 */
export async function getPublicReview(id: string): Promise<ApiResponse<TransformedReviewData>> {
  try {
    // Validate input
    if (!id || id.trim() === '') {
      return { 
        success: false, 
        error: 'Review ID is required' 
      };
    }

    // Sanitize ID to ensure it's a valid number
    const reviewId = parseInt(id.trim(), 10);
    if (isNaN(reviewId) || reviewId <= 0) {
      return { 
        success: false, 
        error: 'Invalid review ID format' 
      };
    }

    const response = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/reviewId?review_id=${reviewId}`
    );

    const reviewData: PublicReviewResponse = await response.json();

    // Validate response structure
    if (!reviewData.review) {
      return { 
        success: false, 
        error: 'Invalid response format from server' 
      };
    }

    const reviewContent = reviewData.content || '';

    // Transform data with better date handling
    const transformedReview: TransformedReviewData = {
      id: reviewData.review.review_id.toString(),
      title: reviewData.review.title || 'Untitled Review',
      date: reviewData.review.review_date ? 
        new Date(reviewData.review.review_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : 'Unknown date',
      content: reviewContent,
      media: reviewData.media || [],
      writer: reviewData.reviewWriterDetails
    };

    // Log content for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('Raw API response:', reviewData);
      console.log('Review content type:', typeof reviewData.content);
      console.log('Review content:', reviewData.content);
      console.log('Transformed review:', transformedReview);
    }

    return { 
      success: true, 
      data: transformedReview 
    };

  } catch (error) {
    console.error('Error in getPublicReview:', error);
    
    if (error instanceof ReviewApiError) {
      return { 
        success: false, 
        error: `Failed to fetch review: ${error.message}` 
      };
    }

    return { 
      success: false, 
      error: 'An unexpected error occurred while fetching the review' 
    };
  }
}

/**
 * Deletes a review by ID with enhanced error handling
 */
export async function deleteReview(id: string): Promise<ApiResponse<void>> {
  try {
    // Validate input
    if (!id || id.trim() === '') {
      return { 
        success: false, 
        error: 'Review ID is required' 
      };
    }

    const reviewId = parseInt(id.trim(), 10);
    if (isNaN(reviewId) || reviewId <= 0) {
      return { 
        success: false, 
        error: 'Invalid review ID format' 
      };
    }

    await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/Admin/adminManagement/DeleteReview?reviewId=${reviewId}`,
      { method: 'DELETE' }
    );

    return { success: true };

  } catch (error) {
    console.error('Error in deleteReview:', error);
    
    if (error instanceof ReviewApiError) {
      if (error.statusCode === 404) {
        return { 
          success: false, 
          error: 'Review not found or already deleted' 
        };
      }
      if (error.statusCode === 403) {
        return { 
          success: false, 
          error: 'You do not have permission to delete this review' 
        };
      }
      return { 
        success: false, 
        error: `Failed to delete review: ${error.message}` 
      };
    }

    return { 
      success: false, 
      error: 'An unexpected error occurred while deleting the review' 
    };
  }
}

/**
 * Updates a review's title and content with enhanced validation and error handling
 * Now uses the correct API endpoints with review_id instead of review_content_id
 */
export async function updateReview(params: UpdateReviewParams): Promise<ApiResponse<void>> {
  try {
    const { id, title, content } = params;

    // Enhanced input validation
    if (!id || id.trim() === '') {
      return { 
        success: false, 
        error: 'Review ID is required' 
      };
    }

    if (!title || title.trim() === '') {
      return { 
        success: false, 
        error: 'Review title cannot be empty' 
      };
    }

    if (!content || content.trim() === '') {
      return { 
        success: false, 
        error: 'Review content cannot be empty' 
      };
    }

    if (title.trim().length > 200) {
      return { 
        success: false, 
        error: 'Review title is too long (maximum 200 characters)' 
      };
    }

    const reviewId = parseInt(id.trim(), 10);
    if (isNaN(reviewId) || reviewId <= 0) {
      return { 
        success: false, 
        error: 'Invalid review ID format' 
      };
    }

    // Update content and title in parallel for better performance
    // Using the correct API structure: review_id and new_content/new_title
    const [contentUpdate, titleUpdate] = await Promise.all([
      makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/Admin/adminManagement/UpdateReviewContent`,
        {
          method: 'POST',
          body: JSON.stringify({
            review_id: reviewId,
            new_content: content.trim()
          })
        }
      ),
      makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/Admin/adminManagement/UpdateReviewTitle`,
        {
          method: 'POST',
          body: JSON.stringify({
            review_id: reviewId,
            new_title: title.trim()
          })
        }
      )
    ]);

    if (process.env.NODE_ENV === 'development') {
      console.log('Review updated successfully:', {
        reviewId,
        titleLength: title.length,
        contentLength: content.length
      });
    }

    return { success: true };

  } catch (error) {
    console.error('Error in updateReview:', error);
    
    if (error instanceof ReviewApiError) {
      if (error.statusCode === 404) {
        return { 
          success: false, 
          error: 'Review not found' 
        };
      }
      if (error.statusCode === 403) {
        return { 
          success: false, 
          error: 'You do not have permission to update this review' 
        };
      }
      if (error.statusCode === 400) {
        return { 
          success: false, 
          error: 'Invalid request data. Please check your input and try again.' 
        };
      }
      return { 
        success: false, 
        error: `Failed to update review: ${error.message}` 
      };
    }

    return { 
      success: false, 
      error: 'An unexpected error occurred while updating the review' 
    };
  }
}

/**
 * Updates only the review content
 */
export async function updateReviewContent(
  reviewId: number,
  newContent: string
): Promise<ApiResponse<void>> {
  try {
    if (!newContent || newContent.trim() === '') {
      return { 
        success: false, 
        error: 'Review content cannot be empty' 
      };
    }

    if (reviewId <= 0) {
      return { 
        success: false, 
        error: 'Invalid review ID' 
      };
    }

    await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/Admin/adminManagement/UpdateReviewContent`,
      {
        method: 'POST',
        body: JSON.stringify({
          review_id: reviewId,
          new_content: newContent.trim()
        })
      }
    );

    return { success: true };

  } catch (error) {
    console.error('Error in updateReviewContent:', error);
    
    if (error instanceof ReviewApiError) {
      return { 
        success: false, 
        error: `Failed to update content: ${error.message}` 
      };
    }

    return { 
      success: false, 
      error: 'An unexpected error occurred while updating the content' 
    };
  }
}

/**
 * Updates only the review title
 */
export async function updateReviewTitle(
  reviewId: number,
  newTitle: string
): Promise<ApiResponse<void>> {
  try {
    if (!newTitle || newTitle.trim() === '') {
      return { 
        success: false, 
        error: 'Review title cannot be empty' 
      };
    }

    if (newTitle.trim().length > 200) {
      return { 
        success: false, 
        error: 'Review title is too long (maximum 200 characters)' 
      };
    }

    if (reviewId <= 0) {
      return { 
        success: false, 
        error: 'Invalid review ID' 
      };
    }

    await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/Admin/adminManagement/UpdateReviewTitle`,
      {
        method: 'POST',
        body: JSON.stringify({
          review_id: reviewId,
          new_title: newTitle.trim()
        })
      }
    );

    return { success: true };

  } catch (error) {
    console.error('Error in updateReviewTitle:', error);
    
    if (error instanceof ReviewApiError) {
      return { 
        success: false, 
        error: `Failed to update title: ${error.message}` 
      };
    }

    return { 
      success: false, 
      error: 'An unexpected error occurred while updating the title' 
    };
  }
}

/**
 * Utility function to validate review permissions (can be used for additional security checks)
 */
export async function validateReviewPermissions(reviewId: string): Promise<ApiResponse<boolean>> {
  try {
    const response = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/reviewId?review_id=${reviewId}`
    );

    // If we can fetch the review, user has at least read permissions
    return { success: true, data: true };

  } catch (error) {
    if (error instanceof ReviewApiError && error.statusCode === 403) {
      return { 
        success: false, 
        error: 'You do not have permission to access this review' 
      };
    }

    return { 
      success: false, 
      error: 'Unable to validate permissions' 
    };
  }
}