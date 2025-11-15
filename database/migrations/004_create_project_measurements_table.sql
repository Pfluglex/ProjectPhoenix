-- Migration: Create project_measurements table
-- This table stores measurement lines for each project

CREATE TABLE IF NOT EXISTS project_measurements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    measurement_id VARCHAR(50) NOT NULL,
    point1_x DECIMAL(10, 2) NOT NULL,
    point1_z DECIMAL(10, 2) NOT NULL,
    point2_x DECIMAL(10, 2) NOT NULL,
    point2_z DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key to projects table
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,

    -- Index for faster lookups
    INDEX idx_project_id (project_id),
    INDEX idx_measurement_id (measurement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
