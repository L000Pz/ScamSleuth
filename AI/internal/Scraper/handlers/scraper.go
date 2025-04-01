package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/models"
	"github.com/gocolly/colly/v2"
)

func Do_scrape(domain string) map[string]interface{} {

	var fi = models.NewDefaultFraudIndicators()
	//var myhtml string
	// creating a collector
	c := colly.NewCollector(
		colly.Async(true),
	)

	c.Limit(&colly.LimitRule{

		DomainGlob:  "*",
		Parallelism: 2,
		Delay:       2 * time.Second,
		RandomDelay: 1 * time.Second,
	})

	// Set headers to appear more like a browser
	c.OnRequest(func(r *colly.Request) {
		r.Headers.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
		r.Headers.Set("Accept-Language", "en-US,en;q=0.9")
		r.Headers.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
	})

	// Analyze each response
	c.OnResponse(func(r *colly.Response) {
		fmt.Printf("Visited %s\n", r.Request.URL)
		fi.AnalyzeResponse(r)
	})
	// Print results when done
	c.OnScraped(func(r *colly.Response) {
		fmt.Println("\nFraud Analysis Results:")
		fmt.Println("======================")
		for ind, p := range fi.Findings {
			fmt.Println(ind)
			fmt.Println(p)
		}

		// Keywords
		if keywords, ok := fi.Findings["keywords"].([]string); ok && len(keywords) > 0 {
			fmt.Println("\nSuspicious Keywords Found:")
			for _, kw := range keywords {
				fmt.Printf("- %s\n", kw)
			}
		}

		// Hidden elements
		if hidden, ok := fi.Findings["hidden_elements"].([]string); ok && len(hidden) > 0 {
			fmt.Println("\nHidden Elements Found:")
			for _, el := range hidden {
				fmt.Printf("- %s\n", el)
			}
		}

		// Security
		if fi.UnsecureConnection {
			fmt.Println("\nSecurity Issue: Connection is not HTTPS")
		}

		// Contact info
		if hasContact, ok := fi.Findings["has_contact_info"].(bool); ok && !hasContact {
			fmt.Println("\nWarning: No obvious contact information found")
		}

		// Domain age
		if fi.DomainAge < 30 {
			fmt.Printf("\nWarning: Domain appears to be new (less than %d days old)\n", fi.DomainAge)
		}

		fmt.Println("\nAnalysis complete!")

	})

	err := c.Visit(domain)
	if err != nil {
		log.Println(err)
	}

	c.Wait()
	return fi.Findings
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

	//html := Do_scrape(requestBody.Domain)
	//fmt.Fprintf(w, "%s", html)
	Do_scrape(requestBody.Domain)

}
