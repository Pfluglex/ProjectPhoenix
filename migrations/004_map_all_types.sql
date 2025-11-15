-- Migration: Map all existing spaces to new type system
-- Date: 2025-11-14
-- Description: Update all spaces from old type values to new 7-type system

-- TECHNOLOGY type (Computer/Tech/Audio Visual/Cyber)
UPDATE space_library SET type = 'technology' WHERE name LIKE '%Computer%';
UPDATE space_library SET type = 'technology' WHERE name LIKE '%Cyber%';
UPDATE space_library SET type = 'technology' WHERE name LIKE '%Audio%';
UPDATE space_library SET type = 'technology' WHERE name LIKE '%Visual%';
UPDATE space_library SET type = 'technology' WHERE name LIKE '%Tech%';
UPDATE space_library SET type = 'technology' WHERE name LIKE '%Digital%';
UPDATE space_library SET type = 'technology' WHERE name LIKE '%Media%';

-- TRADES type (Construction/Aviation/Culinary/Automotive/Welding)
UPDATE space_library SET type = 'trades' WHERE name LIKE '%Construction%';
UPDATE space_library SET type = 'trades' WHERE name LIKE '%Aviation%';
UPDATE space_library SET type = 'trades' WHERE name LIKE '%Culinary%';
UPDATE space_library SET type = 'trades' WHERE name LIKE '%Automotive%';
UPDATE space_library SET type = 'trades' WHERE name LIKE '%Welding%';
UPDATE space_library SET type = 'trades' WHERE name LIKE '%HVAC%';
UPDATE space_library SET type = 'trades' WHERE name LIKE '%Plumbing%';
UPDATE space_library SET type = 'trades' WHERE name LIKE '%Electrical%';

-- BAND type (Band/Choir/Music)
UPDATE space_library SET type = 'band' WHERE name LIKE '%Band%';
UPDATE space_library SET type = 'band' WHERE name LIKE '%Choir%';
UPDATE space_library SET type = 'band' WHERE name LIKE '%Music%';
UPDATE space_library SET type = 'band' WHERE name LIKE '%Dressing%';
UPDATE space_library SET type = 'band' WHERE name LIKE '%Practice%';

-- ADMIN type (Office/Meeting/Conference)
UPDATE space_library SET type = 'admin' WHERE name LIKE '%Office%';
UPDATE space_library SET type = 'admin' WHERE name LIKE '%Admin%';
UPDATE space_library SET type = 'admin' WHERE name LIKE '%Conference%';
UPDATE space_library SET type = 'admin' WHERE name LIKE '%Meeting%';

-- SERVICE type (Storage/Mechanical/Electrical/Support)
UPDATE space_library SET type = 'service' WHERE name LIKE '%Storage%';
UPDATE space_library SET type = 'service' WHERE name LIKE '%Mechanical%';
UPDATE space_library SET type = 'service' WHERE name LIKE '%Electrical Room%';
UPDATE space_library SET type = 'service' WHERE name LIKE '%Janitor%';
UPDATE space_library SET type = 'service' WHERE name LIKE '%Utility%';

-- SYSTEMS type (PLC/Control/Server)
UPDATE space_library SET type = 'systems' WHERE name LIKE '%PLC%';
UPDATE space_library SET type = 'systems' WHERE name LIKE '%Control%';
UPDATE space_library SET type = 'systems' WHERE name LIKE '%Server%';
UPDATE space_library SET type = 'systems' WHERE name LIKE '%System%';

-- GENERIC type (Career Center/Circulation/Commons/Everything else)
UPDATE space_library SET type = 'generic' WHERE name LIKE '%Career%';
UPDATE space_library SET type = 'generic' WHERE name LIKE '%College%';
UPDATE space_library SET type = 'generic' WHERE name LIKE '%Circulation%';
UPDATE space_library SET type = 'generic' WHERE name LIKE '%Commons%';
UPDATE space_library SET type = 'generic' WHERE name LIKE '%Lobby%';
UPDATE space_library SET type = 'generic' WHERE name LIKE '%Hallway%';
UPDATE space_library SET type = 'generic' WHERE name LIKE '%Corridor%';

-- Verify all spaces have been updated
SELECT type, COUNT(*) as count FROM space_library GROUP BY type ORDER BY type;
SELECT id, name, type FROM space_library ORDER BY type, name;
