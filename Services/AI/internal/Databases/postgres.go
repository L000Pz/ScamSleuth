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

// URLStorageRecord represents a row from the url_storage table
type URLStorageRecord struct {
	URLId       int64     `json:"url_id"`
	URL         string    `json:"url"`
	Description string    `json:"description"`
	SearchDate  time.Time `json:"search_date"`
}

// GetRecentURLs retrieves the 5 most recent rows from the url_storage table
func (db *PostgreSQL) GetRecentURLs(tableName string) ([]URLStorageRecord, error) {
	query := `SELECT url_id, url, description, search_date FROM ` + tableName + ` 
			  ORDER BY search_date DESC 
			  LIMIT 5`

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("error querying recent URLs: %v", err)
	}
	defer rows.Close()

	var records []URLStorageRecord

	for rows.Next() {
		var record URLStorageRecord
		err := rows.Scan(&record.URLId, &record.URL, &record.Description, &record.SearchDate)
		if err != nil {
			log.Printf("Error scanning row: %v", err)
			continue // Skip this row and continue with others
		}
		records = append(records, record)
	}

	// Check for errors from iterating over rows
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over rows: %v", err)
	}

	return records, nil
}

// GetRecentURLsWithLimit retrieves the N most recent rows from the url_storage table
func (db *PostgreSQL) GetRecentURLsWithLimit(tableName string, limit int) ([]URLStorageRecord, error) {
	if limit <= 0 {
		limit = 5 // Default to 5 if invalid limit provided
	}

	query := `SELECT url_id, url, description, search_date FROM ` + tableName + ` 
			  ORDER BY search_date DESC 
			  LIMIT $1`

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("error querying recent URLs: %v", err)
	}
	defer rows.Close()

	var records []URLStorageRecord

	for rows.Next() {
		var record URLStorageRecord
		err := rows.Scan(&record.URLId, &record.URL, &record.Description, &record.SearchDate)
		if err != nil {
			log.Printf("Error scanning row: %v", err)
			continue // Skip this row and continue with others
		}
		records = append(records, record)
	}

	// Check for errors from iterating over rows
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over rows: %v", err)
	}

	return records, nil
}

// GetURLsByDateRange retrieves URLs within a specific date range
func (db *PostgreSQL) GetURLsByDateRange(tableName string, startDate, endDate time.Time) ([]URLStorageRecord, error) {
	query := `SELECT url_id, url, description, search_date FROM ` + tableName + ` 
			  WHERE search_date BETWEEN $1 AND $2 
			  ORDER BY search_date DESC`

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("error querying URLs by date range: %v", err)
	}
	defer rows.Close()

	var records []URLStorageRecord

	for rows.Next() {
		var record URLStorageRecord
		err := rows.Scan(&record.URLId, &record.URL, &record.Description, &record.SearchDate)
		if err != nil {
			log.Printf("Error scanning row: %v", err)
			continue
		}
		records = append(records, record)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over rows: %v", err)
	}

	return records, nil
}

// GetURLsBySearchPattern retrieves URLs that match a search pattern
func (db *PostgreSQL) GetURLsBySearchPattern(tableName string, pattern string, limit int) ([]URLStorageRecord, error) {
	if limit <= 0 {
		limit = 10 // Default limit
	}

	query := `SELECT url_id, url, description, search_date FROM ` + tableName + ` 
			  WHERE url ILIKE $1 OR description ILIKE $1 
			  ORDER BY search_date DESC 
			  LIMIT $2`

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	searchPattern := "%" + pattern + "%"
	rows, err := db.DB.QueryContext(ctx, query, searchPattern, limit)
	if err != nil {
		return nil, fmt.Errorf("error querying URLs by pattern: %v", err)
	}
	defer rows.Close()

	var records []URLStorageRecord

	for rows.Next() {
		var record URLStorageRecord
		err := rows.Scan(&record.URLId, &record.URL, &record.Description, &record.SearchDate)
		if err != nil {
			log.Printf("Error scanning row: %v", err)
			continue
		}
		records = append(records, record)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over rows: %v", err)
	}

	return records, nil
}
