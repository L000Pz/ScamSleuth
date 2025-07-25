/* eslint-disable @typescript-eslint/no-explicit-any */
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

    // Fetch scam types for mapping
    const scamTypesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/scamTypes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      }
    });

    // Fetch all reviews
    const reviewsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/allReviews`, {
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

// New function to search scam reports by title using the backend API
export async function searchScamReportsByTitle(input: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    // Encode the input for the URL
    const encodedInput = encodeURIComponent(input);
    const searchRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/Search?input=${encodedInput}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      }
    });

    if (!searchRes.ok) {
      throw new Error(`HTTP error! status: ${searchRes.status}`);
    }

    const searchResults = await searchRes.json();

    // Fetch scam types for mapping, similar to fetchScamReports
    const scamTypesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/scamTypes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      }
    });
    const scamTypes = await scamTypesRes.json();
    const scamTypeMap = new Map(
      scamTypes.map((type: any) => [type.scam_type_id, type.scam_type])
    );

    // Transform the search results to match the ScamReport interface
    const transformedData: ScamReport[] = searchResults.map((review: any) => ({
      id: review.review_id.toString(),
      type: scamTypeMap.get(review.scam_type_id) || 'Unknown',
      name: review.title,
      date: new Date(review.review_date).toLocaleDateString(),
      content_id: review.review_content_id
    }));

    return { data: transformedData };
  } catch (error) {
    console.error('Error searching scam reports by title:', error);
    return { error: 'Failed to search scam reports' };
  }
}
