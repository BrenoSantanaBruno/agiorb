package http

import (
	"net/http"
	"path/filepath"
)

func SPAServer(distPath string) (http.Handler, error) {
	root := http.Dir(distPath)
	fsHandler := http.FileServer(root)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// NÃO interceptar APIs nem uploads
		if len(r.URL.Path) >= 5 && r.URL.Path[:5] == "/api/" {
			http.NotFound(w, r)
			return
		}
		if len(r.URL.Path) >= 8 && r.URL.Path[:8] == "/uploads" {
			http.NotFound(w, r)
			return
		}

		// Se o arquivo existir, serve estático
		if fileExists(root, r.URL.Path) {
			fsHandler.ServeHTTP(w, r)
			return
		}

		// Fallback SPA → index.html
		f, err := root.Open("index.html")
		if err != nil {
			http.Error(w, "index not found", http.StatusInternalServerError)
			return
		}
		defer f.Close()
		info, _ := f.Stat()
		http.ServeContent(w, r, "index.html", info.ModTime(), f)
	}), nil
}

func fileExists(d http.Dir, name string) bool {
	f, err := d.Open(filepath.Clean(name))
	if err != nil {
		return false
	}
	defer f.Close()
	stat, err := f.Stat()
	if err != nil {
		return false
	}
	return !stat.IsDir()
}
