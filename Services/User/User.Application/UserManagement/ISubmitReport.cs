using User.Contracts;

namespace User.Application.UserManagement;

public interface ISubmitReport
{
    public Task<string> Handle(ReportSubmission reportSubmission, string token);
}