package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/models"
)

func Enamad_GetData(domain string) (*models.Enamad_Data, error) {
	var enamad_data models.Enamad_Data
	enamad_url := "https://enamad.ir/Home/GetData"
	reqBody := []byte(fmt.Sprintf("domain=%s", domain))

	req, err := http.NewRequest(http.MethodPost, enamad_url, bytes.NewBuffer(reqBody))
	if err != nil {
		log.Println(err)
		return &models.Enamad_Data{}, err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println(err)
		return &models.Enamad_Data{}, err
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Println(err)
		return &models.Enamad_Data{}, err
	}

	if err = json.Unmarshal(body, &enamad_data); err != nil {
		log.Println(err)
		return &models.Enamad_Data{}, err
	}

	fmt.Println("this is the enamad data:")
	fmt.Println(enamad_data)
	fmt.Println("the end")
	return &enamad_data, nil
}

func EnamadHandler(w http.ResponseWriter, r *http.Request) {
	// Set content type to JSON
	w.Header().Set("Content-Type", "application/json")

	var requestBody models.Req_body
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid JSON format"})
		return
	}

	if requestBody.Domain == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Domain Required!"})
		return
	}

	enamad_data, err := Enamad_GetData(requestBody.Domain)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch data"})
		return
	}

	// Return JSON response
	json.NewEncoder(w).Encode(enamad_data)
}
