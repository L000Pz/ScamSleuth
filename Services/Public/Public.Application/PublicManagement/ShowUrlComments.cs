using Public.Application.Common;
using Public.Contracts;
using Public.Domain;

namespace Public.Application.PublicManagement;

public class ShowUrlComments : IShowUrlComments
{
    private readonly IPublicRepository _publicRepository;

    public ShowUrlComments(IPublicRepository publicRepository)
    {
        _publicRepository = publicRepository;
    }

    public async Task<List<UrlCommentDetails>?> Handle(string url_path)
    {
        UrlStorage? url = await _publicRepository.GetUrl(url_path);
        if (url is null)
        {
            return null;
        }

        var comments = await _publicRepository.GetAllUrlComments(url.url_id);
        var comments_with_writer = new List<UrlCommentDetails>();
        foreach (var comment in comments)
        {
            if (comment.writer_role == "admin")
            {
                var writer = await _publicRepository.GetAdminById(comment.writer_id);
                CommentWriterDetails writerDetails =
                    new CommentWriterDetails(writer.username, writer.name, writer.profile_picture_id);
                comments_with_writer.Add(new UrlCommentDetails()
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
                comments_with_writer.Add(new UrlCommentDetails()
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