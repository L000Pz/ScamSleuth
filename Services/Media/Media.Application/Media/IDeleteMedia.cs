namespace Media.Application.Media;

public interface IDeleteMedia
{
    public Task<String?> DeleteAll(String username);
    public Task<String?> Delete(int id);
}