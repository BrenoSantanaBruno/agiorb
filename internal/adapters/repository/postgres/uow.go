package postgres

import (
	"context"

	"gorm.io/gorm"
)

type txKey struct{}

type UnitOfWork struct{ db *gorm.DB }

func NewUnitOfWork(db *gorm.DB) *UnitOfWork { return &UnitOfWork{db: db} }

func (u *UnitOfWork) WithinTx(ctx context.Context, fn func(ctx context.Context) error) error {
	return u.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		ctxTx := context.WithValue(ctx, txKey{}, tx)
		return fn(ctxTx)
	})
}

func dbFrom(ctx context.Context, db *gorm.DB) *gorm.DB {
	if tx, ok := ctx.Value(txKey{}).(*gorm.DB); ok {
		return tx
	}
	return db.WithContext(ctx)
}
