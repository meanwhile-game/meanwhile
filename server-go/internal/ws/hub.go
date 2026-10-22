package ws

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"meanwhile-server-go/internal/game"
	"meanwhile-server-go/internal/models"
)

type Hub struct {
	mu         sync.RWMutex
	clients    map[string]*Client
	Register   chan *Client
	Unregister chan *Client
	engine     *game.Engine
}

func NewHub(engine *game.Engine) *Hub {
	return &Hub{
		clients:    make(map[string]*Client),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		engine:     engine,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			h.clients[client.ID] = client
			count := len(h.clients)
			h.mu.Unlock()

			// Send connected event with assigned client/socket ID and server time
			client.SendJSON("connected", map[string]any{
				"socketId":   client.ID,
				"serverTime": time.Now().UnixMilli(),
			}, "")

			// Broadcast online count
			h.BroadcastAll("online_count", count)

		case client := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.ID]; ok {
				delete(h.clients, client.ID)
				close(client.Send)
			}
			count := len(h.clients)
			h.mu.Unlock()

			// Clean up client from matchmaking and active race rooms
			h.engine.RemoveFromMatchmaking(client.ID)
			h.engine.LeaveRoom(client.ID)
			h.BroadcastAll("online_count", count)
		}
	}
}

func (h *Hub) BroadcastAll(event string, data any) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, client := range h.clients {
		client.SendJSON(event, data, "")
	}
}

func (h *Hub) BroadcastToRoom(roomID string, event string, data any) {
	room := h.engine.GetRoom(roomID)
	if room == nil {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, p := range room.Players {
		if p.IsAI {
			continue
		}
		if client, ok := h.clients[p.SocketID]; ok {
			client.SendJSON(event, data, "")
		}
	}
}

func (h *Hub) SendTo(clientID string, event string, data any) {
	h.mu.RLock()
	client, ok := h.clients[clientID]
	h.mu.RUnlock()

	if ok {
		client.SendJSON(event, data, "")
	}
}

func (h *Hub) SendAck(clientID string, ackID string, data any) {
	if ackID == "" {
		return
	}
	h.mu.RLock()
	client, ok := h.clients[clientID]
	h.mu.RUnlock()

	if ok {
		client.SendJSON("ack", data, ackID)
	}
}

func (h *Hub) GetOnlineCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

func (h *Hub) OnMessage(client *Client, msg models.WSMessage) {
	switch msg.Event {
	case "create_room":
		var params game.CreateRoomParams
		if raw, ok := msg.Data.(map[string]any); ok {
			b, _ := json.Marshal(raw)
			_ = json.Unmarshal(b, &params)
		}
		room, err := h.engine.CreateRoom(client.ID, params)
		if err != nil {
			h.SendAck(client.ID, msg.AckID, map[string]any{"success": false, "error": err.Error()})
		} else {
			h.SendAck(client.ID, msg.AckID, map[string]any{"success": true, "room": room})
		}

	case "join_room":
		var params game.JoinRoomParams
		if raw, ok := msg.Data.(map[string]any); ok {
			b, _ := json.Marshal(raw)
			_ = json.Unmarshal(b, &params)
		}
		room, err := h.engine.JoinRoom(client.ID, params)
		if err != nil {
			h.SendAck(client.ID, msg.AckID, map[string]any{"success": false, "error": err.Error()})
		} else {
			h.SendAck(client.ID, msg.AckID, map[string]any{"success": true, "room": room})
		}

	case "start_solo":
		var params game.SoloParams
		if raw, ok := msg.Data.(map[string]any); ok {
			b, _ := json.Marshal(raw)
			_ = json.Unmarshal(b, &params)
		}
		room, err := h.engine.StartSoloRace(client.ID, params)
		if err != nil {
			h.SendAck(client.ID, msg.AckID, map[string]any{"success": false, "error": err.Error()})
		} else {
			h.SendAck(client.ID, msg.AckID, map[string]any{"success": true, "room": room})
		}

	case "join_matchmaking":
		var params game.MatchmakingEntrant
		if raw, ok := msg.Data.(map[string]any); ok {
			b, _ := json.Marshal(raw)
			_ = json.Unmarshal(b, &params)
		}
		h.engine.AddToMatchmaking(client.ID, params)

	case "leave_matchmaking":
		h.engine.RemoveFromMatchmaking(client.ID)

	case "set_ready":
		isReady := false
		if raw, ok := msg.Data.(map[string]any); ok {
			if r, ok := raw["isReady"].(bool); ok {
				isReady = r
			}
		}
		h.engine.SetReady(client.ID, isReady)

	case "update_vehicle":
		if raw, ok := msg.Data.(map[string]any); ok {
			vehID, _ := raw["vehicleId"].(string)
			col, _ := raw["vehicleColor"].(string)
			h.engine.UpdateVehicle(client.ID, vehID, col)
		}

	case "update_track":
		if raw, ok := msg.Data.(map[string]any); ok {
			trackID, _ := raw["trackId"].(string)
			h.engine.UpdateTrack(client.ID, trackID)
		}

	case "start_race":
		if raw, ok := msg.Data.(map[string]any); ok {
			if rID, ok := raw["roomId"].(string); ok && rID != "" {
				h.engine.StartCountdown(rID)
			}
		}

	case "keystroke":
		var payload models.KeystrokePayload
		if raw, ok := msg.Data.(map[string]any); ok {
			b, _ := json.Marshal(raw)
			_ = json.Unmarshal(b, &payload)
		}
		h.engine.HandleKeystroke(client.ID, payload)

	case "rematch":
		h.engine.Rematch(client.ID)

	case "leave_room":
		h.engine.LeaveRoom(client.ID)

	default:
		log.Printf("[WS] Unrecognized event '%s' from %s", msg.Event, client.ID)
	}
}
