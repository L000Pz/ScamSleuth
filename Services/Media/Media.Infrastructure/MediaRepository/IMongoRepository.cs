﻿using Media.Contracts;
using MongoDB.Bson;

namespace Media.Infrastructure.MediaRepository;

public interface IMongoRepository
{
    Task Insert(BsonDocument doc);
    Task<BsonDocument> CreateDoc(Domain.Media media);
    Task<List<BsonDocument>> GetAllDocs();
    Task<BsonDocument> GetDoc(int id);
    Task<String?> DeleteAll(String email);
    Task<String?> Delete(int id);
    Task SeedDefaultProfilePictures();

}