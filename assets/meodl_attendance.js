/* =========================================================================
   MEODL TOURNAMENT HUB — UNIQUE QR ATTENDANCE & VENUE PRESENCE ENGINE
   Authoritative Student Identities strictly derived from:
   - MEODL-GROUPINGS-Sheet1.pdf (175 registered students)
   - window.MEODL_DATA
   ========================================================================= */

(function(window) {
  'use strict';

  const STORAGE_KEY = 'MEODL_ATTENDANCE_STATE_V1';
  const DOMAIN_BASE = 'https://meodl.uphsd/attendance';

  // Deterministic high-entropy token generator
  function generateSecureToken(prefix = 'tok') {
    const chars = '0123456789abcdef';
    let hex = '';
    // Use crypto.getRandomValues if available in browser
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

  // Generate deterministic initial token based on index & salt
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

  class MeodlAttendanceEngine {
    constructor() {
      this.state = {
        students: {},
        auditLog: [],
        settings: {
          autoOverdueCheck: true,
          soundFx: true,
          defaultStaff: 'Gate Marshal'
        }
      };
      this.listeners = [];
      this.init();
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
              return;
            }
          }
        }
      } catch (e) {
        console.warn('Attendance load error:', e);
      }
      this.initDefaultRoster();
    }

    // Initialize the official 175 students
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
            status: 'OUTSIDE', // 'INSIDE' | 'OUTSIDE' | 'UNACCOUNTED'
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

    // Reconcile roster if new students were added
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

    // Resolves any scanned payload (URL, token, or studentCode)
    resolveScanPayload(payload) {
      if (!payload) {
        return { error: 'EMPTY_PAYLOAD', message: 'No QR data received.' };
      }

      let raw = String(payload).trim();

      // Check if URL: https://meodl.uphsd/attendance?token=XYZ or ?code=MEODL-0001
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

      // Check revoked tokens
      const revokedMatch = Object.values(this.state.students).find(s => (s.revokedTokens || []).includes(token));
      if (revokedMatch) {
        return {
          error: 'REVOKED',
          student: revokedMatch,
          message: `❌ QR CODE REVOKED\nThis card was replaced. Please present the current active QR code.`
        };
      }

      // Find by active token
      let student = Object.values(this.state.students).find(s => s.activeToken === token);

      // Fallback find by student code if payload was code
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

    // Check In Action
    recordCheckIn(studentId, options = {}) {
      const student = this.state.students[studentId];
      if (!student) return { error: 'Student not found' };

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const isoStr = now.toISOString();
      const staff = options.performedBy || this.state.settings.defaultStaff || 'Gate Marshal';
      const method = options.method || 'qr_scan';

      student.status = 'INSIDE';
      student.lastCheckIn = isoStr;
      student.exitReason = null;
      student.expectedReturn = null;
      student.totalVisits = (student.totalVisits || 0) + 1;

      const historyEntry = {
        action: 'check_in',
        timestamp: isoStr,
        displayTime: timeStr,
        method: method,
        performedBy: staff
      };
      if (!student.history) student.history = [];
      student.history.push(historyEntry);

      this.logAudit({
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

      this.save();
      return { success: true, student };
    }

    // Check Out Action
    recordCheckOut(studentId, options = {}) {
      const student = this.state.students[studentId];
      if (!student) return { error: 'Student not found' };

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const isoStr = now.toISOString();
      const staff = options.performedBy || this.state.settings.defaultStaff || 'Gate Marshal';
      const method = options.method || 'qr_scan';
      const reason = options.reason || 'Not specified';
      const expectedReturn = options.expectedReturn || null;

      // Calculate time spent inside this session
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
        action: 'check_out',
        timestamp: isoStr,
        displayTime: timeStr,
        reason: reason,
        expectedReturn: expectedReturn,
        method: method,
        performedBy: staff
      };
      if (!student.history) student.history = [];
      student.history.push(historyEntry);

      this.logAudit({
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

      this.save();
      return { success: true, student };
    }

    // Manual Administrative Override
    manualOverride(studentId, newStatus, reason = 'Administrative adjustment', performedBy = 'Lead Organizer') {
      const student = this.state.students[studentId];
      if (!student) return { error: 'Student not found' };

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const isoStr = now.toISOString();

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
        action: 'manual_override',
        status: newStatus,
        reason: reason,
        performedBy: performedBy,
        timestamp: isoStr,
        displayTime: timeStr,
        method: 'manual'
      });

      this.logAudit({
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

      this.save();
      return { success: true, student };
    }

    // Revoke and Regenerate QR Token
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

    // Overdue Check
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

    // Internal Audit Logger
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

    // Live Statistics & KPI
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

    // Generate QR payload string for a student
    getQRPayload(student) {
      if (!student) return '';
      return `${DOMAIN_BASE}?token=${student.activeToken}&code=${student.studentCode}`;
    }

    // Export Attendance CSV
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

    // Export QR Codes CSV (For administrative printing or mail-merge)
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

    // Export Audit Logs CSV
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

    // Reset only attendance states back to default (Preserves official rosters and tournament brackets)
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
