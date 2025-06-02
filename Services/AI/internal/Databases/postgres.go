package Databases

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
)

type PostgreSQL struct {
	DB *sql.DB
}

func NewPostgreSQL(connStr string) (*PostgreSQL, error) {

	var db *sql.DB
	var err error
	maxRetries := 3

	for i := 0; i < maxRetries; i++ {
		db, err = sql.Open("postgres", connStr)
		if err == nil {
			// Verify connection with a 5-second timeout
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()

			if err = db.PingContext(ctx); err == nil {
				break
			}
		}

		if i < maxRetries-1 {
			log.Printf("Connection attempt %d failed, retrying...", i+1)
			time.Sleep(time.Duration(i+1) * time.Second)
		}
	}

	if err != nil {
		return nil, fmt.Errorf("failed to connect after %d attempts: %v", maxRetries, err)
	}

	// Set connection pool parameters (optional)
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	log.Println("Successfully connected to PostgreSQL!")
	return &PostgreSQL{DB: db}, nil
}

// func (db *PostgreSQL) SaveAIResponse(tableName string, domain string, description []byte) (int64, error) {
// 	search_date := time.DateTime
// 	query := `INSERT INTO ` + tableName + `(domain, description , search_date) VALUES ($1, $2, $3) returning id`

//		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
//		defer cancel()
//		var id int64
//		err := db.DB.QueryRowContext(ctx, query, domain, description, search_date)
//		if err != nil {
//			return 0, fmt.Errorf("error inserting ai response err: %v", err)
//		}
//		return id, nil
//	}
func (db *PostgreSQL) SaveAIResponse(tableName string, url string, description []byte) (int64, error) {
	search_date := time.Now()

	query := `INSERT INTO ` + tableName + `(url, description , search_date) VALUES ($1, $2, $3) returning url_id`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var url_id int64
	err := db.DB.QueryRowContext(ctx, query, url, description, search_date).Scan(&url_id)
	if err != nil {
		return 0, fmt.Errorf("error inserting ai response err: %v", err)
	}
	return url_id, nil
}

// func (db *PostgreSQL) CheckIfurlExistsInDB(site string, tableName string) bool {
// 	query := `SELECT 1 FROM ` + tableName + ` WHERE url = $1 LIMIT 1`

// 	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
// 	defer cancel()
// 	var exists int
// 	fmt.Printf("Searching for URL: '%s' (length: %d)\n", site, len(site))
// 	fmt.Printf("Query: %s\n", query)
// 	err := db.DB.QueryRowContext(ctx, query, site).Scan(&exists)
// 	fmt.Println("this is exists on the database file")
// 	fmt.Println(exists)
// 	if err != nil {
// 		if err == sql.ErrNoRows {
// 			return false
// 		}
// 		log.Printf("Error in checking if url exists : %v", err)
// 		return false
// 	}

//		return true
//	}
func (db *PostgreSQL) CheckIfurlExistsInDB(site string, tableName string) bool {
	query := `SELECT 1 FROM ` + tableName + ` WHERE url = $1 LIMIT 1`
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Debug: Print what we're searching for
	//fmt.Printf("Searching for URL: '%s'\n", site)
	//fmt.Printf("Query: %s\n", query)

	var exists int
	err := db.DB.QueryRowContext(ctx, query, site).Scan(&exists)

	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Println("No rows found - URL doesn't exist")
			return false
		}
		log.Printf("Error in checking if url exists: %v", err)
		return false
	}

	fmt.Printf("Found result: %d\n", exists)
	return exists > 0 // More explicit check
}
func (db *PostgreSQL) IsRecent(site string, tableName string) bool {

	query := `select search_date from ` + tableName + ` where url = $1 LIMIT 1`
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	var searchDate time.Time
	err := db.DB.QueryRowContext(ctx, query, site).Scan(&searchDate)

	if err != nil {
		if err == sql.ErrNoRows {
			// No record found, so it's not recent (doesn't exist)
			return false
		}
		// Log other errors and return false to be safe
		log.Printf("Error checking if URL is recent: %v", err)
		return false
	}

	// Calculate one week ago from now
	oneWeekAgo := time.Now().AddDate(0, 0, -7)

	// Check if the search_date is after one week ago
	return searchDate.After(oneWeekAgo)
}
func (db *PostgreSQL) RetreiveSavedData(site string, tableName string) string {
	query := `select description from ` + tableName + ` where url = $1 LIMIT 1`
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var description string
	err := db.DB.QueryRowContext(ctx, query, site).Scan(&description)
	if err != nil {
		log.Printf("Error in retrieving description")
		return ""
	}
	return description
}
