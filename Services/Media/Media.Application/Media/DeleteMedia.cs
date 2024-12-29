using Media.Application.Common;

namespace Media.Application.Media;

public class DeleteMedia : IDeleteMedia
{
    private readonly IMediaRepository _mediaRepository;

    public DeleteMedia(IMediaRepository mediaRepository)
    {
        _mediaRepository = mediaRepository;
    }

    public async Task<string?> DeleteAll(string username)
    {
        string? res = await _mediaRepository.DeleteAll(username);
        return "ok";
    }
    public async Task<string?> Delete(int id)
    {
        var res = await _mediaRepository.Delete(id);
        if (res is null)
        {
            return null;
        }
        return "ok";
    }
}