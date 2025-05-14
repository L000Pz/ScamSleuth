using Public.Domain;

namespace Public.Contracts;

public class ReviewDetails
{
        public Review Review { get; set; }
        public string Content { get; set; }
        public ReviewWriterDetails ReviewWriterDetails { get; set; }
}