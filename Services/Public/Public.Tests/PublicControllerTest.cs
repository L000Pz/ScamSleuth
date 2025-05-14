/*using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Moq;
using Public.Application.PublicManagement;
using Public.Domain;
using Public.Presentation.Controllers;

namespace Public.Tests
{
    public class PublicControllerTests
    {
        private readonly Mock<IShowAllReviews> _mockShowAllReviews;
        private readonly Mock<IShowRecentReviews> _mockShowRecentReviews;
        private readonly Mock<IReturnReviewById> _mockReturnReviewById;
        private readonly Mock<IGetScamTypes> _mockGetScamTypes;
        private readonly PublicController _controller;
        
        private static DateTime testDate = DateTime.Now;

        public PublicControllerTests()
        {
            _mockShowAllReviews = new Mock<IShowAllReviews>();
            _mockShowRecentReviews = new Mock<IShowRecentReviews>();
            _mockReturnReviewById = new Mock<IReturnReviewById>();
            _mockGetScamTypes = new Mock<IGetScamTypes>();

            _controller = new PublicController(
                _mockShowAllReviews.Object,
                _mockShowRecentReviews.Object,
                _mockReturnReviewById.Object,
                _mockGetScamTypes.Object
            );
        }

        private Review CreateTestReview(int id)
        {
            return new Review
            {
                review_id = id,
                title = $"Test Review {id}",
                scam_type_id = id,
                review_date = testDate,
                review_content_id = id
            };
        }

        private ReviewDetails CreateTestReviewDetails(int id)
        {
            return new ReviewDetails
            {
                Review = new Review
                {
                    review_id = id,
                    title = $"Test Review {id}",
                    scam_type_id = id,
                    review_date = testDate,
                    review_content_id = id
                },
                Content = new Review_Content
                {
                    review_content_id = id,
                    review_content = $"Test Content {id}"
                },
                
            };
        }

        // GetRecentReviews Tests
        [Fact]
        public async Task GetRecentReviews_HasReviews_ReturnsOkResult()
        {
            // Arrange
            var reviews = new List<Review>
            {
                CreateTestReview(1),
                CreateTestReview(2)
            };

            _mockShowRecentReviews
                .Setup(x => x.Handle(10))
                .ReturnsAsync(reviews);

            // Act
            var result = await _controller.GetRecentReviews();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedReviews = Assert.IsType<List<Review>>(okResult.Value);
            Assert.Equal(2, returnedReviews.Count);
            Assert.Equal(1, returnedReviews[0].review_id);
            Assert.Equal(2, returnedReviews[1].review_id);
        }

        [Fact]
        public async Task GetRecentReviews_NoReviews_ReturnsBadRequest()
        {
            // Arrange
            _mockShowRecentReviews
                .Setup(x => x.Handle(10))
                .ReturnsAsync((List<Review>)null);

            // Act
            var result = await _controller.GetRecentReviews();

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("No reviews found", badRequestResult.Value);
        }

        // GetAllReviews Tests
        [Fact]
        public async Task GetAllReviews_HasReviews_ReturnsOkResult()
        {
            // Arrange
            var reviews = new List<Review>
            {
                CreateTestReview(1),
                CreateTestReview(2),
                CreateTestReview(3)
            };

            _mockShowAllReviews
                .Setup(x => x.Handle())
                .ReturnsAsync(reviews);

            // Act
            var result = await _controller.GetAllReviews();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedReviews = Assert.IsType<List<Review>>(okResult.Value);
            Assert.Equal(3, returnedReviews.Count);
            Assert.Equal("Test Review 1", returnedReviews[0].title);
        }

        [Fact]
        public async Task GetAllReviews_NoReviews_ReturnsBadRequest()
        {
            // Arrange
            _mockShowAllReviews
                .Setup(x => x.Handle())
                .ReturnsAsync((List<Review>)null);

            // Act
            var result = await _controller.GetAllReviews();

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("No reviews were found!", badRequestResult.Value);
        }

        // ReturnScamTypes Tests
        [Fact]
        public async Task ReturnScamTypes_HasScamTypes_ReturnsOkResult()
        {
            // Arrange
            var scamTypes = new List<Scam_Type>
            {
                new Scam_Type { scam_type_id = 1, scam_type = "Phishing" },
                new Scam_Type { scam_type_id = 2, scam_type = "Identity Theft" }
            };

            _mockGetScamTypes
                .Setup(x => x.Handle())
                .ReturnsAsync(scamTypes);

            // Act
            var result = await _controller.ReturnScamTypes();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedScamTypes = Assert.IsType<List<Scam_Type>>(okResult.Value);
            Assert.Equal(2, returnedScamTypes.Count);
            Assert.Equal("Phishing", returnedScamTypes[0].scam_type);
        }

        [Fact]
        public async Task ReturnScamTypes_NoScamTypes_ReturnsBadRequest()
        {
            // Arrange
            _mockGetScamTypes
                .Setup(x => x.Handle())
                .ReturnsAsync((List<Scam_Type>)null);

            // Act
            var result = await _controller.ReturnScamTypes();

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("No scam type exists!", badRequestResult.Value);
        }

        // GetReviewById Tests
        [Fact]
        public async Task GetReviewById_ExistingReview_ReturnsOkResult()
        {
            // Arrange
            var reviewDetails = CreateTestReviewDetails(1);
            _mockReturnReviewById
                .Setup(x => x.Handle(1))
                .ReturnsAsync(reviewDetails);

            // Act
            var result = await _controller.GetReviewById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedReview = Assert.IsType<ReviewDetails>(okResult.Value);
            Assert.Equal(1, returnedReview.Review.review_id);
        }

        [Fact]
        public async Task GetReviewById_NonExistingReview_ReturnsBadRequest()
        {
            // Arrange
            _mockReturnReviewById
                .Setup(x => x.Handle(999))
                .ReturnsAsync((ReviewDetails)null);

            // Act
            var result = await _controller.GetReviewById(999);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Review information could not be found!", badRequestResult.Value);
        }

        [Fact]
        public async Task GetReviewById_ZeroId_ReturnsBadRequest()
        {
            // Arrange
            _mockReturnReviewById
                .Setup(x => x.Handle(0))
                .ReturnsAsync((ReviewDetails)null);

            // Act
            var result = await _controller.GetReviewById(0);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Review information could not be found!", badRequestResult.Value);
        }

        // Edge Cases
        [Fact]
        public async Task GetRecentReviews_EmptyList_ReturnsOkResult()
        {
            // Arrange
            var emptyList = new List<Review>();
            _mockShowRecentReviews
                .Setup(x => x.Handle(10))
                .ReturnsAsync(emptyList);

            // Act
            var result = await _controller.GetRecentReviews();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedReviews = Assert.IsType<List<Review>>(okResult.Value);
            Assert.Empty(returnedReviews);
        }

        [Fact]
        public async Task GetAllReviews_EmptyList_ReturnsOkResult()
        {
            // Arrange
            var emptyList = new List<Review>();
            _mockShowAllReviews
                .Setup(x => x.Handle())
                .ReturnsAsync(emptyList);

            // Act
            var result = await _controller.GetAllReviews();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedReviews = Assert.IsType<List<Review>>(okResult.Value);
            Assert.Empty(returnedReviews);
        }

        [Fact]
        public async Task ReturnScamTypes_EmptyList_ReturnsOkResult()
        {
            // Arrange
            var emptyList = new List<Scam_Type>();
            _mockGetScamTypes
                .Setup(x => x.Handle())
                .ReturnsAsync(emptyList);

            // Act
            var result = await _controller.ReturnScamTypes();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedScamTypes = Assert.IsType<List<Scam_Type>>(okResult.Value);
            Assert.Empty(returnedScamTypes);
        }
    }
}*/