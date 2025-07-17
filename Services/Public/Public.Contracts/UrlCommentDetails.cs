using Public.Domain;

namespace Public.Contracts;

public class UrlCommentDetails
{
    public UrlComment Comments { get; set; }
    public  CommentWriterDetails WriterDetails { get; set; }
}