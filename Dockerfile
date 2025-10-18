# ---------- build do frontend ----------
FROM node:20-alpine AS web
WORKDIR /web

# Dependências
COPY frontend/package*.json ./
RUN npm ci || npm install

# Código
COPY frontend/ .

# Build
RUN npm run build

# Normaliza saída (Vite=dist/ | CRA=build/)
RUN if [ -d dist ]; then \
      mv dist _dist; \
    elif [ -d build ]; then \
      mv build _dist; \
    else \
      echo "Nenhum dist/ nem build/ encontrado após npm run build"; \
      ls -la; \
      exit 1; \
    fi

# ---------- build do backend ----------
FROM golang:1.25-alpine AS go-build
ENV CGO_ENABLED=0 \
    GOTOOLCHAIN=auto
WORKDIR /build

# Cache de módulos
COPY go.mod go.sum ./
RUN go mod download

# Código backend
COPY . .

# Copia o frontend compilado
RUN mkdir -p ./frontend_dist
COPY --from=web /web/_dist ./frontend_dist

# Build binário
RUN go build -o app ./cmd/api

# ---------- runtime ----------
FROM gcr.io/distroless/base-debian12
WORKDIR /app
COPY --from=go-build /build/app /app/app
COPY --from=go-build /build/frontend_dist /app/frontend_dist
VOLUME ["/app/uploads"]
ENV APP_PORT=8080
EXPOSE 8080
USER 65532:65532
ENTRYPOINT ["/app/app"]
