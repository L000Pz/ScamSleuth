namespace Media.Contracts;

public class MediaFile
{
    public string file_name { get; set; }
    public string name { get; set; }
    public string content_type { get; set; }
    public Stream Content { get; set; }
}