using User.Contracts;
using User.Domain;

namespace User.Application.UserManagement;

public interface IEditUserInfo
{
    public Task<string?> Handle(EditInfo editInfo);

}