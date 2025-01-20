namespace User.Application.UserManagement;

public interface IRemoveReport
{
    public Task<List<int>?> Handle(int report_id);
}