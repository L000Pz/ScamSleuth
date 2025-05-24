using Admin.Application.Common;
using Admin.Contracts;
using Admin.Domain;

namespace Admin.Application.AdminManagement;

public class GetReportById : IGetReportById
{
    private readonly IReportRepository _reportRepository;
    private readonly IAdminRepository _adminRepository;

    public GetReportById(IReportRepository reportRepository, IAdminRepository adminRepository)
    {
        _reportRepository = reportRepository;
        _adminRepository = adminRepository;
    }

    public async Task<ReportDetails?> Handle(int report_id, string token)
    {
        Admins? confirmAdmin = await _adminRepository.GetAdminByEmail(token);
        if (confirmAdmin is null)
        {
            return new ReportDetails
            {
                ReportWriterDetails = null
            };
        }
        var report = await _reportRepository.GetReportById(report_id);
        if (report is null)
        {
            return null;
        }
        var writer = await _reportRepository.GetUserById(report.writer_id);
        var writer_details = new ReportWriterDetails(writer.user_id, writer.username, writer.email, writer.name,
            writer.profile_picture_id, writer.is_verified);
        var media = await _reportRepository.GetReportMedia(report.report_id);
        return new ReportDetails
        {
            Report = report,
            Media = media,
            ReportWriterDetails = writer_details
        };
    }
}