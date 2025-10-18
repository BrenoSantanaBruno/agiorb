package http

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/brenosantanabruno/agiorb/internal/usecase"
)

func registerHandler(auth *usecase.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var in usecase.RegisterInput
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			WriteError(w, err)
			return
		}
		u, tokens, err := auth.Register(r.Context(), in)
		if err != nil {
			WriteError(w, err)
			return
		}
		WriteJSON(w, http.StatusCreated, map[string]any{
			"user":   u,
			"tokens": tokens,
		})
	}
}

func loginHandler(auth *usecase.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var in usecase.LoginInput
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			WriteError(w, err)
			return
		}
		u, tokens, err := auth.Login(r.Context(), in)
		if err != nil {
			WriteError(w, err)
			return
		}
		WriteJSON(w, http.StatusOK, map[string]any{
			"user":   u,
			"tokens": tokens,
		})
	}
}

func meHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		usr, ok := CurrentUser(r.Context())
		if !ok {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		id, _ := strconv.ParseUint(usr.Sub, 10, 64)
		WriteJSON(w, http.StatusOK, map[string]any{
			"id":   id,
			"role": usr.Role,
		})
	}
}
