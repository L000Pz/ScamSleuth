package scraperRouter

import (
	"github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/handlers"
	"github.com/gorilla/mux"
)

func NewRouter(screenshotHandler *handlers.ScreenshotHandler) *mux.Router {

	r := mux.NewRouter()

	r.HandleFunc("/scrape", handlers.Scrape).Methods("POST")
	r.HandleFunc("/enamad", handlers.EnamadHandler).Methods("POST")
	r.HandleFunc("/screenshot", screenshotHandler.ScreenShotHandler).Methods("POST")

	return r
}
