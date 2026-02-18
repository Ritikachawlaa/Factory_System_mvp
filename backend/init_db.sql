-- Database Initialization Script for Factory System (PostgreSQL)

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cameras Table
CREATE TABLE IF NOT EXISTS cameras (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    source TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Online',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Camera Modules Table
CREATE TABLE IF NOT EXISTS camera_modules (
    id SERIAL PRIMARY KEY,
    camera_id INTEGER REFERENCES cameras(id) ON DELETE CASCADE,
    module_key VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'paused',
    actual_status VARCHAR(20) DEFAULT 'unknown',
    config TEXT, -- JSON string
    last_updated TIMESTAMP,
    last_heartbeat TIMESTAMP,
    UNIQUE(camera_id, module_key)
);

-- Unified Events Table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    camera_id INTEGER REFERENCES cameras(id) ON DELETE SET NULL,
    module_key VARCHAR(50),
    type VARCHAR(50), -- 'detection', 'violation'
    label VARCHAR(100),
    confidence FLOAT,
    metadata TEXT, -- JSON/string meta info
    severity VARCHAR(20) DEFAULT 'info'
);

-- Employees (Face Recognition Reference)
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    embedding BYTEA, -- Stored as pickle bytes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visitors Table
CREATE TABLE IF NOT EXISTS visitors (
    id SERIAL PRIMARY KEY,
    tracking_id VARCHAR(100) UNIQUE,
    embedding BYTEA,
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    screenshot_path TEXT
);

-- Evidence Table
CREATE TABLE IF NOT EXISTS evidence (
    id SERIAL PRIMARY KEY,
    camera_id INTEGER REFERENCES cameras(id) ON DELETE CASCADE,
    module_key VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(20), -- 'image', 'video'
    title TEXT,
    file_path TEXT,
    thumbnail_path TEXT
);

-- Initial Admin Seed (only if not exists)
-- Password 'admin123' hashed with passlib pbkdf2_sha256
-- INSERT INTO users (username, password_hash, role) 
-- VALUES ('admin', '$pbkdf2-sha256$29000$sO8Yy...etc', 'superadmin')
-- ON CONFLICT (username) DO NOTHING;
