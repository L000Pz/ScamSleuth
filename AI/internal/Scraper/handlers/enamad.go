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

	//fmt.Printf("this is the reqBody were gonna send to enamad for get data :%s\n", reqBody)
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
	//fmt.Printf("this is the response recived from enamad get data : %v\n", resp.Body)
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
	val := "~!"
	fmt.Fprintf(w, "something is going to happen %s \n", val)
	var requestBody models.Req_body
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		http.Error(w, "Domain Required !", http.StatusBadRequest)
		return
	}
	if requestBody.Domain == "" {
		http.Error(w, "Domain Required !", http.StatusBadRequest)
		return
	}

	enamad_data, err := Enamad_GetData(requestBody.Domain)
	if err != nil {
		log.Println(err)
	}
	fmt.Fprintf(w, "%v", enamad_data)
}
