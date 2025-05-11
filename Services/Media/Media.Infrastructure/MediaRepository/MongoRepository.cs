using MongoDB.Bson;
using MongoDB.Driver;


namespace Media.Infrastructure.MediaRepository;

public class MongoRepository : IMongoRepository
{
    private static MongoClient client = new MongoClient("mongodb://admin:admin@mongodb_container:27017");
    private static IMongoDatabase database = client.GetDatabase("ScamSleuth_db");
    private static IMongoCollection<BsonDocument> collection = database.GetCollection<BsonDocument>("Media");
    
    

    public async Task SeedDefaultProfilePictures()
    {
        var count = await collection.CountDocumentsAsync(new BsonDocument());
        
        if (count == 0)
        {
            try
            {
                string contentRootPath = Directory.GetCurrentDirectory();
                string folderPath = Path.Combine(contentRootPath, "default_pfp");
                
                Console.WriteLine($"Looking for default profile pictures in: {folderPath}");
                
                if (!Directory.Exists(folderPath))
                {
                    Console.WriteLine($"Warning: Default profile pictures directory not found at {folderPath}");
                    return;
                }
                
                // Insert the three default profile pictures
                await InsertDefaultImage(Path.Combine(folderPath, "default_pfp1.jpg"), 1);
                await InsertDefaultImage(Path.Combine(folderPath, "default_pfp2.jpg"), 2);
                await InsertDefaultImage(Path.Combine(folderPath, "default_pfp3.jpg"), 3);
                
                Console.WriteLine("Default profile pictures seeded successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error seeding default profile pictures: {ex.Message}");
            }
        }
    }
    
    private async Task InsertDefaultImage(string filePath, int id)
    {
        if (!File.Exists(filePath))
        {
            Console.WriteLine($"Warning: Default profile picture not found at {filePath}");
            return;
        }
        
        byte[] imageBytes = await File.ReadAllBytesAsync(filePath);
        string fileName = Path.GetFileName(filePath);
        
        BsonDocument document = new BsonDocument
        {
            {"_id", id},
            {"name", fileName},
            {"file_name", fileName},
            {"content_type", GetContentType(fileName)},
            {"Content", imageBytes},
        };
        
        await collection.InsertOneAsync(document);
        Console.WriteLine($"Inserted default profile picture: {fileName}");
    }
    
    private string GetContentType(string fileName)
    {
        string extension = Path.GetExtension(fileName).ToLower();
        return extension switch
        {
            ".png" => "image/png",
            ".jpg" => "image/jpeg",
            ".jpeg" => "image/jpeg",
            _ => "application/octet-stream"
        };
    }

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