using System;
using System.Threading.Tasks;
using IAM.Application.AuthenticationService;
using IAM.Application.Common;
using IAM.Contracts;
using IAM.Domain;
using IAM.Presentation.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace IAM.Tests
{
    public class AuthControllerTests
    {
        private readonly Mock<IRegisterService> _mockRegisterService;
        private readonly Mock<ILoginService> _mockLoginService;
        private readonly Mock<IVerificationService> _mockVerificationService;
        private readonly Mock<INewCodeService> _mockNewCodeService;
        private readonly Mock<IAdminRegisterService> _mockAdminRegisterService;
        private readonly Mock<ITokenCheck> _mockTokenCheck;
        private readonly Mock<IReturnByTokenService> _mockReturnByTokenService;
        private readonly AuthController _controller;
        private static readonly DateTime testDate = DateTime.Now;

        public AuthControllerTests()
        {
            _mockRegisterService = new Mock<IRegisterService>();
            _mockLoginService = new Mock<ILoginService>();
            _mockVerificationService = new Mock<IVerificationService>();
            _mockNewCodeService = new Mock<INewCodeService>();
            _mockAdminRegisterService = new Mock<IAdminRegisterService>();
            _mockTokenCheck = new Mock<ITokenCheck>();
            _mockReturnByTokenService = new Mock<IReturnByTokenService>();

            _controller = new AuthController(
                _mockRegisterService.Object,
                _mockLoginService.Object,
                _mockVerificationService.Object,
                _mockNewCodeService.Object,
                _mockAdminRegisterService.Object,
                _mockTokenCheck.Object,
                _mockReturnByTokenService.Object
            );

            // Setup controller context
            var httpContext = new DefaultHttpContext();
            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = httpContext
            };
        }

        #region Register Tests

        [Fact]
        public async Task Register_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var registerDetails = new RegisterDetails("test@example.com", "testuser", "password123", "Test User");
            var authResult = new AuthenticationResult(
                user_id: 1,
                username: "testuser",
                email: "test@example.com",
                name: "Test User",
                profile_picture_id: null,
                is_verified: false,
                token: "valid_jwt_token",
                role: "user"
            );

            _mockRegisterService.Setup(x => x.Handle(registerDetails))
                .ReturnsAsync(authResult);

            // Act
            var result = await _controller.Register(registerDetails);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedResult = Assert.IsType<AuthenticationResult>(okResult.Value);
            Assert.Equal(authResult.token, returnedResult.token);
            Assert.Equal(authResult.email, returnedResult.email);
        }

        [Fact]
        public async Task Register_InvalidEmailFormat_ReturnsBadRequest()
        {
            // Arrange
            var registerDetails = new RegisterDetails("invalid-email", "testuser", "password123", "Test User");
            var authResult = new AuthenticationResult(null, "", "", "", null, false, "emailFormat", "");

            _mockRegisterService.Setup(x => x.Handle(registerDetails))
                .ReturnsAsync(authResult);

            // Act
            var result = await _controller.Register(registerDetails);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Invalid email format!", badRequestResult.Value);
        }

        [Fact]
        public async Task Register_InvalidPasswordFormat_ReturnsBadRequest()
        {
            // Arrange
            var registerDetails = new RegisterDetails("test@example.com", "testuser", "123", "Test User");
            var authResult = new AuthenticationResult(null, "", "", "", null, false, "passwordFormat", "");

            _mockRegisterService.Setup(x => x.Handle(registerDetails))
                .ReturnsAsync(authResult);

            // Act
            var result = await _controller.Register(registerDetails);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Password must be at least 6 characters long.", badRequestResult.Value);
        }

        [Fact]
        public async Task Register_EmailAlreadyExists_ReturnsBadRequest()
        {
            // Arrange
            var registerDetails = new RegisterDetails("test@example.com", "testuser", "password123", "Test User");
            var authResult = new AuthenticationResult(null, "", "", "", null, false, "email", "");

            _mockRegisterService.Setup(x => x.Handle(registerDetails))
                .ReturnsAsync(authResult);

            // Act
            var result = await _controller.Register(registerDetails);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Email already exists!", badRequestResult.Value);
        }

        [Fact]
        public async Task Register_UsernameAlreadyExists_ReturnsBadRequest()
        {
            // Arrange
            var registerDetails = new RegisterDetails("test@example.com", "testuser", "password123", "Test User");
            var authResult = new AuthenticationResult(null, "", "", "", null, false, "username", "");

            _mockRegisterService.Setup(x => x.Handle(registerDetails))
                .ReturnsAsync(authResult);

            // Act
            var result = await _controller.Register(registerDetails);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Username already exists!", badRequestResult.Value);
        }

        #endregion

        #region AdminRegister Tests

        [Fact]
        public async Task AdminRegister_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var adminRegisterDetails = new AdminRegisterDetails("admin@example.com", "adminuser", "password123", "Admin User","1234");
            var authResult = new AdminAuthenticationResult(
                admin_id: 1,
                username: "adminuser",
                email: "admin@example.com",
                name: "Admin User",
                contact_info: "1234",
                bio:"I am an admin.",
                profile_picture_id: 2,
                token: "valid",
                role: "admin"
            );

            _mockAdminRegisterService.Setup(x => x.Handle(adminRegisterDetails))
                .ReturnsAsync(authResult);

            // Act
            var result = await _controller.AdminRegister(adminRegisterDetails);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedResult = Assert.IsType<AdminAuthenticationResult>(okResult.Value);
            Assert.Equal(authResult.token, returnedResult.token);
            Assert.Equal(authResult.role, returnedResult.role);
        }

        [Fact]
        public async Task AdminRegister_InvalidEmailFormat_ReturnsBadRequest()
        {
            // Arrange
            var adminRegisterDetails = new AdminRegisterDetails("invalid-email", "adminuser", "password123", "admin","1234");
            var authResult = new AdminAuthenticationResult(null, "", "", "","", "null", null, "emailFormat", "");

            _mockAdminRegisterService.Setup(x => x.Handle(adminRegisterDetails))
                .ReturnsAsync(authResult);

            // Act
            var result = await _controller.AdminRegister(adminRegisterDetails);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Invalid email format!", badRequestResult.Value);
        }

        #endregion

        #region Login Tests

        [Fact]
        public async Task Login_ValidUserCredentials_ReturnsOkResult()
        {
            // Arrange
            var loginDetails = new LoginDetails("testuser", "password123");
            var authResult = new AuthenticationResult(
                user_id: 1,
                username: "testuser",
                email: "test@example.com",
                name: "Test User",
                profile_picture_id: 1,
                is_verified: true,
                token: "valid_jwt_token",
                role: "user"
            );

            _mockLoginService.Setup(x => x.Handle(loginDetails))
                .ReturnsAsync(authResult);

            // Act
            var result = await _controller.Login(loginDetails);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedResult = Assert.IsType<AuthenticationResult>(okResult.Value);
            Assert.Equal(authResult.token, returnedResult.token);
            Assert.Equal(authResult.role, returnedResult.role);
        }

        [Fact]
        public async Task Login_ValidAdminCredentials_ReturnsOkResult()
        {
            // Arrange
            var loginDetails = new LoginDetails("adminuser", "password123");
            var adminAuthResult = new AdminAuthenticationResult(
                admin_id: 1,
                username: "adminuser",
                email: "admin@example.com",
                name: "Admin User",
                contact_info: "1234",
                bio:"I am an admin.",
                profile_picture_id: 2,
                token: "valid_token",
                role: "admin"
            );

            _mockLoginService.Setup(x => x.Handle(loginDetails))
                .ReturnsAsync((AuthenticationResult)null);

            _mockLoginService.Setup(x => x.HandleAdmin(loginDetails))
                .ReturnsAsync(adminAuthResult);

            // Act
            var result = await _controller.Login(loginDetails);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedResult = Assert.IsType<AdminAuthenticationResult>(okResult.Value);
            Assert.Equal(adminAuthResult.token, returnedResult.token);
            Assert.Equal(adminAuthResult.role, returnedResult.role);
        }

        [Fact]
        public async Task Login_UserDoesNotExist_ReturnsBadRequest()
        {
            // Arrange
            var loginDetails = new LoginDetails("nonexistentuser", "password123");

            _mockLoginService.Setup(x => x.Handle(loginDetails))
                .ReturnsAsync((AuthenticationResult)null);

            _mockLoginService.Setup(x => x.HandleAdmin(loginDetails))
                .ReturnsAsync(null as Func<AdminAuthenticationResult?>);

            // Act
            var result = await _controller.Login(loginDetails);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("User doesn't exist!", badRequestResult.Value);
        }

        [Fact]
        public async Task Login_IncorrectUserPassword_ReturnsBadRequest()
        {
            // Arrange
            var loginDetails = new LoginDetails("testuser", "wrongpassword");
            var authResult = new AuthenticationResult(null, "", "", "", null, false, "incorrect", "");

            _mockLoginService.Setup(x => x.Handle(loginDetails))
                .ReturnsAsync(authResult);

            // Act
            var result = await _controller.Login(loginDetails);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Incorrect password!", badRequestResult.Value);
        }

        [Fact]
        public async Task Login_IncorrectAdminPassword_ReturnsBadRequest()
        {
            // Arrange
            var loginDetails = new LoginDetails("adminuser", "wrongpassword");
            var authResult = new AdminAuthenticationResult(null, "", "", "", "",null, null, "incorrect", "");

            _mockLoginService.Setup(x => x.Handle(loginDetails))
                .ReturnsAsync((AuthenticationResult)null);

            _mockLoginService.Setup(x => x.HandleAdmin(loginDetails))
                .ReturnsAsync(authResult);

            // Act
            var result = await _controller.Login(loginDetails);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Incorrect password!", badRequestResult.Value);
        }

        #endregion

        #region NewCode Tests

        [Fact]
        public async Task NewCode_ValidToken_ReturnsOkResult()
        {
            // Arrange
            var token = "valid_token";
            _mockNewCodeService.Setup(x => x.Generate(token))
                .ReturnsAsync("ok");

            // Act
            var result = await _controller.NewCode(token);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("New code has been generated!", okResult.Value);
        }

        [Fact]
        public async Task NewCode_InvalidToken_ReturnsBadRequest()
        {
            // Arrange
            var token = "invalid_token";
            _mockNewCodeService.Setup(x => x.Generate(token))
                .ReturnsAsync("invalidToken");

            // Act
            var result = await _controller.NewCode(token);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Token is invalid!", badRequestResult.Value);
        }

        [Fact]
        public async Task NewCode_InvalidUser_ReturnsBadRequest()
        {
            // Arrange
            var token = "valid_token_invalid_user";
            _mockNewCodeService.Setup(x => x.Generate(token))
                .ReturnsAsync("invalidUser");

            // Act
            var result = await _controller.NewCode(token);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("User doesn't exist!", badRequestResult.Value);
        }

        [Fact]
        public async Task NewCode_FailedToGenerate_ReturnsBadRequest()
        {
            // Arrange
            var token = "valid_token";
            _mockNewCodeService.Setup(x => x.Generate(token))
                .ReturnsAsync("failed");

            // Act
            var result = await _controller.NewCode(token);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Failed to generate OTP!", badRequestResult.Value);
        }

        #endregion

        #region Verify Tests

        [Fact]
        public async Task Verify_ValidVerification_ReturnsOkResult()
        {
            // Arrange
            var verificationDetails = new VerificationDetails("valid_token", "123456");
            _mockVerificationService.Setup(x => x.Handle(verificationDetails))
                .ReturnsAsync("ok");

            // Act
            var result = await _controller.Verify(verificationDetails);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Account verified successfully!", okResult.Value);
        }

        [Fact]
        public async Task Verify_NullCode_ReturnsBadRequest()
        {
            // Arrange
            var verificationDetails = new VerificationDetails("valid_token", null);

            // Act
            var result = await _controller.Verify(verificationDetails);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Code has not been sent!", badRequestResult.Value);
        }

        [Fact]
        public async Task Verify_InvalidToken_ReturnsBadRequest()
        {
            // Arrange
            var verificationDetails = new VerificationDetails("invalid_token", "123456");
            _mockVerificationService.Setup(x => x.Handle(verificationDetails))
                .ReturnsAsync("invalidToken");

            // Act
            var result = await _controller.Verify(verificationDetails);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Token is invalid!", badRequestResult.Value);
        }

        [Fact]
        public async Task Verify_InvalidUser_ReturnsBadRequest()
        {
            // Arrange
            var verificationDetails = new VerificationDetails("valid_token", "123456");
            _mockVerificationService.Setup(x => x.Handle(verificationDetails))
                .ReturnsAsync("invalidUser");

            // Act
            var result = await _controller.Verify(verificationDetails);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("User doesn't exist!", badRequestResult.Value);
        }

        [Fact]
        public async Task Verify_CodeExpired_ReturnsBadRequest()
        {
            // Arrange
            var verificationDetails = new VerificationDetails("valid_token", "123456");
            _mockVerificationService.Setup(x => x.Handle(verificationDetails))
                .ReturnsAsync("codeExpired");

            // Act
            var result = await _controller.Verify(verificationDetails);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Code expired. Please request for a new code.", badRequestResult.Value);
        }

        [Fact]
        public async Task Verify_InvalidCode_ReturnsBadRequest()
        {
            // Arrange
            var verificationDetails = new VerificationDetails("valid_token", "wrongcode");
            _mockVerificationService.Setup(x => x.Handle(verificationDetails))
                .ReturnsAsync("invalidCode");

            // Act
            var result = await _controller.Verify(verificationDetails);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Invalid code!", badRequestResult.Value);
        }

        #endregion

        #region ReturnByToken Tests

        [Fact]
        public async Task Return_ValidUserToken_ReturnsOkResult()
        {
            // Arrange
            var token = "valid_user_token";
            var authResult = new AuthenticationResult(
                user_id: 1,
                username: "testuser",
                email: "test@example.com",
                name: "Test User",
                profile_picture_id: 1,
                is_verified: true,
                token: token,
                role: "user"
            );

            _mockReturnByTokenService.Setup(x => x.Handle(token))
                .ReturnsAsync(authResult);

            // Act
            var result = await _controller.Return(token);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedResult = Assert.IsType<AuthenticationResult>(okResult.Value);
            Assert.Equal(authResult.username, returnedResult.username);
            Assert.Equal(authResult.role, returnedResult.role);
        }

        [Fact]
        public async Task Return_ValidAdminToken_ReturnsOkResult()
        {
            // Arrange
            var token = "valid_admin_token";
            var adminAuthResult = new AdminAuthenticationResult(
                admin_id: 1,
                username: "adminuser",
                email: "admin@example.com",
                name: "Admin User",
                contact_info: "1234",
                bio:"I am an admin.",
                profile_picture_id: 2,
                token: token,
                role: "admin"
            );

            _mockReturnByTokenService.Setup(x => x.Handle(token))
                .ReturnsAsync((AuthenticationResult)null);

            _mockReturnByTokenService.Setup(x => x.HandleAdmin(token))
                .ReturnsAsync(adminAuthResult);

            // Act
            var result = await _controller.Return(token);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedResult = Assert.IsType<AdminAuthenticationResult>(okResult.Value);
            Assert.Equal(adminAuthResult.username, returnedResult.username);
            Assert.Equal(adminAuthResult.role, returnedResult.role);
        }

        [Fact]
        public async Task Return_InvalidToken_ReturnsBadRequest()
        {
            // Arrange
            var token = "invalid_token";

            _mockReturnByTokenService.Setup(x => x.Handle(token))
                .ReturnsAsync((AuthenticationResult)null);

            _mockReturnByTokenService.Setup(x => x.HandleAdmin(token))
                .ReturnsAsync(null as Func<AdminAuthenticationResult?>);

            // Act
            var result = await _controller.Return(token);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("User doesn't exist!", badRequestResult.Value);
        }

        #endregion

        #region CheckToken Tests

        [Fact]
        public async Task Check_ValidToken_ReturnsOkResult()
        {
            // Arrange
            var token = "valid_token";
            var email = "test@example.com";

            _mockTokenCheck.Setup(x => x.Handle(token))
                .ReturnsAsync(email);

            // Act
            var result = await _controller.Check(token);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(email, okResult.Value);
        }

        [Fact]
        public async Task Check_InvalidToken_ReturnsBadRequest()
        {
            // Arrange
            var token = "invalid_token";

            _mockTokenCheck.Setup(x => x.Handle(token))
                .ReturnsAsync((string)null);

            // Act
            var result = await _controller.Check(token);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Invalid token!", badRequestResult.Value);
        }

        #endregion
    }
}