FROM golang:1.22 as build
WORKDIR /app
COPY . .
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server ./cmd/api

FROM gcr.io/distroless/base-debian12
WORKDIR /
COPY --from=build /app/server /server
COPY ./.env /
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/server"]
