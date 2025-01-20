using User.Application.Common;
using User.Domain;

namespace User.Application.UserManagement;

public class ReturnReportById:IReturnReportById
{
    private readonly IUserRepository _userRepository;

    public ReturnReportById(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<ReportDetails?> Handle(int report_id)
    {
        var report = await _userRepository.GetReportById(report_id);
        if (report is null)
        {
            return null;
        }
        var writer = await _userRepository.GetReportWriter(report.report_id);
        if (writer is null)
        {
            return null;
        }
        var media = await _userRepository.GetReportMedia(report.report_id);
        return new ReportDetails
        {
            Report = report,
            User_Report = writer,
            Media = media
        };
    }
}