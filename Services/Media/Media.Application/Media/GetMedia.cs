using Media.Application.Common;
using Media.Contracts;
using MongoDB.Bson;

namespace Media.Application.Media;

public class GetMedia : IGetMedia
{
    private readonly IMediaRepository _mediaRepository;

    public GetMedia(IMediaRepository mediaRepository)
    {
        _mediaRepository = mediaRepository;
    }

    public async Task<MediaFile?> GetFile(int id)
    {
        BsonDocument? file = await _mediaRepository.GetDoc(id);
        if (file is null)
        {
            return null;
        }
        MediaFile mediaFile =await _mediaRepository.CreateMedia(file);
        return mediaFile;
    }
}