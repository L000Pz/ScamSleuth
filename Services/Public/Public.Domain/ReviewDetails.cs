namespace Public.Domain;

public class ReviewDetails
{
        public Review Review { get; set; }
        public Review_Content Content { get; set; }
        public Admin_Review Admin_Review { get; set; }
        public List<Review_Content_Media> Media { get; set; }
}