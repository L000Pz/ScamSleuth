package main

import (
	"net/http"

	aiRouter "github.com/ArminEbrahimpour/scamSleuthAI/internal/AI/router"
	scraperRouter "github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/router"
	"github.com/gorilla/mux"
)

func main() {

	//r := router.NewRouter()
	r := mux.NewRouter()

	aiRouter := aiRouter.NewRouter()
	r.PathPrefix("/ai").Handler(http.StripPrefix("/ai", aiRouter))

	scraperRouter := scraperRouter.NewRouter()
	r.PathPrefix("/scraper").Handler(http.StripPrefix("/scraper", scraperRouter))
	http.ListenAndServe("127.0.0.1:6996", r)
}
