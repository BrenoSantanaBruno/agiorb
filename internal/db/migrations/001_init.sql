CREATE TABLE IF NOT EXISTS users (
                                     id SERIAL PRIMARY KEY,
                                     name TEXT NOT NULL,
                                     email TEXT UNIQUE NOT NULL,
                                     password_hash TEXT NOT NULL,
                                     created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS churches (
                                        id SERIAL PRIMARY KEY,
                                        name TEXT NOT NULL,
                                        cnpj TEXT,
                                        address TEXT,
                                        created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS transactions (
                                            id SERIAL PRIMARY KEY,
                                            church_id INTEGER NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,            -- "income" | "expense"
    amount NUMERIC(12,2) NOT NULL,
    description TEXT,
    occurred_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS transaction_images (
                                                  id SERIAL PRIMARY KEY,
                                                  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
