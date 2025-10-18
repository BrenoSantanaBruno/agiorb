package config

import "os"

type Config struct {
	Port         string
	JWTSecret    string
	DatabaseURL  string
	FrontendDist string
	UploadDir    string
	DevEndpoints bool
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func Load() Config {
	return Config{
		Port:         getenv("APP_PORT", "8080"),
		JWTSecret:    getenv("JWT_SECRET", "dev-secret"),
		DatabaseURL:  getenv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/agiorb?sslmode=disable"),
		FrontendDist: getenv("FRONTEND_DIST", "./frontend/dist"),
		UploadDir:    getenv("UPLOAD_DIR", "./uploads"),
		DevEndpoints: getenv("ENABLE_DEV_ENDPOINTS", "false") == "true",
	}
}
