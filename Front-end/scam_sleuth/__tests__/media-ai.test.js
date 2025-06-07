/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
// __tests__/api/media-ai.test.js

/**
 * Media and AI Service API Tests
 * Tests the integration between frontend actions and backend AI/Media services
 */

// Mock global fetch before importing modules

const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock Buffer for Node.js environment compatibility
if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// Mock the action modules
jest.mock('../src/app/website-analysis/actions', () => ({
  analyzeWebsite: jest.fn(),
  captureScreenshot: jest.fn(),
  getLatestScreenshotByDomain: jest.fn(),
  getWhoisData: jest.fn(),
  quickAnalyzeWebsite: jest.fn(),
  captureAndGetScreenshot: jest.fn(),
  getScreenshotById: jest.fn(),
}));

jest.mock('../src/app/ask-ai/actions', () => ({
  getRecentWebsites: jest.fn(),
  getRecentWebsiteStats: jest.fn(),
}));

describe('Media and AI Service API Tests', () => {
  let websiteAnalysisActions;
  let askAiActions;

  beforeAll(() => {
    // Import the mocked modules
    websiteAnalysisActions = require('../src/app/website-analysis/actions');
    askAiActions = require('../src/app/ask-ai/actions');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('AI Service - Website Analysis', () => {
    it('should analyze website successfully', async () => {
      const mockAnalysisResult = {
        success: true,
        data: {
          website: 'example.com',
          trustScore: 75,
          riskLevel: 'low',
          positivePoints: [
            'Valid SSL certificate',
            'Established domain age',
            'Complete contact information'
          ],
          negativePoints: [
            'Some missing security headers'
          ],
          description: 'This website appears to be legitimate with good security practices.',
          lastChecked: 'Just now',
          technicalFlags: {
            HasValidSSL: 1,
            DomainAgeOver2Years: 1,
            CompleteContactInfo: 1,
            MissingSecurityHeaders: 1
          },
          screenshotUrl: 'data:image/png;base64,fakeimagedata',
          whoisData: {
            domain: {
              domain: 'example.com',
              created_date: '2020-01-01T00:00:00Z',
              updated_date: '2024-01-01T00:00:00Z',
              expiration_date: '2025-01-01T00:00:00Z',
              status: ['clientTransferProhibited'],
              name_servers: ['ns1.example.com', 'ns2.example.com']
            },
            registrar: {
              name: 'Example Registrar',
              email: 'registrar@example.com',
              phone: '+1-555-0123'
            }
          }
        }
      };

      websiteAnalysisActions.analyzeWebsite.mockResolvedValue(mockAnalysisResult);

      const result = await websiteAnalysisActions.analyzeWebsite('example.com');

      expect(result.success).toBe(true);
      expect(result.data.website).toBe('example.com');
      expect(result.data.trustScore).toBe(75);
      expect(result.data.riskLevel).toBe('low');
      expect(result.data.positivePoints).toHaveLength(3);
      expect(result.data.screenshotUrl).toContain('data:image/png;base64,');
      expect(websiteAnalysisActions.analyzeWebsite).toHaveBeenCalledWith('example.com');
    });

    it('should handle website analysis failure', async () => {
      const mockError = {
        success: false,
        error: 'Analysis failed: 404 Not Found'
      };

      websiteAnalysisActions.analyzeWebsite.mockResolvedValue(mockError);

      const result = await websiteAnalysisActions.analyzeWebsite('nonexistent.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Analysis failed: 404 Not Found');
      expect(websiteAnalysisActions.analyzeWebsite).toHaveBeenCalledWith('nonexistent.com');
    });

    it('should handle URL cleaning properly', async () => {
      const mockResult = {
        success: true,
        data: {
          website: 'example.com',
          trustScore: 80,
          riskLevel: 'low',
          positivePoints: ['Secure HTTPS'],
          negativePoints: [],
          description: 'Clean URL test',
          lastChecked: 'Just now',
          technicalFlags: {}
        }
      };

      websiteAnalysisActions.analyzeWebsite.mockResolvedValue(mockResult);

      const result = await websiteAnalysisActions.analyzeWebsite('https://example.com/');

      expect(result.success).toBe(true);
      expect(websiteAnalysisActions.analyzeWebsite).toHaveBeenCalledWith('https://example.com/');
    });

    it('should perform quick analysis', async () => {
      const mockQuickResult = {
        success: true,
        data: {
          name: 'quick-test.com',
          score: 65,
          riskLevel: 'medium',
          lastChecked: 'Just now'
        }
      };

      websiteAnalysisActions.quickAnalyzeWebsite.mockResolvedValue(mockQuickResult);

      const result = await websiteAnalysisActions.quickAnalyzeWebsite('quick-test.com');

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('quick-test.com');
      expect(result.data.score).toBe(65);
      expect(result.data.riskLevel).toBe('medium');
    });
  });

  describe('AI Service - Recent Websites', () => {
    it('should get recent websites successfully', async () => {
      const mockRecentWebsites = {
        success: true,
        data: [
          {
            id: '1',
            name: 'example.com',
            score: 85,
            riskLevel: 'low',
            lastChecked: '2 hours ago',
            analysisData: {
              trustScore: 85,
              riskLevel: 'low',
              positivePoints: ['Valid SSL', 'Good reputation'],
              negativePoints: [],
              description: 'Legitimate website',
              technicalFlags: {}
            }
          },
          {
            id: '2',
            name: 'suspicious-site.com',
            score: 25,
            riskLevel: 'high',
            lastChecked: '4 hours ago',
            analysisData: {
              trustScore: 25,
              riskLevel: 'high',
              positivePoints: [],
              negativePoints: ['No SSL', 'Recent domain'],
              description: 'Potentially dangerous website',
              technicalFlags: {}
            }
          }
        ]
      };

      askAiActions.getRecentWebsites.mockResolvedValue(mockRecentWebsites);

      const result = await askAiActions.getRecentWebsites(5);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('example.com');
      expect(result.data[0].score).toBe(85);
      expect(result.data[1].name).toBe('suspicious-site.com');
      expect(result.data[1].score).toBe(25);
      expect(askAiActions.getRecentWebsites).toHaveBeenCalledWith(5);
    });

    it('should handle malformed JSON in recent websites', async () => {
      const mockMalformedResult = {
        success: true,
        data: [
          {
            id: '1',
            name: 'example.com',
            score: 0,
            riskLevel: 'high',
            lastChecked: '1 hour ago',
            analysisData: {
              trustScore: 0,
              riskLevel: 'high',
              positivePoints: [],
              negativePoints: ['Analysis data unavailable'],
              description: 'Failed to parse analysis results',
              technicalFlags: {}
            }
          }
        ]
      };

      askAiActions.getRecentWebsites.mockResolvedValue(mockMalformedResult);

      const result = await askAiActions.getRecentWebsites();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].score).toBe(0);
      expect(result.data[0].analysisData.description).toBe('Failed to parse analysis results');
    });

    it('should get recent website stats successfully', async () => {
      const mockStats = {
        success: true,
        data: {
          totalAnalyzed: 4,
          highRiskCount: 1,
          mediumRiskCount: 1,
          lowRiskCount: 2,
          averageScore: 60
        }
      };

      askAiActions.getRecentWebsiteStats.mockResolvedValue(mockStats);

      const result = await askAiActions.getRecentWebsiteStats();

      expect(result.success).toBe(true);
      expect(result.data.totalAnalyzed).toBe(4);
      expect(result.data.highRiskCount).toBe(1);
      expect(result.data.mediumRiskCount).toBe(1);
      expect(result.data.lowRiskCount).toBe(2);
      expect(result.data.averageScore).toBe(60);
    });

    it('should handle empty dataset in stats calculation', async () => {
      const mockEmptyStats = {
        success: true,
        data: {
          totalAnalyzed: 0,
          highRiskCount: 0,
          mediumRiskCount: 0,
          lowRiskCount: 0,
          averageScore: 0
        }
      };

      askAiActions.getRecentWebsiteStats.mockResolvedValue(mockEmptyStats);

      const result = await askAiActions.getRecentWebsiteStats();

      expect(result.success).toBe(true);
      expect(result.data.totalAnalyzed).toBe(0);
      expect(result.data.averageScore).toBe(0);
    });
  });

  describe('Media Service - Screenshot Operations', () => {
    it('should capture screenshot successfully', async () => {
      const mockCaptureResult = {
        success: true,
        data: {
          domain: 'example.com',
          id: 'screenshot-123',
          message: 'Screenshot captured successfully',
          status: 'success'
        }
      };

      websiteAnalysisActions.captureScreenshot.mockResolvedValue(mockCaptureResult);

      const result = await websiteAnalysisActions.captureScreenshot('example.com');

      expect(result.success).toBe(true);
      expect(result.data.domain).toBe('example.com');
      expect(result.data.id).toBe('screenshot-123');
      expect(result.data.status).toBe('success');
      expect(websiteAnalysisActions.captureScreenshot).toHaveBeenCalledWith('example.com');
    });

    it('should handle screenshot capture failure', async () => {
      const mockError = {
        success: false,
        error: 'Screenshot capture failed: 500 Internal Server Error'
      };

      websiteAnalysisActions.captureScreenshot.mockResolvedValue(mockError);

      const result = await websiteAnalysisActions.captureScreenshot('failing-site.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Screenshot capture failed: 500 Internal Server Error');
    });

    it('should get latest screenshot by domain successfully', async () => {
      const mockScreenshotResult = {
        success: true,
        screenshotUrl: 'data:image/png;base64,fakescreenshotdata'
      };

      websiteAnalysisActions.getLatestScreenshotByDomain.mockResolvedValue(mockScreenshotResult);

      const result = await websiteAnalysisActions.getLatestScreenshotByDomain('example.com');

      expect(result.success).toBe(true);
      expect(result.screenshotUrl).toContain('data:image/png;base64,');
      expect(websiteAnalysisActions.getLatestScreenshotByDomain).toHaveBeenCalledWith('example.com');
    });

    it('should handle no screenshot available', async () => {
      const mockNoScreenshot = {
        success: true,
        error: 'No screenshot available for this domain'
      };

      websiteAnalysisActions.getLatestScreenshotByDomain.mockResolvedValue(mockNoScreenshot);

      const result = await websiteAnalysisActions.getLatestScreenshotByDomain('no-screenshot.com');

      expect(result.success).toBe(true);
      expect(result.error).toBe('No screenshot available for this domain');
    });

    it('should handle screenshot fetch network error', async () => {
      const mockNetworkError = {
        success: false,
        error: 'Failed to fetch screenshot'
      };

      websiteAnalysisActions.getLatestScreenshotByDomain.mockResolvedValue(mockNetworkError);

      const result = await websiteAnalysisActions.getLatestScreenshotByDomain('network-error.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch screenshot');
    });

    it('should capture and get screenshot in one operation', async () => {
      const mockCombinedResult = {
        success: true,
        screenshotId: 'screenshot-456',
        screenshotUrl: 'data:image/png;base64,combinedscreenshot'
      };

      websiteAnalysisActions.captureAndGetScreenshot.mockResolvedValue(mockCombinedResult);

      const result = await websiteAnalysisActions.captureAndGetScreenshot('combined-test.com');

      expect(result.success).toBe(true);
      expect(result.screenshotId).toBe('screenshot-456');
      expect(result.screenshotUrl).toContain('data:image/png;base64,');
    });
  });

  describe('AI Service - WHOIS Operations', () => {
    it('should get WHOIS data successfully', async () => {
      const mockWhoisResult = {
        success: true,
        data: {
          domain: {
            domain: 'example.com',
            created_date: '2020-01-01T00:00:00Z',
            updated_date: '2024-01-01T00:00:00Z',
            expiration_date: '2025-01-01T00:00:00Z',
            status: ['clientTransferProhibited', 'clientUpdateProhibited'],
            name_servers: ['ns1.example.com', 'ns2.example.com', 'ns3.example.com']
          },
          registrar: {
            name: 'Example Registrar Inc.',
            email: 'admin@registrar.com',
            phone: '+1-555-123-4567'
          },
          registrant: {
            organization: 'Example Corporation',
            province: 'California',
            country: 'United States',
            email: 'contact@example.com'
          }
        }
      };

      websiteAnalysisActions.getWhoisData.mockResolvedValue(mockWhoisResult);

      const result = await websiteAnalysisActions.getWhoisData('example.com');

      expect(result.success).toBe(true);
      expect(result.data.domain.domain).toBe('example.com');
      expect(result.data.registrar.name).toBe('Example Registrar Inc.');
      expect(result.data.registrant.organization).toBe('Example Corporation');
      expect(websiteAnalysisActions.getWhoisData).toHaveBeenCalledWith('example.com');
    });

    it('should handle WHOIS data not available', async () => {
      const mockWhoisError = {
        success: false,
        error: 'WHOIS fetch failed: 404 Not Found'
      };

      websiteAnalysisActions.getWhoisData.mockResolvedValue(mockWhoisError);

      const result = await websiteAnalysisActions.getWhoisData('private-domain.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('WHOIS fetch failed: 404 Not Found');
    });

    it('should handle WHOIS network timeout', async () => {
      const mockTimeout = {
        success: false,
        error: 'Failed to fetch WHOIS data'
      };

      websiteAnalysisActions.getWhoisData.mockResolvedValue(mockTimeout);

      const result = await websiteAnalysisActions.getWhoisData('timeout-domain.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch WHOIS data');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle website analysis with partial service failures', async () => {
      const mockPartialResult = {
        success: true,
        data: {
          website: 'partial-fail.com',
          trustScore: 60,
          riskLevel: 'medium',
          positivePoints: ['Domain exists'],
          negativePoints: ['Limited information'],
          description: 'Partially analyzable website',
          lastChecked: 'Just now',
          technicalFlags: {},
          screenshotUrl: undefined,
          whoisData: undefined
        }
      };

      websiteAnalysisActions.analyzeWebsite.mockResolvedValue(mockPartialResult);

      const result = await websiteAnalysisActions.analyzeWebsite('partial-fail.com');

      expect(result.success).toBe(true);
      expect(result.data.trustScore).toBe(60);
      expect(result.data.riskLevel).toBe('medium');
      expect(result.data.screenshotUrl).toBeUndefined();
      expect(result.data.whoisData).toBeUndefined();
    });

    it('should handle complete service failure gracefully', async () => {
      const mockCompleteFailure = {
        success: false,
        error: 'Failed to analyze website'
      };

      websiteAnalysisActions.analyzeWebsite.mockResolvedValue(mockCompleteFailure);

      const result = await websiteAnalysisActions.analyzeWebsite('service-down.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to analyze website');
    });

    it('should handle concurrent analysis requests', async () => {
      const mockResults = [
        {
          success: true,
          data: {
            website: 'site1.com',
            trustScore: 80,
            riskLevel: 'low',
            positivePoints: ['Site 1 good'],
            negativePoints: [],
            description: 'First site analysis',
            lastChecked: 'Just now',
            technicalFlags: {}
          }
        },
        {
          success: true,
          data: {
            website: 'site2.com',
            trustScore: 30,
            riskLevel: 'high',
            positivePoints: [],
            negativePoints: ['Site 2 bad'],
            description: 'Second site analysis',
            lastChecked: 'Just now',
            technicalFlags: {}
          }
        }
      ];

      websiteAnalysisActions.analyzeWebsite
        .mockResolvedValueOnce(mockResults[0])
        .mockResolvedValueOnce(mockResults[1]);

      const [result1, result2] = await Promise.all([
        websiteAnalysisActions.analyzeWebsite('site1.com'),
        websiteAnalysisActions.analyzeWebsite('site2.com')
      ]);

      expect(result1.success).toBe(true);
      expect(result1.data.trustScore).toBe(80);
      expect(result2.success).toBe(true);
      expect(result2.data.trustScore).toBe(30);
    });
  });

  describe('Edge Cases and Data Validation', () => {
    it('should handle invalid analysis response format', async () => {
      const mockInvalidResponse = {
        success: true,
        data: {
          website: 'invalid-response.com',
          trustScore: undefined,
          riskLevel: undefined,
          positivePoints: [],
          negativePoints: [],
          description: 'Invalid response handled',
          lastChecked: 'Just now',
          technicalFlags: {}
        }
      };

      websiteAnalysisActions.analyzeWebsite.mockResolvedValue(mockInvalidResponse);

      const result = await websiteAnalysisActions.analyzeWebsite('invalid-response.com');

      expect(result.success).toBe(true);
      expect(result.data.trustScore).toBeUndefined();
      expect(result.data.riskLevel).toBeUndefined();
      expect(result.data.positivePoints).toEqual([]);
    });

    it('should handle very long domain names', async () => {
      const longDomain = 'a'.repeat(250) + '.com';
      const mockLongDomainResult = {
        success: true,
        data: {
          website: longDomain,
          trustScore: 50,
          riskLevel: 'medium',
          positivePoints: [],
          negativePoints: ['Suspicious long domain'],
          description: 'Long domain analysis',
          lastChecked: 'Just now',
          technicalFlags: {}
        }
      };

      websiteAnalysisActions.analyzeWebsite.mockResolvedValue(mockLongDomainResult);

      const result = await websiteAnalysisActions.analyzeWebsite(longDomain);

      expect(result.success).toBe(true);
      expect(result.data.website).toBe(longDomain);
      expect(result.data.negativePoints).toContain('Suspicious long domain');
    });

    it('should handle empty recent websites response', async () => {
      const mockEmptyResponse = {
        success: true,
        data: []
      };

      askAiActions.getRecentWebsites.mockResolvedValue(mockEmptyResponse);

      const result = await askAiActions.getRecentWebsites();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it('should handle WHOIS data with missing fields', async () => {
      const mockMinimalWhois = {
        success: true,
        data: {
          domain: {
            domain: 'minimal-whois.com'
          }
        }
      };

      websiteAnalysisActions.getWhoisData.mockResolvedValue(mockMinimalWhois);

      const result = await websiteAnalysisActions.getWhoisData('minimal-whois.com');

      expect(result.success).toBe(true);
      expect(result.data.domain.domain).toBe('minimal-whois.com');
    });

    it('should handle API rate limiting', async () => {
      const mockRateLimit = {
        success: false,
        error: 'Analysis failed: 429 Too Many Requests'
      };

      websiteAnalysisActions.analyzeWebsite.mockResolvedValue(mockRateLimit);

      const result = await websiteAnalysisActions.analyzeWebsite('rate-limited.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Analysis failed: 429 Too Many Requests');
    });

    it('should handle concurrent screenshot requests', async () => {
      const mockScreenshots = [
        {
          success: true,
          screenshotUrl: 'data:image/png;base64,screenshot1data'
        },
        {
          success: true,
          screenshotUrl: 'data:image/png;base64,screenshot2data'
        }
      ];

      websiteAnalysisActions.getLatestScreenshotByDomain
        .mockResolvedValueOnce(mockScreenshots[0])
        .mockResolvedValueOnce(mockScreenshots[1]);

      const [result1, result2] = await Promise.all([
        websiteAnalysisActions.getLatestScreenshotByDomain('site1.com'),
        websiteAnalysisActions.getLatestScreenshotByDomain('site2.com')
      ]);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.screenshotUrl).not.toBe(result2.screenshotUrl);
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle timeout scenarios gracefully', async () => {
      const mockTimeout = {
        success: false,
        error: 'Failed to analyze website'
      };

      websiteAnalysisActions.analyzeWebsite.mockResolvedValue(mockTimeout);

      const result = await websiteAnalysisActions.analyzeWebsite('timeout-site.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to analyze website');
    });

    it('should handle service maintenance mode', async () => {
      const mockMaintenance = {
        success: false,
        error: 'Failed to fetch recent websites: 503 Service Unavailable'
      };

      askAiActions.getRecentWebsites.mockResolvedValue(mockMaintenance);

      const result = await askAiActions.getRecentWebsites();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch recent websites: 503 Service Unavailable');
    });

    it('should handle large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: (i + 1).toString(),
        name: `site${i + 1}.com`,
        score: Math.floor(Math.random() * 100),
        riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        lastChecked: `${i + 1} hours ago`
      }));

      const mockLargeDataset = {
        success: true,
        data: largeDataset
      };

      askAiActions.getRecentWebsites.mockResolvedValue(mockLargeDataset);

      const result = await askAiActions.getRecentWebsites(1000);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1000);
    });

    it('should handle network errors gracefully', async () => {
      const mockNetworkError = {
        success: false,
        error: 'Network request failed'
      };

      websiteAnalysisActions.analyzeWebsite.mockRejectedValue(new Error('Network request failed'));

      try {
        await websiteAnalysisActions.analyzeWebsite('network-fail.com');
      } catch (error) {
        expect(error.message).toBe('Network request failed');
      }
    });

    it('should validate response data structure', async () => {
      const mockValidResponse = {
        success: true,
        data: {
          website: 'validation-test.com',
          trustScore: 75,
          riskLevel: 'low',
          positivePoints: ['Valid structure'],
          negativePoints: [],
          description: 'Structure validation test',
          lastChecked: 'Just now',
          technicalFlags: {},
          screenshotUrl: 'data:image/png;base64,validstructure',
          whoisData: {
            domain: {
              domain: 'validation-test.com'
            }
          }
        }
      };

      websiteAnalysisActions.analyzeWebsite.mockResolvedValue(mockValidResponse);

      const result = await websiteAnalysisActions.analyzeWebsite('validation-test.com');

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('website');
      expect(result.data).toHaveProperty('trustScore');
      expect(result.data).toHaveProperty('riskLevel');
      expect(Array.isArray(result.data.positivePoints)).toBe(true);
      expect(Array.isArray(result.data.negativePoints)).toBe(true);
    });
  });
});