package router

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/brenosantanabruno/agiorb/internal/config"
	corehttp "github.com/brenosantanabruno/agiorb/internal/http"
	"github.com/brenosantanabruno/agiorb/internal/repo"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

func New(cfg config.Config, db *sql.DB) http.Handler {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	rp := repo.New(db)
	auth := corehttp.NewAuthHandlers(db, cfg)
	church := corehttp.NewChurchHandlers(rp)
	tx := corehttp.NewTransactionHandlers(rp, cfg)

	// ------ DEV endpoints (opcional por env) ------
	if cfg.DevEndpoints {
		r.Route("/api/dev", func(dev chi.Router) {
			dev.Post("/bootstrap", auth.DevBootstrap) // seta/atualiza admin
		})
	}

	// -------- API --------
	r.Route("/api", func(api chi.Router) {
		api.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("ok"))
		})

		api.Post("/login", auth.Login)

		// /api/me (JWT)
		api.With(func(next http.Handler) http.Handler {
			return corehttp.WithAuth(cfg.JWTSecret, next)
		}).Get("/me", auth.Me)

		// públicos
		api.Get("/churches", church.List)
		api.Get("/churches/{id}", church.Get)
		api.Get("/transactions", tx.List)

		// privados (JWT)
		api.With(func(next http.Handler) http.Handler {
			return corehttp.WithAuth(cfg.JWTSecret, next)
		}).Group(func(priv chi.Router) {
			priv.Post("/churches", church.Create)
			priv.Put("/churches/{id}", church.Update)
			priv.Delete("/churches/{id}", church.Delete)

			priv.Post("/transactions", tx.Create)
			priv.Put("/transactions/{id}", tx.Update)
			priv.Delete("/transactions/{id}", tx.Delete)

			priv.Post("/transactions/{id}/images", tx.UploadImage)
			priv.Delete("/transaction-images/{id}", tx.DeleteImage) // <- AQUI dentro
		})
	})

	// uploads estáticos
	fileServer(r, "/uploads", cfg.UploadDir)

	// SPA fallback
	spa, err := corehttp.SPAServer(cfg.FrontendDist)
	if err != nil {
		log.Fatalf("SPA: %v", err)
	}
	r.NotFound(spa.ServeHTTP)

	return r
}

func fileServer(r chi.Router, path string, root string) {
	if path != "/" && path[len(path)-1] != '/' {
		r.Get(path, http.RedirectHandler(path+"/", 301).ServeHTTP)
		path += "/"
	}
	fs := http.StripPrefix(path, http.FileServer(http.Dir(root)))
	r.Get(path+"*", fs.ServeHTTP)
}
