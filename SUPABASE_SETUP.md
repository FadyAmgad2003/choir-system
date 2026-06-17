# Supabase Setup Guide for Choir System

## Overview
Your choir system has been refactored to work with **Supabase** as the real data source instead of using hardcoded fake data. This guide will help you set it up in 5 minutes.

## Quick Start (5 Steps)

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in with your account
3. Click "New Project"
4. Choose a project name and region
5. Save your database password (you'll need it)
6. Wait for project creation (usually 2 minutes)

### Step 2: Get Your Connection Credentials
1. Open your project dashboard
2. Click "Settings" → "API" in the left menu
3. Copy the following:
   - **Project URL** (starts with `https://...supabase.co`)
   - **Anon/Public Key** (under "Project API keys")

### Step 3: Enter Credentials in Choir System
1. Open the Choir System in your browser
2. Go to **Settings** tab
3. Scroll down to **"Database Configuration"** section
4. Paste the Project URL and Anon Key
5. Click **"Update Configuration"**

### Step 4: Create Database Tables
1. Back in Supabase Dashboard, click **"SQL Editor"** (left menu)
2. Click **"New Query"**
3. Go back to Choir System Settings and find the **"Database Schema Setup"** section
4. Click **"Copy SQL Schema"** button (it will copy the entire setup script)
5. Return to Supabase SQL Editor and paste the SQL
6. Click the **"Run"** button

### Step 5: Verify Connection
1. After SQL runs successfully, return to the Choir System
2. You should see a green checkmark saying **"✓ Database Connected"**
3. The app will automatically seed initial demo data on first load

## What Gets Created

The SQL script creates these tables automatically:
- **organizations** - Dioceses and organizational units
- **churches** - Individual churches/parishes
- **choirs** - Choir departments and groups
- **members** - Member registry with codes and details
- **events** - Attendance logs and check-in records
- **admins** - User accounts and admin profiles
- **settings** - System configuration (org name, logo, etc.)

## Demo Data

When you first connect to an empty Supabase project, the system will automatically:
1. Create the 6 demo members (Fady, Youssef, Kirolos, Marina, Monica, Michael)
2. Create demo choirs (Melody of Angels, St. Gregory Hymns, Sunday School, Youth Fellowship)
3. Create demo churches and organizations
4. Create demo attendance records
5. Create demo admin accounts for testing

**Note:** The auto-seed only happens on the default Supabase fallback database. If you provide your own Supabase project, you'll start with empty tables (which is safer for production).

## Testing the System

### Test Login Credentials (Demo Data)
After setup, you can log in with:
- **Super Admin:** `superadmin@church.org` / `super`
- **Admin:** `fadyamgd126@gmail.com` / `admin`
- **Field Officer:** `peter.m@diocesestaff.org` / `officer`

### Test Roles
1. Click your name in the top-right
2. Choose "Change Account / Test Roles"
3. Select different roles to test different views

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│         Choir System Browser App                    │
│  (React + TypeScript)                               │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓ (Real-time Sync)
┌─────────────────────────────────────────────────────┐
│    Supabase Cloud Backend                           │
│    (PostgreSQL + REST API)                          │
│                                                      │
│  ✓ Organizations                                    │
│  ✓ Churches                                         │
│  ✓ Choirs                                           │
│  ✓ Members                                          │
│  ✓ Events/Attendance                                │
│  ✓ Admin Users                                      │
│  ✓ Settings                                         │
└─────────────────────────────────────────────────────┘
```

## Key Features Now Enabled

✅ **Real-time Data Sync** - Changes on one device appear instantly on others
✅ **Offline Support** - Scan QR codes offline, sync when connection returns
✅ **Multi-device** - Use web app on laptop, mobile app on tablets
✅ **Secure Cloud Backup** - All data automatically backed up in Supabase
✅ **Production Ready** - Switch from demo data to your real organization

## Troubleshooting

### "Database tables not found" Error
**Solution:** You haven't run the SQL schema yet. Go to Step 4 above.

### "Authentication Error: Anon Key invalid"
**Solutions:**
1. Double-check you copied the correct Anon Key (not the Service Role key)
2. Make sure you're using the URL from "Project URL" not "API URL"
3. Verify the project URL is exactly as shown in Supabase Settings

### Connection drops after a few minutes
**Solution:** Make sure RLS (Row Level Security) is disabled on all tables. The SQL script does this automatically.

### Data not syncing to Supabase
**Solutions:**
1. Check your internet connection (green ✓ should show in top-right)
2. Check Supabase project is running (Status page in Supabase dashboard)
3. Verify your credentials are correct (try re-entering them in Settings)

## Advanced: Sharing Connection Across Devices

To quickly set up the same database on multiple devices (laptop scanner and mobile app):

1. In Choir System Settings, go to **"Sync Database Across Devices"**
2. Click **"Generate Connection Link"**
3. Scan the QR code on another device or share the link
4. The other device automatically connects to the same database

## Security Notes for Production

⚠️ **Important:** The current setup disables Row Level Security (RLS) for ease of development.

**For production, you should:**
1. Enable RLS on all tables
2. Create policies that restrict access by user role
3. Use Supabase Auth instead of local password authentication
4. Hide the Anon Key and use environment variables

See [Supabase Security Best Practices](https://supabase.com/docs/guides/auth) for details.

## Next Steps

1. **Add Your Organization's Data** - Go to Members tab and start adding real members
2. **Customize Choirs** - Create your church's specific choir groups
3. **Set Up QR Scanner** - Use mobile device with QR Scanner tab
4. **Generate ID Cards** - Create printable ID cards for members
5. **Start Recording Attendance** - Use Scanner tab during services

## Support

If you have issues:
1. Check this guide's Troubleshooting section
2. Verify your Supabase project is running
3. Check your internet connection
4. Look at browser console (F12) for error messages
5. Try Settings → "Disconnect" then reconnect

---

**Congratulations!** Your choir attendance system is now connected to a real cloud database. 🎉
