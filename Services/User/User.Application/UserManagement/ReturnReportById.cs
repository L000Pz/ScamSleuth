using User.Application.Common;
using User.Contracts;
using User.Domain;

namespace User.Application.UserManagement;

public class ReturnReportById:IReturnReportById
{
    private readonly IUserRepository _userRepository;

    public ReturnReportById(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<ReportDetails?> Handle(int report_id, string token)
    {
        var report = await _userRepository.GetReportById(report_id);
        if (report is null)
        {
            return null;
        }
        Users? confirmWriter = await _userRepository.GetUserByEmail(token);
        var writer = await _userRepository.GetUserById(report.writer_id);
        if (!writer.Equals(confirmWriter))
        {
            return new ReportDetails
            {
                WriterDetails = null
            };
        }
        var writer_details = new WriterDetails(writer.user_id, writer.username, writer.email, writer.name,
            writer.profile_picture_id, writer.is_verified);
        var media = await _userRepository.GetReportMedia(report.report_id);
        return new ReportDetails
        {
            Report = report,
            Media = media,
            WriterDetails = writer_details
        };
    }
}