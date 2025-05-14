using Admin.Domain;

namespace Admin.Application.AdminManagement;

public interface IGetReportById
{
    public Task<ReportDetails?> Handle(int review_id,string token);
}