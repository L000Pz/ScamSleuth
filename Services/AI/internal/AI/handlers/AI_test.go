package handlers

import (
	"reflect"
	"testing"
)

func TestConvertTojson(t *testing.T) {
	tests := []struct {
		name           string
		input          string
		expectedBytes  []byte
		expectedString string
	}{
		{
			name:           "JSON with backticks and json text",
			input:          "```json{\"name\": \"test\", \"value\": 123}```",
			expectedBytes:  []byte("{\"name\": \"test\", \"value\": 123}"),
			expectedString: "{\"name\": \"test\", \"value\": 123}",
		},
		{
			name:           "JSON with partial markdown",
			input:          "```json{\"status\": \"success\"}",
			expectedBytes:  []byte("{\"status\": \"success\"}"),
			expectedString: "{\"status\": \"success\"}",
		},
		{
			name:           "JSON with trailing backticks only",
			input:          "{\"error\": \"none\"}```",
			expectedBytes:  []byte("{\"error\": \"none\"}"),
			expectedString: "{\"error\": \"none\"}",
		},
		{
			name:           "Plain JSON without any trim characters",
			input:          "{\"plain\": \"json\"}",
			expectedBytes:  []byte("{\"plain\": \"json\"}"),
			expectedString: "{\"plain\": \"json\"}",
		},
		{
			name:           "Input with leading and trailing whitespace only",
			input:          "  {\"whitespace\": \"test\"}  ",
			expectedBytes:  []byte("{\"whitespace\": \"test\"}"),
			expectedString: "{\"whitespace\": \"test\"}",
		},
		{
			name:           "Empty string",
			input:          "",
			expectedBytes:  []byte(""),
			expectedString: "",
		},
		{
			name:           "Only trim characters",
			input:          "```json```",
			expectedBytes:  []byte(""),
			expectedString: "",
		},
		{
			name:           "JSON with newlines and markdown",
			input:          "```json\n{\n  \"multiline\": \"json\"\n}\n```",
			expectedBytes:  []byte("{\n  \"multiline\": \"json\"\n}"),
			expectedString: "{\n  \"multiline\": \"json\"\n}",
		},
		{
			name:           "Complex nested JSON with markdown",
			input:          "```json{\"users\": [{\"id\": 1, \"name\": \"John\"}, {\"id\": 2, \"name\": \"Jane\"}], \"count\": 2}```",
			expectedBytes:  []byte("{\"users\": [{\"id\": 1, \"name\": \"John\"}, {\"id\": 2, \"name\": \"Jane\"}], \"count\": 2}"),
			expectedString: "{\"users\": [{\"id\": 1, \"name\": \"John\"}, {\"id\": 2, \"name\": \"Jane\"}], \"count\": 2}",
		},
		{
			name:           "JSON with special characters and markdown",
			input:          "```json{\"message\": \"Hello\\nWorld\", \"symbol\": \"@#$%\"}```",
			expectedBytes:  []byte("{\"message\": \"Hello\\nWorld\", \"symbol\": \"@#$%\"}"),
			expectedString: "{\"message\": \"Hello\\nWorld\", \"symbol\": \"@#$%\"}",
		},
		{
			name:           "Mixed trim characters scattered",
			input:          "jjj```test content```nnn",
			expectedBytes:  []byte("test content"),
			expectedString: "test content",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotBytes, gotString := convertTojson(tt.input)

			// Check if byte slices are equal
			if !reflect.DeepEqual(gotBytes, tt.expectedBytes) {
				t.Errorf("convertTojson() gotBytes = %v, want %v", gotBytes, tt.expectedBytes)
				t.Errorf("convertTojson() gotBytes as string = %q, want %q", string(gotBytes), string(tt.expectedBytes))
			}

			// Check if strings are equal
			if gotString != tt.expectedString {
				t.Errorf("convertTojson() gotString = %q, want %q", gotString, tt.expectedString)
			}

			// Ensure consistency between returned byte slice and string
			if string(gotBytes) != gotString {
				t.Errorf("convertTojson() byte slice and string are inconsistent: %q != %q", string(gotBytes), gotString)
			}
		})
	}
}

// Test edge cases with different combinations of trim characters
func TestConvertTojsonEdgeCases(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Only backticks",
			input:    "```",
			expected: "",
		},
		{
			name:     "Only 'json' text",
			input:    "json",
			expected: "",
		},
		{
			name:     "Backticks and json intermixed",
			input:    "`j`s`o`n`",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, gotString := convertTojson(tt.input)
			if gotString != tt.expected {
				t.Errorf("convertTojson() = %q, want %q", gotString, tt.expected)
			}
		})
	}
}

// Benchmark test to measure performance
func BenchmarkConvertTojson(b *testing.B) {
	input := "```json{\"name\": \"benchmark\", \"value\": 42, \"active\": true}```"

	for i := 0; i < b.N; i++ {
		convertTojson(input)
	}
}

// Test with very large JSON string
func TestConvertTojsonLargeInput(t *testing.T) {
	// Create a large JSON-like string
	largeJSON := "```json{\"data\": \""
	for i := 0; i < 1000; i++ {
		largeJSON += "test"
	}
	largeJSON += "\"}```"

	gotBytes, gotString := convertTojson(largeJSON)

	// Verify consistency
	if string(gotBytes) != gotString {
		t.Error("convertTojson() byte slice and string should be consistent")
	}

	// Should start with opening brace after trimming
	if len(gotString) > 0 && gotString[0] != '{' {
		t.Errorf("Expected trimmed string to start with '{', got: %c", gotString[0])
	}
}
func TestCheckDomainAge(t *testing.T) {
	whoisData := Whois("digikala.com")
	got := checkDomainAge(whoisData)
	want := 6777

	if got != want {
		t.Errorf("got %v, wanted %v", got, want)
	}

}

func TestExtractMainDomain(t *testing.T) {
	got, _ := ExtractMainDomain("https://digikala.com/something")
	want := "digikala.com"

	if got != want {
		t.Errorf("got %q, wanted %q", got, want)
	}

}
