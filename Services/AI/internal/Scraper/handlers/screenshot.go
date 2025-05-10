package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/ArminEbrahimpour/scamSleuthAI/internal/Databases"
	"github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/models"
	"github.com/chromedp/chromedp"
)

type ScreenshotHandler struct {
	MongoDB *Databases.MongoDB
}

func NewScreenShotHandler(mongoDB *Databases.MongoDB) *ScreenshotHandler {

	return &ScreenshotHandler{MongoDB: mongoDB}
}

func (h *ScreenshotHandler) TakeScreenShot(site string) ([]byte, error) {

	// Create context
	ctx, cancel := chromedp.NewContext(context.Background())
	defer cancel()

	// Set timeout
	ctx, cancel = context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	var buf []byte

	// Define tasks to run in browser
	err := chromedp.Run(ctx,
		chromedp.Navigate(site),
		chromedp.FullScreenshot(&buf, 90),
	)
	if err := chromedp.Run(ctx, h.elementScreenshot(site, `img.Homepage-logo`, &buf)); err != nil {
		log.Printf("getting chromedp run went wrong : %s \n", err)
	}

	return buf, err
}
func (h *ScreenshotHandler) elementScreenshot(urlstr, sel string, res *[]byte) chromedp.Tasks {
	return chromedp.Tasks{
		chromedp.Navigate(urlstr),
		chromedp.Screenshot(sel, res, chromedp.NodeVisible),
	}
}
func (h *ScreenshotHandler) ScreenShotHandler(w http.ResponseWriter, r *http.Request) {

	var requestBody models.Req_body
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		log.Println(err)
	}

	if requestBody.Domain == "" {
		http.Error(w, "Domain required ", http.StatusBadRequest)
		return
	}

	buf, _ := h.TakeScreenShot(requestBody.Domain)
	if err != nil {
		log.Printf("Failed ot take screenshot: %v", err)
		return
	}
	fmt.Println(buf)
	oid, err := h.MongoDB.SaveScreenshot("screenshots", requestBody.Domain, buf)
	if err != nil {
		log.Printf("Failed to save screenshot: %v", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Screenshot saved successfully",
		"id":      oid.Hex(),
	})

}
