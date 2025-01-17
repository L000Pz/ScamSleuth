using Core.Domain;

namespace Core.Application.UserManagement;

public interface IGetUserReports
{
    public Task<List<Report>?> Handle(string token);
}