namespace User.Application.Common;

public interface IHasher
{
    string Hash(string password);
}