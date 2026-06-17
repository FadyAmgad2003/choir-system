# Real-Time Sync Testing Guide

## Quick Start - Test Cross-Device Sync

### Prerequisites
✅ Supabase project created
✅ Database schema set up (via Setup Wizard)
✅ Demo data seeded
✅ App running on http://localhost:3000

### Test Setup (5 minutes)

1. **Open Two Browser Windows/Tabs**
   - Window A: http://localhost:3000 (Laptop Dashboard view)
   - Window B: http://localhost:3000 (Mobile Scanner view or second tab)
   - Or use actual mobile phone: http://YOUR_IP:3000

2. **Login on Both**
   - Use same credentials (admin@church.org / admin)
   - Both should show "🟢 Real-time sync: Connected" in header

3. **Check Console Logs**
   - Open DevTools on both (F12)
   - Watch for: `📡 Real-time channel status: SUBSCRIBED`

## Test Case 1: Member Sync

### Expected Behavior
- Add/Edit member on Device A
- Appears instantly on Device B (no refresh)

### Steps
1. **Device A (Laptop)**
   - Go to Members tab
   - Click "Enroll New Member"
   - Add: "Test Sync Member"
   - School: "Test School"
   - Save

2. **Device B (Mobile)**
   - Watch the member list
   - New member appears within 1 second ⚡
   - No page refresh needed

3. **Verification**
   - ✓ Member appears on both devices
   - ✓ No duplicate entries
   - ✓ Status shows "Connected" on both

---

## Test Case 2: Attendance Event Sync (Real Scanner)

### Expected Behavior
- Scan QR on Device A
- Attendance appears on Device B instantly

### Steps
1. **Device A (Mobile with Camera)**
   - Go to QR Scanner tab
   - Click "Engage Webcam Hardware Scanner"
   - Or use "Rapid Emulate Scan" button
   - Select any member to simulate scan

2. **Device B (Laptop)**
   - Go to Attendance Logs tab
   - Or stay on Dashboard (shows "Scanned Today")
   - Watch as scan appears instantly

3. **Verification**
   - ✓ Attendance event syncs within 500ms
   - ✓ Time stamp is correct
   - ✓ Device info shows which scanner
   - ✓ No duplicate attendance records

---

## Test Case 3: Reconnection After Disconnect

### Expected Behavior
- Internet drops
- Buffered data while offline
- Auto-reconnect and sync

### Steps
1. **Both devices connected**
   - Status: "🟢 Connected"
   - Have one device ready to scan

2. **Simulate Network Disconnect**
   - Open DevTools Network tab
   - Set throttling to "Offline"
   - Or unplug WiFi temporarily

3. **Take Actions While Offline**
   - Device A: Simulate scan (QR Scanner → Emulate)
   - Should see "Offline Resilience" queue
   - Scan count increases

4. **Reconnect**
   - Turn network back online
   - Or set throttling back to "No throttling"
   - Status should return to "🟢 Connected"

5. **Verify Sync**
   - ✓ All buffered scans uploaded
   - ✓ Attendance appears on Device B
   - ✓ Offline queue clears

---

## Test Case 4: Multiple Admins Editing

### Expected Behavior
- One admin edits member
- Other admins see change instantly

### Steps
1. **Two Browsers (Desktop Simulation)**
   - Browser 1: Admin account (admin@church.org)
   - Browser 2: Officer account (peter.m@diocesestaff.org)

2. **Browser 1: Edit Member**
   - Go to Members
   - Click edit on any member
   - Change school name
   - Save

3. **Browser 2: Check Update**
   - If officer has member view access
   - Changes appear instantly
   - School field updates without refresh

4. **Verification**
   - ✓ Changes propagate to all users
   - ✓ No manual refresh needed
   - ✓ Proper audit trail (if enabled)

---

## Test Case 5: Settings Sync (Org Name)

### Expected Behavior
- Change organization name on Device A
- Appears on all connected devices

### Steps
1. **Device A (Laptop)**
   - Go to Settings
   - Change "Organization Name"
   - Click "Update Configuration"
   - Watch console for success

2. **Device B (Mobile)**
   - Watch header (should update org name)
   - Or go to any page showing org name
   - Should see new name within 1 second

3. **Verification**
   - ✓ Header updates on all devices
   - ✓ Settings persist in Supabase
   - ✓ LocalStorage also updated

---

## Monitoring Sync Status

### Header Status Indicator
```
🟢 Connected (5s ago)      ← Green = Real-time active
```

### Console Logs to Watch
```javascript
// Successful connection
📡 Real-time channel status: SUBSCRIBED
✅ Admin/Settings sync channel status: SUBSCRIBED

// Data sync events
🔄 Syncing members from other device: 6
🔄 Syncing events from other device: 12
👥 Members changed: INSERT
📋 Events changed: UPDATE
```

### Browser DevTools Network Tab
- Look for WebSocket connection named `supabase-realtime`
- Status should be "101 Switching Protocols"
- Should stay open while app is active

---

## Troubleshooting During Tests

### Issue: Status shows "Disconnected"

**Possible Causes:**
1. Supabase credentials not set
   - Go to Settings → Database Configuration
   - Verify URL and Anon Key are filled

2. RLS blocking connections
   - In Supabase SQL Editor, disable RLS
   - Run: `ALTER TABLE members DISABLE ROW LEVEL SECURITY;`

3. Browser WebSocket blocked
   - Check firewall/proxy settings
   - Try different network

**Fix:**
- Check console for error messages
- Try "Force Sync" in Settings
- Refresh page (Ctrl+R)

---

### Issue: Changes Don't Appear on Other Device

**Possible Causes:**
1. Still in disconnected state
   - Check header status
   - Should show green checkmark

2. Debounce delay (300ms)
   - Changes batch every 300ms
   - Wait up to 1 second

3. Browser tab in background
   - Foreground tabs get priority
   - Active browser may be throttled

**Fix:**
- Bring all tabs to foreground
- Open DevTools to keep tab active
- Refresh page if stuck

---

### Issue: Duplicate Data on Sync

**Possible Causes:**
1. Multiple sync triggers
   - Real-time + manual refresh
   - Can cause temporary duplication

2. Rapid consecutive changes
   - Multiple adds without debounce

**Fix:**
- Real-time handles deduplication
- Duplicates disappear after refresh
- Usually resolves within 5 seconds

---

## Performance Testing

### Monitor Real-Time Latency

```javascript
// In Browser Console
const start = Date.now();
// Make a change on Device A
// Watch for sync on Device B, then note time:
console.log('Sync latency:', Date.now() - start, 'ms');
```

**Expected Results:**
- Typical: 100-500ms
- With debounce: 300-800ms
- Max before reconnect: ~5000ms

### Network Usage

**Monitor with DevTools:**
1. Open Network tab
2. Watch WebSocket messages
3. Per-sync typically: 2-5KB
4. Heartbeat when idle: ~100 bytes every 30s

---

## Production Testing Checklist

- [ ] Test with real mobile device on same network
- [ ] Test with 2+ simultaneously connected users
- [ ] Simulate network latency/packet loss
- [ ] Test member updates + scans together
- [ ] Verify no data loss on disconnect/reconnect
- [ ] Check console for any warnings/errors
- [ ] Verify offline queue clears on reconnect
- [ ] Test with 100+ members in database
- [ ] Monitor memory usage over 1 hour
- [ ] Check battery drain on mobile

---

## Success Criteria

✅ All tests pass if:
- [ ] Data syncs within 1 second
- [ ] No duplicate entries after sync
- [ ] Reconnection works automatically
- [ ] Status indicator accurate
- [ ] Console shows no errors
- [ ] Offline buffering works
- [ ] No excessive network usage
- [ ] Mobile and desktop match
- [ ] All user accounts see updates
- [ ] Settings sync to all devices

---

## Next Steps

After confirming tests pass:
1. Deploy to production Supabase
2. Test with real users
3. Monitor sync logs
4. Gather feedback
5. Optimize debounce delay if needed
6. Add conflict resolution if needed
7. Implement audit logging

---

**Test Date:** _______________
**Tested By:** _______________
**Status:** ✅ PASS / ❌ FAIL
**Notes:** _____________________

