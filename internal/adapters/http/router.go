package http

import (
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/rs/zerolog"

	"github.com/brenosantanabruno/agiorb/internal/adapters/http/middleware"
	"github.com/brenosantanabruno/agiorb/internal/config"
	"github.com/brenosantanabruno/agiorb/internal/usecase"
)

func New(cfg *config.Config, logg zerolog.Logger, mudaSvc *usecase.MudaService, authSvc *usecase.AuthService) http.Handler {
	r := chi.NewRouter()

	r.Use(chimw.RequestID)
	r.Use(chimw.RealIP)
	r.Use(chimw.Recoverer)
	r.Use(chimw.Timeout(30 * time.Second))
	r.Use(middleware.Logger(logg))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.CORSOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "Idempotency-Key"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))
	// JWT extractor (optional for anonymous routes)
	r.Use(middleware.WithAuth(authSvc, logg))

	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	r.Route("/v1", func(r chi.Router) {
		// Auth
		r.Post("/auth/register", registerHandler(authSvc))
		r.Post("/auth/login", loginHandler(authSvc))
		r.Group(func(r chi.Router) {
			r.Use(middleware.RequireAuth)
			r.Get("/auth/me", meHandler())
		})

		// Mudas: GETs public; writes require admin
		r.Get("/mudas/{id}", getMudaHandler(mudaSvc))
		r.Get("/mudas", listMudasHandler(mudaSvc))
		r.Group(func(r chi.Router) {
			r.Use(middleware.RequireAuth, middleware.RoleGuard("admin"))
			r.Post("/mudas", createMudaHandler(mudaSvc))
			r.Put("/mudas/{id}", updateMudaHandler(mudaSvc))
			r.Delete("/mudas/{id}", deleteMudaHandler(mudaSvc))
			r.Post("/mudas/{id}/images", addImageHandler(mudaSvc))
		})
	})

	return r
}

func parseUint(s string) (uint, error) {
	v, err := strconv.ParseUint(s, 10, 64)
	return uint(v), err
}
