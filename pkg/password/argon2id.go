package password

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"

	"golang.org/x/crypto/argon2"
)

type Params struct {
	Memory      uint32
	Iterations  uint32
	Parallelism uint8
	KeyLen      uint32
	SaltLen     uint32
}

var Default = Params{
	Memory:      64 * 1024, // 64 MB
	Iterations:  1,
	Parallelism: 1,
	KeyLen:      32,
	SaltLen:     16,
}

func Hash(plain string, p Params) (string, error) {
	if plain == "" {
		return "", errors.New("empty password")
	}
	salt := make([]byte, p.SaltLen)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	hash := argon2.IDKey([]byte(plain), salt, p.Iterations, p.Memory, p.Parallelism, p.KeyLen)
	return fmt.Sprintf("$argon2id$v=19$m=%d,t=%d,p=%d$%s$%s",
		p.Memory, p.Iterations, p.Parallelism,
		base64.RawStdEncoding.EncodeToString(salt),
		base64.RawStdEncoding.EncodeToString(hash),
	), nil
}

func Verify(plain, encoded string) (bool, error) {
	var mem uint32
	var iters uint32
	var par uint8
	var saltB64, hashB64 string
	_, err := fmt.Sscanf(encoded, "$argon2id$v=19$m=%d,t=%d,p=%d$%s$%s", &mem, &iters, &par, &saltB64, &hashB64)
	if err != nil {
		return false, err
	}
	salt, err := base64.RawStdEncoding.DecodeString(saltB64)
	if err != nil {
		return false, err
	}
	want, err := base64.RawStdEncoding.DecodeString(hashB64)
	if err != nil {
		return false, err
	}
	computed := argon2.IDKey([]byte(plain), salt, iters, mem, par, uint32(len(want)))
	// constant-time compare
	if len(computed) != len(want) {
		return false, nil
	}
	var diff byte
	for i := range computed {
		diff |= computed[i] ^ want[i]
	}
	return diff == 0, nil
}
