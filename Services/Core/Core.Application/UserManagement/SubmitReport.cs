using Core.Application.Common;
using Core.Contracts;
using Core.Domain;

namespace Core.Application.UserManagement;

public class SubmitReport : ISubmitReport
{
    private readonly IUserRepository _userRepository;

    public SubmitReport(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }
    public async Task<string> Handle(ReportSubmission reportSubmission, string token)
    {
        Report report = Report.Create(reportSubmission.title, reportSubmission.scam_type_id, reportSubmission.scam_date,
            reportSubmission.financial_loss, reportSubmission.description);
        Report? newReport=  await _userRepository.SubmitReport(report);
        if (newReport is null)
        {
            return "report";
        }
        Report_Media reportMedia = Report_Media.Create(newReport.report_id, reportSubmission.media_id);
        await _userRepository.SubmitReportMedia(reportMedia);
        Users? writer = await _userRepository.GetUserByEmail(token);
        if (writer is null)
        {
            return "writer";
        }
        User_Report userReport = User_Report.Create(newReport.report_id, writer.user_id);
        await _userRepository.SubmitReportMedia(reportMedia);
        return "ok";
    }
}