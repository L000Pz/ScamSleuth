package handlers

import (
	"log"
	"testing"

	"github.com/ArminEbrahimpour/scamSleuthAI/internal/Databases"
)

func TestScreenShot(t *testing.T) {
	mongoDB, err := Databases.NewMongoDB("mongodb://admin:admin@mongodb_container:27017")
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	sh := NewScreenShotHandler(mongoDB)
	sh.TakeScreenShot("digikala.com")
}
