-- senha: admin
INSERT INTO users (name, email, password_hash)
SELECT 'Admin', 'admin@example.com', '$2a$10$lF6a6x7ez6rGingxGJ3C1OZ2h1rZkQK0xYbKc4A8dB2nB8v0b0oZS'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='admin@example.com');
