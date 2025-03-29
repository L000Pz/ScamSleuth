package models

import (
	"bytes"
	"log"
	"strings"
	"time"

	//"github.com/ArminEbrahimpour/scamSleuthAI/internal/AI/handlers"
	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly/v2"
	whoisparser "github.com/likexian/whois-parser"
)

type FraudIndicators struct {
	// Content-based indicators
	SuspiciousKeywords []string `json:"suspicious_keywords"`
	HiddenElements     []string `json:"hidden_elements"` // CSS classes/IDs that often hide content

	// Technical indicators
	UnsecureConnection bool     `json:"unsecure_connection"`
	SuspiciousHeaders  []string `json:"suspicious_headers"` // Missing or fake headers

	// Structural indicators
	NoContactInfo bool                   `json:"no_contact_info"`
	DomainAge     int                    `json:"domain_age"` // Days since domain registration
	Findings      map[string]interface{} `json:"findings"`
}

func (fi *FraudIndicators) detectHiddenElement(html string) {}

func (fi *FraudIndicators) checkDomianAge(whois whoisparser.WhoisInfo) (int, error) {

	creationDate, err := time.Parse(time.RFC3339, whois.Domain.CreatedDate)
	if err != nil {
		log.Println(err)
	}

	ageInDays := int(time.Since(creationDate).Hours() / 24)

	return ageInDays, nil
}

func (fi *FraudIndicators) checkSecurity(req *colly.Request) {

	if !strings.HasPrefix(req.URL.String(), "https://") {
		fi.UnsecureConnection = true
		fi.Findings["UnsecureConnection"] = true
	}
	// check headers

	for _, header := range fi.SuspiciousHeaders {

		headers := *req.Headers
		if _, exists := headers[header]; !exists {
			fi.Findings["missing_header_"+header] = true
		}
	}

}

func (fi *FraudIndicators) checkContactInfo(html string) []string {
	doc, err := goquery.NewDocumentFromReader(bytes.NewReader([]byte(html)))
	if err != nil {
		log.Println(err)
	}
	contactPatterns := []string{"contact", "about", "support", "help", "email", "phone", "address"}
	var founds []string
	doc.Find("a").Each(func(i int, s *goquery.Selection) {
		href, _ := s.Attr("href")
		text := strings.ToLower(s.Text())
		for _, patterns := range contactPatterns {
			if strings.Contains(href, patterns) {
				founds = append(founds, href)
			}
			if strings.Contains(text, patterns) {
				founds = append(founds, text)
			}
		}
	})
	return founds
}

func (fi *FraudIndicators) detectKeyWords(content string) []string {

	var detected []string
	content = strings.ToLower(content)

	for _, kw := range fi.SuspiciousKeywords {
		if strings.Contains(content, strings.ToLower(kw)) {
			detected = append(detected, kw)

		}
	}
	return detected
}
