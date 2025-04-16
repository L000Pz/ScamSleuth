package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/models"
	"github.com/gocolly/colly/v2"
	"golang.org/x/net/html"
)

func Do_scrape1(domain string) map[string]interface{} {

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

		/*
			// Domain age
			if fi.DomainAge < 120 {
				fmt.Printf("\nWarning: Domain appears to be new (less than %d days old)\n", fi.DomainAge)
			}
		*/
		fmt.Println("\nAnalysis complete!")

	})

	err := c.Visit(domain)
	if err != nil {
		log.Println(err)
	}

	c.Wait()
	return fi.Findings
}

func Do_scrape(domain string) map[string]interface{} {
	var fi = models.NewDefaultFraudIndicators()
	var mu sync.Mutex // Mutex to protect concurrent access to findings

	c := colly.NewCollector(
		colly.Async(true),
		//colly.AllowedDomains(strings.Split(domain, "/")[2]), // Restrict to target domain
		colly.CacheDir("./scrape_cache"), // Enable caching
	)

	// Configure limits
	c.Limit(&colly.LimitRule{
		DomainGlob:  "*",
		Parallelism: 4, // Slightly higher parallelism
		RandomDelay: 1 * time.Second,
	})

	// Set browser-like headers with rotation
	userAgents := []string{
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
		"Mozilla/5.0 (X11; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0",
	}

	c.OnRequest(func(r *colly.Request) {
		r.Headers.Set("User-Agent", userAgents[time.Now().Unix()%int64(len(userAgents))])
		r.Headers.Set("Accept-Language", "en-US,en;q=0.9")
		r.Headers.Set("Referer", "https://www.google.com/")
		r.Headers.Set("Accept-Encoding", "gzip, deflate, br")
	})

	// Follow links within the same domain
	c.OnHTML("a[href]", func(e *colly.HTMLElement) {
		link := e.Request.AbsoluteURL(e.Attr("href"))
		if strings.Contains(link, domain) {
			e.Request.Visit(link)
		}
	})

	// Analyze responses
	c.OnResponse(func(r *colly.Response) {
		mu.Lock()
		defer mu.Unlock()

		// Check HTTPS
		if !strings.HasPrefix(r.Request.URL.String(), "https://") {
			fi.Findings["SecureConnection"] = false
		}

		// Parse HTML
		doc, err := html.Parse(strings.NewReader(string(r.Body)))
		if err != nil {
			return
		}

		// Analyze content
		fi.AnalyzeContent(doc, r)
	})

	// Error handling
	c.OnError(func(r *colly.Response, err error) {
		log.Printf("Request URL: %s failed with response: %v\nError: %v", r.Request.URL, r, err)
	})

	// Start scraping
	err := c.Visit(domain)
	if err != nil {
		log.Printf("Initial visit error: %v", err)
		return fi.Findings
	}

	c.Wait()

	// Post-processing
	// fi.CheckDomainAge(domain) // Implement this method
	// fi.CheckSSL(domain)       // Implement SSL verification

	// Print final results once
	printAnalysisResults(fi)

	return fi.Findings
}

func printAnalysisResults(fi *models.FraudIndicators) {
	fmt.Println("\nFinal Fraud Analysis Results:")
	fmt.Println("============================")

	printSection := func(title string, items interface{}) {
		switch v := items.(type) {
		case []string:
			if len(v) > 0 {
				fmt.Printf("\n%s Found (%d):\n", title, len(v))
				for _, item := range v {
					fmt.Printf("- %s\n", item)
				}
			}
		case bool:
			if !v {
				fmt.Printf("\nWarning: %s\n", title)
			}
		case int:
			if v < 365 {
				fmt.Printf("\nDomain Age Warning: Only %d days old\n", v)
			}
		}
	}

	printSection("Suspicious Keywords", fi.Findings["FoundKeywords"])
	printSection("Hidden Elements", fi.Findings["HiddenElements"])
	printSection("No Contact Info", fi.Findings["NoContactInfo"])
	printSection("Domain Age", fi.DomainAge)

	if fi.UnsecureConnection {
		fmt.Println("\nSecurity Warning: Non-HTTPS Connection Detected")
	}

	fmt.Println("\nAnalysis complete!")
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
	findings := Do_scrape(requestBody.Domain)

	fmt.Fprintf(w, "%s", findings)
}
