package models




type Enamad_Data struct {
	ID           int    `json:"id"`
	Domain       string `json:"domain"`
	NamePer      string `json:"nameper"`
	ApproveDate  string `json:"approvedate"`
	ExpDate      string `json:"expdate"`
	StateName    string `json:"stateName"`
	CityName     string `json:"cityName"`
	LogoLevel    int    `json:"logolevel"`
	SrvText      string `json:"srvText"`
	Code         string `json:"Code"`
	IsNewProfile bool   `json:"isNewProfile"`
}
