using System.Net;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using Moq.Protected;
using Newtonsoft.Json;
using User.Application.UserManagement;
using User.Contracts;
using User.Domain;
using User.Presentation.Controllers;
using Xunit;

namespace User.Tests
{
    public class UserControllerTests
    {
        private readonly Mock<IEditUserInfo> _mockEditUserInfo;
        private readonly Mock<IGetUserReports> _mockGetUserReports;
        private readonly Mock<ISubmitReport> _mockSubmitReport;
        private readonly Mock<IReturnReportById> _mockReturnReportById;
        private readonly Mock<IRemoveReport> _mockRemoveReport;
        private readonly Mock<IWriteReviewComment> _mockWriteReviewComment;
        private readonly Mock<IWriteUrlComment> _mockWriteUrlComment;
        private readonly Mock<IConfiguration> _mockConfiguration;
        private readonly Mock<HttpMessageHandler> _mockHttpMessageHandler;
        private readonly HttpClient _httpClient;
        private readonly UserController _controller;

        public UserControllerTests()
        {
            _mockEditUserInfo = new Mock<IEditUserInfo>();
            _mockGetUserReports = new Mock<IGetUserReports>();
            _mockSubmitReport = new Mock<ISubmitReport>();
            _mockReturnReportById = new Mock<IReturnReportById>();
            _mockRemoveReport = new Mock<IRemoveReport>();
            _mockWriteReviewComment = new Mock<IWriteReviewComment>();
            _mockWriteUrlComment = new Mock<IWriteUrlComment>();
            _mockConfiguration = new Mock<IConfiguration>();
            _mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            _httpClient = new HttpClient(_mockHttpMessageHandler.Object);

            _controller = new UserController(
                _mockEditUserInfo.Object,
                _httpClient,
                _mockGetUserReports.Object,
                _mockSubmitReport.Object,
                _mockRemoveReport.Object,
                _mockConfiguration.Object,
                _mockReturnReportById.Object,
                _mockWriteReviewComment.Object,
                _mockWriteUrlComment.Object
            );

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

        #region EditUserInfo Tests

        [Fact]
        public async Task EditUserInfo_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var editInfo = new EditInfo(
                email: "test@example.com",
                new_username: null,
                new_profile_picture_id: null,
                new_name: null,
                old_password: "oldpass123",
                new_password: "newpass123"
            );

            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "test@example.com");
            _mockEditUserInfo.Setup(x => x.Handle(It.IsAny<EditInfo>()))
                .ReturnsAsync("User's information has been changed successfully!");

            // Act
            var result = await _controller.EditUserInfo(editInfo);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("User's information has been changed successfully!", okResult.Value);
        }

        [Fact]
        public async Task EditUserInfo_InvalidToken_ReturnsBadRequest()
        {
            // Arrange
            var editInfo = new EditInfo(
                email: "test@example.com",
                new_username: null,
                new_profile_picture_id: null,
                new_name: null,
                old_password: "oldpass123",
                new_password: null
            );
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer invalid-token";
            SetupMockHttpMessageHandler(HttpStatusCode.Unauthorized, "unsuccessful");

            // Act
            var result = await _controller.EditUserInfo(editInfo);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Could not validate the token.", badRequestResult.Value);
        }

        [Fact]
        public async Task EditUserInfo_EmailMismatch_ReturnsBadRequest()
        {
            // Arrange
            var editInfo = new EditInfo(
                email: "test@example.com",
                new_username: null,
                new_profile_picture_id: null,
                new_name: null,
                old_password: "oldpass123",
                new_password: null
            );
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "\"different@example.com\"");

            // Act
            var result = await _controller.EditUserInfo(editInfo);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Email doesn't match!", badRequestResult.Value);
        }

        [Fact]
        public async Task EditUserInfo_MissingOldPassword_ReturnsBadRequest()
        {
            // Arrange
            var editInfo = new EditInfo(
                email: "test@example.com",
                new_username: null,
                new_profile_picture_id: null,
                new_name: null,
                old_password: null,
                new_password: null
            );
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "test@example.com");

            // Act
            var result = await _controller.EditUserInfo(editInfo);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("You must enter your password first!", badRequestResult.Value);
        }

        [Fact]
        public async Task EditUserInfo_OperationFailed_ReturnsBadRequest()
        {
            // Arrange
            var editInfo = new EditInfo(
                email: "test@example.com",
                new_username: null,
                new_profile_picture_id: null,
                new_name: null,
                old_password: "oldpass123",
                new_password: null
            );
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "test@example.com");
            _mockEditUserInfo.Setup(x => x.Handle(It.IsAny<EditInfo>()))
                .ReturnsAsync((string)null);

            // Act
            var result = await _controller.EditUserInfo(editInfo);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Operation failed!", badRequestResult.Value);
        }

        [Fact]
        public async Task EditUserInfo_IncorrectPassword_ReturnsBadRequest()
        {
            // Arrange
            var editInfo = new EditInfo(
                email: "test@example.com",
                new_username: null,
                new_profile_picture_id: null,
                new_name: null,
                old_password: "wrongpass",
                new_password: null
            );
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "test@example.com");
            _mockEditUserInfo.Setup(x => x.Handle(It.IsAny<EditInfo>()))
                .ReturnsAsync("password");

            // Act
            var result = await _controller.EditUserInfo(editInfo);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Incorrect Password!", badRequestResult.Value);
        }

        [Fact]
        public async Task EditUserInfo_UsernameExists_ReturnsBadRequest()
        {
            // Arrange
            var editInfo = new EditInfo(
                email: "test@example.com",
                new_username: "existinguser",
                new_profile_picture_id: null,
                new_name: null,
                old_password: "oldpass123",
                new_password: null
            );
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "test@example.com");
            _mockEditUserInfo.Setup(x => x.Handle(It.IsAny<EditInfo>()))
                .ReturnsAsync("username");

            // Act
            var result = await _controller.EditUserInfo(editInfo);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Username already exists!", badRequestResult.Value);
        }

        [Fact]
        public async Task EditUserInfo_InvalidPasswordFormat_ReturnsBadRequest()
        {
            // Arrange
            var editInfo = new EditInfo(
                email: "test@example.com",
                new_username: null,
                new_profile_picture_id: null,
                new_name: null,
                old_password: "oldpass123",
                new_password: "short"
            );
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "test@example.com");
            _mockEditUserInfo.Setup(x => x.Handle(It.IsAny<EditInfo>()))
                .ReturnsAsync("format");

            // Act
            var result = await _controller.EditUserInfo(editInfo);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("New password's length must be over 6 characters!", badRequestResult.Value);
        }

        #endregion

        #region SubmitReport Tests

        [Fact]
        public async Task SubmitReport_ValidReport_ReturnsOkResult()
        {
            // Arrange
            var reportSubmission = new ReportSubmission(
                title: "Test Report",
                scam_type_id: 1,
                scam_date: DateTime.Now,
                financial_loss: 1000.00M,
                description: "Test description",
                media: new List<int> { 1, 2 }
            );

            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "\"test@example.com\"", "Check Token");

            var scamTypes = new List<Scam_Type> { new Scam_Type { scam_type_id = 1 } };
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

            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.Is<HttpRequestMessage>(req => req.RequestUri.ToString().Contains("mediaManager")),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage { StatusCode = HttpStatusCode.OK });

            _mockSubmitReport.Setup(x => x.Handle(It.IsAny<ReportSubmission>(), It.IsAny<string>()))
                .ReturnsAsync("success");

            // Act
            var result = await _controller.SubmitReport(reportSubmission);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Report submitted successfully.", okResult.Value);
        }

        [Fact]
        public async Task SubmitReport_AuthenticationFailed_ReturnsBadRequest()
        {
            // Arrange
            var reportSubmission = new ReportSubmission(
                "Test Report", 1, DateTime.Now, 1000.00M, "Test description", new List<int> { 1 }
            );

            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer invalid-token";
            SetupMockHttpMessageHandler(HttpStatusCode.Unauthorized, "unsuccessful", "Check Token");

            // Act
            var result = await _controller.SubmitReport(reportSubmission);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Authentication failed!", badRequestResult.Value);
        }

        [Fact]
        public async Task SubmitReport_InvalidScamType_ReturnsBadRequest()
        {
            // Arrange
            var reportSubmission = new ReportSubmission(
                "Test Report", 999, DateTime.Now, 1000.00M, "Test description", new List<int> { 1 }
            );

            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "\"test@example.com\"", "Check Token");

            var scamTypes = new List<Scam_Type> { new Scam_Type { scam_type_id = 1 } };
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
            var result = await _controller.SubmitReport(reportSubmission);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Invalid scam type! Please select from available scam types.", badRequestResult.Value);
        }

        [Fact]
        public async Task SubmitReport_ReportAlreadyExists_ReturnsBadRequest()
        {
            // Arrange
            var reportSubmission = new ReportSubmission(
                "Test Report", 1, DateTime.Now, 1000.00M, "Test description", new List<int> { 1 }
            );

            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "\"test@example.com\"", "Check Token");

            var scamTypes = new List<Scam_Type> { new Scam_Type { scam_type_id = 1 } };
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

            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.Is<HttpRequestMessage>(req => req.RequestUri.ToString().Contains("mediaManager")),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage { StatusCode = HttpStatusCode.OK });

            _mockSubmitReport.Setup(x => x.Handle(It.IsAny<ReportSubmission>(), It.IsAny<string>()))
                .ReturnsAsync("description");

            // Act
            var result = await _controller.SubmitReport(reportSubmission);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Report already exists!", badRequestResult.Value);
        }

        #endregion

        #region GetUserReports Tests

        [Fact]
        public async Task GetReports_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var reports = new List<Report>
            {
                new Report
                {
                    report_id = 1,
                    title = "Test Report 1",
                    scam_type_id = 1,
                    scam_date = DateTime.Now,
                    financial_loss = 1000.00M,
                    description = "Test description 1"
                }
            };

            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "\"test@example.com\"");
            _mockGetUserReports.Setup(x => x.Handle(It.IsAny<string>()))
                .ReturnsAsync(reports);

            // Act
            var result = await _controller.GetReports();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedReports = Assert.IsType<List<Report>>(okResult.Value);
            Assert.Single(returnedReports);
        }

        [Fact]
        public async Task GetReports_NoReportsFound_ReturnsBadRequest()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "\"test@example.com\"");
            _mockGetUserReports.Setup(x => x.Handle(It.IsAny<string>()))
                .ReturnsAsync((List<Report>)null);

            // Act
            var result = await _controller.GetReports();

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("No Reports could be found!", badRequestResult.Value);
        }

        #endregion

        #region GetReportById Tests

        [Fact]
        public async Task GetReportById_ExistingReportWithAccess_ReturnsOkResult()
        {
            // Arrange
            var reportDetails = new ReportDetails
            {
                Report = new Report
                {
                    report_id = 1,
                    title = "Test Report",
                    scam_type_id = 1,
                    scam_date = DateTime.Now,
                    financial_loss = 1000.00M,
                    description = "Test description"
                },
                Media = new List<int> { 1, 2 },
                WriterDetails = new WriterDetails(
                    user_id: 1,
                    username: "testuser",
                    email: "test@example.com",
                    name: "Test User",
                    profile_picture_id: 1,
                    is_verified: true
                )
            };

            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "\"test@example.com\"");
            _mockReturnReportById.Setup(x => x.Handle(1, It.IsAny<string>()))
                .ReturnsAsync(reportDetails);

            // Act
            var result = await _controller.GetReportById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedReport = Assert.IsType<ReportDetails>(okResult.Value);
            Assert.Equal(1, returnedReport.Report.report_id);
        }

        [Fact]
        public async Task GetReportById_NonExistingReport_ReturnsBadRequest()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "\"test@example.com\"");
            _mockReturnReportById.Setup(x => x.Handle(It.IsAny<int>(), It.IsAny<string>()))
                .ReturnsAsync((ReportDetails)null);

            // Act
            var result = await _controller.GetReportById(1);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Report information could not be found!", badRequestResult.Value);
        }

        [Fact]
        public async Task GetReportById_NoAccessToReport_ReturnsBadRequest()
        {
            // Arrange
            var reportDetails = new ReportDetails
            {
                Report = new Report { report_id = 1 },
                Media = new List<int>(),
                WriterDetails = null // No access
            };

            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "\"test@example.com\"");
            _mockReturnReportById.Setup(x => x.Handle(It.IsAny<int>(), It.IsAny<string>()))
                .ReturnsAsync(reportDetails);

            // Act
            var result = await _controller.GetReportById(1);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("You do not have access to this report.", badRequestResult.Value);
        }

        #endregion

        #region WriteReviewComment Tests

        [Fact]
        public async Task WriteReviewComment_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var reviewComment = new ReviewCommentContent(
                root_id: null,
                review_id: 1,
                comment_content: "This is a test comment"
            );
            
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "\"test@example.com\"");
            _mockWriteReviewComment.Setup(x => x.Handle(It.IsAny<ReviewCommentContent>(), It.IsAny<string>()))
                .ReturnsAsync("ok");

            // Act
            var result = await _controller.WriteReviewComment(reviewComment);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Comment submitted successfully.", okResult.Value);
        }

        [Fact]
        public async Task WriteReviewComment_AuthenticationFailed_ReturnsBadRequest()
        {
            // Arrange
            var reviewComment = new ReviewCommentContent(
                root_id: null,
                review_id: 1,
                comment_content: "This is a test comment"
            );
            
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer invalid-token";
            SetupMockHttpMessageHandler(HttpStatusCode.Unauthorized, "unsuccessful");

            // Act
            var result = await _controller.WriteReviewComment(reviewComment);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Authentication failed!", badRequestResult.Value);
        }

        [Fact]
        public async Task WriteReviewComment_WriterNotRegistered_ReturnsBadRequest()
        {
            // Arrange
            var reviewComment = new ReviewCommentContent(
                root_id: null,
                review_id: 1,
                comment_content: "This is a test comment"
            );
            
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "\"test@example.com\"");
            _mockWriteReviewComment.Setup(x => x.Handle(It.IsAny<ReviewCommentContent>(), It.IsAny<string>()))
                .ReturnsAsync("writer");

            // Act
            var result = await _controller.WriteReviewComment(reviewComment);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("You are not a registered user!", badRequestResult.Value);
        }

        [Fact]
        public async Task WriteReviewComment_ReviewNotFound_ReturnsBadRequest()
        {
            // Arrange
            var reviewComment = new ReviewCommentContent(
                root_id: null,
                review_id: 999,
                comment_content: "This is a test comment"
            );
            
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "\"test@example.com\"");
            _mockWriteReviewComment.Setup(x => x.Handle(It.IsAny<ReviewCommentContent>(), It.IsAny<string>()))
                .ReturnsAsync("review");

            // Act
            var result = await _controller.WriteReviewComment(reviewComment);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Could not find the review!", badRequestResult.Value);
        }

        #endregion

        #region WriteUrlComment Tests

        [Fact]
        public async Task WriteUrlComment_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var urlComment = new UrlCommentContent(
                url: "https://example.com",
                root_id: null,
                rating: 4,
                comment_content: "This is a test URL comment"
            );
            
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "\"test@example.com\"");
            _mockWriteUrlComment.Setup(x => x.Handle(It.IsAny<UrlCommentContent>(), It.IsAny<string>()))
                .ReturnsAsync("ok");

            // Act
            var result = await _controller.WriteUrlComment(urlComment);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Comment submitted successfully.", okResult.Value);
        }

        [Fact]
        public async Task WriteUrlComment_InvalidRating_ReturnsBadRequest()
        {
            // Arrange
            var urlComment = new UrlCommentContent(
                url: "https://example.com",
                root_id: null,
                rating: 6, // Invalid rating
                comment_content: "This is a test URL comment"
            );
            
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "\"test@example.com\"");
            _mockWriteUrlComment.Setup(x => x.Handle(It.IsAny<UrlCommentContent>(), It.IsAny<string>()))
                .ReturnsAsync("rating");

            // Act
            var result = await _controller.WriteUrlComment(urlComment);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Rating must be between 1 to 5!", badRequestResult.Value);
        }

        [Fact]
        public async Task WriteUrlComment_UrlNotFound_ReturnsBadRequest()
        {
            // Arrange
            var urlComment = new UrlCommentContent(url: "invalid",
                root_id: null,
                rating: 3,
                comment_content: "This is a test URL comment");
            
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "\"test@example.com\"");
            _mockWriteUrlComment.Setup(x => x.Handle(It.IsAny<UrlCommentContent>(), It.IsAny<string>()))
                .ReturnsAsync("url");

            // Act
            var result = await _controller.WriteUrlComment(urlComment);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Could not find the url!", badRequestResult.Value);
        }

        #endregion
    }
}