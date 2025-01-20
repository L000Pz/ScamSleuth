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