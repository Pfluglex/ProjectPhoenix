-- Add type column to project_spaces table
ALTER TABLE project_spaces
ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'generic' AFTER icon;

-- Create index for type column for better performance
CREATE INDEX idx_type ON project_spaces(type);
