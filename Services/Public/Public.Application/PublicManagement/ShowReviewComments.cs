using Public.Application.Common;
using Public.Contracts;
using Public.Domain;

namespace Public.Application.PublicManagement;

public class ShowReviewComments : IShowReviewComments
{
    private readonly IPublicRepository _publicRepository;

    public ShowReviewComments(IPublicRepository publicRepository)
    {
        _publicRepository = publicRepository;
    }

    public async Task<List<ReviewCommentDetails>?> Handle(int review_id)
    {
        Review? review = await _publicRepository.GetReviewById(review_id);
        if (review is null)
        {
            return null;
        }

        var comments = await _publicRepository.GetAllReviewComments(review_id);
        var comments_with_writer = new List<ReviewCommentDetails>();
        foreach (var comment in comments)
        {
            if (comment.writer_role == "admin")
            {
                var writer = await _publicRepository.GetAdminById(comment.writer_id);
                CommentWriterDetails writerDetails =
                    new CommentWriterDetails(writer.username, writer.name, writer.profile_picture_id);
                comments_with_writer.Add(new ReviewCommentDetails()
                    {
                        Comments = comment,
                        WriterDetails = writerDetails
                    }
                );
            }
            else if (comment.writer_role == "user")
            {
                var writer = await _publicRepository.GetUserById(comment.writer_id);
                CommentWriterDetails writerDetails =
                    new CommentWriterDetails(writer.username, writer.name, writer.profile_picture_id);
                comments_with_writer.Add(new ReviewCommentDetails()
                    {
                        Comments = comment,
                        WriterDetails = writerDetails
                    }
                );
            }
        }

        return comments_with_writer;
    }
}