using Media.Application.Common;
using Media.Contracts;

namespace Media.Application.Media;

public class SaveMedia : ISaveMedia
{
    private readonly IMediaRepository _mediaRepository;
    public SaveMedia(IMediaRepository mediaRepository)
    {
        _mediaRepository = mediaRepository;
    }

    public async Task<int> Handle(MediaFile file,String email)
    {
        if (file.content_type.Split("/")[0] is not ("image" or "video" or "audio"))
        {
            return -1;
        }
        
        int max = await _mediaRepository.GetLastId();
        var media = Domain.Media.Create(max, email,file.name ,file.file_name, file.content_type, file.Content);
        string res = await _mediaRepository.Add(media);
        if (res.Equals("failed"))
        {
            return -2;
        }
        return max;
    }
}