using Admin.Domain;

namespace Admin.Application.AdminManagement;

public interface IGetAdminReviews
{
    public Task<List<Review>?> Handle(string token);

}