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
}

export async function analyzeWebsite(websiteUrl: string): Promise<{
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}> {
  try {
    // Clean the URL - remove protocol if present
    const cleanUrl = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    const response = await fetch(`http://localhost:6996/ai/scan/${cleanUrl}`, {
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

    // Transform API response to match our frontend interface
    const result: AnalysisResult = {
      website: cleanUrl,
      trustScore: apiData.trustScore,
      riskLevel: apiData.riskLevel,
      positivePoints: apiData.positivePoints || [],
      negativePoints: apiData.negativePoints || [],
      description: apiData.description,
      lastChecked: 'Just now',
      technicalFlags: apiData.technicalFlags || {}
    };

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('Website analysis error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze website'
    };
  }
}

// Quick analysis for search results (lighter version)
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