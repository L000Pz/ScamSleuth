"use server";

import { cookies } from 'next/headers';

export interface ScamReport {
  id: string;
  type: string;
  name: string;
  date: string;
  content_id: number;
}

export async function fetchScamReports() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { error: 'Authentication required' };
    }

    // Fetch scam types for mapping
    const scamTypesRes = await fetch('http://localhost:8080/Public/publicManager/scamTypes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      }
    });

    // Fetch all reviews
    const reviewsRes = await fetch('http://localhost:8080/Public/publicManager/allReviews', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      }
    });

    const [scamTypes, reviews] = await Promise.all([
      scamTypesRes.json(),
      reviewsRes.json()
    ]);

    // Create a map of scam type IDs to their names
    const scamTypeMap = new Map(
      scamTypes.map((type: any) => [type.scam_type_id, type.scam_type])
    );

    // Transform the data to match the ScamReport interface
    const transformedData: ScamReport[] = reviews.map((review: any) => ({
      id: review.review_id.toString(),
      type: scamTypeMap.get(review.scam_type_id) || 'Unknown',
      name: review.title,
      date: new Date(review.review_date).toLocaleDateString(),
      content_id: review.review_content_id
    }));

    return { data: transformedData };
  } catch (error) {
    console.error('Error fetching scam reports:', error);
    return { error: 'Failed to fetch scam reports' };
  }
}