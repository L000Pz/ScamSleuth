using User.Domain;

namespace User.Application.UserManagement;

public interface IReturnReportById
{
    public Task<ReportDetails?> Handle(int review_id, string token);
}