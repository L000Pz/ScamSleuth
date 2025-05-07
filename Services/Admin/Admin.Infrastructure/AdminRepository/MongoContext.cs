using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Admin.Infrastructure.AdminRepository;

public class MongoContext : DbContext
{
    private static MongoClient client = new MongoClient("mongodb://admin:admin@mongodb_container:27017");
    private static IMongoDatabase database = client.GetDatabase("ScamSleuth_db");
    private static IMongoCollection<BsonDocument> collection = database.GetCollection<BsonDocument>("Review_Content");

    public async Task Insert(BsonDocument doc)
    {
        await collection.InsertOneAsync(doc);
    }

    public async Task<BsonDocument> CreateDoc(Domain.Review_Content reviewContent)
    {
        BsonDocument document = new BsonDocument
        {
            {"_id",reviewContent.review_content_id},
            {"content",reviewContent.review_content},
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