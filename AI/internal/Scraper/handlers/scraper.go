package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/models"
	"github.com/gocolly/colly/v2"
)

func NewDefaultFraudIndicators() *models.FraudIndicators {
	return &models.FraudIndicators{
		SuspiciousKeywords: []string{
			"100% safe", "guaranteed profit", "limited offer",
			"won't believe", "click here", "instant money",
			"risk-free", "double your", "earn cash",
		},
		HiddenElements: []string{
			"display:none", "visibility:hidden", "opacity:0",
			"height:0", "width:0", "position:absolute",
			"clip:rect(0,0,0,0)", "hidden", "aria-hidden",
		},
		SuspiciousHeaders: []string{"User-Agent", "Accept-Language", "Accept-Encoding",
			"Referer", "DNT", "X-Requested-With",
		},
		DomainAge: 30, // Minimum age in days to be considered trustworthy
		Findings:  make(map[string]interface{}),
	}
}

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
