// src/app/website-analysis/actions.ts
'use server';

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
    
    // Check if the response contains an error
    if (data.error) {
      return {
        success: true,
        error: data.error === 'Failed to fetch data' 
          ? 'No Enamad certification found for this domain'
          : data.error
      };
    }

    // Validate that we have the expected Enamad data structure
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

    // Get existing screenshot, WHOIS, and Enamad data in parallel
    const [screenshotData, whoisData, enamadData] = await Promise.all([
      getLatestScreenshotByDomain(cleanUrl),
      getWhoisData(cleanUrl),
      getEnamadData(cleanUrl)
    ]);

    // Only capture new screenshot if none exists (do it in background)
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