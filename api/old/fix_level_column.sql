-- Fix for missing level column
-- Run each command separately in phpMyAdmin

-- For project_spaces table:
ALTER TABLE `project_spaces`
ADD COLUMN `level` INT DEFAULT 1 AFTER `rotation`;

-- For project_measurements table (if needed):
ALTER TABLE `project_measurements`
ADD COLUMN `level` INT DEFAULT 1 AFTER `point2_z`;

-- Note: If you get an error saying "Duplicate column name 'level'",
-- it means the column already exists and you can ignore that error.