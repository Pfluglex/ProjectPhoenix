-- Remove color column from space_library table
-- Colors will now be managed by the theme manager

ALTER TABLE space_library DROP COLUMN color;

-- Also remove color from project_spaces table
ALTER TABLE project_spaces DROP COLUMN color;
