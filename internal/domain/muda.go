package domain

import "time"

type Muda struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Nome        string    `json:"nome"`
	EstadoSaude string    `json:"estado_saude"`
	Quantidade  int       `json:"quantidade"`
	Responsavel string    `json:"responsavel"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type MudaImage struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	MudaID    uint      `json:"muda_id" gorm:"index"`
	URL       string    `json:"url"`
	Vistoria  time.Time `json:"vistoria"`
	CreatedAt time.Time `json:"created_at"`
}
