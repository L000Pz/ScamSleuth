using Microsoft.AspNetCore.Mvc;
using Moq;
using Public.Application.PublicManagement;
using Public.Contracts;
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
        private readonly Mock<IShowReviewComments> _mockShowReviewComments;
        private readonly Mock<IShowUrlComments> _mockShowUrlComments;
        private readonly Mock<IGetUrlRating> _mockGetUrlRating;
        private readonly Mock<IShowRecentComments> _mockShowRecentComments;
        private readonly Mock<ISearchReviews> _mockSearchReviews;
        private readonly PublicController _controller;
        
        private static DateTime testDate = DateTime.Now;

        public PublicControllerTests()
        {
            _mockShowAllReviews = new Mock<IShowAllReviews>();
            _mockShowRecentReviews = new Mock<IShowRecentReviews>();
            _mockReturnReviewById = new Mock<IReturnReviewById>();
            _mockGetScamTypes = new Mock<IGetScamTypes>();
            _mockShowReviewComments = new Mock<IShowReviewComments>();
            _mockShowUrlComments = new Mock<IShowUrlComments>();
            _mockGetUrlRating = new Mock<IGetUrlRating>();
            _mockShowRecentComments = new Mock<IShowRecentComments>();
            _mockSearchReviews = new Mock<ISearchReviews>();

            _controller = new PublicController(
                _mockShowAllReviews.Object,
                _mockShowRecentReviews.Object,
                _mockReturnReviewById.Object,
                _mockGetScamTypes.Object,
                _mockShowReviewComments.Object,
                _mockShowUrlComments.Object,
                _mockGetUrlRating.Object,
                _mockShowRecentComments.Object,
                _mockSearchReviews.Object
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
                Content = $"Test Content {id}",
                Media = new List<Review_Content_Media>(),
                ReviewWriterDetails = new ReviewWriterDetails("testuser", "Test User", null, "test@example.com")
            };
        }

        private ReviewCommentDetails CreateTestReviewComment(int id)
        {
            return new ReviewCommentDetails
            {
                Comments = new ReviewComment
                {
                    comment_id = id,
                    review_id = 1,
                    writer_id = id,
                    writer_role = "user",
                    comment_content = $"Test comment {id}",
                    created_at = testDate
                },
                WriterDetails = new CommentWriterDetails($"user{id}", $"User {id}", null)
            };
        }

        private UrlCommentDetails CreateTestUrlComment(int id)
        {
            return new UrlCommentDetails
            {
                Comments = new UrlComment
                {
                    comment_id = id,
                    url_id = 1,
                    writer_id = id,
                    writer_role = "user",
                    rating = 4,
                    comment_content = $"Test URL comment {id}",
                    created_at = testDate
                },
                WriterDetails = new CommentWriterDetails($"user{id}", $"User {id}", null)
            };
        }

        private RecentCommentDetails CreateTestRecentComment(int id)
        {
            return new RecentCommentDetails(
                $"user{id}",
                $"Recent comment {id}",
                "https://example.com",
                4.5,
                testDate
            );
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

        // GetRecentComments Tests
        [Fact]
        public async Task GetRecentComments_HasComments_ReturnsOkResult()
        {
            // Arrange
            var comments = new List<RecentCommentDetails>
            {
                CreateTestRecentComment(1),
                CreateTestRecentComment(2)
            };

            _mockShowRecentComments
                .Setup(x => x.Handle(3))
                .ReturnsAsync(comments);

            // Act
            var result = await _controller.GetRecentComments();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedComments = Assert.IsType<List<RecentCommentDetails>>(okResult.Value);
            Assert.Equal(2, returnedComments.Count);
            Assert.Equal("user1", returnedComments[0].username);
        }

        [Fact]
        public async Task GetRecentComments_NoComments_ReturnsBadRequest()
        {
            // Arrange
            _mockShowRecentComments
                .Setup(x => x.Handle(3))
                .ReturnsAsync((List<RecentCommentDetails>)null);

            // Act
            var result = await _controller.GetRecentComments();

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("No comments could be found!", badRequestResult.Value);
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

        // GetReviewComments Tests
        [Fact]
        public async Task GetReviewComments_HasComments_ReturnsOkResult()
        {
            // Arrange
            var comments = new List<ReviewCommentDetails>
            {
                CreateTestReviewComment(1),
                CreateTestReviewComment(2)
            };

            _mockShowReviewComments
                .Setup(x => x.Handle(1))
                .ReturnsAsync(comments);

            // Act
            var result = await _controller.GetReviewComments(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedComments = Assert.IsType<List<ReviewCommentDetails>>(okResult.Value);
            Assert.Equal(2, returnedComments.Count);
            Assert.Equal("Test comment 1", returnedComments[0].Comments.comment_content);
        }

        [Fact]
        public async Task GetReviewComments_NoComments_ReturnsBadRequest()
        {
            // Arrange
            _mockShowReviewComments
                .Setup(x => x.Handle(999))
                .ReturnsAsync((List<ReviewCommentDetails>)null);

            // Act
            var result = await _controller.GetReviewComments(999);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("No comments could be found for this review!", badRequestResult.Value);
        }

        // GetUrlComments Tests
        [Fact]
        public async Task GetUrlComments_HasComments_ReturnsOkResult()
        {
            // Arrange
            var url = "https://example.com";
            var comments = new List<UrlCommentDetails>
            {
                CreateTestUrlComment(1),
                CreateTestUrlComment(2)
            };

            _mockShowUrlComments
                .Setup(x => x.Handle(url))
                .ReturnsAsync(comments);

            // Act
            var result = await _controller.GetUrlComments(url);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedComments = Assert.IsType<List<UrlCommentDetails>>(okResult.Value);
            Assert.Equal(2, returnedComments.Count);
            Assert.Equal("Test URL comment 1", returnedComments[0].Comments.comment_content);
        }

        [Fact]
        public async Task GetUrlComments_NoComments_ReturnsBadRequest()
        {
            // Arrange
            var url = "https://nonexistent.com";
            _mockShowUrlComments
                .Setup(x => x.Handle(url))
                .ReturnsAsync((List<UrlCommentDetails>)null);

            // Act
            var result = await _controller.GetUrlComments(url);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("No comments could be found for this url!", badRequestResult.Value);
        }

        // GetUrlRatings Tests
        [Fact]
        public async Task GetUrlRatings_HasRatings_ReturnsOkResult()
        {
            // Arrange
            var url = "https://example.com";
            var ratings = new UrlRatings(4.2, 100, 30, 25, 20, 15, 10);

            _mockGetUrlRating
                .Setup(x => x.Handle(url))
                .ReturnsAsync(ratings);

            // Act
            var result = await _controller.GetUrlRatings(url);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedRatings = Assert.IsType<UrlRatings>(okResult.Value);
            Assert.Equal(4.2, returnedRatings.average);
            Assert.Equal(100, returnedRatings.count);
        }

        [Fact]
        public async Task GetUrlRatings_NoRatings_ReturnsBadRequest()
        {
            // Arrange
            var url = "https://nonexistent.com";
            _mockGetUrlRating
                .Setup(x => x.Handle(url))
                .ReturnsAsync((UrlRatings)null);

            // Act
            var result = await _controller.GetUrlRatings(url);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Couldn't retrieve url's ratings!", badRequestResult.Value);
        }

        // Search Tests
        [Fact]
        public async Task Search_HasResults_ReturnsOkResult()
        {
            // Arrange
            var searchInput = "phishing";
            var searchResults = new List<Review>
            {
                CreateTestReview(1),
                CreateTestReview(2)
            };

            _mockSearchReviews
                .Setup(x => x.Handle(searchInput))
                .ReturnsAsync(searchResults);

            // Act
            var result = await _controller.Search(searchInput);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedResults = Assert.IsType<List<Review>>(okResult.Value);
            Assert.Equal(2, returnedResults.Count);
        }

        [Fact]
        public async Task Search_NoResults_ReturnsBadRequest()
        {
            // Arrange
            var searchInput = "nonexistent";
            _mockSearchReviews
                .Setup(x => x.Handle(searchInput))
                .ReturnsAsync((List<Review>)null);

            // Act
            var result = await _controller.Search(searchInput);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Couldn't find any matched results!", badRequestResult.Value);
        }

        [Fact]
        public async Task Search_EmptyInput_ReturnsOkResult()
        {
            // Arrange
            var searchInput = "";
            var searchResults = new List<Review>();

            _mockSearchReviews
                .Setup(x => x.Handle(searchInput))
                .ReturnsAsync(searchResults);

            // Act
            var result = await _controller.Search(searchInput);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedResults = Assert.IsType<List<Review>>(okResult.Value);
            Assert.Empty(returnedResults);
        }

        // View Tests
        [Fact]
        public async Task View_ValidReviewId_ReturnsOkResult()
        {
            // Arrange
            var reviewId = 1;
            _mockReturnReviewById
                .Setup(x => x.HandleView(reviewId))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.View(reviewId);

            // Assert
            var okResult = Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task View_InvalidReviewId_ReturnsBadRequest()
        {
            // Arrange
            var reviewId = 999;
            _mockReturnReviewById
                .Setup(x => x.HandleView(reviewId))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.View(reviewId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Couldn't increase view!", badRequestResult.Value);
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

        [Fact]
        public async Task GetUrlComments_EmptyUrl_ReturnsBadRequest()
        {
            // Arrange
            var emptyUrl = "";
            _mockShowUrlComments
                .Setup(x => x.Handle(emptyUrl))
                .ReturnsAsync((List<UrlCommentDetails>)null);

            // Act
            var result = await _controller.GetUrlComments(emptyUrl);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("No comments could be found for this url!", badRequestResult.Value);
        }

        [Fact]
        public async Task GetUrlRatings_EmptyUrl_ReturnsBadRequest()
        {
            // Arrange
            var emptyUrl = "";
            _mockGetUrlRating
                .Setup(x => x.Handle(emptyUrl))
                .ReturnsAsync((UrlRatings)null);

            // Act
            var result = await _controller.GetUrlRatings(emptyUrl);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Couldn't retrieve url's ratings!", badRequestResult.Value);
        }
    }
}