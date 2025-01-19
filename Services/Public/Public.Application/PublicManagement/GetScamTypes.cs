using Public.Application.Common;
using Public.Domain;

namespace Public.Application.PublicManagement;

public class GetScamTypes:IGetScamTypes
{
    private readonly IPublicRepository _publicRepository;

    public GetScamTypes(IPublicRepository publicRepository)
    {
        _publicRepository = publicRepository;
    }

    public async Task<List<Scam_Type>?> Handle()
    {
        var scamTypes = await _publicRepository.GetAllScamTypes();
        return scamTypes;
    }
}