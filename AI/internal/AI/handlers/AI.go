package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/ArminEbrahimpour/scamSleuthAI/internal/AI/models"
	whoisparser "github.com/likexian/whois-parser"

	//scraperModels "github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/models"
	scraperHandler "github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func checkDomainAge(whois whoisparser.WhoisInfo) int {

	creationDate, err := time.Parse(time.RFC3339, whois.Domain.CreatedDate)
	if err != nil {
		log.Println(err)
	}

	ageInDays := int(time.Since(creationDate).Hours() / 24)

	return ageInDays
}

func Prepare_AI() models.CompletionResponse {
	var response models.CompletionResponse
	url := "https://openrouter.ai/api/v1/chat/completions"

	err := godotenv.Load()
	if err != nil {
		log.Fatalln("Error loading .env file")
	}
	apiKey := os.Getenv("APIKEY")

	prepare := map[string]interface{}{
		"model": "deepseek/deepseek-r1:free",
		"messages": []map[string]string{
			{
				"role":    "system",
				"content": "You are a scam scoring engine. You will receive a JSON object with:\n\n- 'flags': an object where each key is a detection flag and each value is the score to apply if the flag matches\n- 'input': an object containing website data (URL, WHOIS info, HTML, SSL info, etc.)\n\nYour job:\n1. Check which flags match based on the input.\n2. Add up the scores from matching flags.\n3. Return a JSON object:\n  - 'totalScore': the sum of matching flag scores\n  - 'matchedFlags': object with matched flags and their scores\n  - 'notes': short summary of why these flags matched\n\nIMPORTANT:\n- Only use the flags provided.\n- Do NOT invent or reword flags.\n- If unsure about a match, do not include it.\n- Output only valid JSON (no comments, no explanations).",
			},
		},
	}
	// converting the prepration to json for ai
	prepareJson, err := json.Marshal(prepare)
	if err != nil {
		log.Println(err)
	}
	// creating a post request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(prepareJson))
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
	//	fmt.Println(string(body))

	if err = json.Unmarshal(body, &response); err != nil {
		fmt.Println("Unable to unmarshal the json", err)
	}
	return response
}

func SendToAI(site string) models.CompletionResponse {

	var response models.CompletionResponse
	url := "https://openrouter.ai/api/v1/chat/completions"

	err := godotenv.Load()
	if err != nil {
		log.Fatalln("Error loading .env file")
	}
	apiKey := os.Getenv("APIKEY")

	//	scraper_result := handlers.Do_scrape(site)

	scraperData := scraperHandler.Do_scrape(site)
	// urlObj, err := extractMainDomain(req.URL.String())
	// if err != nil {
	// 	log.Println(err)
	// }

	whoisData := Whois(site)
	fmt.Println(whoisData)
	scraperData["domain_age"] = checkDomainAge(whoisData)

	jsonScraperData, err := json.MarshalIndent(scraperData, "", "  ")
	if err != nil {
		log.Printf("marshaling the scraperData went wrong : %s \n", err)
	}
	fmt.Println(jsonScraperData)
	Enamad, err := scraperHandler.Enamad_GetData(site)
	if err != nil {
		log.Printf("Enamd geting data in AI handler function went wrong : %s\n", err)
	}

	jsonEnamad, err := json.MarshalIndent(Enamad, "", "  ")
	if err != nil {
		log.Printf("jasonizing the Enamad went wrotng the error is : %s \n", err)
	}
	fmt.Println(jsonEnamad)
	payload := map[string]interface{}{
		"model": "deepseek/deepseek-r1:free",
		"messages": []map[string]string{
			{
				"role":    "user",
				"content": fmt.Sprintf("You are a scam scoring engine. You will receive a JSON object with:\n\n- 'flags': an object where each key is a detection flag and each value is the score to apply if the flag matches\n- 'input': an object containing website data (URL, WHOIS info, HTML, SSL info, etc.)\n\nYour job:\n1. Check which flags match based on the input.\n2. Add up the scores from matching flags.\n3. Return a JSON object:\n  - 'totalScore': the sum of matching flag scores\n  - 'matchedFlags': object with matched flags and their scores\n  - 'notes': short summary of why these flags matched\n\nIMPORTANT:\n- Only use the flags provided.\n- Do NOT invent or reword flags.\n- If unsure about a match, do not include it.\n- Output only valid JSON (no comments, no explanations)url=%s  scraperData=%v whois_data=%v enamad_data=%v", site, scraperData, whoisData, Enamad),
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
	fmt.Fprintf(w, "%s", response.Choices[0].Message.Content)
}
