package postgres

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"github.com/brenosantanabruno/agiorb/internal/domain"
	"github.com/brenosantanabruno/agiorb/internal/ports"
	aerr "github.com/brenosantanabruno/agiorb/pkg/errors"
)

type mudaRepository struct {
	db *gorm.DB
}

func NewMudaRepository(db *gorm.DB) ports.MudaRepository {
	return &mudaRepository{db: db}
}

func (r *mudaRepository) Create(ctx context.Context, m *domain.Muda) error {
	return r.db.WithContext(ctx).Create(m).Error
}

func (r *mudaRepository) Get(ctx context.Context, id uint) (*domain.Muda, error) {
	var m domain.Muda
	if err := r.db.WithContext(ctx).First(&m, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, aerr.ErrNotFound
		}
		return nil, err
	}
	return &m, nil
}

func (r *mudaRepository) List(ctx context.Context, page, pageSize int) ([]domain.Muda, int64, error) {
	var items []domain.Muda
	var total int64
	q := r.db.WithContext(ctx).Model(&domain.Muda{})
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := q.Offset((page - 1) * pageSize).Limit(pageSize).Order("id desc").Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *mudaRepository) Update(ctx context.Context, m *domain.Muda) error {
	return r.db.WithContext(ctx).Save(m).Error
}

func (r *mudaRepository) Delete(ctx context.Context, id uint) error {
	res := r.db.WithContext(ctx).Delete(&domain.Muda{}, id)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return aerr.ErrNotFound
	}
	return nil
}

func (r *mudaRepository) AddImage(ctx context.Context, img *domain.MudaImage) error {
	return r.db.WithContext(ctx).Create(img).Error
}

func (r *mudaRepository) ListImages(ctx context.Context, mudaID uint) ([]domain.MudaImage, error) {
	var imgs []domain.MudaImage
	if err := r.db.WithContext(ctx).Where("muda_id = ?", mudaID).Order("vistoria desc").Find(&imgs).Error; err != nil {
		return nil, err
	}
	return imgs, nil
}
