package models

import (
	"bytes"
	"fmt"
	"log"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly/v2"
	"golang.org/x/net/html"
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

var (
	fraudKeywords = []string{
		"urgent", "guarantee", "risk-free", "act now", "limited time",
		"congratulations", "prize", "winner", "free", "instant",
	}
)

func isHidden(n *html.Node) bool {
	for _, attr := range n.Attr {
		if attr.Key == "style" && strings.Contains(strings.ToLower(attr.Val), "display:none") {
			return true
		}
		if attr.Key == "type" && attr.Val == "hidden" {
			return true
		}
	}
	return false
}

// Example implementation of AnalyzeContent (should be in models package)
func (fi *FraudIndicators) AnalyzeContent(doc *html.Node, r *colly.Response) {
	var f func(*html.Node)
	foundKeywords := make(map[string]bool)
	var hiddenElements []string

	f = func(n *html.Node) {
		if n.Type == html.ElementNode {
			// Check for hidden elements
			if isHidden(n) {
				hiddenElements = append(hiddenElements, n.Data)
			}
		}

		if n.Type == html.TextNode {
			// Check for fraud keywords
			text := strings.ToLower(n.Data)
			for _, kw := range fraudKeywords {
				if strings.Contains(text, kw) {
					foundKeywords[kw] = true
				}
			}

			// Check for contact info
			if strings.Contains(text, "@") || strings.Contains(text, "phone") {
				fi.Findings["NoContactInfo"] = true
			}
		}

		for c := n.FirstChild; c != nil; c = c.NextSibling {
			f(c)
		}
	}

	f(doc)

	// Update findings
	// for kw := range foundKeywords {
	// 	fi.SuspiciousKeywords = append(fi.SuspiciousKeywords, kw)
	// }
	fi.Findings["FoundKeywords"] = foundKeywords
	fi.Findings["HiddenElements"] = hiddenElements
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
