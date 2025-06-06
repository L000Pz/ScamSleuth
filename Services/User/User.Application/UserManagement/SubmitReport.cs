using User.Contracts;
using User.Domain;
using User.Application.Common;

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
        Users? writer = await _userRepository.GetUserByEmail(token);
             if (writer is null)
             {
                 return "writer";
             }
        Report report = Report.Create(reportSubmission.title, writer.user_id,reportSubmission.scam_type_id, reportSubmission.scam_date,reportSubmission.report_date,
            reportSubmission.financial_loss, reportSubmission.description);
        Report? newReport=  await _userRepository.SubmitReport(report);
        if (newReport is null)
        {
            return "report";
        }
        List<Report_Media> reportMedia = Report_Media.Create(newReport.report_id, reportSubmission.media);
        await _userRepository.SubmitReportMedia(reportMedia);
        
        return "ok";
    }
}