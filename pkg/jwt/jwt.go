package jwt

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Maker struct {
	secret     []byte
	issuer     string
	accessTTL  time.Duration
	refreshTTL time.Duration
}

type Claims struct {
	Role string `json:"role"`
	jwt.RegisteredClaims
}

func NewMaker(secret, issuer string, accessTTL, refreshTTL time.Duration) *Maker {
	return &Maker{
		secret:     []byte(secret),
		issuer:     issuer,
		accessTTL:  accessTTL,
		refreshTTL: refreshTTL,
	}
}

func (m *Maker) SignAccess(sub string, role string) (string, time.Time, error) {
	exp := time.Now().Add(m.accessTTL)
	claims := &Claims{
		Role: role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   sub,
			Issuer:    m.issuer,
			ExpiresAt: jwt.NewNumericDate(exp),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	s, err := t.SignedString(m.secret)
	return s, exp, err
}

func (m *Maker) SignRefresh(sub string, role string) (string, time.Time, error) {
	exp := time.Now().Add(m.refreshTTL)
	claims := &Claims{
		Role: role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   sub,
			Issuer:    m.issuer,
			ExpiresAt: jwt.NewNumericDate(exp),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	s, err := t.SignedString(m.secret)
	return s, exp, err
}

func (m *Maker) Parse(token string) (*Claims, error) {
	p, err := jwt.ParseWithClaims(token, &Claims{}, func(t *jwt.Token) (any, error) {
		return m.secret, nil
	}, jwt.WithIssuer(m.issuer))
	if err != nil {
		return nil, err
	}
	if c, ok := p.Claims.(*Claims); ok && p.Valid {
		return c, nil
	}
	return nil, jwt.ErrTokenInvalidClaims
}
