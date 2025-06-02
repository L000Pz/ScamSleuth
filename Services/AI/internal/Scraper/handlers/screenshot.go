package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
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

func (h *ScreenshotHandler) validateURL(rawURL string) (string, error) {
	// Add protocol if missing
	if !strings.HasPrefix(rawURL, "http://") && !strings.HasPrefix(rawURL, "https://") {
		rawURL = "https://" + rawURL
	}

	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		return "", fmt.Errorf("invalid URL format: %v", err)
	}

	// Basic security checks
	if parsedURL.Host == "" {
		return "", fmt.Errorf("invalid URL: missing host")
	}

	// Prevent localhost/internal network access (basic SSRF protection)
	if strings.Contains(parsedURL.Host, "localhost") ||
		strings.Contains(parsedURL.Host, "127.0.0.1") ||
		strings.Contains(parsedURL.Host, "192.168.") ||
		strings.Contains(parsedURL.Host, "10.") {
		return "", fmt.Errorf("access to internal networks not allowed")
	}

	return rawURL, nil
}

func (h *ScreenshotHandler) TakeScreenShot(site string) ([]byte, error) {
	validatedURL, err := h.validateURL(site)
	if err != nil {
		return nil, err
	}

	// Create context with Chrome options
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", true),
		chromedp.Flag("disable-gpu", true),
		chromedp.Flag("no-sandbox", true),
		chromedp.Flag("disable-dev-shm-usage", true),
		chromedp.Flag("disable-extensions", true),
		chromedp.Flag("disable-background-timer-throttling", true),
		chromedp.Flag("disable-backgrounding-occluded-windows", true),
		chromedp.Flag("disable-renderer-backgrounding", true),
		chromedp.WindowSize(1920, 1080),
		chromedp.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"),
	)

	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancel()

	ctx, cancel := chromedp.NewContext(allocCtx)
	defer cancel()

	// Set timeout
	ctx, cancel = context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	var buf []byte

	// Define tasks to run in browser with better error handling
	err = chromedp.Run(ctx,
		// Navigate to the URL
		chromedp.Navigate(validatedURL),

		// Wait for body to be visible
		chromedp.WaitVisible("body", chromedp.ByQuery),

		// Wait a bit more for dynamic content to load
		chromedp.Sleep(2*time.Second),

		// Scroll to ensure all content is loaded
		chromedp.Evaluate(`window.scrollTo(0, document.body.scrollHeight);`, nil),
		chromedp.Sleep(1*time.Second),
		chromedp.Evaluate(`window.scrollTo(0, 0);`, nil),

		// Take full page screenshot
		chromedp.FullScreenshot(&buf, 90),
	)

	if err != nil {
		log.Printf("Screenshot error for URL %s: %v", validatedURL, err)
		return nil, fmt.Errorf("failed to take screenshot: %v", err)
	}

	if len(buf) == 0 {
		return nil, fmt.Errorf("screenshot buffer is empty")
	}

	log.Printf("Screenshot taken successfully for %s, size: %d bytes", validatedURL, len(buf))
	return buf, nil
}

func (h *ScreenshotHandler) elementScreenshot(urlstr, sel string, res *[]byte) chromedp.Tasks {
	return chromedp.Tasks{
		chromedp.Navigate(urlstr),
		chromedp.WaitVisible(sel, chromedp.ByQuery),
		chromedp.Screenshot(sel, res, chromedp.NodeVisible),
	}
}

func (h *ScreenshotHandler) ScreenShotHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow POST requests
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var requestBody models.Req_body
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		log.Printf("Failed to decode request body: %v", err)
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	if requestBody.Domain == "" {
		log.Println("Domain is empty in request")
		http.Error(w, "Domain required", http.StatusBadRequest)
		return
	}

	log.Printf("Taking screenshot for domain: %s", requestBody.Domain)

	buf, err := h.TakeScreenShot(requestBody.Domain)
	if err != nil {
		log.Printf("Failed to take screenshot: %v", err)
		http.Error(w, fmt.Sprintf("Failed to take screenshot: %v", err), http.StatusInternalServerError)
		return
	}

	if len(buf) == 0 {
		log.Println("Screenshot buffer is empty")
		http.Error(w, "Screenshot is empty", http.StatusInternalServerError)
		return
	}

	log.Printf("Screenshot taken, saving to database. Size: %d bytes", len(buf))

	oid, err := h.MongoDB.SaveScreenshot("screenshots", requestBody.Domain, buf)
	if err != nil {
		log.Printf("Failed to save screenshot: %v", err)
		http.Error(w, "Failed to save screenshot", http.StatusInternalServerError)
		return
	}

	log.Printf("Screenshot saved successfully with ID: %s", oid.Hex())

	w.Header().Set("Content-Type", "application/json")
	response := map[string]string{
		"status":  "success",
		"message": "Screenshot saved successfully",
		"id":      oid.Hex(),
		"domain":  requestBody.Domain,
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
