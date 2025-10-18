package repo

import (
	"context"
)

type Church struct {
	ID        int64  `json:"id"`
	Name      string `json:"name"`
	CNPJ      string `json:"cnpj,omitempty"`
	Address   string `json:"address,omitempty"`
	CreatedAt string `json:"created_at,omitempty"`
}

func (r *Repo) ListChurches(ctx context.Context, q string, limit, offset int) ([]Church, error) {
	rows, err := r.DB.QueryContext(ctx,
		`SELECT id, name, COALESCE(cnpj,''), COALESCE(address,''), created_at
		   FROM churches
		  WHERE $1 = '' OR name ILIKE '%'||$1||'%'
		  ORDER BY id DESC
		  LIMIT $2 OFFSET $3`,
		q, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Church
	for rows.Next() {
		var c Church
		if err := rows.Scan(&c.ID, &c.Name, &c.CNPJ, &c.Address, &c.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	return list, rows.Err()
}

func (r *Repo) CountChurches(ctx context.Context, q string) (int64, error) {
	var total int64
	err := r.DB.QueryRowContext(ctx,
		`SELECT COUNT(*)
		   FROM churches
		  WHERE $1 = '' OR name ILIKE '%'||$1||'%'`,
		q,
	).Scan(&total)
	return total, err
}

func (r *Repo) GetChurch(ctx context.Context, id int64) (*Church, error) {
	var c Church
	err := r.DB.QueryRowContext(ctx,
		`SELECT id, name, COALESCE(cnpj,''), COALESCE(address,''), created_at
		   FROM churches
		  WHERE id=$1`,
		id,
	).Scan(&c.ID, &c.Name, &c.CNPJ, &c.Address, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *Repo) CreateChurch(ctx context.Context, c *Church) (int64, error) {
	err := r.DB.QueryRowContext(ctx,
		`INSERT INTO churches (name, cnpj, address)
		  VALUES ($1,$2,$3)
		  RETURNING id`,
		c.Name, c.CNPJ, c.Address,
	).Scan(&c.ID)
	return c.ID, err
}

func (r *Repo) UpdateChurch(ctx context.Context, c *Church) error {
	_, err := r.DB.ExecContext(ctx,
		`UPDATE churches
		    SET name=$1, cnpj=$2, address=$3
		  WHERE id=$4`,
		c.Name, c.CNPJ, c.Address, c.ID,
	)
	return err
}

func (r *Repo) DeleteChurch(ctx context.Context, id int64) error {
	_, err := r.DB.ExecContext(ctx, `DELETE FROM churches WHERE id=$1`, id)
	return err
}
