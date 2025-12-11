/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { cookies } from 'next/headers';

interface AuthStatus {
  isAuthenticated: boolean;
  userType: string | null;
}

interface UserData {
  name: string;
  username?: string;
  email?: string;
  role?: string;
  is_verified?: boolean;
  profile_picture_id?: number | null;
}

export interface ScamReport {
  id: string;
  type: string;
  name: string;
  date: string;
  content_id: number;
}

export interface DetailedReview {
  id: number;
  name: string;
  description: string;
  date: string;
  scamType: string;
  imageUrl?: string;
}

async function getUserInfoFromToken(token: string): Promise<UserData | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/IAM/authentication/ReturnByToken?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: { 
          'Accept': '*/*' 
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}

export async function checkAuth(): Promise<AuthStatus> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  const userType = cookieStore.get('userType');

  return {
    isAuthenticated: !!token,
    userType: userType?.value || null
  };
}

export async function getUserData(): Promise<UserData | { name: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return { name: '[User]' };
    }

    const userInfo = await getUserInfoFromToken(token);
    
    if (!userInfo) {
      return { name: '[User]' };
    }

    return { 
      name: userInfo.name,
      username: userInfo.username,
      email: userInfo.email,
      role: userInfo.role,
      is_verified: userInfo.is_verified,
      profile_picture_id: userInfo.profile_picture_id
    };
  } catch (error) {
    console.error('Error in getUserData:', error);
    return { name: '[User]' };
  }
}

export async function logout(): Promise<{ success: boolean; message?: string }> {
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
        console.warn('Backend logout call failed, but will clear token anyway');
      }
    }
    
    cookieStore.delete('token');
    cookieStore.delete('userType');
    cookieStore.delete('isVerified');
    cookieStore.delete('userName');

    return {
      success: true
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: 'Failed to logout. Please try again.'
    };
  }
}

function stripHtml(html: string): string {
  let text = html.replace(/<[^>]*>/g, ' ');
  
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&rdquo;/g, '"');
  text = text.replace(/&ldquo;/g, '"');
  text = text.replace(/&rsquo;/g, "'");
  text = text.replace(/&lsquo;/g, "'");
  text = text.replace(/&mdash;/g, '—');
  text = text.replace(/&ndash;/g, '–');
  
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

function truncateText(text: string, maxLength: number = 100): string {
  const cleanText = stripHtml(text);
  
  if (!cleanText || cleanText.length === 0) {
    return 'No description available';
  }
  
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  const truncated = cleanText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  const finalText = lastSpace > maxLength - 20 
    ? truncated.substring(0, lastSpace) 
    : truncated;
  
  return finalText.trim() + '...';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
}

export async function getRecentReviews() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/recentReviews`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const reviews = await response.json();
    return { success: true, data: reviews };
  } catch (error) {
    console.error('Error fetching recent reviews:', error);
    return { success: false, error: 'Failed to fetch recent reviews' };
  }
}

export async function getDetailedReviews() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const scamTypesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/scamTypes`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        },
        cache: 'no-store'
      }
    );

    if (!scamTypesResponse.ok) {
      throw new Error('Failed to fetch scam types');
    }

    const scamTypes = await scamTypesResponse.json();
    const scamTypesMap: { [key: number]: string } = {};
    
    scamTypes.forEach((type: { scam_type_id: number; scam_type: string }) => {
      scamTypesMap[type.scam_type_id] = type.scam_type;
    });

    const recentResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/recentReviews`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        },
        cache: 'no-store'
      }
    );

    if (!recentResponse.ok) {
      throw new Error(`HTTP error! Status: ${recentResponse.status}`);
    }

    const recentReviews = await recentResponse.json();
    const limitedReviews = recentReviews.slice(0, 6);

    const detailedReviews: DetailedReview[] = await Promise.all(
      limitedReviews.map(async (review: any) => {
        try {
          const reviewDetailResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/reviewId?review_id=${review.review_id}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'accept': '*/*'
              },
              cache: 'no-store'
            }
          );

          if (!reviewDetailResponse.ok) {
            return {
              id: review.review_id,
              name: review.title,
              description: review.description || 'No description available',
              date: formatDate(review.review_date),
              scamType: scamTypesMap[review.scam_type_id] || 'Unknown',
            };
          }

          const reviewDetail = await reviewDetailResponse.json();
          
          const description = reviewDetail.content 
            ? truncateText(reviewDetail.content, 100) 
            : review.description || 'No description available';

          let imageUrl: string | undefined = undefined;
          
          if (reviewDetail.media && reviewDetail.media.length > 0) {
            const firstMediaId = reviewDetail.media[0].media_id;
            
            try {
              const mediaResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/Media/mediaManager/Get?id=${firstMediaId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': '*/*'
                  },
                  cache: 'no-store'
                }
              );

              if (mediaResponse.ok) {
                const arrayBuffer = await mediaResponse.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString('base64');
                const contentType = mediaResponse.headers.get('content-type') || 'image/jpeg';
                imageUrl = `data:${contentType};base64,${base64}`;
              } else {
                console.error(`Media fetch failed: ${mediaResponse.status}`);
              }
            } catch (mediaError) {
              console.error('Error fetching media:', mediaError);
            }
          }

          const scamTypeName = scamTypesMap[reviewDetail.review.scam_type_id] || 'Unknown';

          return {
            id: review.review_id,
            name: review.title,
            description,
            date: formatDate(review.review_date),
            scamType: scamTypeName,
            imageUrl,
          };
        } catch (error) {
          console.error(`Error fetching details for review ${review.review_id}:`, error);
          return {
            id: review.review_id,
            name: review.title,
            description: review.description || 'No description available',
            date: formatDate(review.review_date),
            scamType: scamTypesMap[review.scam_type_id] || 'Unknown',
          };
        }
      })
    );

    return { success: true, data: detailedReviews };
  } catch (error) {
    console.error('Error fetching detailed reviews:', error);
    return { success: false, error: 'Failed to fetch detailed reviews' };
  }
}

export async function fetchScamReports() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const scamTypesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/scamTypes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      }
    });

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

    const scamTypeMap = new Map(
      scamTypes.map((type: any) => [type.scam_type_id, type.scam_type])
    );

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

export async function searchScamReportsByTitle(input: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

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