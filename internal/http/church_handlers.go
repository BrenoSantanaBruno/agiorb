package http

import (
	"encoding/json"
	"math"
	"net/http"
	"strconv"

	"github.com/brenosantanabruno/agiorb/internal/repo"
	"github.com/go-chi/chi/v5"
)

type ChurchHandlers struct {
	Repo *repo.Repo
}

func NewChurchHandlers(rp *repo.Repo) *ChurchHandlers { return &ChurchHandlers{Repo: rp} }

func atoiDefault(s string, d int) int {
	if n, err := strconv.Atoi(s); err == nil {
		return n
	}
	return d
}

func (h *ChurchHandlers) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("search")
	page := atoiDefault(r.URL.Query().Get("page"), 1)
	perPage := atoiDefault(r.URL.Query().Get("per_page"), 10)
	if perPage <= 0 || perPage > 100 {
		perPage = 10
	}
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * perPage

	items, err := h.Repo.ListChurches(r.Context(), q, perPage, offset)
	if err != nil {
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}
	total, err := h.Repo.CountChurches(r.Context(), q)
	if err != nil {
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}
	totalPages := int(math.Ceil(float64(total) / float64(perPage)))

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"items":       items,
		"page":        page,
		"per_page":    perPage,
		"total":       total,
		"total_pages": totalPages,
	})
}

func (h *ChurchHandlers) Get(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	c, err := h.Repo.GetChurch(r.Context(), id)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(c)
}

func (h *ChurchHandlers) Create(w http.ResponseWriter, r *http.Request) {
	var in repo.Church
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest)
		return
	}
	id, err := h.Repo.CreateChurch(r.Context(), &in)
	if err != nil {
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}
	in.ID = id
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(in)
}

func (h *ChurchHandlers) Update(w http.ResponseWriter, r *http.Request) {
	var in repo.Church
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest)
		return
	}
	in.ID, _ = strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err := h.Repo.UpdateChurch(r.Context(), &in); err != nil {
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(in)
}

func (h *ChurchHandlers) Delete(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err := h.Repo.DeleteChurch(r.Context(), id); err != nil {
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
