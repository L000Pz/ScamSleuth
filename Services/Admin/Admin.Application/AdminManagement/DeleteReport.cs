using Admin.Application.Common;
using Admin.Domain;

namespace Admin.Application.AdminManagement;

public class DeleteReport : IDeleteReport
{
    private readonly IAdminRepository _adminRepository;
    private readonly IReportRepository _reportRepository;

    public DeleteReport(IAdminRepository adminRepository, IReportRepository reportRepository)
    {
        _adminRepository = adminRepository;
        _reportRepository = reportRepository;
    }

    public async Task<(string status, List<int>? mediaIds)> Handle(int report_id, string token)
    {
        Admins? admin = await _adminRepository.GetAdminByEmail(token);
        if (admin is null)
        {
            return ("access", null);
        }

        Report? report = await _reportRepository.GetReportById(report_id);
        if (report is null)
        {
            return ("report", null);
        }

        List<int>? mediaIds = await _reportRepository.GetReportMediaIds(report.report_id);

        bool mediaDeleted = await _reportRepository.DeleteReportMedia(report.report_id);
        if (!mediaDeleted)
        {
            return ("media", null);
        }

        bool reportDeleted = await _reportRepository.DeleteReport(report_id);
        if (!reportDeleted)
        {
            return ("delete", null);
        }

        return ("ok", mediaIds);
    }
}