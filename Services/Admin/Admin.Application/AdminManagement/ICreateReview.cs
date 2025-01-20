namespace Admin.Application.AdminManagement;

public interface ICreateReview
{
    public Task<string> Handle(ReportSubmission reportSubmission,string token);
}