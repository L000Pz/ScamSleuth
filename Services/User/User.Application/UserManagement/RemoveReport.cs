using User.Application.Common;

namespace User.Application.UserManagement;

public class RemoveReport : IRemoveReport
{
    private readonly IUserRepository _userRepository;

    public RemoveReport(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<List<int>?> Handle(int report_id)
    {
        var isRemoved = await _userRepository.DeleteReport(report_id);
        if (isRemoved is false) return null;

        var media_id = await _userRepository.GetReportMedia(report_id);
        return media_id;
    }
}