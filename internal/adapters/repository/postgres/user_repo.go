package postgres

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"github.com/brenosantanabruno/agiorb/internal/domain"
	"github.com/brenosantanabruno/agiorb/internal/ports"
	aerr "github.com/brenosantanabruno/agiorb/pkg/errors"
)

type userRepository struct{ db *gorm.DB }

func NewUserRepository(db *gorm.DB) ports.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, u *domain.User) error {
	if err := r.db.WithContext(ctx).Create(u).Error; err != nil {
		// gorm.ErrDuplicatedKey since v1.24+
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return aerr.ErrConflict
		}
		return err
	}
	return nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	var u domain.User
	if err := r.db.WithContext(ctx).Where("email = ?", email).First(&u).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, aerr.ErrNotFound
		}
		return nil, err
	}
	return &u, nil
}

func (r *userRepository) GetByID(ctx context.Context, id uint) (*domain.User, error) {
	var u domain.User
	if err := r.db.WithContext(ctx).First(&u, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, aerr.ErrNotFound
		}
		return nil, err
	}
	return &u, nil
}
