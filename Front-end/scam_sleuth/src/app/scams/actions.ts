/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from 'next/headers';

export interface ScamReport {
  id: string;
  type: string;
  name: string;
  date: string;
  content_id: number;
  description?: string;
  imageUrl?: string;
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

    const transformedData: ScamReport[] = await Promise.all(
      reviews.map(async (review: any) => {
        let description = 'No description available';
        let imageUrl: string | undefined = undefined;

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

          if (reviewDetailResponse.ok) {
            const reviewDetail = await reviewDetailResponse.json();
            
            if (reviewDetail.content) {
              description = truncateText(reviewDetail.content, 100);
            }

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
                }
              } catch (mediaError) {
                console.error('Error fetching media:', mediaError);
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching details for review ${review.review_id}:`, error);
        }

        return {
          id: review.review_id.toString(),
          type: scamTypeMap.get(review.scam_type_id) || 'Unknown',
          name: review.title,
          date: new Date(review.review_date).toLocaleDateString(),
          content_id: review.review_content_id,
          description,
          imageUrl
        };
      })
    );

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

    const transformedData: ScamReport[] = await Promise.all(
      searchResults.map(async (review: any) => {
        let description = 'No description available';
        let imageUrl: string | undefined = undefined;

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

          if (reviewDetailResponse.ok) {
            const reviewDetail = await reviewDetailResponse.json();
            
            if (reviewDetail.content) {
              description = truncateText(reviewDetail.content, 100);
            }

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
                }
              } catch (mediaError) {
                console.error('Error fetching media:', mediaError);
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching details for review ${review.review_id}:`, error);
        }

        return {
          id: review.review_id.toString(),
          type: scamTypeMap.get(review.scam_type_id) || 'Unknown',
          name: review.title,
          date: new Date(review.review_date).toLocaleDateString(),
          content_id: review.review_content_id,
          description,
          imageUrl
        };
      })
    );

    return { data: transformedData };
  } catch (error) {
    console.error('Error searching scam reports by title:', error);
    return { error: 'Failed to search scam reports' };
  }
}