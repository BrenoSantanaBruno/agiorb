package http

import (
	"context"

	mwauth "github.com/brenosantanabruno/agiorb/internal/adapters/http/middleware"
)

type UserCtx struct {
	Sub  string
	Role string
}

func CurrentUser(ctx context.Context) (*UserCtx, bool) {
	p, ok := mwauth.Current(ctx)
	if !ok {
		return nil, false
	}
	return &UserCtx{Sub: p.Sub, Role: p.Role}, true
}
