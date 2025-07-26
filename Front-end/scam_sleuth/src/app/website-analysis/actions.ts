// actions.ts - MODIFIED
// src/app/website-analysis/actions.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { cookies } from 'next/headers';

// ... (all existing interfaces) ...

// Helper function to get user info from token using the specified API
async function getUserInfoFromToken(token: string): Promise<UserInfo | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/IAM/authentication/ReturnByToken?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: {
          'Accept': '*/*'
        },
        cache: 'no-store', // Ensure fresh data
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch user info from ReturnByToken: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: UserInfo = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user info from ReturnByToken:', error);
    return null;
  }
}

// NEW SERVER ACTION: Function to directly return isAdmin status for client components
export async function getIsAdminStatus(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return false; // Not authenticated
    }

    const userInfo = await getUserInfoFromToken(token);

    // Return true if userInfo exists and their role is 'admin'
    return userInfo?.role === 'admin';
  } catch (error) {
    console.error('Error in getIsAdminStatus server action:', error);
    return false; // Default to false on error
  }
}


export async function captureScreenshot(domain: string): Promise<{
  success: boolean;
  data?: ScreenshotCaptureResponse;
  error?: string;
}> {
  try {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/AI/scraper/screenshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain: cleanDomain
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Screenshot capture failed: ${response.status} ${response.statusText}`);
    }

    const data: ScreenshotCaptureResponse = await response.json();

    if (data.status !== 'success') {
      throw new Error(data.message || 'Screenshot capture failed');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Screenshot capture error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to capture screenshot'
    };
  }
}

export async function getScreenshotById(screenshotId: string): Promise<ScreenshotResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/AI/scraper/screenshot/get?id=${screenshotId}`, {
      method: 'GET',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Screenshot fetch failed: ${response.status} ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const base64String = Buffer.from(imageBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64String}`;

    return {
      success: true,
      screenshotId,
      screenshotUrl: dataUrl
    };
  } catch (error) {
    console.error('Screenshot fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch screenshot'
    };
  }
}

export async function getLatestScreenshotByDomain(domain: string): Promise<ScreenshotResponse> {
  try {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/AI/scraper/screenshot/domain?domain=${cleanDomain}`, {
      method: 'GET',
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: true,
          error: 'No screenshot available for this domain'
        };
      }
      throw new Error(`Screenshot fetch failed: ${response.status} ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const base64String = Buffer.from(imageBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64String}`;

    return {
      success: true,
      screenshotUrl: dataUrl
    };
  } catch (error) {
    console.error('Screenshot fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch screenshot'
    };
  }
}

export async function captureAndGetScreenshot(domain: string): Promise<ScreenshotResponse> {
  try {
    const captureResult = await captureScreenshot(domain);

    if (!captureResult.success || !captureResult.data) {
      return {
        success: false,
        error: captureResult.error || 'Failed to capture screenshot'
      };
    }

    const fetchResult = await getScreenshotById(captureResult.data.id);

    return {
      success: fetchResult.success,
      screenshotId: captureResult.data.id,
      screenshotUrl: fetchResult.screenshotUrl,
      error: fetchResult.error
    };
  } catch (error) {
    console.error('Capture and get screenshot error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to capture and fetch screenshot'
    };
  }
}

export async function getWhoisData(domain: string): Promise<WhoisResponse> {
  try {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/AI/ai/whois/${cleanDomain}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`WHOIS fetch failed: ${response.status} ${response.statusText}`);
    }

    const data: WhoisData = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('WHOIS fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch WHOIS data'
    };
  }
}

export async function getEnamadData(domain: string): Promise<EnamadResponse> {
  try {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/AI/scraper/enamad`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain: cleanDomain
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: true,
          error: 'No Enamad certification found for this domain'
        };
      }
      throw new Error(`Enamad fetch failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      return {
        success: true,
        error: data.error === 'Failed to fetch data'
          ? 'No Enamad certification found for this domain'
          : data.error
      };
    }

    if (!data.id || !data.domain) {
      return {
        success: true,
        error: 'No Enamad certification found for this domain'
      };
    }

    return { success: true, data: data as EnamadData };
  } catch (error) {
    console.error('Enamad fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Enamad data'
    };
  }
}

export async function getUrlComments(url: string): Promise<UrlCommentsResponse> {
  try {
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/UrlComments?url=${encodeURIComponent(cleanUrl)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: true,
          data: []
        };
      }
      throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();

    if (!Array.isArray(responseData)) {
      console.warn('Unexpected response format for comments:', responseData);
      return { success: true, data: [] };
    }

    const comments: UrlComment[] = responseData.map((item: any) => ({
      id: item.comments?.comment_id?.toString() || Date.now().toString(),
      rating: item.comments?.rating || 0,
      comment: item.comments?.comment_content || '',
      date: item.comments?.created_at ? new Date(item.comments.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown date',
      author: item.writerDetails?.username || 'Anonymous',
      isAdminComment: item.comments?.writer_role === 'admin'
    }));

    return {
      success: true,
      data: comments
    };
  } catch (error) {
    console.error('Error fetching URL comments:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch comments'
    };
  }
}

export async function submitUrlComment(commentData: UrlCommentSubmission): Promise<SubmitCommentResponse> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'Please login to submit a comment'
      };
    }

    const userInfo = await getUserInfoFromToken(token);

    if (!userInfo) {
      return {
        success: false,
        error: 'Invalid authentication. Please login again.'
      };
    }

    if (!userInfo.is_verified) { // Assuming is_verified is part of UserInfo
      return {
        success: false,
        error: 'Please verify your account to submit comments'
      };
    }

    const cleanUrl = commentData.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/User/userManagement/WriteUrlComment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*'
      },
      body: JSON.stringify({
        url: cleanUrl,
        root_id: commentData.root_id,
        rating: commentData.rating,
        comment_content: commentData.comment_content
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        text: errorText
      });

      if (response.status === 401) {
        return {
          success: false,
          error: 'Please login again to submit your comment'
        };
      }

      return {
        success: false,
        error: `Failed to submit comment: ${errorText || response.statusText}`
      };
    }

    const responseData = await response.text();

    const message = responseData.startsWith('"') && responseData.endsWith('"')
      ? responseData.slice(1, -1)
      : responseData;

    return {
      success: true,
      message: message || 'Comment submitted successfully!'
    };

  } catch (error) {
    console.error('Error submitting URL comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit comment'
    };
  }
}

export async function submitAdminUrlComment(commentData: UrlCommentSubmission): Promise<SubmitCommentResponse> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'Admin authentication required.'
      };
    }

    const userInfo = await getUserInfoFromToken(token);

    if (!userInfo || userInfo.role !== 'admin') {
      return {
        success: false,
        error: 'Unauthorized: Admin privileges required.'
      };
    }

    const cleanUrl = commentData.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Admin/adminManagement/WriteUrlComment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*'
      },
      body: JSON.stringify({
        url: cleanUrl,
        root_id: commentData.root_id,
        comment_content: commentData.comment_content
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Admin API Error Response:', {
        status: response.status,
        text: errorText
      });

      if (response.status === 401) {
        return {
          success: false,
          error: 'Admin authentication expired. Please re-login.'
        };
      }

      return {
        success: false,
        error: `Failed to submit admin comment: ${errorText || response.statusText}`
      };
    }

    const responseData = await response.text();
    const message = responseData.startsWith('"') && responseData.endsWith('"')
      ? responseData.slice(1, -1)
      : responseData;

    return {
      success: true,
      message: message || 'Admin comment submitted successfully.'
    };

  } catch (error) {
    console.error('Error submitting admin URL comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit admin comment'
    };
  }
}


export async function deleteUrlComment(commentId: string): Promise<DeleteCommentResponse> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'Admin authentication required to delete comments.'
      };
    }

    const userInfo = await getUserInfoFromToken(token);

    if (!userInfo || userInfo.role !== 'admin') {
      return {
        success: false,
        error: 'Unauthorized: Admin privileges required to delete comments.'
      };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Admin/adminManagement/DeleteUrlComment?comment_id=${encodeURIComponent(commentId)}`, {
      method: 'DELETE',
      headers: {
        'Accept': '*/*',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        text: errorText
      });
      return {
        success: false,
        error: `Failed to delete comment: ${errorText || response.statusText}`
      };
    }

    const responseData = await response.text();
    const message = responseData.startsWith('"') && responseData.endsWith('"')
      ? responseData.slice(1, -1)
      : responseData;

    return {
      success: true,
      message: message || 'Comment deleted successfully.'
    };

  } catch (error) {
    console.error('Error deleting comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete comment'
    };
  }
}

export async function getOverallUrlRatings(url: string): Promise<UrlRatingsResponse> {
  try {
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/UrlRatings?url=${encodeURIComponent(cleanUrl)}`, {
      method: 'GET',
      headers: {
        'Accept': '*/*'
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Return default stats if no ratings are found, not an error
        return { success: true, data: { average: 0, count: 0, five_count: 0, four_count: 0, three_count: 0, two_count: 0, one_count: 0 } };
      }
      throw new Error(`Failed to fetch URL ratings: ${response.status} ${response.statusText}`);
    }

    const data: ReviewStats = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching URL ratings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch URL ratings'
    };
  }
}


export async function analyzeWebsite(websiteUrl: string): Promise<{
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}> {
  try {
    const cleanUrl = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/AI/ai/scan/${cleanUrl}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
    }

    const apiData: WebsiteAnalysisResponse = await response.json();

    // Fetch screenshot, whois, enamad, and review stats in parallel
    const [screenshotResult, whoisResult, enamadResult, reviewStatsResult] = await Promise.all([
      getLatestScreenshotByDomain(cleanUrl),
      getWhoisData(cleanUrl),
      getEnamadData(cleanUrl),
      getOverallUrlRatings(cleanUrl)
    ]);

    // If no screenshot is immediately available, trigger a background capture
    if (!screenshotResult.screenshotUrl) {
      captureScreenshot(cleanUrl).catch(error => {
        console.warn('Background screenshot capture failed:', error);
      });
    }

    const result: AnalysisResult = {
      website: cleanUrl,
      trustScore: apiData.trustScore,
      riskLevel: apiData.riskLevel,
      positivePoints: apiData.positivePoints || [],
      negativePoints: apiData.negativePoints || [],
      description: apiData.description,
      lastChecked: 'Just now', // This should ideally come from the API or be calculated if real-time
      technicalFlags: apiData.technicalFlags || {},
      screenshotId: screenshotResult.screenshotId,
      screenshotUrl: screenshotResult.screenshotUrl,
      whoisData: whoisResult.success ? whoisResult.data : undefined,
      enamadData: enamadResult.success ? enamadResult.data : undefined,
      reviewStats: reviewStatsResult.success ? reviewStatsResult.data : undefined, // Assign fetched review stats
    };

    return { success: true, data: result };
  } catch (error) {
    console.error('Website analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze website'
    };
  }
}

export async function quickAnalyzeWebsite(websiteUrl: string): Promise<{
  success: boolean;
  data?: {
    name: string;
    score: number;
    riskLevel: 'low' | 'medium' | 'high';
    lastChecked: string;
  };
  error?: string;
}> {
  try {
    const result = await analyzeWebsite(websiteUrl);

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Analysis failed'
      };
    }

    return {
      success: true,
      data: {
        name: result.data.website,
        score: result.data.trustScore,
        riskLevel: result.data.riskLevel,
        lastChecked: result.data.lastChecked
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Quick analysis failed'
    };
  }
}