using Media.Contracts;

namespace Media.Application.Media;

public interface ISaveMedia
{
    Task<int> Handle(MediaFile file,String email);
}