"use server";

import { cookies } from 'next/headers';

interface TransformedReview {
  id: string;
  type: string;
  name: string;
  date: string;
  content_id: number;
}

export async function getReviews() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    // First API call - Get scam types
    const scamTypesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/scamTypes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      }
    });

    // Second API call - Get reviews
    const reviewsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Admin/adminManagement/GetAdminReviews`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      }
    });

    const [scamTypes, reviews] = await Promise.all([
      scamTypesRes.json(),
      reviewsRes.json()
    ]);

    const scamTypeMap = new Map(
      scamTypes.map((type: any) => [type.scam_type_id, type.scam_type])
    );

    const transformedData: TransformedReview[] = reviews.map((review: any) => ({
      id: review.review_id.toString(),
      type: scamTypeMap.get(review.scam_type_id) || 'Unknown',
      name: review.title,
      date: new Date(review.review_date).toLocaleDateString(),
      content_id: review.review_content_id
    }));

    return { success: true, data: transformedData };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return { success: false, error: 'Failed to fetch reviews' };
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (token) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/IAM/authentication/Logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.warn('Backend logout failed, proceeding with cookie cleanup');
      }
    }

    cookieStore.delete('token');
    cookieStore.delete('userType');

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: 'Failed to logout' };
  }
}