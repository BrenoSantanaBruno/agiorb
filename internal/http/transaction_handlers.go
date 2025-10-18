package http

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/brenosantanabruno/agiorb/internal/config"
	"github.com/brenosantanabruno/agiorb/internal/repo"
	"github.com/go-chi/chi/v5"
)

type TransactionHandlers struct {
	Repo *repo.Repo
	Cfg  config.Config
}

func NewTransactionHandlers(rp *repo.Repo, cfg config.Config) *TransactionHandlers {
	return &TransactionHandlers{Repo: rp, Cfg: cfg}
}

func (h *TransactionHandlers) List(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	churchID, _ := strconv.ParseInt(r.URL.Query().Get("church_id"), 10, 64)
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	list, err := h.Repo.ListTransactions(r.Context(), churchID, limit, offset)
	if err != nil {
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(list)
}

func (h *TransactionHandlers) Create(w http.ResponseWriter, r *http.Request) {
	var in repo.Transaction
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest)
		return
	}
	if in.Kind != "income" && in.Kind != "expense" {
		http.Error(w, "kind must be income|expense", http.StatusBadRequest)
		return
	}
	if in.OccurredAt == "" {
		in.OccurredAt = time.Now().Format("2006-01-02")
	}
	if _, err := h.Repo.CreateTransaction(r.Context(), &in); err != nil {
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(in)
}

func (h *TransactionHandlers) Update(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	var in repo.Transaction
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest)
		return
	}
	in.ID = id
	if err := h.Repo.UpdateTransaction(r.Context(), &in); err != nil {
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(in)
}

func (h *TransactionHandlers) Delete(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err := h.Repo.DeleteTransaction(r.Context(), id); err != nil {
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *TransactionHandlers) UploadImage(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	if err := r.ParseMultipartForm(20 << 20); err != nil { // 20MB
		http.Error(w, "multipart error", http.StatusBadRequest)
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "missing file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	if _, err := os.Stat(h.Cfg.UploadDir); os.IsNotExist(err) {
		_ = os.MkdirAll(h.Cfg.UploadDir, 0o755)
	}

	filename := time.Now().Format("20060102_150405") + "_" + header.Filename
	dst := filepath.Join(h.Cfg.UploadDir, filename)

	out, err := os.Create(dst)
	if err != nil {
		http.Error(w, "store error", http.StatusInternalServerError)
		return
	}
	defer out.Close()
	if _, err := out.ReadFrom(file); err != nil {
		http.Error(w, "store error", http.StatusInternalServerError)
		return
	}

	rel := "/uploads/" + filename
	if _, err := h.Repo.AddTransactionImage(r.Context(), id, rel); err != nil {
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"path": rel})
}

// ... imports no topo já existem

func (h *TransactionHandlers) DeleteImage(w http.ResponseWriter, r *http.Request) {
	imageID, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	// Busca path para apagar do FS
	it, err := h.Repo.GetTransactionImage(r.Context(), imageID)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	// Remove do banco primeiro
	if err := h.Repo.DeleteTransactionImage(r.Context(), imageID); err != nil {
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}

	// Apaga arquivo (melhor esforço)
	if it.Path != "" {
		// it.Path vem como "/uploads/arquivo.ext" → converte para caminho físico
		const prefix = "/uploads/"
		if strings.HasPrefix(it.Path, prefix) {
			name := strings.TrimPrefix(it.Path, prefix)
			_ = os.Remove(filepath.Join(h.Cfg.UploadDir, name))
		}
	}

	w.WriteHeader(http.StatusNoContent)
}
