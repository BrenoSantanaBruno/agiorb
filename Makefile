.PHONY: run tidy fmt test migrate-up migrate-down

run:
	go run ./cmd/api

tidy:
	go mod tidy

fmt:
	gofmt -s -w .

test:
	go test ./... -race -count=1

migrate-up:
	go run ./cmd/api --migrate up

migrate-down:
	go run ./cmd/api --migrate down
