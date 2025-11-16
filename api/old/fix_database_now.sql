-- Fix missing columns in database
-- Run these commands in phpMyAdmin

-- 1. Add missing 'level' column to project_spaces table
ALTER TABLE `project_spaces`
ADD COLUMN `level` INT DEFAULT 1 AFTER `rotation`;

-- 2. Add missing 'level' column to project_measurements table
ALTER TABLE `project_measurements`
ADD COLUMN `level` INT DEFAULT 1 AFTER `point2_z`;

-- 3. OPTIONAL: Remove the old 'category' column from project_spaces (no longer used)
-- ALTER TABLE `project_spaces` DROP COLUMN `category`;