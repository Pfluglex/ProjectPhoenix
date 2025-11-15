-- Migration: Remove category column from project_spaces table
-- Date: 2025-11-14
-- Description: Remove redundant category column from project_spaces (same as space_library)

-- Check if column exists first
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'projectphoenix'
  AND TABLE_NAME = 'project_spaces'
  AND COLUMN_NAME = 'category';

-- Remove category column from project_spaces table
ALTER TABLE project_spaces DROP COLUMN IF EXISTS category;

-- Verify the change
DESCRIBE project_spaces;
