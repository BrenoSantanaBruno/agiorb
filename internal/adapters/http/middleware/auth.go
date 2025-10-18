package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/rs/zerolog"

	"github.com/brenosantanabruno/agiorb/internal/usecase"
)

type authKey struct{}

type Principal struct {
	Sub  string
	Role string
}

func WithAuth(auth *usecase.AuthService, log zerolog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			h := r.Header.Get("Authorization")
			if !strings.HasPrefix(strings.ToLower(h), "bearer ") {
				next.ServeHTTP(w, r) // allow anonymous; use guard later
				return
			}
			token := strings.TrimSpace(h[len("Bearer "):])
			claims, err := auth.Parse(token)
			if err != nil {
				// optional: log or return 401 immediately
				next.ServeHTTP(w, r)
				return
			}
			p := Principal{Sub: claims.Subject, Role: claims.Role}
			ctx := context.WithValue(r.Context(), authKey{}, p)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, ok := Current(r.Context()); !ok {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func RoleGuard(roles ...string) func(http.Handler) http.Handler {
	allowed := map[string]struct{}{}
	for _, r := range roles {
		allowed[r] = struct{}{}
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			p, ok := Current(r.Context())
			if !ok {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			if _, ok := allowed[p.Role]; !ok {
				w.WriteHeader(http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func Current(ctx context.Context) (Principal, bool) {
	p, ok := ctx.Value(authKey{}).(Principal)
	return p, ok
}
