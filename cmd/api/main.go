package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/rs/zerolog"

	httpserver "github.com/brenosantanabruno/agiorb/internal/adapters/http"
	"github.com/brenosantanabruno/agiorb/internal/adapters/repository/postgres"
	"github.com/brenosantanabruno/agiorb/internal/config"
	"github.com/brenosantanabruno/agiorb/internal/usecase"
	"github.com/brenosantanabruno/agiorb/pkg/logger"
)

func main() {
	_ = godotenv.Load()

	migrateCmd := flag.String("migrate", "", "run migrations: up|down")
	flag.Parse()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	logg := logger.New(cfg.LogLevel)

	db, closeDB, err := postgres.Open(cfg.DB.DSN)
	if err != nil {
		logg.Fatal().Err(err).Msg("db open")
	}
	defer func() {
		if err := closeDB(); err != nil {
			logg.Error().Err(err).Msg("db close")
		}
	}()

	if *migrateCmd != "" {
		if err := postgres.Migrate(db, *migrateCmd); err != nil {
			logg.Fatal().Err(err).Msg("migration failed")
		}
		logg.Info().Msg("migration done")
		return
	}

	// Wire services
	mudaRepo := postgres.NewMudaRepository(db)
	mudaSvc := usecase.NewMudaService(mudaRepo)

	var zl zerolog.Logger = logg
	handler := httpserver.New(cfg, zl, mudaSvc)

	server := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	go func() {
		logg.Info().Str("addr", server.Addr).Msg("http server starting")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logg.Fatal().Err(err).Msg("server")
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		logg.Error().Err(err).Msg("server shutdown")
	} else {
		logg.Info().Msg("server stopped")
	}
}
