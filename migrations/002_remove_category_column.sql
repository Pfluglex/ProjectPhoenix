-- Migration: Remove redundant category column
-- Date: 2025-11-14
-- Description: Category and type were redundant - merged into single 'type' field

-- Remove category column from space_library table
ALTER TABLE space_library DROP COLUMN category;

-- Verify the change
DESCRIBE space_library;
