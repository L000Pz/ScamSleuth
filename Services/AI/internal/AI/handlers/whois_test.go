package handlers

import (
	"encoding/json"
	"testing"
)

func TestWhois(t *testing.T) {
	whoisData := Whois("example.ir")
	jsonWhoisData, _ := json.MarshalIndent(whoisData, "", "  ")
	got := string(jsonWhoisData)

	want := `{
  "domain": {
    "domain": "example.ir",
    "punycode": "example.ir",
    "name": "example",
    "extension": "ir"
  }
}`
	if got != want {
		t.Errorf("got %v, wanted %v", got, want)
	}

}
