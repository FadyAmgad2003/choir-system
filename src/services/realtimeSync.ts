import { getSupabaseClient } from '../supabaseClient';
import { Member, AttendanceEvent, Organization, Church, ChoirDepartment } from '../types';

/**
 * Real-Time Synchronization Service
 * Handles cross-device synchronization between laptop and mobile scanners
 */

export interface RealtimeSyncCallbacks {
  onMembersChange: (members: Member[]) => void;
  onEventsChange: (events: AttendanceEvent[]) => void;
  onOrganizationsChange: (orgs: Organization[]) => void;
  onChurchesChange: (churches: Church[]) => void;
  onChoirsChange: (choirs: ChoirDepartment[]) => void;
  onConnectionChange: (connected: boolean) => void;
}

class RealtimeSyncService {
  private channel: any = null;
  private client: any = null;
  private callbacks: Partial<RealtimeSyncCallbacks> = {};
  private reconnectTimer: NodeJS.Timeout | null = null;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private lastUpdateTime: Map<string, number> = new Map();
  private isConnected = false;
  private debounceDelay = 300; // ms

  constructor() {
    this.client = getSupabaseClient();
  }

  /**
   * Initialize real-time sync subscriptions
   */
  public initialize(callbacks: Partial<RealtimeSyncCallbacks>) {
    this.callbacks = callbacks;
    this.setupSubscriptions();
  }

  /**
   * Setup real-time subscriptions for all data tables
   */
  private setupSubscriptions() {
    if (!this.client) {
      console.warn('Supabase client not available for real-time sync');
      return;
    }

    // Remove any existing channel
    if (this.channel) {
      this.client.removeChannel(this.channel);
    }

    // Create new channel for real-time updates
    this.channel = this.client.channel('sync_channel', {
      config: {
        broadcast: { self: true },
        presence: { key: this.getDeviceId() }
      }
    });

    // Subscribe to all table changes
    this.setupTableSubscriptions();

    // Subscribe to channel status changes
    this.channel.subscribe((status: string) => {
      console.log('📡 Real-time channel status:', status);
      const connected = status === 'SUBSCRIBED';
      this.isConnected = connected;
      this.callbacks.onConnectionChange?.(connected);

      if (connected) {
        this.clearReconnectTimer();
      } else {
        this.scheduleReconnect();
      }
    });
  }

  /**
   * Setup subscriptions for each data table
   */
  private setupTableSubscriptions() {
    // Members table
    this.channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'members' },
      (payload: any) => {
        console.log('👥 Members changed:', payload.eventType);
        this.debounceRefetch('members', () => {
          this.fetchAndSync('members');
        });
      }
    );

    // Events table (Attendance logs)
    this.channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'events' },
      (payload: any) => {
        console.log('📋 Events changed:', payload.eventType);
        this.debounceRefetch('events', () => {
          this.fetchAndSync('events');
        });
      }
    );

    // Organizations table
    this.channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'organizations' },
      (payload: any) => {
        console.log('🏛️  Organizations changed:', payload.eventType);
        this.debounceRefetch('organizations', () => {
          this.fetchAndSync('organizations');
        });
      }
    );

    // Churches table
    this.channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'churches' },
      (payload: any) => {
        console.log('⛪ Churches changed:', payload.eventType);
        this.debounceRefetch('churches', () => {
          this.fetchAndSync('churches');
        });
      }
    );

    // Choirs table
    this.channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'choirs' },
      (payload: any) => {
        console.log('🎵 Choirs changed:', payload.eventType);
        this.debounceRefetch('choirs', () => {
          this.fetchAndSync('choirs');
        });
      }
    );
  }

  /**
   * Debounce rapid successive updates to prevent redundant API calls
   */
  private debounceRefetch(key: string, callback: () => void) {
    // Clear existing timer if any
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      callback();
      this.debounceTimers.delete(key);
    }, this.debounceDelay);

    this.debounceTimers.set(key, timer);
  }

  /**
   * Fetch and sync specific data type
   */
  private async fetchAndSync(table: string) {
    if (!this.client) return;

    try {
      const { data, error } = await this.client.from(table).select('*');

      if (error) {
        console.error(`Error fetching ${table}:`, error);
        return;
      }

      // Update last fetch time
      this.lastUpdateTime.set(table, Date.now());

      // Trigger appropriate callback
      switch (table) {
        case 'members':
          this.callbacks.onMembersChange?.(data);
          break;
        case 'events':
          this.callbacks.onEventsChange?.(data);
          break;
        case 'organizations':
          this.callbacks.onOrganizationsChange?.(data);
          break;
        case 'churches':
          this.callbacks.onChurchesChange?.(data);
          break;
        case 'choirs':
          this.callbacks.onChoirsChange?.(data);
          break;
      }
    } catch (err) {
      console.error(`Failed to fetch ${table}:`, err);
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect() {
    if (this.reconnectTimer) return;

    console.log('🔄 Scheduling reconnect in 5 seconds...');
    this.reconnectTimer = setTimeout(() => {
      console.log('🔌 Attempting to reconnect...');
      this.reconnectTimer = null;
      this.setupSubscriptions();
    }, 5000);
  }

  /**
   * Clear reconnect timer
   */
  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Get unique device ID for presence tracking
   */
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('cams_device_id');
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cams_device_id', deviceId);
    }
    return deviceId;
  }

  /**
   * Cleanup and disconnect
   */
  public disconnect() {
    if (this.channel) {
      this.client?.removeChannel(this.channel);
      this.channel = null;
    }
    this.clearReconnectTimer();
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }

  /**
   * Manually trigger a full sync for a table
   */
  public async forceSync(table: string) {
    console.log(`⚡ Force syncing ${table}...`);
    await this.fetchAndSync(table);
  }

  /**
   * Check if real-time is connected
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const realtimeSyncService = new RealtimeSyncService();
