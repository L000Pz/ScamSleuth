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
    "model": "deepseek/deepseek-r1:free",
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
