package http

import (
	"encoding/json"
	"errors"
	"net/http"

	aerr "github.com/brenosantanabruno/agiorb/pkg/errors"
)

type ErrEnvelope struct {
	Error   string      `json:"error"`
	Details interface{} `json:"details,omitempty"`
}

func WriteError(w http.ResponseWriter, err error) {
	code := http.StatusInternalServerError

	switch {
	case errors.Is(err, aerr.ErrNotFound):
		code = http.StatusNotFound
	case errors.Is(err, aerr.ErrInvalid):
		code = http.StatusBadRequest
	case errors.Is(err, aerr.ErrConflict):
		code = http.StatusConflict
	case errors.Is(err, aerr.ErrUnauthorized):
		code = http.StatusUnauthorized
	case errors.Is(err, aerr.ErrForbidden):
		code = http.StatusForbidden
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(ErrEnvelope{Error: err.Error()})
}
