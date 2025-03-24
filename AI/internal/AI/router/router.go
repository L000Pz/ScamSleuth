package aiRouter

import (
	"github.com/ArminEbrahimpour/scamSleuthAI/internal/AI/handlers"
	"github.com/gorilla/mux"
)

func NewRouter() *mux.Router {

	r := mux.NewRouter()

	// All the endpoints are handled here
	r.HandleFunc("/scan/{url}", handlers.Scan).Methods("GET")
	r.HandleFunc("/whois/{url}", handlers.GetWhoisData).Methods("GET")

	return r
}
