package postgres

import (
	"errors"

	"gorm.io/gorm"
)

// Placeholder migration dispatcher to align with Makefile targets.
func Migrate(db *gorm.DB, dir string) error {
	switch dir {
	case "up":
		return nil // AutoMigrate already runs on Open
	case "down":
		if err := db.Migrator().DropTable("muda_images", "mudas"); err != nil {
			return err
		}
		return nil
	default:
		return errors.New("unknown migrate command")
	}
}
