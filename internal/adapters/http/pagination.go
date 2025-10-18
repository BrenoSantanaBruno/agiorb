package http

import (
	"net/http"
	"strconv"
)

type Page struct {
	Number int
	Size   int
}

func (p *Page) Normalize() {
	if p.Number < 1 {
		p.Number = 1
	}
	if p.Size < 1 || p.Size > 200 {
		p.Size = 20
	}
}

func ParsePage(r *http.Request) Page {
	n, _ := strconv.Atoi(r.URL.Query().Get("page"))
	s, _ := strconv.Atoi(r.URL.Query().Get("size"))
	p := Page{Number: n, Size: s}
	p.Normalize()
	return p
}
