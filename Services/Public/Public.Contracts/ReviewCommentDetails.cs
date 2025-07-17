using Public.Domain;

namespace Public.Contracts;

public class ReviewCommentDetails
{
    public ReviewComment Comments { get; set; }
    public  CommentWriterDetails WriterDetails { get; set; }
}