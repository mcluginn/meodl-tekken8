import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3333;
const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL ? '/tmp' : __dirname;
const EVENTS_FILE = path.join(DATA_DIR, 'attendance_events.json');
const STATE_FILE = path.join(DATA_DIR, 'attendance_state.json');
const ENGDAY_EVENTS_FILE = path.join(DATA_DIR, 'engday_attendance_events.json');
const ENGDAY_STATE_FILE = path.join(DATA_DIR, 'engday_attendance_state.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

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

function getToday4AMCutoffServer() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 0, 0, 0);
}

function isTimestampBeforeToday4AMServer(timeVal) {
  if (!timeVal) return true;
  const d = new Date(timeVal);
  if (isNaN(d.getTime())) return true;
  const now = new Date();
  if (d.getFullYear() < now.getFullYear()) return true;
  if (d.getFullYear() === now.getFullYear()) {
    if (d.getMonth() < now.getMonth()) return true;
    if (d.getMonth() === now.getMonth()) {
      if (d.getDate() < now.getDate()) return true;
      if (d.getDate() === now.getDate()) {
        return d.getHours() < 4;
      }
    }
  }
  const today4AM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 0, 0, 0);
  return d.getTime() < today4AM.getTime();
}

// -------------------------------------------------------------------------
// PERSISTENT DATA LAYER (ATOMIC SAFE WRITES)
// -------------------------------------------------------------------------
function atomicWriteJson(filePath, data) {
  const tempPath = filePath + '.tmp.' + Date.now() + Math.random().toString(36).substring(2, 6);
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, filePath);
}

function safeReadJson(filePath, defaultVal) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8').trim();
      if (content) return JSON.parse(content);
    }
  } catch (err) {
    console.error(`[Server DB] Failed to read ${filePath}:`, err);
  }
  return defaultVal;
}

// Deterministic token helper matching client
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

// Generate default 175 registered students from assets/meodl_data.js
function buildDefaultStudentsRoster() {
  const dataPath = path.join(__dirname, 'assets', 'meodl_data.js');
  let studentsList = [];

  try {
    if (fs.existsSync(dataPath)) {
      const code = fs.readFileSync(dataPath, 'utf8');
      const sandbox = { window: {} };
      sandbox.window = sandbox;
      vm.runInNewContext(code, sandbox);
      if (sandbox.MEODL_DATA && Array.isArray(sandbox.MEODL_DATA.students)) {
        studentsList = sandbox.MEODL_DATA.students;
      }
    }
  } catch (err) {
    console.warn('[Server DB] Could not extract students from meodl_data.js, using fallback structure.', err);
  }

  const students = {};
  studentsList.forEach((s, idx) => {
    const key = s.id || s.code;
    const code = String(s.code || s.id).toUpperCase();
    const id = String(s.id || s.code || key);
    const team = String(s.team || 'general').toLowerCase();
    const token = deterministicToken(idx + 1, team);
    students[key] = {
      id: id,
      code: code,
      studentCode: s.studentCode || code,
      name: s.name,
      team: team,
      teamName: s.teamName || ('TEAM ' + team.toUpperCase()),
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
  });

  return students;
}

const buildInitialRoster = buildDefaultStudentsRoster;

function getBundledJson(relPath, defaultVal) {
  try {
    const p = fileURLToPath(new URL(relPath, import.meta.url));
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {}
  return defaultVal;
}

let attendanceEvents = safeReadJson(EVENTS_FILE, getBundledJson('./attendance_events.json', []));
let attendanceEventsMap = new Map();
attendanceEvents.forEach(ev => {
  if (ev && ev.eventId) attendanceEventsMap.set(ev.eventId, ev);
});

let attendanceState = safeReadJson(STATE_FILE, getBundledJson('./attendance_state.json', null));
if (!attendanceState || !attendanceState.students || Object.keys(attendanceState.students).length === 0) {
  attendanceState = {
    students: buildDefaultStudentsRoster(),
    version: 1,
    lastUpdated: new Date().toISOString()
  };
  try { atomicWriteJson(STATE_FILE, attendanceState); } catch(e) {}
}

// -------------------------------------------------------------------------
// ENGINEERING DAYS 2026 — TRACK A (8 MAJOR GATE CHECKPOINTS)
// UPHSD Calamba • College of Engineering • Oct 19–20, 2026
// -------------------------------------------------------------------------
const EDAYS_2026_ADDITIONAL_ROSTER = [{"id":"EE-001","code":"EE-001","name":"ABAD, EARL JOHN A.","team":"EE"},{"id":"EE-002","code":"EE-002","name":"ABOCEJO, KING CHRISTOPHER","team":"EE"},{"id":"EE-003","code":"EE-003","name":"ABUDA, RUPERTH KNIE P.","team":"EE"},{"id":"EE-004","code":"EE-004","name":"ALANIB, RYLE BASTY B.","team":"EE"},{"id":"EE-005","code":"EE-005","name":"ALVAREZ, EVANN C.","team":"EE"},{"id":"EE-006","code":"EE-006","name":"ANACION, RHAINE DOMINIC D.","team":"EE"},{"id":"EE-007","code":"EE-007","name":"ANDAYA, JOHN MICHAEL L.","team":"EE"},{"id":"EE-008","code":"EE-008","name":"ANDRADA, JOSE ANDREI P.","team":"EE"},{"id":"EE-009","code":"EE-009","name":"ARANDIA, JOHN ANSELLE M.","team":"EE"},{"id":"EE-010","code":"EE-010","name":"ASCAÑO, RHICO S.","team":"EE"},{"id":"EE-011","code":"EE-011","name":"ASTROLABIO, RHAY JUSTIN P.","team":"EE"},{"id":"EE-012","code":"EE-012","name":"ATIENZA, PAUL JERICO H.","team":"EE"},{"id":"EE-013","code":"EE-013","name":"BAHOY, DWIGHT IVAN V.","team":"EE"},{"id":"EE-014","code":"EE-014","name":"BERMUDEZ, MARK LEO M.","team":"EE"},{"id":"EE-015","code":"EE-015","name":"BONCAJES, ROB MARTIN A.","team":"EE"},{"id":"EE-016","code":"EE-016","name":"CABARLES, TYRON Q.","team":"EE"},{"id":"EE-017","code":"EE-017","name":"CAJUCOM, BRYAN JAMES M.","team":"EE"},{"id":"EE-018","code":"EE-018","name":"CALMA, WENDELL D.","team":"EE"},{"id":"EE-019","code":"EE-019","name":"CANTARA, CHILVERT REIN C.","team":"EE"},{"id":"EE-020","code":"EE-020","name":"CARMONA, LEE ROUAN C.","team":"EE"},{"id":"EE-021","code":"EE-021","name":"CHAVEZ, JOHN DAVID B.","team":"EE"},{"id":"EE-022","code":"EE-022","name":"COMMINS, FRANCHESKA MAE A.","team":"EE"},{"id":"EE-023","code":"EE-023","name":"CRISTOBAL, CHRISTOPHER Y.","team":"EE"},{"id":"EE-024","code":"EE-024","name":"CUIZON, ALEXANDER D.","team":"EE"},{"id":"EE-025","code":"EE-025","name":"DALISAY, RANIEL T.","team":"EE"},{"id":"EE-026","code":"EE-026","name":"DAMAYO, CHRISTOPHER DANIELLE C.","team":"EE"},{"id":"EE-027","code":"EE-027","name":"DAPADAP, JOSHUA NAHIL N.","team":"EE"},{"id":"EE-028","code":"EE-028","name":"DATUS, RAIN R.","team":"EE"},{"id":"EE-029","code":"EE-029","name":"DE LEON, RITCH GERMAINE M.","team":"EE"},{"id":"EE-030","code":"EE-030","name":"DELA CRUZ, JOHN JOSEPH R.","team":"EE"},{"id":"EE-031","code":"EE-031","name":"DELOS REYES, JEROME V.","team":"EE"},{"id":"EE-032","code":"EE-032","name":"DELOS REYES, MARK STEPHEN B.","team":"EE"},{"id":"EE-033","code":"EE-033","name":"DULAY, GEIBRIEL RENE P.","team":"EE"},{"id":"EE-034","code":"EE-034","name":"ENDRINAL, EMMANUEL H.","team":"EE"},{"id":"EE-035","code":"EE-035","name":"EREJIAS, JOHN MARK M.","team":"EE"},{"id":"EE-036","code":"EE-036","name":"EUGENIO, JOHN MICHAEL A.","team":"EE"},{"id":"EE-037","code":"EE-037","name":"FAELMARIN, JHON AX'L F.","team":"EE"},{"id":"EE-038","code":"EE-038","name":"FLORES, NORIEL A.","team":"EE"},{"id":"EE-039","code":"EE-039","name":"FLORES, RHONA LYN R.","team":"EE"},{"id":"EE-040","code":"EE-040","name":"FLORIDO, DUSTINE ANGELO M.","team":"EE"},{"id":"EE-041","code":"EE-041","name":"GADAZA, JOSE GABRIEL B.","team":"EE"},{"id":"EE-042","code":"EE-042","name":"GALLEGO, HARIS JHON S.","team":"EE"},{"id":"EE-043","code":"EE-043","name":"GAYOSA, KHENA KATLEEN G.","team":"EE"},{"id":"EE-044","code":"EE-044","name":"GERODIAS, BRENT GERSON A.","team":"EE"},{"id":"EE-045","code":"EE-045","name":"GOMEZ, MA. ALSHICA K.","team":"EE"},{"id":"EE-046","code":"EE-046","name":"GONZALES, SEAN ALLEN M.","team":"EE"},{"id":"EE-047","code":"EE-047","name":"GUIRUELA, JAMES L.","team":"EE"},{"id":"EE-048","code":"EE-048","name":"HASHIM, BRINLY HAMIM M.","team":"EE"},{"id":"EE-049","code":"EE-049","name":"HERNANDEZ, JAY CYRIL C.","team":"EE"},{"id":"EE-050","code":"EE-050","name":"HERNANDEZ, SAM ANDREI V.","team":"EE"},{"id":"EE-051","code":"EE-051","name":"IBARROLA, HANS KEN M.","team":"EE"},{"id":"EE-052","code":"EE-052","name":"JUANICO, NYNGEL S.","team":"EE"},{"id":"EE-053","code":"EE-053","name":"LACORTE, CRIS JASON M.","team":"EE"},{"id":"EE-054","code":"EE-054","name":"LAYACAN, VHEA EDRICH M.","team":"EE"},{"id":"EE-055","code":"EE-055","name":"LEGASPI, ULYCES P.","team":"EE"},{"id":"EE-056","code":"EE-056","name":"LOPEZ, CHARLES ROBERT L.","team":"EE"},{"id":"EE-057","code":"EE-057","name":"LUMBRES, DUSTIN M.","team":"EE"},{"id":"EE-058","code":"EE-058","name":"MACALALAD, FRANS RYLCO C.","team":"EE"},{"id":"EE-059","code":"EE-059","name":"MAGSOMBOL, JAMES RYAN J.","team":"EE"},{"id":"EE-060","code":"EE-060","name":"MALABAG, JOHN MICHAEL B.","team":"EE"},{"id":"EE-061","code":"EE-061","name":"MALANA, ROSSETTE NATHALIE A.","team":"EE"},{"id":"EE-062","code":"EE-062","name":"MALOLOY-ON, DEFFERSON JOHN T.","team":"EE"},{"id":"EE-063","code":"EE-063","name":"MAÑOBRA, LORENZO A.","team":"EE"},{"id":"EE-064","code":"EE-064","name":"MAPUTE, CHRIS CORNELL F.","team":"EE"},{"id":"EE-065","code":"EE-065","name":"MICA, CLARK DUSTIN COSME D.","team":"EE"},{"id":"EE-066","code":"EE-066","name":"MILCA, JERALD O.","team":"EE"},{"id":"EE-067","code":"EE-067","name":"MONDIA, JOHN VINCENT M.","team":"EE"},{"id":"EE-068","code":"EE-068","name":"MORAN, MARK NIÑO A.","team":"EE"},{"id":"EE-069","code":"EE-069","name":"MOSCA, JAMESTEVE SEAN G.","team":"EE"},{"id":"EE-070","code":"EE-070","name":"NUNO, ROYD ALFONSO M.","team":"EE"},{"id":"EE-071","code":"EE-071","name":"OPULENCIA, AARON ALLEXIS S.","team":"EE"},{"id":"EE-072","code":"EE-072","name":"ORTEGA, JAMES V.","team":"EE"},{"id":"EE-073","code":"EE-073","name":"ORTIZ, PAULA EUNISE A.","team":"EE"},{"id":"EE-074","code":"EE-074","name":"PABALATE, RHED S.","team":"EE"},{"id":"EE-075","code":"EE-075","name":"PAMPLONA, NELO DRIX T.","team":"EE"},{"id":"EE-076","code":"EE-076","name":"PANARIGAN, KARLO P.","team":"EE"},{"id":"EE-077","code":"EE-077","name":"PANER, ORLANDO GABRIEL C.","team":"EE"},{"id":"EE-078","code":"EE-078","name":"PATARAY, EUNICE L.","team":"EE"},{"id":"EE-079","code":"EE-079","name":"PECAYO, RHIANE MAE L.","team":"EE"},{"id":"EE-080","code":"EE-080","name":"PEDRAJA, JOMARI D.","team":"EE"},{"id":"EE-081","code":"EE-081","name":"PEREZ, JARED ELWOOD P.","team":"EE"},{"id":"EE-082","code":"EE-082","name":"PIOQUINTO, ELREY D.","team":"EE"},{"id":"EE-083","code":"EE-083","name":"PIZARRA, DOMAR A.","team":"EE"},{"id":"EE-084","code":"EE-084","name":"RAMILO, DRACIR JOSH G.","team":"EE"},{"id":"EE-085","code":"EE-085","name":"SALIBA, DEROSS D.","team":"EE"},{"id":"EE-086","code":"EE-086","name":"SANTOS, RAFAEL P.","team":"EE"},{"id":"EE-087","code":"EE-087","name":"SOLATORIO, JOHN JETRO C.","team":"EE"},{"id":"EE-088","code":"EE-088","name":"TABAMO, EJ GODWIN B.","team":"EE"},{"id":"EE-089","code":"EE-089","name":"TORIAGA, KURT LOUISE M.","team":"EE"},{"id":"EE-090","code":"EE-090","name":"URRIZA, BRYLLE KRISTEN A.","team":"EE"},{"id":"EE-091","code":"EE-091","name":"VILLARE, RYE LEE E.","team":"EE"},{"id":"EE-092","code":"EE-092","name":"YABUT, CRISENCIO JR. P.","team":"EE"},{"id":"CPE-001","code":"CPE-001","name":"AMICAN, GABRIEL EMMANUEL B.","team":"CPE"},{"id":"CPE-002","code":"CPE-002","name":"ANDAYA, SEAN COLLIN S.","team":"CPE"},{"id":"CPE-003","code":"CPE-003","name":"ARQUILLO, MARK P.","team":"CPE"},{"id":"CPE-004","code":"CPE-004","name":"ARROCO, DAVID SZUIN R.","team":"CPE"},{"id":"CPE-005","code":"CPE-005","name":"BALBUENA, EDUARDO III J.","team":"CPE"},{"id":"CPE-006","code":"CPE-006","name":"BARBON, ANNE KIRSTEN V.","team":"CPE"},{"id":"CPE-007","code":"CPE-007","name":"BARCELLANO, MAR JOSEF V.","team":"CPE"},{"id":"CPE-008","code":"CPE-008","name":"BEGAS, JAYCEL NIEL C.","team":"CPE"},{"id":"CPE-009","code":"CPE-009","name":"BIESCAS, REYSSA JEAN D.","team":"CPE"},{"id":"CPE-010","code":"CPE-010","name":"BITANA, MARK EDRIAN J.","team":"CPE"},{"id":"CPE-011","code":"CPE-011","name":"BUSTAMANTE, DANIEL JOHN T.","team":"CPE"},{"id":"CPE-012","code":"CPE-012","name":"CAMACHO, BERNARD JOEY B.","team":"CPE"},{"id":"CPE-013","code":"CPE-013","name":"CAMBEL, KIRSTEN M.","team":"CPE"},{"id":"CPE-014","code":"CPE-014","name":"CANTALEJO, KAIDE M.","team":"CPE"},{"id":"CPE-015","code":"CPE-015","name":"CASTILLO, CHINI MARIELLI","team":"CPE"},{"id":"CPE-016","code":"CPE-016","name":"CENA, LEO M.","team":"CPE"},{"id":"CPE-017","code":"CPE-017","name":"CESAR, KLYDE GABRIEL A.","team":"CPE"},{"id":"CPE-018","code":"CPE-018","name":"CLARO, SHAWN ROMINICK T.","team":"CPE"},{"id":"CPE-019","code":"CPE-019","name":"CONEJARES, RODCORT ELVEN V.","team":"CPE"},{"id":"CPE-020","code":"CPE-020","name":"DE JESUS, KENNETH G.","team":"CPE"},{"id":"CPE-021","code":"CPE-021","name":"DOLLETON, DWAYNE KENSHIN R.","team":"CPE"},{"id":"CPE-022","code":"CPE-022","name":"DOMINGO, JOSE URBANO B.","team":"CPE"},{"id":"CPE-023","code":"CPE-023","name":"DULLAS, CHARLES EZEKIEL F.","team":"CPE"},{"id":"CPE-024","code":"CPE-024","name":"DY, LEIGH ICEN G.","team":"CPE"},{"id":"CPE-025","code":"CPE-025","name":"ESCULTURA, PRINCE ERROLL M.","team":"CPE"},{"id":"CPE-026","code":"CPE-026","name":"ESTEBAN, JEANE ANDREI C.","team":"CPE"},{"id":"CPE-027","code":"CPE-027","name":"GALOYO, IRIS L.","team":"CPE"},{"id":"CPE-028","code":"CPE-028","name":"GARCIA, JUSTIN ADRIENN P.","team":"CPE"},{"id":"CPE-029","code":"CPE-029","name":"KODAKA, KIAN KENTA D.","team":"CPE"},{"id":"CPE-030","code":"CPE-030","name":"LLANETA, JOHN VINCENT M.","team":"CPE"},{"id":"CPE-031","code":"CPE-031","name":"LLANETA, KENJIE-LIM A.","team":"CPE"},{"id":"CPE-032","code":"CPE-032","name":"MAALINDOG, ALAN PAUL C.","team":"CPE"},{"id":"CPE-033","code":"CPE-033","name":"MAGNO, DAN LLOYD L.","team":"CPE"},{"id":"CPE-034","code":"CPE-034","name":"MALABANAN, JUSTINE RALPH B.","team":"CPE"},{"id":"CPE-035","code":"CPE-035","name":"MANE, FRANCINE JADE G.","team":"CPE"},{"id":"CPE-036","code":"CPE-036","name":"MEDINA, ALLAEN MARK S.","team":"CPE"},{"id":"CPE-037","code":"CPE-037","name":"NAGPALA, EERSEL ANDREY V.","team":"CPE"},{"id":"CPE-038","code":"CPE-038","name":"OCASLA, NORMAN DAVID J.","team":"CPE"},{"id":"CPE-039","code":"CPE-039","name":"OLIVAR, CHRISTIAN JOSH D.","team":"CPE"},{"id":"CPE-040","code":"CPE-040","name":"OPULENCIA, ALLEXASHEENA DEINNE S.","team":"CPE"},{"id":"CPE-041","code":"CPE-041","name":"ORDANZA, JAMEZ IVAN V.","team":"CPE"},{"id":"CPE-042","code":"CPE-042","name":"PADUA, RHIANA ASHLEY G.","team":"CPE"},{"id":"CPE-043","code":"CPE-043","name":"PALISOC, MARK ELEAZAR M.","team":"CPE"},{"id":"CPE-044","code":"CPE-044","name":"PALOMO, CHARLEMAGNE B.","team":"CPE"},{"id":"CPE-045","code":"CPE-045","name":"PEDRIGAL, MARGARETE JANE PAULEY D.","team":"CPE"},{"id":"CPE-046","code":"CPE-046","name":"PETATE, KARL JANSEN S.","team":"CPE"},{"id":"CPE-047","code":"CPE-047","name":"PETATE, KIERVY R.","team":"CPE"},{"id":"CPE-048","code":"CPE-048","name":"RAFA, RAFAEL ALEX A.","team":"CPE"},{"id":"CPE-049","code":"CPE-049","name":"REGASPI, MARY MARGARETTE D.","team":"CPE"},{"id":"CPE-050","code":"CPE-050","name":"RUANTO, RANIELLE JEDD R.","team":"CPE"},{"id":"CPE-051","code":"CPE-051","name":"SANTIAGO, ULRICA LORAINE D.","team":"CPE"},{"id":"CPE-052","code":"CPE-052","name":"SASPA, ASHLEY KHATE R.","team":"CPE"},{"id":"CPE-053","code":"CPE-053","name":"SERRANA, JESSIE B.","team":"CPE"},{"id":"CPE-054","code":"CPE-054","name":"TAN, SIMON M.","team":"CPE"},{"id":"CPE-055","code":"CPE-055","name":"TOLENTINO, BENJAMIN M.","team":"CPE"},{"id":"CPE-056","code":"CPE-056","name":"TORALES, REUEL ANNE A.","team":"CPE"},{"id":"CPE-057","code":"CPE-057","name":"TORRES, JOSHUA ALLEN D.","team":"CPE"},{"id":"CPE-058","code":"CPE-058","name":"VIVAS, BENEDICT MIGUEL C.","team":"CPE"},{"id":"CPE-059","code":"CPE-059","name":"YANSON, RANDEL C.","team":"CPE"},{"id":"CPE-060","code":"CPE-060","name":"ZARSUELO, JOHN GAVERIEL D.","team":"CPE"},{"id":"ECE-001","code":"ECE-001","name":"MARQUEZ, GISELLE A.","team":"ECE"},{"id":"ECE-002","code":"ECE-002","name":"GUANIESO, ANGELLIC RENANELYN O.","team":"ECE"},{"id":"ECE-003","code":"ECE-003","name":"CAMAT, RENUARD A.","team":"ECE"},{"id":"ECE-004","code":"ECE-004","name":"ALKHATIB, SAMER B.","team":"ECE"},{"id":"ECE-005","code":"ECE-005","name":"OPULENCIA, MARIA GEE-ANNE P.","team":"ECE"},{"id":"ECE-006","code":"ECE-006","name":"GAMITIN, JOMAR GABRIEL B.","team":"ECE"},{"id":"ECE-007","code":"ECE-007","name":"PAGUINTO, OLIEMAR LEINER P.","team":"ECE"},{"id":"ECE-008","code":"ECE-008","name":"MARASIGAN, JERICHO MIGUEL R.","team":"ECE"},{"id":"ECE-009","code":"ECE-009","name":"GUERRERO, OWEN DOMINIC V.","team":"ECE"},{"id":"ECE-010","code":"ECE-010","name":"MENOR, ANGELO C.","team":"ECE"},{"id":"IE-001","code":"IE-001","name":"ABAD, JUDITH MARIAN SILVA","team":"IE"},{"id":"IE-002","code":"IE-002","name":"AGUILAR, RUSSEL ALLEN CASTILLO","team":"IE"},{"id":"IE-003","code":"IE-003","name":"BALLEZA, BRUNZON ANSANO","team":"IE"},{"id":"IE-004","code":"IE-004","name":"BAUTISTA, MA. CHARICE JAYONA","team":"IE"},{"id":"IE-005","code":"IE-005","name":"CANATUAN, YSABELA MERCADO","team":"IE"},{"id":"IE-006","code":"IE-006","name":"CICERON, HANS GABRIEL CONJARES","team":"IE"},{"id":"IE-007","code":"IE-007","name":"CONSIGNADO, KASSANDRA SARMIENTO","team":"IE"},{"id":"IE-008","code":"IE-008","name":"DE LEON, YANZ MARLOU BAYBAY","team":"IE"},{"id":"IE-009","code":"IE-009","name":"ELISAN, JOSHUA BRYCE OLINARES","team":"IE"},{"id":"IE-010","code":"IE-010","name":"ESTRADA, JERILOU MAE NAZARETH","team":"IE"},{"id":"IE-011","code":"IE-011","name":"FRANCISCO, ANDRES LUIS MADEJA","team":"IE"},{"id":"IE-012","code":"IE-012","name":"HALILI, MARK CLARENCE ALDABE","team":"IE"},{"id":"IE-013","code":"IE-013","name":"IYOG, HANNAH MEKIE SHANE JUNGAY","team":"IE"},{"id":"IE-014","code":"IE-014","name":"KODAKA, KYLE KENYA DELUANA","team":"IE"},{"id":"IE-015","code":"IE-015","name":"LARINO, JOANA SOPHIA BEATRICE REYEG","team":"IE"},{"id":"IE-016","code":"IE-016","name":"LECHUGA, CASSANDRA SHANEYA MANINGAS","team":"IE"},{"id":"IE-017","code":"IE-017","name":"LEGASPI, TRAVIS MATHEW PARO","team":"IE"},{"id":"IE-018","code":"IE-018","name":"MALLORCA, ANTON JOSEPH NARVAEZ","team":"IE"},{"id":"IE-019","code":"IE-019","name":"NIEM, JARED CIRENE GOLE","team":"IE"},{"id":"IE-020","code":"IE-020","name":"OCAMPO, RENZO HADI","team":"IE"},{"id":"IE-021","code":"IE-021","name":"PADIT, ANDREI ANG","team":"IE"},{"id":"IE-022","code":"IE-022","name":"PALIZA, PATRICK ANJELLO SOLINAP","team":"IE"},{"id":"IE-023","code":"IE-023","name":"RAÑOLA, PRINCESS ARIANI ROXAS","team":"IE"},{"id":"IE-024","code":"IE-024","name":"ROSALES, LOUISE ALLEN BALBIN","team":"IE"},{"id":"IE-025","code":"IE-025","name":"SOJOR, ALBERT MARCELO","team":"IE"},{"id":"IE-026","code":"IE-026","name":"VALIÑA, ANGELA CLAIRE PERILLO","team":"IE"},{"id":"IE-027","code":"IE-027","name":"BANTOC, VINCE LYNDON ABENDAN","team":"IE"},{"id":"IE-028","code":"IE-028","name":"BESAS, CHEN ZHEN LUMACANG","team":"IE"},{"id":"IE-029","code":"IE-029","name":"DOROJA, PRINCESS FHAYE COLLINE TAMONDONG","team":"IE"},{"id":"IE-030","code":"IE-030","name":"FRANCISCO, DERRICK GABRIEL ESCONDO","team":"IE"},{"id":"IE-031","code":"IE-031","name":"GALINDEZ, JOHN PAUL JAVIER","team":"IE"},{"id":"IE-032","code":"IE-032","name":"GARDAYA, PRINCESS JANEL DE OCAMPO","team":"IE"},{"id":"IE-033","code":"IE-033","name":"GUELAS, MARK KRISTIAN ROMEO DUSONG","team":"IE"},{"id":"IE-034","code":"IE-034","name":"IMSON, CHRISTIAN SIMON OLIVEROS","team":"IE"},{"id":"IE-035","code":"IE-035","name":"JAYME, PRINCESS MAE MANAIG","team":"IE"},{"id":"IE-036","code":"IE-036","name":"MALABANAN, ALJON RAMOS","team":"IE"},{"id":"IE-037","code":"IE-037","name":"MALATE, LUJILL DYLAN SEÑORISES","team":"IE"},{"id":"IE-038","code":"IE-038","name":"MANNAN, ABDULHAFIDZ MAUJOD","team":"IE"},{"id":"IE-039","code":"IE-039","name":"MILANES, SHANE SALIBIO","team":"IE"},{"id":"IE-040","code":"IE-040","name":"NAVARRO, NEON GENESIS DE CASTRO","team":"IE"},{"id":"IE-041","code":"IE-041","name":"NOBLEFRANCA, VARY ALEM CANDELARIA","team":"IE"},{"id":"IE-042","code":"IE-042","name":"OQUERIA, CAMILLE ANNE CANLOBO","team":"IE"},{"id":"IE-043","code":"IE-043","name":"ORELLANES, JOHN MARK BATASINGEN","team":"IE"},{"id":"IE-044","code":"IE-044","name":"PACALDO, JHAYSAMEL ALALIM","team":"IE"},{"id":"IE-045","code":"IE-045","name":"PINEDA, KIENNA DENISE ORUGA","team":"IE"},{"id":"IE-046","code":"IE-046","name":"RAMILO, JONAIRA MARI LUCIDO","team":"IE"},{"id":"IE-047","code":"IE-047","name":"RIVERA, RALPH HENRY CAAGBAY","team":"IE"},{"id":"IE-048","code":"IE-048","name":"ROBLES, MARK ANDREI BANIGO-OS","team":"IE"},{"id":"IE-049","code":"IE-049","name":"SUAREZ, KEN DELA CRUZ","team":"IE"},{"id":"IE-050","code":"IE-050","name":"SUATING, DARVIE ANGELO DELA PEÑA","team":"IE"},{"id":"IE-051","code":"IE-051","name":"ATENCIO, IRISH MAE ADRIATICO","team":"IE"},{"id":"IE-052","code":"IE-052","name":"BAUTISTA, MAURHIZ LIRA","team":"IE"},{"id":"IE-053","code":"IE-053","name":"BONIFACIO, MARC ANTHONY PEREZ","team":"IE"},{"id":"IE-054","code":"IE-054","name":"BUSTAMANTE, ZYRUS DIMAANO","team":"IE"},{"id":"IE-055","code":"IE-055","name":"CASAJE, PRINCESS JANE DEQUIÑA","team":"IE"},{"id":"IE-056","code":"IE-056","name":"DALIS, LESTER MARU CABRERA","team":"IE"},{"id":"IE-057","code":"IE-057","name":"DE LA CRUZ, CHRISTIAN EARL MANANGAN","team":"IE"},{"id":"IE-058","code":"IE-058","name":"DELA TORRE, ANGELICA FAYE TUBILLO","team":"IE"},{"id":"IE-059","code":"IE-059","name":"JACINTO, GILLIANE MARGARETTE CREDO","team":"IE"},{"id":"IE-060","code":"IE-060","name":"LAOMOC, JANSENN LOU DIMALALUAN","team":"IE"},{"id":"IE-061","code":"IE-061","name":"LUBATON, ALTHEA FEI MOLINTAPANG","team":"IE"},{"id":"IE-062","code":"IE-062","name":"LUMBRES, JENELLE MANIMTIM","team":"IE"},{"id":"IE-063","code":"IE-063","name":"MALBAS, MARJORI DAUSON","team":"IE"},{"id":"IE-064","code":"IE-064","name":"MANUEL, CARL JUSTIN BUENA","team":"IE"},{"id":"IE-065","code":"IE-065","name":"MARIANO, IVAN CLARK JORISH MENDOZA","team":"IE"},{"id":"IE-066","code":"IE-066","name":"MARIANO, JUAN PAULO MIRASOL","team":"IE"},{"id":"IE-067","code":"IE-067","name":"MATANGUIHAN, KYLA AVILA","team":"IE"},{"id":"IE-068","code":"IE-068","name":"MORADA, MICAIAH GWYNNETH GONZALES","team":"IE"},{"id":"IE-069","code":"IE-069","name":"QUEZON, JOHN ARIEL ROSALES","team":"IE"},{"id":"IE-070","code":"IE-070","name":"RAMIRO, JAYPEE DOMINGO","team":"IE"},{"id":"IE-071","code":"IE-071","name":"RAPAL, KHRISTIAN LEGASPI","team":"IE"},{"id":"IE-072","code":"IE-072","name":"TAYONI, DUSTIN KYLE QUIJADA","team":"IE"},{"id":"IE-073","code":"IE-073","name":"TEMEÑA, MARK ANGELO BOMBITA","team":"IE"},{"id":"IE-074","code":"IE-074","name":"VIDAL, JULIAN VICTOR NARVAEZ","team":"IE"},{"id":"IE-075","code":"IE-075","name":"VILLANUEVA, RALPH CYRIL VIDAERA","team":"IE"},{"id":"IE-076","code":"IE-076","name":"VIZCONDE, ARYZA GRACE ESCOBELLA","team":"IE"},{"id":"IE-077","code":"IE-077","name":"ALCASABAS, JERICHO CRIS ARCEO","team":"IE"},{"id":"IE-078","code":"IE-078","name":"AMPELOQUIO, JOHN ARMIL PILAR","team":"IE"},{"id":"IE-079","code":"IE-079","name":"ANCAYAN, ALLUJ PHILIP BELEN","team":"IE"},{"id":"IE-080","code":"IE-080","name":"BARRIENTOS, VINCENT BACANI","team":"IE"},{"id":"IE-081","code":"IE-081","name":"BARUNDIA, BRYLLE RAPHAEL MANDIGMA","team":"IE"},{"id":"IE-082","code":"IE-082","name":"BAYOT, HELEINA JANE IGUAL","team":"IE"},{"id":"IE-083","code":"IE-083","name":"CABALES, RAYVER JUSTINE NOCHETE","team":"IE"},{"id":"IE-084","code":"IE-084","name":"CABUDSAN, CATHERINE JOY MUSNGI","team":"IE"},{"id":"IE-085","code":"IE-085","name":"DISIMULACION, KIM BRAYN RAMOS","team":"IE"},{"id":"IE-086","code":"IE-086","name":"IBO, JOHN LLOYD FARIÑAS","team":"IE"},{"id":"IE-087","code":"IE-087","name":"LABUTAP, DAVE ALDRIN LARA","team":"IE"},{"id":"IE-088","code":"IE-088","name":"MARQUEZ, ARIES SALUD","team":"IE"},{"id":"IE-089","code":"IE-089","name":"NENENG, FRANKY PARAISO","team":"IE"},{"id":"IE-090","code":"IE-090","name":"PEREZ, ZYREL MANIMTIM","team":"IE"},{"id":"IE-091","code":"IE-091","name":"REGINIO JR., ROLANDO AMPELOQUIO","team":"IE"},{"id":"IE-092","code":"IE-092","name":"RUEDA, MARCUS BELMONTE","team":"IE"},{"id":"IE-093","code":"IE-093","name":"RUEDA, NICOLE BELMONTE","team":"IE"},{"id":"IE-094","code":"IE-094","name":"TIAMSIM, LOREN JADE JANDUSAY","team":"IE"},{"id":"IE-095","code":"IE-095","name":"TORRES, SER JOAQUIN EMMANUEL DELA VEGA","team":"IE"},{"id":"IE-096","code":"IE-096","name":"TUIZA, LANZ ROBLES","team":"IE"},{"id":"IE-097","code":"IE-097","name":"VELASCO, PRINCE CHOLO MASAGNAY","team":"IE"},{"id":"CE-001","code":"CE-001","name":"ACLAN, SHAYNE PRANCESS E.","team":"CE"},{"id":"CE-002","code":"CE-002","name":"ACULA, MARY HONEY KAYE C.","team":"CE"},{"id":"CE-003","code":"CE-003","name":"AGUANTA, ALYSSA A.","team":"CE"},{"id":"CE-004","code":"CE-004","name":"ALBUFERA, RALF HOMER F.","team":"CE"},{"id":"CE-005","code":"CE-005","name":"ALCANTARA, LIAM GABRIEL L.","team":"CE"},{"id":"CE-006","code":"CE-006","name":"ALMEDA, MARIONNE C.","team":"CE"},{"id":"CE-007","code":"CE-007","name":"ALMONTE, YAEL GABRIEL S.","team":"CE"},{"id":"CE-008","code":"CE-008","name":"AMANTE, CYRA IYA A.","team":"CE"},{"id":"CE-009","code":"CE-009","name":"AMPER, DIVINE JOY B.","team":"CE"},{"id":"CE-010","code":"CE-010","name":"APOSTOL, APPLE-KRIS E.","team":"CE"},{"id":"CE-011","code":"CE-011","name":"AQUINO, JESSA MAE D.","team":"CE"},{"id":"CE-012","code":"CE-012","name":"ARABE, DOMINIC JAMES D.","team":"CE"},{"id":"CE-013","code":"CE-013","name":"ARBO, EVAN JEROME P.","team":"CE"},{"id":"CE-014","code":"CE-014","name":"ASUNCION, KRYSTAL CLAIRE L.","team":"CE"},{"id":"CE-015","code":"CE-015","name":"AVELLANO, FERLIONA C.","team":"CE"},{"id":"CE-016","code":"CE-016","name":"BALDERAMA, CHRISTIAN LLOYD B.","team":"CE"},{"id":"CE-017","code":"CE-017","name":"BALLESTEROS, KIRSTINE DOLL B.","team":"CE"},{"id":"CE-018","code":"CE-018","name":"BANSUELO, SHAINE LARA A.","team":"CE"},{"id":"CE-019","code":"CE-019","name":"BARREDO, JEWEL P.","team":"CE"},{"id":"CE-020","code":"CE-020","name":"BLAZA, ANGELICA LOURINE R.","team":"CE"},{"id":"CE-021","code":"CE-021","name":"BORLAGDATAN, REIGN ASHLEY P.","team":"CE"},{"id":"CE-022","code":"CE-022","name":"BREGANZA, JOHN LOYD R.","team":"CE"},{"id":"CE-023","code":"CE-023","name":"BUENAOBRA, MHICA S.","team":"CE"},{"id":"CE-024","code":"CE-024","name":"BUNDALIAN, KATHLEEN V.","team":"CE"},{"id":"CE-025","code":"CE-025","name":"CACAO, IRISH F.","team":"CE"},{"id":"CE-026","code":"CE-026","name":"CANCEJO, LORIE JANE M.","team":"CE"},{"id":"CE-027","code":"CE-027","name":"CAPIROSO, JEANIE AMBER L.","team":"CE"},{"id":"CE-028","code":"CE-028","name":"CASTRO, JEFFER KERBY M.","team":"CE"},{"id":"CE-029","code":"CE-029","name":"CLEMENTE, LERI ALEXANDRA S.","team":"CE"},{"id":"CE-030","code":"CE-030","name":"CONCEPCION, ROSELYN B.","team":"CE"},{"id":"CE-031","code":"CE-031","name":"CORDETA, LHORENCE BEIN M.","team":"CE"},{"id":"CE-032","code":"CE-032","name":"CORPUZ, JAZMIN MYKHAELA N.","team":"CE"},{"id":"CE-033","code":"CE-033","name":"COSICO, SOPHIA SANE A.","team":"CE"},{"id":"CE-034","code":"CE-034","name":"CRUZ, REI ANNE R.","team":"CE"},{"id":"CE-035","code":"CE-035","name":"CUBE, VAN JUZZEN SENA S.","team":"CE"},{"id":"CE-036","code":"CE-036","name":"CUÑADO, GIAN GABRIEL R.","team":"CE"},{"id":"CE-037","code":"CE-037","name":"DALISAY, APRIL CHARIZ C.","team":"CE"},{"id":"CE-038","code":"CE-038","name":"DALISAY, JOHN CHRIS P.","team":"CE"},{"id":"CE-039","code":"CE-039","name":"DE ALDAY, JOHN FLOYD A.","team":"CE"},{"id":"CE-040","code":"CE-040","name":"DE CASTRO, CHERRYANN L.","team":"CE"},{"id":"CE-041","code":"CE-041","name":"DE JUAN, SHAINE H.","team":"CE"},{"id":"CE-042","code":"CE-042","name":"DE LEON, KIM ALLAINE B.","team":"CE"},{"id":"CE-043","code":"CE-043","name":"DE MESA, LORAINNE P.","team":"CE"},{"id":"CE-044","code":"CE-044","name":"DEGULLADO, ANA MARIE G.","team":"CE"},{"id":"CE-045","code":"CE-045","name":"DELA CRUZ, CZARINAH BEATRICE C.","team":"CE"},{"id":"CE-046","code":"CE-046","name":"DELOS REYES, JOROSS MARK E.","team":"CE"},{"id":"CE-047","code":"CE-047","name":"DEMDAM, MARK GERALD F.","team":"CE"},{"id":"CE-048","code":"CE-048","name":"DICHOSO, JAMES RUSSEL R.","team":"CE"},{"id":"CE-049","code":"CE-049","name":"DOBLES II, ARTURO R.","team":"CE"},{"id":"CE-050","code":"CE-050","name":"DOSADO, CHLOE NICOLE A.","team":"CE"},{"id":"CE-051","code":"CE-051","name":"ENCANTO, GLYCEL R.","team":"CE"},{"id":"CE-052","code":"CE-052","name":"ENCARNACION, JASPER R.","team":"CE"},{"id":"CE-053","code":"CE-053","name":"ENRIQUEZ, MARK DAVE R.","team":"CE"},{"id":"CE-054","code":"CE-054","name":"ESCALANTE, FREDERICK ERVIN ALLEN T.","team":"CE"},{"id":"CE-055","code":"CE-055","name":"ESPINA, VENUS L.","team":"CE"},{"id":"CE-056","code":"CE-056","name":"EVANGELISTA, JOHN DOMINIC B.","team":"CE"},{"id":"CE-057","code":"CE-057","name":"FAMILARAN, PRINCE MHUEL B.","team":"CE"},{"id":"CE-058","code":"CE-058","name":"FERRER, DENNIS PIOLO D.","team":"CE"},{"id":"CE-059","code":"CE-059","name":"FIGUEROA, JUSTIN V.","team":"CE"},{"id":"CE-060","code":"CE-060","name":"FILIO, DANIEL S.","team":"CE"},{"id":"CE-061","code":"CE-061","name":"FLORES, MEL GIBSON L.","team":"CE"},{"id":"CE-062","code":"CE-062","name":"FLORORITA, DHONA MARIE A.","team":"CE"},{"id":"CE-063","code":"CE-063","name":"FRANCISCO, MARC JUSTINE B.","team":"CE"},{"id":"CE-064","code":"CE-064","name":"GALANG, SAMANTHA ADRIENNE Q.","team":"CE"},{"id":"CE-065","code":"CE-065","name":"GALINATO, LORENZO DUSTIN B.","team":"CE"},{"id":"CE-066","code":"CE-066","name":"GALIZA, TRISTAN HARVEY M.","team":"CE"},{"id":"CE-067","code":"CE-067","name":"GARBO, NIRAH S.","team":"CE"},{"id":"CE-068","code":"CE-068","name":"GARCIA, ELISHA RHEIN MULIMBAYAN M.","team":"CE"},{"id":"CE-069","code":"CE-069","name":"GARCIA, FRANCIS P.","team":"CE"},{"id":"CE-070","code":"CE-070","name":"GLINOGA, JHAY EL C.","team":"CE"},{"id":"CE-071","code":"CE-071","name":"GLIPO, CRISTINE NICOLE M.","team":"CE"},{"id":"CE-072","code":"CE-072","name":"GO, MIASHI I.","team":"CE"},{"id":"CE-073","code":"CE-073","name":"GRAPANI, LEEAN MAE T.","team":"CE"},{"id":"CE-074","code":"CE-074","name":"HAEL, MICHAEL CLARK C.","team":"CE"},{"id":"CE-075","code":"CE-075","name":"HAEL, EDMELYN D.","team":"CE"},{"id":"CE-076","code":"CE-076","name":"JAVIER, TRIXIE B.","team":"CE"},{"id":"CE-077","code":"CE-077","name":"JUANANE, LUIS JAN YVES M.","team":"CE"},{"id":"CE-078","code":"CE-078","name":"LABILLES, MARK DARYL R.","team":"CE"},{"id":"CE-079","code":"CE-079","name":"LAGDAMEN, MARK DADEN A.","team":"CE"},{"id":"CE-080","code":"CE-080","name":"LAGOC, EURIELLE CLAIRE L.","team":"CE"},{"id":"CE-081","code":"CE-081","name":"LAGRAZON, GIAN JUDD S.","team":"CE"},{"id":"CE-082","code":"CE-082","name":"LANSANGAN, JOHN DANIEL T.","team":"CE"},{"id":"CE-083","code":"CE-083","name":"LAPITAN, STEPHEN JACOB P.","team":"CE"},{"id":"CE-084","code":"CE-084","name":"LAVENTE, JUDY ANN A.","team":"CE"},{"id":"CE-085","code":"CE-085","name":"LAZARO, JARNIE CARL","team":"CE"},{"id":"CE-086","code":"CE-086","name":"LEYCANO, JAMEROS A.","team":"CE"},{"id":"CE-087","code":"CE-087","name":"LOGO, KERVIN JON N.","team":"CE"},{"id":"CE-088","code":"CE-088","name":"LOPEZ, JOHN CARLO C.","team":"CE"},{"id":"CE-089","code":"CE-089","name":"LOPEZ, JOHN HENRY B.","team":"CE"},{"id":"CE-090","code":"CE-090","name":"LUGTU, CHRYSTAL SAPPHIRE D.","team":"CE"},{"id":"CE-091","code":"CE-091","name":"LULU, AIRA LEI C.","team":"CE"},{"id":"CE-092","code":"CE-092","name":"LUMBRES, JEROME B.","team":"CE"},{"id":"CE-093","code":"CE-093","name":"LUTA, TRISHA SHANE","team":"CE"},{"id":"CE-094","code":"CE-094","name":"MACATOL, KESIA MAE A.","team":"CE"},{"id":"CE-095","code":"CE-095","name":"MAGTAN-AO, LOVELY B.","team":"CE"},{"id":"CE-096","code":"CE-096","name":"MANAIG, KURT ANDREI","team":"CE"},{"id":"CE-097","code":"CE-097","name":"MANAIG, ROBBIE D.","team":"CE"},{"id":"CE-098","code":"CE-098","name":"MARASIGAN, KURT AERRON P.","team":"CE"},{"id":"CE-099","code":"CE-099","name":"MARIANO, JOHN PAUL S.","team":"CE"},{"id":"CE-100","code":"CE-100","name":"MARTEJA, JAMES HECTOR G.","team":"CE"},{"id":"CE-101","code":"CE-101","name":"MAYOLA, JASPER D.","team":"CE"},{"id":"CE-102","code":"CE-102","name":"MELENDREZ, AIRISH JAMES M.","team":"CE"},{"id":"CE-103","code":"CE-103","name":"MENDOZA, ROLDAN L.","team":"CE"},{"id":"CE-104","code":"CE-104","name":"MERAÑA, LORAINE KISHA A.","team":"CE"},{"id":"CE-105","code":"CE-105","name":"MERILLES, JHARED A.","team":"CE"},{"id":"CE-106","code":"CE-106","name":"MERTO, HANNAH CES C.","team":"CE"},{"id":"CE-107","code":"CE-107","name":"MIRANDA, RANIEL Y.","team":"CE"},{"id":"CE-108","code":"CE-108","name":"MORADA, JHANELL SOPHIA B.","team":"CE"},{"id":"CE-109","code":"CE-109","name":"NACARIO, SOFIA MARIE A.","team":"CE"},{"id":"CE-110","code":"CE-110","name":"NAVARRO, GERALD JAMES O.","team":"CE"},{"id":"CE-111","code":"CE-111","name":"NAVARTE, JOSEPH ROEM E.","team":"CE"},{"id":"CE-112","code":"CE-112","name":"OCTAVIO, LEVIN JANE D.","team":"CE"},{"id":"CE-113","code":"CE-113","name":"ORTIZ, ELEUMAR NIMROD ITHEL T.","team":"CE"},{"id":"CE-114","code":"CE-114","name":"PALASIGUE, ANDREI C.","team":"CE"},{"id":"CE-115","code":"CE-115","name":"PANTERIA, SHANELLE B.","team":"CE"},{"id":"CE-116","code":"CE-116","name":"PASATIEMPO, TRICIA N.","team":"CE"},{"id":"CE-117","code":"CE-117","name":"PASTRANA, RENMAR C.","team":"CE"},{"id":"CE-118","code":"CE-118","name":"PEDIDA, KELLY ANNE E.","team":"CE"},{"id":"CE-119","code":"CE-119","name":"PEREZ, CEEJHAE D.","team":"CE"},{"id":"CE-120","code":"CE-120","name":"PEREZ, REAH MAE","team":"CE"},{"id":"CE-121","code":"CE-121","name":"PINEDA, RAISHELL B.","team":"CE"},{"id":"CE-122","code":"CE-122","name":"PISANTE, ERICA A.","team":"CE"},{"id":"CE-123","code":"CE-123","name":"RAFOL, REDGEM M.","team":"CE"},{"id":"CE-124","code":"CE-124","name":"RAMIREZ, JAYCEE D.","team":"CE"},{"id":"CE-125","code":"CE-125","name":"RAMOS, EARL JOSHUA E.","team":"CE"},{"id":"CE-126","code":"CE-126","name":"RAMOS, GLENN LEONARD C.","team":"CE"},{"id":"CE-127","code":"CE-127","name":"RAMOS, JANELLE F.","team":"CE"},{"id":"CE-128","code":"CE-128","name":"REBADEO, JHON RODNEY C.","team":"CE"},{"id":"CE-129","code":"CE-129","name":"REBLORA, JOHN NATHANIEL S.","team":"CE"},{"id":"CE-130","code":"CE-130","name":"REGONDOLA, MARIA ANDREA R.","team":"CE"},{"id":"CE-131","code":"CE-131","name":"RELENTE, JOSH KOJI L.","team":"CE"},{"id":"CE-132","code":"CE-132","name":"RELOJ, KARL ANDREI A.","team":"CE"},{"id":"CE-133","code":"CE-133","name":"REOGO, DRIZELLA JAYNE A.","team":"CE"},{"id":"CE-134","code":"CE-134","name":"RODRIGUEZ, RUSSEL P.","team":"CE"},{"id":"CE-135","code":"CE-135","name":"ROSARIO, LAURENZ JAMES I.","team":"CE"},{"id":"CE-136","code":"CE-136","name":"RUBILLA, VON LAUVIN J.","team":"CE"},{"id":"CE-137","code":"CE-137","name":"SALO, REIN SAM M.","team":"CE"},{"id":"CE-138","code":"CE-138","name":"SALVADOR, CARLOS IVAN N.","team":"CE"},{"id":"CE-139","code":"CE-139","name":"SANDOVAL, JOHN MICHAEL L.","team":"CE"},{"id":"CE-140","code":"CE-140","name":"SARDIDO, LARZ JENRIL R.","team":"CE"},{"id":"CE-141","code":"CE-141","name":"SECRETARIO, ELAIZA M.","team":"CE"},{"id":"CE-142","code":"CE-142","name":"SUBIA, CHIN AIKEE A.","team":"CE"},{"id":"CE-143","code":"CE-143","name":"TABION, RENDEL Q.","team":"CE"},{"id":"CE-144","code":"CE-144","name":"TAHAMIL, ARMANI M.","team":"CE"},{"id":"CE-145","code":"CE-145","name":"TAN, LORENCE DAVID R.","team":"CE"},{"id":"CE-146","code":"CE-146","name":"TEMPLONUEVO, NICOLE G.","team":"CE"},{"id":"CE-147","code":"CE-147","name":"TOLEDO, NICOLE P.","team":"CE"},{"id":"CE-148","code":"CE-148","name":"TORRECAMPO, CHRISTIAN ARON P.","team":"CE"},{"id":"CE-149","code":"CE-149","name":"TORRENDON, JASPHER M.","team":"CE"},{"id":"CE-150","code":"CE-150","name":"VILLA, DAISY ANN S.","team":"CE"},{"id":"CE-151","code":"CE-151","name":"VILLANUEVA, LUIS MIGUEL D.","team":"CE"},{"id":"CE-152","code":"CE-152","name":"YLAGAN, ADRIENNE G.","team":"CE"}] ;

const EDAYS_2026_ME_ROSTER = [{"id":"student-0001","code":"MEODL-0001","name":"ABSALUD, EDWARD KEEN TAGLE","team":"ME"},{"id":"student-0002","code":"MEODL-0002","name":"ALMORO, STEPHEN NASH GACILLOS","team":"ME"},{"id":"student-0003","code":"MEODL-0003","name":"ASPERIN, ENRIQUE ACLAN","team":"ME"},{"id":"student-0004","code":"MEODL-0004","name":"AUSTRIA, ANDREA RIVERA","team":"ME"},{"id":"student-0005","code":"MEODL-0005","name":"BANATIN, CRISTOFF JIMSON TEJERO","team":"ME"},{"id":"student-0006","code":"MEODL-0006","name":"BARBA III, DANILO MAYLON","team":"ME"},{"id":"student-0007","code":"MEODL-0007","name":"BOLA, AR-JAMES REMOROZA","team":"ME"},{"id":"student-0008","code":"MEODL-0008","name":"CAGANAN, JOHN CEDRIC TAMAYO","team":"ME"},{"id":"student-0009","code":"MEODL-0009","name":"CARANDANG, GABRIEL FLORES","team":"ME"},{"id":"student-0010","code":"MEODL-0010","name":"CHAMIAN, BRADEN CHOZAS","team":"ME"},{"id":"student-0011","code":"MEODL-0011","name":"CONTRERAS, KENDRICK ZABDIEL RECIO","team":"ME"},{"id":"student-0012","code":"MEODL-0012","name":"CREMEN, AMIR MCKALE DEL SOL","team":"ME"},{"id":"student-0013","code":"MEODL-0013","name":"DE JESUS, JOHN JERNIECHO TABUYO","team":"ME"},{"id":"student-0014","code":"MEODL-0014","name":"DEBLOLS, REDD YUAN MERILLES","team":"ME"},{"id":"student-0015","code":"MEODL-0015","name":"DIZON, LEE JHUDIEL ANGARA","team":"ME"},{"id":"student-0016","code":"MEODL-0016","name":"ECHAPARE, PRINCE MEINARD MARCELLANA","team":"ME"},{"id":"student-0017","code":"MEODL-0017","name":"ETORMA, CHRIS ADVIEN LIBELO","team":"ME"},{"id":"student-0018","code":"MEODL-0018","name":"FLORES, HABIB DHEREX","team":"ME"},{"id":"student-0019","code":"MEODL-0019","name":"FONTANILLA, LORDRYAN CLYDE MORANTE","team":"ME"},{"id":"student-0020","code":"MEODL-0020","name":"GALANG, MARK KIRBY MORES","team":"ME"},{"id":"student-0021","code":"MEODL-0021","name":"GARCELLANO, AUDREY CALVIN PRADO","team":"ME"},{"id":"student-0022","code":"MEODL-0022","name":"GARCIA, JOHN LEMUEL","team":"ME"},{"id":"student-0023","code":"MEODL-0023","name":"GARCIA, KERBY ORUGA","team":"ME"},{"id":"student-0024","code":"MEODL-0024","name":"GERVACIO, LJ DENISSE HERNANDEZ","team":"ME"},{"id":"student-0025","code":"MEODL-0025","name":"GRATE, STOFFEL JASEN PERALTA","team":"ME"},{"id":"student-0026","code":"MEODL-0026","name":"ILARDE, RAISEL BORROMEO","team":"ME"},{"id":"student-0027","code":"MEODL-0027","name":"JUAN, MARK CLARENCE HIPOS","team":"ME"},{"id":"student-0028","code":"MEODL-0028","name":"LAFORTEZA, SAMANTHA NICOLE GLIPONEO","team":"ME"},{"id":"student-0029","code":"MEODL-0029","name":"LAIT, MARWELL SELWIN JABONILLO","team":"ME"},{"id":"student-0030","code":"MEODL-0030","name":"LEONOR, JOHN ROVEE VERGARA","team":"ME"},{"id":"student-0031","code":"MEODL-0031","name":"MAGHANOY, DAVID JAN RUZZEL BUMAGAT","team":"ME"},{"id":"student-0032","code":"MEODL-0032","name":"MALIPOL, CARL JEAN NOEL LARIOS","team":"ME"},{"id":"student-0033","code":"MEODL-0033","name":"MALLARI, LOUISE ANDREY DACLIZON","team":"ME"},{"id":"student-0034","code":"MEODL-0034","name":"MANALASTAS, JAMES SERDAN","team":"ME"},{"id":"student-0035","code":"MEODL-0035","name":"MANALO, CHARLES JOSEPH GAMBOA","team":"ME"},{"id":"student-0036","code":"MEODL-0036","name":"MONTERO, JOSHUA TAPIA","team":"ME"},{"id":"student-0037","code":"MEODL-0037","name":"ORENSE, EMIL GABRIEL MANGILIN","team":"ME"},{"id":"student-0038","code":"MEODL-0038","name":"PACLIBAR, JOHN MICHAEL VILLARAZA","team":"ME"},{"id":"student-0039","code":"MEODL-0039","name":"PALICPIC, CHRIS JERICO MIRANDA","team":"ME"},{"id":"student-0040","code":"MEODL-0040","name":"PUA, LIAM AKIEM CARASUS","team":"ME"},{"id":"student-0041","code":"MEODL-0041","name":"PUBLICO, JOHN MICHAEL BANAAG","team":"ME"},{"id":"student-0042","code":"MEODL-0042","name":"PULGAR, ROWEN VICTOR CUBILE","team":"ME"},{"id":"student-0043","code":"MEODL-0043","name":"QUIRANTE, SHIANELA BALANAY","team":"ME"},{"id":"student-0044","code":"MEODL-0044","name":"RIPO, RENZ ALJUN DOMINGUEZ","team":"ME"},{"id":"student-0045","code":"MEODL-0045","name":"SALIBA, GIAN KARLO BRAGADO","team":"ME"},{"id":"student-0046","code":"MEODL-0046","name":"SAN PASCUAL, JAMES DOMINIC TADONG","team":"ME"},{"id":"student-0047","code":"MEODL-0047","name":"SANTOS, KARL ANGELO DIAGO","team":"ME"},{"id":"student-0048","code":"MEODL-0048","name":"TALASTASIN, ALHJHON ANCHETA","team":"ME"},{"id":"student-0049","code":"MEODL-0049","name":"TAYAG, JAYSON BARQUILLA","team":"ME"},{"id":"student-0050","code":"MEODL-0050","name":"TEJERO, ARCH RYLER LOZADA","team":"ME"},{"id":"student-0051","code":"MEODL-0051","name":"TIZON, THEO DAN GHERICK MERALPES","team":"ME"},{"id":"student-0052","code":"MEODL-0052","name":"TULUD, MARCOS JOHN BONSO","team":"ME"},{"id":"student-0053","code":"MEODL-0053","name":"TURAJA, VIEN XYRILLE SANGALANG","team":"ME"},{"id":"student-0054","code":"MEODL-0054","name":"VILLAPANDO, RUSSEL THOMSON C.","team":"ME"},{"id":"student-0055","code":"MEODL-0055","name":"ZUÑIGA, KENNETH JOHN RIVEL","team":"ME"},{"id":"student-0056","code":"MEODL-0056","name":"ABERDE, NOMEL ACE CERBO","team":"ME"},{"id":"student-0057","code":"MEODL-0057","name":"ALGIRE, JEROME DAVE DEVOMA","team":"ME"},{"id":"student-0058","code":"MEODL-0058","name":"ALMORO, AERON JAMES PALENTINOS","team":"ME"},{"id":"student-0059","code":"MEODL-0059","name":"ASI, JOSH EROLD GOPOLLA","team":"ME"},{"id":"student-0060","code":"MEODL-0060","name":"CANA, AARON JAY CONDALOR","team":"ME"},{"id":"student-0061","code":"MEODL-0061","name":"CONTRERAS, CHAUNCEY DRE MALAPITAN","team":"ME"},{"id":"student-0062","code":"MEODL-0062","name":"DELA VIÑA, RHYME SOLAMO","team":"ME"},{"id":"student-0063","code":"MEODL-0063","name":"ELAURIA, JYMNASH CZAR ENDOZO","team":"ME"},{"id":"student-0064","code":"MEODL-0064","name":"ERJAS, CARL ANTHONY LAMAR","team":"ME"},{"id":"student-0065","code":"MEODL-0065","name":"ESPINA, CARL DUSTIN INOC","team":"ME"},{"id":"student-0066","code":"MEODL-0066","name":"GARCIA, JAMES ANDREW","team":"ME"},{"id":"student-0067","code":"MEODL-0067","name":"GAVINO, JHON RAVEN","team":"ME"},{"id":"student-0068","code":"MEODL-0068","name":"GLIPONEO, PRINCESS KYLE GUIM","team":"ME"},{"id":"student-0069","code":"MEODL-0069","name":"HERNANDEZ, NATHANIEL TUÑACAO","team":"ME"},{"id":"student-0070","code":"MEODL-0070","name":"HODRIAL, ALLEN VINCE CEDRO","team":"ME"},{"id":"student-0071","code":"MEODL-0071","name":"LACORTE, JOHN LAWRENCE DELATADO","team":"ME"},{"id":"student-0072","code":"MEODL-0072","name":"LIMBO, MARK REGIE ASISTIDO","team":"ME"},{"id":"student-0073","code":"MEODL-0073","name":"LLAMZON, ZYMON HILL PASCUAL","team":"ME"},{"id":"student-0074","code":"MEODL-0074","name":"MANZANILLA, BRIXTER JOSEPH GONZALES","team":"ME"},{"id":"student-0075","code":"MEODL-0075","name":"MATUNDAN, KHAEOUS AERAY COLLADO","team":"ME"},{"id":"student-0076","code":"MEODL-0076","name":"MIRASOL, MARTIN NEIL LAQUINDANUM","team":"ME"},{"id":"student-0077","code":"MEODL-0077","name":"NERO, GABBIELLE CACAL","team":"ME"},{"id":"student-0078","code":"MEODL-0078","name":"NUNO, RON EXEQUIEL","team":"ME"},{"id":"student-0079","code":"MEODL-0079","name":"OBLIPIAS, ZIGGY SABDAO","team":"ME"},{"id":"student-0080","code":"MEODL-0080","name":"OLINO, JOPETH ORBESO","team":"ME"},{"id":"student-0081","code":"MEODL-0081","name":"OLIQUINO, CHRISTIAN ARROYO","team":"ME"},{"id":"student-0082","code":"MEODL-0082","name":"ONTE, RAFAEL PAMPLONA","team":"ME"},{"id":"student-0083","code":"MEODL-0083","name":"PEÑA, CARLOS MIGUEL ANTIDO","team":"ME"},{"id":"student-0084","code":"MEODL-0084","name":"PRADO, JOHN LENRICK TABERNILLA","team":"ME"},{"id":"student-0085","code":"MEODL-0085","name":"QUILAO, LORD JOHN LUMACAD","team":"ME"},{"id":"student-0086","code":"MEODL-0086","name":"REAL, JILLIAN CAÑUBAS","team":"ME"},{"id":"student-0087","code":"MEODL-0087","name":"RUTAQUIO, BENEDICT GUCILATAR","team":"ME"},{"id":"student-0088","code":"MEODL-0088","name":"SALON, JAN MIKHAIL FORTUNO","team":"ME"},{"id":"student-0089","code":"MEODL-0089","name":"SANTOS, KARYLLE JOY SADIA","team":"ME"},{"id":"student-0090","code":"MEODL-0090","name":"TAGUIAM, JAE HARVEY BALASTA","team":"ME"},{"id":"student-0091","code":"MEODL-0091","name":"TALATALA, REIN EISEN BANDOLA","team":"ME"},{"id":"student-0092","code":"MEODL-0092","name":"ALVAREZ, VANNA JENILLE ROCCO","team":"ME"},{"id":"student-0093","code":"MEODL-0093","name":"ARGAÑOSA, RYU EMANUEL DELA CRUZ","team":"ME"},{"id":"student-0094","code":"MEODL-0094","name":"BAÑEZ, JOSEL DE CASTRO","team":"ME"},{"id":"student-0095","code":"MEODL-0095","name":"BARLETA, BRYANT DOCTORA","team":"ME"},{"id":"student-0096","code":"MEODL-0096","name":"BENGCO, EPHRAIM RICK REYES","team":"ME"},{"id":"student-0097","code":"MEODL-0097","name":"CABUCO, ZEDRICK CABANIG","team":"ME"},{"id":"student-0098","code":"MEODL-0098","name":"CAJUCOM, AEROL JOHN MARASIGAN","team":"ME"},{"id":"student-0099","code":"MEODL-0099","name":"CARLOS, KING ARDEE NHEL FLORES","team":"ME"},{"id":"student-0100","code":"MEODL-0100","name":"CATLI, JIJAH KARAN CAAGBAY","team":"ME"},{"id":"student-0101","code":"MEODL-0101","name":"DADIS, JARUZZ LANCELOT LAXAMANA","team":"ME"},{"id":"student-0102","code":"MEODL-0102","name":"DANTE, KEN-ZY RACHO","team":"ME"},{"id":"student-0103","code":"MEODL-0103","name":"DE JURAS, IVAN DICHOSO","team":"ME"},{"id":"student-0104","code":"MEODL-0104","name":"DELA ROSA, KEN ALVIN ULEP","team":"ME"},{"id":"student-0105","code":"MEODL-0105","name":"DIMAPILIS, EIDRIAN ROA","team":"ME"},{"id":"student-0106","code":"MEODL-0106","name":"ESTRELLADO, GABRIELLE LANCE MALALUAN","team":"ME"},{"id":"student-0107","code":"MEODL-0107","name":"GLOVO, RISTY AGULLANO","team":"ME"},{"id":"student-0108","code":"MEODL-0108","name":"MARTINEZ, JAY MAR ROMERO","team":"ME"},{"id":"student-0109","code":"MEODL-0109","name":"MEJILLA, JEDIMAR MAGLANGIT","team":"ME"},{"id":"student-0110","code":"MEODL-0110","name":"MERABE, PRINCE ANDEL RODRIGUEZ","team":"ME"},{"id":"student-0111","code":"MEODL-0111","name":"MILAR, EARL JOHN FEDILES","team":"ME"},{"id":"student-0112","code":"MEODL-0112","name":"MIRONES, GIANN CARLO ORTIZ","team":"ME"},{"id":"student-0113","code":"MEODL-0113","name":"OCBINA, ANTHONY REYES","team":"ME"},{"id":"student-0114","code":"MEODL-0114","name":"OPINIO, EDMEL JOHN CONDE","team":"ME"},{"id":"student-0115","code":"MEODL-0115","name":"PEREY, LUIS EMMANUEL MARASIGAN","team":"ME"},{"id":"student-0116","code":"MEODL-0116","name":"QUILITIS, VINCE ALJOE ROBLES","team":"ME"},{"id":"student-0117","code":"MEODL-0117","name":"RECIO, JHEZRIEL EDWARD FLORES","team":"ME"},{"id":"student-0118","code":"MEODL-0118","name":"REYES, LEILA MAY LABACO","team":"ME"},{"id":"student-0119","code":"MEODL-0119","name":"SANDOVAL, EDWARD SOLOMON ALVAREZ","team":"ME"},{"id":"student-0120","code":"MEODL-0120","name":"SEÑEREZ, KYLE CYRIS LLANTO","team":"ME"},{"id":"student-0121","code":"MEODL-0121","name":"TAJAO, PAUL ALDREY BARENG","team":"ME"},{"id":"student-0122","code":"MEODL-0122","name":"TORRES, JAMES CARLOS LAGDAAN","team":"ME"},{"id":"student-0123","code":"MEODL-0123","name":"VASQUEZ, JEPTHAH AGUILA","team":"ME"},{"id":"student-0124","code":"MEODL-0124","name":"YABUT, ASHLEY KURT BERMILLO","team":"ME"},{"id":"student-0125","code":"MEODL-0125","name":"AÑONUEVO, CHRIS","team":"ME"},{"id":"student-0126","code":"MEODL-0126","name":"ATIENZA, MATHEW GARCIA","team":"ME"},{"id":"student-0127","code":"MEODL-0127","name":"BALLESTEROS, MARK ANDERSEN TANDOC","team":"ME"},{"id":"student-0128","code":"MEODL-0128","name":"BANDIOLA, JOHN MARC TORRES","team":"ME"},{"id":"student-0129","code":"MEODL-0129","name":"BARCARSE, SEALTIEL UZZIEL LEGASPI","team":"ME"},{"id":"student-0130","code":"MEODL-0130","name":"BARONIA, JOHN RICHIE DIAZ","team":"ME"},{"id":"student-0131","code":"MEODL-0131","name":"BAYLON, JUSTINE IAN BANAWA","team":"ME"},{"id":"student-0132","code":"MEODL-0132","name":"CAGANAN, JOHN CEDRIC TAMAYO","team":"ME"},{"id":"student-0133","code":"MEODL-0133","name":"CALARA, TYRON JOEL VINOYA","team":"ME"},{"id":"student-0134","code":"MEODL-0134","name":"CAPERARE, CYRUS CESAR MAGAHIS","team":"ME"},{"id":"student-0135","code":"MEODL-0135","name":"CARANIWAN, RHODYLIE KIANA LUNA","team":"ME"},{"id":"student-0136","code":"MEODL-0136","name":"CAYAYAN, LANCE RUSSEL SUMICAD","team":"ME"},{"id":"student-0137","code":"MEODL-0137","name":"CEDALLA, JOHN LESTER HERNANDEZ","team":"ME"},{"id":"student-0138","code":"MEODL-0138","name":"CONVENTO, ADRIAN JAMES LADIA","team":"ME"},{"id":"student-0139","code":"MEODL-0139","name":"DE MESA, ANNA LOREN TUSCANO","team":"ME"},{"id":"student-0140","code":"MEODL-0140","name":"DE TORRES, JAMES IMMANUEL ASILO","team":"ME"},{"id":"student-0141","code":"MEODL-0141","name":"DELA CRUZ, JOHN RINGGO ADELINO","team":"ME"},{"id":"student-0142","code":"MEODL-0142","name":"DELA TORRE, JERALD ROBEL","team":"ME"},{"id":"student-0143","code":"MEODL-0143","name":"DESCALLAR, JOHN PAUL TRAJANO","team":"ME"},{"id":"student-0144","code":"MEODL-0144","name":"ELEFANE, DANAH VALERIE MORALES","team":"ME"},{"id":"student-0145","code":"MEODL-0145","name":"ENRIQUEZ, RAE SHERIZ NECESITO","team":"ME"},{"id":"student-0146","code":"MEODL-0146","name":"EVASCO, ONIMUS AMIR SANCHEZ","team":"ME"},{"id":"student-0147","code":"MEODL-0147","name":"FAJARDO, KING ZHAREN MAMALAYAN","team":"ME"},{"id":"student-0148","code":"MEODL-0148","name":"FAMINIAL, EARL VINCENT MAZO","team":"ME"},{"id":"student-0149","code":"MEODL-0149","name":"FERNANDEZ, NATHANIEL FRANCISCO","team":"ME"},{"id":"student-0150","code":"MEODL-0150","name":"FRANCISCO, RIDJY VILLARIN","team":"ME"},{"id":"student-0151","code":"MEODL-0151","name":"GALANG, KOBIE CONSTANTINE CAPILOS","team":"ME"},{"id":"student-0152","code":"MEODL-0152","name":"JAVIER, DENZEL JOHN LIMSON","team":"ME"},{"id":"student-0153","code":"MEODL-0153","name":"LABRADOR, JOHN PAUL PLASTINAA","team":"ME"},{"id":"student-0154","code":"MEODL-0154","name":"LUMINATE, JIETHER SALMORIN","team":"ME"},{"id":"student-0155","code":"MEODL-0155","name":"MADRONA, CARLOS MIGUEL BANAL","team":"ME"},{"id":"student-0156","code":"MEODL-0156","name":"MAÑEBO, KEITH RUSSELL ALVAREZ","team":"ME"},{"id":"student-0157","code":"MEODL-0157","name":"MARAÑA, RICK JAMES EVANGELISTA","team":"ME"},{"id":"student-0158","code":"MEODL-0158","name":"MARASIGAN, KEMP JOHN RACEL RAMOS","team":"ME"},{"id":"student-0159","code":"MEODL-0159","name":"MESINA, CEDRICK BALLARAN","team":"ME"},{"id":"student-0160","code":"MEODL-0160","name":"MOLDEZ, CARMELO CUNANAN","team":"ME"},{"id":"student-0161","code":"MEODL-0161","name":"ORENSE, EMIL GABRIEL MANGILIN","team":"ME"},{"id":"student-0162","code":"MEODL-0162","name":"PADUGA, EARL JUSTINE ESPELETA","team":"ME"},{"id":"student-0163","code":"MEODL-0163","name":"PAMPLONA, JAMES ADRIAN ENRIQUEZ","team":"ME"},{"id":"student-0164","code":"MEODL-0164","name":"PAYO, DYLAN ATIENZA","team":"ME"},{"id":"student-0165","code":"MEODL-0165","name":"PAYO, PATRICK DANIEL CASTILLO","team":"ME"},{"id":"student-0166","code":"MEODL-0166","name":"QUINTOS, LANCE KENNETH VICTA","team":"ME"},{"id":"student-0167","code":"MEODL-0167","name":"RAMOS, RED MATTHEW DE LEON","team":"ME"},{"id":"student-0168","code":"MEODL-0168","name":"RAPSING, EARL CONTRERAS","team":"ME"},{"id":"student-0169","code":"MEODL-0169","name":"RODIS, CLIFFORD ULLYSSES CASTOR","team":"ME"},{"id":"student-0170","code":"MEODL-0170","name":"SONGALLA, EZEKIEL JENNEL PENIDA","team":"ME"},{"id":"student-0171","code":"MEODL-0171","name":"STEVENS, GILBERT CARAAN","team":"ME"},{"id":"student-0172","code":"MEODL-0172","name":"SUYAT, RYAN BANCORO","team":"ME"},{"id":"student-0173","code":"MEODL-0173","name":"TALAY, SIMON JOHN ASISTORES","team":"ME"},{"id":"student-0174","code":"MEODL-0174","name":"TAN, TYRON JAMES","team":"ME"},{"id":"student-0175","code":"MEODL-0175","name":"VILLACERAN, EMMUEL ROI RIVERA","team":"ME"},{"id":"stu_2026-ece-777","code":"2026-ECE-777","name":"SANTOS, MARIA","team":"ME"}] ;


const SCHEMA_VERSION = '2026.5';
const ROSTER_VERSION = '2026-EDAYS-588';
const ENGDAY_GAMES_LIST = [
  'd1-reg',
  'd1-am-block',
  'd1-pm-block',
  'd1-finals',
  'd2-am-palaro',
  'd2-esports',
  'd2-pageant',
  'd2-colorfest'
];

function ensureFullMasterRoster(targetStudentsMap, sessionsList) {
  if (!targetStudentsMap || typeof targetStudentsMap !== 'object') {
    targetStudentsMap = {};
  }
  // Purge test student custom_stu_999 / 2026-CPE-999
  delete targetStudentsMap['custom_stu_999'];
  delete targetStudentsMap['2026-CPE-999'];
  for (const [k, s] of Object.entries(targetStudentsMap)) {
    if (!s || s.id === 'custom_stu_999' || s.code === '2026-CPE-999' || s.id === '2026-CPE-999' || s.studentCode === '2026-CPE-999') {
      delete targetStudentsMap[k];
    }
  }

  const defaultSessions = sessionsList || (typeof ENGDAY_GAMES !== 'undefined' ? ENGDAY_GAMES : (typeof ENGDAY_GAMES_LIST !== 'undefined' ? ENGDAY_GAMES_LIST : []));

  const existingLookup = new Map();
  for (const [key, s] of Object.entries(targetStudentsMap)) {
    if (!s) continue;
    const kUpper = String(key).trim().toUpperCase();
    existingLookup.set(kUpper, s);
    if (s.id) existingLookup.set(String(s.id).trim().toUpperCase(), s);
    if (s.code) existingLookup.set(String(s.code).trim().toUpperCase(), s);
    if (s.studentCode) existingLookup.set(String(s.studentCode).trim().toUpperCase(), s);
  }

  const fullRoster = [...EDAYS_2026_ME_ROSTER, ...EDAYS_2026_ADDITIONAL_ROSTER];
  let addedCount = 0;

  for (const item of fullRoster) {
    const rawCode = String(item.code || item.id || '').trim();
    const codeUpper = rawCode.toUpperCase();
    const rawId = String(item.id || item.code || '').trim();
    const idUpper = rawId.toUpperCase();

    const existing = existingLookup.get(idUpper) || existingLookup.get(codeUpper);

    if (existing) {
      if (!existing.code) existing.code = rawCode;
      if (!existing.studentCode) existing.studentCode = rawCode;
      if (!existing.id) existing.id = rawId;
      if (!existing.name && item.name) existing.name = item.name;
    } else {
      const keyToUse = item.id || item.code;
      const teamNorm = String(item.team || 'general').trim().toLowerCase();
      const teamName = item.teamName || ('TEAM ' + teamNorm.toUpperCase());

      const gm = {};
      defaultSessions.forEach(g => {
        const gId = g.id || g;
        gm[gId] = {
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
      });

      const newRec = {
        id: item.id || rawCode,
        code: rawCode,
        studentCode: rawCode,
        name: item.name,
        team: teamNorm,
        teamName: teamName,
        games: gm
      };

      targetStudentsMap[keyToUse] = newRec;
      existingLookup.set(idUpper, newRec);
      existingLookup.set(codeUpper, newRec);
      addedCount++;
    }
  }

  if (addedCount > 0) {
    console.log('[Master Roster] Injected ' + addedCount + ' missing students into roster. Total: ' + Object.keys(targetStudentsMap).length);
  }

  return targetStudentsMap;
}

if (attendanceState && attendanceState.students) {
  ensureFullMasterRoster(attendanceState.students);
}

const DEFAULT_ENGDAY_SESSIONS = [
  {
    id: 'd1-reg',
    shortName: 'D1 REG',
    name: 'D1 Morning Registration & Opening Program',
    label: 'D1 Morning Registration & Opening Program',
    category: 'Day 1 (Oct 19)',
    sport: 'Day 1 (Oct 19)',
    date: '2026-10-19',
    day: 'Day 1',
    time: '7:30 AM – 8:40 AM',
    court: 'Gymnasium',
    location: 'Gymnasium',
    mode: 'check_in_only',
    allowExit: false
  },
  {
    id: 'd1-am-block',
    shortName: 'D1 AM SPORTS',
    name: 'D1 Morning Sports, Booths & Board Games (WBB, VB, Racket, Chess/Dama)',
    label: 'D1 Morning Sports, Booths & Board Games (WBB, VB, Racket, Chess/Dama)',
    category: 'Day 1 (Oct 19)',
    sport: 'Day 1 (Oct 19)',
    date: '2026-10-19',
    day: 'Day 1',
    time: '8:40 AM – 1:00 PM',
    court: 'Gymnasium & EE Lab (Rm 115)',
    location: 'Gymnasium & EE Lab (Rm 115)',
    mode: 'entry_exit',
    allowExit: true
  },
  {
    id: 'd1-pm-block',
    shortName: 'D1 PM BLOCK',
    name: 'D1 Afternoon Sports, Quiz Bee & Valorant',
    label: 'D1 Afternoon Sports, Quiz Bee & Valorant',
    category: 'Day 1 (Oct 19)',
    sport: 'Day 1 (Oct 19)',
    date: '2026-10-19',
    day: 'Day 1',
    time: '1:00 PM – 5:30 PM',
    court: 'Gymnasium & ECE Lab (Rm 116)',
    location: 'Gymnasium & ECE Lab (Rm 116)',
    mode: 'entry_exit',
    allowExit: true
  },
  {
    id: 'd1-finals',
    shortName: 'D1 FINALS',
    name: 'D1 Finals Night (Volleyball & Basketball Championships)',
    label: 'D1 Finals Night (Volleyball & Basketball Championships)',
    category: 'Day 1 (Oct 19)',
    sport: 'Day 1 (Oct 19)',
    date: '2026-10-19',
    day: 'Day 1',
    time: '5:30 PM – 8:00 PM',
    court: 'Gymnasium',
    location: 'Gymnasium',
    mode: 'entry_exit',
    allowExit: true
  },
  {
    id: 'd2-am-palaro',
    shortName: 'D2 PALARO',
    name: 'D2 Morning Registration, Palarong Pinoy & Booths',
    label: 'D2 Morning Registration, Palarong Pinoy & Booths',
    category: 'Day 2 (Oct 20)',
    sport: 'Day 2 (Oct 20)',
    date: '2026-10-20',
    day: 'Day 2',
    time: '8:00 AM – 12:00 NN',
    court: 'Gymnasium / Oval',
    location: 'Gymnasium / Oval',
    mode: 'entry_exit',
    allowExit: true
  },
  {
    id: 'd2-esports',
    shortName: 'D2 ESPORTS',
    name: 'D2 E-Sports Tournaments (MLBB, CODM, Magic Chess, Tekken)',
    label: 'D2 E-Sports Tournaments (MLBB, CODM, Magic Chess, Tekken)',
    category: 'Day 2 (Oct 20)',
    sport: 'Day 2 (Oct 20)',
    date: '2026-10-20',
    day: 'Day 2',
    time: '9:30 AM – 2:00 PM',
    court: 'ECE Room & ME Room',
    location: 'ECE Room & ME Room',
    mode: 'entry_exit',
    allowExit: true
  },
  {
    id: 'd2-pageant',
    shortName: 'D2 PAGEANT',
    name: 'D2 Pageant Screening',
    label: 'D2 Pageant Screening',
    category: 'Day 2 (Oct 20)',
    sport: 'Day 2 (Oct 20)',
    date: '2026-10-20',
    day: 'Day 2',
    time: '1:00 PM – 3:00 PM',
    court: 'Room 218',
    location: 'Room 218',
    mode: 'entry_exit',
    allowExit: true
  },
  {
    id: 'd2-colorfest',
    shortName: 'D2 COLORFEST',
    name: 'D2 College Hours, Awarding & Colorfest / Rave',
    label: 'D2 College Hours, Awarding & Colorfest / Rave',
    category: 'Day 2 (Oct 20)',
    sport: 'Day 2 (Oct 20)',
    date: '2026-10-20',
    day: 'Day 2',
    time: '3:00 PM – 8:00 PM',
    court: 'Gymnasium',
    location: 'Gymnasium',
    mode: 'entry_exit',
    allowExit: true
  }
];

const DEFAULT_ENGDAY_GROUPS = [
  { id: 'ce', name: 'CE (Civil Engineering)', shortCode: 'CE', color: 'cyan', hex: '#06b6d4' },
  { id: 'ie', name: 'IE (Industrial Engineering)', shortCode: 'IE', color: 'emerald', hex: '#10b981' },
  { id: 'ee', name: 'EE (Electrical Engineering)', shortCode: 'EE', color: 'orange', hex: '#f97316' },
  { id: 'cpe', name: 'CPE (Computer Engineering)', shortCode: 'CPE', color: 'purple', hex: '#a855f7' },
  { id: 'ece', name: 'ECE (Electronics Engineering)', shortCode: 'ECE', color: 'rose', hex: '#f43f5e' },
  { id: 'me', name: 'ME (Mechanical Engineering)', shortCode: 'ME', color: 'orange', hex: '#ea580c' }
];

function buildDefaultEngDayRoster(sessionIds = ENGDAY_GAMES_LIST) {
  const students = {};
  ensureFullMasterRoster(students, sessionIds);
  return students;
}

function ensureStudentsHaveSessions(studentsMap, sessionIds = ENGDAY_GAMES_LIST) {
  if (!studentsMap || typeof studentsMap !== 'object') return buildDefaultEngDayRoster(sessionIds);
  const validSessionSet = new Set(sessionIds);

  delete studentsMap['custom_stu_999'];
  delete studentsMap['2026-CPE-999'];
  for (const [k, s] of Object.entries(studentsMap)) {
    if (!s || s.id === 'custom_stu_999' || s.code === '2026-CPE-999' || s.id === '2026-CPE-999' || s.studentCode === '2026-CPE-999') {
      delete studentsMap[k];
      continue;
    }
    if (!s.games || typeof s.games !== 'object') s.games = {};
    // Purge legacy test sessions (vb_g1, bb_g1, etc.)
    Object.keys(s.games).forEach(gId => {
      if (!validSessionSet.has(gId) || gId.startsWith('vb_') || gId.startsWith('bb_')) {
        if (!validSessionSet.has(gId)) {
          delete s.games[gId];
        }
      }
    });
    sessionIds.forEach(gId => {
      if (!s.games[gId]) {
        s.games[gId] = {
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
    });
  }
  return studentsMap;
}

function forceMergeSeedStudents(targetStudentsMap, sessionIds = ENGDAY_GAMES_LIST) {
  if (!targetStudentsMap || typeof targetStudentsMap !== 'object') {
    return buildDefaultEngDayRoster(sessionIds);
  }
  const defaultEngDayStudents = buildDefaultEngDayRoster(sessionIds);
  
  const existingByCodeOrId = new Set();
  for (const [k, s] of Object.entries(targetStudentsMap)) {
    if (k) existingByCodeOrId.add(String(k).trim().toUpperCase());
    if (s) {
      if (s.id) existingByCodeOrId.add(String(s.id).trim().toUpperCase());
      if (s.code) existingByCodeOrId.add(String(s.code).trim().toUpperCase());
      if (s.studentCode) existingByCodeOrId.add(String(s.studentCode).trim().toUpperCase());
    }
  }

  let addedCount = 0;
  for (const [seedKey, seedStudent] of Object.entries(defaultEngDayStudents)) {
    const sId = String(seedStudent.id || seedKey).trim().toUpperCase();
    const sCode = String(seedStudent.code || seedStudent.studentCode || seedKey).trim().toUpperCase();
    
    if (!existingByCodeOrId.has(sId) && !existingByCodeOrId.has(sCode)) {
      const keyToUse = seedStudent.id || seedStudent.code || seedKey;
      targetStudentsMap[keyToUse] = { ...seedStudent };
      existingByCodeOrId.add(sId);
      existingByCodeOrId.add(sCode);
      addedCount++;
    }
  }

  ensureStudentsHaveSessions(targetStudentsMap, sessionIds);

  if (addedCount > 0) {
    console.log(`[Server DB] Force-merged ${addedCount} missing seed students into roster. Total: ${Object.keys(targetStudentsMap).length}`);
  }
  return targetStudentsMap;
}

let engdayEvents = safeReadJson(ENGDAY_EVENTS_FILE, getBundledJson('./engday_attendance_events.json', []));
// Purge test events from engdayEvents
if (Array.isArray(engdayEvents)) {
  engdayEvents = engdayEvents.filter(e => {
    if (!e) return false;
    if (e.studentId === 'custom_stu_999' || e.studentCode === '2026-CPE-999' || e.studentId === '2026-CPE-999') return false;
    if (e.gameId && (e.gameId.startsWith('vb_') || e.gameId.startsWith('bb_')) && !ENGDAY_GAMES_LIST.includes(e.gameId)) return false;
    return true;
  });
}
let engdayEventsMap = new Map();
engdayEvents.forEach(ev => {
  if (ev && ev.eventId) engdayEventsMap.set(ev.eventId, ev);
});

let engdayState = safeReadJson(ENGDAY_STATE_FILE, getBundledJson('./engday_attendance_state.json', null));
if (!engdayState || !engdayState.students || Object.keys(engdayState.students).length === 0) {
  const defaultStudents = {};
  ensureFullMasterRoster(defaultStudents, ENGDAY_GAMES_LIST);
  engdayState = {
    schemaVersion: SCHEMA_VERSION,
    rosterVersion: ROSTER_VERSION,
    activeEventId: 'engday_2026',
    eventsCatalog: {
      engday_2026: {
        id: 'engday_2026',
        schemaVersion: SCHEMA_VERSION,
        rosterVersion: ROSTER_VERSION,
        title: 'ENGINEERING DAYS 2026',
        subtitle: 'UPHSD CALAMBA • ENGINEERING STUDENT COUNCIL • OCT 19–20, 2026 (7:30 AM – 8:00 PM) • UPHSD GYMNASIUM / OVAL',
        venueName: 'Gymnasium / Oval & Engineering Labs',
        staffPin: '2026',
        sessions: DEFAULT_ENGDAY_SESSIONS,
        groups: DEFAULT_ENGDAY_GROUPS,
        students: defaultStudents,
        updatedAt: new Date().toISOString()
      }
    },
    students: defaultStudents,
    version: 1,
    lastUpdated: new Date().toISOString()
  };
} else {
  // Purge test student custom_stu_999 / 2026-CPE-999
  delete engdayState.students['custom_stu_999'];
  delete engdayState.students['2026-CPE-999'];

  ensureFullMasterRoster(engdayState.students, ENGDAY_GAMES_LIST);
  if (engdayState.eventsCatalog) {
    Object.values(engdayState.eventsCatalog).forEach(evt => {
      if (evt) {
        if (!Array.isArray(evt.groups) || evt.groups.length === 0) {
          evt.groups = DEFAULT_ENGDAY_GROUPS.map(g => ({ ...g }));
        } else {
          evt.groups.forEach(g => {
            if (String(g.id).toLowerCase() === 'ee' && (g.color === 'zinc' || g.hex === '#27272a' || g.color === 'amber')) {
              g.color = 'orange';
              g.hex = '#f97316';
            }
          });
        }
        if (evt.students) {
          delete evt.students['custom_stu_999'];
          delete evt.students['2026-CPE-999'];
          ensureFullMasterRoster(evt.students, evt.sessions?.map(s => s.id) || ENGDAY_GAMES_LIST);
        }
      }
    });
  }
  if (!engdayState.activeEventId) engdayState.activeEventId = 'engday_2026';
  if (!engdayState.eventsCatalog || typeof engdayState.eventsCatalog !== 'object') {
    engdayState.eventsCatalog = {
      engday_2026: {
        id: 'engday_2026',
        schemaVersion: SCHEMA_VERSION,
        rosterVersion: ROSTER_VERSION,
        title: 'ENGINEERING DAYS 2026',
        subtitle: 'UPHSD CALAMBA • ENGINEERING STUDENT COUNCIL • OCT 19–20, 2026 (7:30 AM – 8:00 PM) • UPHSD GYMNASIUM / OVAL',
        venueName: 'Gymnasium / Oval & Engineering Labs',
        staffPin: '2026',
        sessions: DEFAULT_ENGDAY_SESSIONS,
        groups: DEFAULT_ENGDAY_GROUPS,
        students: engdayState.students,
        updatedAt: engdayState.lastUpdated || new Date().toISOString()
      }
    };
  }
  const defaultEvt = engdayState.eventsCatalog.engday_2026;
  if (defaultEvt) {
    defaultEvt.schemaVersion = SCHEMA_VERSION;
    defaultEvt.rosterVersion = ROSTER_VERSION;
    if (!Array.isArray(defaultEvt.groups) || defaultEvt.groups.length === 0) {
      defaultEvt.groups = DEFAULT_ENGDAY_GROUPS.map(g => ({ ...g }));
    } else {
      defaultEvt.groups.forEach(g => {
        if (String(g.id).toLowerCase() === 'ee' && (g.color === 'zinc' || g.hex === '#27272a' || g.color === 'amber')) {
          g.color = 'orange';
          g.hex = '#f97316';
        }
      });
    }
    delete defaultEvt.students['custom_stu_999'];
    delete defaultEvt.students['2026-CPE-999'];
    ensureFullMasterRoster(defaultEvt.students, defaultEvt.sessions?.map(s => s.id) || ENGDAY_GAMES_LIST);
  }
  engdayState.schemaVersion = SCHEMA_VERSION;
  engdayState.rosterVersion = ROSTER_VERSION;
  try { atomicWriteJson(ENGDAY_STATE_FILE, engdayState); } catch(e) {}
}

function getActiveSessionIdsForEvent(eventKey = 'engday_2026') {
  const evt = engdayState.eventsCatalog && engdayState.eventsCatalog[eventKey];
  if (evt && Array.isArray(evt.sessions) && evt.sessions.length > 0) {
    return evt.sessions.map(s => s.id).filter(Boolean);
  }
  return ENGDAY_GAMES_LIST.slice();
}

function rederiveEngDayStudentState(student, studentEvents, sessionIds = ENGDAY_GAMES_LIST) {
  const sorted = studentEvents.slice().sort(compareEvents);
  const allGameKeys = new Set([
    ...sessionIds,
    ...Object.keys(student.games || {}),
    ...sorted.map(e => e.gameId).filter(Boolean)
  ]);

  const updated = {
    ...student,
    games: {}
  };
  allGameKeys.forEach(g => {
    updated.games[g] = {
      gameId: g,
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

  for (const ev of sorted) {
    const gId = ev.gameId;
    if (!gId) continue;
    if (!updated.games[gId]) {
      updated.games[gId] = {
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
    const gRecord = updated.games[gId];
    const action = String(ev.action || '').toLowerCase();
    const timeStr = formatManilaTime(ev.occurredAt);

    if (action === 'check_in') {
      gRecord.status = 'INSIDE';
      gRecord.lastAction = 'check_in';
      gRecord.checkInTime = ev.occurredAt;
      gRecord.displayCheckIn = timeStr;
      gRecord.visits = (gRecord.visits || 0) + 1;
      gRecord.history.push({
        eventId: ev.eventId,
        action: 'check_in',
        timestamp: ev.occurredAt,
        displayTime: timeStr,
        performedBy: ev.marshalId,
        court: ev.court,
        deviceId: ev.deviceId
      });
    } else if (action === 'check_out') {
      gRecord.status = 'OUTSIDE';
      gRecord.lastAction = 'check_out';
      gRecord.checkOutTime = ev.occurredAt;
      gRecord.displayCheckOut = timeStr;
      gRecord.history.push({
        eventId: ev.eventId,
        action: 'check_out',
        timestamp: ev.occurredAt,
        displayTime: timeStr,
        performedBy: ev.marshalId,
        court: ev.court,
        deviceId: ev.deviceId,
        reason: ev.reason
      });
    } else if (action === 'manual_override') {
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
      gRecord.history.push({
        eventId: ev.eventId,
        action: 'manual_override',
        timestamp: ev.occurredAt,
        displayTime: timeStr,
        performedBy: ev.marshalId,
        reason: ev.reason
      });
    }
  }

  return updated;
}

function calculateEngDayStats(eventKey = null) {
  const targetKey = eventKey || engdayState.activeEventId || 'engday_2026';
  const evtObj = engdayState.eventsCatalog && engdayState.eventsCatalog[targetKey];
  const studentsMap = (evtObj && evtObj.students) ? evtObj.students : (engdayState.students || {});
  const students = Object.values(studentsMap);
  const totalStudents = students.length;
  const sessionIds = getActiveSessionIdsForEvent(targetKey);
  const gameStats = {};
  sessionIds.forEach(g => {
    gameStats[g] = {
      totalCheckIns: 0,
      insideCount: 0,
      outsideCount: 0,
      byTeam: {
        ie: { inside: 0, total: 0 },
        me: { inside: 0, total: 0 },
        ce: { inside: 0, total: 0 },
        ee: { inside: 0, total: 0 },
        ece: { inside: 0, total: 0 },
        cpe: { inside: 0, total: 0 },
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
    sessionIds.forEach(g => {
      const gr = s.games && s.games[g];
      const st = gameStats[g];
      if (!st) return;
      const teamKey = String(s.team || 'general').toLowerCase();
      if (!st.byTeam[teamKey]) st.byTeam[teamKey] = { inside: 0, total: 0 };
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

  return { totalStudents, totalUniqueAttendees, gameStats };
}

// ---------------------------------------------------------------------------
// SERVER-SIDE MERGED BACKUP & ATTENDANCE REPORT GENERATOR
// Merges all cumulative events from all devices into an authoritative dataset
// ---------------------------------------------------------------------------
function generateEngDayBackupJSON(eventKey = 'engday_2026') {
  const targetKey = eventKey || engdayState.activeEventId || 'engday_2026';
  const evtObj = (engdayState.eventsCatalog && engdayState.eventsCatalog[targetKey]) || {
    id: targetKey,
    title: targetKey === 'engday_2026' ? 'ENGINEERING DAYS 2026' : targetKey,
    sessions: DEFAULT_ENGDAY_SESSIONS,
    groups: DEFAULT_ENGDAY_GROUPS,
    students: engdayState.students || {}
  };

  const sessionIds = getActiveSessionIdsForEvent(targetKey);
  const studentsMap = (evtObj && evtObj.students) ? evtObj.students : (engdayState.students || {});
  ensureFullMasterRoster(studentsMap, sessionIds);
  const allStudents = Object.values(studentsMap);

  const roster = allStudents.map(s => {
    const rawCode = String(s.code || s.studentCode || s.id || '').trim();
    return {
      id: s.id || rawCode,
      code: rawCode,
      name: s.name || '',
      team: s.team || s.group || 'general'
    };
  });

  const sessions = (evtObj.sessions || DEFAULT_ENGDAY_SESSIONS).map(g => ({
    id: g.id,
    shortLabel: g.shortName || g.shortLabel || g.name || g.id,
    label: g.name || g.label || g.shortName || g.id,
    timeSlot: g.timeSlot || g.time || '',
    location: g.location || g.court || g.venue || '',
    day: g.day || (String(g.id).startsWith('d2') ? 'Day 2' : 'Day 1'),
    category: g.category || (String(g.id).startsWith('d2') ? 'Day 2 (Oct 20)' : 'Day 1 (Oct 19)'),
    mode: g.mode === 'check_in_only' ? 'check_in_only' : 'entry_exit',
    icon: g.icon || '📋',
    minMinutesRequired: typeof g.minMinutesRequired === 'number' ? g.minMinutesRequired : (g.mode === 'check_in_only' ? 0 : 45)
  }));

  const groups = (evtObj.groups || DEFAULT_ENGDAY_GROUPS).map(g => {
    const gid = String(g.id).toLowerCase();
    if (gid === 'ee') {
      return { id: 'ee', name: g.name || 'EE (Electrical Engineering)', shortCode: 'EE', color: 'orange', hex: '#f97316' };
    }
    return { ...g };
  });

  const attendance = {};
  allStudents.forEach(s => {
    const rawCode = String(s.code || s.studentCode || s.id || '').trim();
    if (!rawCode) return;
    let totalVerifiedSessions = 0;
    let totalDwellMinutes = 0;
    const sessionsMap = {};

    sessions.forEach(g => {
      const gr = (s.games && s.games[g.id]) || {};
      let status = 'ABSENT';
      let dwellMins = 0;

      if (gr.checkInTime && gr.checkOutTime) {
        dwellMins = Math.max(0, Math.round((new Date(gr.checkOutTime) - new Date(gr.checkInTime)) / 60000));
      } else if (gr.checkInTime && gr.status === 'INSIDE') {
        dwellMins = Math.max(0, Math.round((Date.now() - new Date(gr.checkInTime)) / 60000));
      }

      totalDwellMinutes += dwellMins;
      const minReq = g.minMinutesRequired || 0;
      if (gr.status === 'INSIDE') {
        status = 'INSIDE';
      } else if (gr.visits > 0) {
        if (g.mode === 'check_in_only' || dwellMins >= minReq) {
          status = 'VERIFIED';
        } else {
          status = 'UNDER_TIME';
        }
      }

      if (status === 'VERIFIED') totalVerifiedSessions++;

      sessionsMap[g.id] = {
        status,
        visits: gr.visits || 0,
        dwellMinutes: dwellMins,
        checkInTime: gr.checkInTime || null,
        checkOutTime: gr.checkOutTime || null,
        displayCheckIn: gr.displayCheckIn || null,
        displayCheckOut: gr.displayCheckOut || null,
        history: (gr.history || []).map(h => ({
          eventId: h.eventId,
          action: h.action,
          timestamp: h.timestamp,
          performedBy: h.performedBy,
          court: h.court,
          reason: h.reason
        }))
      };
    });

    attendance[rawCode] = {
      studentSummary: {
        code: rawCode,
        name: s.name || '',
        team: s.team || s.group || 'general',
        totalVerifiedSessions,
        totalDwellMinutes
      },
      ...sessionsMap
    };
  });

  const scanLogs = engdayEvents
    .filter(e => (e.eventKey || 'engday_2026') === targetKey)
    .map(l => ({
      eventId: l.eventId,
      code: l.studentCode || l.studentId,
      name: l.studentName || l.name || '',
      team: l.team,
      gameId: l.gameId,
      action: l.action || 'check_in',
      time: l.occurredAt || l.time,
      by: l.marshalId || l.performedBy || 'Marshal',
      court: l.court || 'Main Venue',
      notes: l.reason || null
    }))
    .sort((a, b) => new Date(a.time || 0) - new Date(b.time || 0));

  return {
    format: 'engday_full_v3',
    version: 3,
    exportedAt: new Date().toISOString(),
    deviceId: 'server-master',
    activeEventId: targetKey,
    eventConfig: {
      id: targetKey,
      title: evtObj.title || 'ENGINEERING DAYS 2026',
      subtitle: evtObj.subtitle || '',
      venueName: evtObj.venueName || 'Gymnasium / Oval & Engineering Labs',
      staffPin: evtObj.staffPin || '2026',
      sessions,
      groups
    },
    roster,
    attendance,
    scanLogs
  };
}

function generateEngDayReportCSV(eventKey = 'engday_2026') {
  const targetKey = eventKey || engdayState.activeEventId || 'engday_2026';
  const evtObj = (engdayState.eventsCatalog && engdayState.eventsCatalog[targetKey]) || {};
  const sessionIds = getActiveSessionIdsForEvent(targetKey);
  const studentsMap = (evtObj && evtObj.students) ? evtObj.students : (engdayState.students || {});
  ensureFullMasterRoster(studentsMap, sessionIds);
  const students = Object.values(studentsMap);

  const deptOrder = { CE: 1, CPE: 2, EE: 3, ECE: 4, IE: 5, ME: 6 };
  students.sort((a, b) => {
    const teamA = String(a.team || '').toUpperCase();
    const teamB = String(b.team || '').toUpperCase();
    const orderA = deptOrder[teamA] || 99;
    const orderB = deptOrder[teamB] || 99;
    if (orderA !== orderB) return orderA - orderB;
    const codeA = String(a.studentCode || a.code || a.id || '').toUpperCase();
    const codeB = String(b.studentCode || b.code || b.id || '').toUpperCase();
    return codeA.localeCompare(codeB, undefined, { numeric: true });
  });

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    return `"${String(val).replace(/"/g, '""')}"`;
  };

  const sessions = (evtObj.sessions && evtObj.sessions.length > 0) ? evtObj.sessions : DEFAULT_ENGDAY_SESSIONS;
  const headerCols = ['Student ID', 'Full Name', 'Department/Group'];
  sessions.forEach(g => {
    const cleanLabel = String(g.shortName || g.name || g.id).replace(/"/g, '""');
    headerCols.push(`${cleanLabel} Status`);
  });
  headerCols.push('Total Minutes Inside');

  let csv = headerCols.map(escapeCsv).join(',') + '\r\n';

  students.forEach(s => {
    const studentId = s.studentCode || s.code || s.id || '';
    const fullName = s.name || '';
    const deptGroup = (s.team || '').toUpperCase();

    const rowCols = [
      escapeCsv(studentId),
      escapeCsv(fullName),
      escapeCsv(deptGroup)
    ];

    let totalMinutesInside = 0;

    sessions.forEach(g => {
      const gr = (s.games && s.games[g.id]) || {};
      let dwellMins = 0;
      if (gr.checkInTime && gr.checkOutTime) {
        dwellMins = Math.max(0, Math.round((new Date(gr.checkOutTime) - new Date(gr.checkInTime)) / 60000));
      } else if (gr.checkInTime && gr.status === 'INSIDE') {
        dwellMins = Math.max(0, Math.round((Date.now() - new Date(gr.checkInTime)) / 60000));
      }
      totalMinutesInside += dwellMins;

      let status = 'ABSENT';
      const minReq = g.mode === 'check_in_only' ? 0 : 45;
      if (gr.status === 'INSIDE') {
        status = 'INSIDE';
      } else if (gr.visits > 0) {
        if (g.mode === 'check_in_only' || dwellMins >= minReq) {
          status = 'VERIFIED';
        } else {
          status = 'UNDER_TIME';
        }
      }

      rowCols.push(escapeCsv(status));
    });

    rowCols.push(totalMinutesInside);
    csv += rowCols.join(',') + '\r\n';
  });

  return csv;
}

// -------------------------------------------------------------------------
// SERVER 20-MINUTE SCHEDULED BACKUP SNAPSHOT ENGINE
// -------------------------------------------------------------------------
let serverNewEventsSinceBackup = 0;

function performServer20MinuteBackup() {
  try {
    if (serverNewEventsSinceBackup === 0 && engdayEvents.length === 0) return;
    const activeKey = engdayState.activeEventId || 'engday_2026';
    const backupData = generateEngDayBackupJSON(activeKey);
    const backupDir = path.join(__dirname, 'data', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const backupFile = path.join(backupDir, 'engday_backup_latest.json');
    atomicWriteJson(backupFile, backupData);
    serverNewEventsSinceBackup = 0;
    console.log(`[EngDay Server] 20-minute scheduled backup snapshot saved for ${activeKey}`);
  } catch (err) {
    console.warn('[EngDay Server] 20-minute scheduled backup failed:', err);
  }
}

if (!IS_VERCEL) {
  setInterval(performServer20MinuteBackup, 20 * 60 * 1000);
}

// Deterministic event ordering comparator
function compareEvents(a, b) {
  const timeA = new Date(a.occurredAt || 0).getTime();
  const timeB = new Date(b.occurredAt || 0).getTime();
  if (timeA !== timeB) return timeA - timeB;

  if (a.deviceId && a.deviceId === b.deviceId && typeof a.localSequence === 'number' && typeof b.localSequence === 'number') {
    return a.localSequence - b.localSequence;
  }

  const createdA = new Date(a.createdAt || a.occurredAt || 0).getTime();
  const createdB = new Date(b.createdAt || b.occurredAt || 0).getTime();
  if (createdA !== createdB) return createdA - createdB;

  return String(a.eventId || '').localeCompare(String(b.eventId || ''));
}

// Deterministic student status derivation from events
function rederiveStudentState(student, studentEvents) {
  const sorted = studentEvents.slice().sort(compareEvents);
  const updated = {
    ...student,
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

  let currentCheckInTime = null;

  for (const ev of sorted) {
    const action = String(ev.action || '').toLowerCase();
    const timeStr = formatManilaTime(ev.occurredAt);

    if (action === 'check_in') {
      updated.status = 'INSIDE';
      updated.lastCheckIn = ev.occurredAt;
      updated.exitReason = null;
      updated.expectedReturn = null;
      updated.totalVisits = (updated.totalVisits || 0) + 1;
      currentCheckInTime = new Date(ev.occurredAt);

      updated.history.push({
        eventId: ev.eventId,
        action: 'check_in',
        timestamp: ev.occurredAt,
        displayTime: timeStr,
        method: ev.method || 'qr_scan',
        performedBy: ev.marshalId || 'Marshal',
        deviceId: ev.deviceId
      });
    } else if (action === 'check_out') {
      updated.status = 'OUTSIDE';
      updated.lastCheckOut = ev.occurredAt;
      updated.exitReason = ev.reason || 'Not specified';
      updated.expectedReturn = ev.expectedReturn || null;

      if (currentCheckInTime) {
        const diffMs = new Date(ev.occurredAt) - currentCheckInTime;
        const mins = Math.max(1, Math.round(diffMs / 60000));
        updated.totalMinutesInside = (updated.totalMinutesInside || 0) + mins;
        currentCheckInTime = null;
      }

      updated.history.push({
        eventId: ev.eventId,
        action: 'check_out',
        timestamp: ev.occurredAt,
        displayTime: timeStr,
        reason: ev.reason,
        expectedReturn: ev.expectedReturn,
        method: ev.method || 'qr_scan',
        performedBy: ev.marshalId || 'Marshal',
        deviceId: ev.deviceId
      });
    } else if (action === 'manual_override') {
      const target = (ev.newStatus || ev.status || 'INSIDE').toUpperCase();
      updated.status = target;
      if (target === 'INSIDE') {
        updated.lastCheckIn = ev.occurredAt;
        updated.exitReason = null;
        updated.expectedReturn = null;
      } else {
        updated.lastCheckOut = ev.occurredAt;
        updated.exitReason = ev.reason || 'Manual override';
      }
      updated.history.push({
        eventId: ev.eventId,
        action: 'manual_override',
        status: target,
        timestamp: ev.occurredAt,
        displayTime: timeStr,
        method: 'manual',
        performedBy: ev.marshalId || 'Admin',
        deviceId: ev.deviceId
      });
    }

    updated.lastEventId = ev.eventId;
    updated.lastAction = action;
    updated.currentAction = action;
    updated.lastOccurredAt = ev.occurredAt;
  }

  updated.updatedAt = new Date().toISOString();
  return updated;
}

// Compute live metrics
function calculateAttendanceStats() {
  const all = Object.values(attendanceState.students || {});
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

  const now = new Date();

  all.forEach(s => {
    const t = byTeam[s.team] || byTeam['rankine'];
    t.total++;

    let isOver = false;
    if (s.status === 'OUTSIDE' && s.expectedReturn) {
      if (/^\d{1,2}:\d{2}$/.test(s.expectedReturn)) {
        const [h, m] = s.expectedReturn.split(':').map(Number);
        const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
        isOver = now > target;
      } else {
        const parsed = new Date(s.expectedReturn);
        if (!isNaN(parsed.getTime())) isOver = now > parsed;
      }
    }

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

  return { total, inside, outside, overdue, byTeam };
}

// Helper: send JSON with CORS & optional extra headers
function sendJson(res, statusCode, data, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, If-None-Match',
    ...extraHeaders
  });
  res.end(JSON.stringify(data));
}

// Helper: get primary LAN IPv4 address for instant mobile pairing
function getPrimaryLanIp() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('169.254.')) {
          return iface.address;
        }
      }
    }
  } catch (e) {}
  return 'localhost';
}

// Live Real-Time SSE clients pool for instant sub-50ms dashboard updates
const engdaySseClients = new Set();

function broadcastEngDayUpdate() {
  if (engdaySseClients.size === 0) return;
  const activeKey = engdayState.activeEventId || 'engday_2026';
  const activeEventsCount = engdayEvents.filter(e => (e.eventKey || 'engday_2026') === activeKey).length;
  const stateWithMeta = {
    ...engdayState,
    schemaVersion: SCHEMA_VERSION,
    eventsCount: activeEventsCount
  };
  const payload = `data: ${JSON.stringify({ type: 'state_update', state: stateWithMeta, stats: calculateEngDayStats() })}\n\n`;
  for (const client of engdaySseClients) {
    try {
      client.write(payload);
    } catch (e) {
      engdaySseClients.delete(client);
    }
  }
}

// Helper: read request body
function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try { return Promise.resolve(JSON.parse(req.body)); } catch (e) {}
  }
  if (req.readableEnded || req.complete) {
    return Promise.resolve(req.body || {});
  }
  return new Promise((resolve, reject) => {
    let body = '';
    const timer = setTimeout(() => {
      try {
        resolve(body ? JSON.parse(body) : (req.body || {}));
      } catch (e) {
        resolve(req.body || {});
      }
    }, 4000);
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) { // 10MB limit
        clearTimeout(timer);
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      clearTimeout(timer);
      try {
        resolve(body ? JSON.parse(body) : (req.body || {}));
      } catch (err) {
        reject(new Error('Invalid JSON format: ' + err.message));
      }
    });
    req.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

// -------------------------------------------------------------------------
// HTTP SERVER & ROUTING
// -------------------------------------------------------------------------
export async function handleRequest(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  const [reqPath, queryString] = req.url.split('?');
  const urlParams = new URLSearchParams(queryString || '');

  // -----------------------------------------------------------------------
  // ATTENDANCE API ENDPOINTS
  // -----------------------------------------------------------------------
  if (reqPath === '/api/attendance/health' && req.method === 'GET') {
    return sendJson(res, 200, {
      ok: true,
      serverTime: new Date().toISOString(),
      eventsCount: attendanceEvents.length,
      totalStudents: Object.keys(attendanceState.students || {}).length
    });
  }

  if (reqPath === '/api/attendance/state' && req.method === 'GET') {
    if (attendanceState && attendanceState.students) {
      ensureFullMasterRoster(attendanceState.students);
    }
    const currentVersion = attendanceState.version || 1;
    const stateEtag = `W/"att-${currentVersion}-${attendanceEvents.length}"`;

    if (req.headers && req.headers['if-none-match'] === stateEtag) {
      res.writeHead(304, {
        'ETag': stateEtag,
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=1200',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end();
    }

    return sendJson(res, 200, {
      ok: true,
      serverTime: new Date().toISOString(),
      students: attendanceState.students,
      stats: calculateAttendanceStats(),
      version: currentVersion,
      lastUpdated: attendanceState.lastUpdated
    }, {
      'ETag': stateEtag,
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=1200'
    });
  }

  if (reqPath === '/api/attendance/events' && req.method === 'GET') {
    const since = urlParams.get('since');
    let results = attendanceEvents;
    if (since) {
      const sinceDate = new Date(since).getTime();
      if (!isNaN(sinceDate)) {
        results = attendanceEvents.filter(e => new Date(e.occurredAt || 0).getTime() > sinceDate);
      }
    }
    const limit = parseInt(urlParams.get('limit') || '500', 10);
    if (results.length > limit) {
      results = results.slice(-limit);
    }
    return sendJson(res, 200, {
      ok: true,
      events: results,
      total: attendanceEvents.length,
      serverTime: new Date().toISOString()
    });
  }

  if (reqPath === '/api/attendance/sync' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const incoming = Array.isArray(payload.events) ? payload.events : [];
      const deviceId = payload.deviceId || 'UNKNOWN_DEVICE';

      const accepted = [];
      const duplicate = [];
      const rejected = [];
      const affectedStudentIds = new Set();

      for (const ev of incoming) {
        if (!ev || typeof ev !== 'object') {
          rejected.push({ eventId: ev?.eventId || 'unknown', reason: 'Invalid event object' });
          continue;
        }

        const eventId = String(ev.eventId || '').trim();
        const studentId = String(ev.studentId || '').trim();
        const action = String(ev.action || '').trim().toLowerCase();

        // Validation
        if (!eventId) {
          rejected.push({ eventId: 'missing', reason: 'Missing eventId' });
          continue;
        }
        if (!studentId || !attendanceState.students[studentId]) {
          rejected.push({ eventId, reason: `Unknown studentId: ${studentId}` });
          continue;
        }
        if (!['check_in', 'check_out', 'manual_override'].includes(action)) {
          rejected.push({ eventId, reason: `Invalid action: ${action}` });
          continue;
        }
        if (!ev.occurredAt || isNaN(new Date(ev.occurredAt).getTime())) {
          rejected.push({ eventId, reason: 'Invalid or missing occurredAt ISO timestamp' });
          continue;
        }

        // Idempotency check
        if (attendanceEventsMap.has(eventId)) {
          duplicate.push(eventId);
          continue;
        }

        // Valid new event
        const normalized = {
          eventId: eventId,
          studentId: studentId,
          action: action,
          occurredAt: new Date(ev.occurredAt).toISOString(),
          deviceId: String(ev.deviceId || deviceId),
          marshalId: String(ev.marshalId || 'Marshal'),
          gateId: String(ev.gateId || 'Main Gate'),
          sessionId: String(ev.sessionId || 'session_default'),
          localSequence: typeof ev.localSequence === 'number' ? ev.localSequence : 0,
          createdAt: ev.createdAt ? new Date(ev.createdAt).toISOString() : new Date().toISOString(),
          reason: ev.reason || null,
          expectedReturn: ev.expectedReturn || null,
          method: ev.method || 'qr_scan',
          studentName: attendanceState.students[studentId].name,
          studentCode: attendanceState.students[studentId].studentCode,
          team: attendanceState.students[studentId].team
        };

        attendanceEvents.push(normalized);
        attendanceEventsMap.set(eventId, normalized);
        accepted.push(eventId);
        affectedStudentIds.add(studentId);
      }

      // If any events accepted, rederive state for affected students & persist
      if (accepted.length > 0) {
        // Group all events by student for affected students
        affectedStudentIds.forEach(stId => {
          const studentAllEvents = attendanceEvents.filter(e => e.studentId === stId);
          attendanceState.students[stId] = rederiveStudentState(attendanceState.students[stId], studentAllEvents);
        });

        attendanceState.version = (attendanceState.version || 1) + 1;
        attendanceState.lastUpdated = new Date().toISOString();

        // Atomic file writes
        atomicWriteJson(EVENTS_FILE, attendanceEvents);
        atomicWriteJson(STATE_FILE, attendanceState);
      }

      return sendJson(res, 200, {
        ok: true,
        accepted,
        duplicate,
        rejected,
        serverTime: new Date().toISOString(),
        stats: calculateAttendanceStats()
      });
    } catch (err) {
      console.error('[Server Sync Error]:', err);
      return sendJson(res, 500, { ok: false, error: err.message });
    }
  }

  if (reqPath === '/api/attendance/reset' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);

      // A. Reset Individual Student Attendance
      if (payload.studentId) {
        const studentId = String(payload.studentId).trim();
        if (attendanceState.students[studentId]) {
          attendanceEvents = attendanceEvents.filter(e => e.studentId !== studentId);
          attendanceEventsMap.forEach((v, k) => {
            if (v.studentId === studentId) attendanceEventsMap.delete(k);
          });
          const defaultStudents = buildDefaultStudentsRoster();
          if (defaultStudents[studentId]) {
            attendanceState.students[studentId] = defaultStudents[studentId];
          }
          attendanceState.version = (attendanceState.version || 1) + 1;
          attendanceState.lastUpdated = new Date().toISOString();

          atomicWriteJson(EVENTS_FILE, attendanceEvents);
          atomicWriteJson(STATE_FILE, attendanceState);

          return sendJson(res, 200, {
            ok: true,
            message: `Attendance cleared for ${studentId}`,
            serverTime: new Date().toISOString(),
            stats: calculateAttendanceStats()
          });
        }
      }

      // B. Delete Specific Scan Event
      if (payload.eventId) {
        const eventId = String(payload.eventId).trim();
        const targetEvent = attendanceEventsMap.get(eventId);
        if (targetEvent) {
          attendanceEvents = attendanceEvents.filter(e => e.eventId !== eventId);
          attendanceEventsMap.delete(eventId);

          const stId = targetEvent.studentId;
          const studentAllEvents = attendanceEvents.filter(e => e.studentId === stId);
          const defaultStudent = buildDefaultStudentsRoster()[stId];
          attendanceState.students[stId] = rederiveStudentState(defaultStudent, studentAllEvents);
          attendanceState.version = (attendanceState.version || 1) + 1;
          attendanceState.lastUpdated = new Date().toISOString();

          atomicWriteJson(EVENTS_FILE, attendanceEvents);
          atomicWriteJson(STATE_FILE, attendanceState);

          return sendJson(res, 200, {
            ok: true,
            message: `Event ${eventId} deleted`,
            serverTime: new Date().toISOString(),
            stats: calculateAttendanceStats()
          });
        }
      }

      // C. Reset All Attendance
      if (payload.confirmation !== 'RESET_ATTENDANCE') {
        return sendJson(res, 400, { ok: false, error: 'Confirmation required: RESET_ATTENDANCE' });
      }

      attendanceEvents = [];
      attendanceEventsMap.clear();
      attendanceState.students = buildDefaultStudentsRoster();
      attendanceState.version = (attendanceState.version || 1) + 1;
      attendanceState.lastUpdated = new Date().toISOString();

      atomicWriteJson(EVENTS_FILE, attendanceEvents);
      atomicWriteJson(STATE_FILE, attendanceState);

      return sendJson(res, 200, {
        ok: true,
        message: 'Attendance reset successful',
        serverTime: new Date().toISOString(),
        stats: calculateAttendanceStats()
      });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: err.message });
    }
  }

  // -----------------------------------------------------------------------
  // ENGINEERING DAY 2026 ATTENDANCE API ENDPOINTS
  // -----------------------------------------------------------------------
  if (reqPath === '/api/engday/attendance/health' && req.method === 'GET') {
    const primaryIp = getPrimaryLanIp();
    const activeKey = engdayState.activeEventId || 'engday_2026';
    return sendJson(res, 200, {
      ok: true,
      serverTime: new Date().toISOString(),
      activeEventId: activeKey,
      eventsCount: engdayEvents.length,
      totalStudents: Object.keys(engdayState.students || {}).length,
      games: getActiveSessionIdsForEvent(activeKey),
      lanIp: primaryIp,
      lanPort: PORT,
      lanScannerUrl: `http://${primaryIp}:${PORT}/engday_scanner.html`,
      lanDashboardUrl: `http://${primaryIp}:${PORT}/engday_attendance.html`,
      liveSubscribers: engdaySseClients.size
    });
  }

  // Real-Time Server-Sent Events (SSE) Stream for Instant Live Sync (< 50ms)
  if (reqPath === '/api/engday/attendance/stream' && req.method === 'GET') {
    const activeKey = engdayState.activeEventId || 'engday_2026';
    const activeEventsCount = engdayEvents.filter(e => (e.eventKey || 'engday_2026') === activeKey).length;
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(`data: ${JSON.stringify({
      type: 'init',
      state: { ...engdayState, schemaVersion: SCHEMA_VERSION, eventsCount: activeEventsCount },
      stats: calculateEngDayStats()
    })}\n\n`);
    engdaySseClients.add(res);
    req.on('close', () => {
      engdaySseClients.delete(res);
    });
    return;
  }

  if (reqPath === '/api/engday/attendance/state' && req.method === 'GET') {
    const reqEventKey = urlParams.get('eventKey') || engdayState.activeEventId || 'engday_2026';
    const evtObj = engdayState.eventsCatalog && engdayState.eventsCatalog[reqEventKey];

    // Force-merge all 588 students on every state fetch
    ensureFullMasterRoster(engdayState.students, ENGDAY_GAMES_LIST);
    if (evtObj && evtObj.students) {
      ensureFullMasterRoster(evtObj.students, evtObj.sessions?.map(s => s.id) || ENGDAY_GAMES_LIST);
    }
    const studentsMap = (evtObj && evtObj.students) ? evtObj.students : engdayState.students;
    const activeEventsCount = engdayEvents.filter(e => (e.eventKey || 'engday_2026') === reqEventKey).length;

    // Bandwidth-Saver: Compute ETag and check If-None-Match for 304 Not Modified
    const currentVersion = engdayState.version || 1;
    const hardResetSeq = (evtObj && evtObj.hardResetSequence) || engdayState.hardResetSequence || 0;
    const resetSeq = (evtObj && evtObj.resetSequence) || engdayState.resetSequence || 0;
    const purgeTime = (evtObj && evtObj.lastPurgeTimestamp) || engdayState.lastPurgeTimestamp || '';
    const stateEtag = `W/"ed-${reqEventKey}-${currentVersion}-${activeEventsCount}-${hardResetSeq}-${resetSeq}-${purgeTime}"`;

    if (req.headers && req.headers['if-none-match'] === stateEtag) {
      res.writeHead(304, {
        'ETag': stateEtag,
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=1200',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end();
    }

    return sendJson(res, 200, {
      ok: true,
      serverTime: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
      rosterVersion: ROSTER_VERSION,
      activeEventId: engdayState.activeEventId || 'engday_2026',
      eventsCatalog: engdayState.eventsCatalog || {},
      students: studentsMap,
      stats: calculateEngDayStats(reqEventKey),
      eventsCount: activeEventsCount,
      totalEventsCount: engdayEvents.length,
      lastHardResetTimestamp: (evtObj && evtObj.lastHardResetTimestamp) || engdayState.lastHardResetTimestamp || null,
      hardResetSequence: (evtObj && evtObj.hardResetSequence) || engdayState.hardResetSequence || 0,
      lastResetTimestamp: (evtObj && evtObj.lastResetTimestamp) || engdayState.lastResetTimestamp || null,
      resetSequence: (evtObj && evtObj.resetSequence) || engdayState.resetSequence || 0,
      lastPurgeTimestamp: (evtObj && evtObj.lastPurgeTimestamp) || engdayState.lastPurgeTimestamp || null,
      version: currentVersion,
      lastUpdated: engdayState.lastUpdated
    }, {
      'ETag': stateEtag,
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=1200'
    });
  }

  // ---------------------------------------------------------------------------
  // SERVER-SIDE MERGED BACKUP & ATTENDANCE REPORT DOWNLOAD (MULTI-DEVICE SAFE)
  // Queries server's complete master database rather than single device state
  // ---------------------------------------------------------------------------
  if (reqPath === '/api/engday/attendance/backup' && req.method === 'GET') {
    const reqEventKey = urlParams.get('eventKey') || engdayState.activeEventId || 'engday_2026';
    const format = (urlParams.get('format') || 'json').toLowerCase();

    if (format === 'csv') {
      const csvData = generateEngDayReportCSV(reqEventKey);
      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${reqEventKey}_Attendance_Report.csv"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Cache-Control': 'no-cache'
      });
      return res.end(csvData);
    }

    const jsonData = generateEngDayBackupJSON(reqEventKey);
    return sendJson(res, 200, jsonData, {
      'Cache-Control': 'no-cache'
    });
  }

  if (reqPath === '/api/engday/attendance/config' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      if (!engdayState.eventsCatalog) engdayState.eventsCatalog = {};

      if (payload.event && payload.event.id) {
        const evtId = String(payload.event.id).trim();
        const existingEvt = engdayState.eventsCatalog[evtId] || {};
        const mergedStudents = {
          ...(existingEvt.students || {}),
          ...(payload.event.students || {})
        };

        // Re-derive student states from server event history for this eventKey while preserving any richer incoming client state
        const sessionIds = Array.isArray(payload.event.sessions) && payload.event.sessions.length > 0
          ? payload.event.sessions.map(s => s.id)
          : getActiveSessionIdsForEvent(evtId);

        if (payload.event.lastHardResetTimestamp) {
          const hardResetTime = new Date(payload.event.lastHardResetTimestamp).getTime();
          engdayEvents = engdayEvents.filter(e => {
            if ((e.eventKey || 'engday_2026') !== evtId) return true;
            return new Date(e.occurredAt || e.time || e.createdAt || 0).getTime() > hardResetTime;
          });
          engdayEventsMap.clear();
          engdayEvents.forEach(ev => {
            if (ev && ev.eventId) engdayEventsMap.set(ev.eventId, ev);
          });
          existingEvt.lastHardResetTimestamp = payload.event.lastHardResetTimestamp;
          existingEvt.hardResetSequence = payload.event.hardResetSequence || (existingEvt.hardResetSequence || 0) + 1;
          engdayState.lastHardResetTimestamp = payload.event.lastHardResetTimestamp;
          engdayState.hardResetSequence = payload.event.hardResetSequence || (engdayState.hardResetSequence || 0) + 1;
        }

        if (payload.event.lastPurgeTimestamp) {
          const purgeTime = new Date(payload.event.lastPurgeTimestamp).getTime();
          engdayEvents = engdayEvents.filter(e => {
            if ((e.eventKey || 'engday_2026') !== evtId) return true;
            return new Date(e.occurredAt || e.time || e.createdAt || 0).getTime() >= purgeTime;
          });
          engdayEventsMap.clear();
          engdayEvents.forEach(ev => {
            if (ev && ev.eventId) engdayEventsMap.set(ev.eventId, ev);
          });
          existingEvt.lastPurgeTimestamp = payload.event.lastPurgeTimestamp;
          engdayState.lastPurgeTimestamp = payload.event.lastPurgeTimestamp;
        }


        for (const [stId, stObj] of Object.entries(mergedStudents)) {
          const stEvents = engdayEvents.filter(e => e.studentId === stId && (e.eventKey || 'engday_2026') === evtId);
          if (stEvents.length > 0) {
            mergedStudents[stId] = rederiveEngDayStudentState(stObj, stEvents, sessionIds);
          } else {
            ensureStudentsHaveSessions({ [stId]: stObj }, sessionIds);
          }
        }

        if (Array.isArray(payload.event.groups)) {
          payload.event.groups.forEach(g => {
            if (String(g.id).toLowerCase() === 'ee' && (g.color === 'zinc' || g.hex === '#27272a' || g.color === 'amber')) {
              g.color = 'orange';
              g.hex = '#f97316';
            }
          });
        }

        ensureFullMasterRoster(mergedStudents, sessionIds);

        engdayState.eventsCatalog[evtId] = {
          ...existingEvt,
          ...payload.event,
          schemaVersion: SCHEMA_VERSION,
          students: mergedStudents,
          updatedAt: new Date().toISOString()
        };
      }

      if (payload.activeEventId && engdayState.eventsCatalog[payload.activeEventId]) {
        engdayState.activeEventId = payload.activeEventId;
        engdayState.students = engdayState.eventsCatalog[payload.activeEventId].students || {};
      } else if (payload.event && payload.event.id === engdayState.activeEventId) {
        engdayState.students = engdayState.eventsCatalog[payload.event.id].students || {};
      }
      ensureFullMasterRoster(engdayState.students, ENGDAY_GAMES_LIST);

      engdayState.schemaVersion = SCHEMA_VERSION;
      engdayState.version = (engdayState.version || 1) + 1;
      engdayState.lastUpdated = new Date().toISOString();

      atomicWriteJson(ENGDAY_STATE_FILE, engdayState);
      broadcastEngDayUpdate();

      return sendJson(res, 200, {
        ok: true,
        schemaVersion: SCHEMA_VERSION,
        activeEventId: engdayState.activeEventId,
        version: engdayState.version,
        serverTime: new Date().toISOString()
      });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: err.message });
    }
  }

  if (reqPath === '/api/engday/attendance/events' && req.method === 'GET') {
    const gameId = urlParams.get('gameId');
    const eventKey = urlParams.get('eventKey');
    const since = urlParams.get('since');
    let results = engdayEvents;
    if (eventKey) {
      results = results.filter(e => (e.eventKey || 'engday_2026') === eventKey);
    }
    if (gameId) {
      results = results.filter(e => e.gameId === gameId);
    }
    if (since) {
      const sinceDate = new Date(since).getTime();
      if (!isNaN(sinceDate)) {
        results = results.filter(e => new Date(e.occurredAt || 0).getTime() > sinceDate);
      }
    }
    const limit = parseInt(urlParams.get('limit') || '500', 10);
    if (results.length > limit) {
      results = results.slice(-limit);
    }
    return sendJson(res, 200, {
      ok: true,
      events: results,
      total: engdayEvents.length,
      serverTime: new Date().toISOString()
    });
  }

  if (reqPath === '/api/engday/attendance/sync' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const incoming = Array.isArray(payload.events) ? payload.events : [];
      const deviceId = payload.deviceId || 'UNKNOWN_DEVICE';
      const reqActiveEventId = payload.activeEventId || engdayState.activeEventId || 'engday_2026';

      // 0. Support direct HARD RESET payload command pushed to /sync
      if (payload.action === 'HARD_RESET' || payload.hardReset === true) {
        const targetEventKey = reqActiveEventId || 'engday_2026';
        const nowIso = payload.lastHardResetTimestamp || payload.resetTimestamp || new Date().toISOString();

        const initialCount = engdayEvents.length;
        engdayEvents = engdayEvents.filter(e => (e.eventKey || 'engday_2026') !== targetEventKey);
        engdayEventsMap.clear();
        engdayEvents.forEach(ev => {
          if (ev && ev.eventId) engdayEventsMap.set(ev.eventId, ev);
        });

        engdayState.scanLogs = [];
        engdayState.auditLog = [];
        engdayState.attendance = {};

        const sessionIds = getActiveSessionIdsForEvent(targetEventKey);
        if (!engdayState.eventsCatalog) engdayState.eventsCatalog = {};
        if (!engdayState.eventsCatalog[targetEventKey]) {
          engdayState.eventsCatalog[targetEventKey] = {
            id: targetEventKey,
            title: targetEventKey === 'engday_2026' ? 'ENGINEERING DAYS 2026' : targetEventKey,
            students: buildDefaultEngDayRoster(sessionIds),
            sessions: DEFAULT_ENGDAY_SESSIONS,
            groups: DEFAULT_ENGDAY_GROUPS,
            updatedAt: nowIso
          };
        }
        const evtObj = engdayState.eventsCatalog[targetEventKey];
        if (!evtObj.students) evtObj.students = {};
        evtObj.scanLogs = [];
        evtObj.auditLog = [];
        evtObj.attendance = {};
        ensureFullMasterRoster(evtObj.students, sessionIds);
        ensureFullMasterRoster(engdayState.students, ENGDAY_GAMES_LIST);

        Object.keys(evtObj.students).forEach(stId => {
          evtObj.students[stId] = rederiveEngDayStudentState(evtObj.students[stId], [], sessionIds);
        });
        if (targetEventKey === (engdayState.activeEventId || 'engday_2026')) {
          Object.keys(engdayState.students).forEach(stId => {
            engdayState.students[stId] = rederiveEngDayStudentState(engdayState.students[stId], [], ENGDAY_GAMES_LIST);
          });
        }

        evtObj.lastHardResetTimestamp = nowIso;
        evtObj.hardResetSequence = (evtObj.hardResetSequence || 0) + 1;
        evtObj.lastResetTimestamp = nowIso;
        evtObj.resetSequence = (evtObj.resetSequence || 0) + 1;
        evtObj.updatedAt = nowIso;

        engdayState.lastHardResetTimestamp = nowIso;
        engdayState.hardResetSequence = (engdayState.hardResetSequence || 0) + 1;
        engdayState.lastResetTimestamp = nowIso;
        engdayState.resetSequence = (engdayState.resetSequence || 0) + 1;
        engdayState.version = (engdayState.version || 1) + 20;
        engdayState.lastUpdated = nowIso;

        atomicWriteJson(ENGDAY_EVENTS_FILE, engdayEvents);
        atomicWriteJson(ENGDAY_STATE_FILE, engdayState);
        broadcastEngDayUpdate();

        return sendJson(res, 200, {
          ok: true,
          action: 'HARD_RESET',
          message: `Server attendance hard wiped to zero for ${targetEventKey}`,
          serverTime: nowIso,
          lastHardResetTimestamp: nowIso,
          hardResetSequence: engdayState.hardResetSequence,
          version: engdayState.version,
          eventsCount: 0,
          studentsCount: Object.keys(evtObj.students).length,
          stats: calculateEngDayStats(targetEventKey)
        });
      }

      const accepted = [];
      const duplicate = [];
      const rejected = [];
      const affectedByEventAndStudent = new Map();

      for (const ev of incoming) {
        if (!ev || typeof ev !== 'object') {
          rejected.push({ eventId: ev?.eventId || 'unknown', reason: 'Invalid event object' });
          continue;
        }

        const eventId = String(ev.eventId || '').trim();
        const eventKey = String(ev.eventKey || reqActiveEventId || 'engday_2026').trim();
        const studentId = String(ev.studentId || '').trim();
        const gameId = String(ev.gameId || '').trim();
        const action = String(ev.action || '').trim().toLowerCase();

        if (!eventId) {
          rejected.push({ eventId: 'missing', reason: 'Missing eventId' });
          continue;
        }
        if (!gameId) {
          rejected.push({ eventId, reason: 'Missing gameId / sessionId' });
          continue;
        }
        if (!['check_in', 'check_out', 'manual_override'].includes(action)) {
          rejected.push({ eventId, reason: `Invalid action: ${action}` });
          continue;
        }
        if (!ev.occurredAt || isNaN(new Date(ev.occurredAt).getTime())) {
          rejected.push({ eventId, reason: 'Invalid or missing occurredAt ISO timestamp' });
          continue;
        }

        // Ensure event entry exists in eventsCatalog with complete 588-student roster
        if (!engdayState.eventsCatalog) engdayState.eventsCatalog = {};
        if (!engdayState.eventsCatalog[eventKey]) {
          engdayState.eventsCatalog[eventKey] = {
            id: eventKey,
            title: eventKey === 'engday_2026' ? 'ENGINEERING DAYS 2026' : eventKey,
            students: eventKey === 'engday_2026' ? (engdayState.students || buildDefaultEngDayRoster()) : buildDefaultEngDayRoster(),
            sessions: DEFAULT_ENGDAY_SESSIONS,
            groups: DEFAULT_ENGDAY_GROUPS,
            updatedAt: new Date().toISOString()
          };
        }
        const targetEvt = engdayState.eventsCatalog[eventKey];
        if (!targetEvt.students) targetEvt.students = {};
        ensureFullMasterRoster(targetEvt.students, getActiveSessionIdsForEvent(eventKey));
        ensureFullMasterRoster(engdayState.students, ENGDAY_GAMES_LIST);

        // Discard any incoming events that occurred prior to an intentional hard reset
        if (targetEvt.lastHardResetTimestamp) {
          const hardResetTime = new Date(targetEvt.lastHardResetTimestamp).getTime();
          const evTime = new Date(ev.occurredAt).getTime();
          if (evTime <= hardResetTime) {
            duplicate.push(eventId);
            continue;
          }
        }

        // Discard any incoming events that occurred prior to an intentional administrative reset
        if (targetEvt.lastResetTimestamp) {
          const resetTime = new Date(targetEvt.lastResetTimestamp).getTime();
          const evTime = new Date(ev.occurredAt).getTime();
          if (evTime < resetTime) {
            duplicate.push(eventId);
            continue;
          }
        }

        // Discard any incoming events timestamped before 4:00 AM today local time
        if (isTimestampBeforeToday4AMServer(ev.occurredAt || ev.time)) {
          duplicate.push(eventId);
          continue;
        }

        // Discard any incoming events that occurred prior to an attendance purge
        if (targetEvt.lastPurgeTimestamp) {
          const purgeTime = new Date(targetEvt.lastPurgeTimestamp).getTime();
          const evTime = new Date(ev.occurredAt).getTime();
          if (evTime < purgeTime) {
            duplicate.push(eventId);
            continue;
          }
        }


        let validStudentId = studentId;
        const lookupCode = String(studentId || ev.studentCode || '').trim().toUpperCase();
        if (targetEvt.students[lookupCode]) {
          validStudentId = lookupCode;
          ev.studentId = lookupCode;
        } else if (!validStudentId || !targetEvt.students[validStudentId]) {
          const match = Object.values(targetEvt.students).find(s =>
            (s.studentCode && s.studentCode.toUpperCase() === lookupCode) ||
            (s.code && s.code.toUpperCase() === lookupCode) ||
            (s.id && s.id.toUpperCase() === lookupCode)
          );
          if (match) {
            validStudentId = match.id;
            ev.studentId = match.id;
          } else if (studentId || ev.studentCode) {
            // Auto-register dynamically imported student so custom roster scans are never rejected!
            validStudentId = studentId || ('stu_' + String(ev.studentCode).toLowerCase().replace(/[^a-z0-9]+/g, '_'));
            targetEvt.students[validStudentId] = {
              id: validStudentId,
              name: ev.studentName || ev.studentCode || validStudentId,
              team: String(ev.team || 'general').toLowerCase(),
              teamName: ev.teamName || String(ev.team || 'GENERAL').toUpperCase(),
              studentCode: String(ev.studentCode || validStudentId).toUpperCase(),
              games: {}
            };
          } else {
            rejected.push({ eventId, reason: `Unknown studentId: ${studentId}` });
            continue;
          }
        }

        // Idempotency check
        if (engdayEventsMap.has(eventId)) {
          duplicate.push(eventId);
          continue;
        }

        const studentRef = targetEvt.students[validStudentId];
        const normalized = {
          eventId: eventId,
          eventKey: eventKey,
          gameId: gameId,
          studentId: validStudentId,
          action: action,
          occurredAt: new Date(ev.occurredAt).toISOString(),
          deviceId: String(ev.deviceId || deviceId),
          marshalId: String(ev.marshalId || 'Marshal'),
          court: String(ev.court || 'Court'),
          sessionId: String(ev.sessionId || 'engday_session'),
          localSequence: typeof ev.localSequence === 'number' ? ev.localSequence : 1,
          createdAt: ev.createdAt ? new Date(ev.createdAt).toISOString() : new Date().toISOString(),
          reason: ev.reason || null,
          method: ev.method || 'qr_scan',
          studentName: studentRef.name,
          studentCode: studentRef.studentCode,
          team: studentRef.team
        };

        engdayEvents.push(normalized);
        engdayEventsMap.set(eventId, normalized);
        accepted.push(eventId);
        affectedByEventAndStudent.set(`${eventKey}|${validStudentId}`, { eventKey, studentId: validStudentId });
      }

      if (accepted.length > 0) {
        for (const { eventKey, studentId } of affectedByEventAndStudent.values()) {
          const targetEvt = engdayState.eventsCatalog[eventKey];
          if (!targetEvt || !targetEvt.students) continue;
          const studentAllEvents = engdayEvents.filter(
            e => e.studentId === studentId && (e.eventKey || 'engday_2026') === eventKey
          );
          const baseStudent = targetEvt.students[studentId] || buildDefaultEngDayRoster()[studentId];
          const sessionIds = getActiveSessionIdsForEvent(eventKey);
          if (baseStudent) {
            targetEvt.students[studentId] = rederiveEngDayStudentState(baseStudent, studentAllEvents, sessionIds);
          }
          targetEvt.updatedAt = new Date().toISOString();
          if (eventKey === (engdayState.activeEventId || 'engday_2026')) {
            engdayState.students = targetEvt.students;
          }
        }
        engdayState.version = (engdayState.version || 1) + 1;
        engdayState.lastUpdated = new Date().toISOString();

        atomicWriteJson(ENGDAY_EVENTS_FILE, engdayEvents);
        atomicWriteJson(ENGDAY_STATE_FILE, engdayState);
        serverNewEventsSinceBackup += accepted.length;
        broadcastEngDayUpdate();
      }

      return sendJson(res, 200, {
        ok: true,
        accepted: accepted,
        duplicate: duplicate,
        rejected: rejected,
        serverTime: new Date().toISOString(),
        version: engdayState.version || 1,
        stats: calculateEngDayStats(reqActiveEventId)
      });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: err.message });
    }
  }

  if (reqPath === '/api/engday/attendance/reset' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      if (payload.confirmation !== 'RESET_ENGDAY_ATTENDANCE') {
        return sendJson(res, 400, { ok: false, error: 'Confirmation required: RESET_ENGDAY_ATTENDANCE' });
      }

      const targetEventKey = payload.eventKey || engdayState.activeEventId || 'engday_2026';
      const sessionFilter = payload.sessionId || null;
      const nowIso = payload.resetTimestamp || new Date().toISOString();

      // Filter out events matching targetEventKey (and optional sessionFilter)
      engdayEvents = engdayEvents.filter(e => {
        const ek = e.eventKey || 'engday_2026';
        if (ek !== targetEventKey) return true;
        if (sessionFilter && e.gameId !== sessionFilter) return true;
        return false;
      });
      engdayEventsMap.clear();
      engdayEvents.forEach(ev => {
        if (ev && ev.eventId) engdayEventsMap.set(ev.eventId, ev);
      });

      const sessionIds = getActiveSessionIdsForEvent(targetEventKey);
      if (!engdayState.eventsCatalog) engdayState.eventsCatalog = {};
      if (!engdayState.eventsCatalog[targetEventKey]) {
        engdayState.eventsCatalog[targetEventKey] = {
          id: targetEventKey,
          title: targetEventKey === 'engday_2026' ? 'ENGINEERING DAYS 2026' : targetEventKey,
          students: buildDefaultEngDayRoster(sessionIds),
          sessions: DEFAULT_ENGDAY_SESSIONS,
          groups: DEFAULT_ENGDAY_GROUPS,
          updatedAt: nowIso
        };
      }
      const evtObj = engdayState.eventsCatalog[targetEventKey];
      if (!evtObj.students) evtObj.students = {};
      ensureFullMasterRoster(evtObj.students, sessionIds);
      ensureFullMasterRoster(engdayState.students, ENGDAY_GAMES_LIST);

      // Re-derive or zero student records across active sessions
      Object.keys(evtObj.students).forEach(stId => {
        const remaining = engdayEvents.filter(e => e.studentId === stId && (e.eventKey || 'engday_2026') === targetEventKey);
        evtObj.students[stId] = rederiveEngDayStudentState(evtObj.students[stId], remaining, sessionIds);
      });

      if (targetEventKey === (engdayState.activeEventId || 'engday_2026')) {
        Object.keys(engdayState.students).forEach(stId => {
          const remaining = engdayEvents.filter(e => e.studentId === stId && (e.eventKey || 'engday_2026') === targetEventKey);
          engdayState.students[stId] = rederiveEngDayStudentState(engdayState.students[stId], remaining, ENGDAY_GAMES_LIST);
        });
      }

      evtObj.lastResetTimestamp = nowIso;
      evtObj.resetSequence = (evtObj.resetSequence || 0) + 1;
      evtObj.updatedAt = nowIso;

      engdayState.lastResetTimestamp = nowIso;
      engdayState.resetSequence = (engdayState.resetSequence || 0) + 1;
      engdayState.version = (engdayState.version || 1) + 10;
      engdayState.lastUpdated = nowIso;

      atomicWriteJson(ENGDAY_EVENTS_FILE, engdayEvents);
      atomicWriteJson(ENGDAY_STATE_FILE, engdayState);
      broadcastEngDayUpdate();

      return sendJson(res, 200, {
        ok: true,
        message: `Attendance reset successful for ${targetEventKey}`,
        serverTime: nowIso,
        lastResetTimestamp: nowIso,
        resetSequence: engdayState.resetSequence,
        version: engdayState.version,
        eventsCount: 0,
        stats: calculateEngDayStats(targetEventKey)
      });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: err.message });
    }
  }

  if (reqPath === '/api/engday/attendance/hard-reset' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const targetEventKey = payload.eventKey || engdayState.activeEventId || 'engday_2026';
      const nowIso = payload.resetTimestamp || new Date().toISOString();

      // Wipe all events for targetEventKey or all events if resetAll is true
      const initialCount = engdayEvents.length;
      engdayEvents = engdayEvents.filter(e => (e.eventKey || 'engday_2026') !== targetEventKey);
      engdayEventsMap.clear();
      engdayEvents.forEach(ev => {
        if (ev && ev.eventId) engdayEventsMap.set(ev.eventId, ev);
      });

      // Clear all state-level logs, scanLogs, and attendance maps
      engdayState.scanLogs = [];
      engdayState.auditLog = [];
      engdayState.attendance = {};

      const sessionIds = getActiveSessionIdsForEvent(targetEventKey);
      if (!engdayState.eventsCatalog) engdayState.eventsCatalog = {};
      if (!engdayState.eventsCatalog[targetEventKey]) {
        engdayState.eventsCatalog[targetEventKey] = {
          id: targetEventKey,
          title: targetEventKey === 'engday_2026' ? 'ENGINEERING DAYS 2026' : targetEventKey,
          students: buildDefaultEngDayRoster(sessionIds),
          sessions: DEFAULT_ENGDAY_SESSIONS,
          groups: DEFAULT_ENGDAY_GROUPS,
          updatedAt: nowIso
        };
      }
      const evtObj = engdayState.eventsCatalog[targetEventKey];
      if (!evtObj.students) evtObj.students = {};
      evtObj.scanLogs = [];
      evtObj.auditLog = [];
      evtObj.attendance = {};

      ensureFullMasterRoster(evtObj.students, sessionIds);
      ensureFullMasterRoster(engdayState.students, ENGDAY_GAMES_LIST);

      // Reset all student game records to clean OUTSIDE zero-state
      Object.keys(evtObj.students).forEach(stId => {
        evtObj.students[stId] = rederiveEngDayStudentState(evtObj.students[stId], [], sessionIds);
      });

      if (targetEventKey === (engdayState.activeEventId || 'engday_2026')) {
        Object.keys(engdayState.students).forEach(stId => {
          engdayState.students[stId] = rederiveEngDayStudentState(engdayState.students[stId], [], ENGDAY_GAMES_LIST);
        });
      }

      evtObj.lastHardResetTimestamp = nowIso;
      evtObj.hardResetSequence = (evtObj.hardResetSequence || 0) + 1;
      evtObj.lastResetTimestamp = nowIso;
      evtObj.resetSequence = (evtObj.resetSequence || 0) + 1;
      evtObj.updatedAt = nowIso;

      engdayState.lastHardResetTimestamp = nowIso;
      engdayState.hardResetSequence = (engdayState.hardResetSequence || 0) + 1;
      engdayState.lastResetTimestamp = nowIso;
      engdayState.resetSequence = (engdayState.resetSequence || 0) + 1;
      engdayState.version = (engdayState.version || 1) + 20;
      engdayState.lastUpdated = nowIso;

      atomicWriteJson(ENGDAY_EVENTS_FILE, engdayEvents);
      atomicWriteJson(ENGDAY_STATE_FILE, engdayState);
      broadcastEngDayUpdate();

      return sendJson(res, 200, {
        ok: true,
        message: `Hard reset completed for ${targetEventKey}. Wiped ${initialCount - engdayEvents.length} events down to zero.`,
        serverTime: nowIso,
        lastHardResetTimestamp: nowIso,
        hardResetSequence: engdayState.hardResetSequence,
        version: engdayState.version,
        eventsCount: 0,
        studentsCount: Object.keys(evtObj.students).length,
        stats: calculateEngDayStats(targetEventKey)
      });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: err.message });
    }
  }

  if (reqPath === '/api/engday/attendance/purge' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const targetEventKey = payload.eventKey || engdayState.activeEventId || 'engday_2026';
      const cutoffIso = payload.cutoff || payload.purgeBefore;
      const today4AM = getToday4AMCutoffServer();
      const cutoffTime = cutoffIso ? new Date(cutoffIso).getTime() : today4AM.getTime();
      const effectiveCutoffIso = (cutoffIso && !isNaN(cutoffTime)) ? cutoffIso : today4AM.toISOString();
      const isPre4AMToday = !cutoffIso || isNaN(cutoffTime) || Math.abs(cutoffTime - today4AM.getTime()) < 60000;

      const isStale = (timeVal) => {
        if (!timeVal) return true;
        if (isPre4AMToday) {
          return isTimestampBeforeToday4AMServer(timeVal);
        }
        const t = new Date(timeVal).getTime();
        return isNaN(t) || t < cutoffTime;
      };

      const initialCount = engdayEvents.length;
      engdayEvents = engdayEvents.filter(e => {
        const ek = e.eventKey || 'engday_2026';
        if (ek !== targetEventKey) return true;
        return !isStale(e.occurredAt || e.time || e.createdAt);
      });
      engdayEventsMap.clear();
      engdayEvents.forEach(ev => {
        if (ev && ev.eventId) engdayEventsMap.set(ev.eventId, ev);
      });

      const purgedCount = initialCount - engdayEvents.length;

      // Filter scanLogs and auditLog
      if (Array.isArray(payload.scanLogs)) {
        engdayState.scanLogs = payload.scanLogs.filter(l => !isStale(l.time || l.occurredAt || l.timestamp));
      } else if (Array.isArray(engdayState.scanLogs)) {
        engdayState.scanLogs = engdayState.scanLogs.filter(l => !isStale(l.time || l.occurredAt || l.timestamp));
      } else {
        engdayState.scanLogs = [];
      }

      if (Array.isArray(engdayState.auditLog)) {
        engdayState.auditLog = engdayState.auditLog.filter(l => !isStale(l.timestamp || l.time || l.occurredAt));
      }

      const sessionIds = getActiveSessionIdsForEvent(targetEventKey);
      if (!engdayState.eventsCatalog) engdayState.eventsCatalog = {};
      if (!engdayState.eventsCatalog[targetEventKey]) {
        engdayState.eventsCatalog[targetEventKey] = {
          id: targetEventKey,
          title: targetEventKey === 'engday_2026' ? 'ENGINEERING DAYS 2026' : targetEventKey,
          students: buildDefaultEngDayRoster(sessionIds),
          sessions: DEFAULT_ENGDAY_SESSIONS,
          groups: DEFAULT_ENGDAY_GROUPS,
          updatedAt: new Date().toISOString()
        };
      }
      const evtObj = engdayState.eventsCatalog[targetEventKey];
      if (!evtObj.students) evtObj.students = {};
      ensureFullMasterRoster(evtObj.students, sessionIds);
      ensureFullMasterRoster(engdayState.students, ENGDAY_GAMES_LIST);

      evtObj.scanLogs = [...(engdayState.scanLogs || [])];
      if (Array.isArray(evtObj.auditLog)) {
        evtObj.auditLog = evtObj.auditLog.filter(l => !isStale(l.timestamp || l.time || l.occurredAt));
      }

      Object.keys(evtObj.students).forEach(stId => {
        const remaining = engdayEvents.filter(e => e.studentId === stId && (e.eventKey || 'engday_2026') === targetEventKey);
        evtObj.students[stId] = rederiveEngDayStudentState(evtObj.students[stId], remaining, sessionIds);
      });

      if (targetEventKey === (engdayState.activeEventId || 'engday_2026')) {
        Object.keys(engdayState.students).forEach(stId => {
          const remaining = engdayEvents.filter(e => e.studentId === stId && (e.eventKey || 'engday_2026') === targetEventKey);
          engdayState.students[stId] = rederiveEngDayStudentState(engdayState.students[stId], remaining, ENGDAY_GAMES_LIST);
        });
      }

      // Rebuild attendance summary maps
      engdayState.attendance = {};
      Object.values(evtObj.students).forEach(s => {
        if (!s) return;
        const code = String(s.code || s.studentCode || s.id || '').toUpperCase();
        if (code) {
          engdayState.attendance[code] = {
            id: s.id,
            code: code,
            name: s.name,
            team: s.team,
            games: s.games
          };
        }
      });
      evtObj.attendance = { ...engdayState.attendance };

      evtObj.lastPurgeTimestamp = effectiveCutoffIso;
      evtObj.updatedAt = new Date().toISOString();

      engdayState.lastPurgeTimestamp = effectiveCutoffIso;
      engdayState.version = (engdayState.version || 1) + 5;
      engdayState.lastUpdated = new Date().toISOString();

      atomicWriteJson(ENGDAY_EVENTS_FILE, engdayEvents);
      atomicWriteJson(ENGDAY_STATE_FILE, engdayState);
      broadcastEngDayUpdate();

      return sendJson(res, 200, {
        ok: true,
        message: `Purged ${purgedCount} events before ${effectiveCutoffIso}`,
        purgedCount,
        remainingEvents: engdayEvents.length,
        cutoff: effectiveCutoffIso,
        stats: calculateEngDayStats(targetEventKey)
      });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: err.message });
    }
  }



  // -----------------------------------------------------------------------
  // STATIC ASSETS FILE SERVING (PRESERVED)
  // -----------------------------------------------------------------------
  let normalizedPath = decodeURI(reqPath);
  if (normalizedPath === '/') normalizedPath = '/index.html';

  const safePath = path.normalize(path.join(__dirname, normalizedPath));
  if (!safePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(safePath).pipe(res);
  });
}

const server = http.createServer(handleRequest);

const isDirectExecution = Boolean(
  process.argv[1] && (
    process.argv[1].endsWith('server.js') || 
    fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
  )
);

if (isDirectExecution && !IS_VERCEL) {
  server.listen(PORT, () => {
    console.log(`MEODL Esports & Attendance Server active on port ${PORT}:`);
    console.log(`  • Localhost:       http://localhost:${PORT}`);
    try {
      const interfaces = os.networkInterfaces();
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            console.log(`  • Mobile (LAN):    http://${iface.address}:${PORT}/scanner.html`);
          }
        }
      }
    } catch(e) {}
  });
}

export default handleRequest;
