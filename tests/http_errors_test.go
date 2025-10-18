package tests

import (
	"net/http/httptest"
	"testing"

	httpx "github.com/brenosantanabruno/agiorb/internal/adapters/http"
	aerr "github.com/brenosantanabruno/agiorb/pkg/errors"
)

func TestWriteErrorCodes(t *testing.T) {
	cases := []struct {
		err  error
		want int
	}{
		{aerr.ErrNotFound, 404},
		{aerr.ErrInvalid, 400},
		{aerr.ErrConflict, 409},
		{aerr.ErrUnauthorized, 401},
		{aerr.ErrForbidden, 403},
	}
	for _, tc := range cases {
		rr := httptest.NewRecorder()
		httpx.WriteError(rr, tc.err)
		if rr.Code != tc.want {
			t.Fatalf("got %d want %d for %v", rr.Code, tc.want, tc.err)
		}
	}
}
