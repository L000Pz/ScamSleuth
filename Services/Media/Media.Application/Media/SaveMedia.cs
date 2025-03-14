﻿using Media.Application.Common;
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
        // check the files type
        if (file.content_type.Split("/")[0] is not ("image" or "video"))
        {
            return -1;
        }
        
        // get the last id
        int max = await _mediaRepository.GetLastId();
        // create media object to insert
        var media = Domain.Media.Create(max, email,file.name ,file.file_name, file.content_type, file.Content);
        // save the file to the correct table(using Content_Type attribute)
        string res = await _mediaRepository.Add(media);
        if (res.Equals("failed"))
        {
            return -2;
        }
        // return the address to be saved in main database
        return max;
    }
}