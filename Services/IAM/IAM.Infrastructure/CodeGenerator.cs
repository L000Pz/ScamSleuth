using IAM.Application.Common;

namespace IAM.Infrastructure;

public class CodeGenerator : ICodeGenerator
{
    public string GenerateCode()
    {
        // Generate a random 6-digit numeric code
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }
}