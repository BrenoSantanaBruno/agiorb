package postgres

import (
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/brenosantanabruno/agiorb/internal/domain"
)

func Open(dsn string) (*gorm.DB, func() error, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, nil, err
	}
	// AutoMigrate core tables (idempotent). Replace with real migrations in prod.
	if err := db.AutoMigrate(&domain.Muda{}, &domain.MudaImage{}); err != nil {
		return nil, nil, fmt.Errorf("automigrate: %w", err)
	}
	close := func() error {
		sqlDB, err := db.DB()
		if err != nil {
			return err
		}
		return sqlDB.Close()
	}
	return db, close, nil
}
