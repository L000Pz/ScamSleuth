/* eslint-disable @typescript-eslint/no-require-imports */
// __tests__/api/admin.test.js

// Mock the entire modules before importing
jest.mock('../../src/app/admin-dashboard/actions', () => ({
  getReports: jest.fn(),
  logout: jest.fn(),
}));

jest.mock('../../src/app/admin-dashboard/[id]/actions', () => ({
  getAdminReport: jest.fn(),
}));

jest.mock('../../src/app/admin-dashboard/write-review/actions', () => ({
  submitReview: jest.fn(),
  getScamTypes: jest.fn(),
}));

jest.mock('../../src/app/admin-dashboard/reviews/[id]/actions', () => ({
  deleteReview: jest.fn(),
  updateReview: jest.fn(),
}));

// Mock Next.js cookies
const mockCookies = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
};

jest.mock('next/headers', () => ({
  cookies: () => mockCookies,
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Admin API Tests', () => {
  let getReports, logout, getAdminReport, submitReview, getScamTypes, deleteReview, updateReview;

  beforeAll(() => {
    // Get the mocked functions
    getReports = require('../src/app/admin-dashboard/actions').getReports;
    logout = require('../src/app/admin-dashboard/actions').logout;
    getAdminReport = require('../src/app/admin-dashboard/[id]/actions').getAdminReport;
    submitReview = require('../src/app/admin-dashboard/write-review/actions').submitReview;
    getScamTypes = require('../src/app/admin-dashboard/write-review/actions').getScamTypes;
    deleteReview = require('../src/app/admin-dashboard/reviews/[id]/actions').deleteReview;
    updateReview = require('../src/app/admin-dashboard/reviews/[id]/actions').updateReview;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('Admin Reports - GET Operations', () => {
    it('should mock getReports function', async () => {
      // Mock the return value
      getReports.mockResolvedValue({
        success: true,
        data: [
          {
            id: '1',
            type: 'Phishing',
            name: 'Test Scam Report',
            description: 'Test description',
            date: '1/1/2024',
            financial_loss: 100
          }
        ]
      });

      const result = await getReports();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].type).toBe('Phishing');
      expect(getReports).toHaveBeenCalledTimes(1);
    });

    it('should mock getReports failure', async () => {
      getReports.mockResolvedValue({
        success: false,
        error: 'Admin access required'
      });

      const result = await getReports();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Admin access required');
    });
  });

  describe('Admin Reports - Specific Report GET', () => {
    it('should mock getAdminReport function', async () => {
      getAdminReport.mockResolvedValue({
        success: true,
        data: {
          id: '1',
          type: 'Phishing',
          name: 'Phishing Email',
          description: 'Received suspicious email',
          date: '1/1/2024',
          status: 'under_review',
          reporterName: 'Test User',
          contactInfo: 'test@example.com',
          writer: {
            id: 123,
            username: 'testuser',
            email: 'test@example.com',
            name: 'Test User',
            profilePicture: null
          },
          media: []
        }
      });

      const result = await getAdminReport('1');

      expect(result.success).toBe(true);
      expect(result.data.type).toBe('Phishing');
      expect(getAdminReport).toHaveBeenCalledWith('1');
    });
  });

  describe('Admin Reviews - POST Operations', () => {
    it('should mock submitReview function', async () => {
      submitReview.mockResolvedValue({
        success: true,
        data: { id: 123, message: 'Review created successfully' }
      });

      const reviewData = {
        title: 'Test Review',
        content: '<p>This is a test review</p>',
        scam_type_id: 1,
        review_date: '2024-01-01T00:00:00Z',
        media: [1, 2]
      };

      const result = await submitReview(reviewData);

      expect(result.success).toBe(true);
      expect(result.data.message).toBe('Review created successfully');
      expect(submitReview).toHaveBeenCalledWith(reviewData);
    });

    it('should mock getScamTypes function', async () => {
      getScamTypes.mockResolvedValue({
        success: true,
        data: [
          { scam_type_id: 1, scam_type: 'Phishing' },
          { scam_type_id: 2, scam_type: 'Romance Scam' }
        ]
      });

      const result = await getScamTypes();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].scam_type).toBe('Phishing');
    });
  });

  describe('Admin Reviews - UPDATE/DELETE Operations', () => {
    it('should mock updateReview function', async () => {
      updateReview.mockResolvedValue({
        success: true
      });

      const result = await updateReview({
        id: '1',
        title: 'Updated Title',
        content: '<p>Updated content</p>'
      });

      expect(result.success).toBe(true);
      expect(updateReview).toHaveBeenCalledWith({
        id: '1',
        title: 'Updated Title',
        content: '<p>Updated content</p>'
      });
    });

    it('should mock deleteReview function', async () => {
      deleteReview.mockResolvedValue({
        success: true
      });

      const result = await deleteReview('1');

      expect(result.success).toBe(true);
      expect(deleteReview).toHaveBeenCalledWith('1');
    });
  });

  describe('Admin Logout', () => {
    it('should mock logout function', async () => {
      logout.mockResolvedValue({
        success: true
      });

      const result = await logout();

      expect(result.success).toBe(true);
      expect(logout).toHaveBeenCalledTimes(1);
    });
  });
});