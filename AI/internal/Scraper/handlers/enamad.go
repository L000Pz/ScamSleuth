package handlers

import(
	"fmt"
	"io"	
	"encoding/json"
    "log"
    "net/http"
	"github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/models"
	"bytes"	
	"github.com/gocolly/colly/v2"
)


func enamd_GetData(domain string) (* models.Enamad_Data, error) {


    var enamad_data models.Enamad_Data

    enamad_url := "https://enamad.ir"

	

	reqBody := []byte(fmt.Sprintf("domain=%s",domain))


    req, err := http.NewRequest(http.MethodPost, enamad_url,bytes.NewBuffer(reqBody))

	if err != nil {
    	log.Println(err)

        return &models.Enamad_Data{},err
	}
	
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")


	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil{
		log.Println(err)
        return &models.Enamad_Data{},err
	}
    defer resp.Body.Close()

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        log.Println(err)

        return &models.Enamad_Data{},err
    }
    
   if err = json.Unmarshal(body, &enamad_data); err != nil{
       log.Println(err)
        return &models.Enamad_Data{},err
   }
   
   return &enamad_data, nil
}


func scrape_enamad(url string ) {

	enamad_get_data,err := enamd_GetData(url)
	if err != nil{
		log.Println(err)
	}
	req_url := fmt.Sprintf("https://trustseal.enamad.ir/?id=%d&code=%s",enamad_get_data.ID, enamad_get_data.Code)

	// Create a new collector
	c := colly.NewCollector()

	// Slice to store the table rows
	var rows [][]string

	// Set up the callback to handle the table rows
	c.OnHTML("table.table-hover tbody tr", func(e *colly.HTMLElement) {
		var row []string
		e.ForEach("td, th", func(_ int, el *colly.HTMLElement) {
			row = append(row, el.Text)
		})
		rows = append(rows, row)
	})

	// Set up error handling
	c.OnError(func(r *colly.Response, err error) {
		log.Println("Request URL:", r.Request.URL, "failed with response:", r, "\nError:", err)
	})

	// Start scraping
	err = c.Visit(req_url) // Replace with the actual URL
	if err != nil {
		log.Fatal(err)
	}
	

}


func EnamadHandler(w http.ResponseWriter, r *http.Request){
	val := "~!"
	fmt.Fprintf(w, "something is going to happen %s \n", val)
	var requestBody models.Req_body
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		http.Error(w, "Domain Required !", http.StatusBadRequest)
		return 
	}
	if requestBody.Domain == "" {
		http.Error(w, "Domain Required !",http.StatusBadRequest)
		return 
	}


}
