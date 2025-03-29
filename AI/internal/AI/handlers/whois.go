package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/likexian/whois"
	whoisparser "github.com/likexian/whois-parser"
)

func Whois(url string) whoisparser.WhoisInfo {

	raw_whois, err := whois.Whois(url)
	if err != nil {
		//	http.Error(w, "Url is not valid!", http.StatusBadRequest)
		log.Println(err)
	}

	result, err := whoisparser.Parse(raw_whois)

	if err != nil {
		//	http.Error(w, "whois didn't parse correctly", http.StatusBadRequest)
		log.Println(err)

	}

	return result

}

func GetWhoisData(w http.ResponseWriter, r *http.Request) {

	// getting target url from the request
	vars := mux.Vars(r)

	url, ok := vars["url"]
	if !ok {
		http.Error(w, "Missing url term in the request", http.StatusBadRequest)
		return
	}

	result := Whois(url)

	jsonResult, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		//	http.Error(w, "Failed to marshal JSON", http.StatusInternalServerError)
		return
	}

	// Set content type and write JSON
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResult)

}
