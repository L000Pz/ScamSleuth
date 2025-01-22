using System.Net;
using System.Text;
using Media.Application.Media;
using Media.Contracts;
using Media.Presentation.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Moq.Protected;
using Xunit;

namespace Media.Tests
{
    public class MediaControllerTests
    {
        private readonly Mock<ISaveMedia> _mockSaveMedia;
        private readonly Mock<IGetMedia> _mockGetMedia;
        private readonly Mock<IDeleteMedia> _mockDeleteMedia;
        private readonly Mock<HttpMessageHandler> _mockHttpMessageHandler;
        private readonly HttpClient _httpClient;
        private readonly MediaController _controller;

        public MediaControllerTests()
        {
            _mockSaveMedia = new Mock<ISaveMedia>();
            _mockGetMedia = new Mock<IGetMedia>();
            _mockDeleteMedia = new Mock<IDeleteMedia>();
            _mockHttpMessageHandler = new Mock<HttpMessageHandler>();

            // Create HttpClient with mocked handler
            _httpClient = new HttpClient(_mockHttpMessageHandler.Object);

            _controller = new MediaController(
                _mockSaveMedia.Object,
                _mockGetMedia.Object,
                _httpClient,
                _mockDeleteMedia.Object
            );

            // Setup controller context
            var httpContext = new DefaultHttpContext();
            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = httpContext
            };
        }

        private void SetupMockHttpMessageHandler(HttpStatusCode statusCode, string content)
        {
            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = statusCode,
                    Content = new StringContent(content)
                });
        }

        [Fact]
        public async Task Save_ValidFile_ReturnsOkResult()
        {
            // Arrange
            var fileMock = new Mock<IFormFile>();
            var content = new MemoryStream(Encoding.UTF8.GetBytes("Hello World"));
            
            fileMock.Setup(f => f.FileName).Returns("test.txt");
            fileMock.Setup(f => f.Name).Returns("test");
            fileMock.Setup(f => f.ContentType).Returns("text/plain");
            fileMock.Setup(f => f.Length).Returns(content.Length);
            fileMock.Setup(f => f.OpenReadStream()).Returns(content);

            _mockSaveMedia.Setup(x => x.Handle(It.IsAny<MediaFile>(), It.IsAny<string>()))
                .ReturnsAsync(1);

            // Setup auth header
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";

            // Setup mock HTTP response
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "valid-token");

            // Act
            var result = await _controller.Save(fileMock.Object);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(1, okResult.Value);
        }

        [Fact]
        public async Task Save_InvalidToken_ReturnsBadRequest()
        {
            // Arrange
            var fileMock = new Mock<IFormFile>();
            
            // Setup mock HTTP response for invalid token
            SetupMockHttpMessageHandler(HttpStatusCode.Unauthorized, "Invalid token");

            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer invalid-token";

            // Act
            var result = await _controller.Save(fileMock.Object);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Could not validate the token.", badRequestResult.Value);
        }

        [Fact]
        public async Task Save_NullFile_ReturnsBadRequest()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";

            // Setup mock HTTP response
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "valid-token");

            // Act
            var result = await _controller.Save(null);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("No file uploaded.", badRequestResult.Value);
        }

        [Fact]
        public async Task Save_WrongDataType_ReturnsBadRequest()
        {
            // Arrange
            var fileMock = new Mock<IFormFile>();
            var content = new MemoryStream(Encoding.UTF8.GetBytes("Hello World"));
            
            fileMock.Setup(f => f.FileName).Returns("test.txt");
            fileMock.Setup(f => f.Name).Returns("test");
            fileMock.Setup(f => f.ContentType).Returns("text/plain");
            fileMock.Setup(f => f.Length).Returns(content.Length);
            fileMock.Setup(f => f.OpenReadStream()).Returns(content);

            _mockSaveMedia.Setup(x => x.Handle(It.IsAny<MediaFile>(), It.IsAny<string>()))
                .ReturnsAsync(-1);

            // Setup auth header and mock HTTP response
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test-token";
            SetupMockHttpMessageHandler(HttpStatusCode.OK, "valid-token");

            // Act
            var result = await _controller.Save(fileMock.Object);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Wrong data type!", badRequestResult.Value);
        }

        [Fact]
        public async Task GetMedia_ExistingFile_ReturnsFileResult()
        {
            // Arrange
            var mediaFile = new MediaFile
            {
                file_name = "test.txt",
                content_type = "text/plain",
                Content = new MemoryStream(Encoding.UTF8.GetBytes("Hello World"))
            };

            _mockGetMedia.Setup(x => x.GetFile(It.IsAny<int>()))
                .ReturnsAsync(mediaFile);

            // Act
            var result = await _controller.GetMedia(1);

            // Assert
            var fileResult = Assert.IsType<FileStreamResult>(result);
            Assert.Equal("text/plain", fileResult.ContentType);
            Assert.Equal("test.txt", fileResult.FileDownloadName);
        }

        [Fact]
        public async Task GetMedia_NonExistingFile_ReturnsNotFound()
        {
            // Arrange
            _mockGetMedia.Setup(x => x.GetFile(It.IsAny<int>()))
                .ReturnsAsync((MediaFile)null);

            // Act
            var result = await _controller.GetMedia(1);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("File not found!", notFoundResult.Value);
        }

        [Fact]
        public async Task DeleteAll_ValidEmail_ReturnsOkResult()
        {
            // Arrange
            _mockDeleteMedia.Setup(x => x.DeleteAll(It.IsAny<string>()))
                .ReturnsAsync("success");

            // Act
            var result = await _controller.DeleteAll("test@example.com");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("All files have been deleted successfully!", okResult.Value);
        }

        [Fact]
        public async Task Delete_ExistingFile_ReturnsOkResult()
        {
            // Arrange
            _mockDeleteMedia.Setup(x => x.Delete(It.IsAny<int>()))
                .ReturnsAsync("success");

            // Act
            var result = await _controller.Delete(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("File has been deleted successfully!", okResult.Value);
        }

        [Fact]
        public async Task Delete_NonExistingFile_ReturnsBadRequest()
        {
            // Arrange
            _mockDeleteMedia.Setup(x => x.Delete(It.IsAny<int>()))
                .ReturnsAsync((string)null);

            // Act
            var result = await _controller.Delete(1);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("File not found!", badRequestResult.Value);
        }
    }
}