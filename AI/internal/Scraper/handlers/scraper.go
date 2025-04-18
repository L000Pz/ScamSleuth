package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/models"
	"github.com/gocolly/colly/v2"
	"golang.org/x/net/html"
)

func RemoveScheme(inputURL string) (string, error) {
	// Add scheme if missing to make url.Parse work correctly
	if !strings.HasPrefix(inputURL, "http://") && !strings.HasPrefix(inputURL, "https://") {
		inputURL = "https://" + inputURL
	}

	parsed, err := url.Parse(inputURL)
	if err != nil {
		return "", fmt.Errorf("failed to parse URL: %v", err)
	}

	// Rebuild URL without scheme
	result := parsed.Host
	if parsed.Path != "" {
		result += parsed.Path
	}
	if parsed.RawQuery != "" {
		result += "?" + parsed.RawQuery
	}
	if parsed.Fragment != "" {
		result += "#" + parsed.Fragment
	}

	return result, nil
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

func Do_scrape(domain string) map[string]interface{} {
	var fi = models.NewDefaultFraudIndicators()
	var mu sync.Mutex
	visited := make(map[string]bool)
	visitedMu := &sync.Mutex{}

	// Set timeout
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Minute)
	defer cancel()

	// Ensure domain has scheme
	if !strings.HasPrefix(domain, "http://") && !strings.HasPrefix(domain, "https://") {
		domain = "https://" + domain
	}

	domain1, err := RemoveScheme(domain)
	if err != nil {
		log.Printf("Error removing scheme: %v", err)
		return fi.Findings
	}

	// Create collector with proper configuration
	c := colly.NewCollector(
		colly.Async(true),
		colly.AllowedDomains(domain1),
		colly.CacheDir("./scrape_cache"),
		colly.IgnoreRobotsTxt(),
	)

	// Configure limits
	c.Limit(&colly.LimitRule{
		DomainGlob:  "*",
		Parallelism: 4,
		RandomDelay: 1 * time.Second,
	})

	c.SetRequestTimeout(30 * time.Second)

	// Channel to track active requests (buffered to prevent deadlocks)
	activeRequests := make(chan struct{}, 100)
	defer close(activeRequests)

	// Timeout monitor
	go func() {
		<-ctx.Done()
		log.Println("Timeout reached, aborting pending requests")

		// Abort all pending requests
		c.OnRequest(func(r *colly.Request) {
			r.Abort()
		})
	}()

	// Set browser-like headers with rotation
	userAgents := []string{
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
		"Mozilla/5.0 (X11; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0",
	}

	c.OnRequest(func(r *colly.Request) {
		select {
		case <-ctx.Done():
			r.Abort()
			return
		case activeRequests <- struct{}{}:
			r.Headers.Set("User-Agent", userAgents[time.Now().Unix()%int64(len(userAgents))])
			r.Headers.Set("Accept-Language", "en-US,en;q=0.9")
			r.Headers.Set("Referer", "https://www.google.com/")
		default:
			r.Abort()
		}
	})

	c.OnHTML("a[href]", func(e *colly.HTMLElement) {
		select {
		case <-ctx.Done():
			return
		default:
			link := e.Request.AbsoluteURL(e.Attr("href"))
			parsed, err := url.Parse(link)
			if err != nil {
				return
			}

			visitedMu.Lock()
			if !visited[parsed.Path] {
				visited[parsed.Path] = true
				visitedMu.Unlock()
				e.Request.Visit(link)
			} else {
				visitedMu.Unlock()
			}
		}
	})

	c.OnResponse(func(r *colly.Response) {
		defer func() {
			select {
			case <-activeRequests:
			default:
			}
		}()

		select {
		case <-ctx.Done():
			return
		default:
			mu.Lock()
			defer mu.Unlock()

			if !strings.HasPrefix(r.Request.URL.String(), "https://") {
				fi.Findings["SecureConnection"] = false
			}

			doc, err := html.Parse(strings.NewReader(string(r.Body)))
			if err != nil {
				return
			}

			fi.AnalyzeContent(doc, r)
			fi.AnalyzeResponse(r)
		}
	})

	c.OnError(func(r *colly.Response, err error) {
		defer func() {
			select {
			case <-activeRequests:
			default:
			}
		}()
		log.Printf("Request URL: %s failed with response: %v\nError: %v", r.Request.URL, r, err)
	})

	// Start scraping
	err = c.Visit(domain)
	if err != nil {
		log.Printf("Initial visit error: %v", err)
		return fi.Findings
	}

	// Wait for completion with timeout
	waitDone := make(chan struct{})
	go func() {
		c.Wait()
		close(waitDone)
	}()

	select {
	case <-waitDone:
		log.Println("Scraping completed successfully")
	case <-ctx.Done():
		log.Println("Scraping terminated due to timeout")
	case <-time.After(5 * time.Second):
		log.Println("Warning: c.Wait() took longer than expected after activeRequests drained")
	}

	// Final check for active requests
	for i := 0; i < 10 && len(activeRequests) > 0; i++ {
		time.Sleep(100 * time.Millisecond)
		log.Printf("Waiting for %d active requests to complete", len(activeRequests))
	}

	// Marshal and print results
	jsonFinding, err := json.MarshalIndent(fi.Findings, "", "  ")
	if err != nil {
		log.Printf("Error marshaling findings: %v", err)
	} else {
		log.Println(string(jsonFinding))
	}

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
	findings := Do_scrape(requestBody.Domain)

	fmt.Fprintf(w, "%s", findings)
}
