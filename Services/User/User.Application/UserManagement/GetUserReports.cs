using User.Domain;
using User.Application.Common;

namespace User.Application.UserManagement;

public class GetUserReports : IGetUserReports
{
    private readonly IUserRepository _userRepository;

    public GetUserReports(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<List<Report>?> Handle(string token)
    {
        var user = await _userRepository.GetUserByEmail(token);
        if (user is null)
        {
            return null;
        }
        return await _userRepository.GetUserReports(user.email);
    }
}