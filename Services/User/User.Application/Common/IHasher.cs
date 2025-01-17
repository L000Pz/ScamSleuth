namespace User.Application.Common;

public interface IHasher
{
    String Hash(String password);
}