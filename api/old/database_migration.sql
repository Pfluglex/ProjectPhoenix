-- Database Migration: Add missing level column
-- Run this in phpMyAdmin to fix the "Unknown column 'level' in 'field list'" error

-- Add level column to project_spaces table if it doesn't exist
ALTER TABLE `project_spaces`
ADD COLUMN IF NOT EXISTS `level` INT DEFAULT 1 AFTER `rotation`;

-- Add level column to project_measurements table if it doesn't exist
ALTER TABLE `project_measurements`
ADD COLUMN IF NOT EXISTS `level` INT DEFAULT 1 AFTER `point2_z`;

-- If the columns already exist, this won't cause an error due to IF NOT EXISTS clause