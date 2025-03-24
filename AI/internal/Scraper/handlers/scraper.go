package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/models"
	"github.com/gocolly/colly/v2"
)

//type req_body struct {
//	Domain string `json:"domain"`
//}




func Scrape(w http.ResponseWriter, r *http.Request) {
	// vars := mux.Vars(r)
	// //var indicators models.FraudIndicators
	// url, ok := vars["url"]
	// if !ok {
	// 	http.Error(w, "Missing url term in the request", http.StatusBadRequest)
	// 	return
	// }
	var requestBody models.Req_body
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		log.Println(err)
	}

	if requestBody.Domain == "" {
		http.Error(w, "Domain required ", http.StatusBadRequest)
		return 
	}
	fmt.Fprintf(w, "this is scrap endpoint %s", requestBody.Domain)

	// creating a collector
	c := colly.NewCollector()

	c.OnHTML("html", func(e *colly.HTMLElement) {

		html, err := e.DOM.Html()
		if err != nil {
			log.Println(err)
			http.Error(w, "Invalid Request Body", http.StatusBadRequest)
			return
		}

		fmt.Fprintf(w, "%s", html)
	})

	c.OnError(func(r *colly.Response, err error) {
		log.Println("Request failed:", err)
	})

	err = c.Visit(requestBody.Domain)
	if err != nil {
		log.Println(err)
	}

	c.Wait()

}
