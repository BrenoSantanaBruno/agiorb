package ports

import (
	"context"

	"github.com/brenosantanabruno/agiorb/internal/domain"
)

type MudaRepository interface {
	Create(ctx context.Context, m *domain.Muda) error
	Get(ctx context.Context, id uint) (*domain.Muda, error)
	List(ctx context.Context, page, pageSize int) ([]domain.Muda, int64, error)
	Update(ctx context.Context, m *domain.Muda) error
	Delete(ctx context.Context, id uint) error

	AddImage(ctx context.Context, img *domain.MudaImage) error
	ListImages(ctx context.Context, mudaID uint) ([]domain.MudaImage, error)
}
