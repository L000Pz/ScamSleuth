using Public.Domain;

namespace Public.Application.PublicManagement;

public interface IGetScamTypes
{
    public Task<List<Scam_Type>?> Handle();
}