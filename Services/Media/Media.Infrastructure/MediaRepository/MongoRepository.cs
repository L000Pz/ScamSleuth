using Media.Contracts;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Media.Infrastructure.MediaRepository;

public class MongoRepository : IMongoRepository
{
    private static MongoClient client = new MongoClient("mongodb://admin:admin@mongodb-container:27017");
    private static IMongoDatabase database = client.GetDatabase("ScamSleuth_db");
    private static IMongoCollection<BsonDocument> collection = database.GetCollection<BsonDocument>("Media");

    public async Task Insert(BsonDocument doc)
    {
        await collection.InsertOneAsync(doc);
    }

    public async Task<BsonDocument> CreateDoc(Domain.Media media)
    {
        var memory = new MemoryStream();
        await media.Content.CopyToAsync(memory);
        byte[] image = memory.ToArray();
        BsonDocument document = new BsonDocument
        {
            {"_id",media.row_id},
            {"email",media.email},
            {"name",media.name},
            {"file_name",media.file_name},
            {"content_type",media.content_type},
            {"Content",image},
        };
        return document;
    }

    public async Task<List<BsonDocument>> GetAllDocs()
    {
        var docs = collection.Find(new BsonDocument()).ToList();
        return docs;
    }

    public async Task<BsonDocument> GetDoc(int id)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("_id", id);
        BsonDocument doc = collection.Find(filter).FirstOrDefault().ToBsonDocument();
        return doc;
    }

    public async Task<string?> DeleteAll(string email)
    {
        var deletefilter = Builders<BsonDocument>.Filter.Eq("email", email);
        collection.DeleteMany(deletefilter);
        return "ok";
    }

    public async Task<String?> Delete(int id)
    {
        var delete = Builders<BsonDocument>.Filter.Eq("_id", id);
        BsonDocument doc = collection.Find(delete).FirstOrDefault().ToBsonDocument();
        if (doc is null)
        {
            return null;
        }
        collection.DeleteOne(delete);
        return "ok";
    }
}