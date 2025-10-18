package errors

import "errors"

var (
	ErrNotFound     = errors.New("not found")
	ErrInvalid      = errors.New("invalid")
	ErrConflict     = errors.New("conflict")
	ErrUnauthorized = errors.New("unauthorized")
	ErrForbidden    = errors.New("forbidden")
)
