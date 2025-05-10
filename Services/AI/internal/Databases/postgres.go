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

func (db *PostgreSQL) SaveAIResponse(tableName string, domain string, description []byte) (int64, error) {
	search_date := time.DateTime
	query := `INSERT INTO ` + tableName + `(domain, description , search_date) VALUES ($1, $2, $3) returning id`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	var id int64
	err := db.DB.QueryRowContext(ctx, query, domain, description, search_date)
	if err != nil {
		return 0, fmt.Errorf("error inserting ai response err: %v", err)
	}
	return id, nil
}
