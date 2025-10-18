package http

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/brenosantanabruno/agiorb/internal/usecase"
)

func createMudaHandler(svc *usecase.MudaService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var in usecase.CreateMudaInput
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			WriteError(w, err)
			return
		}
		m, err := svc.Create(r.Context(), in)
		if err != nil {
			WriteError(w, err)
			return
		}
		WriteJSON(w, http.StatusCreated, m)
	}
}

func getMudaHandler(svc *usecase.MudaService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := chi.URLParam(r, "id")
		id, err := parseUint(idStr)
		if err != nil {
			WriteError(w, err)
			return
		}
		m, err := svc.Get(r.Context(), id)
		if err != nil {
			WriteError(w, err)
			return
		}
		WriteJSON(w, http.StatusOK, m)
	}
}

func listMudasHandler(svc *usecase.MudaService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		p := ParsePage(r)
		items, total, err := svc.List(r.Context(), p.Number, p.Size)
		if err != nil {
			WriteError(w, err)
			return
		}
		WriteJSON(w, http.StatusOK, map[string]any{
			"items": items,
			"total": total,
		})
	}
}

func updateMudaHandler(svc *usecase.MudaService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := chi.URLParam(r, "id")
		id, err := parseUint(idStr)
		if err != nil {
			WriteError(w, err)
			return
		}
		var in usecase.CreateMudaInput
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			WriteError(w, err)
			return
		}
		m, err := svc.Update(r.Context(), id, in)
		if err != nil {
			WriteError(w, err)
			return
		}
		WriteJSON(w, http.StatusOK, m)
	}
}

func deleteMudaHandler(svc *usecase.MudaService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := chi.URLParam(r, "id")
		id, err := parseUint(idStr)
		if err != nil {
			WriteError(w, err)
			return
		}
		if err := svc.Delete(r.Context(), id); err != nil {
			WriteError(w, err)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

func addImageHandler(svc *usecase.MudaService) http.HandlerFunc {
	type payload struct {
		URL      string `json:"url"`
		Vistoria string `json:"vistoria"` // RFC3339
	}
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := chi.URLParam(r, "id")
		id, err := parseUint(idStr)
		if err != nil {
			WriteError(w, err)
			return
		}
		var p payload
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			WriteError(w, err)
			return
		}
		t, err := time.Parse(time.RFC3339, p.Vistoria)
		if err != nil {
			WriteError(w, err)
			return
		}
		img, err := svc.AddImage(r.Context(), id, usecase.AddImageInput{URL: p.URL, Vistoria: t})
		if err != nil {
			WriteError(w, err)
			return
		}
		WriteJSON(w, http.StatusCreated, img)
	}
}
