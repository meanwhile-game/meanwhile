-- Meanwhile 3D Multiplayer Typing Racing
-- PostgreSQL Database Schema & Initial Seed Data

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(128) UNIQUE,
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CIRCUITS TABLE
CREATE TABLE IF NOT EXISTS circuits (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    location VARCHAR(128) NOT NULL,
    circuit_type VARCHAR(64) NOT NULL, -- 'city_night', 'f1_permanent', 'mountain_pass', 'desert'
    configuration JSONB NOT NULL DEFAULT '{}'
);

-- 3. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    vehicle_type VARCHAR(64) NOT NULL, -- 'supercar', 'hypercar', 'superbike', 'tuner'
    metadata JSONB NOT NULL DEFAULT '{}'
);

-- 4. PLAYER STATS TABLE
CREATE TABLE IF NOT EXISTS player_stats (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_races INT DEFAULT 0,
    wins INT DEFAULT 0,
    best_wpm INT DEFAULT 0,
    average_wpm INT DEFAULT 0,
    average_accuracy INT DEFAULT 100,
    total_xp INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. RACE RESULTS TABLE
CREATE TABLE IF NOT EXISTS race_results (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    circuit_id VARCHAR(64) REFERENCES circuits(id) ON DELETE SET NULL,
    vehicle_id VARCHAR(64) REFERENCES vehicles(id) ON DELETE SET NULL,
    finish_position INT NOT NULL,
    race_time_ms BIGINT NOT NULL,
    wpm INT NOT NULL,
    accuracy INT NOT NULL,
    errors INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR HIGH-PERFORMANCE LEADERBOARDS & LOOKUPS
CREATE INDEX IF NOT EXISTS idx_race_results_user ON race_results(user_id);
CREATE INDEX IF NOT EXISTS idx_race_results_circuit ON race_results(circuit_id);
CREATE INDEX IF NOT EXISTS idx_race_results_created ON race_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_player_stats_wpm ON player_stats(best_wpm DESC);
CREATE INDEX IF NOT EXISTS idx_player_stats_wins ON player_stats(wins DESC);
CREATE INDEX IF NOT EXISTS idx_player_stats_xp ON player_stats(total_xp DESC);

-- ============================================================================
-- SEED DATA: CIRCUITS (Indian Motorsport + International GPs)
-- ============================================================================
INSERT INTO circuits (id, name, location, circuit_type, configuration) VALUES
('chennai', 'Chennai Marina Coast GP', 'Chennai, Tamil Nadu, India', 'city_coastal', '{
    "lengthMeters": 1350,
    "lanes": 4,
    "landmarks": ["Marina Beach", "Napier Bridge", "Lighthouse", "Bay of Bengal"],
    "lighting": "night_coastal",
    "difficulty": "medium"
}'),
('hyderabad', 'Hyderabad Cyber Corridor GP', 'HITEC City, Telangana, India', 'city_modern', '{
    "lengthMeters": 1280,
    "lanes": 4,
    "landmarks": ["Durgam Cheruvu Cable Bridge", "Cyber Towers", "Charminar Arches"],
    "lighting": "night_cyber",
    "difficulty": "fast"
}'),
('buddh', 'Buddh International Circuit', 'Greater Noida, Uttar Pradesh, India', 'f1_permanent', '{
    "lengthMeters": 1510,
    "lanes": 4,
    "landmarks": ["1.06km Parabolic Straight", "Turn 10-11 Bowl", "F1 Pit Garages", "Tensile Grandstands"],
    "lighting": "dusk_stadium",
    "difficulty": "technical"
}'),
('tokyo', 'Tokyo Night Run', 'Shuto Expressway, Tokyo, Japan', 'city_night', '{
    "lengthMeters": 1200,
    "lanes": 4,
    "landmarks": ["Shuto Viaducts", "Rain Reflections", "Neon Skyscraper Corridor"],
    "lighting": "neon_wet",
    "difficulty": "medium"
}'),
('monaco', 'Circuit de Monaco', 'Monte Carlo, Monaco', 'f1_street', '{
    "lengthMeters": 1100,
    "lanes": 4,
    "landmarks": ["Port Hercules Harbor", "Luxury Yachts", "Casino Square"],
    "lighting": "riviera_day",
    "difficulty": "hard"
}'),
('silverstone', 'Silverstone Arena GP', 'Northamptonshire, United Kingdom', 'f1_permanent', '{
    "lengthMeters": 1450,
    "lanes": 4,
    "landmarks": ["Copse Corner", "Maggotts & Becketts", "Silverstone Wing"],
    "lighting": "cloudy_day",
    "difficulty": "fast"
}'),
('swiss-alps', 'Swiss Alpine Pass', 'Furka Pass, Swiss Alps', 'mountain_pass', '{
    "lengthMeters": 1400,
    "lanes": 4,
    "landmarks": ["Granite Peaks", "Pine Forest", "Hairpin Switchbacks"],
    "lighting": "crisp_morning",
    "difficulty": "hard"
}'),
('dubai', 'Dubai Grand Circuit', 'Desert Perimeter, Dubai, UAE', 'desert_gp', '{
    "lengthMeters": 1100,
    "lanes": 4,
    "landmarks": ["Illuminated Floodlight Masts", "Turquoise Runoffs", "Desert Dunes"],
    "lighting": "golden_hour",
    "difficulty": "easy"
}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    circuit_type = EXCLUDED.circuit_type,
    configuration = EXCLUDED.configuration;

-- ============================================================================
-- SEED DATA: VEHICLES
-- ============================================================================
INSERT INTO vehicles (id, name, vehicle_type, metadata) VALUES
('cyber-gt', 'Cyber GT-R', 'supercar', '{
    "topSpeedKmh": 340,
    "accelerationRating": 9.2,
    "defaultColor": "#00ff87",
    "description": "Twin-turbocharged mid-engine aerodynamic monocoque chassis engineered for instantaneous straight-line speed."
}'),
('apex-hyperion', 'Apex Hyperion', 'hypercar', '{
    "topSpeedKmh": 385,
    "accelerationRating": 9.8,
    "defaultColor": "#ff0055",
    "description": "Active aerodynamics carbon-fiber hypercar featuring quad-motor electric torque-vectoring."
}'),
('phantom-blade', 'Phantom Blade 1200', 'superbike', '{
    "topSpeedKmh": 320,
    "accelerationRating": 9.6,
    "defaultColor": "#00e5ff",
    "description": "Featherweight racing superbike delivering extreme acceleration and realistic 42-degree cornering lean."
}'),
('ronin-specv', 'Ronin Spec-V', 'tuner', '{
    "topSpeedKmh": 310,
    "accelerationRating": 8.7,
    "defaultColor": "#ffaa00",
    "description": "Precision Japanese track tuner with razor-sharp mechanical steering and wide high-traction slicks."
}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    vehicle_type = EXCLUDED.vehicle_type,
    metadata = EXCLUDED.metadata;

-- ============================================================================
-- SEED DATA: DEFAULT LEADERBOARD PILOTS & STATS
-- ============================================================================
-- Passwords are hashed with bcrypt for security (default demo password: 'MeanwhileRacer2026!')
INSERT INTO users (id, username, email, password_hash) VALUES
('u_apex', 'ApexPredator', 'apex@meanwhile.racing', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5y/V2jE8bF2tV7Y1AcmrD6qF5U8ZcWy'),
('u_valkyrie', 'Valkyrie_99', 'valkyrie@meanwhile.racing', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5y/V2jE8bF2tV7Y1AcmrD6qF5U8ZcWy'),
('u_nitro', 'NitroShift', 'nitro@meanwhile.racing', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5y/V2jE8bF2tV7Y1AcmrD6qF5U8ZcWy'),
('u_cipher', 'CipherDrift', 'cipher@meanwhile.racing', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5y/V2jE8bF2tV7Y1AcmrD6qF5U8ZcWy'),
('u_ghost', 'GhostRacer', 'ghost@meanwhile.racing', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5y/V2jE8bF2tV7Y1AcmrD6qF5U8ZcWy'),
('u_zenith', 'ZenithTurbo', 'zenith@meanwhile.racing', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5y/V2jE8bF2tV7Y1AcmrD6qF5U8ZcWy')
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_stats (user_id, total_races, wins, best_wpm, average_wpm, average_accuracy, total_xp) VALUES
('u_apex', 340, 289, 154, 142, 99, 18500),
('u_valkyrie', 310, 245, 148, 136, 98, 16200),
('u_nitro', 280, 210, 142, 131, 97, 14100),
('u_cipher', 250, 185, 135, 125, 96, 12300),
('u_ghost', 215, 150, 128, 119, 95, 10400),
('u_zenith', 190, 130, 122, 114, 94, 8900)
ON CONFLICT (user_id) DO NOTHING;
