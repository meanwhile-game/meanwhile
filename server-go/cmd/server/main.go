package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	"meanwhile-server-go/internal/db"
	"meanwhile-server-go/internal/game"
	"meanwhile-server-go/internal/ws"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for dev/game client
	},
}

func randomSocketID() string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}

	dataDir := filepath.Join(".", "data")
	database := db.NewDatabase(dataDir)
	engine := game.NewEngine(database)
	hub := ws.NewHub(engine)
	engine.SetHub(hub)

	go hub.Run()

	mux := http.NewServeMux()

	// REST API Endpoints
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"status":    "online",
			"title":     "Meanwhile Authoritative Game Server (Go)",
			"online":    hub.GetOnlineCount(),
			"timestamp": time.Now().UnixMilli(),
		})
	})

	mux.HandleFunc("GET /api/leaderboard", func(w http.ResponseWriter, r *http.Request) {
		limit := 20
		if lStr := r.URL.Query().Get("limit"); lStr != "" {
			if l, err := strconv.Atoi(lStr); err == nil && l > 0 {
				limit = l
			}
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(database.GetLeaderboard(limit))
	})

	mux.HandleFunc("GET /api/profile/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		username := r.URL.Query().Get("username")
		avatar := r.URL.Query().Get("avatar")

		profile := database.GetProfile(id, username, avatar)
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(profile)
	})

	mux.HandleFunc("POST /api/profile/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		var updates map[string]any
		if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
			http.Error(w, "Invalid JSON body", http.StatusBadRequest)
			return
		}

		updated := database.UpdateProfileSettings(id, updates)
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(updated)
	})

	// WebSocket handler (supports both /ws and /ws/ and fallback)
	wsHandler := func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("[WS] Upgrade error: %v", err)
			return
		}

		clientID := randomSocketID()
		client := &ws.Client{
			ID:   clientID,
			Hub:  hub,
			Conn: conn,
			Send: make(chan []byte, 256),
		}

		log.Printf("[Meanwhile Go] Racer connected: %s", clientID)
		hub.Register <- client

		go client.WritePump()
		go client.ReadPump()
	}

	mux.HandleFunc("/ws", wsHandler)
	// Catch-all for websocket fallback
	mux.HandleFunc("/socket.io/", func(w http.ResponseWriter, r *http.Request) {
		if strings.ToLower(r.Header.Get("Upgrade")) == "websocket" {
			wsHandler(w, r)
			return
		}
		// In case of polling fallback
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	handler := enableCORS(mux)

	addr := fmt.Sprintf("0.0.0.0:%s", port)
	log.Printf("==================================================")
	log.Printf("🏎️  MEANWHILE GO GAME SERVER")
	log.Printf("⚡  High-Performance Low-Latency Native WebSockets")
	log.Printf("🌐  Listening on http://localhost:%s", port)
	log.Printf("==================================================")

	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
