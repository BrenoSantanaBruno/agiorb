package http

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/brenosantanabruno/agiorb/internal/config"
	"github.com/brenosantanabruno/agiorb/internal/security"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandlers struct {
	DB  *sql.DB
	Cfg config.Config
}

func NewAuthHandlers(db *sql.DB, cfg config.Config) *AuthHandlers {
	return &AuthHandlers{DB: db, Cfg: cfg}
}

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginRes struct {
	Token string `json:"token"`
	User  struct {
		ID    int64  `json:"id"`
		Name  string `json:"name"`
		Email string `json:"email"`
	} `json:"user"`
}

func (h *AuthHandlers) Login(w http.ResponseWriter, r *http.Request) {
	var in loginReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest)
		return
	}
	var (
		id    int64
		name  string
		email string
		hash  string
	)
	err := h.DB.QueryRow(`SELECT id, name, email, password_hash FROM users WHERE email=$1`, in.Email).
		Scan(&id, &name, &email, &hash)
	if err != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(hash), []byte(in.Password)) != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}
	tok, err := security.CreateToken(h.Cfg.JWTSecret, id, email)
	if err != nil {
		http.Error(w, "token error", http.StatusInternalServerError)
		return
	}
	var out loginRes
	out.Token = tok
	out.User.ID = id
	out.User.Name = name
	out.User.Email = email
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(out)
}

func (h *AuthHandlers) Me(w http.ResponseWriter, r *http.Request) {
	uid, ok := GetUserID(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	var (
		id    int64
		name  string
		email string
	)
	err := h.DB.QueryRow(`SELECT id, name, email FROM users WHERE id=$1`, uid).
		Scan(&id, &name, &email)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"id":    id,
		"name":  name,
		"email": email,
	})
}

// --------- DEV ONLY ----------
func (h *AuthHandlers) DevBootstrap(w http.ResponseWriter, r *http.Request) {
	pw := r.URL.Query().Get("password")
	if pw == "" {
		pw = "admin"
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "bcrypt error", http.StatusInternalServerError)
		return
	}
	_, err = h.DB.Exec(`
		INSERT INTO users (name, email, password_hash)
		VALUES ('Admin','admin@example.com',$1)
		ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
	`, string(hash))
	if err != nil {
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"email": "admin@example.com",
		"note":  "admin password set",
	})
}
