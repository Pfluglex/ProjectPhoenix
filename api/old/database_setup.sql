-- ProjectPhoenix Database Setup
-- Run this script on your Bluehost MySQL database

-- Create projects table
CREATE TABLE IF NOT EXISTS `projects` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `timestamp` VARCHAR(50) NOT NULL,
  `space_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_timestamp (`timestamp`),
  INDEX idx_created (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create project_spaces table
CREATE TABLE IF NOT EXISTS `project_spaces` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` VARCHAR(50) NOT NULL,
  `space_instance_id` VARCHAR(100) NOT NULL,
  `template_id` VARCHAR(50),
  `space_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `width` DECIMAL(10,2) NOT NULL,
  `depth` DECIMAL(10,2) NOT NULL,
  `height` DECIMAL(10,2) NOT NULL,
  `icon` VARCHAR(100),
  `type` VARCHAR(50),
  `position_x` DECIMAL(10,2) DEFAULT 0,
  `position_y` DECIMAL(10,2) DEFAULT 0,
  `position_z` DECIMAL(10,2) DEFAULT 0,
  `rotation` DECIMAL(10,2) DEFAULT 0,
  `level` INT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  INDEX idx_project (`project_id`),
  INDEX idx_level (`level`),
  UNIQUE KEY unique_instance (`project_id`, `space_instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create project_measurements table
CREATE TABLE IF NOT EXISTS `project_measurements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` VARCHAR(50) NOT NULL,
  `measurement_id` VARCHAR(50) NOT NULL,
  `point1_x` DECIMAL(10,2) NOT NULL,
  `point1_z` DECIMAL(10,2) NOT NULL,
  `point2_x` DECIMAL(10,2) NOT NULL,
  `point2_z` DECIMAL(10,2) NOT NULL,
  `level` INT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  INDEX idx_project (`project_id`),
  UNIQUE KEY unique_measurement (`project_id`, `measurement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create space_library table
CREATE TABLE IF NOT EXISTS `space_library` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `width` DECIMAL(10,2) NOT NULL,
  `depth` DECIMAL(10,2) NOT NULL,
  `height` DECIMAL(10,2) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `icon` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create login_attempts table for rate limiting
CREATE TABLE IF NOT EXISTS `login_attempts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL,
  `attempt_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (`email`),
  INDEX idx_attempt_time (`attempt_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default space library data (sample)
INSERT INTO `space_library` (`id`, `name`, `width`, `depth`, `height`, `type`, `icon`) VALUES
-- Technology Spaces
('tech-001', 'Computer Lab', 30, 40, 10, 'technology', 'Monitor'),
('tech-002', 'Robotics Lab', 35, 45, 12, 'technology', 'Cpu'),
('tech-003', 'Media Production', 25, 30, 10, 'technology', 'Video'),

-- Trades Spaces
('trad-001', 'Woodshop', 40, 50, 15, 'trades', 'Hammer'),
('trad-002', 'Auto Shop', 50, 60, 18, 'trades', 'Wrench'),
('trad-003', 'Welding Shop', 35, 40, 15, 'trades', 'Zap'),

-- Band/Music Spaces
('band-001', 'Band Hall', 45, 60, 20, 'band', 'Music'),
('band-002', 'Practice Room', 12, 15, 10, 'band', 'Mic'),
('band-003', 'Instrument Storage', 20, 25, 10, 'band', 'Archive'),

-- Admin Spaces
('admn-001', 'Main Office', 25, 30, 10, 'admin', 'Building'),
('admn-002', 'Conference Room', 20, 25, 10, 'admin', 'Users'),
('admn-003', 'Staff Lounge', 18, 22, 10, 'admin', 'Coffee'),

-- Service Spaces
('serv-001', 'Cafeteria', 60, 80, 15, 'service', 'Utensils'),
('serv-002', 'Library', 50, 70, 12, 'service', 'BookOpen'),
('serv-003', 'Nurse Office', 15, 20, 10, 'service', 'Heart'),

-- Systems Spaces
('syst-001', 'Mechanical Room', 20, 30, 15, 'systems', 'Settings'),
('syst-002', 'Electrical Room', 15, 20, 12, 'systems', 'Zap'),
('syst-003', 'IT Server Room', 12, 15, 10, 'systems', 'Server'),

-- Generic Spaces
('gene-001', 'Classroom', 25, 30, 10, 'generic', 'Square'),
('gene-002', 'Storage', 10, 15, 10, 'generic', 'Package'),
('gene-003', 'Hallway', 8, 100, 10, 'generic', 'ArrowRight'),

-- Egress Spaces
('egre-001', 'Main Entry', 15, 20, 12, 'egress', 'DoorOpen'),
('egre-002', 'Emergency Exit', 8, 10, 10, 'egress', 'LogOut'),
('egre-003', 'Stairwell', 12, 12, 40, 'egress', 'TrendingUp')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  width = VALUES(width),
  depth = VALUES(depth),
  height = VALUES(height);

-- Grant necessary permissions (adjust username as needed)
-- GRANT ALL PRIVILEGES ON pflugera_projectphoenix_db.* TO 'pflugera_phoenix_user'@'localhost';