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
	whoisparser "github.com/likexian/whois-parser"

	//scraperModels "github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/models"
	scraperHandler "github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func extractMainDomain(rawURL string) (string, error) {
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
	//urlObj, err := extractMainDomain(site)

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
			/*
				{
					"role":    "user",
					"content": fmt.Sprintf("You are a scam scoring engine. You will receive a JSON object with:\n\n- 'flags': an object where each key is a detection flag and each value is the score to apply if the flag matches\n- 'input': an object containing website data (URL, WHOIS info, HTML, SSL info, etc.)\n\nYour job:\n1. Check which flags match based on the input.\n2. Add up the scores from matching flags.\n3. Return a JSON object:\n  - 'totalScore': the sum of matching flag scores\n  - 'matchedFlags': object with matched flags and their scores\n  - 'notes': short summary of why these flags matched\n\nIMPORTANT:\n- Only use the flags provided.\n- Do NOT invent or reword flags.\n- If unsure about a match, do not include it.\n- Output only valid JSON (no comments, no explanations)url=%s  scraperData=%v whois_data=%v enamad_data=%v", site, scraperData, whoisData, Enamad),
				},
			*/
			{
				"role":    "system",
				"content": "You are a scam scoring engine. You will receive multiple JSON objects with:url: is the website url, scrape_data: is a scrapped data based on the key words i have preseted from the given url, whois_data: is the whois data extracted from the given url, enamad_data: is the enamad data(enamad is a iranian website ran by the government which gives the website a huge value if its based in iran) note that if it was empty and it wasnt based in iran it doesnt necessarily mean that the website doesnt have any values,but if it was based in iran it does need to have this premeter. Your job:\n1. Check the input and give it up to 10 flags and score the flags based on the input and its value up to a hundrad, a hundrad means it is very suspicious.\n2. Add up the scores from matching flags up to a hundred do not use negative values if a site doesnt match the flags or its low just give it zero.\n3. Return a JSON object:\n  - 'totalScore': the sum of matching flag scores\n  - 'matchedFlags': object with matched flags and their scores\n  - 'notes': short summary of why these flags matched and a short discripton explaining why this site is good or not good\n\nIMPORTANT:\n- If unsure about a match, do not include it.\n- Output only valid JSON (no comments, no description).",
			},
			{
				"role":    "user",
				"content": fmt.Sprintf("url=%s  scrape_data=%s whois_data=%s enamad_data=%s", site, jsonScraperData, string(jsonWhoisData), string(jsonEnamad)),
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
func Scan(w http.ResponseWriter, r *http.Request) {

	var response models.CompletionResponse
	vars := mux.Vars(r)

	urlterm, ok := vars["url"]

	if !ok {
		http.Error(w, "Missing url term in the request", http.StatusBadRequest)
		return
	}
	fmt.Println(urlterm)

	//Prepare_AI()
	//fmt.Fprintf(w, "%s", prepare_ai.Choices[0].Message.Content)
	response = SendToAI(urlterm)

	//fmt.Fprintf(w, "%s", response.Choices[0].Message.Content)
	jsonFraudDetectorResponseAI, stringFraudDetectorResponseAI := convertTojson(response.Choices[0].Message.Content)

	fmt.Printf("%s", stringFraudDetectorResponseAI)

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonFraudDetectorResponseAI)
	//sending to frontend
	// if err := json.NewEncoder(w).Encode(jsonFraudDetectorResponseAI); err != nil {
	// 	log.Printf("sending the json to front end went wrong : %s, \n", err)
	// }
	// save the json response into database

}
