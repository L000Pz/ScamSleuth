package scraperRouter

import (
	"github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/handlers"
	"github.com/gorilla/mux"
)

func NewRouter() *mux.Router {

	r := mux.NewRouter()

	r.HandleFunc("/scrape", handlers.Scrape).Methods("POST")
	r.HandleFunc("/enamad", handlers.EnamadHandler).Methods("POST")
	r.HandleFunc("/screenshot/{url}", handlers.ScreenShotHandler).Methods("GET")

	return r
}
