-- Migration: Update type values from old system to new system
-- Date: 2025-11-14
-- Description: Convert old type values (program/circulation/support) to new type system

-- First, let's see what types we currently have
SELECT DISTINCT type FROM space_library;

-- Update strategy: Map old types to new types
-- You'll need to manually map based on what spaces you have
-- Example mappings (adjust as needed):

-- If you want to map old 'program' spaces to 'technology':
-- UPDATE space_library SET type = 'technology' WHERE type = 'program';

-- If you want to map old 'circulation' spaces to 'generic':
-- UPDATE space_library SET type = 'generic' WHERE type = 'circulation';

-- If you want to map old 'support' spaces to 'service':
-- UPDATE space_library SET type = 'service' WHERE type = 'support';

-- Verify after updates:
-- SELECT id, name, type FROM space_library ORDER BY type;
