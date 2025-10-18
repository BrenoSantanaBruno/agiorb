package logger

import (
	"os"
	"strings"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

// Logger is an alias to zerolog.Logger for convenience.
type Logger = zerolog.Logger

func New(level string) zerolog.Logger {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	lvl, err := zerolog.ParseLevel(strings.ToLower(level))
	if err != nil {
		lvl = zerolog.InfoLevel
	}
	l := log.Output(zerolog.ConsoleWriter{Out: os.Stdout}).Level(lvl)
	return l
}
