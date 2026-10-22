package game

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"math"
	"strings"
	"sync"
	"time"

	"meanwhile-server-go/internal/db"
	"meanwhile-server-go/internal/models"
	"meanwhile-server-go/internal/passages"
)

type HubInterface interface {
	BroadcastToRoom(roomID string, event string, data any)
	BroadcastAll(event string, data any)
	SendTo(clientID string, event string, data any)
	SendAck(clientID string, ackID string, data any)
	GetOnlineCount() int
}

type MatchmakingEntrant struct {
	SocketID     string `json:"socketId"`
	Username     string `json:"username"`
	Avatar       string `json:"avatar"`
	VehicleID    string `json:"vehicleId"`
	VehicleColor string `json:"vehicleColor"`
	JoinedAt     int64  `json:"joinedAt"`
}

type Engine struct {
	mu               sync.RWMutex
	hub              HubInterface
	db               *db.Database
	rooms            map[string]*models.Room
	socketToRoom     map[string]string
	matchmakingQueue []MatchmakingEntrant
	stopCh           chan struct{}
}

func NewEngine(database *db.Database) *Engine {
	e := &Engine{
		db:               database,
		rooms:            make(map[string]*models.Room),
		socketToRoom:     make(map[string]string),
		matchmakingQueue: make([]MatchmakingEntrant, 0),
		stopCh:           make(chan struct{}),
	}
	return e
}

func (e *Engine) SetHub(hub HubInterface) {
	e.hub = hub
	go e.startAILoop()
	go e.startMatchmakingLoop()
}

func (e *Engine) Stop() {
	close(e.stopCh)
}

// Generate short random hex ID
func randomID(n int) string {
	b := make([]byte, n)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func randomRoomCode() string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	b := make([]byte, 6)
	_, _ = rand.Read(b)
	for i := range b {
		b[i] = chars[int(b[i])%len(chars)]
	}
	return string(b)
}

// --- ROOM CREATION & JOINING ---

type CreateRoomParams struct {
	Username          string `json:"username"`
	Avatar            string `json:"avatar"`
	VehicleID         string `json:"vehicleId"`
	VehicleColor      string `json:"vehicleColor"`
	IsPrivate         *bool  `json:"isPrivate"`
	TrackID           string `json:"trackId"`
	PassageDifficulty string `json:"passageDifficulty"`
}

func (e *Engine) CreateRoom(clientID string, params CreateRoomParams) (*models.Room, error) {
	e.LeaveRoom(clientID)

	e.mu.Lock()
	defer e.mu.Unlock()

	roomID := randomID(4)
	code := randomRoomCode()
	passage := passages.GetRandomPassage(params.PassageDifficulty)

	username := params.Username
	if username == "" {
		username = "Racer"
	}
	avatar := params.Avatar
	if avatar == "" {
		avatar = "🏎️"
	}
	vehicleID := params.VehicleID
	if vehicleID == "" {
		vehicleID = "cyber-gt"
	}
	vehicleColor := params.VehicleColor
	if vehicleColor == "" {
		vehicleColor = "#00ff87"
	}

	isPrivate := true
	if params.IsPrivate != nil {
		isPrivate = *params.IsPrivate
	}
	trackID := params.TrackID
	if trackID == "" {
		trackID = "tokyo"
	}

	hostPlayer := &models.Player{
		ID:                clientID,
		SocketID:          clientID,
		Username:          username,
		Avatar:            avatar,
		VehicleID:         vehicleID,
		VehicleColor:      vehicleColor,
		IsReady:           true,
		IsHost:            true,
		IsAI:              false,
		Progress:          0,
		CurrentTypedIndex: 0,
		WPM:               0,
		RawWPM:            0,
		Accuracy:          100,
		ErrorsCount:       0,
		TotalKeystrokes:   0,
		StartTime:         nil,
		FinishTime:        nil,
		ElapsedMs:         nil,
		Placement:         nil,
		XPEarned:          0,
	}

	room := &models.Room{
		ID:            roomID,
		Code:          code,
		Name:          fmt.Sprintf("%s's Grid", hostPlayer.Username),
		IsPrivate:     isPrivate,
		MaxPlayers:    6,
		TrackID:       trackID,
		State:         models.StateLobby,
		HostID:        clientID,
		Players:       map[string]*models.Player{clientID: hostPlayer},
		Passage:       passage,
		Countdown:     3,
		RaceStartTime: nil,
		WinnerID:      nil,
		FinishedCount: 0,
		CreatedAt:     time.Now().UnixMilli(),
	}

	e.rooms[roomID] = room
	e.socketToRoom[clientID] = roomID

	return room, nil
}

type JoinRoomParams struct {
	RoomIDOrCode string `json:"roomIdOrCode"`
	Username     string `json:"username"`
	Avatar       string `json:"avatar"`
	VehicleID    string `json:"vehicleId"`
	VehicleColor string `json:"vehicleColor"`
}

func (e *Engine) JoinRoom(clientID string, params JoinRoomParams) (*models.Room, error) {
	e.LeaveRoom(clientID)

	e.mu.Lock()
	defer e.mu.Unlock()

	target := strings.ToUpper(strings.TrimSpace(params.RoomIDOrCode))
	var targetRoom *models.Room

	if r, ok := e.rooms[params.RoomIDOrCode]; ok {
		targetRoom = r
	} else {
		for _, r := range e.rooms {
			if strings.ToUpper(r.Code) == target {
				targetRoom = r
				break
			}
		}
	}

	if targetRoom == nil {
		return nil, fmt.Errorf("room not found. Check your room code")
	}

	if targetRoom.State != models.StateLobby {
		return nil, fmt.Errorf("race already in progress or completed")
	}

	if len(targetRoom.Players) >= targetRoom.MaxPlayers {
		return nil, fmt.Errorf("lobby is full (maximum 6 players)")
	}

	username := params.Username
	if username == "" {
		short := clientID
		if len(short) > 4 {
			short = short[:4]
		}
		username = fmt.Sprintf("Racer_%s", short)
	}
	avatar := params.Avatar
	if avatar == "" {
		avatar = "🏎️"
	}
	vehicleID := params.VehicleID
	if vehicleID == "" {
		vehicleID = "cyber-gt"
	}
	vehicleColor := params.VehicleColor
	if vehicleColor == "" {
		vehicleColor = "#38bdf8"
	}

	newPlayer := &models.Player{
		ID:                clientID,
		SocketID:          clientID,
		Username:          username,
		Avatar:            avatar,
		VehicleID:         vehicleID,
		VehicleColor:      vehicleColor,
		IsReady:           false,
		IsHost:            false,
		IsAI:              false,
		Progress:          0,
		CurrentTypedIndex: 0,
		WPM:               0,
		RawWPM:            0,
		Accuracy:          100,
		ErrorsCount:       0,
		TotalKeystrokes:   0,
		StartTime:         nil,
		FinishTime:        nil,
		ElapsedMs:         nil,
		Placement:         nil,
		XPEarned:          0,
	}

	targetRoom.Players[clientID] = newPlayer
	e.socketToRoom[clientID] = targetRoom.ID

	if e.hub != nil {
		e.hub.BroadcastToRoom(targetRoom.ID, "room_updated", targetRoom)
	}

	return targetRoom, nil
}

type SoloParams struct {
	Username     string `json:"username"`
	Avatar       string `json:"avatar"`
	VehicleID    string `json:"vehicleId"`
	VehicleColor string `json:"vehicleColor"`
	TrackID      string `json:"trackId"`
	AICount      *int   `json:"aiCount"`
	AIDifficulty string `json:"aiDifficulty"`
}

func (e *Engine) StartSoloRace(clientID string, params SoloParams) (*models.Room, error) {
	isPriv := true
	room, err := e.CreateRoom(clientID, CreateRoomParams{
		Username:     params.Username,
		Avatar:       params.Avatar,
		VehicleID:    params.VehicleID,
		VehicleColor: params.VehicleColor,
		IsPrivate:    &isPriv,
		TrackID:      params.TrackID,
	})
	if err != nil {
		return nil, err
	}

	count := 3
	if params.AICount != nil {
		count = *params.AICount
	}

	type AITemplate struct {
		Name      string
		Avatar    string
		Vehicle   string
		Color     string
		TargetWPM int
	}

	targetWpm := 65
	switch params.AIDifficulty {
	case "hard":
		targetWpm = 85
	case "easy":
		targetWpm = 45
	}

	aiTemplates := []AITemplate{
		{Name: "Kuro Cyber [AI]", Avatar: "🤖", Vehicle: "ronin-turbo", Color: "#f43f5e", TargetWPM: targetWpm},
		{Name: "Apex Bot [AI]", Avatar: "⚡", Vehicle: "apex-hyper", Color: "#eab308", TargetWPM: targetWpm + 7},
		{Name: "Alpine Stig [AI]", Avatar: "🏔️", Vehicle: "phantom-bike", Color: "#a855f7", TargetWPM: targetWpm + 15},
	}

	e.mu.Lock()
	for i := 0; i < count && i < len(aiTemplates); i++ {
		t := aiTemplates[i]
		aiID := fmt.Sprintf("ai_%s", randomID(3))
		room.Players[aiID] = &models.Player{
			ID:                aiID,
			SocketID:          aiID,
			Username:          t.Name,
			Avatar:            t.Avatar,
			VehicleID:         t.Vehicle,
			VehicleColor:      t.Color,
			IsReady:           true,
			IsHost:            false,
			IsAI:              true,
			TargetWpm:         t.TargetWPM,
			Progress:          0,
			CurrentTypedIndex: 0,
			WPM:               0,
			RawWPM:            0,
			Accuracy:          98,
			ErrorsCount:       1,
			TotalKeystrokes:   0,
			StartTime:         nil,
			FinishTime:        nil,
			ElapsedMs:         nil,
			Placement:         nil,
			XPEarned:          0,
		}
	}
	roomID := room.ID
	e.mu.Unlock()

	go e.StartCountdown(roomID)
	return room, nil
}

func (e *Engine) LeaveRoom(clientID string) {
	e.mu.Lock()
	roomID, exists := e.socketToRoom[clientID]
	if !exists {
		e.mu.Unlock()
		return
	}

	delete(e.socketToRoom, clientID)
	room, ok := e.rooms[roomID]
	if !ok {
		e.mu.Unlock()
		return
	}

	delete(room.Players, clientID)

	// Check if any real players remain
	var remainingReal []*models.Player
	for _, p := range room.Players {
		if !p.IsAI {
			remainingReal = append(remainingReal, p)
		}
	}

	if len(remainingReal) == 0 {
		delete(e.rooms, roomID)
		e.mu.Unlock()
		return
	}

	// Transfer host if host left
	if room.HostID == clientID && len(remainingReal) > 0 {
		newHost := remainingReal[0]
		room.HostID = newHost.ID
		newHost.IsHost = true
	}

	e.mu.Unlock()

	if e.hub != nil {
		e.hub.BroadcastToRoom(roomID, "room_updated", room)
	}
}

func (e *Engine) SetReady(clientID string, isReady bool) {
	e.mu.Lock()
	defer e.mu.Unlock()

	roomID, exists := e.socketToRoom[clientID]
	if !exists {
		return
	}
	room, ok := e.rooms[roomID]
	if !ok || room.State != models.StateLobby {
		return
	}

	if p, ok := room.Players[clientID]; ok {
		p.IsReady = isReady
		if e.hub != nil {
			e.hub.BroadcastToRoom(room.ID, "room_updated", room)
		}
	}
}

func (e *Engine) UpdateVehicle(clientID string, vehicleID, color string) {
	e.mu.Lock()
	defer e.mu.Unlock()

	roomID, exists := e.socketToRoom[clientID]
	if !exists {
		return
	}
	room, ok := e.rooms[roomID]
	if !ok || room.State != models.StateLobby {
		return
	}

	if p, ok := room.Players[clientID]; ok {
		p.VehicleID = vehicleID
		p.VehicleColor = color
		if e.hub != nil {
			e.hub.BroadcastToRoom(room.ID, "room_updated", room)
		}
	}
}

func (e *Engine) UpdateTrack(clientID string, trackID string) {
	e.mu.Lock()
	defer e.mu.Unlock()

	roomID, exists := e.socketToRoom[clientID]
	if !exists {
		return
	}
	room, ok := e.rooms[roomID]
	if !ok || room.State != models.StateLobby || room.HostID != clientID {
		return
	}

	room.TrackID = trackID
	if e.hub != nil {
		e.hub.BroadcastToRoom(room.ID, "room_updated", room)
	}
}

func (e *Engine) StartCountdown(roomID string) {
	e.mu.Lock()
	room, ok := e.rooms[roomID]
	if !ok || room.State != models.StateLobby {
		e.mu.Unlock()
		return
	}

	room.State = models.StateStarting
	room.Countdown = 3
	e.mu.Unlock()

	if e.hub != nil {
		e.hub.BroadcastToRoom(roomID, "countdown_tick", map[string]int{"countdown": 3})
	}

	go func() {
		for i := 2; i >= 0; i-- {
			time.Sleep(1 * time.Second)
			e.mu.Lock()
			r, exists := e.rooms[roomID]
			if !exists || r.State != models.StateStarting {
				e.mu.Unlock()
				return
			}
			r.Countdown = i
			e.mu.Unlock()

			if e.hub != nil {
				e.hub.BroadcastToRoom(roomID, "countdown_tick", map[string]int{"countdown": i})
			}
		}

		e.startRace(roomID)
	}()
}

func (e *Engine) startRace(roomID string) {
	e.mu.Lock()
	room, ok := e.rooms[roomID]
	if !ok {
		e.mu.Unlock()
		return
	}

	now := time.Now().UnixMilli()
	room.State = models.StateRacing
	room.RaceStartTime = &now
	room.FinishedCount = 0
	room.WinnerID = nil

	for _, p := range room.Players {
		p.StartTime = &now
		p.Progress = 0
		p.CurrentTypedIndex = 0
		p.WPM = 0
		p.RawWPM = 0
		p.Accuracy = 100
		p.ErrorsCount = 0
		p.TotalKeystrokes = 0
		p.FinishTime = nil
		p.ElapsedMs = nil
		p.Placement = nil
	}
	e.mu.Unlock()

	if e.hub != nil {
		e.hub.BroadcastToRoom(roomID, "race_started", map[string]any{
			"raceStartTime": now,
			"passage":       room.Passage,
			"room":          room,
		})
	}
}

// --- KEYSTROKE HANDLING & PROGRESS ---

func (e *Engine) HandleKeystroke(clientID string, payload models.KeystrokePayload) {
	e.mu.Lock()
	defer e.mu.Unlock()

	roomID, exists := e.socketToRoom[clientID]
	if !exists {
		return
	}
	room, ok := e.rooms[roomID]
	if !ok || room.State != models.StateRacing || room.RaceStartTime == nil {
		return
	}

	player, ok := room.Players[clientID]
	if !ok || player.FinishTime != nil {
		return
	}

	now := time.Now().UnixMilli()
	elapsedMinutes := float64(now-*room.RaceStartTime) / 60000.0
	if elapsedMinutes <= 0 {
		return
	}

	player.TotalKeystrokes++

	if payload.IsError {
		player.ErrorsCount++
		player.Accuracy = int(math.Max(0, math.Round(float64(player.TotalKeystrokes-player.ErrorsCount)/float64(player.TotalKeystrokes)*100.0)))
		return
	}

	// Authoritative verification against passage text
	text := room.Passage.Text
	if payload.Index < 0 || payload.Index >= len(text) {
		player.ErrorsCount++
		player.Accuracy = int(math.Max(0, math.Round(float64(player.TotalKeystrokes-player.ErrorsCount)/float64(player.TotalKeystrokes)*100.0)))
		return
	}

	expectedChar := string(text[payload.Index])
	if payload.Char != expectedChar {
		player.ErrorsCount++
		player.Accuracy = int(math.Max(0, math.Round(float64(player.TotalKeystrokes-player.ErrorsCount)/float64(player.TotalKeystrokes)*100.0)))
		return
	}

	player.CurrentTypedIndex = payload.Index + 1
	player.Progress = float64(player.CurrentTypedIndex) / float64(len(text))

	wordsTyped := float64(player.CurrentTypedIndex) / 5.0
	player.WPM = int(math.Round(wordsTyped / elapsedMinutes))
	player.RawWPM = int(math.Round((float64(player.TotalKeystrokes) / 5.0) / elapsedMinutes))
	player.Accuracy = int(math.Max(0, math.Round(float64(player.TotalKeystrokes-player.ErrorsCount)/float64(player.TotalKeystrokes)*100.0)))

	if player.CurrentTypedIndex >= len(text) {
		e.finishPlayerLocked(room, player, now)
	}

	e.broadcastRaceProgressLocked(room)
}

func (e *Engine) finishPlayerLocked(room *models.Room, player *models.Player, finishTime int64) {
	player.FinishTime = &finishTime
	elapsed := finishTime - *room.RaceStartTime
	player.ElapsedMs = &elapsed
	room.FinishedCount++
	placement := room.FinishedCount
	player.Placement = &placement

	if room.FinishedCount == 1 {
		winner := player.ID
		room.WinnerID = &winner
	}

	if !player.IsAI && e.db != nil {
		res := e.db.RecordRaceResult(player.SocketID, db.RecordRaceParams{
			TrackID:     room.TrackID,
			VehicleID:   player.VehicleID,
			Placement:   placement,
			TotalRacers: len(room.Players),
			WPM:         player.WPM,
			Accuracy:    player.Accuracy,
			TimeMs:      elapsed,
		})
		player.XPEarned = res.XPEarned
	} else {
		player.XPEarned = 100
	}

	if e.hub != nil {
		e.hub.BroadcastToRoom(room.ID, "player_finished", map[string]any{
			"playerId":  player.ID,
			"placement": player.Placement,
			"wpm":       player.WPM,
			"accuracy":  player.Accuracy,
			"elapsedMs": player.ElapsedMs,
			"xpEarned":  player.XPEarned,
		})
	}

	// Check if all real players finished
	allRealFinished := true
	for _, p := range room.Players {
		if !p.IsAI && p.FinishTime == nil {
			allRealFinished = false
			break
		}
	}

	if allRealFinished {
		room.State = models.StateFinished
		var podium []*models.Player
		for _, p := range room.Players {
			podium = append(podium, p)
		}
		if e.hub != nil {
			e.hub.BroadcastToRoom(room.ID, "race_finished", map[string]any{
				"room":   room,
				"podium": podium,
			})
		}
	}
}

func (e *Engine) broadcastRaceProgressLocked(room *models.Room) {
	var progressData []map[string]any
	for _, p := range room.Players {
		progressData = append(progressData, map[string]any{
			"id":                p.ID,
			"progress":          p.Progress,
			"wpm":               p.WPM,
			"accuracy":          p.Accuracy,
			"placement":         p.Placement,
			"currentTypedIndex": p.CurrentTypedIndex,
		})
	}

	if e.hub != nil {
		e.hub.BroadcastToRoom(room.ID, "race_progress", progressData)
	}
}

// --- AI RACER SIMULATION LOOP ---

func (e *Engine) startAILoop() {
	ticker := time.NewTicker(150 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-e.stopCh:
			return
		case <-ticker.C:
			e.mu.Lock()
			now := time.Now().UnixMilli()

			for _, room := range e.rooms {
				if room.State != models.StateRacing || room.RaceStartTime == nil {
					continue
				}

				anyAIUpdated := false
				for _, player := range room.Players {
					if !player.IsAI || player.FinishTime != nil {
						continue
					}

					elapsedMinutes := float64(now-*room.RaceStartTime) / 60000.0
					if elapsedMinutes <= 0 {
						continue
					}

					targetWpm := float64(player.TargetWpm)
					if targetWpm <= 0 {
						targetWpm = 65
					}

					jitter := math.Sin(float64(now)/1500.0) * 4.0
					currentExpectedWpm := math.Max(30.0, targetWpm+jitter)
					expectedChars := int(math.Floor(currentExpectedWpm * 5.0 * elapsedMinutes))

					if expectedChars > player.CurrentTypedIndex {
						player.CurrentTypedIndex = expectedChars
						textLen := len(room.Passage.Text)
						if player.CurrentTypedIndex > textLen {
							player.CurrentTypedIndex = textLen
						}
						player.Progress = float64(player.CurrentTypedIndex) / float64(textLen)
						player.WPM = int(math.Round((float64(player.CurrentTypedIndex) / 5.0) / elapsedMinutes))
						player.TotalKeystrokes = player.CurrentTypedIndex + player.ErrorsCount
						anyAIUpdated = true

						if player.CurrentTypedIndex >= textLen {
							e.finishPlayerLocked(room, player, now)
						}
					}
				}

				if anyAIUpdated {
					e.broadcastRaceProgressLocked(room)
				}
			}
			e.mu.Unlock()
		}
	}
}

// --- MATCHMAKING SYSTEM ---

func (e *Engine) AddToMatchmaking(clientID string, params MatchmakingEntrant) {
	e.RemoveFromMatchmaking(clientID)
	e.LeaveRoom(clientID)

	e.mu.Lock()
	params.SocketID = clientID
	params.JoinedAt = time.Now().UnixMilli()
	e.matchmakingQueue = append(e.matchmakingQueue, params)
	qLen := len(e.matchmakingQueue)
	e.mu.Unlock()

	if e.hub != nil {
		e.hub.SendTo(clientID, "matchmaking_status", map[string]any{
			"status":      "searching",
			"queueLength": qLen,
		})
	}
}

func (e *Engine) RemoveFromMatchmaking(clientID string) {
	e.mu.Lock()
	defer e.mu.Unlock()

	idx := -1
	for i, q := range e.matchmakingQueue {
		if q.SocketID == clientID {
			idx = i
			break
		}
	}
	if idx != -1 {
		e.matchmakingQueue = append(e.matchmakingQueue[:idx], e.matchmakingQueue[idx+1:]...)
	}
}

func (e *Engine) startMatchmakingLoop() {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-e.stopCh:
			return
		case <-ticker.C:
			e.processMatchmaking()
		}
	}
}

func (e *Engine) processMatchmaking() {
	e.mu.Lock()
	if len(e.matchmakingQueue) >= 2 {
		count := len(e.matchmakingQueue)
		if count > 4 {
			count = 4
		}
		matched := e.matchmakingQueue[:count]
		e.matchmakingQueue = e.matchmakingQueue[count:]
		e.mu.Unlock()

		host := matched[0]
		room, err := e.CreateRoom(host.SocketID, CreateRoomParams{
			Username:     host.Username,
			Avatar:       host.Avatar,
			VehicleID:    host.VehicleID,
			VehicleColor: host.VehicleColor,
			TrackID:      "tokyo",
		})
		if err != nil {
			return
		}

		for i := 1; i < len(matched); i++ {
			entrant := matched[i]
			_, _ = e.JoinRoom(entrant.SocketID, JoinRoomParams{
				RoomIDOrCode: room.ID,
				Username:     entrant.Username,
				Avatar:       entrant.Avatar,
				VehicleID:    entrant.VehicleID,
				VehicleColor: entrant.VehicleColor,
			})
		}

		if e.hub != nil {
			e.hub.BroadcastToRoom(room.ID, "match_found", map[string]any{"room": room})
		}

		go func(rID string) {
			time.Sleep(4 * time.Second)
			e.StartCountdown(rID)
		}(room.ID)
		return
	}

	// Timeout bot backfill for single players waiting > 6s
	now := time.Now().UnixMilli()
	var timedOutEntrant *MatchmakingEntrant
	for i, entrant := range e.matchmakingQueue {
		if now-entrant.JoinedAt > 6000 {
			timedOutEntrant = &entrant
			e.matchmakingQueue = append(e.matchmakingQueue[:i], e.matchmakingQueue[i+1:]...)
			break
		}
	}
	e.mu.Unlock()

	if timedOutEntrant != nil {
		room, err := e.StartSoloRace(timedOutEntrant.SocketID, SoloParams{
			Username:     timedOutEntrant.Username,
			Avatar:       timedOutEntrant.Avatar,
			VehicleID:    timedOutEntrant.VehicleID,
			VehicleColor: timedOutEntrant.VehicleColor,
			TrackID:      "tokyo",
		})
		if err == nil && e.hub != nil {
			e.hub.SendTo(timedOutEntrant.SocketID, "match_found", map[string]any{
				"room":           room,
				"filledWithBots": true,
			})
		}
	}
}

// --- REMATCH ---

func (e *Engine) Rematch(clientID string) {
	e.mu.Lock()
	roomID, exists := e.socketToRoom[clientID]
	if !exists {
		e.mu.Unlock()
		return
	}

	room, ok := e.rooms[roomID]
	if !ok || room.HostID != clientID {
		e.mu.Unlock()
		return
	}

	room.State = models.StateLobby
	room.Countdown = 3
	room.Passage = passages.GetRandomPassage("medium")
	room.WinnerID = nil
	room.FinishedCount = 0

	for _, p := range room.Players {
		p.Progress = 0
		p.CurrentTypedIndex = 0
		p.WPM = 0
		p.RawWPM = 0
		p.Accuracy = 100
		p.ErrorsCount = 0
		p.TotalKeystrokes = 0
		p.StartTime = nil
		p.FinishTime = nil
		p.ElapsedMs = nil
		p.Placement = nil
		p.XPEarned = 0
	}
	rID := room.ID
	e.mu.Unlock()

	if e.hub != nil {
		e.hub.BroadcastToRoom(rID, "rematch_initiated", room)
	}

	go e.StartCountdown(rID)
}

func (e *Engine) GetRoomForClient(clientID string) *models.Room {
	e.mu.RLock()
	defer e.mu.RUnlock()
	roomID, ok := e.socketToRoom[clientID]
	if !ok {
		return nil
	}
	return e.rooms[roomID]
}

func (e *Engine) GetRoom(roomID string) *models.Room {
	e.mu.RLock()
	defer e.mu.RUnlock()
	return e.rooms[roomID]
}

