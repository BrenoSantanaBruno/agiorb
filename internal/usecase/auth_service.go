package usecase

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"

	"github.com/brenosantanabruno/agiorb/internal/domain"
	"github.com/brenosantanabruno/agiorb/internal/ports"
	aerr "github.com/brenosantanabruno/agiorb/pkg/errors"
	"github.com/brenosantanabruno/agiorb/pkg/jwt"
	"github.com/brenosantanabruno/agiorb/pkg/password"
)

type AuthService struct {
	users     ports.UserRepository
	validator *validator.Validate
	jwt       *jwt.Maker
}

func NewAuthService(users ports.UserRepository, jwtMaker *jwt.Maker) *AuthService {
	return &AuthService{
		users:     users,
		validator: validator.New(),
		jwt:       jwtMaker,
	}
}

type RegisterInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8,max=128"`
	Role     string `json:"role" validate:"omitempty,oneof=user admin"`
}

type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type TokenPair struct {
	AccessToken   string    `json:"access_token"`
	AccessExpiry  time.Time `json:"access_expiry"`
	RefreshToken  string    `json:"refresh_token"`
	RefreshExpiry time.Time `json:"refresh_expiry"`
}

func (s *AuthService) Register(ctx context.Context, in RegisterInput) (*domain.User, *TokenPair, error) {
	if err := s.validator.Struct(in); err != nil {
		return nil, nil, aerr.ErrInvalid
	}
	role := in.Role
	if role == "" {
		role = "user"
	}
	hash, err := password.Hash(in.Password, password.Default)
	if err != nil {
		return nil, nil, err
	}
	u := &domain.User{
		Email:        strings.ToLower(strings.TrimSpace(in.Email)),
		PasswordHash: hash,
		Role:         role,
	}
	if err := s.users.Create(ctx, u); err != nil {
		return nil, nil, err
	}
	tp, err := s.issueTokens(u)
	if err != nil {
		return nil, nil, err
	}
	return u, tp, nil
}

func (s *AuthService) Login(ctx context.Context, in LoginInput) (*domain.User, *TokenPair, error) {
	if err := s.validator.Struct(in); err != nil {
		return nil, nil, aerr.ErrInvalid
	}
	u, err := s.users.GetByEmail(ctx, strings.ToLower(strings.TrimSpace(in.Email)))
	if err != nil {
		return nil, nil, aerr.ErrUnauthorized
	}
	ok, err := password.Verify(in.Password, u.PasswordHash)
	if err != nil || !ok {
		return nil, nil, aerr.ErrUnauthorized
	}
	tp, err := s.issueTokens(u)
	if err != nil {
		return nil, nil, err
	}
	return u, tp, nil
}

func (s *AuthService) issueTokens(u *domain.User) (*TokenPair, error) {
	sub := strconv.FormatUint(uint64(u.ID), 10)
	access, aexp, err := s.jwt.SignAccess(sub, u.Role)
	if err != nil {
		return nil, err
	}
	refresh, rexp, err := s.jwt.SignRefresh(sub, u.Role)
	if err != nil {
		return nil, err
	}
	return &TokenPair{
		AccessToken: access, AccessExpiry: aexp,
		RefreshToken: refresh, RefreshExpiry: rexp,
	}, nil
}

func (s *AuthService) Parse(token string) (*jwt.Claims, error) {
	return s.jwt.Parse(token)
}

func (s *AuthService) DebugUserString(u *domain.User) string {
	return fmt.Sprintf("User{id=%d,email=%s,role=%s}", u.ID, u.Email, u.Role)
}
