package config

import (
	"errors"
	"os"
	"strings"
)

type DBConfig struct {
	DSN string
}

type Config struct {
	Env         string
	Port        string
	DB          DBConfig
	LogLevel    string
	CORSOrigins []string
}

func Load() (*Config, error) {
	cfg := &Config{
		Env:         getEnv("APP_ENV", "dev"),
		Port:        getEnv("APP_PORT", "8080"),
		DB:          DBConfig{DSN: getEnv("DB_DSN", "")},
		LogLevel:    getEnv("LOG_LEVEL", "info"),
		CORSOrigins: splitOrStar(getEnv("CORS_ORIGINS", "*")),
	}
	if cfg.DB.DSN == "" {
		return nil, errors.New("DB_DSN required")
	}
	return cfg, nil
}

func getEnv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func splitOrStar(v string) []string {
	v = strings.TrimSpace(v)
	if v == "" || v == "*" {
		return []string{"*"}
	}
	parts := strings.Split(v, ",")
	for i := range parts {
		parts[i] = strings.TrimSpace(parts[i])
	}
	return parts
}
