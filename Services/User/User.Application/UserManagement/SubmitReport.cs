using User.Application.Common;
using User.Contracts;
using User.Domain;

namespace User.Application.UserManagement;

public class SubmitReport : ISubmitReport
{
    private readonly IUserRepository _userRepository;

    public SubmitReport(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<string> Handle(ReportSubmission reportSubmission, string token)
    {
        var writer = await _userRepository.GetUserByEmail(token);
        if (writer is null) return "writer";
        var checkDesc = await _userRepository.GetReportByDescription(reportSubmission.description);
        if (checkDesc is not null)
        {
            return "description";
        }
        var now = DateTime.Now;
        var report = Report.Create(reportSubmission.title, writer.user_id, reportSubmission.scam_type_id,
            reportSubmission.scam_date, now,
            reportSubmission.financial_loss, reportSubmission.description);
        var newReport = await _userRepository.SubmitReport(report);
        if (newReport is null) return "report";
        var reportMedia = Report_Media.Create(newReport.report_id, reportSubmission.media);
        await _userRepository.SubmitReportMedia(reportMedia);

        return "ok";
    }
}