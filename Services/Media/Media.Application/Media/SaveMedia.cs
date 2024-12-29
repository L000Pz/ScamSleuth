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

    public async Task<string> Handle(MediaFile file,String user)
    {
        // check the files type
        if (file.content_type.Split("/")[0] is not ("image" or "video"))
        {
            return "wrong";
        }
        // get the last id
        int max = await _mediaRepository.GetLastId();
        // create media object to insert
        var media = Domain.Media.Create(max, user,file.name ,file.file_name, file.content_type, file.Content);
        // save the file to the correct table(using Content_Type attribute)
        string res = await _mediaRepository.Add(media);
        if (res.Equals("failed"))
        {
            return "bad";
        }
        // return the address to be saved in main database
        return "ok";
    }
}