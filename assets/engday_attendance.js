/* =========================================================================
   DYNAMIC EVENT, SESSION & ROSTER ATTENDANCE ENGINE (v2.0)
   Supports:
   - Dynamic Multi-Event Catalog (Create/Switch/Edit Events)
   - Dynamic Sessions per Event (Custom Time Slots, Locations, Icons,
     "Entry/Exit Gate" vs "Check-In Only" Mode, and Custom Exit Notes)
   - Dynamic Student Roster Importer (CSV / Excel TSV / JSON with Column Mapping)
   - Dynamic Groups / Houses / Sections with Automatic Color Palettes
   - Flexible QR Payload Resolution (Raw ID/Code, JSON, URL, Pipe/Prefix, Name)
   - 4-Layer Local Backup (IndexedDB + LocalStorage, 1-Tap JSON/CSV, Auto-Download,
     Chrome File System Access API Direct Hard Drive Link)
   - Real-Time Cloud Auto-Sync (SSE + Batch Outbox Queue with Deduplication)
   ========================================================================= */

(function(window) {
  'use strict';

  const SCHEMA_VERSION = '2026.5';
  const STORAGE_KEY = 'ENGDAY_ATTENDANCE_STATE_V1';
  const CONFIG_STORAGE_KEY = 'ENGDAY_ATTENDANCE_CONFIG_V1';
  const DB_NAME = 'ENGDAY_ATTENDANCE_DB_V1';
  const DB_VERSION = 1;

  // -------------------------------------------------------------------------
  // 1. DEFAULT ENGINEERING DAYS 2026 TRACK A SESSIONS & ENGINEERING PROGRAMS
  // -------------------------------------------------------------------------
  const DEFAULT_EXIT_NOTES = [
    'Session / Activity Concluded',
    'Lunch / Water / Rest Break',
    'Transferring to Lab / Booths / Other Venue',
    'Player / Contestant Rotation',
    'Leaving Venue / Campus'
  ];

  const GROUP_COLOR_PALETTE = [
    {
      color: 'amber',
      hex: '#f59e0b',
      badgeClass: 'bg-amber-950/90 text-amber-300 border-amber-700/80',
      bgClass: 'bg-amber-950/25',
      borderClass: 'border-amber-500/40',
      textClass: 'text-amber-400',
      barClass: 'bg-amber-500'
    },
    {
      color: 'red',
      hex: '#ef4444',
      badgeClass: 'bg-red-950/90 text-red-300 border-red-700/80',
      bgClass: 'bg-red-950/25',
      borderClass: 'border-red-500/40',
      textClass: 'text-red-400',
      barClass: 'bg-red-500'
    },
    {
      color: 'cyan',
      hex: '#06b6d4',
      badgeClass: 'bg-cyan-950/90 text-cyan-300 border-cyan-700/80',
      bgClass: 'bg-cyan-950/25',
      borderClass: 'border-cyan-500/40',
      textClass: 'text-cyan-400',
      barClass: 'bg-cyan-500'
    },
    {
      color: 'emerald',
      hex: '#10b981',
      badgeClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80',
      bgClass: 'bg-emerald-950/25',
      borderClass: 'border-emerald-500/40',
      textClass: 'text-emerald-400',
      barClass: 'bg-emerald-500'
    },
    {
      color: 'violet',
      hex: '#8b5cf6',
      badgeClass: 'bg-violet-950/90 text-violet-300 border-violet-700/80',
      bgClass: 'bg-violet-950/25',
      borderClass: 'border-violet-500/40',
      textClass: 'text-violet-400',
      barClass: 'bg-violet-500'
    },
    {
      color: 'sky',
      hex: '#0ea5e9',
      badgeClass: 'bg-sky-950/90 text-sky-300 border-sky-700/80',
      bgClass: 'bg-sky-950/25',
      borderClass: 'border-sky-500/40',
      textClass: 'text-sky-400',
      barClass: 'bg-sky-500'
    },
    {
      color: 'rose',
      hex: '#f43f5e',
      badgeClass: 'bg-rose-950/90 text-rose-300 border-rose-700/80',
      bgClass: 'bg-rose-950/25',
      borderClass: 'border-rose-500/40',
      textClass: 'text-rose-400',
      barClass: 'bg-rose-500'
    },
    {
      color: 'orange',
      hex: '#f97316',
      badgeClass: 'bg-orange-950/90 text-orange-300 border-orange-700/80',
      bgClass: 'bg-orange-950/25',
      borderClass: 'border-orange-500/40',
      textClass: 'text-orange-400',
      barClass: 'bg-orange-500'
    },
    {
      color: 'indigo',
      hex: '#6366f1',
      badgeClass: 'bg-indigo-950/90 text-indigo-300 border-indigo-700/80',
      bgClass: 'bg-indigo-950/25',
      borderClass: 'border-indigo-500/40',
      textClass: 'text-indigo-400',
      barClass: 'bg-indigo-500'
    },
    {
      color: 'lime',
      hex: '#84cc16',
      badgeClass: 'bg-lime-950/90 text-lime-300 border-lime-700/80',
      bgClass: 'bg-lime-950/25',
      borderClass: 'border-lime-500/40',
      textClass: 'text-lime-400',
      barClass: 'bg-lime-500'
    }
  ];

  const DEFAULT_GROUPS = [
    { id: 'ie', name: 'IE (Industrial Engineering)', shortCode: 'IE', color: 'amber', hex: '#f59e0b' },
    { id: 'me', name: 'ME (Mechanical Engineering)', shortCode: 'ME', color: 'red', hex: '#ef4444' },
    { id: 'ce', name: 'CE (Civil Engineering)', shortCode: 'CE', color: 'cyan', hex: '#06b6d4' },
    { id: 'ee', name: 'EE (Electrical Engineering)', shortCode: 'EE', color: 'emerald', hex: '#10b981' },
    { id: 'ece', name: 'ECE (Electronics Engineering)', shortCode: 'ECE', color: 'violet', hex: '#8b5cf6' },
    { id: 'cpe', name: 'CPE (Computer Engineering)', shortCode: 'CPE', color: 'sky', hex: '#0ea5e9' }
  ];

  const ENGDAY_GAMES = [
    // DAY 1 — OCTOBER 19, 2026
    {
      id: 'd1-reg',
      date: '2026-10-19',
      day: 'Day 1',
      sport: 'day 1 (oct 19)',
      category: 'Day 1 (Oct 19)',
      gameNum: 1,
      name: 'D1 Morning Registration & Opening Program',
      shortName: 'D1 REG',
      tabName: 'D1 REG',
      matchup: 'Morning Registration & Opening Program',
      court: 'Gymnasium',
      location: 'Gymnasium',
      timeSlot: '7:30 AM – 8:40 AM',
      coordinator: 'Engineering Student Council',
      icon: '📋',
      color: 'amber',
      accentHex: '#f59e0b',
      borderClass: 'border-amber-500/50',
      bgClass: 'bg-amber-950/40',
      badgeClass: 'bg-amber-950 text-amber-300 border-amber-800',
      mode: 'check_in_only',
      exitNotes: DEFAULT_EXIT_NOTES.slice()
    },
    {
      id: 'd1-am-block',
      date: '2026-10-19',
      day: 'Day 1',
      sport: 'day 1 (oct 19)',
      category: 'Day 1 (Oct 19)',
      gameNum: 2,
      name: 'D1 Morning Sports, Booths & Board Games (WBB, VB, Racket, Chess/Dama)',
      shortName: 'D1 AM SPORTS',
      tabName: 'D1 AM SPORTS',
      matchup: 'WBB, Volleyball, Racket, Chess/Dama & Booths',
      court: 'Gymnasium & EE Lab (Rm 115)',
      location: 'Gymnasium & EE Lab (Rm 115)',
      timeSlot: '8:40 AM – 1:00 PM',
      coordinator: 'Engineering Student Council',
      icon: '🏐',
      color: 'orange',
      accentHex: '#f97316',
      borderClass: 'border-orange-500/50',
      bgClass: 'bg-orange-950/40',
      badgeClass: 'bg-orange-950 text-orange-300 border-orange-800',
      mode: 'entry_exit',
      exitNotes: DEFAULT_EXIT_NOTES.slice()
    },
    {
      id: 'd1-pm-block',
      date: '2026-10-19',
      day: 'Day 1',
      sport: 'day 1 (oct 19)',
      category: 'Day 1 (Oct 19)',
      gameNum: 3,
      name: 'D1 Afternoon Sports, Quiz Bee & Valorant',
      shortName: 'D1 PM BLOCK',
      tabName: 'D1 PM BLOCK',
      matchup: 'Afternoon Sports, Quiz Bee & Valorant',
      court: 'Gymnasium & ECE Lab (Rm 116)',
      location: 'Gymnasium & ECE Lab (Rm 116)',
      timeSlot: '1:00 PM – 5:30 PM',
      coordinator: 'Engineering Student Council',
      icon: '🧠',
      color: 'cyan',
      accentHex: '#06b6d4',
      borderClass: 'border-cyan-500/50',
      bgClass: 'bg-cyan-950/40',
      badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-800',
      mode: 'entry_exit',
      exitNotes: DEFAULT_EXIT_NOTES.slice()
    },
    {
      id: 'd1-finals',
      date: '2026-10-19',
      day: 'Day 1',
      sport: 'day 1 (oct 19)',
      category: 'Day 1 (Oct 19)',
      gameNum: 4,
      name: 'D1 Finals Night (Volleyball & Basketball Championships)',
      shortName: 'D1 FINALS',
      tabName: 'D1 FINALS',
      matchup: 'Volleyball & Basketball Championships',
      court: 'Gymnasium',
      location: 'Gymnasium',
      timeSlot: '5:30 PM – 8:00 PM',
      coordinator: 'Engineering Student Council',
      icon: '🏆',
      color: 'rose',
      accentHex: '#f43f5e',
      borderClass: 'border-rose-500/50',
      bgClass: 'bg-rose-950/40',
      badgeClass: 'bg-rose-950 text-rose-300 border-rose-800',
      mode: 'entry_exit',
      exitNotes: DEFAULT_EXIT_NOTES.slice()
    },
    // DAY 2 — OCTOBER 20, 2026
    {
      id: 'd2-am-palaro',
      date: '2026-10-20',
      day: 'Day 2',
      sport: 'day 2 (oct 20)',
      category: 'Day 2 (Oct 20)',
      gameNum: 5,
      name: 'D2 Morning Registration, Palarong Pinoy & Booths',
      shortName: 'D2 PALARO',
      tabName: 'D2 PALARO',
      matchup: 'Morning Registration, Palarong Pinoy & Booths',
      court: 'Gymnasium / Oval',
      location: 'Gymnasium / Oval',
      timeSlot: '8:00 AM – 12:00 NN',
      coordinator: 'Engineering Student Council',
      icon: '🎯',
      color: 'emerald',
      accentHex: '#10b981',
      borderClass: 'border-emerald-500/50',
      bgClass: 'bg-emerald-950/40',
      badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      mode: 'entry_exit',
      exitNotes: DEFAULT_EXIT_NOTES.slice()
    },
    {
      id: 'd2-esports',
      date: '2026-10-20',
      day: 'Day 2',
      sport: 'day 2 (oct 20)',
      category: 'Day 2 (Oct 20)',
      gameNum: 6,
      name: 'D2 E-Sports Tournaments (MLBB, CODM, Magic Chess, Tekken)',
      shortName: 'D2 ESPORTS',
      tabName: 'D2 ESPORTS',
      matchup: 'MLBB, CODM, Magic Chess & Tekken',
      court: 'ECE Room & ME Room',
      location: 'ECE Room & ME Room',
      timeSlot: '9:30 AM – 2:00 PM',
      coordinator: 'Engineering Student Council',
      icon: '🎮',
      color: 'violet',
      accentHex: '#8b5cf6',
      borderClass: 'border-violet-500/50',
      bgClass: 'bg-violet-950/40',
      badgeClass: 'bg-violet-950 text-violet-300 border-violet-800',
      mode: 'entry_exit',
      exitNotes: DEFAULT_EXIT_NOTES.slice()
    },
    {
      id: 'd2-pageant',
      date: '2026-10-20',
      day: 'Day 2',
      sport: 'day 2 (oct 20)',
      category: 'Day 2 (Oct 20)',
      gameNum: 7,
      name: 'D2 Pageant Screening',
      shortName: 'D2 PAGEANT',
      tabName: 'D2 PAGEANT',
      matchup: 'Mr. & Ms. Engineering Screening',
      court: 'Room 218',
      location: 'Room 218',
      timeSlot: '1:00 PM – 3:00 PM',
      coordinator: 'Engineering Student Council',
      icon: '👑',
      color: 'sky',
      accentHex: '#0ea5e9',
      borderClass: 'border-sky-500/50',
      bgClass: 'bg-sky-950/40',
      badgeClass: 'bg-sky-950 text-sky-300 border-sky-800',
      mode: 'entry_exit',
      exitNotes: DEFAULT_EXIT_NOTES.slice()
    },
    {
      id: 'd2-colorfest',
      date: '2026-10-20',
      day: 'Day 2',
      sport: 'day 2 (oct 20)',
      category: 'Day 2 (Oct 20)',
      gameNum: 8,
      name: 'D2 College Hours, Awarding & Colorfest / Rave',
      shortName: 'D2 COLORFEST',
      tabName: 'D2 COLORFEST',
      matchup: 'College Hours, Awarding & Colorfest / Rave',
      court: 'Gymnasium',
      location: 'Gymnasium',
      timeSlot: '3:00 PM – 8:00 PM',
      coordinator: 'Engineering Student Council',
      icon: '🎉',
      color: 'indigo',
      accentHex: '#6366f1',
      borderClass: 'border-indigo-500/50',
      bgClass: 'bg-indigo-950/40',
      badgeClass: 'bg-indigo-950 text-indigo-300 border-indigo-800',
      mode: 'entry_exit',
      exitNotes: DEFAULT_EXIT_NOTES.slice()
    }
  ];

  // -------------------------------------------------------------------------
  // 2. PHILIPPINE TIME & UTILITY HELPERS
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

  function generateUUID(prefix = 'eng_evt_') {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      try { return prefix + window.crypto.randomUUID(); } catch (e) {}
    }
    return prefix + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
  }

  function slugify(str, fallback = 'item') {
    const s = String(str || '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '_').replace(/^[_-]+|[_-]+$/g, '');
    return s || fallback;
  }

  function normalizeGroupProgramKey(rawStr) {
    const clean = String(rawStr || '').trim().toUpperCase();
    if (!clean) return { id: 'general', name: 'GENERAL', shortCode: 'GEN' };
    if (clean === 'IE' || clean === 'BSIE' || clean.includes('INDUSTRIAL')) {
      return { id: 'ie', name: 'IE (Industrial Engineering)', shortCode: 'IE' };
    }
    if (clean === 'ME' || clean === 'BSME' || clean.includes('MECHANICAL')) {
      return { id: 'me', name: 'ME (Mechanical Engineering)', shortCode: 'ME' };
    }
    if (clean === 'ECE' || clean === 'BSECE' || clean.includes('ELECTRONICS')) {
      return { id: 'ece', name: 'ECE (Electronics Engineering)', shortCode: 'ECE' };
    }
    if (clean === 'EE' || clean === 'BSEE' || clean.includes('ELECTRICAL')) {
      return { id: 'ee', name: 'EE (Electrical Engineering)', shortCode: 'EE' };
    }
    if (clean === 'CPE' || clean === 'BSCPE' || clean === 'COE' || clean.includes('COMPUTER')) {
      return { id: 'cpe', name: 'CPE (Computer Engineering)', shortCode: 'CPE' };
    }
    if (clean === 'CE' || clean === 'BSCE' || clean.includes('CIVIL')) {
      return { id: 'ce', name: 'CE (Civil Engineering)', shortCode: 'CE' };
    }
    if (clean === 'RANKINE' || clean === 'TEAM RANKINE') {
      return { id: 'rankine', name: 'TEAM RANKINE', shortCode: 'R' };
    }
    if (clean === 'OTTO' || clean === 'TEAM OTTO') {
      return { id: 'otto', name: 'TEAM OTTO', shortCode: 'O' };
    }
    if (clean === 'BRAYTON' || clean === 'TEAM BRAYTON') {
      return { id: 'brayton', name: 'TEAM BRAYTON', shortCode: 'B' };
    }
    if (clean === 'DIESEL' || clean === 'TEAM DIESEL') {
      return { id: 'diesel', name: 'TEAM DIESEL', shortCode: 'D' };
    }
    const id = slugify(clean.replace(/^TEAM\s+/i, ''), 'general');
    return {
      id,
      name: clean,
      shortCode: clean.replace(/^(TEAM|GROUP|HOUSE|SECTION)\s+/i, '').substring(0, 4).toUpperCase()
    };
  }

  function decorateSessionStyle(session, idx = 0) {
    const palette = GROUP_COLOR_PALETTE[idx % GROUP_COLOR_PALETTE.length];
    const colorMap = {
      amber: { accentHex: '#f59e0b', borderClass: 'border-amber-500/50', bgClass: 'bg-amber-950/40', badgeClass: 'bg-amber-950 text-amber-300 border-amber-800' },
      orange: { accentHex: '#f97316', borderClass: 'border-orange-500/50', bgClass: 'bg-orange-950/40', badgeClass: 'bg-orange-950 text-orange-300 border-orange-800' },
      yellow: { accentHex: '#eab308', borderClass: 'border-yellow-500/50', bgClass: 'bg-yellow-950/40', badgeClass: 'bg-yellow-950 text-yellow-300 border-yellow-800' },
      rose: { accentHex: '#f43f5e', borderClass: 'border-rose-500/50', bgClass: 'bg-rose-950/40', badgeClass: 'bg-rose-950 text-rose-300 border-rose-800' },
      cyan: { accentHex: '#06b6d4', borderClass: 'border-cyan-500/50', bgClass: 'bg-cyan-950/40', badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-800' },
      sky: { accentHex: '#0ea5e9', borderClass: 'border-sky-500/50', bgClass: 'bg-sky-950/40', badgeClass: 'bg-sky-950 text-sky-300 border-sky-800' },
      emerald: { accentHex: '#10b981', borderClass: 'border-emerald-500/50', bgClass: 'bg-emerald-950/40', badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
      violet: { accentHex: '#8b5cf6', borderClass: 'border-violet-500/50', bgClass: 'bg-violet-950/40', badgeClass: 'bg-violet-950 text-violet-300 border-violet-800' },
      red: { accentHex: '#ef4444', borderClass: 'border-red-500/50', bgClass: 'bg-red-950/40', badgeClass: 'bg-red-950 text-red-300 border-red-800' },
      indigo: { accentHex: '#6366f1', borderClass: 'border-indigo-500/50', bgClass: 'bg-indigo-950/40', badgeClass: 'bg-indigo-950 text-indigo-300 border-indigo-800' }
    };
    const chosen = colorMap[session.color] || colorMap[palette.color] || colorMap.cyan;
    const name = session.name || session.label || `Session ${idx + 1}`;
    const shortName = session.shortName || session.shortLabel || name;
    const tabName = session.tabName || shortName;
    const day = session.day || (String(session.id || '').startsWith('d2') || String(session.category || '').toLowerCase().includes('day 2') ? 'Day 2' : 'Day 1');
    const date = session.date || (day === 'Day 2' ? '2026-10-20' : '2026-10-19');
    const category = session.category || (day === 'Day 2' ? 'Day 2 (Oct 20)' : 'Day 1 (Oct 19)');
    const sport = String(session.sport || category).toLowerCase();
    const mode = session.mode === 'check_in_only' ? 'check_in_only' : 'entry_exit';
    const exitNotes = Array.isArray(session.exitNotes) && session.exitNotes.length > 0
      ? session.exitNotes
      : DEFAULT_EXIT_NOTES.slice();

    return {
      ...session,
      id: session.id ? String(session.id).trim() : slugify(shortName, `session_${idx + 1}`),
      date,
      day,
      name,
      shortName,
      tabName,
      category,
      sport,
      court: session.court || session.location || 'Gymnasium',
      location: session.location || session.court || 'Gymnasium',
      timeSlot: session.timeSlot || 'All Day',
      matchup: session.matchup || session.subtitle || category,
      opponent: session.opponent || '',
      coordinator: session.coordinator || 'Engineering Student Council',
      icon: session.icon || '📋',
      color: session.color || palette.color,
      accentHex: chosen.accentHex,
      borderClass: chosen.borderClass,
      bgClass: chosen.bgClass,
      badgeClass: chosen.badgeClass,
      mode,
      exitNotes
    };
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
      try {
        let events = this.getAllEventsFromLocalStorage();
        if (!events.some(e => e.eventId === event.eventId)) {
          events.push(event);
          if (events.length > 2500) events = events.slice(-2500);
          localStorage.setItem('ENGDAY_EVENTS_FALLBACK_V1', JSON.stringify(events));
        }
      } catch (e) {}

      await this.readyPromise;
      if (!this.db) return;
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
      // Immediate synchronous mirror in localStorage so getPendingQueue never misses in-flight writes
      try {
        let q = this.getQueueFromLocalStorage();
        if (!q.some(e => e.eventId === event.eventId)) {
          q.push(event);
          this.saveQueueToLocalStorage(q);
        }
      } catch (e) {}

      await this.readyPromise;
      if (!this.db) return;
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
      const lsQueue = this.getQueueFromLocalStorage();
      await this.readyPromise;
      if (!this.db) {
        return lsQueue;
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(['syncQueue'], 'readonly');
          const req = tx.objectStore('syncQueue').getAll();
          req.onsuccess = () => {
            const idbQueue = req.result || [];
            // Merge & deduplicate by eventId
            const mergedMap = new Map();
            lsQueue.forEach(ev => { if (ev && ev.eventId) mergedMap.set(ev.eventId, ev); });
            idbQueue.forEach(ev => { if (ev && ev.eventId) mergedMap.set(ev.eventId, ev); });
            resolve(Array.from(mergedMap.values()));
          };
          req.onerror = () => resolve(lsQueue);
        } catch (e) {
          resolve(lsQueue);
        }
      });
    }

    async markEventsSynced(eventIds) {
      if (!eventIds || !eventIds.length) return;
      const idSet = new Set(eventIds);
      try {
        let q = this.getQueueFromLocalStorage();
        q = q.filter(e => !idSet.has(e.eventId));
        this.saveQueueToLocalStorage(q);
      } catch (e) {}

      await this.readyPromise;
      if (!this.db) return;
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
      try {
        let events = this.getAllEventsFromLocalStorage().filter(e => e.eventId !== eventId);
        localStorage.setItem('ENGDAY_EVENTS_FALLBACK_V1', JSON.stringify(events));
        let q = this.getQueueFromLocalStorage().filter(e => e.eventId !== eventId);
        this.saveQueueToLocalStorage(q);
      } catch (e) {}

      await this.readyPromise;
      if (!this.db) return;
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

    async clearEventsForEventKey(eventKey, sessionIdFilter = null) {
      try {
        let events = this.getAllEventsFromLocalStorage().filter(e => {
          const ek = e.eventKey || 'engday_2026';
          if (ek !== eventKey) return true;
          if (sessionIdFilter && e.gameId !== sessionIdFilter) return true;
          return false;
        });
        localStorage.setItem('ENGDAY_EVENTS_FALLBACK_V1', JSON.stringify(events));
        let q = this.getQueueFromLocalStorage().filter(e => {
          const ek = e.eventKey || 'engday_2026';
          if (ek !== eventKey) return true;
          if (sessionIdFilter && e.gameId !== sessionIdFilter) return true;
          return false;
        });
        this.saveQueueToLocalStorage(q);
      } catch (e) {}

      await this.readyPromise;
      if (!this.db) return;
      const all = await this.getAllEvents();
      const toRemove = all.filter(e => {
        const ek = e.eventKey || 'engday_2026';
        if (ek !== eventKey) return false;
        if (sessionIdFilter && e.gameId !== sessionIdFilter) return false;
        return true;
      }).map(e => e.eventId);

      if (!toRemove.length) return;
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(['attendanceEvents', 'syncQueue'], 'readwrite');
          const evStore = tx.objectStore('attendanceEvents');
          const qStore = tx.objectStore('syncQueue');
          toRemove.forEach(id => {
            evStore.delete(id);
            qStore.delete(id);
          });
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
  // 4. MAIN DYNAMIC EVENT & SESSION ATTENDANCE ENGINE
  // -------------------------------------------------------------------------
  class EngDayAttendanceEngine {
    constructor() {
      this.games = ENGDAY_GAMES.map((g, i) => decorateSessionStyle(g, i));
      this.activeEventId = 'engday_2026';
      this.activeGameId = 'd1-reg';
      this.db = new EngDayIndexedDB();
      this.deviceId = this.getOrCreateDeviceId();
      this.localSequence = 1;
      this.lastSelfHealAt = 0;

      this.config = {
        serverUrl: (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '',
        syncIntervalMs: 3000,
        syncEnabled: true,
        autoSuggestGameByTime: true
      };

      this.state = {
        schemaVersion: SCHEMA_VERSION,
        activeEventId: 'engday_2026',
        activeGameId: 'd1-reg',
        eventsCatalog: {},
        students: {},
        auditLog: [],
        version: 1,
        lastUpdated: new Date().toISOString()
      };

      this.listeners = new Set();
      this.syncTimer = null;
      this.isSyncing = false;
      this.pendingCount = 0;
      this.lastSyncTime = null;
      this.lastSyncedServerVersion = 0;
      this.serverOnline = false;

      this.loadConfig();
      this.load();
      this.autoSelectGameByTime();
      this.initNetworkListeners();
      this.startSyncLoop();
    }

    // -----------------------------------------------------------------------
    // EVENT, SESSION & GROUP METADATA MANAGEMENT
    // -----------------------------------------------------------------------
    buildDefaultEventDefinition(existingStudents = null, existingAuditLog = null) {
      const sessions = ENGDAY_GAMES.map((g, i) => decorateSessionStyle(g, i));
      return {
        id: 'engday_2026',
        schemaVersion: SCHEMA_VERSION,
        title: 'ENGINEERING DAYS 2026',
        subtitle: 'UPHSD Calamba • College of Engineering (Oct 19–20, 2026)',
        venueName: 'Gymnasium / Oval & Engineering Labs',
        staffPin: '2026',
        groups: DEFAULT_GROUPS.map(g => ({ ...g })),
        sessions: sessions,
        students: existingStudents || this.buildDefaultStudentsMap(sessions),
        auditLog: existingAuditLog || [],
        updatedAt: new Date().toISOString()
      };
    }

    buildDefaultStudentsMap(sessionsList = null) {
      const sessions = sessionsList || this.games || ENGDAY_GAMES;
      const data = (typeof window !== 'undefined' && window.MEODL_DATA) ? window.MEODL_DATA : {};
      const teams = data.teams || [
        { id: 'ee', name: 'TEAM EE', shortCode: 'EE' },
        { id: 'cpe', name: 'TEAM CPE', shortCode: 'CPE' },
        { id: 'ece', name: 'TEAM ECE', shortCode: 'ECE' },
        { id: 'ie', name: 'TEAM IE', shortCode: 'IE' },
        { id: 'ce', name: 'TEAM CE', shortCode: 'CE' }
      ];
      const rosters = data.rosters || {};

      const students = {};
      let studentIndex = 1;

      teams.forEach(team => {
        const teamKey = (team.shortCode || team.id).toUpperCase();
        const members = rosters[teamKey] || rosters[team.id.toUpperCase()] || [];
        members.forEach((item, idx) => {
          const isObj = typeof item === 'object' && item !== null;
          const name = isObj ? item.name : item;
          const code = (isObj && item.code) ? item.code : (teamKey + '-' + String(idx + 1).padStart(3, '0'));
          const id = 'student-' + code.toLowerCase().replace(/[^a-z0-9]+/g, '_');

          students[id] = {
            id: id,
            name: name,
            team: team.id.toLowerCase(),
            teamName: team.name,
            studentCode: code,
            games: this.createEmptyGamesRecord(sessions)
          };
          studentIndex++;
        });
      });

      return students;
    }

    ensureEventsCatalogStructure() {
      this.state.schemaVersion = SCHEMA_VERSION;
      if (!this.state.eventsCatalog || typeof this.state.eventsCatalog !== 'object') {
        this.state.eventsCatalog = {};
      }
      if (!this.state.eventsCatalog['engday_2026']) {
        const hasExistingStudents = this.state.students && Object.keys(this.state.students).length > 0;
        this.state.eventsCatalog['engday_2026'] = this.buildDefaultEventDefinition(
          hasExistingStudents ? this.state.students : null,
          Array.isArray(this.state.auditLog) ? this.state.auditLog : []
        );
      } else {
        // Force Config Migration (SCHEMA_VERSION = '2026.5') for cached old sessions or 175-student roster
        const defEvt = this.state.eventsCatalog['engday_2026'];
        const legacyGameIds = new Set(['vb_g1', 'vb_g3', 'vb_g6', 'vb_g8', 'bb_g1', 'bb_g4', 'bb_g6']);
        const hasLegacySessions = Array.isArray(defEvt.sessions) && defEvt.sessions.some(s => legacyGameIds.has(s.id));
        const hasLegacyRoster = Object.keys(defEvt.students || {}).length < 400;

        if (defEvt.schemaVersion !== SCHEMA_VERSION || hasLegacySessions || hasLegacyRoster) {
          defEvt.schemaVersion = SCHEMA_VERSION;
          if (hasLegacyRoster) {
            defEvt.students = this.buildDefaultStudentsMap(defEvt.sessions);
            this.state.students = defEvt.students;
          }
          if (!defEvt.title || defEvt.title === 'Engineering Day 2026') {
            defEvt.title = 'ENGINEERING DAYS 2026';
          }
          if (!defEvt.subtitle || defEvt.subtitle === 'Sports & Venue Attendance') {
            defEvt.subtitle = 'UPHSD Calamba • College of Engineering (Oct 19–20, 2026)';
          }
          if (!defEvt.venueName || defEvt.venueName === 'UPHSD Gymnasium & Courts') {
            defEvt.venueName = 'Gymnasium / Oval & Engineering Labs';
          }
          if (hasLegacySessions || !Array.isArray(defEvt.sessions) || defEvt.sessions.length === 0) {
            defEvt.sessions = ENGDAY_GAMES.map((g, i) => decorateSessionStyle(g, i));
          }
          // Ensure all 6 Engineering Programs are present in groups without losing custom groups
          const existingGroups = Array.isArray(defEvt.groups) ? defEvt.groups : [];
          const mergedGroups = DEFAULT_GROUPS.map(g => ({ ...g }));
          const seenGrpIds = new Set(mergedGroups.map(g => g.id));
          existingGroups.forEach(g => {
            const gid = String(g.id || '').toLowerCase();
            if (gid && !seenGrpIds.has(gid)) {
              seenGrpIds.add(gid);
              mergedGroups.push(g);
            }
          });
          defEvt.groups = mergedGroups;
          defEvt.updatedAt = new Date().toISOString();
        }
      }

      const activeId = this.state.activeEventId && this.state.eventsCatalog[this.state.activeEventId]
        ? this.state.activeEventId
        : 'engday_2026';

      this.activeEventId = activeId;
      this.state.activeEventId = activeId;

      const activeEvt = this.state.eventsCatalog[activeId];
      if (!Array.isArray(activeEvt.sessions) || activeEvt.sessions.length === 0) {
        activeEvt.sessions = ENGDAY_GAMES.map((g, i) => decorateSessionStyle(g, i));
      } else {
        activeEvt.sessions = activeEvt.sessions.map((s, i) => decorateSessionStyle(s, i));
      }

      if (!Array.isArray(activeEvt.groups) || activeEvt.groups.length === 0) {
        activeEvt.groups = DEFAULT_GROUPS.map(g => ({ ...g }));
      }

      if (!activeEvt.students || typeof activeEvt.students !== 'object') {
        activeEvt.students = {};
      }
      if (!Array.isArray(activeEvt.auditLog)) {
        activeEvt.auditLog = [];
      }

      this.games = activeEvt.sessions;
      if (typeof window !== 'undefined') {
        window.ENGDAY_GAMES = this.games;
      }
      this.state.students = activeEvt.students;
      this.state.auditLog = activeEvt.auditLog;

      if (!this.games.some(g => g.id === this.activeGameId)) {
        this.activeGameId = this.games[0]?.id || 'd1-reg';
        this.state.activeGameId = this.activeGameId;
      }

      this.reconcileStudentGamesStructure();
      this.reconcileGroupsFromStudents();
    }

    syncActiveBranchToCatalog() {
      if (!this.state.eventsCatalog) this.state.eventsCatalog = {};
      const evt = this.state.eventsCatalog[this.activeEventId];
      if (evt) {
        evt.schemaVersion = SCHEMA_VERSION;
        evt.sessions = this.games;
        evt.students = this.state.students;
        evt.auditLog = this.state.auditLog;
        evt.updatedAt = new Date().toISOString();
      }
    }

    getEventsList() {
      this.ensureEventsCatalogStructure();
      return Object.values(this.state.eventsCatalog).map(ev => ({
        id: ev.id,
        title: ev.title || 'Untitled Event',
        subtitle: ev.subtitle || '',
        venueName: ev.venueName || 'Main Venue',
        staffPin: ev.staffPin || '2026',
        sessionCount: Array.isArray(ev.sessions) ? ev.sessions.length : 0,
        studentCount: ev.students ? Object.keys(ev.students).length : 0,
        groups: ev.groups || [],
        sessions: ev.sessions || [],
        updatedAt: ev.updatedAt
      }));
    }

    getActiveEvent() {
      this.ensureEventsCatalogStructure();
      return this.state.eventsCatalog[this.activeEventId];
    }

    setActiveEvent(eventId) {
      this.ensureEventsCatalogStructure();
      if (!this.state.eventsCatalog[eventId]) return false;
      this.syncActiveBranchToCatalog();

      this.activeEventId = eventId;
      this.state.activeEventId = eventId;
      const nextEvt = this.state.eventsCatalog[eventId];
      nextEvt.sessions = (nextEvt.sessions || []).map((s, i) => decorateSessionStyle(s, i));
      this.games = nextEvt.sessions;
      if (typeof window !== 'undefined') {
        window.ENGDAY_GAMES = this.games;
      }
      this.state.students = nextEvt.students || {};
      this.state.auditLog = nextEvt.auditLog || [];
      this.activeGameId = this.games[0]?.id || '';
      this.state.activeGameId = this.activeGameId;

      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('ENGDAY_ACTIVE_EVENT', eventId);
          localStorage.setItem('ENGDAY_ACTIVE_GAME', this.activeGameId);
        }
      } catch (e) {}

      this.reconcileStudentGamesStructure();
      this.reconcileGroupsFromStudents();
      this.save();
      this.syncConfigWithServer().catch(() => {});
      return true;
    }

    createOrUpdateEvent(payload = {}) {
      this.ensureEventsCatalogStructure();
      this.syncActiveBranchToCatalog();

      const isNew = !payload.id || !this.state.eventsCatalog[payload.id];
      const eventId = payload.id ? slugify(payload.id, 'event_' + Date.now()) : ('evt_' + slugify(payload.title || 'custom', 'event') + '_' + Date.now().toString(36).slice(-4));
      const existing = this.state.eventsCatalog[eventId];

      let sessions = [];
      if (Array.isArray(payload.sessions) && payload.sessions.length > 0) {
        sessions = payload.sessions.map((s, i) => decorateSessionStyle(s, i));
      } else if (existing && Array.isArray(existing.sessions) && existing.sessions.length > 0) {
        sessions = existing.sessions.map((s, i) => decorateSessionStyle(s, i));
      } else {
        sessions = [
          decorateSessionStyle({
            id: 'session_1',
            name: 'Session 1 (Main Check-In)',
            shortName: 'Session 1',
            tabName: 'Session 1',
            category: 'Day 1 (Oct 19)',
            sport: 'day 1 (oct 19)',
            court: payload.venueName || 'Main Hall',
            timeSlot: '8:00 AM – 12:00 PM',
            icon: '📋',
            color: 'cyan',
            mode: 'entry_exit',
            exitNotes: DEFAULT_EXIT_NOTES.slice()
          }, 0)
        ];
      }

      let students = {};
      if (existing && existing.students) {
        students = existing.students;
      } else if (payload.rosterSource === 'copy_current') {
        Object.values(this.state.students || {}).forEach(s => {
          students[s.id] = {
            id: s.id,
            name: s.name,
            team: s.team,
            teamName: s.teamName,
            studentCode: s.studentCode,
            games: this.createEmptyGamesRecord(sessions)
          };
        });
      } else if (payload.rosterSource === 'default_meodl') {
        students = this.buildDefaultStudentsMap(sessions);
      }

      const groups = (existing && Array.isArray(existing.groups) && existing.groups.length > 0)
        ? existing.groups
        : (payload.rosterSource === 'empty' ? [] : DEFAULT_GROUPS.map(g => ({ ...g })));

      this.state.eventsCatalog[eventId] = {
        id: eventId,
        schemaVersion: SCHEMA_VERSION,
        title: (payload.title || existing?.title || 'Custom Event').trim(),
        subtitle: (payload.subtitle !== undefined ? payload.subtitle : (existing?.subtitle || 'Live Attendance & Gate Control')).trim(),
        venueName: (payload.venueName !== undefined ? payload.venueName : (existing?.venueName || 'Main Venue')).trim(),
        staffPin: (payload.staffPin || existing?.staffPin || '2026').trim(),
        groups,
        sessions,
        students,
        auditLog: existing?.auditLog || [],
        updatedAt: new Date().toISOString()
      };

      if (payload.makeActive !== false || isNew || eventId === this.activeEventId) {
        this.setActiveEvent(eventId);
      } else {
        this.save();
        this.syncConfigWithServer().catch(() => {});
      }

      return this.state.eventsCatalog[eventId];
    }

    deleteEventConfig(eventId) {
      this.ensureEventsCatalogStructure();
      const keys = Object.keys(this.state.eventsCatalog);
      if (keys.length <= 1) {
        return { success: false, error: 'Cannot delete the only remaining event.' };
      }
      if (!this.state.eventsCatalog[eventId]) {
        return { success: false, error: 'Event not found.' };
      }
      delete this.state.eventsCatalog[eventId];
      if (this.activeEventId === eventId) {
        const nextId = Object.keys(this.state.eventsCatalog)[0];
        this.setActiveEvent(nextId);
      } else {
        this.save();
        this.syncConfigWithServer().catch(() => {});
      }
      return { success: true };
    }

    // -----------------------------------------------------------------------
    // DYNAMIC SESSIONS CRUD
    // -----------------------------------------------------------------------
    saveSession(sessionData) {
      this.ensureEventsCatalogStructure();
      const evt = this.getActiveEvent();
      const idx = evt.sessions.findIndex(s => s.id === sessionData.id);
      const exitNotes = Array.isArray(sessionData.exitNotes)
        ? sessionData.exitNotes.map(n => String(n).trim()).filter(Boolean)
        : (typeof sessionData.exitNotes === 'string'
            ? sessionData.exitNotes.split(/[,\n]/).map(n => n.trim()).filter(Boolean)
            : DEFAULT_EXIT_NOTES.slice());

      const normalized = decorateSessionStyle({
        ...(idx >= 0 ? evt.sessions[idx] : {}),
        ...sessionData,
        id: sessionData.id ? String(sessionData.id).trim() : ('sess-' + slugify(sessionData.shortName || sessionData.name, 's') + '-' + Date.now().toString(36).slice(-3)),
        exitNotes: exitNotes.length > 0 ? exitNotes : DEFAULT_EXIT_NOTES.slice()
      }, idx >= 0 ? idx : evt.sessions.length);

      if (idx >= 0) {
        evt.sessions[idx] = normalized;
      } else {
        evt.sessions.push(normalized);
      }

      this.games = evt.sessions;
      if (typeof window !== 'undefined') window.ENGDAY_GAMES = this.games;
      this.reconcileStudentGamesStructure();
      this.save();
      this.syncConfigWithServer().catch(() => {});
      return normalized;
    }

    deleteSession(sessionId) {
      this.ensureEventsCatalogStructure();
      const evt = this.getActiveEvent();
      if (evt.sessions.length <= 1) {
        return { success: false, error: 'An event must have at least 1 session.' };
      }
      evt.sessions = evt.sessions.filter(s => s.id !== sessionId);
      this.games = evt.sessions;
      if (typeof window !== 'undefined') window.ENGDAY_GAMES = this.games;
      if (this.activeGameId === sessionId) {
        this.activeGameId = this.games[0].id;
        this.state.activeGameId = this.activeGameId;
      }
      this.save();
      this.syncConfigWithServer().catch(() => {});
      return { success: true };
    }

    // -----------------------------------------------------------------------
    // DYNAMIC GROUPS / ENGINEERING PROGRAMS / HOUSES STYLING
    // -----------------------------------------------------------------------
    reconcileGroupsFromStudents() {
      const evt = this.state.eventsCatalog?.[this.activeEventId];
      if (!evt) return;
      if (!Array.isArray(evt.groups)) evt.groups = [];

      const knownIds = new Set(evt.groups.map(g => String(g.id).toLowerCase()));
      Object.values(this.state.students || {}).forEach(s => {
        const norm = normalizeGroupProgramKey(s.team || s.group || s.teamName || 'general');
        s.team = norm.id;
        if (!s.teamName || s.teamName.toUpperCase() === norm.id.toUpperCase()) {
          s.teamName = norm.name;
        }
        if (!knownIds.has(norm.id)) {
          knownIds.add(norm.id);
          const style = this.getGroupStyle(norm.id, evt.groups.length);
          evt.groups.push({
            id: norm.id,
            name: style.name || norm.name,
            shortCode: style.shortCode || norm.shortCode,
            color: style.color,
            hex: style.hex
          });
        }
      });
    }

    getGroups() {
      this.ensureEventsCatalogStructure();
      const evt = this.getActiveEvent();
      const studentCounts = {};
      Object.values(this.state.students || {}).forEach(s => {
        const k = String(s.team || 'general').toLowerCase();
        studentCounts[k] = (studentCounts[k] || 0) + 1;
      });
      const groups = (evt.groups || []).map((g, idx) => {
        const style = this.getGroupStyle(g.id, idx);
        return {
          ...g,
          ...style,
          count: studentCounts[String(g.id).toLowerCase()] || 0
        };
      });
      return groups;
    }

    getGroupStyle(groupIdOrName, fallbackIdx = null) {
      const raw = String(groupIdOrName || 'general').trim();
      const norm = normalizeGroupProgramKey(raw);
      const key = norm.id;

      // Official 6 Engineering Programs (Distinct High-Contrast Badge Colors)
      if (key === 'ie') return { id: 'ie', name: 'IE (Industrial Engineering)', shortCode: 'IE', ...GROUP_COLOR_PALETTE[0] };
      if (key === 'me') return { id: 'me', name: 'ME (Mechanical Engineering)', shortCode: 'ME', ...GROUP_COLOR_PALETTE[1] };
      if (key === 'ce') return { id: 'ce', name: 'CE (Civil Engineering)', shortCode: 'CE', ...GROUP_COLOR_PALETTE[2] };
      if (key === 'ee') return { id: 'ee', name: 'EE (Electrical Engineering)', shortCode: 'EE', ...GROUP_COLOR_PALETTE[3] };
      if (key === 'ece') return { id: 'ece', name: 'ECE (Electronics Engineering)', shortCode: 'ECE', ...GROUP_COLOR_PALETTE[4] };
      if (key === 'cpe') return { id: 'cpe', name: 'CPE (Computer Engineering)', shortCode: 'CPE', ...GROUP_COLOR_PALETTE[5] };

      // Preserve classic 4 house colors as fallback
      if (key === 'rankine') return { id: 'rankine', name: 'TEAM RANKINE', shortCode: 'R', ...GROUP_COLOR_PALETTE[1] };
      if (key === 'otto') return { id: 'otto', name: 'TEAM OTTO', shortCode: 'O', ...GROUP_COLOR_PALETTE[0] };
      if (key === 'brayton') return { id: 'brayton', name: 'TEAM BRAYTON', shortCode: 'B', ...GROUP_COLOR_PALETTE[2] };
      if (key === 'diesel') return { id: 'diesel', name: 'TEAM DIESEL', shortCode: 'D', ...GROUP_COLOR_PALETTE[3] };

      const evt = this.state.eventsCatalog?.[this.activeEventId];
      const foundIdx = evt && Array.isArray(evt.groups) ? evt.groups.findIndex(g => String(g.id).toLowerCase() === key) : -1;
      const foundObj = foundIdx >= 0 ? evt.groups[foundIdx] : null;

      let hash = 0;
      for (let i = 0; i < key.length; i++) {
        hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
      }
      const palIdx = fallbackIdx !== null && fallbackIdx >= 0
        ? fallbackIdx % GROUP_COLOR_PALETTE.length
        : (foundIdx >= 0 ? foundIdx % GROUP_COLOR_PALETTE.length : Math.abs(hash) % GROUP_COLOR_PALETTE.length);

      const pal = GROUP_COLOR_PALETTE[palIdx];
      const displayName = foundObj?.name || norm.name || raw.toUpperCase();
      const shortCode = foundObj?.shortCode || norm.shortCode || displayName.replace(/^(TEAM|GROUP|HOUSE|SECTION)\s+/i, '').substring(0, 3).toUpperCase();

      return {
        id: key,
        name: displayName,
        shortCode,
        ...pal
      };
    }

    // -----------------------------------------------------------------------
    // CSV / EXCEL (TSV) / JSON STUDENT ROSTER IMPORTER
    // -----------------------------------------------------------------------
    parseRosterText(rawText) {
      const text = String(rawText || '').trim();
      if (!text) return { headers: [], rows: [], suggestedMap: { codeCol: 0, nameCol: 1, groupCol: 2 }, hasHeader: true };

      // 1. Check if JSON
      if (text.startsWith('[') || text.startsWith('{')) {
        try {
          const parsed = JSON.parse(text);
          const arr = Array.isArray(parsed) ? parsed : (parsed.students ? Object.values(parsed.students) : []);
          if (arr.length > 0 && typeof arr[0] === 'object') {
            const headers = ['Student ID / Code', 'Full Name', 'Program / Group / Section'];
            const rows = arr.map((item, idx) => [
              String(item.studentCode || item.code || item.id || item.studentId || `STU-${String(idx + 1).padStart(4, '0')}`),
              String(item.name || item.fullName || item.studentName || ''),
              String(item.teamName || item.program || item.group || item.team || item.section || item.house || 'ME')
            ]).filter(r => r[1]);
            return { headers, rows, suggestedMap: { codeCol: 0, nameCol: 1, groupCol: 2 }, hasHeader: false, isJson: true };
          }
        } catch (e) {}
      }

      // 2. Parse delimited lines (CSV / TSV from Excel copy-paste)
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return { headers: [], rows: [], suggestedMap: { codeCol: 0, nameCol: 1, groupCol: 2 }, hasHeader: true };

      // Detect delimiter: tab, comma, or semicolon
      const firstLine = lines[0];
      let delimiter = ',';
      if (firstLine.includes('\t')) delimiter = '\t';
      else if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) delimiter = ';';

      const parseLine = (line) => {
        if (delimiter === '\t') return line.split('\t').map(c => c.trim().replace(/^"|"$/g, ''));
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (ch === delimiter && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += ch;
          }
        }
        result.push(cur.trim());
        return result;
      };

      const allRows = lines.map(parseLine).filter(r => r.some(cell => cell.length > 0));
      if (allRows.length === 0) return { headers: [], rows: [], suggestedMap: { codeCol: 0, nameCol: 1, groupCol: 2 }, hasHeader: true };

      const firstRowLower = allRows[0].map(c => c.toLowerCase());
      const looksLikeHeader = firstRowLower.some(c =>
        c.includes('name') || c.includes('id') || c.includes('code') || c.includes('student') ||
        c.includes('team') || c.includes('group') || c.includes('section') || c.includes('house') || c.includes('course') || c.includes('program')
      );

      const headers = looksLikeHeader
        ? allRows[0]
        : allRows[0].map((_, idx) => `Column ${idx + 1}`);
      const dataRows = looksLikeHeader ? allRows.slice(1) : allRows;

      // Auto-suggest column mapping
      let codeCol = 0;
      let nameCol = headers.length > 1 ? 1 : 0;
      let groupCol = headers.length > 2 ? 2 : -1;

      headers.forEach((h, idx) => {
        const hl = h.toLowerCase();
        if (hl.includes('code') || hl.includes('id') || hl.includes('number') || hl.includes('no.') || hl === 'lrn') {
          codeCol = idx;
        } else if (hl.includes('name') || hl.includes('student')) {
          nameCol = idx;
        } else if (hl.includes('program') || hl.includes('team') || hl.includes('group') || hl.includes('house') || hl.includes('section') || hl.includes('dept') || hl.includes('course') || hl.includes('year')) {
          groupCol = idx;
        }
      });

      return {
        headers,
        rows: dataRows,
        suggestedMap: { codeCol, nameCol, groupCol },
        hasHeader: looksLikeHeader
      };
    }

    importRosterData(rows, options = {}) {
      this.ensureEventsCatalogStructure();
      const mode = options.mode === 'replace' ? 'replace' : 'merge';
      const codeCol = typeof options.codeCol === 'number' ? options.codeCol : 0;
      const nameCol = typeof options.nameCol === 'number' ? options.nameCol : 1;
      const groupCol = typeof options.groupCol === 'number' ? options.groupCol : 2;
      const defaultGroup = (options.defaultGroup || 'ME').trim();

      const evt = this.getActiveEvent();
      if (mode === 'replace') {
        this.state.students = {};
        evt.students = this.state.students;
        evt.groups = DEFAULT_GROUPS.map(g => ({ ...g }));
      }

      let addedCount = 0;
      let updatedCount = 0;
      let nextSeq = Object.keys(this.state.students).length + 1;

      rows.forEach((row) => {
        if (!Array.isArray(row)) return;
        const rawName = String(nameCol >= 0 ? (row[nameCol] || '') : '').trim();
        const rawCode = String(codeCol >= 0 && codeCol !== nameCol ? (row[codeCol] || '') : '').trim();
        const rawGroup = String(groupCol >= 0 ? (row[groupCol] || '') : '').trim() || defaultGroup;

        if (!rawName && !rawCode) return;

        const studentCode = (rawCode || ('ID-' + String(nextSeq).padStart(4, '0'))).toUpperCase();
        const fullName = rawName || studentCode;
        const normGroup = normalizeGroupProgramKey(rawGroup);
        const groupId = normGroup.id;
        const groupDisplayName = normGroup.name;

        // Check if student already exists by code or id
        let existing = Object.values(this.state.students).find(
          s => (s.studentCode && s.studentCode.toUpperCase() === studentCode) || s.id === slugify(studentCode, '')
        );

        if (existing) {
          existing.name = fullName;
          existing.team = groupId;
          existing.teamName = groupDisplayName;
          existing.studentCode = studentCode;
          updatedCount++;
        } else {
          const id = 'stu_' + slugify(studentCode, String(nextSeq));
          this.state.students[id] = {
            id,
            name: fullName,
            team: groupId,
            teamName: groupDisplayName,
            studentCode,
            games: this.createEmptyGamesRecord(this.games)
          };
          addedCount++;
          nextSeq++;
        }
      });

      this.reconcileStudentGamesStructure();
      this.reconcileGroupsFromStudents();
      this.syncActiveBranchToCatalog();
      this.save();
      this.syncConfigWithServer().catch(() => {});

      return {
        success: true,
        addedCount,
        updatedCount,
        totalStudents: Object.keys(this.state.students).length
      };
    }

    addOrUpdateSingleStudent({ id, studentCode, name, groupName }) {
      const cleanName = String(name || '').trim();
      if (!cleanName) return { success: false, error: 'Student name is required.' };
      const nextNum = Object.keys(this.state.students || {}).length + 1;
      const cleanCode = String(studentCode || `ID-${String(nextNum).padStart(4, '0')}`).trim().toUpperCase();
      const cleanGroup = String(groupName || 'ME').trim();

      return this.importRosterData([[cleanCode, cleanName, cleanGroup]], {
        mode: 'merge',
        codeCol: 0,
        nameCol: 1,
        groupCol: 2
      });
    }

    // -----------------------------------------------------------------------
    // NETWORK & SYNC CONFIGURATION
    // -----------------------------------------------------------------------
    initNetworkListeners() {
      if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;

      window.addEventListener('online', () => {
        this.syncWithServer(true);
      });

      window.addEventListener('offline', () => {
        this.serverOnline = false;
        this.notify();
      });

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
          if (host && host.includes('github.io')) {
            return 'https://meodl.vercel.app';
          }
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
      return this.games.find(g => g.id === this.activeGameId) || this.games[0] || decorateSessionStyle({ id: 'd1-reg', name: 'D1 Morning Registration' }, 0);
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

    autoSelectGameByTime(forceByClock = false) {
      if (!forceByClock) {
        try {
          if (typeof localStorage !== 'undefined') {
            const storedEvent = localStorage.getItem('ENGDAY_ACTIVE_EVENT');
            if (storedEvent && this.state.eventsCatalog && this.state.eventsCatalog[storedEvent]) {
              this.setActiveEvent(storedEvent);
            }
            const storedGame = localStorage.getItem('ENGDAY_ACTIVE_GAME');
            if (storedGame && this.games.some(g => g.id === storedGame)) {
              this.activeGameId = storedGame;
              this.state.activeGameId = storedGame;
              return this.getActiveGame();
            }
          }
        } catch(e) {}
      }

      const now = new Date();
      let manilaDateIso = '2026-10-19';
      let hour = now.getHours();
      let minute = now.getMinutes();

      try {
        const parts = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Manila',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).formatToParts(now);
        const map = {};
        parts.forEach(p => { map[p.type] = p.value; });
        if (map.year && map.month && map.day) {
          manilaDateIso = `${map.year}-${map.month}-${map.day}`;
        }
        if (map.hour !== undefined) hour = parseInt(map.hour, 10) % 24;
        if (map.minute !== undefined) minute = parseInt(map.minute, 10);
      } catch (e) {}

      const timeVal = hour * 60 + minute;
      const isDay2 = manilaDateIso === '2026-10-20';

      let chosenId = null;
      if (isDay2 && this.games.some(g => g.id.startsWith('d2-'))) {
        if (timeVal < 570) chosenId = 'd2-am-palaro';            // Before 9:30 AM -> D2 PALARO (8:00 AM - 12:00 NN)
        else if (timeVal >= 570 && timeVal < 780) chosenId = 'd2-esports'; // 9:30 AM - 12:59 PM -> D2 ESPORTS
        else if (timeVal >= 780 && timeVal < 900) chosenId = 'd2-pageant'; // 1:00 PM - 2:59 PM -> D2 PAGEANT
        else chosenId = 'd2-colorfest';                          // 3:00 PM+ -> D2 COLORFEST
      } else if (this.games.some(g => g.id.startsWith('d1-'))) {
        if (timeVal < 520) chosenId = 'd1-reg';                  // Before 8:40 AM -> D1 REG (7:30 AM - 8:40 AM)
        else if (timeVal >= 520 && timeVal < 780) chosenId = 'd1-am-block'; // 8:40 AM - 12:59 PM -> D1 AM SPORTS
        else if (timeVal >= 780 && timeVal < 1050) chosenId = 'd1-pm-block'; // 1:00 PM - 5:29 PM -> D1 PM BLOCK
        else chosenId = 'd1-finals';                             // 5:30 PM+ -> D1 FINALS
      }

      if (!chosenId || !this.games.some(g => g.id === chosenId)) {
        chosenId = this.games[0]?.id || 'd1-reg';
      }

      this.activeGameId = chosenId;
      this.state.activeGameId = chosenId;
      if (typeof localStorage !== 'undefined') {
        try { localStorage.setItem('ENGDAY_ACTIVE_GAME', chosenId); } catch (e) {}
      }
      this.notify();
      return this.getActiveGame();
    }

    // -------------------------------------------------------------------------
    // 5. STATE INITIALIZATION & PERSISTENCE
    // -------------------------------------------------------------------------
    load() {
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && (parsed.students || parsed.eventsCatalog)) {
              this.state = {
                ...this.state,
                ...parsed
              };
              this.ensureEventsCatalogStructure();
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

    save(options = {}) {
      try {
        this.syncActiveBranchToCatalog();
        if (!options || !options.preserveVersion) {
          this.state.version = (this.state.version || 1) + 1;
        }
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

    createEmptyGamesRecord(sessionsList = null) {
      const list = sessionsList || this.games || ENGDAY_GAMES;
      const records = {};
      list.forEach(g => {
        records[g.id] = {
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
      });
      return records;
    }

    initDefaultRoster() {
      const students = this.buildDefaultStudentsMap(this.games);
      this.state.students = students;
      this.state.auditLog = [];
      this.ensureEventsCatalogStructure();
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
    // 6. FLEXIBLE QR SCAN & STUDENT LOOKUP (SAFEGUARD 1)
    // -------------------------------------------------------------------------
    getStudentById(id) {
      if (!id || !this.state.students) return null;
      if (this.state.students[id]) return this.state.students[id];
      const lower = String(id).trim().toLowerCase();
      return Object.values(this.state.students).find(s => String(s.id || '').toLowerCase() === lower) || null;
    }

    getStudentByCode(code) {
      if (!code || !this.state.students) return null;
      const clean = String(code).trim().toUpperCase();
      return Object.values(this.state.students).find(s => String(s.studentCode || '').trim().toUpperCase() === clean) || null;
    }

    getStudentByName(nameStr) {
      if (!nameStr || !this.state.students) return null;
      const normalize = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
      const target = normalize(nameStr);
      if (target.length < 3) return null;
      return Object.values(this.state.students).find(s => normalize(s.name) === target) || null;
    }

    getQRPayload(student) {
      if (!student) return '';
      return student.studentCode || student.id || '';
    }

    resolveScanPayload(payload) {
      if (!payload) return { error: 'EMPTY_PAYLOAD', message: 'No QR data received.' };

      const raw = String(payload).trim();
      if (!raw) return { error: 'EMPTY_PAYLOAD', message: 'Empty QR payload.' };

      let student = null;

      // 1. Direct match by Student Code or Student ID (handles any custom CSV/Excel ID format!)
      student = this.getStudentByCode(raw) || this.getStudentById(raw);

      // 2. JSON payload support: {"studentCode":"...", "code":"...", "id":"...", "name":"..."}
      if (!student && (raw.startsWith('{') && raw.endsWith('}'))) {
        try {
          const obj = JSON.parse(raw);
          const candidateCode = obj.studentCode || obj.code || obj.student_id || obj.studentNumber;
          const candidateId = obj.id || obj.studentId;
          const candidateName = obj.name || obj.fullName || obj.studentName;
          if (candidateCode) student = this.getStudentByCode(candidateCode) || this.getStudentById(candidateCode);
          if (!student && candidateId) student = this.getStudentById(candidateId) || this.getStudentByCode(candidateId);
          if (!student && candidateName) student = this.getStudentByName(candidateName);
        } catch (e) {}
      }

      // 3. URL / Query parameter / Path segment extraction
      if (!student && (raw.includes('://') || raw.includes('?') || raw.includes('=') || raw.includes('/'))) {
        try {
          const url = new URL(raw, 'https://meodl.uphsd');
          const pCode = url.searchParams.get('code') || url.searchParams.get('student') || url.searchParams.get('studentCode') || url.searchParams.get('id') || url.searchParams.get('studentId');
          if (pCode) {
            student = this.getStudentByCode(pCode) || this.getStudentById(pCode);
          }
          if (!student && url.pathname && url.pathname !== '/') {
            const parts = url.pathname.split('/').filter(Boolean);
            const lastSeg = decodeURIComponent(parts[parts.length - 1] || '');
            if (lastSeg) {
              student = this.getStudentByCode(lastSeg) || this.getStudentById(lastSeg);
            }
          }
        } catch (e) {
          const matchParam = raw.match(/(?:code|student|studentCode|id|studentId)=([a-zA-Z0-9_.-]+)/i);
          if (matchParam) {
            student = this.getStudentByCode(matchParam[1]) || this.getStudentById(matchParam[1]);
          }
        }
      }

      // 4. Delimited or Prefixed strings (e.g. "MEODL|MEODL-0033|PADUGA" or "ID: 2024-00123")
      if (!student && (raw.includes('|') || raw.includes(':') || raw.includes(';'))) {
        const tokens = raw.split(/[|:;]/).map(t => t.trim()).filter(Boolean);
        for (const tok of tokens) {
          student = this.getStudentByCode(tok) || this.getStudentById(tok);
          if (student) break;
        }
      }

      // 5. Token delegation to MEODL_ATTENDANCE (for legacy tok_... hashes)
      if (!student && window.MEODL_ATTENDANCE && typeof window.MEODL_ATTENDANCE.resolveScanPayload === 'function') {
        try {
          const meodlRes = window.MEODL_ATTENDANCE.resolveScanPayload(payload);
          if (meodlRes && meodlRes.student) {
            student = this.getStudentById(meodlRes.student.id) || this.getStudentByCode(meodlRes.student.studentCode) || this.getStudentByName(meodlRes.student.name);
          }
        } catch (e) {}
      }

      // 6. Numeric shorthand fallback (e.g. "0033" -> "MEODL-0033" or unique code suffix match)
      if (!student) {
        const numMatch = raw.match(/\b\d{3,6}\b/);
        if (numMatch) {
          const digits = numMatch[0];
          const padded4 = digits.padStart(4, '0');
          student = this.getStudentByCode('MEODL-' + padded4) || this.getStudentByCode('ID-' + padded4);
          if (!student) {
            const suffixMatches = Object.values(this.state.students || {}).filter(s => {
              const sc = String(s.studentCode || '');
              return sc === digits || sc.endsWith('-' + digits) || sc.endsWith( padded4);
            });
            if (suffixMatches.length === 1) student = suffixMatches[0];
          }
        }
      }

      // 7. Full Name match fallback
      if (!student) {
        student = this.getStudentByName(raw);
      }

      if (!student) {
        return {
          error: 'NOT_FOUND',
          message: `❌ QR / ID NOT REGISTERED\n"${raw.slice(0, 45)}" does not match any student in ${this.getActiveEvent().title}.`
        };
      }

      const activeGame = this.getActiveGame();
      if (!student.games) student.games = this.createEmptyGamesRecord();
      if (!student.games[activeGame.id]) {
        student.games[activeGame.id] = {
          gameId: activeGame.id,
          status: 'OUTSIDE',
          visits: 0,
          history: []
        };
      }
      const gameRecord = student.games[activeGame.id];

      return {
        success: true,
        student: student,
        activeGame: activeGame,
        gameRecord: gameRecord,
        statusInGame: gameRecord.status || 'OUTSIDE'
      };
    }

    // -------------------------------------------------------------------------
    // 7. RECORD CHECK-IN & CHECK-OUT (WITH SESSION MODE & AWAITED QUEUE FIX)
    // -------------------------------------------------------------------------
    createAttendanceEvent(student, gameId, action, options = {}) {
      const now = new Date();
      const isoTime = now.toISOString();
      const game = this.games.find(g => g.id === gameId) || this.getActiveGame();

      return {
        eventId: generateUUID('eng_evt_'),
        eventKey: this.activeEventId || 'engday_2026',
        gameId: game.id,
        gameName: game.name,
        sport: game.sport || game.category || 'general',
        studentId: student.id,
        studentCode: student.studentCode,
        studentName: student.name,
        team: student.team,
        teamName: student.teamName,
        action: action,
        occurredAt: isoTime,
        displayTime: formatManilaTime(now),
        displayDate: formatManilaDate(now),
        deviceId: this.deviceId,
        marshalId: options.performedBy || 'Court Marshal',
        court: game.court || 'Main Venue',
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
      if (!student.games) student.games = this.createEmptyGamesRecord();
      if (!student.games[gId]) student.games[gId] = { gameId: gId, status: 'OUTSIDE', visits: 0, history: [] };

      const gRecord = student.games[gId];

      // In Check-In Only mode, if already checked in and not explicitly forced, avoid duplicate check-in spam
      if (game.mode === 'check_in_only' && gRecord.status === 'INSIDE' && !options.forceRepeat) {
        return {
          success: true,
          alreadyCheckedIn: true,
          action: 'check_in',
          student: student,
          game: game,
          message: `✅ Already Checked In (${gRecord.displayCheckIn || 'Earlier'})`
        };
      }

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

      if (!this.state.auditLog) this.state.auditLog = [];
      this.state.auditLog.unshift({
        id: 'log_' + event.eventId,
        eventId: event.eventId,
        eventKey: this.activeEventId,
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

      // Properly chain IndexedDB persistence before triggering syncWithServer
      Promise.all([
        this.db.saveEvent(event),
        this.db.enqueuePending(event)
      ]).then(() => {
        return this.updatePendingCount();
      }).then(() => {
        if (this.config.syncEnabled && (typeof navigator === 'undefined' || navigator.onLine !== false)) {
          this.syncWithServer().catch(() => {});
        }
      }).catch(() => {});

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
      if (!student.games) student.games = this.createEmptyGamesRecord();
      if (!student.games[gId]) student.games[gId] = { gameId: gId, status: 'OUTSIDE', visits: 0, history: [] };

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
        reason: options.reason || 'Session Exit'
      };

      if (!gRecord.history) gRecord.history = [];
      gRecord.history.unshift(historyItem);

      if (!this.state.auditLog) this.state.auditLog = [];
      this.state.auditLog.unshift({
        id: 'log_' + event.eventId,
        eventId: event.eventId,
        eventKey: this.activeEventId,
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
        reason: options.reason || 'Session Exit'
      });
      if (this.state.auditLog.length > 500) this.state.auditLog.length = 500;

      this.save();

      Promise.all([
        this.db.saveEvent(event),
        this.db.enqueuePending(event)
      ]).then(() => {
        return this.updatePendingCount();
      }).then(() => {
        if (this.config.syncEnabled && (typeof navigator === 'undefined' || navigator.onLine !== false)) {
          this.syncWithServer().catch(() => {});
        }
      }).catch(() => {});

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
      if (!student.games) student.games = this.createEmptyGamesRecord();
      if (!student.games[gId]) student.games[gId] = { gameId: gId, status: 'OUTSIDE', visits: 0, history: [] };

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

      Promise.all([
        this.db.saveEvent(event),
        this.db.enqueuePending(event)
      ]).then(() => {
        return this.updatePendingCount();
      }).then(() => {
        if (this.config.syncEnabled && (typeof navigator === 'undefined' || navigator.onLine !== false)) {
          this.syncWithServer().catch(() => {});
        }
      }).catch(() => {});

      return { success: true, student: student, game: game };
    }

    async deleteScanEvent(eventId) {
      await this.db.deleteEvent(eventId);
      if (this.state.auditLog) {
        this.state.auditLog = this.state.auditLog.filter(l => l.eventId !== eventId);
      }
      await this.rederiveAllStatesFromDb();
      this.save();
      return true;
    }

    // -------------------------------------------------------------------------
    // 8. EVENT-SCOPED RESET & RE-DERIVATION (SAFEGUARD 2)
    // -------------------------------------------------------------------------
    async resetActiveEventAttendance(sessionIdFilter = null) {
      this.ensureEventsCatalogStructure();
      await this.db.clearEventsForEventKey(this.activeEventId, sessionIdFilter);

      Object.values(this.state.students || {}).forEach(s => {
        if (!s.games) s.games = this.createEmptyGamesRecord();
        if (sessionIdFilter) {
          s.games[sessionIdFilter] = {
            gameId: sessionIdFilter,
            status: 'OUTSIDE',
            lastAction: null,
            checkInTime: null,
            checkOutTime: null,
            displayCheckIn: null,
            displayCheckOut: null,
            visits: 0,
            history: []
          };
        } else {
          s.games = this.createEmptyGamesRecord();
        }
      });

      if (sessionIdFilter) {
        this.state.auditLog = (this.state.auditLog || []).filter(l => l.gameId !== sessionIdFilter);
      } else {
        this.state.auditLog = [];
      }

      this.save();
      await this.updatePendingCount();

      // Sync reset to server if online
      const base = this.getApiBaseUrl();
      if (base && (typeof navigator === 'undefined' || navigator.onLine !== false)) {
        try {
          await fetch(`${base}/api/engday/attendance/reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              confirmation: 'RESET_ENGDAY_ATTENDANCE',
              eventKey: this.activeEventId,
              sessionId: sessionIdFilter || null,
              keepRoster: true
            })
          });
        } catch (e) {}
      }

      return { success: true };
    }

    async rederiveAllStatesFromDb() {
      const allEvents = await this.db.getAllEvents();
      const activeEvents = allEvents.filter(e => (e.eventKey || 'engday_2026') === this.activeEventId);
      activeEvents.sort((a, b) => new Date(a.occurredAt) - new Date(b.occurredAt));

      Object.values(this.state.students).forEach(s => {
        s.games = this.createEmptyGamesRecord();
      });

      for (const ev of activeEvents) {
        this.applySingleEventToStudentState(ev);
      }

      this.save();
    }

    applySingleEventToStudentState(ev) {
      if (!ev || !this.state.students) return;
      const student = this.state.students[ev.studentId] || this.getStudentByCode(ev.studentCode);
      if (!student) return;
      const gId = ev.gameId;
      if (!student.games) student.games = this.createEmptyGamesRecord();
      if (!student.games[gId]) {
        student.games[gId] = {
          gameId: gId,
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

      const gRecord = student.games[gId];
      if (!gRecord.history) gRecord.history = [];
      if (ev.eventId && gRecord.history.some(h => h.eventId === ev.eventId)) {
        return; // Already applied
      }

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
          gRecord.visits = (gRecord.visits || 0) + 1;
        } else {
          gRecord.checkOutTime = ev.occurredAt;
          gRecord.displayCheckOut = timeStr;
        }
      }

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

    // -------------------------------------------------------------------------
    // 9. DYNAMIC METRICS & ANALYTICS COMPUTATION
    // -------------------------------------------------------------------------
    calculateStats(gameIdFilter = null) {
      const students = Object.values(this.state.students || {});
      const totalStudents = students.length;
      const groups = this.getGroups();

      const gameStats = {};
      this.games.forEach(g => {
        const byTeam = {};
        groups.forEach(grp => {
          byTeam[grp.id] = { inside: 0, total: 0, memberCount: grp.count || 0, group: grp };
        });
        // Ensure classic keys always exist to prevent any legacy caller undefined access
        ['rankine', 'otto', 'brayton', 'diesel'].forEach(k => {
          if (!byTeam[k]) byTeam[k] = { inside: 0, total: 0, memberCount: 0 };
        });

        gameStats[g.id] = {
          game: g,
          totalCheckIns: 0,
          insideCount: 0,
          outsideCount: 0,
          byTeam
        };
      });

      let totalUniqueAttendees = 0;

      students.forEach(s => {
        let attendedAny = false;
        const teamKey = String(s.team || 'general').toLowerCase();

        this.games.forEach(g => {
          const gr = s.games && s.games[g.id];
          const st = gameStats[g.id];
          if (!st) return;

          if (!st.byTeam[teamKey]) {
            st.byTeam[teamKey] = { inside: 0, total: 0, memberCount: 0, group: this.getGroupStyle(teamKey) };
          }

          if (gr && gr.visits > 0) {
            st.totalCheckIns++;
            attendedAny = true;
            st.byTeam[teamKey].total++;
          }
          if (gr && gr.status === 'INSIDE') {
            st.insideCount++;
            st.byTeam[teamKey].inside++;
          } else if (gr && gr.visits > 0) {
            st.outsideCount++;
          }
        });
        if (attendedAny) totalUniqueAttendees++;
      });

      const targetGameId = gameIdFilter || this.activeGameId;
      const targetStats = gameStats[targetGameId] || Object.values(gameStats)[0] || {
        game: this.getActiveGame(),
        totalCheckIns: 0,
        insideCount: 0,
        outsideCount: 0,
        byTeam: {}
      };

      return {
        totalStudents,
        totalUniqueAttendees,
        participationRate: totalStudents > 0 ? Math.round((totalUniqueAttendees / totalStudents) * 100) : 0,
        activeEvent: this.getActiveEvent(),
        activeGame: this.getActiveGame(),
        activeGameStats: targetStats,
        allGamesStats: gameStats,
        groups
      };
    }

    async getStudentHistory(studentId, gameIdFilter = null) {
      const student = this.getStudentById(studentId);
      if (!student) return [];

      let events = await this.db.getAllEvents();
      events = events.filter(e => e.studentId === studentId && (e.eventKey || 'engday_2026') === this.activeEventId);
      if (gameIdFilter) events = events.filter(e => e.gameId === gameIdFilter);

      // Also include any history stored directly on student.games in case imported from state snapshot
      const seenIds = new Set(events.map(e => e.eventId));
      const targetGames = gameIdFilter ? [gameIdFilter] : Object.keys(student.games || {});
      targetGames.forEach(gId => {
        const gr = student.games && student.games[gId];
        const gameObj = this.games.find(g => g.id === gId);
        if (gr && Array.isArray(gr.history)) {
          gr.history.forEach(h => {
            if (h.eventId && !seenIds.has(h.eventId)) {
              seenIds.add(h.eventId);
              events.push({
                eventId: h.eventId,
                gameId: gId,
                gameName: h.gameName || (gameObj ? gameObj.name : gId),
                action: h.action,
                occurredAt: h.timestamp,
                marshalId: h.performedBy,
                method: h.method,
                court: h.court,
                reason: h.reason
              });
            }
          });
        }
      });

      events.sort((a, b) => new Date(b.occurredAt || 0) - new Date(a.occurredAt || 0));

      return events.map(e => ({
        eventId: e.eventId,
        gameId: e.gameId,
        gameName: e.gameName || (this.games.find(g => g.id === e.gameId)?.name || e.gameId),
        action: e.action,
        timestamp: e.occurredAt,
        displayTime: formatManilaTime(e.occurredAt),
        displayDate: formatManilaDate(e.occurredAt),
        performedBy: e.marshalId || 'Marshal',
        method: e.method,
        court: e.court,
        reason: e.reason
      }));
    }

    async getRecentScans(gameIdFilter = null, limit = 50) {
      let events = await this.db.getAllEvents();
      events = events.filter(e => (e.eventKey || 'engday_2026') === this.activeEventId);
      if (gameIdFilter) events = events.filter(e => e.gameId === gameIdFilter);
      events.sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
      return events.slice(0, limit).map(e => ({
        ...e,
        displayTime: formatManilaTime(e.occurredAt),
        displayDate: formatManilaDate(e.occurredAt)
      }));
    }

    // -------------------------------------------------------------------------
    // ANTI-CUTTING & DWELL-TIME TRACKING HELPER
    // -------------------------------------------------------------------------
    getSessionDwellStats(student, sessionId, options = {}) {
      const minMinutesRequired = typeof options.minMinutesRequired === 'number' ? options.minMinutesRequired : 45;
      const maxBreakMinutes = typeof options.maxBreakMinutes === 'number' ? options.maxBreakMinutes : 20;
      const nowMs = (options.now ? new Date(options.now) : new Date()).getTime();

      const defaultStats = {
        dwellMinutes: 0,
        awayMinutes: 0,
        currentAwayMinutes: 0,
        exitsCount: 0,
        isFlagged: false,
        creditStatus: 'ABSENT',
        status: 'OUTSIDE',
        hasScanned: false,
        maxBreakMinutes: 0,
        minMinutesRequired
      };

      if (!student || !sessionId) return defaultStats;
      const gRecord = student.games && student.games[sessionId];
      if (!gRecord) return defaultStats;

      const hasScanned = Boolean(
        (gRecord.visits && gRecord.visits > 0) ||
        gRecord.checkInTime ||
        (Array.isArray(gRecord.history) && gRecord.history.length > 0)
      );

      if (!hasScanned) {
        return defaultStats;
      }

      // Collect raw events and sort chronologically (oldest -> newest)
      let events = [];
      if (Array.isArray(gRecord.history) && gRecord.history.length > 0) {
        events = gRecord.history.map(h => ({
          action: h.action,
          timestamp: h.timestamp || h.occurredAt,
          newStatus: h.newStatus,
          reason: h.reason
        })).filter(h => h.timestamp && !isNaN(new Date(h.timestamp).getTime()));
        events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      }

      // If no valid history logs exist but checkInTime exists (e.g. from imported snapshot)
      if (events.length === 0) {
        if (gRecord.checkInTime) {
          events.push({ action: 'check_in', timestamp: gRecord.checkInTime });
        }
        if (gRecord.checkOutTime) {
          events.push({ action: 'check_out', timestamp: gRecord.checkOutTime });
        }
        events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      }

      let dwellMs = 0;
      let awayMs = 0;
      let exitsCount = 0;
      let maxBreakMinutesSeen = 0;
      let lastInTime = null;
      let lastOutTime = null;
      let isInside = false;

      events.forEach(ev => {
        const t = new Date(ev.timestamp).getTime();
        const isInAction = ev.action === 'check_in' || (ev.action === 'manual_override' && (ev.newStatus === 'INSIDE' || (ev.reason && ev.reason.includes('INSIDE'))));
        const isOutAction = ev.action === 'check_out' || (ev.action === 'manual_override' && (ev.newStatus === 'OUTSIDE' || (ev.reason && ev.reason.includes('OUTSIDE'))));

        if (isInAction) {
          if (lastOutTime !== null) {
            const breakDurationMs = Math.max(0, t - lastOutTime);
            awayMs += breakDurationMs;
            const breakMins = Math.round(breakDurationMs / 60000);
            if (breakMins > maxBreakMinutesSeen) {
              maxBreakMinutesSeen = breakMins;
            }
            lastOutTime = null;
          }
          if (!isInside) {
            lastInTime = t;
            isInside = true;
          }
        } else if (isOutAction) {
          exitsCount++;
          if (isInside && lastInTime !== null) {
            const insideDurationMs = Math.max(0, t - lastInTime);
            dwellMs += insideDurationMs;
            lastInTime = null;
            isInside = false;
          }
          lastOutTime = t;
        }
      });

      // Synchronize with current live state
      const currentStatus = gRecord.status || (isInside ? 'INSIDE' : 'OUTSIDE');
      let currentAwayMinutes = 0;

      if (currentStatus === 'INSIDE') {
        if (lastInTime !== null) {
          const activeElapsed = Math.max(0, nowMs - lastInTime);
          dwellMs += activeElapsed;
        } else if (gRecord.checkInTime) {
          const t = new Date(gRecord.checkInTime).getTime();
          if (!isNaN(t)) {
            const activeElapsed = Math.max(0, nowMs - t);
            dwellMs += activeElapsed;
          }
        }
      } else {
        // Currently OUTSIDE
        let outRefTime = lastOutTime;
        if (outRefTime === null && gRecord.checkOutTime) {
          const t = new Date(gRecord.checkOutTime).getTime();
          if (!isNaN(t)) outRefTime = t;
        }
        if (outRefTime !== null) {
          const elapsedAwayMs = Math.max(0, nowMs - outRefTime);
          awayMs += elapsedAwayMs;
          currentAwayMinutes = Math.round(elapsedAwayMs / 60000);
          if (currentAwayMinutes > maxBreakMinutesSeen) {
            maxBreakMinutesSeen = currentAwayMinutes;
          }
        }
      }

      const dwellMinutes = Math.max(0, Math.round(dwellMs / 60000));
      const awayMinutes = Math.max(0, Math.round(awayMs / 60000));

      const breakLimitExceeded = maxBreakMinutesSeen > maxBreakMinutes;
      const checkedOutUnderTime = (currentStatus === 'OUTSIDE' && exitsCount > 0 && dwellMinutes < minMinutesRequired);
      const isFlagged = breakLimitExceeded || checkedOutUnderTime;

      let creditStatus = 'UNDER_TIME';
      if (!hasScanned) {
        creditStatus = 'ABSENT';
      } else if (dwellMinutes >= minMinutesRequired && !breakLimitExceeded) {
        creditStatus = 'VERIFIED';
      } else {
        creditStatus = 'UNDER_TIME';
      }

      return {
        dwellMinutes,
        awayMinutes,
        currentAwayMinutes,
        exitsCount,
        isFlagged,
        creditStatus,
        status: currentStatus,
        hasScanned: true,
        maxBreakMinutes: maxBreakMinutesSeen,
        minMinutesRequired
      };
    }

    // -------------------------------------------------------------------------
    // 10. EVENT-SCOPED EXPORT & BACKUP (CSV & JSON)
    // -------------------------------------------------------------------------
    exportCSV(gameIdFilter = null) {
      const students = Object.values(this.state.students || {});
      const targetGames = gameIdFilter ? this.games.filter(g => g.id === gameIdFilter) : this.games;
      const evt = this.getActiveEvent();

      let csv = 'Event,Student ID,Full Name,Group ID,Group / Section Name';
      targetGames.forEach(g => {
        const cleanLabel = String(g.shortName || g.name).replace(/"/g, '""');
        csv += `,"${cleanLabel} Status","${cleanLabel} Check-In","${cleanLabel} Check-Out","${cleanLabel} Visits","${cleanLabel} Dwell (Mins)","${cleanLabel} Credit Status"`;
      });
      csv += ',Total Sessions Attended\r\n';

      students.forEach(s => {
        let attendedCount = 0;
        const safeEventTitle = String(evt.title || 'Event').replace(/"/g, '""');
        const safeCode = String(s.studentCode || s.id).replace(/"/g, '""');
        const safeName = String(s.name || '').replace(/"/g, '""');
        const safeTeam = String(s.team || '').toUpperCase().replace(/"/g, '""');
        const safeTeamName = String(s.teamName || s.team || '').replace(/"/g, '""');

        let row = `"${safeEventTitle}","${safeCode}","${safeName}","${safeTeam}","${safeTeamName}"`;

        targetGames.forEach(g => {
          const gr = (s.games && s.games[g.id]) || {};
          const status = gr.status || 'OUTSIDE';
          const inTime = gr.displayCheckIn || (gr.checkInTime ? formatManilaTime(gr.checkInTime) : '');
          const outTime = gr.displayCheckOut || (gr.checkOutTime ? formatManilaTime(gr.checkOutTime) : '');
          const visits = gr.visits || 0;
          if (visits > 0) attendedCount++;

          const dwellStats = this.getSessionDwellStats(s, g.id);
          row += `,"${status}","${inTime}","${outTime}",${visits},${dwellStats.dwellMinutes},"${dwellStats.creditStatus}"`;
        });

        row += `,${attendedCount}\r\n`;
        csv += row;
      });

      return csv;
    }

    downloadCSV(gameIdFilter = null) {
      const csv = this.exportCSV(gameIdFilter);
      const evtSlug = slugify(this.getActiveEvent().title, 'Attendance');
      const tag = gameIdFilter ? `_${gameIdFilter.toUpperCase()}` : '_ALL_SESSIONS';
      const filename = `${evtSlug}${tag}_${new Date().toISOString().slice(0, 10)}.csv`;
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
      this.syncActiveBranchToCatalog();
      return JSON.stringify({
        exportedAt: new Date().toISOString(),
        deviceId: this.deviceId,
        activeEventId: this.activeEventId,
        state: this.state
      }, null, 2);
    }

    downloadJSON(customFilename = null) {
      const json = this.exportJSON();
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const evtSlug = slugify(this.getActiveEvent().title, 'Attendance');
      const filename = customFilename || `${evtSlug}_Backup_${now.toISOString().slice(0, 10)}_${timeStr}.json`;

      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.position = 'fixed';
      a.style.top = '-9999px';
      a.style.left = '-9999px';
      a.style.opacity = '0';
      a.style.pointerEvents = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);

      try {
        a.click();
      } catch (e) {
        try {
          a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        } catch (e2) {}
      }

      setTimeout(() => {
        try {
          if (a.parentNode) a.parentNode.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (e) {}
      }, 4000);

      return filename;
    }

    importBackupJSON(jsonData) {
      return this.importJSON(jsonData);
    }

    importJSON(jsonData) {
      try {
        let parsed = jsonData;
        if (typeof jsonData === 'string') {
          parsed = JSON.parse(jsonData);
        }
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid JSON data format');
        }

        // Restore eventsCatalog if included in backup
        if (parsed.state && parsed.state.eventsCatalog && typeof parsed.state.eventsCatalog === 'object') {
          Object.entries(parsed.state.eventsCatalog).forEach(([evtId, evtObj]) => {
            if (!this.state.eventsCatalog[evtId]) {
              this.state.eventsCatalog[evtId] = evtObj;
            } else {
              // Merge sessions
              if (Array.isArray(evtObj.sessions) && evtObj.sessions.length > 0) {
                this.state.eventsCatalog[evtId].sessions = evtObj.sessions.map((s, i) => decorateSessionStyle(s, i));
              }
              if (Array.isArray(evtObj.groups) && evtObj.groups.length > 0) {
                this.state.eventsCatalog[evtId].groups = evtObj.groups;
              }
            }
          });
          if (parsed.activeEventId && this.state.eventsCatalog[parsed.activeEventId]) {
            this.activeEventId = parsed.activeEventId;
            this.state.activeEventId = parsed.activeEventId;
          }
          this.ensureEventsCatalogStructure();
        }

        let incomingStudents = null;
        if (parsed.state && parsed.state.students && typeof parsed.state.students === 'object') {
          incomingStudents = parsed.state.students;
        } else if (parsed.students && typeof parsed.students === 'object') {
          incomingStudents = parsed.students;
        }

        if (!incomingStudents || Object.keys(incomingStudents).length === 0) {
          throw new Error('No valid student attendance records found in backup.');
        }

        let mergedScans = 0;
        let studentsUpdated = 0;
        const eventsToQueue = [];

        Object.keys(incomingStudents).forEach(id => {
          const incoming = incomingStudents[id];
          if (!this.state.students[id]) {
            this.state.students[id] = incoming;
            studentsUpdated++;
          } else {
            const current = this.state.students[id];
            if (incoming.games) {
              if (!current.games) current.games = this.createEmptyGamesRecord();
              Object.keys(incoming.games).forEach(gId => {
                const inGame = incoming.games[gId];
                const curGame = current.games[gId];
                if (!curGame) {
                  current.games[gId] = inGame;
                  if (inGame.visits > 0 || inGame.status === 'INSIDE') mergedScans++;
                } else {
                  const incomingHasScans = (inGame.visits > (curGame.visits || 0)) ||
                    (inGame.status === 'INSIDE' && curGame.status !== 'INSIDE') ||
                    (inGame.checkInTime && !curGame.checkInTime);

                  if (incomingHasScans) {
                    current.games[gId] = { ...curGame, ...inGame };
                    mergedScans++;
                  }
                }
                if (inGame && Array.isArray(inGame.history)) {
                  inGame.history.forEach(h => {
                    if (h && h.eventId) {
                      eventsToQueue.push({
                        eventId: h.eventId,
                        eventKey: this.activeEventId,
                        gameId: gId,
                        studentId: id,
                        studentCode: incoming.studentCode || current.studentCode,
                        studentName: incoming.name || current.name,
                        team: incoming.team || current.team,
                        action: h.action || 'check_in',
                        occurredAt: h.timestamp || new Date().toISOString(),
                        marshalId: h.performedBy || 'Backup Restore',
                        court: h.court || 'Court',
                        reason: h.reason || null
                      });
                    }
                  });
                }
              });
            }
            studentsUpdated++;
          }
        });

        if (parsed.state && Array.isArray(parsed.state.auditLog)) {
          const existingIds = new Set((this.state.auditLog || []).map(a => a.eventId || a.id));
          parsed.state.auditLog.forEach(item => {
            const key = item.eventId || item.id;
            if (!key || !existingIds.has(key)) {
              if (!this.state.auditLog) this.state.auditLog = [];
              this.state.auditLog.push(item);
            }
          });
        }

        this.reconcileStudentGamesStructure();
        this.reconcileGroupsFromStudents();
        this.save();

        // Enqueue restored scan events so they also push to the Cloud Server
        if (eventsToQueue.length > 0) {
          Promise.all(eventsToQueue.map(ev => this.db.enqueuePending(ev))).then(() => {
            this.updatePendingCount();
            this.syncWithServer().catch(() => {});
          });
        }

        return {
          success: true,
          studentsUpdated,
          mergedScans,
          eventsCount: mergedScans,
          studentsCount: studentsUpdated,
          totalStudents: Object.keys(this.state.students).length,
          timestamp: new Date().toISOString()
        };
      } catch (err) {
        console.error('[EngDay] Failed to import JSON:', err);
        return {
          success: false,
          error: err.message
        };
      }
    }

    // -------------------------------------------------------------------------
    // 11. REAL-TIME CLOUD AUTO-SYNC CLIENT (SSE + DEDUPLICATED OUTBOX)
    // -------------------------------------------------------------------------
    startSyncLoop() {
      if (typeof window === 'undefined' || typeof setInterval === 'undefined') return;
      if (this.syncTimer && typeof clearInterval !== 'undefined') clearInterval(this.syncTimer);

      this.syncTimer = setInterval(() => {
        if (this.config.syncEnabled && (typeof navigator === 'undefined' || navigator.onLine !== false)) {
          this.syncWithServer();
        }
      }, this.config.syncIntervalMs || 3500);

      if (typeof navigator === 'undefined' || navigator.onLine !== false) {
        setTimeout(() => this.syncWithServer(), 600);
      }
      this.initSseStream();
    }

    initSseStream() {
      if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
      const base = this.getApiBaseUrl();
      if (!base) {
        if (this.sseSource) {
          try { this.sseSource.close(); } catch(e) {}
          this.sseSource = null;
        }
        return;
      }

      if (this.sseSource) {
        try { this.sseSource.close(); } catch(e) {}
        this.sseSource = null;
      }

      try {
        const streamUrl = `${base}/api/engday/attendance/stream`;
        const sse = new EventSource(streamUrl);
        this.sseSource = sse;

        sse.onopen = () => {
          this.serverOnline = true;
          this.notify();
        };

        sse.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.state) {
              await this.reconcileServerState(data.state);
            }
          } catch(err) {
            console.warn('[EngDay SSE] Parse error:', err);
          }
        };

        sse.onerror = () => {
          if (this.config.syncEnabled) {
            this.syncWithServer();
          }
        };
      } catch(e) {
        console.warn('[EngDay SSE] Init error:', e);
      }
    }

    async collectAllLocalEventsForEvent(eventKey = null) {
      const targetEventKey = eventKey || this.activeEventId || 'engday_2026';
      const byId = new Map();

      try {
        const dbEvents = await this.db.getAllEvents();
        dbEvents.forEach(ev => {
          if (ev && ev.eventId && (ev.eventKey || 'engday_2026') === targetEventKey) {
            byId.set(ev.eventId, ev);
          }
        });
      } catch (e) {}

      // Also harvest any events stored in student game history or auditLog (e.g. from localStorage / JSON backup)
      const students = Object.values(this.state.students || {});
      students.forEach(s => {
        if (!s || !s.games) return;
        Object.entries(s.games).forEach(([gId, gr]) => {
          if (!gr) return;
          if (Array.isArray(gr.history) && gr.history.length > 0) {
            gr.history.forEach(h => {
              if (!h) return;
              const evId = h.eventId || `SYNTH_${targetEventKey}_${gId}_${s.id}_${h.timestamp || gr.checkInTime || '1'}`;
              if (!byId.has(evId)) {
                byId.set(evId, {
                  eventId: evId,
                  eventKey: targetEventKey,
                  gameId: gId,
                  studentId: s.id,
                  studentCode: s.studentCode || s.id,
                  studentName: s.name,
                  team: s.team,
                  action: h.action || (gr.status === 'INSIDE' ? 'check_in' : 'check_out'),
                  occurredAt: h.timestamp || gr.checkInTime || new Date().toISOString(),
                  marshalId: h.performedBy || 'Local Recovery',
                  method: h.method || 'qr_scan',
                  court: h.court || 'Gymnasium',
                  reason: h.reason || null
                });
              }
            });
          } else if ((gr.visits && gr.visits > 0) || gr.status === 'INSIDE') {
            const evId = `SYNTH_${targetEventKey}_${gId}_${s.id}_${gr.checkInTime || 'checkin'}`;
            if (!byId.has(evId)) {
              byId.set(evId, {
                eventId: evId,
                eventKey: targetEventKey,
                gameId: gId,
                studentId: s.id,
                studentCode: s.studentCode || s.id,
                studentName: s.name,
                team: s.team,
                action: gr.status === 'INSIDE' ? 'check_in' : (gr.lastAction || 'check_in'),
                occurredAt: gr.checkOutTime || gr.checkInTime || new Date().toISOString(),
                marshalId: 'Local Recovery',
                method: 'qr_scan',
                court: 'Gymnasium',
                reason: null
              });
            }
          }
        });
      });

      const list = Array.from(byId.values());
      list.sort((a, b) => new Date(a.occurredAt || 0) - new Date(b.occurredAt || 0));
      return list;
    }

    mergeStudentRecordNonDestructive(localStudent, serverStudent) {
      if (!localStudent) return serverStudent;
      if (!serverStudent) return localStudent;

      const merged = {
        ...serverStudent,
        ...localStudent,
        id: localStudent.id || serverStudent.id,
        studentCode: localStudent.studentCode || serverStudent.studentCode,
        name: localStudent.name || serverStudent.name,
        team: localStudent.team || serverStudent.team,
        teamName: localStudent.teamName || serverStudent.teamName,
        games: {}
      };

      const allGameIds = new Set([
        ...this.games.map(g => g.id),
        ...Object.keys(localStudent.games || {}),
        ...Object.keys(serverStudent.games || {})
      ]);

      allGameIds.forEach(gId => {
        const lGame = localStudent.games && localStudent.games[gId];
        const sGame = serverStudent.games && serverStudent.games[gId];

        if (!lGame && !sGame) return;
        if (!sGame) {
          merged.games[gId] = lGame;
          return;
        }
        if (!lGame) {
          merged.games[gId] = sGame;
          return;
        }

        const lVisits = lGame.visits || 0;
        const sVisits = sGame.visits || 0;
        const lLastTime = new Date(lGame.checkOutTime || lGame.checkInTime || 0).getTime();
        const sLastTime = new Date(sGame.checkOutTime || sGame.checkInTime || 0).getTime();

        // Deduplicate & combine history entries from both local and server
        const histMap = new Map();
        (Array.isArray(sGame.history) ? sGame.history : []).forEach(h => {
          if (h) histMap.set(h.eventId || `${h.timestamp}_${h.action}`, h);
        });
        (Array.isArray(lGame.history) ? lGame.history : []).forEach(h => {
          if (h) histMap.set(h.eventId || `${h.timestamp}_${h.action}`, h);
        });
        const combinedHistory = Array.from(histMap.values()).sort(
          (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
        );

        const localIsNewerOrFuller =
          (lVisits > sVisits) ||
          (lLastTime > sLastTime) ||
          (lGame.status === 'INSIDE' && sVisits === 0);

        const baseGame = localIsNewerOrFuller ? { ...sGame, ...lGame } : { ...lGame, ...sGame };
        baseGame.visits = Math.max(lVisits, sVisits);
        baseGame.checkInTime = lGame.checkInTime && sGame.checkInTime
          ? (new Date(lGame.checkInTime) > new Date(sGame.checkInTime) ? lGame.checkInTime : sGame.checkInTime)
          : (lGame.checkInTime || sGame.checkInTime || null);
        baseGame.displayCheckIn = lGame.displayCheckIn || sGame.displayCheckIn || (baseGame.checkInTime ? formatManilaTime(baseGame.checkInTime) : null);
        baseGame.checkOutTime = lGame.checkOutTime && sGame.checkOutTime
          ? (new Date(lGame.checkOutTime) > new Date(sGame.checkOutTime) ? lGame.checkOutTime : sGame.checkOutTime)
          : (lGame.checkOutTime || sGame.checkOutTime || null);
        baseGame.displayCheckOut = lGame.displayCheckOut || sGame.displayCheckOut || (baseGame.checkOutTime ? formatManilaTime(baseGame.checkOutTime) : null);
        baseGame.history = combinedHistory;

        merged.games[gId] = baseGame;
      });

      return merged;
    }

    async reconcileServerState(serverState) {
      if (!serverState) return;
      const serverVer = serverState.version || 0;

      // Sync custom eventsCatalog without ever wiping local sessions or rosters on cold-start
      if (serverState.eventsCatalog && typeof serverState.eventsCatalog === 'object') {
        Object.entries(serverState.eventsCatalog).forEach(([evtId, sEvt]) => {
          const localEvt = this.state.eventsCatalog?.[evtId];
          if (!localEvt) {
            this.state.eventsCatalog[evtId] = {
              ...sEvt,
              sessions: (sEvt.sessions || ENGDAY_GAMES).map((s, i) => decorateSessionStyle(s, i)),
              students: sEvt.students || {}
            };
          } else {
            const sTime = new Date(sEvt.updatedAt || 0).getTime();
            const lTime = new Date(localEvt.updatedAt || 0).getTime();
            const mergedEvtStudents = { ...(localEvt.students || {}) };
            if (sEvt.students && typeof sEvt.students === 'object') {
              Object.entries(sEvt.students).forEach(([sId, sStudent]) => {
                mergedEvtStudents[sId] = this.mergeStudentRecordNonDestructive(mergedEvtStudents[sId], sStudent);
              });
            }
            const useServerMeta = sTime > lTime && (!sEvt.schemaVersion || sEvt.schemaVersion === SCHEMA_VERSION);
            this.state.eventsCatalog[evtId] = {
              ...localEvt,
              ...(useServerMeta ? sEvt : {}),
              schemaVersion: SCHEMA_VERSION,
              sessions: (useServerMeta && Array.isArray(sEvt.sessions) && sEvt.sessions.length > 0
                ? sEvt.sessions
                : (localEvt.sessions || ENGDAY_GAMES)
              ).map((s, i) => decorateSessionStyle(s, i)),
              students: mergedEvtStudents
            };
          }
        });
      }

      if (serverState.activeEventId && this.state.eventsCatalog[serverState.activeEventId]) {
        // Only switch activeEventId if server version is genuinely ahead of initial cold start (version > 1)
        if ((serverState.version || 0) > 1 || !this.activeEventId) {
          this.activeEventId = serverState.activeEventId;
          this.state.activeEventId = serverState.activeEventId;
        }
      }

      this.ensureEventsCatalogStructure();

      // Determine server's student map for the active event
      const incomingStudents = (serverState.eventsCatalog && serverState.eventsCatalog[this.activeEventId]?.students)
        || (this.activeEventId === 'engday_2026' ? serverState.students : null);

      // Count local vs server scan events & visits BEFORE overwriting so we can detect Vercel cold-starts
      const localEvents = await this.collectAllLocalEventsForEvent(this.activeEventId);
      const localStudentsMap = this.state.students || {};
      const localStudentCount = Object.keys(localStudentsMap).length;
      const incomingStudentCount = incomingStudents ? Object.keys(incomingStudents).length : 0;

      let localVisitsSum = 0;
      Object.values(localStudentsMap).forEach(s => {
        Object.values(s?.games || {}).forEach(gr => {
          localVisitsSum += (gr?.visits || 0);
        });
      });

      let serverVisitsSum = 0;
      if (incomingStudents && typeof incomingStudents === 'object') {
        Object.values(incomingStudents).forEach(s => {
          Object.values(s?.games || {}).forEach(gr => {
            serverVisitsSum += (gr?.visits || 0);
          });
        });
      }

      const serverEventsCount = typeof serverState.eventsCount === 'number'
        ? serverState.eventsCount
        : (Array.isArray(serverState.events) ? serverState.events.length : serverVisitsSum);

      // Non-destructively merge students so a cold-started server NEVER wipes local scans or custom rosters
      if (incomingStudents && typeof incomingStudents === 'object') {
        const mergedStudents = { ...localStudentsMap };
        Object.entries(incomingStudents).forEach(([sId, sObj]) => {
          mergedStudents[sId] = this.mergeStudentRecordNonDestructive(mergedStudents[sId], sObj);
        });
        this.state.students = mergedStudents;
        if (this.state.eventsCatalog[this.activeEventId]) {
          this.state.eventsCatalog[this.activeEventId].students = mergedStudents;
        }
      }

      // Re-apply any local events (including IndexedDB events and pending outbox) so nothing is lost
      for (const ev of localEvents) {
        this.applySingleEventToStudentState(ev);
      }
      const pending = await this.db.getPendingQueue();
      pending.forEach(ev => {
        if ((ev.eventKey || 'engday_2026') === this.activeEventId) {
          this.applySingleEventToStudentState(ev);
        }
      });

      this.reconcileStudentGamesStructure();
      this.reconcileGroupsFromStudents();
      this.state.version = Math.max(this.state.version || 1, serverVer);
      this.lastSyncedServerVersion = this.state.version;
      this.state.lastUpdated = serverState.lastUpdated || new Date().toISOString();
      this.serverOnline = true;
      this.lastSyncTime = formatManilaTime(new Date());
      this.save({ preserveVersion: true });

      // VERCEL COLD-START SELF-HEALING:
      // If the server has fewer recorded scan events or visits than this device's saved history,
      // or is missing custom imported students, automatically re-push config/roster and all local scan events!
      const serverMissingEvents = (localEvents.length > serverEventsCount) || (localVisitsSum > serverVisitsSum);
      const serverMissingRoster = localStudentCount > incomingStudentCount;

      if ((serverMissingEvents || serverMissingRoster) && !this._isSelfHealing) {
        this._isSelfHealing = true;
        try {
          console.info(`[EngDay Self-Heal] Server has ${serverEventsCount} events / ${serverVisitsSum} visits vs local ${localEvents.length} events / ${localVisitsSum} visits. Healing server...`);
          await this.syncConfigWithServer();
          if (localEvents.length > 0) {
            await Promise.all(localEvents.map(ev => this.db.enqueuePending(ev)));
            await this.updatePendingCount();
            const base = this.getApiBaseUrl();
            if (base) {
              const { deduplicated } = this.deduplicatePendingQueue(localEvents);
              const healRes = await fetch(`${base}/api/engday/attendance/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  deviceId: this.deviceId,
                  activeEventId: this.activeEventId,
                  events: deduplicated
                })
              });
              if (healRes.ok) {
                const healData = await healRes.json();
                const syncedIds = [...(healData.accepted || []), ...(healData.duplicate || [])];
                await this.db.markEventsSynced(syncedIds);
                await this.updatePendingCount();
              }
            }
          }
        } catch (healErr) {
          console.warn('[EngDay Self-Heal] Failed to heal server:', healErr);
        } finally {
          this._isSelfHealing = false;
        }
      }
    }

    async syncConfigWithServer() {
      const base = this.getApiBaseUrl();
      if (!base || (typeof navigator !== 'undefined' && navigator.onLine === false)) return false;
      this.syncActiveBranchToCatalog();
      try {
        const res = await fetch(`${base}/api/engday/attendance/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId: this.deviceId,
            activeEventId: this.activeEventId,
            event: this.getActiveEvent()
          })
        });
        if (res.ok) {
          this.serverOnline = true;
          this.lastSyncTime = formatManilaTime(new Date());
          this.notify();
          return true;
        }
      } catch (e) {}
      return false;
    }

    syncNow() {
      this.initSseStream();
      return this.syncWithServer(true);
    }

    setServerUrl(url) {
      const clean = String(url || '').trim();
      this.config.serverUrl = clean;
      this.saveConfig();
      if (typeof localStorage !== 'undefined') {
        try { localStorage.setItem('ENGDAY_SERVER_URL', clean); } catch (e) {}
      }
      this.initSseStream();
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

    deduplicatePendingQueue(queue) {
      const byId = new Map();
      queue.forEach(ev => {
        if (ev && ev.eventId) byId.set(ev.eventId, ev);
      });
      const sorted = Array.from(byId.values()).sort((a, b) => new Date(a.occurredAt || 0) - new Date(b.occurredAt || 0));
      const deduplicated = [];
      const duplicateIds = [];
      const lastByKey = new Map();

      for (const ev of sorted) {
        const key = `${ev.eventKey || 'engday_2026'}|${ev.gameId}|${ev.studentId}|${ev.action}`;
        const prevTime = lastByKey.get(key);
        const curTime = new Date(ev.occurredAt || 0).getTime();
        if (prevTime && Math.abs(curTime - prevTime) < 2500) {
          duplicateIds.push(ev.eventId);
          continue;
        }
        lastByKey.set(key, curTime);
        deduplicated.push(ev);
      }

      return { deduplicated, duplicateIds };
    }

    async syncWithServer(isManual = false) {
      if (this.isSyncing) return;
      this.isSyncing = true;
      this.notify();

      try {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
          this.serverOnline = false;
          return;
        }

        const rawQueue = await this.db.getPendingQueue();
        const { deduplicated: queue, duplicateIds } = this.deduplicatePendingQueue(rawQueue);
        if (duplicateIds.length > 0) {
          await this.db.markEventsSynced(duplicateIds);
        }

        const base = this.getApiBaseUrl();
        if (!base) {
          this.serverOnline = false;
          return;
        }

        // 1. Flush local outbox queue to server
        if (queue.length > 0) {
          const res = await fetch(`${base}/api/engday/attendance/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deviceId: this.deviceId,
              activeEventId: this.activeEventId,
              events: queue
            })
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

        // 2. Fetch latest server state & reconcile safely
        const stateRes = await fetch(`${base}/api/engday/attendance/state?eventKey=${encodeURIComponent(this.activeEventId)}`, {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });

        if (stateRes.ok) {
          const serverState = await stateRes.json();
          this.serverOnline = true;
          this.lastSyncTime = formatManilaTime(new Date());

          if (serverState) {
            const serverVer = serverState.version || 0;
            const serverColdStarted = (serverState.eventsCount || 0) === 0 || serverVer <= 1;
            const isDiff = isManual || serverColdStarted || serverVer !== this.lastSyncedServerVersion || !this.lastSyncedServerVersion;
            if (isDiff) {
              await this.reconcileServerState(serverState);
            }
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
  root.SCHEMA_VERSION = SCHEMA_VERSION;
  root.DEFAULT_GROUPS = DEFAULT_GROUPS;
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
      SCHEMA_VERSION,
      DEFAULT_GROUPS,
      ENGDAY_GAMES,
      EngDayAttendanceEngine,
      formatManilaTime,
      formatManilaDate
    };
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
