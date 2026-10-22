package models

type PassageSourceType string

const (
	SourceBook    PassageSourceType = "book"
	SourceSong    PassageSourceType = "song"
	SourceArticle PassageSourceType = "article"
	SourceSpeech  PassageSourceType = "speech"
	SourceEssay   PassageSourceType = "essay"
)

type Passage struct {
	ID         string            `json:"id"`
	Title      string            `json:"title"`
	SourceType PassageSourceType `json:"sourceType"`
	Category   string            `json:"category"`
	Difficulty string            `json:"difficulty"` // easy, medium, hard
	Text       string            `json:"text"`
	Author     string            `json:"author"`
	Year       any               `json:"year,omitempty"`
	Context    string            `json:"context,omitempty"`
	SourceURL  string            `json:"sourceUrl,omitempty"`
}

type RoomState string

const (
	StateLobby    RoomState = "LOBBY"
	StateStarting RoomState = "STARTING"
	StateRacing   RoomState = "RACING"
	StateFinished RoomState = "FINISHED"
)

type Player struct {
	ID                string   `json:"id"`
	SocketID          string   `json:"socketId"`
	Username          string   `json:"username"`
	Avatar            string   `json:"avatar"`
	VehicleID         string   `json:"vehicleId"`
	VehicleColor      string   `json:"vehicleColor"`
	IsReady           bool     `json:"isReady"`
	IsHost            bool     `json:"isHost"`
	IsAI              bool     `json:"isAi"`
	TargetWpm         int      `json:"targetWpm,omitempty"`
	Progress          float64  `json:"progress"` // 0.0 to 1.0
	CurrentTypedIndex int      `json:"currentTypedIndex"`
	WPM               int      `json:"wpm"`
	RawWPM            int      `json:"rawWpm"`
	Accuracy          int      `json:"accuracy"`
	ErrorsCount       int      `json:"errorsCount"`
	TotalKeystrokes   int      `json:"totalKeystrokes"`
	StartTime         *int64   `json:"startTime"`
	FinishTime        *int64   `json:"finishTime"`
	ElapsedMs         *int64   `json:"elapsedMs"`
	Placement         *int     `json:"placement"`
	XPEarned          int      `json:"xpEarned"`
	LastKeystrokeTime *int64   `json:"lastKeystrokeTime,omitempty"`
}

type Room struct {
	ID            string             `json:"id"`
	Code          string             `json:"code"`
	Name          string             `json:"name"`
	IsPrivate     bool               `json:"isPrivate"`
	MaxPlayers    int                `json:"maxPlayers"`
	TrackID       string             `json:"trackId"`
	State         RoomState          `json:"state"`
	HostID        string             `json:"hostId"`
	Players       map[string]*Player `json:"players"`
	Passage       Passage            `json:"passage"`
	Countdown     int                `json:"countdown"`
	RaceStartTime *int64             `json:"raceStartTime"`
	WinnerID      *string            `json:"winnerId"`
	FinishedCount int                `json:"finishedCount"`
	CreatedAt     int64              `json:"createdAt"`
}

type UserProfile struct {
	ID              string              `json:"id"`
	Username        string              `json:"username"`
	Avatar          string              `json:"avatar"`
	Level           int                 `json:"level"`
	XP              int                 `json:"xp"`
	NextLevelXP     int                 `json:"nextLevelXp"`
	RankTier        string              `json:"rankTier"`
	TotalRaces      int                 `json:"totalRaces"`
	Wins            int                 `json:"wins"`
	Podiums         int                 `json:"podiums"`
	BestWPM         int                 `json:"bestWpm"`
	AverageWPM      int                 `json:"averageWpm"`
	AverageAccuracy int                 `json:"averageAccuracy"`
	FavoriteVehicle string              `json:"favoriteVehicle"`
	FavoriteTrack   string              `json:"favoriteTrack"`
	RecentRaces     []RaceResultHistory `json:"recentRaces"`
}

type RaceResultHistory struct {
	ID          string `json:"id"`
	Date        string `json:"date"`
	TrackID     string `json:"trackId"`
	VehicleID   string `json:"vehicleId"`
	Placement   int    `json:"placement"`
	TotalRacers int    `json:"totalRacers"`
	WPM         int    `json:"wpm"`
	Accuracy    int    `json:"accuracy"`
	TimeMs      int64  `json:"timeMs"`
	XPGained    int    `json:"xpGained"`
}

type LeaderboardEntry struct {
	Rank       int    `json:"rank"`
	ID         string `json:"id"`
	Username   string `json:"username"`
	Avatar     string `json:"avatar"`
	BestWPM    int    `json:"bestWpm"`
	AverageWPM int    `json:"averageWpm"`
	Wins       int    `json:"wins"`
	Races      int    `json:"races"`
	Level      int    `json:"level"`
	RankTier   string `json:"rankTier"`
}

type KeystrokePayload struct {
	Index           int    `json:"index"`
	Char            string `json:"char"`
	IsError         bool   `json:"isError"`
	ClientTimestamp int64  `json:"clientTimestamp"`
}

type WSMessage struct {
	Event string `json:"event"`
	Data  any    `json:"data,omitempty"`
	AckID string `json:"ackId,omitempty"`
}
