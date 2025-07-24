namespace Admin.Application.AdminManagement;

public interface IDeleteReport
{
    public Task<(string status, List<int>? mediaIds)> Handle(int report_id, string token);
}