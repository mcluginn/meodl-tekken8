/* =========================================================================
   MEODL TOURNAMENT HUB — OFFLINE-FIRST DISTRIBUTED ATTENDANCE SYSTEM
   Architecture:
   - Event-Based Distributed Synchronization
   - IndexedDB Local Event Store & Outbox Sync Queue
   - Zero-Latency Immediate Local Commit
   - Server Health Detection & Multi-Device Reconciliation
   - Duplicate-Safe Idempotent Synchronization
   - Emergency JSON / CSV Backup & Merge
   ========================================================================= */

(function(window) {
  'use strict';

  const STORAGE_KEY = 'MEODL_ATTENDANCE_STATE_V1';
  const CONFIG_STORAGE_KEY = 'MEODL_ATTENDANCE_CONFIG_V1';
  const DB_NAME = 'MEODL_ATTENDANCE_DB_V1';
  const DB_VERSION = 1;
  const DOMAIN_BASE = 'https://meodl.uphsd/attendance';

  // -------------------------------------------------------------------------
  // 1. DETERMINISTIC TOKEN & IDENTIFIER HELPERS
  // -------------------------------------------------------------------------
  function generateSecureToken(prefix = 'tok') {
    const chars = '0123456789abcdef';
    let hex = '';
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const arr = new Uint8Array(16);
      window.crypto.getRandomValues(arr);
      for (let i = 0; i < arr.length; i++) {
        hex += chars[arr[i] >> 4] + chars[arr[i] & 0x0f];
      }
    } else {
      for (let i = 0; i < 32; i++) {
        hex += chars[Math.floor(Math.random() * 16)];
      }
    }
    return prefix + '_' + hex;
  }

  function deterministicToken(index, teamId) {
    let hash = 0x811c9dc5;
    const str = `meodl_official_2026_${teamId}_student_${index}_secure`;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    const hex1 = ('00000000' + hash.toString(16)).slice(-8);
    const hex2 = ('00000000' + (hash ^ 0x5a5a5a5a).toString(16)).slice(-8);
    const hex3 = ('00000000' + (hash ^ 0xa5a5a5a5).toString(16)).slice(-8);
    const hex4 = ('00000000' + (hash ^ 0x3c3c3c3c).toString(16)).slice(-8);
    return `tok_${hex1}${hex2}${hex3}${hex4}`;
  }

  function generateUUID() {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      try { return window.crypto.randomUUID(); } catch (e) {}
    }
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);
  }

  // -------------------------------------------------------------------------
  // 2. INDEXEDDB PERSISTENCE LAYER (OFFLINE EVENT STORE & OUTBOX)
  // -------------------------------------------------------------------------
  class AttendanceIndexedDB {
    constructor() {
      this.db = null;
      this.readyPromise = this.init();
    }

    init() {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return Promise.resolve(null);
      }

      return new Promise((resolve) => {
        try {
          const req = window.indexedDB.open(DB_NAME, DB_VERSION);
          req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('attendanceEvents')) {
              const evStore = db.createObjectStore('attendanceEvents', { keyPath: 'eventId' });
              evStore.createIndex('studentId', 'studentId', { unique: false });
              evStore.createIndex('occurredAt', 'occurredAt', { unique: false });
              evStore.createIndex('synced', 'synced', { unique: false });
            }
            if (!db.objectStoreNames.contains('syncQueue')) {
              db.createObjectStore('syncQueue', { keyPath: 'eventId' });
            }
            if (!db.objectStoreNames.contains('attendanceSnapshot')) {
              db.createObjectStore('attendanceSnapshot', { keyPath: 'key' });
            }
            if (!db.objectStoreNames.contains('deviceConfig')) {
              db.createObjectStore('deviceConfig', { keyPath: 'key' });
            }
          };
          req.onsuccess = (e) => {
            this.db = e.target.result;
            resolve(this.db);
          };
          req.onerror = (e) => {
            console.warn('[AttendanceDB] Open error, falling back to localStorage:', e);
            resolve(null);
          };
        } catch (err) {
          console.warn('[AttendanceDB] Init exception:', err);
          resolve(null);
        }
      });
    }

    async saveEvent(event) {
      await this.readyPromise;
      if (!this.db) {
        this.saveEventToLocalStorage(event);
        return;
      }
      return new Promise((resolve, reject) => {
        try {
          const tx = this.db.transaction(['attendanceEvents', 'syncQueue'], 'readwrite');
          tx.objectStore('attendanceEvents').put(event);
          if (!event.synced) {
            tx.objectStore('syncQueue').put(event);
          }
          tx.oncomplete = () => resolve();
          tx.onerror = (err) => reject(err);
        } catch (e) {
          this.saveEventToLocalStorage(event);
          resolve();
        }
      });
    }

    async getPendingQueue() {
      await this.readyPromise;
      if (!this.db) {
        return this.getQueueFromLocalStorage();
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(['syncQueue'], 'readonly');
          const store = tx.objectStore('syncQueue');
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve(this.getQueueFromLocalStorage());
        } catch (e) {
          resolve(this.getQueueFromLocalStorage());
        }
      });
    }

    async markEventsSynced(eventIds) {
      await this.readyPromise;
      if (!eventIds || !eventIds.length) return;
      const idSet = new Set(eventIds);

      if (!this.db) {
        let q = this.getQueueFromLocalStorage();
        q = q.filter(e => !idSet.has(e.eventId));
        this.saveQueueToLocalStorage(q);
        return;
      }

      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(['attendanceEvents', 'syncQueue'], 'readwrite');
          const qStore = tx.objectStore('syncQueue');
          const evStore = tx.objectStore('attendanceEvents');

          eventIds.forEach(id => {
            qStore.delete(id);
            const getReq = evStore.get(id);
            getReq.onsuccess = () => {
              const ev = getReq.result;
              if (ev) {
                ev.synced = true;
                evStore.put(ev);
              }
            };
          });

          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch (e) {
          resolve();
        }
      });
    }

    async enqueuePending(event) {
      await this.readyPromise;
      if (!this.db) {
        let q = this.getQueueFromLocalStorage();
        if (!q.some(e => e.eventId === event.eventId)) {
          q.push(event);
          this.saveQueueToLocalStorage(q);
        }
        return;
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(['syncQueue'], 'readwrite');
          tx.objectStore('syncQueue').put(event);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch (e) {
          resolve();
        }
      });
    }

    async getAllEvents() {
      await this.readyPromise;
      if (!this.db) {
        return this.getAllEventsFromLocalStorage();
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(['attendanceEvents'], 'readonly');
          const req = tx.objectStore('attendanceEvents').getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve(this.getAllEventsFromLocalStorage());
        } catch (e) {
          resolve(this.getAllEventsFromLocalStorage());
        }
      });
    }

    // LocalStorage Fallbacks
    saveEventToLocalStorage(event) {
      try {
        const events = this.getAllEventsFromLocalStorage();
        events.push(event);
        localStorage.setItem('MEODL_EVENTS_FALLBACK_V1', JSON.stringify(events.slice(-500)));
        if (!event.synced) {
          const q = this.getQueueFromLocalStorage();
          q.push(event);
          this.saveQueueToLocalStorage(q);
        }
      } catch (e) {}
    }

    async deleteEvent(eventId) {
      await this.readyPromise;
      if (!this.db) {
        let events = this.getAllEventsFromLocalStorage();
        events = events.filter(e => e.eventId !== eventId);
        localStorage.setItem('MEODL_EVENTS_FALLBACK_V1', JSON.stringify(events));
        let q = this.getQueueFromLocalStorage();
        q = q.filter(e => e.eventId !== eventId);
        this.saveQueueToLocalStorage(q);
        return;
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(['attendanceEvents', 'syncQueue'], 'readwrite');
          tx.objectStore('attendanceEvents').delete(eventId);
          tx.objectStore('syncQueue').delete(eventId);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch (e) {
          resolve();
        }
      });
    }

    async deleteEventsForStudent(studentId) {
      await this.readyPromise;
      if (!this.db) {
        let events = this.getAllEventsFromLocalStorage();
        events = events.filter(e => e.studentId !== studentId);
        localStorage.setItem('MEODL_EVENTS_FALLBACK_V1', JSON.stringify(events));
        let q = this.getQueueFromLocalStorage();
        q = q.filter(e => e.studentId !== studentId);
        this.saveQueueToLocalStorage(q);
        return;
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(['attendanceEvents', 'syncQueue'], 'readwrite');
          const evStore = tx.objectStore('attendanceEvents');
          const qStore = tx.objectStore('syncQueue');
          const req = evStore.getAll();
          req.onsuccess = () => {
            const list = req.result || [];
            list.filter(e => e.studentId === studentId).forEach(e => {
              evStore.delete(e.eventId);
              qStore.delete(e.eventId);
            });
          };
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch (e) {
          resolve();
        }
      });
    }

    async clearAll() {
      await this.readyPromise;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('MEODL_EVENTS_FALLBACK_V1');
          localStorage.removeItem('MEODL_QUEUE_FALLBACK_V1');
        }
      } catch (e) {}

      if (!this.db) return;
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(['attendanceEvents', 'syncQueue', 'attendanceSnapshot'], 'readwrite');
          tx.objectStore('attendanceEvents').clear();
          tx.objectStore('syncQueue').clear();
          tx.objectStore('attendanceSnapshot').clear();
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch (e) {
          resolve();
        }
      });
    }

    getAllEventsFromLocalStorage() {
      try {
        const raw = localStorage.getItem('MEODL_EVENTS_FALLBACK_V1');
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }

    getQueueFromLocalStorage() {
      try {
        const raw = localStorage.getItem('MEODL_QUEUE_FALLBACK_V1');
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }

    saveQueueToLocalStorage(q) {
      try {
        localStorage.setItem('MEODL_QUEUE_FALLBACK_V1', JSON.stringify(q));
      } catch (e) {}
    }
  }

  // -------------------------------------------------------------------------
  // 3. MAIN DISTRIBUTED ATTENDANCE ENGINE
  // -------------------------------------------------------------------------
  class MeodlAttendanceEngine {
    constructor() {
      this.db = new AttendanceIndexedDB();
      this.state = {
        students: {},
        auditLog: [],
        settings: {
          autoOverdueCheck: true,
          soundFx: true,
          defaultStaff: 'Gate Marshal'
        }
      };

      // Device & Session Identity
      this.deviceId = this.initDeviceId();
      this.marshalId = this.loadConfig('marshalId') || 'Gate Marshal';
      this.gateId = this.loadConfig('gateId') || 'Gate 1';
      this.sessionId = 'meodl_2026_session_' + new Date().toISOString().split('T')[0];
      this.localSequence = parseInt(this.loadConfig('localSequence') || '0', 10);
      this.serverUrl = this.loadConfig('serverUrl') || '';

      // Connectivity & Sync Status
      this.syncStatus = 'OFFLINE'; // 'LIVE_CONNECTED' | 'OFFLINE' | 'SYNCING' | 'SYNC_ERROR'
      this.pendingCount = 0;
      this.lastSyncTime = null;
      this.lastSyncError = null;
      this.isSyncing = false;
      this.retryDelay = 5000; // Exponential backoff base

      this.listeners = [];
      this.syncListeners = [];

      this.init();
      this.initSyncWorker();
      this.rehydrateFromEvents();
    }

    async rehydrateFromEvents() {
      try {
        const events = await this.db.getAllEvents();
        if (!events || !events.length) return;

        // Chronological replay ensures state is derived deterministically from the immutable event log
        events.sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

        let changed = false;
        events.forEach(ev => {
          if (!ev || !ev.studentId) return;
          const s = this.state.students[ev.studentId];
          if (!s) return;

          const timeStr = new Date(ev.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          if (!s.history) s.history = [];
          if (!s.history.some(h => h.eventId === ev.eventId)) {
            s.history.push({
              eventId: ev.eventId,
              action: ev.action,
              timestamp: ev.occurredAt,
              displayTime: timeStr,
              reason: ev.reason || null,
              expectedReturn: ev.expectedReturn || null,
              method: ev.method || 'qr_scan',
              performedBy: ev.marshalId || 'Marshal',
              deviceId: ev.deviceId || 'DEVICE'
            });
          }

          if (!this.state.auditLog) this.state.auditLog = [];
          if (!this.state.auditLog.some(l => l.eventId === ev.eventId)) {
            this.state.auditLog.push({
              id: 'log_' + ev.eventId,
              eventId: ev.eventId,
              studentId: s.id,
              studentName: s.name,
              studentCode: s.studentCode,
              team: s.team,
              action: ev.action,
              reason: ev.reason || null,
              expectedReturn: ev.expectedReturn || null,
              method: ev.method || 'qr_scan',
              performedBy: ev.marshalId || 'Marshal',
              timestamp: ev.occurredAt,
              displayTime: timeStr
            });
          }

          if (ev.action === 'check_in') {
            s.status = 'INSIDE';
            s.currentAction = 'check_in';
            s.lastCheckIn = ev.occurredAt;
            s.exitReason = null;
            s.expectedReturn = null;
            s.totalVisits = Math.max(s.totalVisits || 0, 1);
            changed = true;
          } else if (ev.action === 'check_out') {
            s.status = 'OUTSIDE';
            s.currentAction = 'check_out';
            s.lastCheckOut = ev.occurredAt;
            s.exitReason = ev.reason || null;
            s.expectedReturn = ev.expectedReturn || null;
            changed = true;
          } else if (ev.action === 'manual_override') {
            s.status = ev.newStatus || (ev.action === 'check_in' ? 'INSIDE' : 'OUTSIDE');
            s.currentAction = 'manual_override';
            if (s.status === 'INSIDE') {
              s.lastCheckIn = ev.occurredAt;
              s.exitReason = null;
              s.expectedReturn = null;
            } else {
              s.lastCheckOut = ev.occurredAt;
              s.exitReason = ev.reason || 'Manual override';
            }
            changed = true;
          }
        });

        if (this.state.auditLog && this.state.auditLog.length > 0) {
          this.state.auditLog.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }

        if (changed) {
          this.save();
          this.notify();
        }
      } catch (e) {
        console.warn('[AttendanceEngine] Failed to rehydrate from events:', e);
      }
    }

    async getStudentHistory(studentId) {
      const student = this.getStudentById(studentId);
      const allEvents = await this.db.getAllEvents();
      const studentEvents = (allEvents || []).filter(e => e.studentId === studentId);

      const map = new Map();
      if (student && Array.isArray(student.history)) {
        student.history.forEach(h => {
          const key = h.eventId || (h.timestamp + '_' + h.action);
          map.set(key, h);
        });
      }
      studentEvents.forEach(ev => {
        const timeStr = new Date(ev.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        map.set(ev.eventId, {
          eventId: ev.eventId,
          action: ev.action,
          timestamp: ev.occurredAt,
          displayTime: timeStr,
          reason: ev.reason || null,
          expectedReturn: ev.expectedReturn || null,
          method: ev.method || 'qr_scan',
          performedBy: ev.marshalId || 'Marshal',
          deviceId: ev.deviceId || 'DEVICE'
        });
      });

      const list = Array.from(map.values());
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return list;
    }

    async getFullAuditLog() {
      const allEvents = await this.db.getAllEvents();
      const map = new Map();
      if (Array.isArray(this.state.auditLog)) {
        this.state.auditLog.forEach(l => {
          const key = l.eventId || l.id;
          map.set(key, l);
        });
      }
      allEvents.forEach(ev => {
        const key = ev.eventId;
        if (!map.has(key)) {
          const timeStr = new Date(ev.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          map.set(key, {
            id: 'log_' + ev.eventId,
            eventId: ev.eventId,
            studentId: ev.studentId,
            studentName: ev.studentName,
            studentCode: ev.studentCode,
            team: ev.team,
            action: ev.action,
            reason: ev.reason || null,
            expectedReturn: ev.expectedReturn || null,
            method: ev.method || 'qr_scan',
            performedBy: ev.marshalId || 'Marshal',
            timestamp: ev.occurredAt,
            displayTime: timeStr
          });
        }
      });
      const list = Array.from(map.values());
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return list;
    }

    getApiUrl(endpoint) {
      let base = (this.serverUrl || '').trim();
      if (base.endsWith('/')) base = base.slice(0, -1);
      return base ? `${base}${endpoint}` : endpoint;
    }

    initDeviceId() {
      try {
        if (typeof localStorage !== 'undefined') {
          let id = localStorage.getItem('MEODL_DEVICE_ID');
          if (!id) {
            id = 'MARSHAL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            localStorage.setItem('MEODL_DEVICE_ID', id);
          }
          return id;
        }
      } catch (e) {}
      return 'MARSHAL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    loadConfig(key) {
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            return parsed[key] || null;
          }
        }
      } catch (e) {}
      return null;
    }

    saveConfig(key, value) {
      try {
        if (typeof localStorage !== 'undefined') {
          let conf = {};
          const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
          if (raw) conf = JSON.parse(raw);
          conf[key] = value;
          localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(conf));
        }
      } catch (e) {}
    }

    setDeviceSettings({ deviceId, marshalId, gateId, serverUrl }) {
      if (deviceId) {
        this.deviceId = deviceId.trim().toUpperCase();
        try { localStorage.setItem('MEODL_DEVICE_ID', this.deviceId); } catch (e) {}
      }
      if (marshalId !== undefined) {
        this.marshalId = marshalId.trim();
        this.saveConfig('marshalId', this.marshalId);
      }
      if (gateId !== undefined) {
        this.gateId = gateId.trim();
        this.saveConfig('gateId', this.gateId);
      }
      if (serverUrl !== undefined) {
        this.serverUrl = serverUrl.trim();
        this.saveConfig('serverUrl', this.serverUrl);
      }
      this.notifySyncStatus();
    }

    init() {
      try {
        if (typeof localStorage !== 'undefined') {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.students && Object.keys(parsed.students).length > 0) {
              this.state = parsed;
              this.reconcileRoster();
              this.updatePendingCount();
              return;
            }
          }
        }
      } catch (e) {
        console.warn('Attendance load error:', e);
      }
      this.initDefaultRoster();
      this.updatePendingCount();
    }

    initDefaultRoster() {
      const data = (typeof window !== 'undefined' && window.MEODL_DATA) ? window.MEODL_DATA : {};
      const teams = data.teams || [
        { id: 'rankine', name: 'TEAM RANKINE' },
        { id: 'otto', name: 'TEAM OTTO' },
        { id: 'brayton', name: 'TEAM BRAYTON' },
        { id: 'diesel', name: 'TEAM DIESEL' }
      ];
      const rosters = data.rosters || {};

      const students = {};
      let studentIndex = 1;

      teams.forEach(team => {
        const members = rosters[team.id.toUpperCase()] || [];
        members.forEach(name => {
          const code = 'MEODL-' + String(studentIndex).padStart(4, '0');
          const id = 'student-' + String(studentIndex).padStart(4, '0');
          const token = deterministicToken(studentIndex, team.id);

          students[id] = {
            id: id,
            name: name,
            team: team.id,
            teamName: team.name,
            studentCode: code,
            activeToken: token,
            revokedTokens: [],
            status: 'OUTSIDE',
            currentAction: null,
            lastCheckIn: null,
            lastCheckOut: null,
            exitReason: null,
            expectedReturn: null,
            totalVisits: 0,
            totalMinutesInside: 0,
            history: []
          };
          studentIndex++;
        });
      });

      this.state.students = students;
      this.state.auditLog = [];
      this.save();
    }

    reconcileRoster() {
      const data = typeof window !== 'undefined' ? window.MEODL_DATA : null;
      if (!data || !data.rosters) return;

      const teams = data.teams || [];
      const rosters = data.rosters || {};
      let studentIndex = 1;
      let changed = false;

      teams.forEach(team => {
        const members = rosters[team.id.toUpperCase()] || [];
        members.forEach(name => {
          const id = 'student-' + String(studentIndex).padStart(4, '0');
          if (!this.state.students[id]) {
            const code = 'MEODL-' + String(studentIndex).padStart(4, '0');
            const token = deterministicToken(studentIndex, team.id);
            this.state.students[id] = {
              id: id,
              name: name,
              team: team.id,
              teamName: team.name,
              studentCode: code,
              activeToken: token,
              revokedTokens: [],
              status: 'OUTSIDE',
              currentAction: null,
              lastCheckIn: null,
              lastCheckOut: null,
              exitReason: null,
              expectedReturn: null,
              totalVisits: 0,
              totalMinutesInside: 0,
              history: []
            };
            changed = true;
          }
          studentIndex++;
        });
      });

      if (changed) this.save();
    }

    save() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        }
      } catch (e) {
        console.error('Failed to save attendance state:', e);
      }
      this.notify();
    }

    subscribe(fn) {
      this.listeners.push(fn);
      return () => {
        this.listeners = this.listeners.filter(l => l !== fn);
      };
    }

    notify() {
      this.listeners.forEach(fn => {
        try { fn(this.state); } catch (e) { console.error('Listener err:', e); }
      });
    }

    subscribeSyncStatus(fn) {
      this.syncListeners.push(fn);
      try { fn(this.getSyncState()); } catch (e) {}
      return () => {
        this.syncListeners = this.syncListeners.filter(l => l !== fn);
      };
    }

    notifySyncStatus() {
      const current = this.getSyncState();
      this.syncListeners.forEach(fn => {
        try { fn(current); } catch (e) { console.error('Sync listener err:', e); }
      });
    }

    getSyncState() {
      return {
        status: this.syncStatus,
        pendingCount: this.pendingCount,
        lastSyncTime: this.lastSyncTime,
        lastSyncError: this.lastSyncError,
        deviceId: this.deviceId,
        marshalId: this.marshalId,
        gateId: this.gateId,
        serverUrl: this.serverUrl
      };
    }

    async updatePendingCount() {
      try {
        const queue = await this.db.getPendingQueue();
        this.pendingCount = queue.length;
        if (this.syncStatus !== 'SYNCING') {
          if (this.pendingCount > 0 && this.syncStatus === 'LIVE_CONNECTED') {
            this.syncStatus = 'SYNCING';
          }
        }
        this.notifySyncStatus();
      } catch (e) {}
    }

    getStudents() {
      return Object.values(this.state.students);
    }

    getStudentById(id) {
      return this.state.students[id] || null;
    }

    getStudentByCode(code) {
      if (!code) return null;
      const clean = String(code).trim().toUpperCase();
      return Object.values(this.state.students).find(s => s.studentCode.toUpperCase() === clean) || null;
    }

    getStudentByToken(token) {
      if (!token) return null;
      const clean = String(token).trim();
      return Object.values(this.state.students).find(s => s.activeToken === clean) || null;
    }

    resolveScanPayload(payload) {
      if (!payload) {
        return { error: 'EMPTY_PAYLOAD', message: 'No QR data received.' };
      }

      let raw = String(payload).trim();
      let token = raw;
      let code = null;

      if (raw.includes('token=')) {
        try {
          const url = new URL(raw, 'https://meodl.uphsd');
          token = url.searchParams.get('token') || raw;
          code = url.searchParams.get('code');
        } catch (e) {
          const match = raw.match(/token=([a-zA-Z0-9_-]+)/);
          if (match) token = match[1];
        }
      } else if (raw.startsWith('MEODL-') || raw.startsWith('meodl-')) {
        code = raw.toUpperCase();
      }

      const revokedMatch = Object.values(this.state.students).find(s => (s.revokedTokens || []).includes(token));
      if (revokedMatch) {
        return {
          error: 'REVOKED',
          student: revokedMatch,
          message: `❌ QR CODE REVOKED\nThis card was replaced. Please present the current active QR code.`
        };
      }

      let student = Object.values(this.state.students).find(s => s.activeToken === token);
      if (!student && code) {
        student = this.getStudentByCode(code);
      }

      if (!student) {
        return {
          error: 'NOT_FOUND',
          message: '❌ QR NOT REGISTERED\nThis QR code is not associated with any registered MEODL participant.'
        };
      }

      return {
        success: true,
        student: student,
        isOverdue: this.isOverdue(student)
      };
    }

    // -------------------------------------------------------------------------
    // 4. EVENT CREATION & IMMEDIATE LOCAL COMMIT (ZERO LATENCY)
    // -------------------------------------------------------------------------
    createAttendanceEvent(student, action, options = {}) {
      const now = new Date();
      this.localSequence++;
      this.saveConfig('localSequence', this.localSequence);

      return {
        eventId: generateUUID(),
        studentId: student.id,
        studentCode: student.studentCode,
        studentName: student.name,
        team: student.team,
        action: action, // 'check_in' | 'check_out' | 'manual_override'
        occurredAt: now.toISOString(),
        createdAt: now.toISOString(),
        deviceId: this.deviceId,
        marshalId: options.performedBy || this.marshalId || 'Gate Marshal',
        gateId: options.gateId || this.gateId || 'Main Gate',
        sessionId: this.sessionId,
        localSequence: this.localSequence,
        reason: options.reason || null,
        expectedReturn: options.expectedReturn || null,
        method: options.method || 'qr_scan',
        newStatus: options.newStatus || null,
        synced: false
      };
    }

    recordCheckIn(studentId, options = {}) {
      const student = this.state.students[studentId];
      if (!student) return { error: 'Student not found' };

      const event = this.createAttendanceEvent(student, 'check_in', options);

      const now = new Date(event.occurredAt);
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const isoStr = event.occurredAt;
      const staff = event.marshalId;
      const method = event.method;

      student.status = 'INSIDE';
      student.lastCheckIn = isoStr;
      student.exitReason = null;
      student.expectedReturn = null;
      student.totalVisits = (student.totalVisits || 0) + 1;

      const historyEntry = {
        eventId: event.eventId,
        action: 'check_in',
        timestamp: isoStr,
        displayTime: timeStr,
        method: method,
        performedBy: staff,
        deviceId: this.deviceId
      };
      if (!student.history) student.history = [];
      student.history.push(historyEntry);

      this.logAudit({
        eventId: event.eventId,
        studentId: student.id,
        studentName: student.name,
        studentCode: student.studentCode,
        team: student.team,
        action: 'check_in',
        method: method,
        performedBy: staff,
        timestamp: isoStr,
        displayTime: timeStr
      });

      // Synchronous Local Commit (0ms latency for user)
      this.save();

      // Asynchronous Persistent Queue (Non-blocking)
      this.db.saveEvent(event).then(() => {
        this.updatePendingCount();
        this.syncPendingEvents();
      });

      return { success: true, student, event };
    }

    recordCheckOut(studentId, options = {}) {
      const student = this.state.students[studentId];
      if (!student) return { error: 'Student not found' };

      const event = this.createAttendanceEvent(student, 'check_out', options);

      const now = new Date(event.occurredAt);
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const isoStr = event.occurredAt;
      const staff = event.marshalId;
      const method = event.method;
      const reason = event.reason || 'Not specified';
      const expectedReturn = event.expectedReturn;

      if (student.lastCheckIn) {
        const diffMs = now - new Date(student.lastCheckIn);
        const mins = Math.max(1, Math.round(diffMs / 60000));
        student.totalMinutesInside = (student.totalMinutesInside || 0) + mins;
      }

      student.status = 'OUTSIDE';
      student.lastCheckOut = isoStr;
      student.exitReason = reason;
      student.expectedReturn = expectedReturn;

      const historyEntry = {
        eventId: event.eventId,
        action: 'check_out',
        timestamp: isoStr,
        displayTime: timeStr,
        reason: reason,
        expectedReturn: expectedReturn,
        method: method,
        performedBy: staff,
        deviceId: this.deviceId
      };
      if (!student.history) student.history = [];
      student.history.push(historyEntry);

      this.logAudit({
        eventId: event.eventId,
        studentId: student.id,
        studentName: student.name,
        studentCode: student.studentCode,
        team: student.team,
        action: 'check_out',
        reason: reason,
        expectedReturn: expectedReturn,
        method: method,
        performedBy: staff,
        timestamp: isoStr,
        displayTime: timeStr
      });

      // Synchronous Local Commit (0ms latency for user)
      this.save();

      // Asynchronous Persistent Queue (Non-blocking)
      this.db.saveEvent(event).then(() => {
        this.updatePendingCount();
        this.syncPendingEvents();
      });

      return { success: true, student, event };
    }

    manualOverride(studentId, newStatus, reason = 'Administrative adjustment', performedBy = 'Lead Organizer') {
      const student = this.state.students[studentId];
      if (!student) return { error: 'Student not found' };

      const event = this.createAttendanceEvent(student, 'manual_override', {
        newStatus: newStatus,
        reason: reason,
        performedBy: performedBy,
        method: 'manual'
      });

      const now = new Date(event.occurredAt);
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const isoStr = event.occurredAt;

      student.status = newStatus;
      if (newStatus === 'INSIDE') {
        student.lastCheckIn = isoStr;
        student.exitReason = null;
        student.expectedReturn = null;
      } else if (newStatus === 'OUTSIDE') {
        student.lastCheckOut = isoStr;
        student.exitReason = reason;
      }

      if (!student.history) student.history = [];
      student.history.push({
        eventId: event.eventId,
        action: 'manual_override',
        status: newStatus,
        reason: reason,
        performedBy: performedBy,
        timestamp: isoStr,
        displayTime: timeStr,
        method: 'manual',
        deviceId: this.deviceId
      });

      this.logAudit({
        eventId: event.eventId,
        studentId: student.id,
        studentName: student.name,
        studentCode: student.studentCode,
        team: student.team,
        action: 'manual_override',
        newStatus: newStatus,
        reason: reason,
        method: 'manual',
        performedBy: performedBy,
        timestamp: isoStr,
        displayTime: timeStr
      });

      // Synchronous Local Commit
      this.save();

      // Asynchronous Persistent Queue
      this.db.saveEvent(event).then(() => {
        this.updatePendingCount();
        this.syncPendingEvents();
      });

      return { success: true, student, event };
    }

    regenerateQR(studentId, performedBy = 'Admin') {
      const student = this.state.students[studentId];
      if (!student) return { error: 'Student not found' };

      const oldToken = student.activeToken;
      if (!student.revokedTokens) student.revokedTokens = [];
      student.revokedTokens.push(oldToken);

      const newToken = generateSecureToken('tok_reg');
      student.activeToken = newToken;

      const now = new Date();
      const isoStr = now.toISOString();

      if (!student.history) student.history = [];
      student.history.push({
        action: 'qr_replacement',
        oldTokenPrefix: oldToken.substring(0, 10) + '...',
        newTokenPrefix: newToken.substring(0, 10) + '...',
        performedBy: performedBy,
        timestamp: isoStr
      });

      this.logAudit({
        studentId: student.id,
        studentName: student.name,
        studentCode: student.studentCode,
        team: student.team,
        action: 'qr_replacement',
        method: 'admin',
        performedBy: performedBy,
        timestamp: isoStr,
        displayTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      this.save();
      return { success: true, student, newToken };
    }

    async clearStudentAttendance(studentId, options = {}) {
      const student = this.state.students[studentId];
      if (!student) return { error: 'Student not found' };

      // 1. Remove events from IndexedDB
      await this.db.deleteEventsForStudent(studentId);

      // 2. Reset student state to pristine OUTSIDE
      student.status = 'OUTSIDE';
      student.currentAction = null;
      student.lastCheckIn = null;
      student.lastCheckOut = null;
      student.exitReason = null;
      student.expectedReturn = null;
      student.totalVisits = 0;
      student.totalMinutesInside = 0;
      student.history = [];
      student.updatedAt = new Date().toISOString();

      // 3. Remove audit logs for this student
      if (Array.isArray(this.state.auditLog)) {
        this.state.auditLog = this.state.auditLog.filter(l => l.studentId !== studentId);
      }

      this.save();
      this.updatePendingCount();

      // 4. If server reachable, inform server
      try {
        await fetch(this.getApiUrl('/api/attendance/reset'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId })
        });
      } catch (e) {}

      return { success: true, student };
    }

    async removeAttendanceEvent(eventId) {
      if (!eventId) return { error: 'Missing eventId' };

      // Find student associated with event
      let targetStudentId = null;
      Object.values(this.state.students).forEach(s => {
        if (s.history && s.history.some(h => h.eventId === eventId)) {
          targetStudentId = s.id;
        }
      });

      if (!targetStudentId) {
        const allEv = await this.db.getAllEvents();
        const ev = allEv.find(e => e.eventId === eventId);
        if (ev) targetStudentId = ev.studentId;
      }

      // 1. Delete from IndexedDB
      await this.db.deleteEvent(eventId);

      // 2. Remove from auditLog
      if (Array.isArray(this.state.auditLog)) {
        this.state.auditLog = this.state.auditLog.filter(l => l.eventId !== eventId);
      }

      // 3. If student found, re-derive their state from remaining events
      if (targetStudentId && this.state.students[targetStudentId]) {
        const student = this.state.students[targetStudentId];
        if (Array.isArray(student.history)) {
          student.history = student.history.filter(h => h.eventId !== eventId);
        }

        const remainingEvents = await this.db.getAllEvents();
        const studentEvents = remainingEvents.filter(e => e.studentId === targetStudentId);
        studentEvents.sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

        // Reset to initial
        student.status = 'OUTSIDE';
        student.currentAction = null;
        student.lastCheckIn = null;
        student.lastCheckOut = null;
        student.exitReason = null;
        student.expectedReturn = null;
        student.totalVisits = 0;
        student.totalMinutesInside = 0;

        // Replay remaining events
        studentEvents.forEach(ev => {
          if (ev.action === 'check_in') {
            student.status = 'INSIDE';
            student.currentAction = 'check_in';
            student.lastCheckIn = ev.occurredAt;
            student.exitReason = null;
            student.expectedReturn = null;
            student.totalVisits = Math.max(student.totalVisits || 0, 1);
          } else if (ev.action === 'check_out') {
            student.status = 'OUTSIDE';
            student.currentAction = 'check_out';
            student.lastCheckOut = ev.occurredAt;
            student.exitReason = ev.reason || null;
            student.expectedReturn = ev.expectedReturn || null;
          } else if (ev.action === 'manual_override') {
            student.status = ev.newStatus || 'OUTSIDE';
            student.currentAction = 'manual_override';
            if (student.status === 'INSIDE') {
              student.lastCheckIn = ev.occurredAt;
              student.exitReason = null;
              student.expectedReturn = null;
            } else {
              student.lastCheckOut = ev.occurredAt;
              student.exitReason = ev.reason || 'Manual override';
            }
          }
        });
        student.updatedAt = new Date().toISOString();
      }

      this.save();
      this.updatePendingCount();

      // 4. Notify server
      try {
        await fetch(this.getApiUrl('/api/attendance/reset'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId })
        });
      } catch (e) {}

      return { success: true };
    }

    async resetAllAttendance() {
      // 1. Clear IndexedDB
      await this.db.clearAll();

      // 2. Clear in-memory audit log and re-init roster
      this.state.auditLog = [];
      this.initDefaultRoster();
      this.pendingCount = 0;
      this.save();
      this.notifySyncStatus();

      // 3. Notify server
      try {
        await fetch(this.getApiUrl('/api/attendance/reset'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirmation: 'RESET_ATTENDANCE' })
        });
      } catch (e) {}

      return { success: true };
    }

    isOverdue(student) {
      if (!student || student.status !== 'OUTSIDE' || !student.expectedReturn) {
        return false;
      }
      const now = new Date();
      const ret = student.expectedReturn;

      if (/^\d{1,2}:\d{2}$/.test(ret)) {
        const [hours, minutes] = ret.split(':').map(Number);
        const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
        return now > target;
      }

      const parsed = new Date(ret);
      if (!isNaN(parsed.getTime())) {
        return now > parsed;
      }

      return false;
    }

    logAudit(entry) {
      if (!this.state.auditLog) this.state.auditLog = [];
      entry.id = 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      this.state.auditLog.unshift(entry);
      if (this.state.auditLog.length > 1000) {
        this.state.auditLog.pop();
      }
    }

    getAuditLog() {
      return this.state.auditLog || [];
    }

    getStats() {
      const all = Object.values(this.state.students);
      const total = all.length;
      let inside = 0;
      let outside = 0;
      let overdue = 0;

      const byTeam = {
        rankine: { name: 'TEAM RANKINE', total: 0, inside: 0, outside: 0, overdue: 0, hex: '#ef4444' },
        otto: { name: 'TEAM OTTO', total: 0, inside: 0, outside: 0, overdue: 0, hex: '#f59e0b' },
        brayton: { name: 'TEAM BRAYTON', total: 0, inside: 0, outside: 0, overdue: 0, hex: '#06b6d4' },
        diesel: { name: 'TEAM DIESEL', total: 0, inside: 0, outside: 0, overdue: 0, hex: '#10b981' }
      };

      all.forEach(s => {
        const t = byTeam[s.team] || byTeam['rankine'];
        t.total++;

        const isOver = this.isOverdue(s);
        if (isOver) {
          overdue++;
          t.overdue++;
        }

        if (s.status === 'INSIDE') {
          inside++;
          t.inside++;
        } else {
          outside++;
          t.outside++;
        }
      });

      return {
        total,
        inside,
        outside,
        overdue,
        byTeam
      };
    }

    getQRPayload(student) {
      if (!student) return '';
      return `${DOMAIN_BASE}?token=${student.activeToken}&code=${student.studentCode}`;
    }

    // -------------------------------------------------------------------------
    // 5. DISTRIBUTED SYNC WORKER & SERVER HEALTH DETECTION
    // -------------------------------------------------------------------------
    initSyncWorker() {
      if (typeof window === 'undefined') return;

      // Periodic Sync / Heartbeat (Every 10 seconds)
      setInterval(() => {
        this.syncPendingEvents();
      }, 10000);

      // Window connectivity events
      window.addEventListener('online', () => {
        console.log('[AttendanceSync] Network online event received. Draining queue.');
        this.retryDelay = 3000;
        this.syncPendingEvents();
      });

      window.addEventListener('offline', () => {
        this.syncStatus = 'OFFLINE';
        this.notifySyncStatus();
      });

      // App focus / visibility resumption
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            this.syncPendingEvents();
          }
        });
      }
      window.addEventListener('focus', () => {
        this.syncPendingEvents();
      });

      // Initial sync run on load
      setTimeout(() => {
        this.syncPendingEvents();
      }, 1000);
    }

    async checkServerHealth() {
      try {
        const ctrl = new AbortController();
        const timeoutId = setTimeout(() => ctrl.abort(), 3500);
        const res = await fetch(this.getApiUrl('/api/attendance/health'), {
          method: 'GET',
          cache: 'no-store',
          signal: ctrl.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.ok) {
            // Auto-heal cold-booted or restarted server if it has fewer events than our local ledger
            if (typeof data.eventsCount === 'number') {
              const allLocalEvents = await this.db.getAllEvents();
              if (allLocalEvents && allLocalEvents.length > data.eventsCount) {
                console.log(`[AttendanceSync] Server appears cold-booted (${data.eventsCount} vs local ${allLocalEvents.length} events). Auto-healing server from local IndexedDB.`);
                for (const ev of allLocalEvents) {
                  await this.db.enqueuePending(ev);
                }
                const q = await this.db.getPendingQueue();
                this.pendingCount = q.length;
              }
            }
            return true;
          }
        }
      } catch (err) {
        // Network failure or timeout
      }
      return false;
    }

    async syncNow() {
      this.retryDelay = 2000;
      return this.syncPendingEvents(true);
    }

    async syncPendingEvents(isManual = false) {
      if (this.isSyncing) return;
      this.isSyncing = true;

      try {
        const queue = await this.db.getPendingQueue();
        this.pendingCount = queue.length;

        // Check actual server availability
        const isHealthy = await this.checkServerHealth();
        if (!isHealthy) {
          this.syncStatus = 'OFFLINE';
          this.notifySyncStatus();
          this.isSyncing = false;
          return;
        }

        // If no events pending, reconcile with authoritative server state
        if (queue.length === 0) {
          this.syncStatus = 'LIVE_CONNECTED';
          this.lastSyncError = null;
          await this.reconcileServerState();
          this.notifySyncStatus();
          this.isSyncing = false;
          return;
        }

        // Flush pending events in batches of 50
        this.syncStatus = 'SYNCING';
        this.notifySyncStatus();

        const batch = queue.slice(0, 50);
        const payload = {
          deviceId: this.deviceId,
          marshalId: this.marshalId,
          gateId: this.gateId,
          events: batch
        };

        const res = await fetch(this.getApiUrl('/api/attendance/sync'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }

        const data = await res.json();
        const accepted = data.accepted || [];
        const duplicate = data.duplicate || [];
        const processedIds = [...accepted, ...duplicate];

        if (processedIds.length > 0) {
          await this.db.markEventsSynced(processedIds);
          this.lastSyncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          this.lastSyncError = null;
          this.retryDelay = 5000;
        }

        const remainingQueue = await this.db.getPendingQueue();
        this.pendingCount = remainingQueue.length;

        if (this.pendingCount === 0) {
          this.syncStatus = 'LIVE_CONNECTED';
          await this.reconcileServerState();
        } else {
          // If more remain, continue draining
          this.isSyncing = false;
          return this.syncPendingEvents();
        }

        this.notifySyncStatus();
      } catch (err) {
        this.lastSyncError = err.message || 'Sync failed';
        this.syncStatus = 'OFFLINE';
        this.notifySyncStatus();
      } finally {
        this.isSyncing = false;
      }
    }

    async reconcileServerState() {
      try {
        const res = await fetch(this.getApiUrl('/api/attendance/state'), { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !data.students) return;

        // Check if there are any pending local events currently unsynced
        const queue = await this.db.getPendingQueue();
        const pendingStudentIds = new Set(queue.map(e => e.studentId));

        let changed = false;
        Object.entries(data.students).forEach(([stId, serverStudent]) => {
          // Do not overwrite students who have pending unsynced actions on THIS device
          if (pendingStudentIds.has(stId)) return;

          const local = this.state.students[stId];
          if (!local) {
            this.state.students[stId] = serverStudent;
            changed = true;
            return;
          }

          // Compute latest activity timestamp
          const localLatest = Math.max(
            local.lastCheckIn ? new Date(local.lastCheckIn).getTime() : 0,
            local.lastCheckOut ? new Date(local.lastCheckOut).getTime() : 0,
            local.updatedAt ? new Date(local.updatedAt).getTime() : 0
          );
          const serverLatest = Math.max(
            serverStudent.lastCheckIn ? new Date(serverStudent.lastCheckIn).getTime() : 0,
            serverStudent.lastCheckOut ? new Date(serverStudent.lastCheckOut).getTime() : 0,
            serverStudent.updatedAt ? new Date(serverStudent.updatedAt).getTime() : 0
          );

          // Crucial: Only accept server record if it contains strictly newer activity than local.
          // This guarantees that a cold-booted, empty, or restarted server will NEVER wipe local check-ins!
          if (serverLatest > localLatest && serverLatest > 0) {
            this.state.students[stId] = {
              ...local,
              ...serverStudent
            };
            changed = true;
          }
        });

        if (changed) {
          this.save();
        }
      } catch (e) {
        console.warn('[AttendanceSync] Reconcile error:', e);
      }
    }

    // -------------------------------------------------------------------------
    // 6. EMERGENCY EXPORT & IMPORT / MERGE
    // -------------------------------------------------------------------------
    async exportAttendanceEventsJSON() {
      const allEvents = await this.db.getAllEvents();
      const exportData = {
        app: 'MEODL_TOURNAMENT_HUB',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        deviceId: this.deviceId,
        marshalId: this.marshalId,
        gateId: this.gateId,
        eventsCount: allEvents.length,
        events: allEvents
      };

      const dateStr = new Date().toISOString().split('T')[0];
      const jsonStr = JSON.stringify(exportData, null, 2);
      this.downloadFile(`MEODL_Offline_Scans_${this.deviceId}_${dateStr}.json`, jsonStr, 'application/json');
    }

    async exportAttendanceEventsCSV() {
      const allEvents = await this.db.getAllEvents();
      const headers = [
        'Event ID',
        'Student ID',
        'Student Code',
        'Student Name',
        'Team',
        'Action',
        'Occurred At',
        'Device ID',
        'Marshal ID',
        'Gate ID',
        'Session ID',
        'Local Sequence',
        'Created At',
        'Synced',
        'Reason',
        'Expected Return',
        'Method'
      ];

      const rows = allEvents.map(e => [
        `"${e.eventId}"`,
        `"${e.studentId}"`,
        `"${e.studentCode || ''}"`,
        `"${(e.studentName || '').replace(/"/g, '""')}"`,
        `"${e.team || ''}"`,
        `"${e.action}"`,
        `"${e.occurredAt}"`,
        `"${e.deviceId || ''}"`,
        `"${e.marshalId || ''}"`,
        `"${e.gateId || ''}"`,
        `"${e.sessionId || ''}"`,
        e.localSequence || 0,
        `"${e.createdAt || ''}"`,
        e.synced ? 'YES' : 'NO',
        `"${(e.reason || '').replace(/"/g, '""')}"`,
        `"${e.expectedReturn || ''}"`,
        `"${e.method || ''}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const dateStr = new Date().toISOString().split('T')[0];
      this.downloadFile(`MEODL_Offline_Scans_${this.deviceId}_${dateStr}.csv`, csvContent, 'text/csv;charset=utf-8;');
    }

    async importAttendanceEvents(content) {
      if (!content) return { error: 'Empty file' };
      let events = [];

      try {
        if (typeof content === 'string' && content.trim().startsWith('{')) {
          const parsed = JSON.parse(content);
          events = Array.isArray(parsed.events) ? parsed.events : [];
        } else if (Array.isArray(content)) {
          events = content;
        } else if (typeof content === 'string') {
          // Parse CSV
          const lines = content.trim().split(/\r?\n/);
          if (lines.length > 1) {
            for (let i = 1; i < lines.length; i++) {
              const parts = lines[i].split(',').map(s => s.replace(/^"|"$/g, '').trim());
              if (parts.length >= 7) {
                events.push({
                  eventId: parts[0],
                  studentId: parts[1],
                  studentCode: parts[2],
                  studentName: parts[3],
                  team: parts[4],
                  action: parts[5],
                  occurredAt: parts[6],
                  deviceId: parts[7] || 'IMPORTED_DEV',
                  marshalId: parts[8] || 'Marshal',
                  gateId: parts[9] || 'Gate',
                  sessionId: parts[10] || 'imported',
                  localSequence: parseInt(parts[11] || '0', 10),
                  createdAt: parts[12] || parts[6],
                  reason: parts[14] || null,
                  expectedReturn: parts[15] || null,
                  method: parts[16] || 'imported',
                  synced: false
                });
              }
            }
          }
        }
      } catch (err) {
        return { error: 'Failed to parse file format: ' + err.message };
      }

      if (!events.length) return { imported: 0, message: 'No events found in file' };

      // Deduplicate against local events
      const existing = await this.db.getAllEvents();
      const existingMap = new Set(existing.map(e => e.eventId));
      let importedCount = 0;

      for (const ev of events) {
        if (!ev.eventId || !ev.studentId || !ev.action || !ev.occurredAt) continue;
        if (existingMap.has(ev.eventId)) continue;

        ev.synced = false;
        await this.db.saveEvent(ev);
        existingMap.add(ev.eventId);
        importedCount++;
      }

      await this.updatePendingCount();
      this.syncPendingEvents();

      return {
        imported: importedCount,
        totalInFile: events.length
      };
    }

    // -------------------------------------------------------------------------
    // 7. PRESERVED LEGACY EXPORTS
    // -------------------------------------------------------------------------
    exportAttendanceCSV() {
      const students = Object.values(this.state.students);
      const headers = [
        'Student Code',
        'Student Name',
        'Team',
        'Current Status',
        'First Check-In',
        'Last Check-In',
        'Last Check-Out',
        'Exit Reason',
        'Expected Return',
        'Is Overdue',
        'Total Visits',
        'Total Minutes Inside'
      ];

      const rows = students.map(s => [
        `"${s.studentCode}"`,
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.teamName || s.team}"`,
        `"${s.status}"`,
        `"${s.history?.find(h => h.action === 'check_in')?.timestamp || ''}"`,
        `"${s.lastCheckIn || ''}"`,
        `"${s.lastCheckOut || ''}"`,
        `"${(s.exitReason || '').replace(/"/g, '""')}"`,
        `"${s.expectedReturn || ''}"`,
        `"${this.isOverdue(s) ? 'YES' : 'NO'}"`,
        s.totalVisits || 0,
        s.totalMinutesInside || 0
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const dateStr = new Date().toISOString().split('T')[0];
      this.downloadFile(`MEODL_Attendance_${dateStr}.csv`, csvContent, 'text/csv;charset=utf-8;');
    }

    exportQRCodesCSV() {
      const students = Object.values(this.state.students);
      const headers = ['Student Code', 'Student Name', 'Team', 'Active Token', 'QR Payload URL'];
      const rows = students.map(s => [
        `"${s.studentCode}"`,
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.teamName || s.team}"`,
        `"${s.activeToken}"`,
        `"${this.getQRPayload(s)}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      this.downloadFile('MEODL_QR_CODES.csv', csvContent, 'text/csv;charset=utf-8;');
    }

    exportLogsCSV() {
      const logs = this.state.auditLog || [];
      const headers = ['Timestamp', 'Student Code', 'Student Name', 'Team', 'Action', 'Method', 'Performed By', 'Reason', 'Expected Return'];
      const rows = logs.map(l => [
        `"${l.timestamp}"`,
        `"${l.studentCode || ''}"`,
        `"${(l.studentName || '').replace(/"/g, '""')}"`,
        `"${l.team || ''}"`,
        `"${l.action}"`,
        `"${l.method || ''}"`,
        `"${(l.performedBy || '').replace(/"/g, '""')}"`,
        `"${(l.reason || '').replace(/"/g, '""')}"`,
        `"${l.expectedReturn || ''}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const dateStr = new Date().toISOString().split('T')[0];
      this.downloadFile(`MEODL_Attendance_Audit_Log_${dateStr}.csv`, csvContent, 'text/csv;charset=utf-8;');
    }

    downloadFile(filename, content, type) {
      if (typeof window === 'undefined' || !window.document) return;
      const blob = new Blob([content], { type: type });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }

    resetAttendance(confirmation) {
      if (confirmation !== 'RESET_ATTENDANCE') return false;
      Object.values(this.state.students).forEach(s => {
        s.status = 'OUTSIDE';
        s.lastCheckIn = null;
        s.lastCheckOut = null;
        s.exitReason = null;
        s.expectedReturn = null;
        s.totalVisits = 0;
        s.totalMinutesInside = 0;
        s.history = [];
      });
      this.state.auditLog = [];
      this.save();
      // Also request server reset if online
      fetch(this.getApiUrl('/api/attendance/reset'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'RESET_ATTENDANCE' })
      }).catch(() => {});
      return true;
    }
  }

  // Expose singleton to window
  if (typeof window !== 'undefined') {
    window.MEODL_ATTENDANCE = new MeodlAttendanceEngine();
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = MeodlAttendanceEngine;
  }

})(typeof window !== 'undefined' ? window : this);
