package handlers

import (
	"testing"
)

func TestEnamad(t *testing.T) {
	got, err := Enamad_GetData("digikala.com")

	// Check if there was an error
	if err != nil {
		t.Errorf("Enamad_GetData returned an error: %v", err)
		return
	}

	// Check if got is nil
	if got == nil {
		t.Errorf("Enamad_GetData returned nil data")
		return
	}

	if got.Domain == "" {
		t.Errorf("Expected Domain to be non-empty, got empty string")
	}

	if got.Domain != "digikala.com" {
		t.Errorf("Expected Domain to be 'digikala.com', got %s", got.Domain)
	}

	if got.ID == 0 {
		t.Errorf("Expected ID to be non-zero, got %d", got.ID)
	}

	if got.NamePer == "" {
		t.Errorf("Expected NamePer to be non-empty, got empty string")
	}

	// Optionally test other important fields
	if got.ApproveDate == "" {
		t.Errorf("Expected ApproveDate to be non-empty, got empty string")
	}

	if got.ExpDate == "" {
		t.Errorf("Expected ExpDate to be non-empty, got empty string")
	}
}
