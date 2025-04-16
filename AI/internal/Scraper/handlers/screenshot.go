package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/ArminEbrahimpour/scamSleuthAI/internal/Scraper/models"
	"github.com/chromedp/chromedp"
)

func TakeScreenShot(site string) ([]byte, error) {

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
	if err := chromedp.Run(ctx, elementScreenshot(site, `img.Homepage-logo`, &buf)); err != nil {
		log.Printf("getting chromedp run went wrong : %s \n", err)
	}

	return buf, err
}
func elementScreenshot(urlstr, sel string, res *[]byte) chromedp.Tasks {
	return chromedp.Tasks{
		chromedp.Navigate(urlstr),
		chromedp.Screenshot(sel, res, chromedp.NodeVisible),
	}
}
func ScreenShotHandler(w http.ResponseWriter, r *http.Request) {

	var requestBody models.Req_body
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		log.Println(err)
	}

	if requestBody.Domain == "" {
		http.Error(w, "Domain required ", http.StatusBadRequest)
		return
	}

	buf, _ := TakeScreenShot(requestBody.Domain)
	fmt.Println(buf)
}
