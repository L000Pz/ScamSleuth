package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Add this method to your existing ScreenshotHandler struct

// GetScreenshotByID retrieves a screenshot by its ObjectID and serves it as an image
func (h *ScreenshotHandler) GetScreenshotByID(w http.ResponseWriter, r *http.Request) {
	// Only allow GET requests
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get the ID from URL query parameter
	idParam := r.URL.Query().Get("id")
	if idParam == "" {
		http.Error(w, "ID parameter is required", http.StatusBadRequest)
		return
	}

	// Convert string ID to ObjectID
	objectID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		log.Printf("Invalid ObjectID format: %s, error: %v", idParam, err)
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	log.Printf("Retrieving screenshot with ID: %s", objectID.Hex())

	// Get screenshot from database
	screenshot, domain, err := h.MongoDB.GetScreenshotByID("screenshots", objectID)
	if err != nil {
		log.Printf("Failed to retrieve screenshot: %v", err)
		http.Error(w, "Screenshot not found", http.StatusNotFound)
		return
	}

	if len(screenshot) == 0 {
		log.Println("Screenshot data is empty")
		http.Error(w, "Screenshot data is empty", http.StatusNotFound)
		return
	}

	log.Printf("Screenshot retrieved successfully for domain: %s, size: %d bytes", domain, len(screenshot))

	// Set appropriate headers for image response
	w.Header().Set("Content-Type", "image/png")
	w.Header().Set("Content-Disposition", fmt.Sprintf("inline; filename=\"%s-screenshot.png\"", domain))
	w.Header().Set("Cache-Control", "public, max-age=3600") // Cache for 1 hour

	// Write the image data to response
	_, err = w.Write(screenshot)
	if err != nil {
		log.Printf("Failed to write screenshot data: %v", err)
		return
	}
}

// GetScreenshotByDomain retrieves the latest screenshot for a specific domain
func (h *ScreenshotHandler) GetScreenshotByDomain(w http.ResponseWriter, r *http.Request) {
	// Only allow GET requests
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get the domain from URL query parameter
	domain := r.URL.Query().Get("domain")
	if domain == "" {
		http.Error(w, "Domain parameter is required", http.StatusBadRequest)
		return
	}

	log.Printf("Retrieving latest screenshot for domain: %s", domain)

	// Get latest screenshot from database
	screenshot, err := h.MongoDB.GetLatestScreenshotByDomain("screenshots", domain)
	if err != nil {
		log.Printf("Failed to retrieve screenshot for domain %s: %v", domain, err)
		http.Error(w, "Screenshot not found", http.StatusNotFound)
		return
	}

	if len(screenshot) == 0 {
		log.Println("Screenshot data is empty")
		http.Error(w, "Screenshot data is empty", http.StatusNotFound)
		return
	}

	log.Printf("Screenshot retrieved successfully for domain: %s, size: %d bytes", domain, len(screenshot))

	// Set appropriate headers for image response
	w.Header().Set("Content-Type", "image/png")
	w.Header().Set("Content-Disposition", fmt.Sprintf("inline; filename=\"%s-screenshot.png\"", domain))
	w.Header().Set("Cache-Control", "public, max-age=3600") // Cache for 1 hour

	// Write the image data to response
	_, err = w.Write(screenshot)
	if err != nil {
		log.Printf("Failed to write screenshot data: %v", err)
		return
	}
}

// ListScreenshots returns a JSON list of all screenshots with metadata
func (h *ScreenshotHandler) ListScreenshots(w http.ResponseWriter, r *http.Request) {
	// Only allow GET requests
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	log.Println("Retrieving screenshots list")

	screenshots, err := h.MongoDB.ListScreenshots("screenshots")
	if err != nil {
		log.Printf("Failed to retrieve screenshots list: %v", err)
		http.Error(w, "Failed to retrieve screenshots", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(screenshots); err != nil {
		log.Printf("Failed to encode screenshots list: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// ScreenshotInfo represents screenshot metadata
type ScreenshotInfo struct {
	ID        string    `json:"id" bson:"_id"`
	Domain    string    `json:"domain" bson:"domain"`
	CreatedAt time.Time `json:"createdAt" bson:"createdAt"`
	Size      int       `json:"size,omitempty"`
}
