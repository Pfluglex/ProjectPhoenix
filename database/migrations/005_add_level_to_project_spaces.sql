-- Add level column to project_spaces table
-- Each level represents 15 feet of vertical height (Y-axis)
-- Level 1 = Y:0, Level 2 = Y:15, Level 3 = Y:30, Level 4 = Y:45

ALTER TABLE project_spaces
ADD COLUMN level INT NOT NULL DEFAULT 1 AFTER position_z;

-- Update comment to document the level system
ALTER TABLE project_spaces
COMMENT = 'Stores space instances within projects. Level field indicates building floor (1-4, each 15ft tall)';
