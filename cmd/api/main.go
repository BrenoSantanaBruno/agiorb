package main

import (
	"log"
	"net/http"

	"github.com/brenosantanabruno/agiorb/internal/config"
	"github.com/brenosantanabruno/agiorb/internal/db"
	"github.com/brenosantanabruno/agiorb/internal/http/router"
)

func main() {
	cfg := config.Load()

	conn := db.Connect(cfg.DatabaseURL)
	defer conn.Close()

	if err := db.RunMigrations(conn); err != nil {
		log.Fatalf("migrations error: %v", err)
	}

	r := router.New(cfg, conn)

	addr := ":" + cfg.Port
	log.Printf("AGIORB API up on %s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatal(err)
	}
}
