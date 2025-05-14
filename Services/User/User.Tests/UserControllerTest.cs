/*using System.Net;
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
        private readonly Mock<IChangePassword> _mockChangePassword;
        private readonly Mock<IGetUserReports> _mockGetUserReports;
        private readonly Mock<ISubmitReport> _mockSubmitReport;
        private readonly Mock<IReturnReportById> _mockReturnReportById;
        private readonly Mock<IRemoveReport> _mockRemoveReport;
        private readonly Mock<IConfiguration> _mockConfiguration;
        private readonly Mock<HttpMessageHandler> _mockHttpMessageHandler;
        private readonly HttpClient _httpClient;
        private readonly UserController _controller;

        public UserControllerTests()
        {
            _mockChangePassword = new Mock<IChangePassword>();
            _mockGetUserReports = new Mock<IGetUserReports>();
            _mockSubmitReport = new Mock<ISubmitReport>();
            _mockReturnReportById = new Mock<IReturnReportById>();
            _mockRemoveReport = new Mock<IRemoveReport>();
            _mockConfiguration = new Mock<IConfiguration>();
            _mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            _httpClient = new HttpClient(_mockHttpMessageHandler.Object);

            _controller = new UserController(
                _mockChangePassword.Object,
                _httpClient,
                _mockGetUserReports.Object,
                _mockSubmitReport.Object,
                _mockRemoveReport.Object,
                _mockConfiguration.Object,
                _mockReturnReportById.Object
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
                },
                new Report
                {
                    report_id = 2,
                    title = "Test Report 2",
                    scam_type_id = 2,
                    scam_date = DateTime.Now,
                    financial_loss = 2000.00M,
                    description = "Test description 2"
                }
            };

            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "test@example.com");
            _mockGetUserReports.Setup(x => x.Handle(It.IsAny<string>()))
                .ReturnsAsync(reports);

            // Act
            var result = await _controller.GetReports();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedReports = Assert.IsType<List<Report>>(okResult.Value);
            Assert.Equal(2, returnedReports.Count);
        }

        [Fact]
        public async Task GetReportById_ExistingReport_ReturnsOkResult()
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
                Writer = new Users
                {
                    user_id = 1,
                    username = "testuser",
                    email = "test@example.com",
                    name = "Test User",
                    password = "hashedpassword",
                    is_verified = true
                },
                Media = new List<Report_Media>
                {
                    new Report_Media { report_id = 1, media_id = 1 }
                }
            };

            _mockReturnReportById.Setup(x => x.Handle(1))
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
            _mockReturnReportById.Setup(x => x.Handle(It.IsAny<int>()))
                .ReturnsAsync((ReportDetails)null);

            // Act
            var result = await _controller.GetReportById(1);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Report information could not be found!", badRequestResult.Value);
        }
       
        [Fact]
        public async Task ChangePassword_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var passwordChange = new PasswordChange(
                email: "test@example.com",
                password: "newpass123"
            );

            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "test@example.com");
            _mockChangePassword.Setup(x => x.Handle(It.IsAny<PasswordChange>()))
                .ReturnsAsync("success");

            // Act
            var result = await _controller.ChangePassword(passwordChange);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("success", okResult.Value);
        }

        [Fact]
        public async Task ChangePassword_InvalidToken_ReturnsBadRequest()
        {
            // Arrange
            var passwordChange = new PasswordChange("test@example.com", "newpass123");
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer invalid-token";
            SetupMockHttpMessageHandler(HttpStatusCode.Unauthorized, "unauthorized");

            // Act
            var result = await _controller.ChangePassword(passwordChange);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Could not validate the token.", badRequestResult.Value);
        }

        [Fact]
        public async Task ChangePassword_EmailMismatch_ReturnsBadRequest()
        {
            // Arrange
            var passwordChange = new PasswordChange("test@example.com", "newpass123");
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "different@example.com");

            // Act
            var result = await _controller.ChangePassword(passwordChange);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Email doesn't match!", badRequestResult.Value);
        }

        [Fact]
        public async Task ChangePassword_OperationFailed_ReturnsBadRequest()
        {
            // Arrange
            var passwordChange = new PasswordChange("test@example.com", "newpass123");
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "test@example.com");
            _mockChangePassword.Setup(x => x.Handle(It.IsAny<PasswordChange>()))
                .ReturnsAsync((string)null);

            // Act
            var result = await _controller.ChangePassword(passwordChange);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Operation failed!", badRequestResult.Value);
        }

        [Fact]
        public async Task ChangePassword_InvalidPasswordFormat_ReturnsBadRequest()
        {
            // Arrange
            var passwordChange = new PasswordChange("test@example.com", "short");
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "test@example.com");
            _mockChangePassword.Setup(x => x.Handle(It.IsAny<PasswordChange>()))
                .ReturnsAsync("format");

            // Act
            var result = await _controller.ChangePassword(passwordChange);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("New password's length must be over 6 characters!", badRequestResult.Value);
        }

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
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "test@example.com", "Check Token");
            
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
            SetupMockHttpMessageHandler(HttpStatusCode.Unauthorized, "unauthorized", "Check Token");

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
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "test@example.com", "Check Token");

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
        public async Task SubmitReport_InvalidMediaId_ReturnsBadRequest()
        {
            // Arrange
            var reportSubmission = new ReportSubmission(
                "Test Report", 1, DateTime.Now, 1000.00M, "Test description", new List<int> { 999 }
            );

            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "test@example.com", "Check Token");

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
                .ReturnsAsync(new HttpResponseMessage { StatusCode = HttpStatusCode.NotFound });

            // Act
            var result = await _controller.SubmitReport(reportSubmission);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Failed to verify media!", badRequestResult.Value);
        }

        [Fact]
        public async Task SubmitReport_ReportSubmissionFailed_ReturnsBadRequest()
        {
            // Arrange
            var reportSubmission = new ReportSubmission(
                "Test Report", 1, DateTime.Now, 1000.00M, "Test description", new List<int> { 1 }
            );

            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "test@example.com", "Check Token");

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
                .ReturnsAsync("report");

            // Act
            var result = await _controller.SubmitReport(reportSubmission);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Failed to submit report!", badRequestResult.Value);
        }
    }
}*/