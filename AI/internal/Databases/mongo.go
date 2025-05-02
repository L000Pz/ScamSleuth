package Databases

import (
	"context"
	"fmt"
	"log"
	"time"

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

func (db *MongoDB) SaveScreenshot(collectionName string, domain string, screenshot []byte) error {

	collection := db.Client.Database("scamsleuth").Collection(collectionName)
	doc := map[string]interface{}{
		"domain":     domain,
		"screenshot": screenshot,
		"createdAt":  time.Now(),
	}

	_, err := collection.InsertOne(context.Background(), doc)
	return err

}
