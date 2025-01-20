using Admin.Contracts;

namespace Admin.Application.AdminManagement;

public interface ICreateReview
{
    public Task<string> Handle(ReviewCreation reviewCreation,string token);
}