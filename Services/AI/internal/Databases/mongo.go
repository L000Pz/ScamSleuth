package Databases

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoDB struct {
	Client *mongo.Client
}

func NewMongoDB(uri string) (*MongoDB, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(uri).SetAuth(options.Credential{
		Username: "admin",
		Password: "admin",
	})

	var client *mongo.Client
	var err error
	maxRetries := 3

	for i := 0; i < maxRetries; i++ {
		client, err = mongo.Connect(ctx, clientOptions)
		if err == nil {
			// Verify connection
			pingCtx, pingCancel := context.WithTimeout(ctx, 5*time.Second)
			defer pingCancel()

			if err = client.Ping(pingCtx, nil); err == nil {
				break
			}
		}

		if i < maxRetries-1 {
			log.Printf("Connection attempt %d failed, retrying...", i+1)
			time.Sleep(time.Duration(i+1) * time.Second)
		}
	}

	if err != nil {
		return nil, fmt.Errorf("failed to connect after %d attempts: %v", maxRetries, err)
	}

	log.Println("Successfully connected to MongoDB!")
	return &MongoDB{Client: client}, nil
}

func (db *MongoDB) SaveScreenshot(collectionName string, domain string, screenshot []byte) (primitive.ObjectID, error) {

	collection := db.Client.Database("scamsleuth").Collection(collectionName)
	doc := map[string]interface{}{
		"domain":     domain,
		"screenshot": screenshot,
		"createdAt":  time.Now(),
	}

	insertResult, err := collection.InsertOne(context.Background(), doc)
	if err != nil {
		return primitive.NilObjectID, err
	}

	if oid, ok := insertResult.InsertedID.(primitive.ObjectID); ok {
		return oid, nil
	}

	return primitive.NilObjectID, fmt.Errorf("could not convert inserted Id to Object Id ")

}

// ScreenshotDocument represents the structure of a screenshot document in MongoDB
type ScreenshotDocument struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	Domain     string             `bson:"domain"`
	Screenshot []byte             `bson:"screenshot"`
	CreatedAt  time.Time          `bson:"createdAt"`
}

// ScreenshotInfo represents screenshot metadata without the actual image data
type ScreenshotInfo struct {
	ID        string    `json:"id" bson:"_id"`
	Domain    string    `json:"domain" bson:"domain"`
	CreatedAt time.Time `json:"createdAt" bson:"createdAt"`
	Size      int       `json:"size,omitempty"`
}

// GetScreenshotByID retrieves a screenshot by its ObjectID
func (db *MongoDB) GetScreenshotByID(collectionName string, id primitive.ObjectID) ([]byte, string, error) {
	collection := db.Client.Database("scamsleuth").Collection(collectionName)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var result ScreenshotDocument
	err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, "", fmt.Errorf("screenshot not found")
		}
		return nil, "", fmt.Errorf("failed to retrieve screenshot: %v", err)
	}

	return result.Screenshot, result.Domain, nil
}

// GetLatestScreenshotByDomain retrieves the most recent screenshot for a specific domain
func (db *MongoDB) GetLatestScreenshotByDomain(collectionName string, domain string) ([]byte, error) {
	collection := db.Client.Database("scamsleuth").Collection(collectionName)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find the most recent screenshot for the domain
	opts := options.FindOne().SetSort(bson.D{{"createdAt", -1}})

	var result ScreenshotDocument
	err := collection.FindOne(ctx, bson.M{"domain": domain}, opts).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("no screenshot found for domain: %s", domain)
		}
		return nil, fmt.Errorf("failed to retrieve screenshot: %v", err)
	}

	return result.Screenshot, nil
}

// ListScreenshots retrieves metadata for all screenshots (without the actual image data)
func (db *MongoDB) ListScreenshots(collectionName string) ([]ScreenshotInfo, error) {
	collection := db.Client.Database("scamsleuth").Collection(collectionName)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Only retrieve metadata, exclude the large screenshot data
	opts := options.Find().
		SetProjection(bson.M{"screenshot": 0}). // Exclude screenshot data
		SetSort(bson.D{{"createdAt", -1}})      // Sort by creation time, newest first

	cursor, err := collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to find screenshots: %v", err)
	}
	defer cursor.Close(ctx)

	var screenshots []ScreenshotInfo
	for cursor.Next(ctx) {
		var doc ScreenshotDocument
		if err := cursor.Decode(&doc); err != nil {
			log.Printf("Failed to decode screenshot document: %v", err)
			continue
		}

		screenshots = append(screenshots, ScreenshotInfo{
			ID:        doc.ID.Hex(),
			Domain:    doc.Domain,
			CreatedAt: doc.CreatedAt,
		})
	}

	if err := cursor.Err(); err != nil {
		return nil, fmt.Errorf("cursor error: %v", err)
	}

	return screenshots, nil
}

// GetScreenshotsByDomain retrieves all screenshots for a specific domain (metadata only)
func (db *MongoDB) GetScreenshotsByDomain(collectionName string, domain string) ([]ScreenshotInfo, error) {
	collection := db.Client.Database("scamsleuth").Collection(collectionName)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Only retrieve metadata, exclude the large screenshot data
	opts := options.Find().
		SetProjection(bson.M{"screenshot": 0}). // Exclude screenshot data
		SetSort(bson.D{{"createdAt", -1}})      // Sort by creation time, newest first

	cursor, err := collection.Find(ctx, bson.M{"domain": domain}, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to find screenshots for domain %s: %v", domain, err)
	}
	defer cursor.Close(ctx)

	var screenshots []ScreenshotInfo
	for cursor.Next(ctx) {
		var doc ScreenshotDocument
		if err := cursor.Decode(&doc); err != nil {
			log.Printf("Failed to decode screenshot document: %v", err)
			continue
		}

		screenshots = append(screenshots, ScreenshotInfo{
			ID:        doc.ID.Hex(),
			Domain:    doc.Domain,
			CreatedAt: doc.CreatedAt,
		})
	}

	if err := cursor.Err(); err != nil {
		return nil, fmt.Errorf("cursor error: %v", err)
	}

	return screenshots, nil
}

// DeleteScreenshot deletes a screenshot by its ObjectID
func (db *MongoDB) DeleteScreenshot(collectionName string, id primitive.ObjectID) error {
	collection := db.Client.Database("scamsleuth").Collection(collectionName)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return fmt.Errorf("failed to delete screenshot: %v", err)
	}

	if result.DeletedCount == 0 {
		return fmt.Errorf("screenshot not found")
	}

	return nil
}
