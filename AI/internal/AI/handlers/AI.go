package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/ArminEbrahimpour/scamSleuthAI/internal/AI/models"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func SendToAI(site string) models.CompletionResponse {

	var response models.CompletionResponse
	url := "https://openrouter.ai/api/v1/chat/completions"
	//apiKey := os.Getenv("APIKEY") //"<OPENROUTER_API_KEY>"
	err := godotenv.Load()
	if err != nil {
		log.Fatalln("Error loading .env file")
	}
	apiKey := os.Getenv("APIKEY")

	payload := map[string]interface{}{
		"model": "deepseek/deepseek-r1:free",
		"messages": []map[string]string{
			{
				"role":    "user",
				"content": fmt.Sprintf("tell me what is good about the domain name %s", site),
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
	fmt.Println(string(body))

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
	fmt.Fprintf(w, "salam %s\n", urlterm)
	response = SendToAI(urlterm)
	fmt.Fprintf(w, "%s", response.Choices[0].Message.Content)
}
