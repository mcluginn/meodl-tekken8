/* =========================================================================
   ENGINEERING DAY 2026 — SPORTS ATTENDANCE SYSTEM
   Basketball (3 Games) & Volleyball (3 Games) Court Attendance Engine
   Architecture:
   - Per-Game Independent In & Out Tracking (BB1, BB2, BB3, VB1, VB2, VB3)
   - Real-Time QR Code Resolution with Existing Student Passes (MEODL-0001..0175)
   - Philippine Standard Time (Asia/Manila, UTC+8) Enforced Timestamps
   - Offline-First Distributed Synchronization & IndexedDB Persistence
   - Court Density & Multi-Device Marshal Reconciliation
   - CSV / Excel / JSON Export per Game or Entire Tournament
   ========================================================================= */

(function(window) {
  'use strict';

  const STORAGE_KEY = 'ENGDAY_ATTENDANCE_STATE_V1';
  const CONFIG_STORAGE_KEY = 'ENGDAY_ATTENDANCE_CONFIG_V1';
  const DB_NAME = 'ENGDAY_ATTENDANCE_DB_V1';
  const DB_VERSION = 1;
  const DOMAIN_BASE = 'https://meodl.uphsd/engday/attendance';

  // -------------------------------------------------------------------------
  // 1. AUTHORITATIVE GAMES SPECIFICATION
  // -------------------------------------------------------------------------
  const ENGDAY_GAMES = [
    {
      id: 'vb_g1',
      sport: 'volleyball',
      gameNum: 1,
      name: 'Mixed Volleyball Game 1',
      shortName: 'VB 1 (CPE/ECE vs ME)',
      tabName: 'VB 1: CPE/ECE vs ME',
      matchup: 'CPE/ECE vs. ME',
      opponent: 'CPE / ECE',
      court: 'Volleyball Court',
      timeSlot: '8:00 AM – 8:30 AM',
      coordinator: 'Princess Fhaye Colline Doroja',
      icon: '🏐',
      color: 'amber',
      accentHex: '#f59e0b',
      borderClass: 'border-amber-500/50',
      bgClass: 'bg-amber-950/40',
      badgeClass: 'bg-amber-950 text-amber-300 border-amber-800'
    },
    {
      id: 'vb_g3',
      sport: 'volleyball',
      gameNum: 3,
      name: 'Mixed Volleyball Game 3',
      shortName: 'VB 3 (EE vs ME)',
      tabName: 'VB 3: EE vs ME',
      matchup: 'EE vs. ME',
      opponent: 'EE (Electrical)',
      court: 'Volleyball Court',
      timeSlot: '9:00 AM – 9:30 AM',
      coordinator: 'Princess Fhaye Colline Doroja',
      icon: '🏐',
      color: 'orange',
      accentHex: '#f97316',
      borderClass: 'border-orange-500/50',
      bgClass: 'bg-orange-950/40',
      badgeClass: 'bg-orange-950 text-orange-300 border-orange-800'
    },
    {
      id: 'vb_g6',
      sport: 'volleyball',
      gameNum: 6,
      name: 'Mixed Volleyball Game 6',
      shortName: 'VB 6 (IE vs ME)',
      tabName: 'VB 6: IE vs ME',
      matchup: 'IE vs. ME',
      opponent: 'IE (Industrial)',
      court: 'Volleyball Court',
      timeSlot: '10:30 AM – 11:00 AM',
      coordinator: 'Princess Fhaye Colline Doroja',
      icon: '🏐',
      color: 'yellow',
      accentHex: '#eab308',
      borderClass: 'border-yellow-500/50',
      bgClass: 'bg-yellow-950/40',
      badgeClass: 'bg-yellow-950 text-yellow-300 border-yellow-800'
    },
    {
      id: 'vb_g8',
      sport: 'volleyball',
      gameNum: 8,
      name: 'Mixed Volleyball Game 8',
      shortName: 'VB 8 (CE vs ME)',
      tabName: 'VB 8: CE vs ME',
      matchup: 'CE vs. ME',
      opponent: 'CE (Civil)',
      court: 'Volleyball Court',
      timeSlot: '11:30 AM – 12:00 NN',
      coordinator: 'Princess Fhaye Colline Doroja',
      icon: '🏐',
      color: 'rose',
      accentHex: '#f43f5e',
      borderClass: 'border-rose-500/50',
      bgClass: 'bg-rose-950/40',
      badgeClass: 'bg-rose-950 text-rose-300 border-rose-800'
    },
    {
      id: 'bb_g1',
      sport: 'basketball',
      gameNum: 1,
      name: 'Men\'s Basketball Game 1',
      shortName: 'BB 1 (CE vs ME)',
      tabName: 'BB 1: CE vs ME',
      matchup: 'CE vs. ME',
      opponent: 'CE (Civil)',
      court: 'Basketball Court',
      timeSlot: '1:00 PM – 2:00 PM',
      coordinator: 'Kirstine Doll Ballesteros',
      icon: '🏀',
      color: 'cyan',
      accentHex: '#06b6d4',
      borderClass: 'border-cyan-500/50',
      bgClass: 'bg-cyan-950/40',
      badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-800'
    },
    {
      id: 'bb_g4',
      sport: 'basketball',
      gameNum: 4,
      name: 'Men\'s Basketball Game 4',
      shortName: 'BB 4 (ME vs EE)',
      tabName: 'BB 4: ME vs EE',
      matchup: 'ME vs. EE',
      opponent: 'EE (Electrical)',
      court: 'Basketball Court',
      timeSlot: '4:00 PM – 5:00 PM',
      coordinator: 'Kirstine Doll Ballesteros',
      icon: '🏀',
      color: 'sky',
      accentHex: '#0ea5e9',
      borderClass: 'border-sky-500/50',
      bgClass: 'bg-sky-950/40',
      badgeClass: 'bg-sky-950 text-sky-300 border-sky-800'
    },
    {
      id: 'bb_g6',
      sport: 'basketball',
      gameNum: 6,
      name: 'Men\'s Basketball Game 6',
      shortName: 'BB 6 (IE vs ME)',
      tabName: 'BB 6: IE vs ME',
      matchup: 'IE vs. ME',
      opponent: 'IE (Industrial)',
      court: 'Basketball Court',
      timeSlot: '6:00 PM – 7:00 PM',
      coordinator: 'Kirstine Doll Ballesteros',
      icon: '🏀',
      color: 'emerald',
      accentHex: '#10b981',
      borderClass: 'border-emerald-500/50',
      bgClass: 'bg-emerald-950/40',
      badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800'
    }
  ];

  // -------------------------------------------------------------------------
  // 2. PHILIPPINE TIME FORMATTING HELPERS (ASIA/MANILA)
  // -------------------------------------------------------------------------
  function formatManilaTime(dateOrIso, options = {}) {
    if (!dateOrIso) return '--:--';
    const d = (dateOrIso instanceof Date) ? dateOrIso : new Date(dateOrIso);
    if (isNaN(d.getTime())) return String(dateOrIso);
    try {
      return d.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        ...options
      });
    } catch (e) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true, ...options });
    }
  }

  function formatManilaDate(dateOrIso, options = {}) {
    if (!dateOrIso) return '';
    const d = (dateOrIso instanceof Date) ? dateOrIso : new Date(dateOrIso);
    if (isNaN(d.getTime())) return '';
    try {
      return d.toLocaleDateString('en-US', {
        timeZone: 'Asia/Manila',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...options
      });
    } catch (e) {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', ...options });
    }
  }

  function generateUUID() {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      try { return window.crypto.randomUUID(); } catch (e) {}
    }
    return 'eng_evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
  }

  // -------------------------------------------------------------------------
  // 3. OFFLINE INDEXEDDB PERSISTENCE LAYER
  // -------------------------------------------------------------------------
  class EngDayIndexedDB {
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
              evStore.createIndex('gameId', 'gameId', { unique: false });
              evStore.createIndex('studentId', 'studentId', { unique: false });
              evStore.createIndex('occurredAt', 'occurredAt', { unique: false });
            }
            if (!db.objectStoreNames.contains('syncQueue')) {
              db.createObjectStore('syncQueue', { keyPath: 'eventId' });
            }
            if (!db.objectStoreNames.contains('attendanceSnapshot')) {
              db.createObjectStore('attendanceSnapshot', { keyPath: 'id' });
            }
          };
          req.onsuccess = (e) => {
            this.db = e.target.result;
            resolve(this.db);
          };
          req.onerror = () => {
            console.warn('[EngDay DB] Failed to open IndexedDB, falling back to localStorage');
            resolve(null);
          };
        } catch (err) {
          resolve(null);
        }
      });
    }

    async saveEvent(event) {
      await this.readyPromise;
      if (!this.db) {
        let events = this.getAllEventsFromLocalStorage();
        if (!events.some(e => e.eventId === event.eventId)) {
          events.push(event);
          localStorage.setItem('ENGDAY_EVENTS_FALLBACK_V1', JSON.stringify(events));
        }
        return;
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(['attendanceEvents'], 'readwrite');
          tx.objectStore('attendanceEvents').put(event);
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
          const store = tx.objectStore('attendanceEvents');
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve(this.getAllEventsFromLocalStorage());
        } catch (e) {
          resolve(this.getAllEventsFromLocalStorage());
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

    async getPendingQueue() {
      await this.readyPromise;
      if (!this.db) {
        return this.getQueueFromLocalStorage();
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(['syncQueue'], 'readonly');
          const req = tx.objectStore('syncQueue').getAll();
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

    async deleteEvent(eventId) {
      await this.readyPromise;
      if (!this.db) {
        let events = this.getAllEventsFromLocalStorage().filter(e => e.eventId !== eventId);
        localStorage.setItem('ENGDAY_EVENTS_FALLBACK_V1', JSON.stringify(events));
        let q = this.getQueueFromLocalStorage().filter(e => e.eventId !== eventId);
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

    async clearAll() {
      await this.readyPromise;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('ENGDAY_EVENTS_FALLBACK_V1');
          localStorage.removeItem('ENGDAY_QUEUE_FALLBACK_V1');
          localStorage.removeItem('ENGDAY_SNAPSHOT_FALLBACK_V1');
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

    async saveSnapshot(state) {
      await this.readyPromise;
      if (!this.db) {
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('ENGDAY_SNAPSHOT_FALLBACK_V1', JSON.stringify({
              savedAt: new Date().toISOString(),
              state: state
            }));
          }
        } catch (e) {}
        return;
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(['attendanceSnapshot'], 'readwrite');
          tx.objectStore('attendanceSnapshot').put({
            id: 'latest_state',
            savedAt: new Date().toISOString(),
            state: state
          });
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch (e) {
          resolve();
        }
      });
    }

    async getLatestSnapshot() {
      await this.readyPromise;
      if (!this.db) {
        try {
          if (typeof localStorage !== 'undefined') {
            const raw = localStorage.getItem('ENGDAY_SNAPSHOT_FALLBACK_V1');
            return raw ? JSON.parse(raw) : null;
          }
        } catch (e) {}
        return null;
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(['attendanceSnapshot'], 'readonly');
          const req = tx.objectStore('attendanceSnapshot').get('latest_state');
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    }

    getAllEventsFromLocalStorage() {
      try {
        const raw = localStorage.getItem('ENGDAY_EVENTS_FALLBACK_V1');
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }

    getQueueFromLocalStorage() {
      try {
        const raw = localStorage.getItem('ENGDAY_QUEUE_FALLBACK_V1');
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }

    saveQueueToLocalStorage(q) {
      try {
        localStorage.setItem('ENGDAY_QUEUE_FALLBACK_V1', JSON.stringify(q));
      } catch (e) {}
    }
  }

  // -------------------------------------------------------------------------
  // 4. MAIN ENGINEERING DAY SPORTS ATTENDANCE ENGINE
  // -------------------------------------------------------------------------
  class EngDayAttendanceEngine {
    constructor() {
      this.games = ENGDAY_GAMES;
      this.activeGameId = 'vb_g1'; // Default to First Game: Mixed Volleyball Game 1
      this.db = new EngDayIndexedDB();
      this.deviceId = this.getOrCreateDeviceId();
      this.localSequence = 1;

      this.config = {
        serverUrl: (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '',
        syncIntervalMs: 5000,
        syncEnabled: true,
        autoSuggestGameByTime: true
      };

      this.state = {
        students: {},
        activeGameId: 'vb_g1',
        auditLog: [],
        version: 1,
        lastUpdated: new Date().toISOString()
      };

      this.listeners = new Set();
      this.syncTimer = null;
      this.isSyncing = false;
      this.pendingCount = 0;
      this.lastSyncTime = null;
      this.serverOnline = false;

      this.loadConfig();
      this.load();
      this.autoSelectGameByTime();
      this.initNetworkListeners();
      this.startSyncLoop();
    }

    initNetworkListeners() {
      if (typeof window === 'undefined') return;

      // When browser regains internet connectivity -> Auto-sync immediately!
      window.addEventListener('online', () => {
        console.log('[EngDay] Network connection restored -> Auto-syncing pending queue...');
        this.syncWithServer(true);
      });

      // When browser drops connectivity
      window.addEventListener('offline', () => {
        console.log('[EngDay] Network connection lost -> Operating in offline zero-latency mode.');
        this.serverOnline = false;
        this.notify();
      });

      // When screen unlocks / app brought to foreground
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            this.syncWithServer();
          }
        });
      }
      window.addEventListener('focus', () => {
        this.syncWithServer();
      });
    }

    getApiBaseUrl() {
      let url = (this.config.serverUrl || '').trim();
      if (!url) {
        if (typeof window !== 'undefined' && window.location) {
          const saved = (typeof localStorage !== 'undefined') ? localStorage.getItem('ENGDAY_SERVER_URL') : null;
          if (saved && saved.trim()) return saved.trim().replace(/\/$/, '');
          const host = window.location.hostname;
          if (host && host.includes('github.io')) return ''; // Static host without API
          return window.location.origin.replace(/\/$/, '');
        }
        return '';
      }
      return url.replace(/\/$/, '');
    }

    getOrCreateDeviceId() {
      try {
        if (typeof localStorage !== 'undefined') {
          let dev = localStorage.getItem('ENGDAY_DEVICE_ID');
          if (!dev) {
            dev = 'MARSHAL-ENG-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            localStorage.setItem('ENGDAY_DEVICE_ID', dev);
          }
          return dev;
        }
      } catch (e) {}
      return 'MARSHAL-ENG-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    loadConfig() {
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
          if (raw) Object.assign(this.config, JSON.parse(raw));
          const savedUrl = localStorage.getItem('ENGDAY_SERVER_URL');
          if (savedUrl) this.config.serverUrl = savedUrl.trim();
        }
      } catch (e) {}
    }

    saveConfig() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
        }
      } catch (e) {}
    }

    getActiveGame() {
      return this.games.find(g => g.id === this.activeGameId) || this.games[0];
    }

    setActiveGame(gameId) {
      const found = this.games.find(g => g.id === gameId);
      if (found) {
        this.activeGameId = gameId;
        this.state.activeGameId = gameId;
        if (typeof localStorage !== 'undefined') {
          try { localStorage.setItem('ENGDAY_ACTIVE_GAME', gameId); } catch(e) {}
        }
        this.notify();
      }
      return this.getActiveGame();
    }

    autoSelectGameByTime() {
      try {
        if (typeof localStorage !== 'undefined') {
          const stored = localStorage.getItem('ENGDAY_ACTIVE_GAME');
          if (stored && this.games.some(g => g.id === stored)) {
            this.activeGameId = stored;
            this.state.activeGameId = stored;
            return;
          }
        }
      } catch(e) {}

      // Suggest based on current Philippine hour
      const now = new Date();
      // Format current hour in Manila
      const manilaHourStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', hour12: false });
      const hour = parseInt(manilaHourStr, 10);
      const minute = now.getMinutes();
      const timeVal = hour * 60 + minute;

      // Official ESC ME Games Schedule:
      // vb_g1 (8:00 AM – 8:30 AM): CPE/ECE vs ME
      // vb_g3 (9:00 AM – 9:30 AM): EE vs ME
      // vb_g6 (10:30 AM – 11:00 AM): IE vs ME
      // vb_g8 (11:30 AM – 12:00 NN): CE vs ME
      // bb_g1 (1:00 PM – 2:00 PM): CE vs ME
      // bb_g4 (4:00 PM – 5:00 PM): ME vs EE
      // bb_g6 (6:00 PM – 7:00 PM): IE vs ME
      if (timeVal < 525) this.activeGameId = 'vb_g1';
      else if (timeVal >= 525 && timeVal < 600) this.activeGameId = 'vb_g3';
      else if (timeVal >= 600 && timeVal < 675) this.activeGameId = 'vb_g6';
      else if (timeVal >= 675 && timeVal < 750) this.activeGameId = 'vb_g8';
      else if (timeVal >= 750 && timeVal < 930) this.activeGameId = 'bb_g1';
      else if (timeVal >= 930 && timeVal < 1050) this.activeGameId = 'bb_g4';
      else if (timeVal >= 1050) this.activeGameId = 'bb_g6';
      else this.activeGameId = 'vb_g1';

      this.state.activeGameId = this.activeGameId;
    }

    // -------------------------------------------------------------------------
    // 5. STATE INITIALIZATION & ROSTER SEEDING
    // -------------------------------------------------------------------------
    load() {
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.students && Object.keys(parsed.students).length > 0) {
              this.state = parsed;
              this.reconcileStudentGamesStructure();
              this.updatePendingCount();
              return;
            }
          }
        }
      } catch (e) {
        console.warn('[EngDay] Attendance state load warning:', e);
      }
      this.initDefaultRoster();
      this.updatePendingCount();
    }

    setLocalFileHandle(handle) {
      this.localFileHandle = handle;
    }

    getLocalFileHandle() {
      return this.localFileHandle || null;
    }

    async writeToLocalFileHandle() {
      if (!this.localFileHandle) return false;
      try {
        const writable = await this.localFileHandle.createWritable();
        await writable.write(this.exportJSON());
        await writable.close();
        return true;
      } catch (e) {
        console.warn('[EngDay] Failed to write to local disk handle:', e);
        return false;
      }
    }

    save() {
      try {
        this.state.version = (this.state.version || 1) + 1;
        this.state.lastUpdated = new Date().toISOString();
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        }
        if (this.db && typeof this.db.saveSnapshot === 'function') {
          this.db.saveSnapshot(this.state);
        }
        if (this.localFileHandle) {
          this.writeToLocalFileHandle();
        }
      } catch (e) {
        console.error('[EngDay] Save error:', e);
      }
      this.notify();
    }

    createEmptyGamesRecord() {
      const records = {};
      this.games.forEach(g => {
        records[g.id] = {
          gameId: g.id,
          status: 'OUTSIDE', // 'INSIDE' | 'OUTSIDE'
          lastAction: null,   // 'check_in' | 'check_out'
          checkInTime: null,
          checkOutTime: null,
          displayCheckIn: null,
          displayCheckOut: null,
          visits: 0,
          history: []
        };
      });
      return records;
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

          students[id] = {
            id: id,
            name: name,
            team: team.id,
            teamName: team.name,
            studentCode: code,
            games: this.createEmptyGamesRecord()
          };
          studentIndex++;
        });
      });

      this.state.students = students;
      this.state.auditLog = [];
      this.save();
    }

    reconcileStudentGamesStructure() {
      if (!this.state.students) return;
      Object.values(this.state.students).forEach(s => {
        if (!s.games) s.games = {};
        this.games.forEach(g => {
          if (!s.games[g.id]) {
            s.games[g.id] = {
              gameId: g.id,
              status: 'OUTSIDE',
              lastAction: null,
              checkInTime: null,
              checkOutTime: null,
              displayCheckIn: null,
              displayCheckOut: null,
              visits: 0,
              history: []
            };
          }
        });
      });
    }

    // -------------------------------------------------------------------------
    // 6. QR SCAN & STUDENT LOOKUP
    // -------------------------------------------------------------------------
    getStudentById(id) {
      return this.state.students[id] || null;
    }

    getStudentByCode(code) {
      if (!code) return null;
      const clean = String(code).trim().toUpperCase();
      return Object.values(this.state.students).find(s => (s.studentCode || '').toUpperCase() === clean) || null;
    }

    resolveScanPayload(payload) {
      if (!payload) return { error: 'EMPTY_PAYLOAD', message: 'No QR data received.' };

      let raw = String(payload).trim();
      let code = null;

      if (raw.includes('code=')) {
        try {
          const url = new URL(raw, 'https://meodl.uphsd');
          code = url.searchParams.get('code');
        } catch (e) {
          const match = raw.match(/code=([a-zA-Z0-9_-]+)/);
          if (match) code = match[1];
        }
      } else if (raw.startsWith('MEODL-') || raw.startsWith('meodl-')) {
        code = raw.toUpperCase();
      }

      let student = null;
      if (code) student = this.getStudentByCode(code);

      // If token passed or raw URL match, also check MEODL student token if available
      if (!student && window.MEODL_ATTENDANCE && typeof window.MEODL_ATTENDANCE.resolveScanPayload === 'function') {
        const meodlRes = window.MEODL_ATTENDANCE.resolveScanPayload(payload);
        if (meodlRes && meodlRes.student) {
          student = this.getStudentById(meodlRes.student.id) || this.getStudentByCode(meodlRes.student.studentCode);
        }
      }

      if (!student) {
        // Fallback: match by student number in raw text
        const numMatch = raw.match(/\d{4}/);
        if (numMatch) {
          student = this.getStudentByCode('MEODL-' + numMatch[0]);
        }
      }

      if (!student) {
        return {
          error: 'NOT_FOUND',
          message: '❌ QR NOT REGISTERED\nThis QR code does not match any registered Engineering student.'
        };
      }

      const activeGame = this.getActiveGame();
      const gameRecord = student.games[activeGame.id] || { status: 'OUTSIDE' };

      return {
        success: true,
        student: student,
        activeGame: activeGame,
        gameRecord: gameRecord,
        statusInGame: gameRecord.status || 'OUTSIDE'
      };
    }

    // -------------------------------------------------------------------------
    // 7. RECORD CHECK-IN & CHECK-OUT (PER-GAME ISOLATED)
    // -------------------------------------------------------------------------
    createAttendanceEvent(student, gameId, action, options = {}) {
      const now = new Date();
      const isoTime = now.toISOString();
      const game = this.games.find(g => g.id === gameId) || this.getActiveGame();

      return {
        eventId: generateUUID(),
        gameId: game.id,
        gameName: game.name,
        sport: game.sport,
        studentId: student.id,
        studentCode: student.studentCode,
        studentName: student.name,
        team: student.team,
        action: action, // 'check_in' | 'check_out' | 'manual_override'
        occurredAt: isoTime,
        displayTime: formatManilaTime(now),
        displayDate: formatManilaDate(now),
        deviceId: this.deviceId,
        marshalId: options.performedBy || 'Court Marshal',
        court: game.court,
        method: options.method || 'qr_scan',
        reason: options.reason || null,
        note: options.note || null,
        localSequence: this.localSequence++,
        synced: false
      };
    }

    recordCheckIn(studentId, gameId = null, options = {}) {
      const student = this.getStudentById(studentId);
      if (!student) return { success: false, error: 'Student not found' };

      const gId = gameId || this.activeGameId;
      const game = this.games.find(g => g.id === gId) || this.getActiveGame();
      if (!student.games[gId]) student.games[gId] = { status: 'OUTSIDE', visits: 0, history: [] };

      const gRecord = student.games[gId];
      const event = this.createAttendanceEvent(student, gId, 'check_in', options);

      gRecord.status = 'INSIDE';
      gRecord.lastAction = 'check_in';
      gRecord.checkInTime = event.occurredAt;
      gRecord.displayCheckIn = event.displayTime;
      gRecord.visits = (gRecord.visits || 0) + 1;

      const historyItem = {
        eventId: event.eventId,
        action: 'check_in',
        gameId: gId,
        gameName: game.name,
        timestamp: event.occurredAt,
        displayTime: event.displayTime,
        performedBy: event.marshalId,
        method: event.method,
        court: event.court
      };

      if (!gRecord.history) gRecord.history = [];
      gRecord.history.unshift(historyItem);

      // Audit log entry
      if (!this.state.auditLog) this.state.auditLog = [];
      this.state.auditLog.unshift({
        id: 'log_' + event.eventId,
        eventId: event.eventId,
        gameId: gId,
        gameName: game.name,
        studentId: student.id,
        studentCode: student.studentCode,
        studentName: student.name,
        team: student.team,
        action: 'check_in',
        displayTime: event.displayTime,
        timestamp: event.occurredAt,
        performedBy: event.marshalId,
        method: event.method,
        court: event.court
      });
      if (this.state.auditLog.length > 500) this.state.auditLog.length = 500;

      this.save();
      this.db.saveEvent(event);
      this.db.enqueuePending(event);
      this.updatePendingCount();

      // Auto-sync immediately when online in the background (zero UI latency)
      if (this.config.syncEnabled && (typeof navigator === 'undefined' || navigator.onLine !== false)) {
        this.syncWithServer().catch(() => {});
      }

      return {
        success: true,
        action: 'check_in',
        student: student,
        game: game,
        event: event,
        message: `🟢 Checked IN to ${game.name}`
      };
    }

    recordCheckOut(studentId, gameId = null, options = {}) {
      const student = this.getStudentById(studentId);
      if (!student) return { success: false, error: 'Student not found' };

      const gId = gameId || this.activeGameId;
      const game = this.games.find(g => g.id === gId) || this.getActiveGame();
      if (!student.games[gId]) student.games[gId] = { status: 'OUTSIDE', visits: 0, history: [] };

      const gRecord = student.games[gId];
      const event = this.createAttendanceEvent(student, gId, 'check_out', options);

      gRecord.status = 'OUTSIDE';
      gRecord.lastAction = 'check_out';
      gRecord.checkOutTime = event.occurredAt;
      gRecord.displayCheckOut = event.displayTime;

      const historyItem = {
        eventId: event.eventId,
        action: 'check_out',
        gameId: gId,
        gameName: game.name,
        timestamp: event.occurredAt,
        displayTime: event.displayTime,
        performedBy: event.marshalId,
        method: event.method,
        court: event.court,
        reason: options.reason || 'Game Concluded'
      };

      if (!gRecord.history) gRecord.history = [];
      gRecord.history.unshift(historyItem);

      // Audit log entry
      if (!this.state.auditLog) this.state.auditLog = [];
      this.state.auditLog.unshift({
        id: 'log_' + event.eventId,
        eventId: event.eventId,
        gameId: gId,
        gameName: game.name,
        studentId: student.id,
        studentCode: student.studentCode,
        studentName: student.name,
        team: student.team,
        action: 'check_out',
        displayTime: event.displayTime,
        timestamp: event.occurredAt,
        performedBy: event.marshalId,
        method: event.method,
        court: event.court,
        reason: options.reason || 'Game Concluded'
      });
      if (this.state.auditLog.length > 500) this.state.auditLog.length = 500;

      this.save();
      this.db.saveEvent(event);
      this.db.enqueuePending(event);
      this.updatePendingCount();

      // Auto-sync immediately when online in the background (zero UI latency)
      if (this.config.syncEnabled && (typeof navigator === 'undefined' || navigator.onLine !== false)) {
        this.syncWithServer().catch(() => {});
      }

      return {
        success: true,
        action: 'check_out',
        student: student,
        game: game,
        event: event,
        message: `🔴 Checked OUT of ${game.name}`
      };
    }

    manualOverride(studentId, gameId, newStatus, options = {}) {
      const student = this.getStudentById(studentId);
      if (!student) return { success: false, error: 'Student not found' };

      const gId = gameId || this.activeGameId;
      const game = this.games.find(g => g.id === gId) || this.getActiveGame();
      if (!student.games[gId]) student.games[gId] = { status: 'OUTSIDE', visits: 0, history: [] };

      const gRecord = student.games[gId];
      const action = newStatus === 'INSIDE' ? 'check_in' : 'check_out';
      const event = this.createAttendanceEvent(student, gId, 'manual_override', {
        ...options,
        method: 'manual_override',
        reason: options.reason || `Manual override to ${newStatus}`
      });

      gRecord.status = newStatus;
      gRecord.lastAction = action;
      if (newStatus === 'INSIDE') {
        gRecord.checkInTime = event.occurredAt;
        gRecord.displayCheckIn = event.displayTime;
        gRecord.visits = (gRecord.visits || 0) + 1;
      } else {
        gRecord.checkOutTime = event.occurredAt;
        gRecord.displayCheckOut = event.displayTime;
      }

      const historyItem = {
        eventId: event.eventId,
        action: 'manual_override',
        newStatus: newStatus,
        gameId: gId,
        gameName: game.name,
        timestamp: event.occurredAt,
        displayTime: event.displayTime,
        performedBy: options.performedBy || 'Staff Admin',
        reason: options.reason || `Status set to ${newStatus}`
      };

      if (!gRecord.history) gRecord.history = [];
      gRecord.history.unshift(historyItem);

      this.save();
      this.db.saveEvent(event);
      this.db.enqueuePending(event);
      this.updatePendingCount();

      // Auto-sync immediately when online in the background (zero UI latency)
      if (this.config.syncEnabled && (typeof navigator === 'undefined' || navigator.onLine !== false)) {
        this.syncWithServer().catch(() => {});
      }

      return { success: true, student: student, game: game };
    }

    async deleteScanEvent(eventId) {
      await this.db.deleteEvent(eventId);
      // Remove from audit log
      if (this.state.auditLog) {
        this.state.auditLog = this.state.auditLog.filter(l => l.eventId !== eventId);
      }
      // Re-derive student state for that game
      await this.rederiveAllStatesFromDb();
      this.save();
      return true;
    }

    // -------------------------------------------------------------------------
    // 8. MULTI-DEVICE EVENT RE-DERIVATION
    // -------------------------------------------------------------------------
    async rederiveAllStatesFromDb() {
      const allEvents = await this.db.getAllEvents();
      // Sort chronologically
      allEvents.sort((a, b) => new Date(a.occurredAt) - new Date(b.occurredAt));

      // Reset all students
      Object.values(this.state.students).forEach(s => {
        s.games = this.createEmptyGamesRecord();
      });

      for (const ev of allEvents) {
        const student = this.state.students[ev.studentId];
        if (!student) continue;
        const gId = ev.gameId;
        if (!student.games[gId]) continue;

        const gRecord = student.games[gId];
        const timeStr = formatManilaTime(ev.occurredAt);

        if (ev.action === 'check_in') {
          gRecord.status = 'INSIDE';
          gRecord.lastAction = 'check_in';
          gRecord.checkInTime = ev.occurredAt;
          gRecord.displayCheckIn = timeStr;
          gRecord.visits = (gRecord.visits || 0) + 1;
        } else if (ev.action === 'check_out') {
          gRecord.status = 'OUTSIDE';
          gRecord.lastAction = 'check_out';
          gRecord.checkOutTime = ev.occurredAt;
          gRecord.displayCheckOut = timeStr;
        } else if (ev.action === 'manual_override') {
          const isInside = ev.reason && ev.reason.includes('INSIDE');
          gRecord.status = isInside ? 'INSIDE' : 'OUTSIDE';
          gRecord.lastAction = isInside ? 'check_in' : 'check_out';
          if (isInside) {
            gRecord.checkInTime = ev.occurredAt;
            gRecord.displayCheckIn = timeStr;
          } else {
            gRecord.checkOutTime = ev.occurredAt;
            gRecord.displayCheckOut = timeStr;
          }
        }

        if (!gRecord.history) gRecord.history = [];
        gRecord.history.unshift({
          eventId: ev.eventId,
          action: ev.action,
          gameId: gId,
          timestamp: ev.occurredAt,
          displayTime: timeStr,
          performedBy: ev.marshalId,
          method: ev.method,
          court: ev.court,
          reason: ev.reason
        });
      }

      this.save();
    }

    // -------------------------------------------------------------------------
    // 9. METRICS & ANALYTICS COMPUTATION
    // -------------------------------------------------------------------------
    calculateStats(gameIdFilter = null) {
      const students = Object.values(this.state.students || {});
      const totalStudents = students.length;

      const gameStats = {};
      this.games.forEach(g => {
        gameStats[g.id] = {
          game: g,
          totalCheckIns: 0,
          insideCount: 0,
          outsideCount: 0,
          byTeam: {
            rankine: { inside: 0, total: 0 },
            otto: { inside: 0, total: 0 },
            brayton: { inside: 0, total: 0 },
            diesel: { inside: 0, total: 0 }
          }
        };
      });

      let totalUniqueAttendees = 0;

      students.forEach(s => {
        let attendedAny = false;
        this.games.forEach(g => {
          const gr = s.games[g.id];
          const st = gameStats[g.id];
          const teamKey = s.team || 'rankine';

          if (gr && gr.visits > 0) {
            st.totalCheckIns++;
            attendedAny = true;
            if (st.byTeam[teamKey]) st.byTeam[teamKey].total++;
          }
          if (gr && gr.status === 'INSIDE') {
            st.insideCount++;
            if (st.byTeam[teamKey]) st.byTeam[teamKey].inside++;
          } else if (gr && gr.visits > 0) {
            st.outsideCount++;
          }
        });
        if (attendedAny) totalUniqueAttendees++;
      });

      // Filtered specific stats
      const targetGameId = gameIdFilter || this.activeGameId;
      const targetStats = gameStats[targetGameId] || gameStats['vb_g1'] || Object.values(gameStats)[0];

      return {
        totalStudents,
        totalUniqueAttendees,
        participationRate: totalStudents > 0 ? Math.round((totalUniqueAttendees / totalStudents) * 100) : 0,
        activeGame: this.getActiveGame(),
        activeGameStats: targetStats,
        allGamesStats: gameStats
      };
    }

    async getStudentHistory(studentId, gameIdFilter = null) {
      const student = this.getStudentById(studentId);
      if (!student) return [];

      let events = await this.db.getAllEvents();
      events = events.filter(e => e.studentId === studentId);
      if (gameIdFilter) events = events.filter(e => e.gameId === gameIdFilter);

      events.sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));

      return events.map(e => ({
        eventId: e.eventId,
        gameId: e.gameId,
        gameName: e.gameName,
        action: e.action,
        timestamp: e.occurredAt,
        displayTime: formatManilaTime(e.occurredAt),
        displayDate: formatManilaDate(e.occurredAt),
        performedBy: e.marshalId,
        method: e.method,
        court: e.court,
        reason: e.reason
      }));
    }

    async getRecentScans(gameIdFilter = null, limit = 50) {
      let events = await this.db.getAllEvents();
      if (gameIdFilter) events = events.filter(e => e.gameId === gameIdFilter);
      events.sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
      return events.slice(0, limit).map(e => ({
        ...e,
        displayTime: formatManilaTime(e.occurredAt),
        displayDate: formatManilaDate(e.occurredAt)
      }));
    }

    // -------------------------------------------------------------------------
    // 10. EXPORT & BACKUP (CSV & JSON)
    // -------------------------------------------------------------------------
    exportCSV(gameIdFilter = null) {
      const students = Object.values(this.state.students || {});
      const targetGames = gameIdFilter ? this.games.filter(g => g.id === gameIdFilter) : this.games;

      let csv = 'Student ID,Full Name,Team,Team Name';
      targetGames.forEach(g => {
        csv += `,${g.shortName} Status,${g.shortName} Check-In,${g.shortName} Check-Out,${g.shortName} Visits`;
      });
      csv += ',Total Games Attended\r\n';

      students.forEach(s => {
        let attendedCount = 0;
        let row = `"${s.studentCode}","${s.name}","${s.team.toUpperCase()}","${s.teamName}"`;

        targetGames.forEach(g => {
          const gr = s.games[g.id] || {};
          const status = gr.status || 'OUTSIDE';
          const inTime = gr.displayCheckIn || (gr.checkInTime ? formatManilaTime(gr.checkInTime) : '');
          const outTime = gr.displayCheckOut || (gr.checkOutTime ? formatManilaTime(gr.checkOutTime) : '');
          const visits = gr.visits || 0;
          if (visits > 0) attendedCount++;

          row += `,"${status}","${inTime}","${outTime}",${visits}`;
        });

        row += `,${attendedCount}\r\n`;
        csv += row;
      });

      return csv;
    }

    downloadCSV(gameIdFilter = null) {
      const csv = this.exportCSV(gameIdFilter);
      const tag = gameIdFilter ? `_${gameIdFilter.toUpperCase()}` : '_ALL_GAMES';
      const filename = `EngineeringDay_Sports_Attendance${tag}_${new Date().toISOString().slice(0,10)}.csv`;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    exportJSON() {
      return JSON.stringify({
        exportedAt: new Date().toISOString(),
        deviceId: this.deviceId,
        state: this.state
      }, null, 2);
    }

    downloadJSON(customFilename = null) {
      const json = this.exportJSON();
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const filename = customFilename || `EngineeringDay_Sports_Attendance_Backup_${now.toISOString().slice(0, 10)}_${timeStr}.json`;
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        try { URL.revokeObjectURL(url); } catch(e) {}
      }, 5000);
    }

    // -------------------------------------------------------------------------
    // 11. BACKGROUND SYNC CLIENT
    // -------------------------------------------------------------------------
    startSyncLoop() {
      if (typeof window === 'undefined' || typeof setInterval === 'undefined') return;
      if (this.syncTimer && typeof clearInterval !== 'undefined') clearInterval(this.syncTimer);
      
      // Heartbeat auto-sync every 4 seconds when online
      this.syncTimer = setInterval(() => {
        if (this.config.syncEnabled && (typeof navigator === 'undefined' || navigator.onLine !== false)) {
          this.syncWithServer();
        }
      }, this.config.syncIntervalMs || 4000);

      // Trigger initial background check on startup if online
      if (typeof navigator === 'undefined' || navigator.onLine !== false) {
        setTimeout(() => this.syncWithServer(), 800);
      }
    }

    syncNow() {
      return this.syncWithServer(true);
    }

    setServerUrl(url) {
      const clean = String(url || '').trim();
      this.config.serverUrl = clean;
      this.saveConfig();
      if (typeof localStorage !== 'undefined') {
        try { localStorage.setItem('ENGDAY_SERVER_URL', clean); } catch (e) {}
      }
      return this.syncNow();
    }

    getSyncStatus() {
      return {
        serverOnline: this.serverOnline,
        isSyncing: this.isSyncing,
        pendingCount: this.pendingCount,
        lastSyncTime: this.lastSyncTime,
        serverUrl: this.getApiBaseUrl(),
        deviceId: this.deviceId
      };
    }

    async updatePendingCount() {
      try {
        const queue = await this.db.getPendingQueue();
        this.pendingCount = queue.length;
      } catch (e) {
        this.pendingCount = 0;
      }
      this.notify();
    }

    async syncWithServer(isManual = false) {
      if (this.isSyncing) return;
      this.isSyncing = true;
      this.notify();

      try {
        // If navigator explicitly reports offline, skip network calls
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
          this.serverOnline = false;
          return;
        }

        const queue = await this.db.getPendingQueue();
        const base = this.getApiBaseUrl();

        if (!base) {
          // No API backend configured (e.g. standalone static mode on GitHub Pages)
          this.serverOnline = false;
          return;
        }

        // 1. Flush local outbox queue to server
        if (queue.length > 0) {
          const res = await fetch(`${base}/api/engday/attendance/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId: this.deviceId, events: queue })
          });

          if (res.ok) {
            const data = await res.json();
            const syncedIds = [...(data.accepted || []), ...(data.duplicate || [])];
            await this.db.markEventsSynced(syncedIds);
            this.serverOnline = true;
            this.lastSyncTime = formatManilaTime(new Date());
          } else {
            this.serverOnline = false;
          }
        }

        // 2. Fetch latest server state & reconcile
        const stateRes = await fetch(`${base}/api/engday/attendance/state`, {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });

        if (stateRes.ok) {
          const serverState = await stateRes.json();
          this.serverOnline = true;
          this.lastSyncTime = formatManilaTime(new Date());

          if (serverState.students && (!this.state.version || serverState.version > this.state.version)) {
            this.state.students = serverState.students;
            this.state.version = serverState.version;
            this.save();
          }
        } else {
          if (queue.length === 0) this.serverOnline = false;
        }
      } catch (err) {
        this.serverOnline = false;
      } finally {
        await this.updatePendingCount();
        this.isSyncing = false;
        this.notify();
      }
    }

    subscribe(fn) {
      this.listeners.add(fn);
      return () => this.listeners.delete(fn);
    }

    notify() {
      this.listeners.forEach(fn => {
        try { fn(this); } catch(e) {}
      });
    }
  }

  // -------------------------------------------------------------------------
  // GLOBAL EXPORTS
  // -------------------------------------------------------------------------
  const root = (typeof window !== 'undefined') ? window : ((typeof global !== 'undefined') ? global : this);
  root.ENGDAY_GAMES = ENGDAY_GAMES;
  root.EngDayAttendanceEngine = EngDayAttendanceEngine;
  root.formatManilaTime = formatManilaTime;
  root.formatManilaDate = formatManilaDate;

  if (typeof window !== 'undefined') {
    try {
      root.ENGDAY_ATTENDANCE = new EngDayAttendanceEngine();
    } catch (e) {
      console.warn('[EngDay] Auto-instantiation deferred:', e);
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      ENGDAY_GAMES,
      EngDayAttendanceEngine,
      formatManilaTime,
      formatManilaDate
    };
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
