package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/ArminEbrahimpour/scamSleuthAI/internal/AI/models"
	"github.com/ArminEbrahimpour/scamSleuthAI/internal/Databases"
	whoisparser "github.com/likexian/whois-parser"

	//scraperModels "github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/models"
	scraperHandler "github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

type AIHandler struct {
	PostgreSQL *Databases.PostgreSQL
}

func NewAIhandler(PostgreSQL *Databases.PostgreSQL) *AIHandler {

	return &AIHandler{PostgreSQL: PostgreSQL}

}

func ExtractMainDomain(rawURL string) (string, error) {
	// Parse the URL
	u, err := url.Parse(rawURL)
	if err != nil {
		return "", fmt.Errorf("failed to parse URL: %v", err)
	}

	// Get the hostname (removes port if present)
	host := u.Hostname()

	// Split the host into parts
	parts := strings.Split(host, ".")
	if len(parts) < 2 {
		return "", fmt.Errorf("invalid domain: %s", host)
	}

	if len(parts) > 2 {
		// For most cases, take the last two parts
		return parts[len(parts)-2] + "." + parts[len(parts)-1], nil
	}

	return host, nil
}

func checkDomainAge(whois whoisparser.WhoisInfo) int {

	creationDate, err := time.Parse(time.RFC3339, whois.Domain.CreatedDate)
	if err != nil {
		log.Println(err)
	}

	ageInDays := int(time.Since(creationDate).Hours() / 24)

	return ageInDays
}
func HostUp(site string) bool {
	// url, err := ExtractMainDomain(site)
	// if err != nil {
	// 	log.Printf("Extracting main domain went wrong %v", err)
	// }
	url := fmt.Sprintf("https://%s", site)
	res, err := http.Get(url)
	if err != nil {
		log.Printf("Get request did't went right : %d", err)
	}

	if res.StatusCode == 200 {
		return true
	}
	return false

}

func SendToAI(site string) models.CompletionResponse {

	var response models.CompletionResponse
	url := "https://openrouter.ai/api/v1/chat/completions"

	err := godotenv.Load()
	if err != nil {
		log.Fatalln("Error loading .env file")
	}
	apiKey := os.Getenv("APIKEY")

	//scraper_result := handlers.Do_scrape(site)

	scraperData := scraperHandler.Do_scrape(site)
	//urlObj, err := ExtractMainDomain(site)

	if err != nil {
		log.Println(err)
	}

	whoisData := Whois(site)
	jsonWhoisData, err := json.MarshalIndent(whoisData, "", "  ")
	if err != nil {
		log.Printf("jsoning the whois data went wrong : %s", err)
	}
	fmt.Println("this is whois data")
	fmt.Println(string(jsonWhoisData))
	scraperData["domain_age"] = checkDomainAge(whoisData)

	jsonScraperData, err := json.MarshalIndent(scraperData, "", "  ")
	if err != nil {
		log.Printf("marshaling the scraperData went wrong : %s \n", err)
	}
	fmt.Println("this is scraper data:")
	fmt.Println(string(jsonScraperData))

	Enamad, err := scraperHandler.Enamad_GetData(site)
	if err != nil {
		log.Printf("Enamd geting data in AI handler function went wrong : %s\n", err)
	}

	jsonEnamad, err := json.MarshalIndent(Enamad, "", "  ")
	if err != nil {
		log.Printf("jasonizing the Enamad went wrotng the error is : %s \n", err)
	}
	fmt.Println("this is enamad data")
	fmt.Println(string(jsonEnamad))
	payload := map[string]interface{}{
		"model": "qwen/qwq-32b",
		"messages": []map[string]string{
			{
				"role": "system",
				"content": `You are an expert website security analyst. Your task is to analyze websites for trustworthiness and reliability.

ANALYSIS CRITERIA:
1. Domain Trust Factors:
   - Domain age (older = higher trust)
   - Registration transparency (public info = higher trust)
   - Valid SSL certificate with proper configuration
   - Complete WHOIS information

2. Content Analysis:
   - Professional presentation and design
   - Clear contact information and policies
   - Proper grammar and spelling
   - Absence of suspicious promises or urgency tactics

3. Technical Security:
   - Proper security headers implementation
   - Clean, non-obfuscated code
   - No suspicious redirects
   - Secure content delivery

4. Regional Compliance (Iran):
   - Enamad certification for Iranian websites
   - Proper business registration verification

SCORING SYSTEM:
- Calculate TRUST SCORE from 0-100 where:
  * 100 = Highly trustworthy and reliable
  * 70-99 = Generally trustworthy with minor concerns
  * 40-69 = Moderate trust, proceed with caution
  * 20-39 = Low trust, significant concerns
  * 0-19 = Very untrustworthy, likely scam

- Generate specific trust/risk factors
- Focus on what makes the site trustworthy OR concerning

OUTPUT FORMAT:
Return ONLY valid JSON with no comments:
{
  "trustScore": number (0-100, where 100 = most trustworthy),
  "riskLevel": "low|medium|high",
  "positivePoints": [
    "Strong SSL certificate with extended validation",
    "Domain registered for 5+ years showing stability",
    "Complete contact information and business address",
    "Professional website design and content"
  ],
  "negativePoints": [
    "Domain registered very recently (suspicious timing)",
    "Missing essential security headers",
    "No visible contact information",
    "Contains urgent action prompts typical of scams"
  ],
  "description": "Detailed analysis explaining the overall trustworthiness assessment, highlighting key factors that contribute to or detract from the site's reliability",
  "technicalFlags": {
    "HasValidSSL": 15,
    "DomainAgeOver2Years": 20,
    "CompleteCotactInfo": 10,
    "MissingSecurityHeaders": -25,
    "RecentDomainRegistration": -30
  }
}

IMPORTANT:
- Higher scores = MORE trustworthy
- Lower scores = LESS trustworthy  
- Focus on reliability indicators
- Positive flags ADD to trust score
- Negative flags SUBTRACT from trust score
- If you change the JSON format and its structure you will make a great system unfunctional`,
			},
			{
				"role": "user",
				"content": fmt.Sprintf(`Analyze this website for trustworthiness and reliability:

URL: %s

SCRAPED DATA:
%s

WHOIS DATA:
%s

ENAMAD DATA:
%s

Provide a comprehensive trust analysis focusing on what makes this website reliable or unreliable. Score from 0 (very untrustworthy) to 100 (highly trustworthy).`, site, jsonScraperData, string(jsonWhoisData), string(jsonEnamad)),
			},
		},
	}

	// conveting the payload to json
	jsonPayload, err := json.Marshal(payload)

	if err != nil {
		fmt.Println("unable to marshal the payload", err)
	}

	// creating a post request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		log.Fatalln(err)
	}
	fmt.Println(apiKey)
	//req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	// sending the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Unable to send the request to the api", err)
	}
	defer resp.Body.Close()

	// read the response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("unable to read the response body", err)
	}

	// return body
	//fmt.Println(string(body))

	if err = json.Unmarshal(body, &response); err != nil {
		fmt.Println("Unable to unmarshal the json", err)
	}
	return response

}
func convertTojson(AI_response string) ([]byte, string) {

	result := strings.Trim(AI_response, "```json")
	result = strings.TrimSpace(result)

	//fmt.Println(result)
	// jsonResult, err := json.MarshalIndent(result, "", "  ")
	// if err != nil {
	// 	log.Printf("jsonizing the AI response went wrong ")
	// }
	jsonResult := []byte(result)
	return jsonResult, result
}
func (h *AIHandler) Scan(w http.ResponseWriter, r *http.Request) {

	var response models.CompletionResponse
	vars := mux.Vars(r)
	w.Header().Set("Content-Type", "application/json")

	urlterm, ok := vars["url"]

	if !ok {
		http.Error(w, "Missing url term in the request", http.StatusBadRequest)
		return
	}
	fmt.Println(urlterm)
	// checking if host is up then continue
	if !HostUp(urlterm) {
		http.Error(w, "Host is not Up", http.StatusBadRequest)
		return
	}
	//checking if the url exists in database or not
	//site, _ := ExtractMainDomain(urlterm)
	exists := h.PostgreSQL.CheckIfurlExistsInDB(urlterm, "url_storage")
	fmt.Println(exists)
	if exists {
		//check if date is exceed or not
		if h.PostgreSQL.IsRecent(urlterm, "url_storage") {

			// retrieve if not
			desc := h.PostgreSQL.RetreiveSavedData(urlterm, "url_storage")
			w.Write([]byte(desc))
			return
		}

		// proceed to send to AI if exceed
	}
	//Prepare_AI()
	//fmt.Fprintf(w, "%s", prepare_ai.Choices[0].Message.Content)
	response = SendToAI(urlterm)
	//fmt.Println(response)

	if len(response.Choices) == 0 {
		http.Error(w, "No response from AI model", http.StatusInternalServerError)
		return
	}

	//fmt.Fprintf(w, "%s", response.Choices[0].Message.Content)
	jsonFraudDetectorResponseAI, stringFraudDetectorResponseAI := convertTojson(response.Choices[0].Message.Content)

	fmt.Printf("%s", stringFraudDetectorResponseAI)

	w.Write(jsonFraudDetectorResponseAI)
	//sending to frontend
	// if err := json.NewEncoder(w).Encode(jsonFraudDetectorResponseAI); err != nil {
	// 	log.Printf("sending the json to front end went wrong : %s, \n", err)
	// }
	// save the json response into database
	_, err := h.PostgreSQL.SaveAIResponse("url_storage", urlterm, jsonFraudDetectorResponseAI)
	if err != nil {
		log.Printf("Failed to save the AI response : %v", err)
		return
	}

}

// url storage handlers added:
// GetRecentURLs handles GET requests to retrieve recent URLs
func (h *AIHandler) GetRecentURLs(w http.ResponseWriter, r *http.Request) {
	// Only allow GET requests
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get optional limit parameter
	limitStr := r.URL.Query().Get("limit")
	limit := 5 // default

	if limitStr != "" {
		parsedLimit, err := strconv.Atoi(limitStr)
		if err != nil {
			http.Error(w, "Invalid limit parameter", http.StatusBadRequest)
			return
		}
		if parsedLimit > 0 && parsedLimit <= 100 { // Cap at 100 for safety
			limit = parsedLimit
		}
	}

	log.Printf("Retrieving %d recent URLs from url_storage table", limit)

	var records []Databases.URLStorageRecord
	var err error

	if limit == 5 {
		records, err = h.PostgreSQL.GetRecentURLs("url_storage")
	} else {
		records, err = h.PostgreSQL.GetRecentURLsWithLimit("url_storage", limit)
	}

	if err != nil {
		log.Printf("Failed to retrieve recent URLs: %v", err)
		http.Error(w, fmt.Sprintf("Failed to retrieve URLs: %v", err), http.StatusInternalServerError)
		return
	}

	log.Printf("Retrieved %d records successfully", len(records))

	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"status":  "success",
		"count":   len(records),
		"records": records,
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// GetURLsByDateRange handles GET requests to retrieve URLs by date range
func (h *AIHandler) GetURLsByDateRange(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse date parameters
	startDateStr := r.URL.Query().Get("start_date")
	endDateStr := r.URL.Query().Get("end_date")

	if startDateStr == "" || endDateStr == "" {
		http.Error(w, "Both start_date and end_date parameters are required (format: 2006-01-02)", http.StatusBadRequest)
		return
	}

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		http.Error(w, "Invalid start_date format. Use YYYY-MM-DD", http.StatusBadRequest)
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		http.Error(w, "Invalid end_date format. Use YYYY-MM-DD", http.StatusBadRequest)
		return
	}

	// Set end date to end of day
	endDate = endDate.Add(23*time.Hour + 59*time.Minute + 59*time.Second)

	log.Printf("Retrieving URLs from %v to %v", startDate, endDate)

	records, err := h.PostgreSQL.GetURLsByDateRange("url_storage", startDate, endDate)
	if err != nil {
		log.Printf("Failed to retrieve URLs by date range: %v", err)
		http.Error(w, fmt.Sprintf("Failed to retrieve URLs: %v", err), http.StatusInternalServerError)
		return
	}

	log.Printf("Retrieved %d records for date range", len(records))

	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"status":     "success",
		"count":      len(records),
		"start_date": startDateStr,
		"end_date":   endDateStr,
		"records":    records,
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// SearchURLs handles GET requests to search URLs by pattern
func (h *AIHandler) SearchURLs(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get search pattern
	pattern := r.URL.Query().Get("q")
	if pattern == "" {
		http.Error(w, "Query parameter 'q' is required", http.StatusBadRequest)
		return
	}

	// Get optional limit parameter
	limitStr := r.URL.Query().Get("limit")
	limit := 10 // default

	if limitStr != "" {
		parsedLimit, err := strconv.Atoi(limitStr)
		if err != nil {
			http.Error(w, "Invalid limit parameter", http.StatusBadRequest)
			return
		}
		if parsedLimit > 0 && parsedLimit <= 100 {
			limit = parsedLimit
		}
	}

	log.Printf("Searching URLs with pattern: '%s', limit: %d", pattern, limit)

	records, err := h.PostgreSQL.GetURLsBySearchPattern("url_storage", pattern, limit)
	if err != nil {
		log.Printf("Failed to search URLs: %v", err)
		http.Error(w, fmt.Sprintf("Failed to search URLs: %v", err), http.StatusInternalServerError)
		return
	}

	log.Printf("Found %d records matching pattern '%s'", len(records), pattern)

	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"status":  "success",
		"count":   len(records),
		"query":   pattern,
		"records": records,
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// GetURLStats handles GET requests to get basic statistics about stored URLs
func (h *AIHandler) GetURLStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get total count
	var totalCount int
	query := `SELECT COUNT(*) FROM url_storage`
	err := h.PostgreSQL.DB.QueryRow(query).Scan(&totalCount)
	if err != nil {
		log.Printf("Failed to get total count: %v", err)
		http.Error(w, "Failed to get statistics", http.StatusInternalServerError)
		return
	}

	// Get count from last 7 days
	var recentCount int
	oneWeekAgo := time.Now().AddDate(0, 0, -7)
	query = `SELECT COUNT(*) FROM url_storage WHERE search_date > $1`
	err = h.PostgreSQL.DB.QueryRow(query, oneWeekAgo).Scan(&recentCount)
	if err != nil {
		log.Printf("Failed to get recent count: %v", err)
		http.Error(w, "Failed to get statistics", http.StatusInternalServerError)
		return
	}

	// Get oldest and newest entries
	var oldestDate, newestDate time.Time
	query = `SELECT MIN(search_date), MAX(search_date) FROM url_storage`
	err = h.PostgreSQL.DB.QueryRow(query).Scan(&oldestDate, &newestDate)
	if err != nil {
		log.Printf("Failed to get date range: %v", err)
		http.Error(w, "Failed to get statistics", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"status": "success",
		"stats": map[string]interface{}{
			"total_urls":      totalCount,
			"recent_urls":     recentCount,
			"oldest_entry":    oldestDate,
			"newest_entry":    newestDate,
			"last_week_count": recentCount,
		},
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
