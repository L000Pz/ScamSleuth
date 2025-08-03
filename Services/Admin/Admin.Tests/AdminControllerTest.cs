using System.Net;
using System.Text;
using Admin.Application.AdminManagement;
using Admin.Contracts;
using Admin.Domain;
using Admin.Presentation.Controllers;
using Admin.Presentation.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Moq.Protected;
using Newtonsoft.Json;
using Xunit;

namespace Admin.Tests
{
    public class AdminControllerTests
    {
        private readonly Mock<IShowAllReports> _mockShowAllReports;
        private readonly Mock<IGetAdminReviews> _mockGetAdminReviews;
        private readonly Mock<ICreateReview> _mockCreateReview;
        private readonly Mock<IDeleteReview> _mockDeleteReview;
        private readonly Mock<IGetReportById> _mockGetReportById;
        private readonly Mock<IUpdateReview> _mockUpdateReview;
        private readonly Mock<IDeleteReviewComment> _mockDeleteReviewComment;
        private readonly Mock<IDeleteUrlComment> _mockDeleteUrlComment;
        private readonly Mock<IWriteUrlComment> _mockWriteUrlComment;
        private readonly Mock<IWriteReviewComment> _mockWriteReviewComment;
        private readonly Mock<IDeleteReport> _mockDeleteReport;
        private readonly Mock<IMessagePublisher> _mockMessagePublisher;
        private readonly Mock<HttpMessageHandler> _mockHttpMessageHandler;
        private readonly HttpClient _httpClient;
        private readonly AdminController _controller;
        private static readonly DateTime testDate = DateTime.Now;

        public AdminControllerTests()
        {
            _mockShowAllReports = new Mock<IShowAllReports>();
            _mockGetAdminReviews = new Mock<IGetAdminReviews>();
            _mockCreateReview = new Mock<ICreateReview>();
            _mockDeleteReview = new Mock<IDeleteReview>();
            _mockGetReportById = new Mock<IGetReportById>();
            _mockUpdateReview = new Mock<IUpdateReview>();
            _mockDeleteReviewComment = new Mock<IDeleteReviewComment>();
            _mockDeleteUrlComment = new Mock<IDeleteUrlComment>();
            _mockWriteUrlComment = new Mock<IWriteUrlComment>();
            _mockWriteReviewComment = new Mock<IWriteReviewComment>();
            _mockDeleteReport = new Mock<IDeleteReport>();
            _mockMessagePublisher = new Mock<IMessagePublisher>();
            _mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            _httpClient = new HttpClient(_mockHttpMessageHandler.Object);

            _controller = new AdminController(
                _httpClient,
                _mockShowAllReports.Object,
                _mockGetAdminReviews.Object,
                _mockCreateReview.Object,
                _mockDeleteReview.Object,
                _mockMessagePublisher.Object,
                _mockGetReportById.Object,
                _mockUpdateReview.Object,
                _mockDeleteReviewComment.Object,
                _mockDeleteUrlComment.Object,
                _mockWriteUrlComment.Object,
                _mockWriteReviewComment.Object,
                _mockDeleteReport.Object
            );

            // Setup controller context
            var httpContext = new DefaultHttpContext();
            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = httpContext
            };
        }

        private void SetupMockHttpMessageHandler(HttpStatusCode statusCode, string content, string expectedUrl = null)
        {
            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.Is<HttpRequestMessage>(req =>
                        expectedUrl == null || req.RequestUri.ToString().Contains(expectedUrl)),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = statusCode,
                    Content = new StringContent(content)
                });
        }

        #region ViewReports Tests

        [Fact]
        public async Task ViewReports_ValidToken_ReturnsOkResult()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            var reports = new List<Report>
            {
                Report.Create("Test Report 1", 1, testDate, testDate, 1000.00M, "Test Description 1"),
                Report.Create("Test Report 2", 2, testDate, testDate, 2000.00M, "Test Description 2")
            };

            _mockShowAllReports.Setup(x => x.Handle())
                .ReturnsAsync(reports);

            // Act
            var result = await _controller.ViewReports();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedReports = Assert.IsType<List<Report>>(okResult.Value);
            Assert.Equal(2, returnedReports.Count);
        }

        [Fact]
        public async Task ViewReports_InvalidToken_ReturnsBadRequest()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer invalid-token";
            SetupMockHttpMessageHandler(HttpStatusCode.Unauthorized, "unsuccessful");

            // Act
            var result = await _controller.ViewReports();

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("You don't have access to this property!", badRequestResult.Value);
        }

        [Fact]
        public async Task ViewReports_NoReports_ReturnsBadRequest()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            _mockShowAllReports.Setup(x => x.Handle())
                .ReturnsAsync((List<Report>)null);

            // Act
            var result = await _controller.ViewReports();

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("No reports were found!", badRequestResult.Value);
        }

        #endregion

        #region GetAdminReviews Tests

        [Fact]
        public async Task GetAdminReviews_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            var reviews = new List<Review>
            {
                Review.Create("Test Review 1", 1, 1, testDate, 1),
                Review.Create("Test Review 2", 1, 2, testDate, 2)
            };

            _mockGetAdminReviews.Setup(x => x.Handle("admin@example.com"))
                .ReturnsAsync(reviews);

            // Act
            var result = await _controller.GetReviews();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedReviews = Assert.IsType<List<Review>>(okResult.Value);
            Assert.Equal(2, returnedReviews.Count);
        }

        [Fact]
        public async Task GetAdminReviews_InvalidToken_ReturnsBadRequest()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer invalid-token";
            SetupMockHttpMessageHandler(HttpStatusCode.Unauthorized, "unsuccessful");

            // Act
            var result = await _controller.GetReviews();

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Authentication failed!", badRequestResult.Value);
        }

        [Fact]
        public async Task GetAdminReviews_NoReviews_ReturnsBadRequest()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            _mockGetAdminReviews.Setup(x => x.Handle("admin@example.com"))
                .ReturnsAsync((List<Review>)null);

            // Act
            var result = await _controller.GetReviews();

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("No reviews could be found!", badRequestResult.Value);
        }

        #endregion

        #region DeleteReview Tests

        [Fact]
        public async Task DeleteReview_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            var mediaIds = new List<int> { 1, 2 };
            _mockDeleteReview.Setup(x => x.Handle(1, "admin@example.com"))
                .ReturnsAsync(("ok", mediaIds));

            // Act
            var result = await _controller.DeleteReview(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Review deleted successfully.", okResult.Value);

            // Verify message publishing
            _mockMessagePublisher.Verify(x => x.PublishMediaDeletion(1), Times.Once);
            _mockMessagePublisher.Verify(x => x.PublishMediaDeletion(2), Times.Once);
        }

        [Fact]
        public async Task DeleteReview_InvalidToken_ReturnsBadRequest()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer invalid-token";
            SetupMockHttpMessageHandler(HttpStatusCode.Unauthorized, "unsuccessful");

            // Act
            var result = await _controller.DeleteReview(1);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Authentication failed!", badRequestResult.Value);
        }

        [Fact]
        public async Task DeleteReview_DeleteFailed_ReturnsBadRequest()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            _mockDeleteReview.Setup(x => x.Handle(1, "admin@example.com"))
                .ReturnsAsync(("failed", null));

            // Act
            var result = await _controller.DeleteReview(1);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Failed to delete review!", badRequestResult.Value);
        }

        #endregion

        #region DeleteReport Tests

        [Fact]
        public async Task DeleteReport_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            var mediaIds = new List<int> { 1, 2 };
            _mockDeleteReport.Setup(x => x.Handle(1, "admin@example.com"))
                .ReturnsAsync(("ok", mediaIds));

            // Act
            var result = await _controller.DeleteReport(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Report deleted successfully.", okResult.Value);

            // Verify message publishing
            _mockMessagePublisher.Verify(x => x.PublishMediaDeletion(1), Times.Once);
            _mockMessagePublisher.Verify(x => x.PublishMediaDeletion(2), Times.Once);
        }

        [Fact]
        public async Task DeleteReport_NoAccess_ReturnsBadRequest()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            _mockDeleteReport.Setup(x => x.Handle(1, "admin@example.com"))
                .ReturnsAsync(("access", null));

            // Act
            var result = await _controller.DeleteReport(1);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("You do not have access to report deletion!", badRequestResult.Value);
        }

        [Fact]
        public async Task DeleteReport_ReportNotFound_ReturnsBadRequest()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            _mockDeleteReport.Setup(x => x.Handle(1, "admin@example.com"))
                .ReturnsAsync(("report", null));

            // Act
            var result = await _controller.DeleteReport(1);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Report does not exist!", badRequestResult.Value);
        }

        #endregion

        #region CreateReview Tests

        [Fact]
        public async Task CreateReview_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var reviewCreation = new ReviewCreation(
                content: "Test content",
                title: "Test Review",
                scam_type_id: 1,
                review_date: testDate,
                media: new List<int> { 1, 2 }
            );

            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";

            // Setup token validation
            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.Is<HttpRequestMessage>(req => req.RequestUri.ToString().Contains("Check Token")),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent("admin@example.com")
                });

            // Setup scam type validation
            var scamTypes = new List<Scam_Type> { new Scam_Type { scam_type_id = 1, scam_type = "Test Type" } };
            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.Is<HttpRequestMessage>(req => req.RequestUri.ToString().Contains("scamTypes")),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(JsonConvert.SerializeObject(scamTypes))
                });

            // Setup media validation
            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.Is<HttpRequestMessage>(req => req.RequestUri.ToString().Contains("mediaManager")),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent("")
                });

            _mockCreateReview.Setup(x => x.Handle(reviewCreation, "admin@example.com"))
                .ReturnsAsync("success");

            // Act
            var result = await _controller.CreateReview(reviewCreation);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Report submitted successfully.", okResult.Value);
        }

        [Fact]
        public async Task CreateReview_InvalidScamType_ReturnsBadRequest()
        {
            // Arrange
            var reviewCreation = new ReviewCreation(
                content: "Test content",
                title: "Test Review",
                scam_type_id: 999,
                review_date: testDate,
                media: new List<int>()
            );

            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";

            // Setup token validation
            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.Is<HttpRequestMessage>(req => req.RequestUri.ToString().Contains("Check Token")),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent("admin@example.com")
                });

            // Setup scam type validation with empty list
            var scamTypes = new List<Scam_Type>();
            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.Is<HttpRequestMessage>(req => req.RequestUri.ToString().Contains("scamTypes")),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(JsonConvert.SerializeObject(scamTypes))
                });

            // Act
            var result = await _controller.CreateReview(reviewCreation);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Invalid scam type! Please select from available scam types.", badRequestResult.Value);
        }

        #endregion

        #region UpdateReview Tests

        [Fact]
        public async Task UpdateReviewContent_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var reviewContentUpdate = new ReviewContentUpdate(1, "Updated content");
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            _mockUpdateReview.Setup(x => x.HandleReviewContent(1, "Updated content", "admin@example.com"))
                .ReturnsAsync("ok");

            // Act
            var result = await _controller.UpdateReviewContent(reviewContentUpdate);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Review content has been updated successfully", okResult.Value);
        }

        [Fact]
        public async Task UpdateReviewContent_ReviewNotFound_ReturnsBadRequest()
        {
            // Arrange
            var reviewContentUpdate = new ReviewContentUpdate(1, "Updated content");
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            _mockUpdateReview.Setup(x => x.HandleReviewContent(1, "Updated content", "admin@example.com"))
                .ReturnsAsync("review");

            // Act
            var result = await _controller.UpdateReviewContent(reviewContentUpdate);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Review information could not be found!", badRequestResult.Value);
        }

        [Fact]
        public async Task UpdateReviewTitle_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var titleUpdate = new TitleUpdate(1, "Updated title");
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            _mockUpdateReview.Setup(x => x.HandleReviewTitle(1, "Updated title", "admin@example.com"))
                .ReturnsAsync("ok");

            // Act
            var result = await _controller.UpdateReviewTitle(titleUpdate);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Review title has been updated successfully", okResult.Value);
        }

        #endregion

        #region Comment Tests

        [Fact]
        public async Task DeleteReviewComment_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            _mockDeleteReviewComment.Setup(x => x.Handle(1, "admin@example.com"))
                .ReturnsAsync("ok");

            // Act
            var result = await _controller.DeleteReviewComment(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Comment deleted successfully.", okResult.Value);
        }

        [Fact]
        public async Task DeleteUrlComment_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            _mockDeleteUrlComment.Setup(x => x.Handle(1, "admin@example.com"))
                .ReturnsAsync("ok");

            // Act
            var result = await _controller.DeleteUrlComment(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Comment deleted successfully.", okResult.Value);
        }

        [Fact]
        public async Task WriteUrlComment_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var urlCommentContent = new UrlCommentContent("http://test.com", null, "Test comment");
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            _mockWriteUrlComment.Setup(x => x.Handle(urlCommentContent, "admin@example.com"))
                .ReturnsAsync("ok");

            // Act
            var result = await _controller.WriteUrlComment(urlCommentContent);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Comment submitted successfully.", okResult.Value);
        }

        [Fact]
        public async Task WriteReviewComment_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var reviewCommentContent = new ReviewCommentContent(null, 1, "Test comment");
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            _mockWriteReviewComment.Setup(x => x.Handle(reviewCommentContent, "admin@example.com"))
                .ReturnsAsync("ok");

            // Act
            var result = await _controller.WriteReviewComment(reviewCommentContent);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Comment submitted successfully.", okResult.Value);
        }

        #endregion

        #region GetReportById Tests

        [Fact]
        public async Task GetReportById_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            var reportDetails = new ReportDetails
            {
                Report = Report.Create("Test Report", 1, testDate, testDate, 1000M, "Description"),
                ReportWriterDetails = new ReportWriterDetails(1, "testuser", "test@test.com", "Test User", 1, true),
                Media = new List<int> { 1, 2 }
            };

            _mockGetReportById.Setup(x => x.Handle(1, "admin@example.com"))
                .ReturnsAsync(reportDetails);

            // Act
            var result = await _controller.GetReportById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.IsType<ReportDetails>(okResult.Value);
        }

        [Fact]
        public async Task GetReportById_ReportNotFound_ReturnsBadRequest()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            _mockGetReportById.Setup(x => x.Handle(1, "admin@example.com"))
                .ReturnsAsync((ReportDetails)null);

            // Act
            var result = await _controller.GetReportById(1);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Report information could not be found!", badRequestResult.Value);
        }

        [Fact]
        public async Task GetReportById_NoAccess_ReturnsBadRequest()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            var reportDetails = new ReportDetails
            {
                ReportWriterDetails = null
            };

            _mockGetReportById.Setup(x => x.Handle(1, "admin@example.com"))
                .ReturnsAsync(reportDetails);

            // Act
            var result = await _controller.GetReportById(1);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("You do not have access to this report.", badRequestResult.Value);
        }

        #endregion
    }
}