namespace IAM.Application.Common;

public interface IHasher
{
    String Hash(String password);
}