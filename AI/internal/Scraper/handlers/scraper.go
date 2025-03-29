package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/models"
	"github.com/gocolly/colly/v2"
)

func Do_scrape(domain string) string {

	var myhtml string
	// creating a collector
	c := colly.NewCollector()

	c.OnHTML("html", func(e *colly.HTMLElement) {

		html, err := e.DOM.Html()
		if err != nil {
			log.Println(err)
			//http.Error(w, "Invalid Request Body", http.StatusBadRequest)
			return
		}

		//fmt.Fprintf(w, "%s", html)
		myhtml = html
	})

	c.OnError(func(r *colly.Response, err error) {
		log.Println("Request failed:", err)
	})

	err := c.Visit(domain)
	if err != nil {
		log.Println(err)
	}

	c.Wait()
	return myhtml
}

func Scrape(w http.ResponseWriter, r *http.Request) {

	var requestBody models.Req_body
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		log.Println(err)
	}

	if requestBody.Domain == "" {
		http.Error(w, "Domain required ", http.StatusBadRequest)
		return
	}

	html := Do_scrape(requestBody.Domain)
	fmt.Fprintf(w, "%s", html)
}
