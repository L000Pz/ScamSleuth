"use server";

import { cookies } from 'next/headers';

export interface PublicReviewResponse {
  review: {
    review_id: number;
    title: string;
    scam_type_id: number;
    review_date: string;
    review_content_id: number;
  };
  content: {
    review_content_id: number;
    review_content: string;
  };
  admin_Review: {
    admin_id: number;
    review_id: number;
  };
  media: Array<any>;
}

export async function getPublicReview(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'No token found' };
    }

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

    const transformedReview = {
      id: reviewData.review.review_id.toString(),
      title: reviewData.review.title,
      date: new Date(reviewData.review.review_date).toLocaleDateString(),
      content: reviewData.content.review_content,
      media: reviewData.media
    };

    return { success: true, data: transformedReview };
  } catch (error) {
    console.error('Error in getPublicReview:', error);
    return { success: false, error: 'Failed to fetch review' };
  }
}

export async function deleteReview(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
 
    if (!token) {
      return { success: false, error: 'No token found' };
    }
 
    const deleteRes = await fetch(`http://localhost:8080/Admin/adminManagement/DeleteReview?reviewId=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*'
      }
    });
 
    if (!deleteRes.ok) {
      console.error('Delete API call failed:', deleteRes.status);
      return { success: false, error: 'Failed to delete review' };
    }
 
    return { success: true };
  } catch (error) {
    console.error('Error in deleteReview:', error);
    return { success: false, error: 'Failed to delete review' };
  }
}

/**
 * Update a review's title and content
 * @param param0 Object containing id, title, and content
 * @returns Object with success status and optional error message
 */
export async function updateReview({ id, title, content }: { id: string; title: string; content: string }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    // First get the current review to get the content_id
    const reviewRes = await fetch(`http://localhost:8080/Public/publicManager/reviewId?review_id=${id}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*'
      },
      cache: 'no-store'
    });

    if (!reviewRes.ok) {
      console.error('API call failed:', reviewRes.status);
      return { success: false, error: 'Failed to fetch review data' };
    }

    const reviewData: PublicReviewResponse = await reviewRes.json();
    const contentId = reviewData.content.review_content_id;
    
    // Update the review content
    const updateContentRes = await fetch(`http://localhost:8080/Admin/adminManagement/UpdateReviewContent`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': '*/*'
      },
      body: JSON.stringify({
        review_content_id: contentId,
        review_content: content
      })
    });

    if (!updateContentRes.ok) {
      console.error('Update content API call failed:', updateContentRes.status);
      return { success: false, error: 'Failed to update review content' };
    }

    // Update the review title
    const updateTitleRes = await fetch(`http://localhost:8080/Admin/adminManagement/UpdateReviewTitle`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': '*/*'
      },
      body: JSON.stringify({
        review_id: parseInt(id),
        title: title
      })
    });

    if (!updateTitleRes.ok) {
      console.error('Update title API call failed:', updateTitleRes.status);
      return { success: false, error: 'Failed to update review title' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateReview:', error);
    return { success: false, error: 'Failed to update review' };
  }
}