using System.Runtime.InteropServices.JavaScript;
using IAM.Application.AuthenticationService;
using IAM.Application.Common;
using IAM.Contracts;
using IAM.Domain;
using IAM.Presentation.Controllers;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace IAM.Tests;

public class AuthControllerTests
{
    private readonly Mock<IRegisterService> _mockRegisterService;
    private readonly Mock<ILoginService> _mockLoginService;
    private readonly Mock<IVerificationService> _mockVerificationService;
    private readonly Mock<IJwtTokenGenerator> _mockJwtTokenGenerator;
    private readonly Mock<ICodeGenerator> _mockCodeGenerator;
    private readonly Mock<IInMemoryRepository> _mockInMemoryRepository;
    private readonly AuthController _controller;
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<INewCodeService> _mockNewCodeService;
    private readonly Mock<IHasher> _mockHasher;

    public AuthControllerTests()
    {
        _mockRegisterService = new Mock<IRegisterService>();
        _mockLoginService = new Mock<ILoginService>();
        _mockVerificationService = new Mock<IVerificationService>();
        _mockJwtTokenGenerator = new Mock<IJwtTokenGenerator>();
        _mockCodeGenerator = new Mock<ICodeGenerator>();
        _mockInMemoryRepository = new Mock<IInMemoryRepository>();
        _mockUserRepository = new Mock<IUserRepository>();
        _mockNewCodeService = new Mock<INewCodeService>();
        _mockHasher = new Mock<IHasher>();

        _controller = new AuthController(
            _mockRegisterService.Object,
            _mockLoginService.Object,
            _mockVerificationService.Object,
            _mockJwtTokenGenerator.Object,
            _mockCodeGenerator.Object,
            _mockInMemoryRepository.Object,
            _mockNewCodeService.Object
        );
    }

    [Fact]
    public async Task Login_ReturnOk()
    {
        //Arange
        var loginDetails = new LoginDetails("test", "test");
        var generatedToken = "generated_jwt_token";
        var mockUser = new Users { email = "test", password = "test" };

        _mockUserRepository
            .Setup(repo => repo.GetUserByEmail("test"))
            .ReturnsAsync(mockUser);

        _mockLoginService
            .Setup(service => service.Handle(loginDetails))
            .ReturnsAsync(new AuthenticationResult(mockUser, generatedToken));

        _mockJwtTokenGenerator
            .Setup(generator => generator.GenerateToken(mockUser))
            .Returns(generatedToken);

        // Act
        var result = await _controller.Login(loginDetails);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        var actualResult = Assert.IsType<AuthenticationResult>(okResult.Value);
        Assert.Equal(new AuthenticationResult(mockUser,generatedToken), actualResult);
    }
        
    [Fact]
    public async Task Login_ReturnUserDoesntExist()
    {
        //Arange
        var loginDetails = new LoginDetails("test2", "test");
        var generatedToken = "generated_jwt_token";
        var mockUser = new Users { email = "test", password = "test" };

        _mockUserRepository
            .Setup(repo => repo.GetUserByEmail("test"))
            .ReturnsAsync(mockUser);

        _mockLoginService
            .Setup(service => service.Handle(loginDetails))
            .ReturnsAsync((AuthenticationResult?)null);

        _mockJwtTokenGenerator
            .Setup(generator => generator.GenerateToken(mockUser))
            .Returns(generatedToken);

        // Act
        var result = await _controller.Login(loginDetails);

        // Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badResult.Value);

        var actualResult = Assert.IsType<String>(badResult.Value);
        Assert.Equal("User doesn't exist!", actualResult);
        
    }
    [Fact]
    public async Task Login_ReturnIncorrectPassword()
    {
        //Arange
        var loginDetails = new LoginDetails("test", "test2");
        var generatedToken = "generated_jwt_token";
        var mockUser = new Users { email = "test", password = "test" };

        _mockUserRepository
            .Setup(repo => repo.GetUserByEmail("test"))
            .ReturnsAsync(mockUser);

        _mockLoginService
            .Setup(service => service.Handle(loginDetails))
            .ReturnsAsync(new AuthenticationResult(null,"incorrect"));

        _mockJwtTokenGenerator
            .Setup(generator => generator.GenerateToken(mockUser))
            .Returns(generatedToken);

        // Act
        var result = await _controller.Login(loginDetails);

        // Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badResult.Value);

        var actualResult = Assert.IsType<String>(badResult.Value);
        Assert.Equal("Incorrect password!", actualResult);
        
    }

    [Fact]
    public async Task NewCode_ReturnOK()
    {
        //Arange
        var token = "token";
        _mockNewCodeService
            .Setup(service => service.Generate(token))
            .ReturnsAsync("ok");
        
        //Act
        var result = await _controller.NewCode(token);
        
        //Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        var actualResult = Assert.IsType<String>(okResult.Value);
        Assert.Equal("New code has been generated!", actualResult);
    }
    
    [Fact]
    public async Task NewCode_ReturnInvalidToken()
    {
        //Arange
        var token = "invalid_token";
        _mockNewCodeService
            .Setup(service => service.Generate(token))
            .ReturnsAsync("invalidToken");
        
        //Act
        var result = await _controller.NewCode(token);
        
        //Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badResult.Value);

        var actualResult = Assert.IsType<String>(badResult.Value);
        Assert.Equal("Token is invalid!", actualResult);
    }
    
    [Fact]
    public async Task NewCode_ReturnInvalidUser()
    {
        //Arange
        var token = "invalid_token";
        _mockNewCodeService
            .Setup(service => service.Generate(token))
            .ReturnsAsync("invalidUser");
        
        //Act
        var result = await _controller.NewCode(token);
        
        //Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badResult.Value);

        var actualResult = Assert.IsType<String>(badResult.Value);
        Assert.Equal("User doesn't exist!", actualResult);
    }
    
    [Fact]
    public async Task Verification_ReturnOK()
    {
        //Arange
        var verificationDetails = new VerificationDetails("token", "code");
        _mockVerificationService
            .Setup(service => service.Handle(verificationDetails))
            .ReturnsAsync(new AuthenticationResult(null,"ok"));
        
        //Act
        var result = await _controller.Verify(verificationDetails);
        
        //Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        var actualResult = Assert.IsType<String>(okResult.Value);
        Assert.Equal("Account verified successfully!", actualResult);
    }
    
    [Fact]
    public async Task Verification_ReturnInvalidToken()
    {
        //Arange
        var verificationDetails = new VerificationDetails("token", "code");
        var username = "test";
        _mockVerificationService
            .Setup(service => service.Handle(verificationDetails))
            .ReturnsAsync(new AuthenticationResult(null,"invalidToken"));
        _mockJwtTokenGenerator
            .Setup(generator => generator.GetUsername(verificationDetails.token))
            .Returns(username);
        //Act
        var result = await _controller.Verify(verificationDetails);
        
        //Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badResult.Value);

        var actualResult = Assert.IsType<String>(badResult.Value);
        Assert.Equal("Token is invalid!", actualResult);
    }
    
    [Fact]
    public async Task Verification_ReturnInvalidUser()
    {
        //Arange
        var verificationDetails = new VerificationDetails("token", "code");
        _mockVerificationService
            .Setup(service => service.Handle(verificationDetails))
            .ReturnsAsync(new AuthenticationResult(null,"invalidUser"));
        //Act
        var result = await _controller.Verify(verificationDetails);
        
        //Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badResult.Value);

        var actualResult = Assert.IsType<String>(badResult.Value);
        Assert.Equal("User doesn't exist!", actualResult);
    }
    
    [Fact]
    public async Task Verification_ReturnCodeExpired()
    {
        //Arange
        var verificationDetails = new VerificationDetails("token", "code");
        _mockVerificationService
            .Setup(service => service.Handle(verificationDetails))
            .ReturnsAsync(new AuthenticationResult(null,"codeExpired"));
        //Act
        var result = await _controller.Verify(verificationDetails);
        
        //Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badResult.Value);

        var actualResult = Assert.IsType<String>(badResult.Value);
        Assert.Equal("Code expired. Please request for a new code.", actualResult);
    }
    
    [Fact]
    public async Task Verification_ReturnInvalidCode()
    {
        //Arange
        var verificationDetails = new VerificationDetails("token", "code");
        _mockVerificationService
            .Setup(service => service.Handle(verificationDetails))
            .ReturnsAsync(new AuthenticationResult(null,"invalidCode"));
        //Act
        var result = await _controller.Verify(verificationDetails);
        
        //Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badResult.Value);

        var actualResult = Assert.IsType<String>(badResult.Value);
        Assert.Equal("Invalid code!", actualResult);
    }
    
    
    [Fact]
    public async Task Register_ReturnsOk()
    {
        // Arrange
        var registerDetails = new RegisterDetails("test", "test", "test", "test");
        var generatedCode = "123456";
        var hashedPassword = "hashedPassword123";
        var newUser = Users.Create(registerDetails.username, registerDetails.name, registerDetails.email, hashedPassword);
        var generatedToken = "generated_jwt_token";

        _mockUserRepository
            .Setup(repo => repo.GetUserByUsername(registerDetails.username))
            .ReturnsAsync((Users?)null);

        _mockUserRepository
            .Setup(repo => repo.GetUserByEmail(registerDetails.email))
            .ReturnsAsync((Users?)null);

        _mockCodeGenerator
            .Setup(generator => generator.GenerateCode())
            .Returns(generatedCode);

        _mockHasher
            .Setup(hasher => hasher.Hash(registerDetails.password))
            .Returns(hashedPassword);

        _mockJwtTokenGenerator
            .Setup(generator => generator.GenerateToken(It.IsAny<Users>()))
            .Returns(generatedToken);
        
        _mockRegisterService
            .Setup(service => service.Handle(registerDetails))
            .ReturnsAsync(new AuthenticationResult(newUser,generatedToken));
        // Act
        var result = await _controller.Register(registerDetails);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        var actualResult = Assert.IsType<AuthenticationResult>(okResult.Value);
        Assert.Equal(new AuthenticationResult(newUser, generatedToken), actualResult);
    }
    [Fact]
    public async Task Register_ReturnsUsernameAlreadyExists_WhenUserExists()
    {
        // Arrange
        var registerDetails = new RegisterDetails("test", "test", "test", "test");
        var existingUser = new Users { username = "test" };

        _mockUserRepository
            .Setup(repo => repo.GetUserByUsername(registerDetails.username))
            .ReturnsAsync(existingUser);
        
        _mockRegisterService
            .Setup(service => service.Handle(registerDetails))
            .ReturnsAsync(new AuthenticationResult(null,"username"));
        // Act
        var result = await _controller.Register(registerDetails);

        // Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badResult.Value);
        
        var actualResult = Assert.IsType<String>(badResult.Value);
        Assert.Equal("Username already exists!", actualResult);
    }

    [Fact]
    public async Task Register_ReturnsUsernameAlreadyExists_WhenAdminExists()
    {
        // Arrange
        var registerDetails = new RegisterDetails("test", "test", "test", "test");
        var existingAdmin = new Admins() { username = "test" };

        _mockUserRepository
            .Setup(repo => repo.GetUserByUsername(registerDetails.username))
            .ReturnsAsync((Users?)null);

        _mockUserRepository
            .Setup(repo => repo.GetAdminByUsername(registerDetails.username))
            .ReturnsAsync(existingAdmin);
        _mockRegisterService
            .Setup(service => service.Handle(registerDetails))
            .ReturnsAsync(new AuthenticationResult(null,"username"));

        // Act
        var result = await _controller.Register(registerDetails);

        // Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badResult.Value);
        
        var actualResult = Assert.IsType<String>(badResult.Value);
        Assert.Equal("Username already exists!", actualResult);
    }

    [Fact]
    public async Task Register_ReturnsEmailAlreadyExists_WhenUserExists()
    {
        // Arrange
        var registerDetails = new RegisterDetails("test", "test", "test", "test");
        var existingUser = new Users { email = "test" };

        _mockUserRepository
            .Setup(repo => repo.GetUserByUsername(registerDetails.username))
            .ReturnsAsync((Users?)null);

        _mockUserRepository
            .Setup(repo => repo.GetAdminByUsername(registerDetails.username))
            .ReturnsAsync((Admins?)null);

        _mockUserRepository
            .Setup(repo => repo.GetUserByEmail(registerDetails.email))
            .ReturnsAsync(existingUser);
        
        _mockRegisterService
            .Setup(service => service.Handle(registerDetails))
            .ReturnsAsync(new AuthenticationResult(null,"email"));

        // Act
        var result = await _controller.Register(registerDetails);

        // Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badResult.Value);
        
        var actualResult = Assert.IsType<String>(badResult.Value);
        Assert.Equal("Email already exists!", actualResult);
    }

    [Fact]
    public async Task Register_ReturnsEmailAlreadyExists_WhenAdminExists()
    {
        // Arrange
        var registerDetails = new RegisterDetails("test", "test", "test", "test");
        var existingAdmin = new Admins { email = "test" };

        _mockUserRepository
            .Setup(repo => repo.GetUserByUsername(registerDetails.username))
            .ReturnsAsync((Users?)null);

        _mockUserRepository
            .Setup(repo => repo.GetAdminByUsername(registerDetails.username))
            .ReturnsAsync((Admins?)null);

        _mockUserRepository
            .Setup(repo => repo.GetUserByEmail(registerDetails.email))
            .ReturnsAsync((Users?)null);

        _mockUserRepository
            .Setup(repo => repo.GetAdminByEmail(registerDetails.email))
            .ReturnsAsync(existingAdmin);
        _mockRegisterService
            .Setup(service => service.Handle(registerDetails))
            .ReturnsAsync(new AuthenticationResult(null,"email"));

        // Act
        var result = await _controller.Register(registerDetails);

        // Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badResult.Value);
        
        var actualResult = Assert.IsType<String>(badResult.Value);
        Assert.Equal("Email already exists!", actualResult);
    }


}