# Project Phoenix API

## Setup Instructions

### 1. Database Setup

Run the SQL schema file to create the necessary tables:

```bash
mysql -u phoenix_user -p pflugera_projectphoenix_db < schema.sql
```

Or import via phpMyAdmin:
- Log into phpMyAdmin
- Select database: `pflugera_projectphoenix_db`
- Go to "Import" tab
- Choose file: `schema.sql`
- Click "Go"

### 2. Upload PHP Files to Server

Upload these files to your server at `phoenix.pflugerarchitects.com`:

```
/api/
  ├── db_config.php
  ├── save_project.php
  ├── load_project.php
  └── list_projects.php
```

Recommended location: `/public_html/api/` or `/www/api/`

### 3. Update API Base URL in Frontend

The frontend is configured to call: `https://phoenix.pflugerarchitects.com/api/`

If your API is at a different path, update the `API_BASE_URL` constant in the frontend code.

### 4. Test the API

Test endpoints using curl or Postman:

**List Projects:**
```bash
curl https://phoenix.pflugerarchitects.com/api/list_projects.php
```

**Load Project:**
```bash
curl "https://phoenix.pflugerarchitects.com/api/load_project.php?project_id=proj_123"
```

**Save Project:**
```bash
curl -X POST https://phoenix.pflugerarchitects.com/api/save_project.php \
  -H "Content-Type: application/json" \
  -d '{
    "project": {
      "id": "proj_123",
      "name": "Test Project",
      "timestamp": "2025-01-14T12:00:00Z",
      "spaceCount": 2
    },
    "spaces": [...]
  }'
```

## API Endpoints

### 1. List Projects
- **URL:** `/api/list_projects.php`
- **Method:** GET
- **Response:**
```json
{
  "success": true,
  "projects": [
    {
      "id": "proj_123",
      "name": "My Project",
      "timestamp": "2025-01-14 12:00:00",
      "space_count": 5
    }
  ]
}
```

### 2. Load Project
- **URL:** `/api/load_project.php?project_id=xxx`
- **Method:** GET
- **Response:**
```json
{
  "success": true,
  "project": {...},
  "spaces": [...]
}
```

### 3. Save Project
- **URL:** `/api/save_project.php`
- **Method:** POST
- **Body:**
```json
{
  "project": {
    "id": "proj_xxx",
    "name": "Project Name",
    "timestamp": "2025-01-14T12:00:00Z",
    "spaceCount": 5
  },
  "spaces": [...]
}
```

## Security Notes

- CORS is currently set to `*` (allow all origins). Consider restricting to your domain in production.
- Database credentials are in `db_config.php` - ensure this file has proper permissions (644 or 600)
- Consider adding authentication for production use

## Troubleshooting

**500 Error:** Check database connection credentials in `db_config.php`

**CORS Error:** Verify CORS headers are being sent from PHP files

**404 Error:** Verify files are uploaded to correct directory on server
