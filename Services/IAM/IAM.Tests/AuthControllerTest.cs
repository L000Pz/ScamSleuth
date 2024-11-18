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

    public AuthControllerTests()
    {
        _mockRegisterService = new Mock<IRegisterService>();
        _mockLoginService = new Mock<ILoginService>();
        _mockVerificationService = new Mock<IVerificationService>();
        _mockJwtTokenGenerator = new Mock<IJwtTokenGenerator>();
        _mockCodeGenerator = new Mock<ICodeGenerator>();
        _mockInMemoryRepository = new Mock<IInMemoryRepository>();
        _mockUserRepository = new Mock<IUserRepository>();

        _controller = new AuthController(
            _mockRegisterService.Object,
            _mockLoginService.Object,
            _mockVerificationService.Object,
            _mockJwtTokenGenerator.Object,
            _mockCodeGenerator.Object,
            _mockInMemoryRepository.Object
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
    
}