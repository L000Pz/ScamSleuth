package main

import (
	"context"
	"log"
	"net/http"

	aiRouter "github.com/ArminEbrahimpour/scamSleuthAI/internal/AI/router"
	"github.com/ArminEbrahimpour/scamSleuthAI/internal/Databases"
	scraperHandler "github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/handlers"
	scraperRouter "github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/router"
	"github.com/gorilla/mux"
)

func main() {
	// initializing MongoDB
	mongoDB, err := Databases.NewMongoDB("mongodb://admin:admin@mongodb_container:27017")
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	defer mongoDB.Client.Disconnect(context.Background())
	// Initializing handler with MongoDB
	screenshotHandler := scraperHandler.NewScreenShotHandler(mongoDB)

	//r := router.NewRouter()
	r := mux.NewRouter()

	aiRouter := aiRouter.NewRouter()
	r.PathPrefix("/ai").Handler(http.StripPrefix("/ai", aiRouter))

	scraperRouter := scraperRouter.NewRouter(screenshotHandler)
	r.PathPrefix("/scraper").Handler(http.StripPrefix("/scraper", scraperRouter))
	http.ListenAndServe("0.0.0.0:6996", r)
}
