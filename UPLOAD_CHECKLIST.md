# Upload Checklist for Project Phoenix

## ✅ Files Ready to Upload

### 1. Database Schema (Run Once)
- [ ] `api/schema.sql` - Creates 3 tables: `projects`, `project_spaces`, `space_library`

### 2. PHP API Files (Upload to Server)
Upload these 3 files to `https://phoenix.pflugerarchitects.com/api/`:

- [ ] `api/db_config.php` - Database connection config
- [ ] `api/projects.php` - Project management API (save/load/list)
- [ ] `api/spaces.php` - Space library API (CRUD operations)

## 📋 Deployment Steps

### Step 1: Run Database Schema
```bash
mysql -u phoenix_user -p pflugera_projectphoenix_db < api/schema.sql
```

**Or via phpMyAdmin:**
1. Login to phpMyAdmin
2. Select database: `pflugera_projectphoenix_db`
3. Go to "Import" tab
4. Choose file: `api/schema.sql`
5. Click "Go"

### Step 2: Upload PHP Files
Upload to: `https://phoenix.pflugerarchitects.com/api/`

```
/api/
  ├── db_config.php
  ├── projects.php
  └── spaces.php
```

### Step 3: Set File Permissions
```bash
chmod 644 db_config.php
chmod 644 projects.php
chmod 644 spaces.php
```

### Step 4: Test APIs

**Test Projects API:**
```bash
curl https://phoenix.pflugerarchitects.com/api/projects.php?action=list
```

**Test Spaces API:**
```bash
curl https://phoenix.pflugerarchitects.com/api/spaces.php?action=list
```

Expected response:
```json
{
  "success": true,
  "projects": []  // or "spaces": []
}
```

## 🗄️ Database Tables Created

### 1. projects
Stores saved projects
- `id` - Unique project ID
- `name` - Project name
- `timestamp` - Creation time
- `space_count` - Number of spaces

### 2. project_spaces
Stores all spaces within projects
- `project_id` - Links to projects table
- `space_instance_id` - Unique instance ID
- All space properties (dimensions, position, color, etc.)

### 3. space_library
Stores space templates/definitions
- `id` - Space template ID
- `category` - Space category
- `name` - Space name
- `width`, `depth`, `height` - Dimensions
- `color`, `type`, `icon` - Visual properties

## 📡 API Endpoints

### Projects API (`/api/projects.php`)
- **List all projects:** `GET ?action=list`
- **Load project:** `GET ?action=load&project_id=xxx`
- **Save project:** `POST ?action=save` (with JSON body)

### Spaces API (`/api/spaces.php`)
- **List all spaces:** `GET ?action=list`
- **Get space:** `GET ?action=get&id=xxx`
- **Create space:** `POST ?action=create` (with JSON body)
- **Update space:** `POST ?action=update` (with JSON body)
- **Delete space:** `DELETE ?action=delete&id=xxx`

## 🎯 Frontend Already Updated

All frontend components are ready:
- ✅ Projects save/load from database
- ✅ Space library loads from database
- ✅ Project Library view displays from database
- ✅ No more localStorage or CSV files

## 🚀 After Upload

Once you upload the 3 PHP files and run the SQL schema:

1. **Space Library will load from database** (currently empty)
2. **Projects can be saved to database**
3. **Projects can be loaded from database**
4. **Project Library view will show all saved projects**

## 📝 Next Steps

1. Populate `space_library` table with your space definitions
2. You can do this by:
   - Importing data from your CSV
   - Using the API to create spaces
   - Adding a UI in the app to manage spaces

## ⚠️ Important Notes

- Database credentials are in `db_config.php` - keep this secure
- CORS is set to allow all origins (`*`) - consider restricting in production
- No authentication is implemented - add this for production use
- Make sure PHP is enabled on your server
