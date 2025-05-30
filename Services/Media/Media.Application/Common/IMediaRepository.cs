﻿using Media.Contracts;
using MongoDB.Bson;
using MongoDB.Driver;
namespace Media.Application.Common;

public interface IMediaRepository
{
    public Task<String> Add(Domain.Media media);
    public Task<int> GetLastId();
    public Task<BsonDocument> GetDoc(int id);
    public Task<MediaFile> CreateMedia(BsonDocument file);
    public Task<String?> DeleteAll(string username);
    public Task<String?> Delete(int id);

}