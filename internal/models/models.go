package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	Email        string         `gorm:"uniqueIndex;size:255" json:"email"`
	PasswordHash string         `json:"-"`
	Role         string         `gorm:"size:50" json:"role"`
}

func HashPassword(pw string) string {
	b, _ := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
	return string(b)
}
func CheckPassword(hash, pw string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(pw)) == nil
}

// Igreja
type Church struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Name      string         `gorm:"size:255" json:"name"`
	CNPJ      string         `gorm:"size:32" json:"cnpj"`
	Address   string         `gorm:"size:255" json:"address"`
}

// Tesouraria: transações
type Transaction struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	ChurchID    uint           `json:"church_id"`
	Type        string         `gorm:"size:16" json:"type"` // INCOME | EXPENSE
	AmountCents int64          `json:"amount_cents"`
	Description string         `gorm:"size:500" json:"description"`
	Date        time.Time      `json:"date"`

	Church            Church             `gorm:"foreignKey:ChurchID" json:"-"`
	TransactionImages []TransactionImage `json:"images,omitempty"`
}

type TransactionImage struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
	TransactionID uint           `json:"transaction_id"`
	URL           string         `gorm:"size:500" json:"url"`
}
