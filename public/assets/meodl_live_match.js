/* =========================================================================
   MEODL TOURNAMENT HUB — BASKETBALL & VOLLEYBALL LIVE MATCH ENGINE
   Dedicated live scoring, drift-free timestamp clock, player stats,
   fouls, timeouts, substitutions, rotation, and bracket synchronization.
   Strictly adheres to MEODL Guidelines & Official 175-Student Roster.
   ========================================================================= */

(function(window) {
  'use strict';

  // Sound Synthesizer via Web Audio API (100% offline, zero external audio files)
  const SoundFX = {
    ctx: null,
    getCtx() {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    },
    // Referee Whistle (high dual-tone whistle)
    whistle() {
      const ctx = this.getCtx();
      if (!ctx) return;
      try {
        const t = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(2600, t);
        osc1.frequency.exponentialRampToValueAtTime(2900, t + 0.1);
        osc1.frequency.exponentialRampToValueAtTime(2700, t + 0.35);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(2850, t);
        osc2.frequency.exponentialRampToValueAtTime(3150, t + 0.1);
        osc2.frequency.exponentialRampToValueAtTime(2950, t + 0.35);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.4);
        osc2.stop(t + 0.4);
      } catch (e) {
        console.warn('Audio FX error:', e);
      }
    },
    // End of Quarter / Game Buzzer (stadium horn)
    buzzer() {
      const ctx = this.getCtx();
      if (!ctx) return;
      try {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(146.83, t); // D3 horn
        osc.frequency.setValueAtTime(146.83, t + 0.8);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.35, t + 0.05);
        gain.gain.setValueAtTime(0.35, t + 0.7);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.85);
      } catch (e) {
        console.warn('Audio FX error:', e);
      }
    },
    // Score Ding
    score() {
      const ctx = this.getCtx();
      if (!ctx) return;
      try {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(1760, t + 0.12);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.2);
      } catch (e) {
        console.warn('Audio FX error:', e);
      }
    }
  };

  // ---------------------------------------------------------------------------
  // MEODL LIVE MATCH ENGINE CLASS
  // ---------------------------------------------------------------------------
  class MeodlLiveMatchEngine {
    constructor(sportId, matchId, options = {}) {
      this.sportId = sportId || 'basketball';
      this.matchId = matchId || 'SF1';
      this.storageKey = `MEODL_LIVE_MATCH_${this.sportId.toUpperCase()}_${this.matchId}`;
      this.options = options;
      this.timerInterval = null;
      this.timeoutInterval = null;
      this.listeners = [];

      this.state = this.loadOrInitializeState();
      this.bindStorageSync();
    }

    // Initialize or load existing match state
    loadOrInitializeState() {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const raw = window.localStorage.getItem(this.storageKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.sportId === this.sportId && parsed.matchId === this.matchId) {
              // Ensure clock state is clean if browser was closed while running
              if (parsed.clock && parsed.clock.running) {
                // Adjust elapsed time
                const elapsedSince = Date.now() - parsed.clock.startedAt;
                parsed.clock.elapsedBeforePause += elapsedSince;
                parsed.clock.remainingMs = Math.max(0, parsed.clock.durationMs - parsed.clock.elapsedBeforePause);
                parsed.clock.running = false;
                parsed.clock.startedAt = null;
              }
              return parsed;
            }
          }
        }
      } catch (e) {
        console.warn('Error loading live match state:', e);
      }

      return this.createFreshState();
    }

    // Create default fresh match state according to official MEODL rules
    createFreshState() {
      const isBasketball = this.sportId === 'basketball';
      
      // Look up teams and match from hub if available
      let team1Name = 'TEAM RANKINE';
      let team2Name = 'TEAM OTTO';
      let matchCode = this.matchId;
      let matchLabel = isBasketball ? 'Basketball Match' : 'Volleyball Match';

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const hubRaw = window.localStorage.getItem('MEODL_TOURNAMENT_HUB_V1');
          if (hubRaw) {
            const hub = JSON.parse(hubRaw);
            const ev = hub.events ? hub.events[this.sportId] : null;
            if (ev && ev.bracket && ev.bracket.matches && ev.bracket.matches[this.matchId]) {
              const m = ev.bracket.matches[this.matchId];
              if (m.p1 && m.p1.name) team1Name = m.p1.name;
              if (m.p2 && m.p2.name) team2Name = m.p2.name;
              if (m.code) matchCode = m.code;
              if (m.label) matchLabel = m.label;
            }
          }
        }
      } catch (e) {
        console.warn('Could not read hub match details:', e);
      }

      const team1Obj = this.buildTeamData(team1Name, 1);
      const team2Obj = this.buildTeamData(team2Name, 2);

      // Duration: Basketball = 8 mins (480,000ms), Volleyball = 0 (rally/set based)
      const durationMs = isBasketball ? (8 * 60 * 1000) : 0;

      const state = {
        sportId: this.sportId,
        matchId: this.matchId,
        matchCode: matchCode,
        matchLabel: matchLabel,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        matchStatus: 'READY', // 'READY' | 'IN_PROGRESS' | 'COMPLETED'
        
        team1: team1Obj,
        team2: team2Obj,

        clock: {
          running: false,
          durationMs: durationMs,
          startedAt: null,
          elapsedBeforePause: 0,
          remainingMs: durationMs,
          period: 1, // 1=Q1/Set1, 2=Q2/Set2, etc.
          isOvertime: false,
          periodName: isBasketball ? 'Quarter 1' : 'Set 1'
        },

        timeout: {
          active: false,
          teamNum: null,
          durationSec: isBasketball ? 60 : 30,
          remainingSec: isBasketball ? 60 : 30,
          startedAt: null
        },

        // Basketball specific configs
        basketball: {
          currentQuarter: 1,
          maxQuarters: 4,
          quarterDurationMs: 8 * 60 * 1000,
          teamFoulPenaltyLimit: 5,
          playerFoulOutLimit: 5,
          runningTimeMode: true, // running time until final 2 minutes
          quarterScores: [
            { q: 1, t1: 0, t2: 0 },
            { q: 2, t1: 0, t2: 0 },
            { q: 3, t1: 0, t2: 0 },
            { q: 4, t1: 0, t2: 0 }
          ]
        },

        // Volleyball specific configs
        volleyball: {
          currentSet: 1,
          bestOf: 3,
          targetWins: 2,
          setTargets: [25, 25, 15], // Set 1=25, Set 2=25, Set 3=15
          winByTwo: true,
          setHistory: [] // [{ set: 1, s1: 25, s2: 22, winner: 1 }]
        },

        eventLog: [
          {
            id: 'evt_init',
            timestamp: new Date().toLocaleTimeString(),
            gameClock: isBasketball ? '08:00' : 'Set 1',
            period: 1,
            type: 'SYSTEM',
            teamNum: null,
            desc: `Live match created: ${team1Obj.name} vs ${team2Obj.name}`
          }
        ],

        historyStack: [] // Undo stack
      };

      return state;
    }

    // Build Team Data with official roster members & presence
    buildTeamData(teamName, slot) {
      const clean = String(teamName).toUpperCase();
      let teamId = 'rankine';
      let color = '#ef4444';
      let icon = '🔥';

      if (clean.includes('OTTO')) {
        teamId = 'otto';
        color = '#f59e0b';
        icon = '⚡';
      } else if (clean.includes('BRAYTON')) {
        teamId = 'brayton';
        color = '#06b6d4';
        icon = '🌪️';
      } else if (clean.includes('DIESEL')) {
        teamId = 'diesel';
        color = '#10b981';
        icon = '⚙️';
      }

      // Fetch official roster from MEODL_DATA or MEODL_ATTENDANCE
      let rawRoster = [];
      if (typeof window !== 'undefined' && window.MEODL_ATTENDANCE) {
        const allStudents = window.MEODL_ATTENDANCE.getStudents();
        rawRoster = allStudents.filter(s => s.team.toLowerCase() === teamId.toLowerCase());
      } else if (typeof window !== 'undefined' && window.MEODL_DATA && window.MEODL_DATA.rosters) {
        const names = window.MEODL_DATA.rosters[teamId.toUpperCase()] || [];
        rawRoster = names.map((name, i) => ({
          id: `student-${teamId}-${i+1}`,
          studentCode: `MEODL-${String(i+1).padStart(4, '0')}`,
          name: name,
          team: teamId,
          status: 'INSIDE'
        }));
      }

      // Default maximum 12 players per MEODL guidelines
      const maxPlayers = 12;
      const initialActiveCount = (this.sportId === 'volleyball') ? 6 : 5;
      const selectedRoster = rawRoster.slice(0, maxPlayers);

      // If empty fallback
      if (selectedRoster.length === 0) {
        for (let i = 1; i <= maxPlayers; i++) {
          selectedRoster.push({
            id: `temp-${teamId}-${i}`,
            studentCode: `MEODL-T${i}`,
            name: `${teamName} Athlete #${i}`,
            team: teamId,
            status: 'INSIDE'
          });
        }
      }

      // Known female first names for volleyball compliance assistance
      const femaleNames = [
        'ANDREA', 'MARIA', 'MARY', 'ANGELA', 'ANGELICA', 'NICOLE', 'SARAH', 'CHRISTINE', 
        'PATRICIA', 'ALYSSA', 'BEA', 'DENISE', 'CAMILLE', 'JASMINE', 'PRINCESS', 'CHLOE'
      ];

      const players = selectedRoster.map((p, idx) => {
        const isCourt = idx < initialActiveCount;
        const nameUpper = (p.name || '').toUpperCase();
        const likelyFemale = femaleNames.some(fn => nameUpper.includes(fn));

        return {
          id: p.id,
          studentCode: p.studentCode || `MEODL-${idx+1}`,
          name: p.name,
          jerseyNumber: String(idx + 4),
          isFemale: likelyFemale,
          courtStatus: isCourt ? 'COURT' : 'BENCH',
          courtPosition: isCourt ? (idx + 1) : null, // 1 to 6 for Volleyball
          minutesPlayed: 0,
          lastSubInElapsedMs: 0,
          // Basketball stats
          pts: 0,
          reb: 0,
          ast: 0,
          stl: 0,
          blk: 0,
          pf: 0,
          fouledOut: false,
          // Volleyball stats
          k: 0, // Kills
          a: 0, // Aces
          b: 0, // Blocks
          d: 0, // Digs
          e: 0  // Errors
        };
      });

      return {
        slot: slot,
        id: teamId,
        name: teamName,
        color: color,
        icon: icon,
        score: 0, // Total score for basketball, sets won for volleyball
        currentSetScore: 0, // For volleyball current rally score
        periodScores: [0, 0, 0, 0],
        teamFouls: 0,
        inBonus: false,
        timeoutsRemaining: (this.sportId === 'basketball') ? 4 : 2,
        timeoutsUsed: 0,
        hasPossession: slot === 1,
        isServing: slot === 1,
        rotation: [1, 2, 3, 4, 5, 6], // Court positions for volleyball
        players: players
      };
    }

    // Save state to localStorage and notify listeners
    save() {
      this.state.updatedAt = new Date().toISOString();
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        }
      } catch (e) {
        console.error('Failed to persist live match state:', e);
      }
      this.notify();
    }

    // Multi-window storage sync listener
    bindStorageSync() {
      if (typeof window === 'undefined' || !window.addEventListener) return;
      window.addEventListener('storage', (e) => {
        if (e.key === this.storageKey && e.newValue) {
          try {
            const externalState = JSON.parse(e.newValue);
            this.state = externalState;
            this.notify();
          } catch (err) {
            console.error('Storage sync parse error:', err);
          }
        }
      });
    }

    // Subscribe to state changes
    subscribe(listener) {
      this.listeners.push(listener);
      return () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      };
    }

    notify() {
      this.listeners.forEach(fn => {
        try { fn(this.state); } catch (e) { console.error('Listener callback error:', e); }
      });
    }

    // Push deep-cloned snapshot onto undo stack
    pushUndoSnapshot(actionName = 'Score Action') {
      const clone = JSON.parse(JSON.stringify(this.state));
      delete clone.historyStack; // avoid nesting

      if (!this.state.historyStack) this.state.historyStack = [];
      this.state.historyStack.push({
        actionName: actionName,
        time: new Date().toLocaleTimeString(),
        snapshot: clone
      });

      // Keep max 50 snapshots
      if (this.state.historyStack.length > 50) {
        this.state.historyStack.shift();
      }
    }

    // Perform deep undo
    undo() {
      if (!this.state.historyStack || this.state.historyStack.length === 0) {
        return false;
      }
      const last = this.state.historyStack.pop();
      const currentStack = this.state.historyStack;
      this.state = last.snapshot;
      this.state.historyStack = currentStack;

      // Add audit log entry
      this.logEvent('UNDO', null, `Undid last action: ${last.actionName}`);
      this.save();
      return true;
    }

    // Add entry to Event Log
    logEvent(type, teamNum, desc, player = null) {
      const clockStr = this.getFormattedTime();
      const evt = {
        id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        timestamp: new Date().toLocaleTimeString(),
        gameClock: clockStr,
        period: this.state.clock.period,
        type: type,
        teamNum: teamNum,
        desc: desc,
        player: player ? { id: player.id, name: player.name, jerseyNumber: player.jerseyNumber } : null
      };
      if (!this.state.eventLog) this.state.eventLog = [];
      this.state.eventLog.unshift(evt);
      if (this.state.eventLog.length > 100) this.state.eventLog.pop();
    }

    // -------------------------------------------------------------------------
    // DRIFT-FREE TIMESTAMP CLOCK CONTROLS
    // -------------------------------------------------------------------------
    startClock() {
      if (this.state.clock.running) return;
      if (this.state.clock.remainingMs <= 0) return;

      this.state.clock.running = true;
      this.state.clock.startedAt = Date.now();
      this.state.matchStatus = 'IN_PROGRESS';

      // Update player sub-in timestamps for active players
      const nowRemaining = this.getRemainingClockMs();
      [this.state.team1, this.state.team2].forEach(team => {
        team.players.forEach(p => {
          if (p.courtStatus === 'COURT') {
            p.lastSubInElapsedMs = nowRemaining;
          }
        });
      });

      SoundFX.whistle();
      this.logEvent('CLOCK', null, `Clock started (${this.getFormattedTime()})`);
      this.save();

      // Launch tick loop
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => this.tickClock(), 250);
    }

    pauseClock(silent = false) {
      if (!this.state.clock.running) return;

      const now = Date.now();
      const elapsedSinceStart = now - this.state.clock.startedAt;
      this.state.clock.elapsedBeforePause += elapsedSinceStart;
      this.state.clock.remainingMs = Math.max(0, this.state.clock.durationMs - this.state.clock.elapsedBeforePause);
      this.state.clock.running = false;
      this.state.clock.startedAt = null;

      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      // Update minutes played for court players
      this.accumulatePlayerMinutes();

      if (!silent) {
        SoundFX.whistle();
        this.logEvent('CLOCK', null, `Clock paused at ${this.getFormattedTime()}`);
      }
      this.save();
    }

    resetClock(newDurationMinutes = 8) {
      this.pauseClock(true);
      const newMs = newDurationMinutes * 60 * 1000;
      this.state.clock.durationMs = newMs;
      this.state.clock.elapsedBeforePause = 0;
      this.state.clock.remainingMs = newMs;
      this.state.clock.startedAt = null;
      this.state.clock.running = false;
      this.logEvent('CLOCK', null, `Clock reset to ${String(newDurationMinutes).padStart(2, '0')}:00`);
      this.save();
    }

    adjustClock(deltaSeconds) {
      const deltaMs = deltaSeconds * 1000;
      const current = this.getRemainingClockMs();
      const nextRemaining = Math.max(0, Math.min(this.state.clock.durationMs, current + deltaMs));
      
      this.state.clock.elapsedBeforePause = this.state.clock.durationMs - nextRemaining;
      this.state.clock.remainingMs = nextRemaining;
      if (this.state.clock.running) {
        this.state.clock.startedAt = Date.now();
      }
      this.logEvent('CLOCK', null, `Clock adjusted by ${deltaSeconds > 0 ? '+' : ''}${deltaSeconds}s (${this.getFormattedTime()})`);
      this.save();
    }

    getRemainingClockMs() {
      if (!this.state.clock.running) {
        return this.state.clock.remainingMs;
      }
      const now = Date.now();
      const elapsedSince = now - this.state.clock.startedAt;
      const totalElapsed = this.state.clock.elapsedBeforePause + elapsedSince;
      return Math.max(0, this.state.clock.durationMs - totalElapsed);
    }

    getFormattedTime() {
      if (this.sportId === 'volleyball') {
        return `Set ${this.state.volleyball.currentSet}`;
      }
      const ms = this.getRemainingClockMs();
      const totalSec = Math.floor(ms / 1000);
      const min = Math.floor(totalSec / 60);
      const sec = totalSec % 60;
      const tenths = Math.floor((ms % 1000) / 100);

      // In final minute of quarter, display tenths of second per FIBA / official rules
      if (min === 0 && totalSec < 60) {
        return `${String(sec).padStart(2, '0')}.${tenths}`;
      }
      return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    tickClock() {
      const remaining = this.getRemainingClockMs();
      if (remaining <= 0) {
        this.pauseClock(true);
        this.state.clock.remainingMs = 0;
        SoundFX.buzzer();
        this.handlePeriodEnd();
        this.save();
      } else {
        this.notify();
      }
    }

    // Accumulate played minutes based on game clock
    accumulatePlayerMinutes() {
      const currentRemainingMs = this.getRemainingClockMs();
      [this.state.team1, this.state.team2].forEach(team => {
        team.players.forEach(p => {
          if (p.courtStatus === 'COURT' && p.lastSubInElapsedMs > 0) {
            const playedDeltaMs = Math.max(0, p.lastSubInElapsedMs - currentRemainingMs);
            p.minutesPlayed = Math.round(((p.minutesPlayed * 60 * 1000 + playedDeltaMs) / (60 * 1000)) * 10) / 10;
            p.lastSubInElapsedMs = currentRemainingMs;
          }
        });
      });
    }

    // Handle Period / Quarter Expiration
    handlePeriodEnd() {
      if (this.sportId === 'basketball') {
        const q = this.state.basketball.currentQuarter;
        this.logEvent('PERIOD', null, `End of Quarter ${q}. Score: ${this.state.team1.score} - ${this.state.team2.score}`);
        
        // Reset team fouls for the next quarter
        this.state.team1.teamFouls = 0;
        this.state.team1.inBonus = false;
        this.state.team2.teamFouls = 0;
        this.state.team2.inBonus = false;

        if (q < 4) {
          this.state.basketball.currentQuarter++;
          this.state.clock.period = this.state.basketball.currentQuarter;
          this.state.clock.periodName = `Quarter ${this.state.basketball.currentQuarter}`;
          this.resetClock(8);
        } else {
          // Check for tie (Overtime)
          if (this.state.team1.score === this.state.team2.score) {
            this.state.clock.isOvertime = true;
            this.state.clock.periodName = 'Overtime 1';
            this.logEvent('PERIOD', null, 'Regulation ended in a tie. Entering Overtime (3 mins).');
            this.resetClock(3);
          } else {
            this.state.matchStatus = 'COMPLETED';
            this.logEvent('MATCH', null, `Full time: Match finished! Final Score: ${this.state.team1.name} ${this.state.team1.score} - ${this.state.team2.name} ${this.state.team2.score}`);
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // BASKETBALL SCORING & FOUL ACTIONS
    // -------------------------------------------------------------------------
    addBasketballScore(teamNum, points, shotType = 'FG', playerId = null) {
      this.pushUndoSnapshot(`${points > 0 ? '+' : ''}${points} Pts (${shotType})`);
      const team = teamNum === 1 ? this.state.team1 : this.state.team2;
      const otherTeam = teamNum === 1 ? this.state.team2 : this.state.team1;

      team.score = Math.max(0, team.score + points);

      // Quarter breakdown
      const qIdx = Math.max(0, Math.min(3, this.state.basketball.currentQuarter - 1));
      if (!team.periodScores[qIdx]) team.periodScores[qIdx] = 0;
      team.periodScores[qIdx] = Math.max(0, team.periodScores[qIdx] + points);

      // Synchronize quarter history table
      if (this.state.basketball.quarterScores[qIdx]) {
        if (teamNum === 1) this.state.basketball.quarterScores[qIdx].t1 = team.periodScores[qIdx];
        else this.state.basketball.quarterScores[qIdx].t2 = team.periodScores[qIdx];
      }

      // Player stat attribution
      let player = null;
      if (playerId) {
        player = team.players.find(p => p.id === playerId);
        if (player) {
          player.pts = Math.max(0, player.pts + points);
        }
      }

      // Switch possession to opposing team on made shot
      if (points > 0) {
        team.hasPossession = false;
        otherTeam.hasPossession = true;
        SoundFX.score();
      }

      const pName = player ? `(${player.name} #${player.jerseyNumber})` : '';
      this.logEvent('SCORE', teamNum, `${team.name} scored ${points > 0 ? '+' : ''}${points} pts ${pName} [${shotType}]`, player);
      this.save();
    }

    recordBasketballStat(teamNum, playerId, statType, delta = 1) {
      this.pushUndoSnapshot(`${delta > 0 ? '+' : ''}${delta} ${statType.toUpperCase()}`);
      const team = teamNum === 1 ? this.state.team1 : this.state.team2;
      const player = team.players.find(p => p.id === playerId);
      if (!player) return;

      if (['reb', 'ast', 'stl', 'blk'].includes(statType)) {
        player[statType] = Math.max(0, player[statType] + delta);
        this.logEvent('STAT', teamNum, `${player.name} #${player.jerseyNumber}: ${statType.toUpperCase()} (${player[statType]})`, player);
        this.save();
      }
    }

    recordBasketballFoul(teamNum, playerId = null, foulType = 'Personal') {
      this.pushUndoSnapshot(`Team ${teamNum} Foul (${foulType})`);
      const team = teamNum === 1 ? this.state.team1 : this.state.team2;
      team.teamFouls++;

      // Check penalty / bonus
      if (team.teamFouls >= this.state.basketball.teamFoulPenaltyLimit) {
        team.inBonus = true;
      }

      let player = null;
      if (playerId) {
        player = team.players.find(p => p.id === playerId);
        if (player) {
          player.pf++;
          if (player.pf >= this.state.basketball.playerFoulOutLimit) {
            player.fouledOut = true;
            SoundFX.whistle();
            this.logEvent('FOUL_OUT', teamNum, `⚠ FOUL OUT! ${player.name} has committed 5 personal fouls and must leave the court!`, player);
          }
        }
      }

      SoundFX.whistle();
      const pStr = player ? `by ${player.name} #${player.jerseyNumber} (Foul #${player.pf})` : '';
      this.logEvent('FOUL', teamNum, `Team foul #${team.teamFouls} charged to ${team.name} ${pStr} [${foulType}]`, player);
      this.save();
    }

    // -------------------------------------------------------------------------
    // VOLLEYBALL SCORING, SETS & ROTATION
    // -------------------------------------------------------------------------
    addVolleyballPoint(teamNum, reason = 'Quick Point', playerId = null) {
      this.pushUndoSnapshot(`Point Team ${teamNum} (${reason})`);
      const team = teamNum === 1 ? this.state.team1 : this.state.team2;
      const otherTeam = teamNum === 1 ? this.state.team2 : this.state.team1;

      team.currentSetScore++;

      // Attribution
      let player = null;
      if (playerId) {
        player = team.players.find(p => p.id === playerId);
        if (player) {
          player.pts++;
          if (reason.toLowerCase().includes('kill')) player.k++;
          else if (reason.toLowerCase().includes('ace')) player.a++;
          else if (reason.toLowerCase().includes('block')) player.b++;
          else if (reason.toLowerCase().includes('dig')) player.d++;
          else if (reason.toLowerCase().includes('error')) player.e++;
        }
      }

      // Check Sideout: if scoring team was not serving, they gain serve and rotate
      if (!team.isServing) {
        team.isServing = true;
        otherTeam.isServing = false;
        this.rotateCourt(teamNum, false); // auto-rotate on sideout
        this.logEvent('SIDEOUT', teamNum, `Sideout: ${team.name} wins rally, gains serve, and rotates!`);
      }

      SoundFX.score();
      const pStr = player ? `(${player.name})` : '';
      this.logEvent('POINT', teamNum, `${team.name} +1 pt ${pStr} [${reason}] -> ${team.currentSetScore} - ${otherTeam.currentSetScore}`, player);

      // Check Set Win condition
      this.checkVolleyballSetWin();
      this.save();
    }

    subtractVolleyballPoint(teamNum) {
      this.pushUndoSnapshot(`Subtract Point Team ${teamNum}`);
      const team = teamNum === 1 ? this.state.team1 : this.state.team2;
      team.currentSetScore = Math.max(0, team.currentSetScore - 1);
      this.logEvent('POINT', teamNum, `Point deducted for ${team.name} -> ${team.currentSetScore}`);
      this.save();
    }

    // Rotate volleyball team court positions (1 -> 6 -> 5 -> 4 -> 3 -> 2 -> 1)
    rotateCourt(teamNum, pushUndo = true) {
      if (pushUndo) this.pushUndoSnapshot(`Rotate Team ${teamNum}`);
      const team = teamNum === 1 ? this.state.team1 : this.state.team2;
      
      const onCourt = team.players.filter(p => p.courtStatus === 'COURT' && p.courtPosition !== null);
      if (onCourt.length !== 6) {
        this.logEvent('ROTATION', teamNum, `${team.name} rotated court.`);
        this.save();
        return;
      }

      // Standard volleyball rotation: Pos 1 -> 6, 6 -> 5, 5 -> 4, 4 -> 3, 3 -> 2, 2 -> 1
      onCourt.forEach(p => {
        if (p.courtPosition === 1) p.courtPosition = 6;
        else if (p.courtPosition === 6) p.courtPosition = 5;
        else if (p.courtPosition === 5) p.courtPosition = 4;
        else if (p.courtPosition === 4) p.courtPosition = 3;
        else if (p.courtPosition === 3) p.courtPosition = 2;
        else if (p.courtPosition === 2) p.courtPosition = 1;
      });

      this.logEvent('ROTATION', teamNum, `${team.name} rotated court. Position 1 (Server): ${onCourt.find(p => p.courtPosition === 1)?.name || 'Unknown'}`);
      if (pushUndo) this.save();
    }

    // Verify Volleyball Set Victory (Sets 1 & 2: 25 pts, Set 3: 15 pts, Win by 2)
    checkVolleyballSetWin() {
      const s = this.state.volleyball.currentSet;
      const target = (s === 3) ? 15 : 25;
      const s1 = this.state.team1.currentSetScore;
      const s2 = this.state.team2.currentSetScore;

      let winnerNum = null;
      if (s1 >= target && (s1 - s2) >= 2) winnerNum = 1;
      else if (s2 >= target && (s2 - s1) >= 2) winnerNum = 2;

      if (winnerNum) {
        SoundFX.buzzer();
        const winTeam = winnerNum === 1 ? this.state.team1 : this.state.team2;
        winTeam.score++; // sets won

        // Record in set history
        this.state.volleyball.setHistory.push({
          set: s,
          s1: s1,
          s2: s2,
          winner: winnerNum,
          winningTeamName: winTeam.name
        });

        this.logEvent('SET_WIN', winnerNum, `🏆 Set ${s} won by ${winTeam.name} (${s1} - ${s2})! Sets: ${this.state.team1.score} - ${this.state.team2.score}`);

        // Check Match Victory (Best of 3 -> first to 2 sets)
        if (winTeam.score >= 2) {
          this.state.matchStatus = 'COMPLETED';
          this.logEvent('MATCH', winnerNum, `🎉 MATCH OVER! ${winTeam.name} wins the match ${this.state.team1.score} sets to ${this.state.team2.score}!`);
        } else {
          // Advance to next set
          this.state.volleyball.currentSet++;
          this.state.clock.period = this.state.volleyball.currentSet;
          this.state.clock.periodName = `Set ${this.state.volleyball.currentSet}`;
          this.state.team1.currentSetScore = 0;
          this.state.team2.currentSetScore = 0;
          this.state.team1.timeoutsRemaining = 2;
          this.state.team2.timeoutsRemaining = 2;
        }
      }
    }

    // Check mandatory Volleyball female participation rule
    checkFemalePlayerRule() {
      const results = {};
      [this.state.team1, this.state.team2].forEach((team, idx) => {
        const onCourt = team.players.filter(p => p.courtStatus === 'COURT');
        const femaleCount = onCourt.filter(p => p.isFemale).length;
        results[idx + 1] = {
          teamName: team.name,
          onCourtCount: onCourt.length,
          femaleCount: femaleCount,
          compliant: femaleCount >= 1
        };
      });
      return results;
    }

    // Toggle player female tag
    togglePlayerGender(teamNum, playerId) {
      const team = teamNum === 1 ? this.state.team1 : this.state.team2;
      const player = team.players.find(p => p.id === playerId);
      if (player) {
        player.isFemale = !player.isFemale;
        this.logEvent('ROSTER', teamNum, `${player.name} gender tag updated: ${player.isFemale ? 'Female ♀' : 'Male ♂'}`);
        this.save();
      }
    }

    // -------------------------------------------------------------------------
    // SUBSTITUTIONS & TIMEOUTS
    // -------------------------------------------------------------------------
    substitutePlayer(teamNum, playerOutId, playerInId) {
      this.pushUndoSnapshot(`Substitution Team ${teamNum}`);
      const team = teamNum === 1 ? this.state.team1 : this.state.team2;
      const pOut = team.players.find(p => p.id === playerOutId);
      const pIn = team.players.find(p => p.id === playerInId);

      if (!pOut || !pIn) return false;
      if (pOut.courtStatus !== 'COURT' || pIn.courtStatus !== 'BENCH') return false;

      // Accumulate minutes for outgoing player
      const remainingMs = this.getRemainingClockMs();
      if (pOut.lastSubInElapsedMs > 0) {
        const delta = Math.max(0, pOut.lastSubInElapsedMs - remainingMs);
        pOut.minutesPlayed = Math.round(((pOut.minutesPlayed * 60 * 1000 + delta) / (60 * 1000)) * 10) / 10;
      }

      pOut.courtStatus = 'BENCH';
      const prevPos = pOut.courtPosition;
      pOut.courtPosition = null;

      pIn.courtStatus = 'COURT';
      pIn.courtPosition = prevPos;
      pIn.lastSubInElapsedMs = remainingMs;

      SoundFX.whistle();
      this.logEvent('SUB', teamNum, `Substitution: #${pIn.jerseyNumber} ${pIn.name} IN for #${pOut.jerseyNumber} ${pOut.name}`);
      this.save();
      return true;
    }

    // Call Timeout (60s Basketball, 30s Volleyball)
    callTimeout(teamNum) {
      const team = teamNum === 1 ? this.state.team1 : this.state.team2;
      if (team.timeoutsRemaining <= 0) return false;

      this.pushUndoSnapshot(`Timeout Team ${teamNum}`);
      team.timeoutsRemaining--;
      team.timeoutsUsed++;

      // Automatically pause game clock
      this.pauseClock(true);

      const duration = (this.sportId === 'basketball') ? 60 : 30;
      this.state.timeout.active = true;
      this.state.timeout.teamNum = teamNum;
      this.state.timeout.durationSec = duration;
      this.state.timeout.remainingSec = duration;
      this.state.timeout.startedAt = Date.now();

      SoundFX.whistle();
      this.logEvent('TIMEOUT', teamNum, `Timeout called by ${team.name} (${duration}s) [Remaining: ${team.timeoutsRemaining}]`);
      this.save();

      // Launch timeout countdown
      if (this.timeoutInterval) clearInterval(this.timeoutInterval);
      this.timeoutInterval = setInterval(() => {
        if (!this.state.timeout.active) {
          clearInterval(this.timeoutInterval);
          return;
        }
        this.state.timeout.remainingSec--;
        if (this.state.timeout.remainingSec <= 0) {
          this.endTimeout();
        } else {
          this.notify();
        }
      }, 1000);

      return true;
    }

    endTimeout() {
      if (this.timeoutInterval) {
        clearInterval(this.timeoutInterval);
        this.timeoutInterval = null;
      }
      this.state.timeout.active = false;
      this.state.timeout.remainingSec = 0;
      SoundFX.buzzer();
      this.logEvent('TIMEOUT', null, 'Timeout expired. Teams return to court.');
      this.save();
    }

    togglePossession() {
      this.pushUndoSnapshot('Toggle Possession');
      this.state.team1.hasPossession = !this.state.team1.hasPossession;
      this.state.team2.hasPossession = !this.state.team1.hasPossession;
      const activeTeam = this.state.team1.hasPossession ? this.state.team1.name : this.state.team2.name;
      this.logEvent('POSSESSION', null, `Possession arrow switched to ${activeTeam}`);
      this.save();
    }

    // -------------------------------------------------------------------------
    // BRACKET INTEGRATION: CONFIRM FINAL RESULT & RETURN TO BRACKET
    // -------------------------------------------------------------------------
    finalizeMatchAndSyncHub() {
      // Determine official match score & winner
      let s1 = 0;
      let s2 = 0;
      let winnerSlot = null;

      if (this.sportId === 'basketball') {
        s1 = this.state.team1.score;
        s2 = this.state.team2.score;
        if (s1 > s2) winnerSlot = 1;
        else if (s2 > s1) winnerSlot = 2;
        else winnerSlot = 1; // tiebreak fallback if forced
      } else if (this.sportId === 'volleyball') {
        s1 = this.state.team1.score; // sets won
        s2 = this.state.team2.score; // sets won
        if (s1 > s2) winnerSlot = 1;
        else if (s2 > s1) winnerSlot = 2;
        else winnerSlot = 1;
      }

      this.state.matchStatus = 'COMPLETED';
      this.pauseClock(true);

      // Persist to hub in localStorage
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const hubRaw = window.localStorage.getItem('MEODL_TOURNAMENT_HUB_V1');
          if (hubRaw) {
            const hub = JSON.parse(hubRaw);
            if (hub.events && hub.events[this.sportId] && hub.events[this.sportId].bracket) {
              const b = hub.events[this.sportId].bracket;
              if (b.matches && b.matches[this.matchId]) {
                const targetMatch = b.matches[this.matchId];
                targetMatch.score1 = s1;
                targetMatch.score2 = s2;
                targetMatch.winner = winnerSlot;
                targetMatch.completed = true;
                targetMatch.isLive = false;

                // Propagate bracket based on type
                if (window.MEODL_ENGINE) {
                  if (b.type === 'single') window.MEODL_ENGINE.propagateSingleElim(b);
                  else if (b.type === 'double') window.MEODL_ENGINE.propagateDoubleElim(b);
                  
                  // Recalculate overall medal points
                  hub.overallLeaderboard = window.MEODL_ENGINE.calculateOverallLeaderboard(hub.events);
                }

                window.localStorage.setItem('MEODL_TOURNAMENT_HUB_V1', JSON.stringify(hub));
                this.logEvent('SYSTEM', null, `Final match result (${s1} - ${s2}) synchronized to Tournament Hub bracket successfully.`);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to sync match result to hub:', err);
      }

      this.save();
      return {
        sportId: this.sportId,
        matchId: this.matchId,
        score1: s1,
        score2: s2,
        winner: winnerSlot,
        team1: this.state.team1.name,
        team2: this.state.team2.name
      };
    }
  }

  // Expose to window or module
  if (typeof window !== 'undefined') {
    window.MeodlLiveMatchEngine = MeodlLiveMatchEngine;
    window.SoundFX = SoundFX;
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MeodlLiveMatchEngine, SoundFX };
  }

})(typeof window !== 'undefined' ? window : this);
