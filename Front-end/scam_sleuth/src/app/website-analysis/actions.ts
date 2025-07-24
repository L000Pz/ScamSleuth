/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/website-analysis/actions.ts
'use server';

import { cookies } from 'next/headers';

export interface WebsiteAnalysisResponse {
  trustScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  positivePoints: string[];
  negativePoints: string[];
  description: string;
  technicalFlags: Record<string, number>;
}

export interface AnalysisResult {
  website: string;
  trustScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  positivePoints: string[];
  negativePoints: string[];
  description: string;
  lastChecked: string;
  technicalFlags: Record<string, number>;
  screenshotId?: string;
  screenshotUrl?: string;
  whoisData?: WhoisData;
  enamadData?: EnamadData;
}

export interface ScreenshotCaptureResponse {
  domain: string;
  id: string;
  message: string;
  status: string;
}

export interface ScreenshotResponse {
  success: boolean;
  screenshotId?: string;
  screenshotUrl?: string;
  error?: string;
}

export interface WhoisDomain {
  id?: string;
  domain: string;
  punycode?: string;
  name?: string;
  extension?: string;
  whois_server?: string;
  status?: string[];
  name_servers?: string[];
  created_date?: string;
  created_date_in_time?: string;
  updated_date?: string;
  updated_date_in_time?: string;
  expiration_date?: string;
  expiration_date_in_time?: string;
}

export interface WhoisRegistrar {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  referral_url?: string;
}

export interface WhoisContact {
  organization?: string;
  province?: string;
  country?: string;
  email?: string;
  name?: string;
  city?: string;
  phone?: string;
}

export interface WhoisData {
  domain: WhoisDomain;
  registrar?: WhoisRegistrar;
  registrant?: WhoisContact;
  administrative?: WhoisContact;
  technical?: WhoisContact;
}

export interface WhoisResponse {
  success: boolean;
  data?: WhoisData;
  error?: string;
}

export interface EnamadData {
  id: number;
  domain: string;
  nameper: string;
  approvedate: string;
  expdate: string;
  stateName: string;
  cityName: string;
  logolevel: number;
  srvText: string;
  Code: string;
  isNewProfile: boolean;
}

export interface EnamadResponse {
  success: boolean;
  data?: EnamadData;
  error?: string;
}

// URL Comment interfaces
export interface UrlComment {
  id: string;
  rating: number;
  comment: string;
  date: string;
  author?: string;
  helpful?: number;
  isAdminComment?: boolean;
}

export interface UrlCommentSubmission {
  url: string;
  root_id: number | null;
  rating?: number;
  comment_content: string;
}

export interface UrlCommentsResponse {
  success: boolean;
  data?: UrlComment[];
  error?: string;
}

export interface SubmitCommentResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface DeleteCommentResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// UserInfo interface to match the exact API response for ReturnByToken
interface UserInfo {
  admin_id?: number; // Optional, present for admins
  username: string;
  email: string;
  name: string;
  contact_info: string;
  bio: string | null;
  profile_picture_id: number;
  token: string;
  role: string; // The role is a string (e.g., "admin", "user")
  is_verified?: boolean; // Based on previous snippets, this might be present too
}

// Helper function to get user info from token using the specified API
async function getUserInfoFromToken(token: string): Promise<UserInfo | null> {
  try {
    const response = await fetch(
      `http://localhost:8080/IAM/authentication/ReturnByToken?token=${encodeURIComponent(token)}`,
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

    const response = await fetch('http://localhost:8080/AI/scraper/screenshot', {
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
    const response = await fetch(`http://localhost:8080/AI/scraper/screenshot/get?id=${screenshotId}`, {
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

    const response = await fetch(`http://localhost:8080/AI/scraper/screenshot/domain?domain=${cleanDomain}`, {
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

    const response = await fetch(`http://localhost:8080/AI/ai/whois/${cleanDomain}`, {
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

    const response = await fetch('http://localhost:8080/AI/scraper/enamad', {
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

    const response = await fetch(`http://localhost:8080/Public/publicManager/UrlComments?url=${encodeURIComponent(cleanUrl)}`, {
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

    const response = await fetch('http://localhost:8080/User/userManagement/WriteUrlComment', {
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

    const response = await fetch('http://localhost:8080/Admin/adminManagement/WriteUrlComment', {
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

    const response = await fetch(`http://localhost:8080/Admin/adminManagement/DeleteUrlComment?comment_id=${encodeURIComponent(commentId)}`, {
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

export async function analyzeWebsite(websiteUrl: string): Promise<{
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}> {
  try {
    const cleanUrl = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

    const response = await fetch(`http://localhost:8080/AI/ai/scan/${cleanUrl}`, {
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

    const [screenshotData, whoisData, enamadData] = await Promise.all([
      getLatestScreenshotByDomain(cleanUrl),
      getWhoisData(cleanUrl),
      getEnamadData(cleanUrl)
    ]);

    if (!screenshotData.screenshotUrl) {
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
      lastChecked: 'Just now',
      technicalFlags: apiData.technicalFlags || {},
      screenshotId: screenshotData.screenshotId,
      screenshotUrl: screenshotData.screenshotUrl,
      whoisData: whoisData.success ? whoisData.data : undefined,
      enamadData: enamadData.success ? enamadData.data : undefined
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