package aiRouter

import (
	"github.com/ArminEbrahimpour/scamSleuthAI/internal/AI/handlers"
	"github.com/gorilla/mux"
)

func NewRouter(aiHandler *handlers.AIHandler) *mux.Router {

	r := mux.NewRouter()

	// All the endpoints are handled here
	r.HandleFunc("/scan/{url}", aiHandler.Scan).Methods("GET")
	r.HandleFunc("/whois/{url}", handlers.GetWhoisData).Methods("GET")
	r.HandleFunc("/urls/recent", aiHandler.GetRecentURLs)          // GET - Get recent URLs
	r.HandleFunc("/urls/date-range", aiHandler.GetURLsByDateRange) // GET - Get URLs by date range
	r.HandleFunc("/urls/search", aiHandler.SearchURLs)             // GET - Search URLs
	r.HandleFunc("/urls/stats", aiHandler.GetURLStats)

	return r
}
