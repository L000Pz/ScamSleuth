using System.Security.Cryptography;
using System.Text;
using User.Application.Common;

namespace User.Infrastructure.Hasher;

public class Hasher : IHasher
{
    public string Hash(string code)
    {
        var sha256 = SHA256.Create();
        var codeBytes = Encoding.UTF8.GetBytes(code);
        var hasBytes = sha256.ComputeHash(codeBytes);
        var hashed = new StringBuilder();
        for (var i = 0; i < hasBytes.Length; i++) hashed.Append(hasBytes[i].ToString("X2"));

        return hashed.ToString();
    }
}