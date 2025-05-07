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
            _mockMessagePublisher = new Mock<IMessagePublisher>();
            _mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            _httpClient = new HttpClient(_mockHttpMessageHandler.Object);

            _controller = new AdminController(
                _httpClient,
                _mockShowAllReports.Object,
                _mockGetAdminReviews.Object,
                _mockCreateReview.Object,
                _mockDeleteReview.Object,
                _mockMessagePublisher.Object
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

        // ViewReports Tests
        [Fact]
        public async Task ViewReports_ValidToken_ReturnsOkResult()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");
            
            var reports = new List<Report>
            {
                Report.Create("Test Report 1", 1, testDate, 1000.00M, "Test Description 1"),
                Report.Create("Test Report 2", 2, testDate, 2000.00M, "Test Description 2")
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
            SetupMockHttpMessageHandler(HttpStatusCode.Unauthorized, "unauthorized");

            // Act
            var result = await _controller.ViewReports();

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("You do not have access!", badRequestResult.Value);
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

        // GetReportInformation Tests

        // GetAdminReviews Tests
        [Fact]
        public async Task GetAdminReviews_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            var reviews = new List<Review>
            {
                Review.Create("Test Review 1", 1,1, testDate, 1),
                Review.Create("Test Review 2", 1,2, testDate, 2)
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

        // DeleteReview Tests
        [Fact]
        public async Task DeleteReview_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com");

            var mediaIds = new List<int> { 1, 2 };
            _mockDeleteReview.Setup(x => x.Handle(1, "admin@example.com"))
                .ReturnsAsync("ok");

            // Act
            var result = await _controller.DeleteReview(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Review deleted successfully.", okResult.Value);

            // Verify message publishing
            _mockMessagePublisher.Verify(x => x.PublishMediaDeletion(It.IsAny<int>()), Times.Exactly(2));
        }

        [Fact]
        public async Task DeleteReview_InvalidToken_ReturnsBadRequest()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer invalid-token";
            SetupMockHttpMessageHandler(HttpStatusCode.Unauthorized, "unauthorized");

            // Act
            var result = await _controller.DeleteReview(1);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Authentication failed!", badRequestResult.Value);
        }

        // CreateReview Tests
        [Fact]
        public async Task CreateReview_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var reviewCreation = new ReviewCreation(
                content: "Test content",
                title: "Test Review",
                scam_type_id: 1,
                review_date: testDate
            );

            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com", "Check Token");

            // Setup scam type validation
            var scamTypes = new List<Scam_Type> { new Scam_Type { scam_type_id = 1 } };
            SetupMockHttpMessageHandler(HttpStatusCode.OK, JsonConvert.SerializeObject(scamTypes), "scamTypes");

            // Setup media validation
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "", "mediaManager");

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
                review_date: testDate
            );

            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com", "Check Token");

            // Setup scam type validation with empty list
            var scamTypes = new List<Scam_Type>();
            SetupMockHttpMessageHandler(HttpStatusCode.OK, JsonConvert.SerializeObject(scamTypes), "scamTypes");

            // Act
            var result = await _controller.CreateReview(reviewCreation);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Invalid scam type! Please select from available scam types.", badRequestResult.Value);
        }

        [Fact]
        public async Task CreateReview_InvalidMedia_ReturnsBadRequest()
        {
            // Arrange
            var reviewCreation = new ReviewCreation(
                content: "Test content",
                title: "Test Review",
                scam_type_id: 1,
                review_date: testDate
                );

            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "admin@example.com", "Check Token");

            // Setup scam type validation
            var scamTypes = new List<Scam_Type> { new Scam_Type { scam_type_id = 1 } };
            SetupMockHttpMessageHandler(HttpStatusCode.OK, JsonConvert.SerializeObject(scamTypes), "scamTypes");

            // Setup media validation to fail
            SetupMockHttpMessageHandler(HttpStatusCode.NotFound, "", "mediaManager");

            // Act
            var result = await _controller.CreateReview(reviewCreation);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Failed to verify media!", badRequestResult.Value);
        }
    }
}