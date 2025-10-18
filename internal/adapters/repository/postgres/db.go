package db

import (
	"database/sql"
	"log"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func Connect(dsn string) *sql.DB {
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("db open: %v", err)
	}

	// Retry ping (DB pode demorar a subir no compose)
	var lastErr error
	for i := 0; i < 30; i++ {
		if err := db.Ping(); err == nil {
			return db
		} else {
			lastErr = err
			time.Sleep(1 * time.Second)
		}
	}
	log.Fatalf("db ping: %v", lastErr)
	return db
}
