/* =========================================================================
   MEODL TOURNAMENT HUB — UNIVERSAL TOURNAMENT ENGINE & SPORT MODULES
   Authoritative Data & Rules conform to:
   - MEODL-GROUPINGS-Sheet1.pdf
   - MEODL GUIDELINES.docx
   ========================================================================= */

(function(window) {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. EVENT REGISTRY & DEFINITIONS
  // -------------------------------------------------------------------------
  const EVENT_DEFINITIONS = {
    // BALL SPORTS
    basketball: {
      id: 'basketball',
      name: 'Basketball',
      category: 'Ball Sports',
      icon: '🏀',
      defaultBracketType: 'single',
      supportedBracketTypes: ['single', 'double', 'roundRobin'],
      participantType: 'team',
      defaultParticipants: ['TEAM RANKINE', 'TEAM OTTO', 'TEAM BRAYTON', 'TEAM DIESEL'],
      matchFormat: '4 Quarters (8 mins each)',
      rulesKey: 'basketball',
      accentColor: '#ef4444',
      badgeClass: 'bg-orange-950/80 text-orange-400 border-orange-700/60'
    },
    volleyball: {
      id: 'volleyball',
      name: 'Volleyball',
      category: 'Ball Sports',
      icon: '🏐',
      defaultBracketType: 'single',
      supportedBracketTypes: ['single', 'double', 'roundRobin'],
      participantType: 'team',
      defaultParticipants: ['TEAM RANKINE', 'TEAM OTTO', 'TEAM BRAYTON', 'TEAM DIESEL'],
      matchFormat: 'Best of 3 Sets (25-25-15)',
      rulesKey: 'volleyball',
      accentColor: '#06b6d4',
      badgeClass: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60'
    },

    // RACKET & BOARD
    badmintonSingles: {
      id: 'badmintonSingles',
      name: 'Badminton Singles',
      category: 'Racket & Board',
      icon: '🏸',
      defaultBracketType: 'single',
      supportedBracketTypes: ['single', 'double', 'roundRobin'],
      participantType: 'player',
      defaultParticipants: ['Rankine Singles Rep', 'Otto Singles Rep', 'Brayton Singles Rep', 'Diesel Singles Rep'],
      matchFormat: 'Best of 3 Sets (21 pts)',
      rulesKey: 'badmintonSingles',
      accentColor: '#f59e0b',
      badgeClass: 'bg-amber-950/80 text-amber-400 border-amber-700/60'
    },
    badmintonDoubles: {
      id: 'badmintonDoubles',
      name: 'Badminton Doubles',
      category: 'Racket & Board',
      icon: '🏸',
      defaultBracketType: 'single',
      supportedBracketTypes: ['single', 'double', 'roundRobin'],
      participantType: 'pair',
      defaultParticipants: ['Rankine Doubles Pair', 'Otto Doubles Pair', 'Brayton Doubles Pair', 'Diesel Doubles Pair'],
      matchFormat: 'Best of 3 Sets (21 pts)',
      rulesKey: 'badmintonDoubles',
      accentColor: '#f59e0b',
      badgeClass: 'bg-amber-950/80 text-amber-400 border-amber-700/60'
    },
    chess: {
      id: 'chess',
      name: 'Chess',
      category: 'Racket & Board',
      icon: '♟️',
      defaultBracketType: 'single',
      supportedBracketTypes: ['single', 'double', 'roundRobin'],
      participantType: 'player',
      defaultParticipants: ['Rankine Chess Rep', 'Otto Chess Rep', 'Brayton Chess Rep', 'Diesel Chess Rep'],
      matchFormat: '15 Mins Time Control (Best of 3 in Finals)',
      rulesKey: 'chess',
      accentColor: '#a855f7',
      badgeClass: 'bg-purple-950/80 text-purple-400 border-purple-700/60'
    },
    scrabble: {
      id: 'scrabble',
      name: 'Scrabble',
      category: 'Racket & Board',
      icon: '🔤',
      defaultBracketType: 'roundRobin',
      supportedBracketTypes: ['roundRobin', 'single', 'double'],
      participantType: 'player',
      defaultParticipants: ['Rankine Scrabble Rep', 'Otto Scrabble Rep', 'Brayton Scrabble Rep', 'Diesel Scrabble Rep'],
      matchFormat: '25 Mins per player',
      rulesKey: 'scrabble',
      accentColor: '#10b981',
      badgeClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60'
    },
    generals: {
      id: 'generals',
      name: 'Game of the Generals',
      category: 'Racket & Board',
      icon: '🎖️',
      defaultBracketType: 'single',
      supportedBracketTypes: ['single', 'double', 'roundRobin'],
      participantType: 'player',
      defaultParticipants: ['Rankine Generals Rep', 'Otto Generals Rep', 'Brayton Generals Rep', 'Diesel Generals Rep'],
      matchFormat: '15 Mins Time Control',
      rulesKey: 'generals',
      accentColor: '#eab308',
      badgeClass: 'bg-yellow-950/80 text-yellow-400 border-yellow-700/60'
    },

    // FIELD & TIMED
    swimming: {
      id: 'swimming',
      name: 'Swimming',
      category: 'Field & Timed',
      icon: '🏊',
      customModule: 'swimming',
      rulesKey: 'swimming',
      accentColor: '#38bdf8',
      badgeClass: 'bg-sky-950/80 text-sky-400 border-sky-700/60'
    },
    amazingRace: {
      id: 'amazingRace',
      name: 'Amazing Race',
      category: 'Field & Timed',
      icon: '🏃',
      customModule: 'amazingRace',
      rulesKey: 'amazingRace',
      accentColor: '#f97316',
      badgeClass: 'bg-orange-950/80 text-orange-400 border-orange-700/60'
    },
    eggHunt: {
      id: 'eggHunt',
      name: 'Egg Hunt',
      category: 'Field & Timed',
      icon: '🥚',
      customModule: 'eggHunt',
      rulesKey: 'eggHunt',
      accentColor: '#fbbf24',
      badgeClass: 'bg-yellow-950/80 text-yellow-400 border-yellow-700/60'
    },

    // ESPORTS
    tekken8: {
      id: 'tekken8',
      name: 'Tekken 8 Championship',
      category: 'Esports',
      icon: '🥊',
      customModule: 'tekken8',
      rulesKey: 'tekken8',
      accentColor: '#00f0ff',
      badgeClass: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60'
    },
    codm: {
      id: 'codm',
      name: 'Call of Duty: Mobile',
      category: 'Esports',
      icon: '🎯',
      defaultBracketType: 'double',
      supportedBracketTypes: ['single', 'double', 'roundRobin'],
      participantType: 'team',
      defaultParticipants: ['TEAM RANKINE', 'TEAM OTTO', 'TEAM BRAYTON', 'TEAM DIESEL'],
      matchFormat: 'BO3 (Hardpoint/SND/Control)',
      rulesKey: 'codm',
      accentColor: '#f59e0b',
      badgeClass: 'bg-amber-950/80 text-amber-400 border-amber-700/60'
    },
    ml: {
      id: 'ml',
      name: 'Mobile Legends: Bang Bang',
      category: 'Esports',
      icon: '⚔️',
      defaultBracketType: 'double',
      supportedBracketTypes: ['single', 'double', 'roundRobin'],
      participantType: 'team',
      defaultParticipants: ['TEAM RANKINE', 'TEAM OTTO', 'TEAM BRAYTON', 'TEAM DIESEL'],
      matchFormat: 'Best of 3 (Custom Draft)',
      rulesKey: 'ml',
      accentColor: '#a855f7',
      badgeClass: 'bg-purple-950/80 text-purple-400 border-purple-700/60'
    }
  };

  // -------------------------------------------------------------------------
  // 2. BRACKET INITIALIZATION HELPERS
  // -------------------------------------------------------------------------
  function initSingleElimination(participants, bestOf = 3) {
    const targetWins = Math.ceil(bestOf / 2);
    const p = participants || ['TEAM RANKINE', 'TEAM OTTO', 'TEAM BRAYTON', 'TEAM DIESEL'];
    return {
      type: 'single',
      bestOf: bestOf,
      targetWins: targetWins,
      matches: {
        'SF1': {
          id: 'SF1',
          code: 'SF-1',
          label: 'Semifinal 1',
          p1: { name: p[0], seed: 1 },
          p2: { name: p[3], seed: 4 },
          score1: 0,
          score2: 0,
          winner: null,
          completed: false,
          isLive: false,
          winDest: { match: 'FINAL', slot: 1 },
          lossDest: { match: 'BRONZE', slot: 1 }
        },
        'SF2': {
          id: 'SF2',
          code: 'SF-2',
          label: 'Semifinal 2',
          p1: { name: p[1], seed: 2 },
          p2: { name: p[2], seed: 3 },
          score1: 0,
          score2: 0,
          winner: null,
          completed: false,
          isLive: false,
          winDest: { match: 'FINAL', slot: 2 },
          lossDest: { match: 'BRONZE', slot: 2 }
        },
        'BRONZE': {
          id: 'BRONZE',
          code: '3RD-PLACE',
          label: 'Bronze Medal Match (3rd Place)',
          p1: null,
          p2: null,
          score1: 0,
          score2: 0,
          winner: null,
          completed: false,
          isLive: false
        },
        'FINAL': {
          id: 'FINAL',
          code: 'CHAMPIONSHIP',
          label: 'Gold / Championship Final',
          p1: null,
          p2: null,
          score1: 0,
          score2: 0,
          winner: null,
          completed: false,
          isLive: false
        }
      }
    };
  }

  function initDoubleElimination(participants, bestOf = 3) {
    const targetWins = Math.ceil(bestOf / 2);
    const p = participants || ['TEAM RANKINE', 'TEAM OTTO', 'TEAM BRAYTON', 'TEAM DIESEL'];
    return {
      type: 'double',
      bestOf: bestOf,
      targetWins: targetWins,
      grandFinalsResetNeeded: false,
      matches: {
        'W1': {
          id: 'W1',
          code: 'UB-M1',
          label: 'Upper Semifinal 1',
          p1: { name: p[0], seed: 1 },
          p2: { name: p[3], seed: 4 },
          score1: 0,
          score2: 0,
          winner: null,
          completed: false,
          isLive: false,
          winDest: { match: 'W3', slot: 1 },
          lossDest: { match: 'L1', slot: 1 }
        },
        'W2': {
          id: 'W2',
          code: 'UB-M2',
          label: 'Upper Semifinal 2',
          p1: { name: p[1], seed: 2 },
          p2: { name: p[2], seed: 3 },
          score1: 0,
          score2: 0,
          winner: null,
          completed: false,
          isLive: false,
          winDest: { match: 'W3', slot: 2 },
          lossDest: { match: 'L1', slot: 2 }
        },
        'W3': {
          id: 'W3',
          code: 'UB-FINAL',
          label: 'Upper Final',
          p1: null,
          p2: null,
          score1: 0,
          score2: 0,
          winner: null,
          completed: false,
          isLive: false,
          winDest: { match: 'GF1', slot: 1 },
          lossDest: { match: 'L2', slot: 1 }
        },
        'L1': {
          id: 'L1',
          code: 'LB-SEMI',
          label: 'Lower Semifinal (Loser takes 4th)',
          p1: null,
          p2: null,
          score1: 0,
          score2: 0,
          winner: null,
          completed: false,
          isLive: false,
          winDest: { match: 'L2', slot: 2 }
        },
        'L2': {
          id: 'L2',
          code: 'LB-FINAL',
          label: 'Lower Final (Loser takes 3rd Bronze)',
          p1: null,
          p2: null,
          score1: 0,
          score2: 0,
          winner: null,
          completed: false,
          isLive: false,
          winDest: { match: 'GF1', slot: 2 }
        },
        'GF1': {
          id: 'GF1',
          code: 'GF-M1',
          label: 'Grand Finals (Match 1)',
          p1: null,
          p2: null,
          score1: 0,
          score2: 0,
          winner: null,
          completed: false,
          isLive: false
        },
        'GF2': {
          id: 'GF2',
          code: 'GF-RESET',
          label: 'Grand Finals Reset (Match 2)',
          p1: null,
          p2: null,
          score1: 0,
          score2: 0,
          winner: null,
          completed: false,
          isLive: false
        }
      }
    };
  }

  function initRoundRobin(participants, bestOf = 3) {
    const targetWins = Math.ceil(bestOf / 2);
    const p = participants || ['TEAM RANKINE', 'TEAM OTTO', 'TEAM BRAYTON', 'TEAM DIESEL'];
    
    // 4 teams = 6 pairings
    const pairings = [
      { id: 'RR1', r: 1, p1: p[0], s1: 1, p2: p[1], s2: 2 },
      { id: 'RR2', r: 1, p1: p[2], s1: 3, p2: p[3], s2: 4 },
      { id: 'RR3', r: 2, p1: p[0], s1: 1, p2: p[2], s2: 3 },
      { id: 'RR4', r: 2, p1: p[1], s1: 2, p2: p[3], s2: 4 },
      { id: 'RR5', r: 3, p1: p[0], s1: 1, p2: p[3], s2: 4 },
      { id: 'RR6', r: 3, p1: p[1], s1: 2, p2: p[2], s2: 3 }
    ];

    const matches = {};
    pairings.forEach((m, idx) => {
      matches[m.id] = {
        id: m.id,
        code: 'RR-M' + (idx + 1),
        label: 'Round ' + m.r + ' • Game ' + (idx + 1),
        p1: { name: m.p1, seed: m.s1 },
        p2: { name: m.p2, seed: m.s2 },
        score1: 0,
        score2: 0,
        winner: null,
        completed: false,
        isLive: false
      };
    });

    return {
      type: 'roundRobin',
      bestOf: bestOf,
      targetWins: targetWins,
      matches: matches
    };
  }

  // -------------------------------------------------------------------------
  // 3. BRACKET ADVANCEMENT & PROPAGATION
  // -------------------------------------------------------------------------
  function propagateSingleElim(bracket) {
    const m = bracket.matches;
    if (!m.SF1 || !m.SF2) return;

    if (m.SF1.completed && m.SF1.winner) {
      m.FINAL.p1 = m.SF1.winner === 1 ? m.SF1.p1 : m.SF1.p2;
      m.BRONZE.p1 = m.SF1.winner === 1 ? m.SF1.p2 : m.SF1.p1;
    } else {
      m.FINAL.p1 = null;
      m.BRONZE.p1 = null;
    }

    if (m.SF2.completed && m.SF2.winner) {
      m.FINAL.p2 = m.SF2.winner === 1 ? m.SF2.p1 : m.SF2.p2;
      m.BRONZE.p2 = m.SF2.winner === 1 ? m.SF2.p2 : m.SF2.p1;
    } else {
      m.FINAL.p2 = null;
      m.BRONZE.p2 = null;
    }
  }

  function propagateDoubleElim(bracket) {
    const m = bracket.matches;
    if (!m.W1 || !m.W2 || !m.W3 || !m.L1 || !m.L2 || !m.GF1) return;

    m.W3.p1 = (m.W1.completed && m.W1.winner === 1) ? m.W1.p1 : (m.W1.completed && m.W1.winner === 2) ? m.W1.p2 : null;
    m.W3.p2 = (m.W2.completed && m.W2.winner === 1) ? m.W2.p1 : (m.W2.completed && m.W2.winner === 2) ? m.W2.p2 : null;

    m.L1.p1 = (m.W1.completed && m.W1.winner === 1) ? m.W1.p2 : (m.W1.completed && m.W1.winner === 2) ? m.W1.p1 : null;
    m.L1.p2 = (m.W2.completed && m.W2.winner === 1) ? m.W2.p2 : (m.W2.completed && m.W2.winner === 2) ? m.W2.p1 : null;

    m.L2.p1 = (m.W3.completed && m.W3.winner === 1) ? m.W3.p2 : (m.W3.completed && m.W3.winner === 2) ? m.W3.p1 : null;
    m.L2.p2 = (m.L1.completed && m.L1.winner === 1) ? m.L1.p1 : (m.L1.completed && m.L1.winner === 2) ? m.L1.p2 : null;

    m.GF1.p1 = (m.W3.completed && m.W3.winner === 1) ? m.W3.p1 : (m.W3.completed && m.W3.winner === 2) ? m.W3.p2 : null;
    m.GF1.p2 = (m.L2.completed && m.L2.winner === 1) ? m.L2.p1 : (m.L2.completed && m.L2.winner === 2) ? m.L2.p2 : null;

    if (m.GF1.completed && m.GF1.winner === 2) {
      bracket.grandFinalsResetNeeded = true;
      if (m.GF2) {
        m.GF2.p1 = m.GF1.p1;
        m.GF2.p2 = m.GF1.p2;
      }
    } else {
      bracket.grandFinalsResetNeeded = false;
      if (m.GF2) {
        m.GF2.p1 = null;
        m.GF2.p2 = null;
        m.GF2.completed = false;
        m.GF2.score1 = 0;
        m.GF2.score2 = 0;
        m.GF2.winner = null;
      }
    }
  }

  function calculateRoundRobinStandings(bracket, participants) {
    const stats = {};
    let names = participants;
    if (!names || !names.length) {
      names = [];
      Object.values(bracket?.matches || {}).forEach(m => {
        if (m.p1 && m.p1.name && !names.includes(m.p1.name)) names.push(m.p1.name);
        if (m.p2 && m.p2.name && !names.includes(m.p2.name)) names.push(m.p2.name);
      });
    }

    (names || []).forEach(name => {
      stats[name] = {
        name: name,
        played: 0,
        won: 0,
        lost: 0,
        draw: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0,
        pts: 0
      };
    });

    Object.values(bracket.matches || {}).forEach(m => {
      if (!m.completed || !m.p1 || !m.p2) return;
      const t1 = stats[m.p1.name];
      const t2 = stats[m.p2.name];
      if (!t1 || !t2) return;

      t1.played++;
      t2.played++;
      t1.pointsFor += m.score1;
      t1.pointsAgainst += m.score2;
      t2.pointsFor += m.score2;
      t2.pointsAgainst += m.score1;

      if (m.winner === 1) {
        t1.won++;
        t1.pts += 3;
        t2.lost++;
      } else if (m.winner === 2) {
        t2.won++;
        t2.pts += 3;
        t1.lost++;
      } else {
        t1.draw++;
        t2.draw++;
        t1.pts += 1;
        t2.pts += 1;
      }
    });

    Object.values(stats).forEach(s => {
      s.pointDiff = s.pointsFor - s.pointsAgainst;
    });

    return Object.values(stats).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
      return b.pointsFor - a.pointsFor;
    });
  }

  // -------------------------------------------------------------------------
  // 4. LEADERBOARD & MEDAL RECALCULATION
  // -------------------------------------------------------------------------
  function calculateOverallLeaderboard(eventsState) {
    const pointsMap = {
      'TEAM RANKINE': { name: 'TEAM RANKINE', id: 'rankine', gold: 0, silver: 0, bronze: 0, points: 0, color: '#ef4444', icon: '🔥' },
      'TEAM OTTO': { name: 'TEAM OTTO', id: 'otto', gold: 0, silver: 0, bronze: 0, points: 0, color: '#f59e0b', icon: '⚡' },
      'TEAM BRAYTON': { name: 'TEAM BRAYTON', id: 'brayton', gold: 0, silver: 0, bronze: 0, points: 0, color: '#06b6d4', icon: '🌪️' },
      'TEAM DIESEL': { name: 'TEAM DIESEL', id: 'diesel', gold: 0, silver: 0, bronze: 0, points: 0, color: '#10b981', icon: '⚙️' }
    };

    const MEDAL_PTS = { gold: 10, silver: 5, bronze: 3 };

    function awardMedal(teamName, medal) {
      if (!teamName) return;
      const clean = String(teamName).toUpperCase();
      let matched = Object.keys(pointsMap).find(k => clean.includes(k.replace('TEAM ', '')));
      if (matched && pointsMap[matched]) {
        pointsMap[matched][medal]++;
        pointsMap[matched].points += MEDAL_PTS[medal];
      }
    }

    Object.entries(eventsState || {}).forEach(([eventId, ev]) => {
      if (!ev) return;

      // Egg Hunt Custom module
      if (ev.customModule === 'eggHunt' && ev.scores) {
        const sorted = Object.entries(ev.scores).sort((a, b) => (b[1].total || 0) - (a[1].total || 0));
        if (sorted.length >= 1 && (sorted[0][1].total || 0) > 0) awardMedal(sorted[0][0], 'gold');
        if (sorted.length >= 2 && (sorted[1][1].total || 0) > 0) awardMedal(sorted[1][0], 'silver');
        if (sorted.length >= 3 && (sorted[2][1].total || 0) > 0) awardMedal(sorted[2][0], 'bronze');
        return;
      }

      // Swimming Custom module
      if (ev.customModule === 'swimming' && Array.isArray(ev.entries)) {
        const finished = ev.entries.filter(e => (e.timeSeconds || 0) > 0).sort((a, b) => a.timeSeconds - b.timeSeconds);
        if (finished.length >= 1) awardMedal(finished[0].team, 'gold');
        if (finished.length >= 2) awardMedal(finished[1].team, 'silver');
        if (finished.length >= 3) awardMedal(finished[2].team, 'bronze');
        return;
      }

      // Amazing Race Custom module
      if (ev.customModule === 'amazingRace' && ev.teams) {
        const completed = Object.values(ev.teams).filter(t => t.escaped).sort((a, b) => (a.totalSeconds || 0) - (b.totalSeconds || 0));
        if (completed.length >= 1) awardMedal(completed[0].name, 'gold');
        if (completed.length >= 2) awardMedal(completed[1].name, 'silver');
        if (completed.length >= 3) awardMedal(completed[2].name, 'bronze');
        return;
      }

      // Bracket / Round Robin Events
      if (ev.bracket) {
        const b = ev.bracket;
        if (b.type === 'single') {
          const final = b.matches.FINAL;
          const bronze = b.matches.BRONZE;
          if (final && final.completed && final.winner) {
            const goldTeam = final.winner === 1 ? final.p1.name : final.p2.name;
            const silverTeam = final.winner === 1 ? final.p2.name : final.p1.name;
            awardMedal(goldTeam, 'gold');
            awardMedal(silverTeam, 'silver');
          }
          if (bronze && bronze.completed && bronze.winner) {
            const bronzeTeam = bronze.winner === 1 ? bronze.p1.name : bronze.p2.name;
            awardMedal(bronzeTeam, 'bronze');
          }
        } else if (b.type === 'double') {
          const gf = b.grandFinalsResetNeeded && b.matches.GF2 && b.matches.GF2.completed ? b.matches.GF2 : b.matches.GF1;
          if (gf && gf.completed && gf.winner) {
            const goldTeam = gf.winner === 1 ? gf.p1.name : gf.p2.name;
            const silverTeam = gf.winner === 1 ? gf.p2.name : gf.p1.name;
            awardMedal(goldTeam, 'gold');
            awardMedal(silverTeam, 'silver');
          }
          const l2 = b.matches.L2;
          if (l2 && l2.completed && l2.winner) {
            const bronzeTeam = l2.winner === 1 ? l2.p2.name : l2.p1.name;
            awardMedal(bronzeTeam, 'bronze');
          }
        } else if (b.type === 'roundRobin') {
          const standings = calculateRoundRobinStandings(b, ev.participants || Object.keys(pointsMap));
          const allCompleted = Object.values(b.matches).every(m => m.completed);
          if (allCompleted && standings.length >= 3) {
            awardMedal(standings[0].name, 'gold');
            awardMedal(standings[1].name, 'silver');
            awardMedal(standings[2].name, 'bronze');
          }
        }
      }
    });

    return Object.values(pointsMap).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gold !== a.gold) return b.gold - a.gold;
      if (b.silver !== a.silver) return b.silver - a.silver;
      return b.bronze - a.bronze;
    });
  }

  window.MEODL_ENGINE = {
    EVENT_DEFINITIONS: EVENT_DEFINITIONS,
    initSingleElimination: initSingleElimination,
    initDoubleElimination: initDoubleElimination,
    initRoundRobin: initRoundRobin,
    propagateSingleElim: propagateSingleElim,
    propagateDoubleElim: propagateDoubleElim,
    calculateRoundRobinStandings: calculateRoundRobinStandings,
    calculateOverallLeaderboard: calculateOverallLeaderboard
  };

})(window);
