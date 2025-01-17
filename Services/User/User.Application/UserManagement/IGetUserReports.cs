using User.Domain;

namespace User.Application.UserManagement;

public interface IGetUserReports
{
    public Task<List<Report>?> Handle(string token);
}