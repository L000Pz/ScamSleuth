package handlers

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/likexian/whois"
	whoisparser "github.com/likexian/whois-parser"
)

func GetWhoisData(w http.ResponseWriter, r *http.Request) {

	// getting target url from the request
	vars := mux.Vars(r)

	url, ok := vars["url"]
	if !ok {
		http.Error(w, "Missing url term in the request", http.StatusBadRequest)
		return
	}

	raw_whois, err := whois.Whois(url)
	if err != nil {
		http.Error(w, "Url is not valid!", http.StatusBadRequest)
		return
	}

	result, err := whoisparser.Parse(raw_whois)

	if err != nil {
		http.Error(w, "whois didn't parse correctly", http.StatusBadRequest)
		return

	}

	fmt.Fprintf(w, "%s", result)
}
