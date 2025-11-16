# ProjectPhoenix Deployment Checklist for Bluehost

## 📋 Pre-Deployment Checklist

### 1. Security Updates Required ⚠️
- [ ] **Update database password** in `api/db_config_production.php`
- [ ] **Generate password hash** for auth: Run `php -r "echo password_hash('your_new_password', PASSWORD_DEFAULT);"` and update `api/auth_production.php`
- [ ] **Set JWT secret** as environment variable on Bluehost
- [ ] **Update CORS origins** in `db_config_production.php` to match your domain

### 2. Database Setup
- [ ] Login to Bluehost cPanel
- [ ] Create MySQL database: `pflugera_projectphoenix_db`
- [ ] Create database user: `pflugera_phoenix_user`
- [ ] Grant all privileges to user on database
- [ ] Run `database_setup.sql` in phpMyAdmin

### 3. File Preparation
- [ ] Build production version: `npm run build` ✅ (Already completed)
- [ ] Rename production PHP files:
  - `api/db_config_production.php` → `api/db_config.php`
  - `api/auth_production.php` → `api/auth.php`

## 📁 Files to Upload to Bluehost

### Frontend Files (Upload to public_html/phoenix/)
```
dist/
├── index.html
├── assets/
│   ├── index-DF7tieBV.css (29.10 KB)
│   └── index-BodFm1YG.js (2,093.26 KB)
```

### API Files (Upload to public_html/phoenix/api/)
```
api/
├── .htaccess (create new - see below)
├── db_config.php (use production version)
├── auth.php (use production version)
├── auth_check.php
├── projects.php
├── spaces.php
└── test.php (remove after testing)
```

### Create .htaccess file for API directory:
```apache
# Enable CORS and PHP
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"

# Redirect all requests to index
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ $1.php [L]
</IfModule>

# Disable directory browsing
Options -Indexes

# Protect sensitive files
<Files "db_config.php">
    Order allow,deny
    Deny from all
</Files>
```

## 🚀 Deployment Steps

### Step 1: Upload Files via FTP/cPanel
1. Connect to Bluehost via FTP or use File Manager in cPanel
2. Navigate to `public_html/`
3. Create folder: `phoenix/`
4. Upload `dist/` contents to `phoenix/`
5. Create `phoenix/api/` folder
6. Upload API files to `phoenix/api/`

### Step 2: Configure Database
1. Login to cPanel → MySQL Databases
2. Create database and user
3. Open phpMyAdmin
4. Select your database
5. Import `database_setup.sql`

### Step 3: Update Configuration
1. Edit `api/db_config.php` on server:
   - Update database password
   - Set correct database name
   - Update CORS origins to your domain

2. Edit `api/auth.php` on server:
   - Update password hash
   - Set JWT secret

### Step 4: Update Frontend API URL
1. Edit the built JS file or rebuild with correct API URL:
   - Change `https://phoenix.pflugerarchitects.com/api` to your actual API URL

### Step 5: Test Deployment
1. Navigate to `https://yourdomain.com/phoenix/`
2. Test login with credentials
3. Test creating/saving/loading projects
4. Test space library operations
5. Check browser console for errors

## 🔍 Post-Deployment Verification

### Functionality Tests
- [ ] Login works correctly
- [ ] Can create new project
- [ ] Can save project to database
- [ ] Can load existing projects
- [ ] Can add/edit/delete spaces
- [ ] Can export CSV
- [ ] 3D canvas renders correctly
- [ ] Measurements work

### Security Checks
- [ ] Database credentials not exposed
- [ ] Error messages don't leak sensitive info
- [ ] CORS properly configured
- [ ] Login rate limiting works
- [ ] HTTPS enforced

### Performance Checks
- [ ] Page loads quickly
- [ ] 3D rendering is smooth
- [ ] API responses are fast

## 🐛 Troubleshooting

### Common Issues:

1. **500 Error on API calls**
   - Check PHP error logs in cPanel
   - Verify database connection details
   - Ensure PHP version is 7.4+

2. **CORS errors**
   - Update allowed origins in `db_config.php`
   - Check .htaccess configuration

3. **Login fails**
   - Verify password hash is correct
   - Check database for login_attempts table
   - Clear browser cache

4. **3D Canvas not rendering**
   - Check browser console for WebGL errors
   - Verify all JS assets loaded
   - Test in different browser

5. **Database connection failed**
   - Verify credentials in db_config.php
   - Check database exists and user has permissions
   - Test with test.php first

## 📞 Support Contacts

- **Bluehost Support**: 1-888-401-4678
- **Project Issues**: Report at https://github.com/anthropics/claude-code/issues
- **Database**: Check error logs in cPanel → Metrics → Errors

## ✅ Final Notes

- Keep backup of all original files
- Document any custom changes made on server
- Monitor error logs for first 24 hours
- Consider setting up automated backups
- Update this checklist with any issues encountered

---

**Last Updated**: November 15, 2024
**Build Version**: 0.1.0
**Tested With**: Chrome 119+, Firefox 119+, Safari 17+