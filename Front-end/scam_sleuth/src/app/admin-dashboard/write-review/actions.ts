"use server";

import { cookies } from 'next/headers';

interface ReviewData {
  content: string;
  title: string;
  scam_type_id: number;
  review_date: string;
  media: any[];
}

export async function getScamTypes() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    const response = await fetch('http://localhost:8080/Public/publicManager/scamTypes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Failed to fetch scam types:', response.status);
      return { success: false, error: 'Failed to fetch scam types' };
    }

    const scamTypes = await response.json();
    return { success: true, data: scamTypes };

  } catch (error) {
    console.error('Error in getScamTypes:', error);
    return { success: false, error: 'Failed to fetch scam types' };
  }
}

export async function submitReview(reviewData: ReviewData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    // Log the request body for debugging
    console.log('Submitting review with data:', JSON.stringify(reviewData, null, 2));

    const response = await fetch('http://localhost:8080/Admin/adminManagement/SubmitReport', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        title: reviewData.title,
        content: reviewData.content,
        scam_type_id: Number(reviewData.scam_type_id), // Ensure this is a number
        review_date: new Date().toISOString(), // Format: "2025-01-20T19:06:22.402Z"
        media: [] // Empty array as specified
      })
    });

    // Log the response status and headers for debugging
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      // For error responses, try to get the error message as text
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        text: errorText
      });
      return { 
        success: false, 
        error: `Failed to submit review (${response.status}). Server message: ${errorText.slice(0, 200)}...`
      };
    }

    // Only try to parse JSON for successful responses
    const result = await response.json();
    return { success: true, data: result };

  } catch (error: any) {
    console.error('Error in submitReview:', error);
    return { success: false, error: `Failed to submit review: ${error?.message || 'Unknown error'}` };
  }
}