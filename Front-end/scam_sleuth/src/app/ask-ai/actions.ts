'use server';

export interface TechnicalFlags {
  HasValidSSL?: number;
  DomainAgeOver2Years?: number;
  CompleteContactInfo?: number;
  EnamadCertified?: number;
  RegistrationTransparency?: number;
  MissingSecurityHeaders?: number;
  DomainAgeUnder1Year?: number;
  PrivateRegistration?: number;
  HiddenElementsCount?: number;
  IncompleteContactInfo?: number;
  RecentDomainRegistration?: number;
  MaskedWhoisInfo?: number;
  NoEnamadCertification?: number;
  CloudflareUsage?: number;
  DNSSECEnabled?: number;
  EnterpriseRegistrar?: number;
  EnterpriseSecurityLocks?: number;
  ReputableRegistrar?: number;
}

export interface WebsiteAnalysisData {
  trustScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  positivePoints: string[];
  negativePoints: string[];
  description: string;
  technicalFlags: TechnicalFlags;
}

export interface RecentWebsiteRecord {
  url_id: number;
  url: string;
  description: string; // JSON string that needs to be parsed
  search_date: string;
}

export interface RecentWebsitesResponse {
  count: number;
  records: RecentWebsiteRecord[];
  status: string;
}

export interface TransformedWebsite {
  id: string;
  name: string;
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastChecked: string;
  analysisData?: WebsiteAnalysisData;
}

/**
 * Fetches the 5 most recently analyzed websites
 */
export async function getRecentWebsites(limit: number = 5): Promise<{
  success: boolean;
  data?: TransformedWebsite[];
  error?: string;
}> {
  try {
    const response = await fetch(`http://localhost:6996/ai/urls/recent?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recent websites: ${response.status} ${response.statusText}`);
    }

    const data: RecentWebsitesResponse = await response.json();

    if (data.status !== 'success') {
      throw new Error('API returned error status');
    }

    // Transform the data to match our frontend interface
    const transformedWebsites: TransformedWebsite[] = data.records.map((record) => {
      let analysisData: WebsiteAnalysisData;
      
      try {
        // Parse the JSON description
        analysisData = JSON.parse(record.description);
      } catch (parseError) {
        console.error('Failed to parse analysis data for', record.url, parseError);
        // Fallback data if parsing fails
        analysisData = {
          trustScore: 0,
          riskLevel: 'high',
          positivePoints: [],
          negativePoints: ['Analysis data unavailable'],
          description: 'Failed to parse analysis results',
          technicalFlags: {}
        };
      }

      // Calculate time ago from search_date
      const searchDate = new Date(record.search_date);
      const now = new Date();
      const timeDiff = now.getTime() - searchDate.getTime();
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      
      let lastChecked: string;
      if (hoursAgo >= 24) {
        const daysAgo = Math.floor(hoursAgo / 24);
        lastChecked = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
      } else if (hoursAgo >= 1) {
        lastChecked = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
      } else if (minutesAgo >= 1) {
        lastChecked = `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
      } else {
        lastChecked = 'Just now';
      }

      return {
        id: record.url_id.toString(),
        name: record.url,
        score: analysisData.trustScore,
        riskLevel: analysisData.riskLevel,
        lastChecked,
        analysisData
      };
    });

    return {
      success: true,
      data: transformedWebsites
    };

  } catch (error) {
    console.error('Error fetching recent websites:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch recent websites'
    };
  }
}

/**
 * Get a summary of recent analysis statistics
 */
export async function getRecentWebsiteStats(): Promise<{
  success: boolean;
  data?: {
    totalAnalyzed: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    averageScore: number;
  };
  error?: string;
}> {
  try {
    const result = await getRecentWebsites(100);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to get website data'
      };
    }

    const websites = result.data;
    const totalAnalyzed = websites.length;
    
    const riskCounts = websites.reduce(
      (acc, website) => {
        acc[website.riskLevel]++;
        return acc;
      },
      { low: 0, medium: 0, high: 0 }
    );

    const averageScore = totalAnalyzed > 0 
      ? Math.round(websites.reduce((sum, website) => sum + website.score, 0) / totalAnalyzed)
      : 0;

    return {
      success: true,
      data: {
        totalAnalyzed,
        highRiskCount: riskCounts.high,
        mediumRiskCount: riskCounts.medium,
        lowRiskCount: riskCounts.low,
        averageScore
      }
    };

  } catch (error) {
    console.error('Error calculating website stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate statistics'
    };
  }
}