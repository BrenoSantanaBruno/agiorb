package usecase

import (
	"context"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"

	"github.com/brenosantanabruno/agiorb/internal/domain"
	"github.com/brenosantanabruno/agiorb/internal/ports"
	aerr "github.com/brenosantanabruno/agiorb/pkg/errors"
)

type MudaService struct {
	repo      ports.MudaRepository
	validator *validator.Validate
}

func NewMudaService(repo ports.MudaRepository) *MudaService {
	return &MudaService{
		repo:      repo,
		validator: validator.New(),
	}
}

type CreateMudaInput struct {
	Nome        string `json:"nome" validate:"required,min=2,max=120"`
	EstadoSaude string `json:"estado_saude" validate:"required"`
	Quantidade  int    `json:"quantidade" validate:"gte=0,lte=1000000"`
	Responsavel string `json:"responsavel" validate:"required"`
}

func (s *MudaService) Create(ctx context.Context, in CreateMudaInput) (*domain.Muda, error) {
	if err := s.validator.Struct(in); err != nil {
		return nil, aerr.ErrInvalid
	}
	m := &domain.Muda{
		Nome:        strings.TrimSpace(in.Nome),
		EstadoSaude: in.EstadoSaude,
		Quantidade:  in.Quantidade,
		Responsavel: in.Responsavel,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	if err := s.repo.Create(ctx, m); err != nil {
		return nil, err
	}
	return m, nil
}

func (s *MudaService) Get(ctx context.Context, id uint) (*domain.Muda, error) {
	if id == 0 {
		return nil, aerr.ErrInvalid
	}
	return s.repo.Get(ctx, id)
}

func (s *MudaService) List(ctx context.Context, page, pageSize int) ([]domain.Muda, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 200 {
		pageSize = 20
	}
	return s.repo.List(ctx, page, pageSize)
}

func (s *MudaService) Update(ctx context.Context, id uint, in CreateMudaInput) (*domain.Muda, error) {
	if id == 0 {
		return nil, aerr.ErrInvalid
	}
	m, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if in.Nome != "" {
		m.Nome = strings.TrimSpace(in.Nome)
	}
	if in.EstadoSaude != "" {
		m.EstadoSaude = in.EstadoSaude
	}
	if in.Responsavel != "" {
		m.Responsavel = in.Responsavel
	}
	if in.Quantidade >= 0 {
		m.Quantidade = in.Quantidade
	}
	m.UpdatedAt = time.Now()
	if err := s.repo.Update(ctx, m); err != nil {
		return nil, err
	}
	return m, nil
}

func (s *MudaService) Delete(ctx context.Context, id uint) error {
	if id == 0 {
		return aerr.ErrInvalid
	}
	return s.repo.Delete(ctx, id)
}

type AddImageInput struct {
	URL      string    `json:"url" validate:"required,url"`
	Vistoria time.Time `json:"vistoria" validate:"required"`
}

func (s *MudaService) AddImage(ctx context.Context, mudaID uint, in AddImageInput) (*domain.MudaImage, error) {
	if mudaID == 0 {
		return nil, aerr.ErrInvalid
	}
	if err := s.validator.Struct(in); err != nil {
		return nil, aerr.ErrInvalid
	}
	if _, err := s.repo.Get(ctx, mudaID); err != nil {
		return nil, err
	}
	img := &domain.MudaImage{
		MudaID:    mudaID,
		URL:       in.URL,
		Vistoria:  in.Vistoria,
		CreatedAt: time.Now(),
	}
	if err := s.repo.AddImage(ctx, img); err != nil {
		return nil, err
	}
	return img, nil
}
