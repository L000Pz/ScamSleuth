"use server";

import { cookies } from 'next/headers';

interface TransformedReview {
  id: string;
  type: string;
  name: string;
  date: string;
  rawDate: string;
  content_id: number;
}

function formatSmartDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

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
    year: 'numeric'
  });
}

export async function getReviews() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const scamTypesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/scamTypes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      }
    });

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
      date: formatSmartDate(review.review_date),
      rawDate: review.review_date,
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