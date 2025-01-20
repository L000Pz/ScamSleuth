const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchScamReports(): Promise<{
  data: ScamReport[] | null;
  error: string | null;
}> {
  try {
    const response = await fetch('http://localhost:8080/Public/publicManager/allReviews', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching to always get fresh data
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching scam reports:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch scam reports'
    };
  }
}

// Types
export interface ScamReport {
  id: string;
  name: string;
  description: string;
  date: string;
  imageUrl: string;
}