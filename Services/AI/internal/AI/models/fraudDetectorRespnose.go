package models

type FraudDetectionResponse struct {
	TotalScore   int         `json:"totalScore"`
	MatchedFlags interface{} `json:"matchedFlags"`
	Notes        string      `json:"notes"`
}
