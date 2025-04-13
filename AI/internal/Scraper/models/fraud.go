package models

import (
	"bytes"
	"fmt"
	"log"
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly/v2"
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

func NewDefaultFraudIndicators() *FraudIndicators {
	return &FraudIndicators{
		SuspiciousKeywords: []string{
			"100% safe", "guaranteed profit", "limited offer",
			"won't believe", "click here", "instant money",
			"risk-free", "double your", "earn cash",
		},
		HiddenElements: []string{
			"display:none", "visibility:hidden", "opacity:0",
			"height:0", "width:0", "position:absolute",
			"clip:rect(0,0,0,0)", "hidden", "aria-hidden",
		},
		SuspiciousHeaders: []string{"User-Agent", "Accept-Language", "Accept-Encoding",
			"Referer", "DNT", "X-Requested-With",
		},
		DomainAge: 120, // Minimum age in days to be considered trustworthy
		Findings:  make(map[string]interface{}),
	}
}
func extractMainDomain(rawURL string) (string, error) {
	// Parse the URL
	u, err := url.Parse(rawURL)
	if err != nil {
		return "", fmt.Errorf("failed to parse URL: %v", err)
	}

	// Get the hostname (removes port if present)
	host := u.Hostname()

	// Split the host into parts
	parts := strings.Split(host, ".")
	if len(parts) < 2 {
		return "", fmt.Errorf("invalid domain: %s", host)
	}

	if len(parts) > 2 {
		// For most cases, take the last two parts
		return parts[len(parts)-2] + "." + parts[len(parts)-1], nil
	}

	return host, nil
}

func (fi *FraudIndicators) AnalyzeResponse(resp *colly.Response) {
	html := string(resp.Body)
	req := resp.Request
	// urlObj, err := extractMainDomain(req.URL.String())
	// if err != nil {
	// 	log.Println(err)
	// }
	// fmt.Println(urlObj)

	//  Check for suspicious keywords
	fi.Findings["keywords"] = fi.detectKeyWords(html)

	//  Check for hidden elements
	hasHidden, hiddenElements := fi.detectHiddenElements(html)
	fi.Findings["has_hidden_elements"] = hasHidden
	fi.Findings["hidden_elements"] = hiddenElements

	//  Check security
	fi.checkSecurity(req)

	//  Check contact info
	contactInfo := fi.checkContactInfo(html)
	fi.Findings["has_contact_info"] = len(contactInfo) > 0
	fi.Findings["contact_info"] = contactInfo
	//  Check domain age (mock)
	//fi.Findings["new_domain"] = fi.checkDomainAge(handlers.Whois(urlObj))
	//return results
}

// this function will return values decpite of storing in object
func (fi *FraudIndicators) detectHiddenElements(html string) (bool, []string) {

	doc, err := goquery.NewDocumentFromReader(bytes.NewReader([]byte(html)))
	if err != nil {
		return false, nil
	}

	var foundElements []string
	found := false

	for _, selector := range fi.HiddenElements {
		doc.Find("*").Each(func(i int, s *goquery.Selection) {
			if style, exists := s.Attr("style"); exists {
				if strings.Contains(strings.ToLower(style), strings.ToLower(selector)) {
					foundElements = append(foundElements, fmt.Sprintf("Hidden by style: %s", selector))
					found = true
				}
			}

			if class, exists := s.Attr("class"); exists {
				if strings.Contains(strings.ToLower(class), strings.ToLower(selector)) {
					foundElements = append(foundElements, fmt.Sprintf("Hidden by class: %s", selector))
					found = true
				}
			}
		})
	}

	return found, foundElements

}

/*
func (fi *FraudIndicators) checkDomainAge(whois whoisparser.WhoisInfo) int {

	creationDate, err := time.Parse(time.RFC3339, whois.Domain.CreatedDate)
	if err != nil {
		log.Println(err)
	}

	ageInDays := int(time.Since(creationDate).Hours() / 24)

	return ageInDays
}
*/

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

// this object will return valuse outisde if fraud indicator function
func (fi *FraudIndicators) checkContactInfo(html string) []string {
	doc, err := goquery.NewDocumentFromReader(bytes.NewReader([]byte(html)))
	if err != nil {
		log.Println(err)
	}
	contactPatterns := []string{"contact", "about", "support", "help", "email", "phone", "address", "تماس با"}
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
