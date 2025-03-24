package models

type FraudIndicators struct {
	SuspiciousKeywords []string `json:"suspicious_keywords"`
	HiddenText         []string `json:"hidden_text"`
	UnsecureConnection bool     `json:"unsecure_connection"`
	NoContactInfo      bool     `json:"no_contact_info"`
}
