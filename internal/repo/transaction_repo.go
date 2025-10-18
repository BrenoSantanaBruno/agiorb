package repo

import "context"

type Transaction struct {
	ID          int64   `json:"id"`
	ChurchID    int64   `json:"church_id"`
	Kind        string  `json:"kind"` // "income" | "expense"
	Amount      float64 `json:"amount"`
	Description string  `json:"description,omitempty"`
	OccurredAt  string  `json:"occurred_at"`
	CreatedAt   string  `json:"created_at,omitempty"`
}

type TransactionImage struct {
	ID            int64  `json:"id"`
	TransactionID int64  `json:"transaction_id"`
	Path          string `json:"path"`
	UploadedAt    string `json:"uploaded_at,omitempty"`
}

func (r *Repo) ListTransactions(ctx context.Context, churchID int64, limit, offset int) ([]Transaction, error) {
	rows, err := r.DB.QueryContext(ctx,
		`SELECT id, church_id, kind, amount, COALESCE(description,''), occurred_at, created_at
		 FROM transactions
		 WHERE ($1 = 0 OR church_id = $1)
		 ORDER BY id DESC
		 LIMIT $2 OFFSET $3`, churchID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Transaction
	for rows.Next() {
		var t Transaction
		if err := rows.Scan(&t.ID, &t.ChurchID, &t.Kind, &t.Amount, &t.Description, &t.OccurredAt, &t.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, t)
	}
	return list, rows.Err()
}

func (r *Repo) CreateTransaction(ctx context.Context, t *Transaction) (int64, error) {
	err := r.DB.QueryRowContext(ctx,
		`INSERT INTO transactions (church_id, kind, amount, description, occurred_at)
		 VALUES ($1,$2,$3,$4,$5) RETURNING id`,
		t.ChurchID, t.Kind, t.Amount, t.Description, t.OccurredAt).
		Scan(&t.ID)
	return t.ID, err
}

func (r *Repo) UpdateTransaction(ctx context.Context, t *Transaction) error {
	_, err := r.DB.ExecContext(ctx,
		`UPDATE transactions SET church_id=$1, kind=$2, amount=$3, description=$4, occurred_at=$5 WHERE id=$6`,
		t.ChurchID, t.Kind, t.Amount, t.Description, t.OccurredAt, t.ID)
	return err
}

func (r *Repo) DeleteTransaction(ctx context.Context, id int64) error {
	_, err := r.DB.ExecContext(ctx, `DELETE FROM transactions WHERE id=$1`, id)
	return err
}

func (r *Repo) AddTransactionImage(ctx context.Context, transactionID int64, path string) (int64, error) {
	var id int64
	err := r.DB.QueryRowContext(ctx,
		`INSERT INTO transaction_images (transaction_id, path) VALUES ($1,$2) RETURNING id`,
		transactionID, path).Scan(&id)
	return id, err
}

// Pega imagem por ID
func (r *Repo) GetTransactionImage(ctx context.Context, id int64) (*TransactionImage, error) {
	var it TransactionImage
	err := r.DB.QueryRowContext(ctx,
		`SELECT id, transaction_id, path, uploaded_at
		   FROM transaction_images WHERE id=$1`, id).
		Scan(&it.ID, &it.TransactionID, &it.Path, &it.UploadedAt)
	if err != nil {
		return nil, err
	}
	return &it, nil
}

// Deleta imagem por ID
func (r *Repo) DeleteTransactionImage(ctx context.Context, id int64) error {
	_, err := r.DB.ExecContext(ctx, `DELETE FROM transaction_images WHERE id=$1`, id)
	return err
}
