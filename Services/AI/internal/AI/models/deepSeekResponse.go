package models

type CompletionResponse struct {
	ID       string `json:"id"`
	Provider string `json:"provider"`
	Model    string `json:"model"`
	Object   string `json:"object"`
	Created  int64  `json:"created"`
	Choices  []struct {
		Logprobs           interface{} `json:"logprobs"`
		FinishReason       string      `json:"finish_reason"`
		NativeFinishReason string      `json:"native_finish_reason"`
		Index              int         `json:"index"`
		Message            struct {
			Role      string      `json:"role"`
			Content   string      `json:"content"`
			Refusal   interface{} `json:"refusal"`
			Reasoning string      `json:"reasoning"`
		} `json:"message"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
	} `json:"usage"`
}
