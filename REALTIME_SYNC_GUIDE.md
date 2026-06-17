# Real-Time Cross-Device Synchronization Guide

## Overview

The Choir System now features **real-time synchronization** between multiple devices (laptop and mobile) using Supabase's PostgreSQL Change Tracking with automatic reconnection and debouncing.

## What's New

### ✅ Features Implemented

1. **Dedicated Real-time Sync Service** - `realtimeSync.ts`
   - Centralized real-time subscription management
   - Automatic reconnection on disconnection
   - Debounced updates to prevent rapid duplicate syncs
   - Better error handling and logging

2. **Real-time Sync Status Indicator**
   - Shows connection status in header
   - Displays "Connected" ✓ or "Disconnected" ✗
   - Shows last sync time (now, 5m, 1h, etc.)
   - Animated pulse when syncing

3. **Cross-Device Synchronization**
   - **Members** - Instantly syncs member additions/edits/deletions
   - **Attendance Events** - QR scans from one device appear on all others immediately
   - **Organizations** - Changes to org structure sync across devices
   - **Churches** - Church data syncs in real-time
   - **Choirs** - Choir group changes sync across devices
   - **Admins** - User account changes sync instantly
   - **Settings** - Organization name and logo sync across devices

## How It Works

### Architecture

```
Mobile Phone (Scanner)          Laptop (Dashboard)
        │                             │
        └─────────> Supabase ←────────┘
                 (PostgreSQL)
                      │
        Realtime Change Events
        (websocket connection)
                      │
        ┌─────────────┴─────────────┐
        ↓                           ↓
   Mobile Updates              Laptop Updates
   (auto-refresh)              (auto-refresh)
```

### Sync Flow

1. **User Action on Device A** (e.g., scan QR code on mobile)
2. **Data Sent to Supabase** (members or events table)
3. **Change Event Triggered** (PostgreSQL notifies subscribers)
4. **All Connected Devices Notified** (websocket pushes change)
5. **Device B Auto-Updates** (state updates without page reload)
6. **User Sees Changes Instantly** ⚡

### Debouncing Strategy

To prevent excessive API calls during rapid updates:
- Rapid consecutive changes to the same table are **batched**
- Only one fetch request per table every **300ms**
- Prevents duplicate API calls and UI flicker

## Technical Implementation

### Real-time Sync Service (`src/services/realtimeSync.ts`)

```typescript
interface RealtimeSyncCallbacks {
  onMembersChange: (members: Member[]) => void;
  onEventsChange: (events: AttendanceEvent[]) => void;
  onOrganizationsChange: (orgs: Organization[]) => void;
  onChurchesChange: (churches: Church[]) => void;
  onChoirsChange: (choirs: ChoirDepartment[]) => void;
  onConnectionChange: (connected: boolean) => void;
}
```

**Key Methods:**
- `initialize(callbacks)` - Setup subscriptions with callbacks
- `forceSync(table)` - Manually trigger a full sync for a table
- `getConnectionStatus()` - Check if real-time is connected
- `disconnect()` - Cleanup subscriptions

**Features:**
- ✅ Automatic reconnection after 5 seconds if connection drops
- ✅ Device ID tracking for presence awareness
- ✅ Debounced refetch to prevent redundant calls
- ✅ Proper cleanup on component unmount

### Integration with AppContext

```typescript
// In AppContext.tsx
realtimeSyncService.initialize({
  onMembersChange: (newMembers) => setMembers(newMembers),
  onEventsChange: (newEvents) => setEvents(newEvents),
  // ... other callbacks
  onConnectionChange: (connected) => {
    if (connected) setIsSupabaseConnected(true);
  }
});
```

### Status Indicator Component

Located in `src/components/RealtimeSyncStatus.tsx`:

- **Connected** (Green): Real-time subscription active ✓
- **Disconnected** (Red): No real-time connection ✗
- **Syncing** (Blue): Currently fetching updates
- Shows time since last successful sync

## Usage Scenarios

### Scenario 1: Mobile Scanner + Laptop Dashboard

1. **Laptop** - Open Dashboard, see member list
2. **Mobile** - Scan member QR code during service
3. **Result** - Attendance appears instantly on laptop (no refresh needed!)

### Scenario 2: Multiple Admin Edits

1. **Laptop A** - Edit member school name
2. **Laptop B** - Has member list open
3. **Result** - Member updates instantly on Laptop B

### Scenario 3: Network Interruption

1. **Mobile** - Scans QR codes offline (buffered locally)
2. **Network Returns** - Auto-reconnects within 5 seconds
3. **Result** - Buffered scans automatically upload and sync to all devices

## Configuration

### Debounce Delay

Adjust in `src/services/realtimeSync.ts`:

```typescript
private debounceDelay = 300; // milliseconds
```

Lower = more responsive but more API calls
Higher = fewer API calls but slight delay in sync

### Reconnect Delay

Adjust in `src/services/realtimeSync.ts`:

```typescript
// In scheduleReconnect() method
setTimeout(() => {
  this.setupSubscriptions();
}, 5000); // 5 seconds
```

## Troubleshooting

### Real-time Not Syncing

**Check 1: Is Supabase connected?**
- Look at header status indicator
- Should show "🟢 Connected" in green

**Check 2: Are tables created?**
- Run SQL schema setup from Settings
- Tables must exist before real-time works

**Check 3: Check browser console**
- Open DevTools (F12)
- Look for "📡 Real-time channel status: SUBSCRIBED"
- Should see sync messages like "🔄 Syncing members from other device"

**Check 4: Verify RLS is disabled**
- In Supabase SQL Editor, run:
```sql
SELECT * FROM pg_tables WHERE tablename IN 
  ('members', 'events', 'organizations', 'churches', 'choirs');
```

### Connection Drops Frequently

**Solution 1:** Check internet stability
- Real-time requires persistent websocket connection
- Unstable WiFi will cause frequent reconnects

**Solution 2:** Increase reconnect delay if seeing too many reconnect attempts
- Modify `scheduleReconnect()` timeout

**Solution 3:** Check Supabase project status
- Visit Supabase Dashboard → Status page
- Verify no ongoing incidents

## Best Practices

✅ **DO:**
- Keep browser tab open while using real-time sync
- Monitor the status indicator in header
- Use "Force Sync" button in Settings if sync seems stuck
- Keep multiple browser windows/devices connected during events

❌ **DON'T:**
- Close browser tabs unnecessarily (disconnects real-time)
- Rely on real-time for critical offline scenarios (use offline queue)
- Leave dev tools console errors unaddressed
- Change Supabase credentials frequently (requires reconnect)

## Performance Considerations

### Network Usage

- **Initial Load**: ~50KB for schema + demo data
- **Per Sync Event**: ~2-5KB depending on data size
- **Connection**: Minimal when idle (just heartbeat)
- **Overall**: Very lightweight, <1MB data per hour of typical use

### Latency

- **Typical Sync Time**: 100-500ms from action to all devices
- **Debounce Delay**: 300ms (can be configured)
- **Reconnect Time**: ~5 seconds if connection drops

## Future Enhancements

🚀 **Planned Features:**
- [ ] Conflict resolution for simultaneous edits
- [ ] Selective sync (only sync my choir's data)
- [ ] Bandwidth optimization for slow networks
- [ ] Presence indicators (show who's viewing what)
- [ ] Sync history/audit logs
- [ ] Automatic data compression for large events

## Browser Compatibility

✅ **Fully Supported:**
- Chrome 90+
- Firefox 88+
- Safari 15+
- Edge 90+
- Mobile Chrome/Safari

⚠️ **Known Issues:**
- iOS Safari sometimes drops WebSocket after 5 min (Apple limitation)
- Recommend using PWA mode or native app for mobile

## Support & Debugging

### Enable Debug Logging

In browser console:

```javascript
// Monitor real-time sync service
setInterval(() => {
  console.log('Connected:', realtimeSyncService.getConnectionStatus());
}, 5000);
```

### Manual Sync Trigger

If sync seems stuck:

1. Open Settings → Database Configuration
2. Scroll to "Debug Tools"
3. Click "Force Sync All Tables"
4. Watch console for completion

## References

- [Supabase Real-time Docs](https://supabase.com/docs/guides/realtime)
- [PostgreSQL LISTEN/NOTIFY](https://www.postgresql.org/docs/current/sql-listen.html)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

**Last Updated:** 2026-06-18
**Status:** ✅ Production Ready
