package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ScreenshotDocument struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	Domain     string             `bson:"domain"`
	Screenshot []byte             `bson:"screenshot"`
	CreatedAt  time.Time          `bson:"created_at"`
}
