namespace Admin.Application.AdminManagement;

public interface IDeleteUrlComment
{
    public Task<string> Handle(int comment_id, string token);
}