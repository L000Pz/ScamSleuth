using Core.Contracts;
using Core.Domain;

namespace Core.Application.UserManagement;

public interface ISubmitReport
{
    public Task<string> Handle(ReportSubmission reportSubmission,string token);

}