using User.Contracts;

namespace User.Application.UserManagement;

public interface IEditUserInfo
{
    public Task<string?> Handle(EditInfo editInfo);
}