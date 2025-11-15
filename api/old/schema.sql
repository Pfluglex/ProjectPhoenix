-- Project Phoenix Database Schema
-- Database: pflugera_projectphoenix_db

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    timestamp DATETIME NOT NULL,
    space_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Project Spaces table
CREATE TABLE IF NOT EXISTS project_spaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    space_instance_id VARCHAR(100) NOT NULL,
    template_id VARCHAR(100) NOT NULL,
    space_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    width DECIMAL(10,2) NOT NULL,
    depth DECIMAL(10,2) NOT NULL,
    height DECIMAL(10,2) NOT NULL,
    color VARCHAR(50) NOT NULL,
    icon VARCHAR(100) NOT NULL,
    position_x DECIMAL(10,2) NOT NULL,
    position_y DECIMAL(10,2) NOT NULL,
    position_z DECIMAL(10,2) NOT NULL,
    rotation DECIMAL(10,4) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project_id (project_id),
    INDEX idx_space_instance_id (space_instance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better query performance
CREATE INDEX idx_projects_timestamp ON projects(timestamp);
CREATE INDEX idx_projects_name ON projects(name);

-- Space Library table (template definitions)
CREATE TABLE IF NOT EXISTS space_library (
    id VARCHAR(100) PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    width DECIMAL(10,2) NOT NULL,
    depth DECIMAL(10,2) NOT NULL,
    height DECIMAL(10,2) NOT NULL DEFAULT 12.00,
    color VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    icon VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_name (name),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
