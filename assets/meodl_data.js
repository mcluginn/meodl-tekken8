/* MEODL Authoritative Roster & Guidelines Data */
const TEAM_ASSETS = {
  rankine: {
    name: 'TEAM RANKINE',
    cycle: 'Rankine Cycle',
    description: 'Steam turbine • thermal power generation',
    banner: './assets/official/team_banner_rankine.jpg',
    logo: './assets/rankine_logo.png',
    accent: 'crimson',
    rosters: [
      './assets/official/roster_rankine_1.jpg',
      './assets/official/roster_rankine_2.jpg',
      './assets/official/roster_rankine_3.jpg'
    ]
  },

  otto: {
    name: 'TEAM OTTO',
    cycle: 'Otto Cycle',
    description: 'Four-stroke • spark ignition',
    banner: './assets/official/team_banner_otto.jpg',
    logo: './assets/otto_logo.png',
    accent: 'amber',
    rosters: [
      './assets/official/roster_otto_1.jpg',
      './assets/official/roster_otto_2.jpg'
    ]
  },

  brayton: {
    name: 'TEAM BRAYTON',
    cycle: 'Brayton Cycle',
    description: 'Gas turbine • jet propulsion',
    banner: './assets/official/team_banner_brayton.jpg',
    logo: './assets/brayton_logo.png',
    accent: 'cyan',
    rosters: [
      './assets/official/roster_brayton_1.jpg',
      './assets/official/roster_brayton_2.jpg'
    ]
  },

  diesel: {
    name: 'TEAM DIESEL',
    cycle: 'Diesel Cycle',
    description: 'Compression ignition • heavy-duty power',
    banner: './assets/official/team_banner_diesel.jpg',
    logo: './assets/diesel_logo.png',
    accent: 'emerald',
    rosters: [
      './assets/official/roster_diesel_1.jpg',
      './assets/official/roster_diesel_2.jpg',
      './assets/official/roster_diesel_3.jpg'
    ]
  }
};

function getTeamKey(name) {
  if (!name) return null;
  const s = String(name).toUpperCase();
  if (s === 'ME' || s.includes('MECHANICAL') || s.includes('RANKINE') || s.includes('OTTO') || s.includes('BRAYTON') || s.includes('DIESEL')) return 'me';
  if (s === 'EE' || s.includes('ELECTRICAL')) return 'ee';
  if (s === 'CPE' || s.includes('COMPUTER')) return 'cpe';
  if (s === 'ECE' || s.includes('ELECTRONICS')) return 'ece';
  if (s === 'IE' || s.includes('INDUSTRIAL')) return 'ie';
  if (s === 'CE' || s.includes('CIVIL')) return 'ce';
  return null;
}

function assetFallback(img, fallback) {
  if (!img) return;
  img.onerror = null;
  img.src = fallback || './assets/mes_logo.png';
}

const SPORT_BACKGROUNDS = {
  basketball: './assets/official/trophy_basketball.jpg',
  volleyball: './assets/official/trophy_volleyball.jpg',
  badmintonSingles: './assets/official/trophy_badminton.jpg',
  badmintonDoubles: './assets/official/trophy_badminton.jpg',
  chess: './assets/official/trophy_board_esports.jpg',
  scrabble: './assets/official/trophy_board_esports.jpg',
  swimming: './assets/official/trophy_swimming.jpg',
  amazingRace: './assets/official/trophy_amazing_race.jpg',
  eggHunt: './assets/official/trophy_egg_hunt.jpg',
  tekken8: './assets/official/trophy_board_esports.jpg',
  codm: './assets/official/trophy_board_esports.jpg',
  ml: './assets/official/trophy_board_esports.jpg',
  dashboard: './assets/official/meodl_banner_league.jpg',
  attendance: './assets/official/meodl_trophy_championship.jpg'
};

const SPORT_TROPHIES = {
  basketball: './assets/official/trophy_basketball.jpg',
  volleyball: './assets/official/trophy_volleyball.jpg',
  badmintonSingles: './assets/official/trophy_badminton.jpg',
  badmintonDoubles: './assets/official/trophy_badminton.jpg',
  chess: './assets/official/trophy_board_esports.jpg',
  scrabble: './assets/official/trophy_board_esports.jpg',
  swimming: './assets/official/trophy_swimming.jpg',
  amazingRace: './assets/official/trophy_amazing_race.jpg',
  eggHunt: './assets/official/trophy_egg_hunt.jpg',
  tekken8: './assets/official/trophy_board_esports.jpg',
  codm: './assets/official/trophy_board_esports.jpg',
  ml: './assets/official/trophy_board_esports.jpg'
};

const SPORT_RULES_POSTERS = {
  basketball: [
    { title: 'Basketball Official Mechanics', src: './assets/official/rules_basketball.jpg' }
  ],
  volleyball: [
    { title: 'Volleyball Official Mechanics', src: './assets/official/rules_volleyball.jpg' }
  ],
  badmintonSingles: [
    { title: 'Badminton Mechanics & Attire', src: './assets/official/rules_badminton_1.jpg' },
    { title: 'Badminton BWF Rally Point Scoring', src: './assets/official/rules_badminton_2.jpg' }
  ],
  badmintonDoubles: [
    { title: 'Badminton Mechanics & Attire', src: './assets/official/rules_badminton_1.jpg' },
    { title: 'Badminton BWF Rally Point Scoring', src: './assets/official/rules_badminton_2.jpg' }
  ],
  chess: [
    { title: 'Board Games Mechanics & Categories', src: './assets/official/rules_board_games_1.jpg' },
    { title: 'Touch-Move Rules & Clocks', src: './assets/official/rules_board_games_2.jpg' }
  ],
  scrabble: [
    { title: 'Board Games Mechanics & Categories', src: './assets/official/rules_board_games_1.jpg' },
    { title: 'Touch-Move Rules & Clocks', src: './assets/official/rules_board_games_2.jpg' }
  ],
  swimming: [
    { title: 'Swimming Mechanics & Single False Start', src: './assets/official/rules_swimming_1.jpg' },
    { title: 'Swimming Stroke Rules & Turn Guidelines', src: './assets/official/rules_swimming_2.jpg' }
  ],
  amazingRace: [
    { title: 'Amazing Race Overview', src: './assets/official/rules_amazing_race_cover.jpg' },
    { title: 'Teams & 4 Main Stations', src: './assets/official/rules_amazing_race_1.jpg' },
    { title: 'Final Escape Room & Challenge Pieces', src: './assets/official/rules_amazing_race_2.jpg' },
    { title: 'Safety, Anti-Cheating & Scoring', src: './assets/official/rules_amazing_race_3.jpg' },
    { title: 'Rotation Sequence Per Year Level', src: './assets/official/rules_amazing_race_stations.jpg' }
  ],
  eggHunt: [
    { title: 'Egg Hunt Eligibility & Boundaries', src: './assets/official/rules_egg_hunt_1.jpg' },
    { title: 'Pointing System (10 / 25 / 50 pts)', src: './assets/official/rules_egg_hunt_2.jpg' }
  ],
  tekken8: [
    { title: 'Esports Categories & Account Rules', src: './assets/official/rules_esports_1.jpg' },
    { title: 'Grace Period & Substitutions Policy', src: './assets/official/rules_esports_2.jpg' }
  ],
  codm: [
    { title: 'Esports Categories & Account Rules', src: './assets/official/rules_esports_1.jpg' },
    { title: 'Grace Period & Substitutions Policy', src: './assets/official/rules_esports_2.jpg' }
  ],
  ml: [
    { title: 'Esports Categories & Account Rules', src: './assets/official/rules_esports_1.jpg' },
    { title: 'Grace Period & Substitutions Policy', src: './assets/official/rules_esports_2.jpg' }
  ]
};

const SPORT_BRACKET_POSTERS = {
  basketball: './assets/official/bracket_basketball.jpg',
  volleyball: './assets/official/bracket_volleyball.jpg',
  badmintonSingles: './assets/official/bracket_badminton.jpg',
  badmintonDoubles: './assets/official/bracket_badminton.jpg',
  chess: './assets/official/bracket_board_games.jpg',
  scrabble: './assets/official/bracket_board_games.jpg',
  tekken8: './assets/official/bracket_esports.jpg',
  codm: './assets/official/bracket_esports.jpg',
  ml: './assets/official/bracket_esports.jpg'
};

const LEAGUE_OFFICIAL_ASSETS = {
  championshipCup: './assets/official/meodl_trophy_championship.jpg',
  leagueBanner: './assets/official/meodl_banner_league.jpg',
  teamsTitle: './assets/official/meodl_teams_title.jpg'
};

window.TEAM_ASSETS = TEAM_ASSETS;
window.SPORT_BACKGROUNDS = SPORT_BACKGROUNDS;
window.SPORT_TROPHIES = SPORT_TROPHIES;
window.SPORT_RULES_POSTERS = SPORT_RULES_POSTERS;
window.SPORT_BRACKET_POSTERS = SPORT_BRACKET_POSTERS;
window.LEAGUE_OFFICIAL_ASSETS = LEAGUE_OFFICIAL_ASSETS;
window.getTeamKey = getTeamKey;
window.assetFallback = assetFallback;


const EDAYS_2026_ADDITIONAL_ROSTER = [{"id":"EE-001","code":"EE-001","name":"ABAD, EARL JOHN A.","team":"EE"},{"id":"EE-002","code":"EE-002","name":"ABOCEJO, KING CHRISTOPHER","team":"EE"},{"id":"EE-003","code":"EE-003","name":"ABUDA, RUPERTH KNIE P.","team":"EE"},{"id":"EE-004","code":"EE-004","name":"ALANIB, RYLE BASTY B.","team":"EE"},{"id":"EE-005","code":"EE-005","name":"ALVAREZ, EVANN C.","team":"EE"},{"id":"EE-006","code":"EE-006","name":"ANACION, RHAINE DOMINIC D.","team":"EE"},{"id":"EE-007","code":"EE-007","name":"ANDAYA, JOHN MICHAEL L.","team":"EE"},{"id":"EE-008","code":"EE-008","name":"ANDRADA, JOSE ANDREI P.","team":"EE"},{"id":"EE-009","code":"EE-009","name":"ARANDIA, JOHN ANSELLE M.","team":"EE"},{"id":"EE-010","code":"EE-010","name":"ASCAÑO, RHICO S.","team":"EE"},{"id":"EE-011","code":"EE-011","name":"ASTROLABIO, RHAY JUSTIN P.","team":"EE"},{"id":"EE-012","code":"EE-012","name":"ATIENZA, PAUL JERICO H.","team":"EE"},{"id":"EE-013","code":"EE-013","name":"BAHOY, DWIGHT IVAN V.","team":"EE"},{"id":"EE-014","code":"EE-014","name":"BERMUDEZ, MARK LEO M.","team":"EE"},{"id":"EE-015","code":"EE-015","name":"BONCAJES, ROB MARTIN A.","team":"EE"},{"id":"EE-016","code":"EE-016","name":"CABARLES, TYRON Q.","team":"EE"},{"id":"EE-017","code":"EE-017","name":"CAJUCOM, BRYAN JAMES M.","team":"EE"},{"id":"EE-018","code":"EE-018","name":"CALMA, WENDELL D.","team":"EE"},{"id":"EE-019","code":"EE-019","name":"CANTARA, CHILVERT REIN C.","team":"EE"},{"id":"EE-020","code":"EE-020","name":"CARMONA, LEE ROUAN C.","team":"EE"},{"id":"EE-021","code":"EE-021","name":"CHAVEZ, JOHN DAVID B.","team":"EE"},{"id":"EE-022","code":"EE-022","name":"COMMINS, FRANCHESKA MAE A.","team":"EE"},{"id":"EE-023","code":"EE-023","name":"CRISTOBAL, CHRISTOPHER Y.","team":"EE"},{"id":"EE-024","code":"EE-024","name":"CUIZON, ALEXANDER D.","team":"EE"},{"id":"EE-025","code":"EE-025","name":"DALISAY, RANIEL T.","team":"EE"},{"id":"EE-026","code":"EE-026","name":"DAMAYO, CHRISTOPHER DANIELLE C.","team":"EE"},{"id":"EE-027","code":"EE-027","name":"DAPADAP, JOSHUA NAHIL N.","team":"EE"},{"id":"EE-028","code":"EE-028","name":"DATUS, RAIN R.","team":"EE"},{"id":"EE-029","code":"EE-029","name":"DE LEON, RITCH GERMAINE M.","team":"EE"},{"id":"EE-030","code":"EE-030","name":"DELA CRUZ, JOHN JOSEPH R.","team":"EE"},{"id":"EE-031","code":"EE-031","name":"DELOS REYES, JEROME V.","team":"EE"},{"id":"EE-032","code":"EE-032","name":"DELOS REYES, MARK STEPHEN B.","team":"EE"},{"id":"EE-033","code":"EE-033","name":"DULAY, GEIBRIEL RENE P.","team":"EE"},{"id":"EE-034","code":"EE-034","name":"ENDRINAL, EMMANUEL H.","team":"EE"},{"id":"EE-035","code":"EE-035","name":"EREJIAS, JOHN MARK M.","team":"EE"},{"id":"EE-036","code":"EE-036","name":"EUGENIO, JOHN MICHAEL A.","team":"EE"},{"id":"EE-037","code":"EE-037","name":"FAELMARIN, JHON AX'L F.","team":"EE"},{"id":"EE-038","code":"EE-038","name":"FLORES, NORIEL A.","team":"EE"},{"id":"EE-039","code":"EE-039","name":"FLORES, RHONA LYN R.","team":"EE"},{"id":"EE-040","code":"EE-040","name":"FLORIDO, DUSTINE ANGELO M.","team":"EE"},{"id":"EE-041","code":"EE-041","name":"GADAZA, JOSE GABRIEL B.","team":"EE"},{"id":"EE-042","code":"EE-042","name":"GALLEGO, HARIS JHON S.","team":"EE"},{"id":"EE-043","code":"EE-043","name":"GAYOSA, KHENA KATLEEN G.","team":"EE"},{"id":"EE-044","code":"EE-044","name":"GERODIAS, BRENT GERSON A.","team":"EE"},{"id":"EE-045","code":"EE-045","name":"GOMEZ, MA. ALSHICA K.","team":"EE"},{"id":"EE-046","code":"EE-046","name":"GONZALES, SEAN ALLEN M.","team":"EE"},{"id":"EE-047","code":"EE-047","name":"GUIRUELA, JAMES L.","team":"EE"},{"id":"EE-048","code":"EE-048","name":"HASHIM, BRINLY HAMIM M.","team":"EE"},{"id":"EE-049","code":"EE-049","name":"HERNANDEZ, JAY CYRIL C.","team":"EE"},{"id":"EE-050","code":"EE-050","name":"HERNANDEZ, SAM ANDREI V.","team":"EE"},{"id":"EE-051","code":"EE-051","name":"IBARROLA, HANS KEN M.","team":"EE"},{"id":"EE-052","code":"EE-052","name":"JUANICO, NYNGEL S.","team":"EE"},{"id":"EE-053","code":"EE-053","name":"LACORTE, CRIS JASON M.","team":"EE"},{"id":"EE-054","code":"EE-054","name":"LAYACAN, VHEA EDRICH M.","team":"EE"},{"id":"EE-055","code":"EE-055","name":"LEGASPI, ULYCES P.","team":"EE"},{"id":"EE-056","code":"EE-056","name":"LOPEZ, CHARLES ROBERT L.","team":"EE"},{"id":"EE-057","code":"EE-057","name":"LUMBRES, DUSTIN M.","team":"EE"},{"id":"EE-058","code":"EE-058","name":"MACALALAD, FRANS RYLCO C.","team":"EE"},{"id":"EE-059","code":"EE-059","name":"MAGSOMBOL, JAMES RYAN J.","team":"EE"},{"id":"EE-060","code":"EE-060","name":"MALABAG, JOHN MICHAEL B.","team":"EE"},{"id":"EE-061","code":"EE-061","name":"MALANA, ROSSETTE NATHALIE A.","team":"EE"},{"id":"EE-062","code":"EE-062","name":"MALOLOY-ON, DEFFERSON JOHN T.","team":"EE"},{"id":"EE-063","code":"EE-063","name":"MAÑOBRA, LORENZO A.","team":"EE"},{"id":"EE-064","code":"EE-064","name":"MAPUTE, CHRIS CORNELL F.","team":"EE"},{"id":"EE-065","code":"EE-065","name":"MICA, CLARK DUSTIN COSME D.","team":"EE"},{"id":"EE-066","code":"EE-066","name":"MILCA, JERALD O.","team":"EE"},{"id":"EE-067","code":"EE-067","name":"MONDIA, JOHN VINCENT M.","team":"EE"},{"id":"EE-068","code":"EE-068","name":"MORAN, MARK NIÑO A.","team":"EE"},{"id":"EE-069","code":"EE-069","name":"MOSCA, JAMESTEVE SEAN G.","team":"EE"},{"id":"EE-070","code":"EE-070","name":"NUNO, ROYD ALFONSO M.","team":"EE"},{"id":"EE-071","code":"EE-071","name":"OPULENCIA, AARON ALLEXIS S.","team":"EE"},{"id":"EE-072","code":"EE-072","name":"ORTEGA, JAMES V.","team":"EE"},{"id":"EE-073","code":"EE-073","name":"ORTIZ, PAULA EUNISE A.","team":"EE"},{"id":"EE-074","code":"EE-074","name":"PABALATE, RHED S.","team":"EE"},{"id":"EE-075","code":"EE-075","name":"PAMPLONA, NELO DRIX T.","team":"EE"},{"id":"EE-076","code":"EE-076","name":"PANARIGAN, KARLO P.","team":"EE"},{"id":"EE-077","code":"EE-077","name":"PANER, ORLANDO GABRIEL C.","team":"EE"},{"id":"EE-078","code":"EE-078","name":"PATARAY, EUNICE L.","team":"EE"},{"id":"EE-079","code":"EE-079","name":"PECAYO, RHIANE MAE L.","team":"EE"},{"id":"EE-080","code":"EE-080","name":"PEDRAJA, JOMARI D.","team":"EE"},{"id":"EE-081","code":"EE-081","name":"PEREZ, JARED ELWOOD P.","team":"EE"},{"id":"EE-082","code":"EE-082","name":"PIOQUINTO, ELREY D.","team":"EE"},{"id":"EE-083","code":"EE-083","name":"PIZARRA, DOMAR A.","team":"EE"},{"id":"EE-084","code":"EE-084","name":"RAMILO, DRACIR JOSH G.","team":"EE"},{"id":"EE-085","code":"EE-085","name":"SALIBA, DEROSS D.","team":"EE"},{"id":"EE-086","code":"EE-086","name":"SANTOS, RAFAEL P.","team":"EE"},{"id":"EE-087","code":"EE-087","name":"SOLATORIO, JOHN JETRO C.","team":"EE"},{"id":"EE-088","code":"EE-088","name":"TABAMO, EJ GODWIN B.","team":"EE"},{"id":"EE-089","code":"EE-089","name":"TORIAGA, KURT LOUISE M.","team":"EE"},{"id":"EE-090","code":"EE-090","name":"URRIZA, BRYLLE KRISTEN A.","team":"EE"},{"id":"EE-091","code":"EE-091","name":"VILLARE, RYE LEE E.","team":"EE"},{"id":"EE-092","code":"EE-092","name":"YABUT, CRISENCIO JR. P.","team":"EE"},{"id":"CPE-001","code":"CPE-001","name":"AMICAN, GABRIEL EMMANUEL B.","team":"CPE"},{"id":"CPE-002","code":"CPE-002","name":"ANDAYA, SEAN COLLIN S.","team":"CPE"},{"id":"CPE-003","code":"CPE-003","name":"ARQUILLO, MARK P.","team":"CPE"},{"id":"CPE-004","code":"CPE-004","name":"ARROCO, DAVID SZUIN R.","team":"CPE"},{"id":"CPE-005","code":"CPE-005","name":"BALBUENA, EDUARDO III J.","team":"CPE"},{"id":"CPE-006","code":"CPE-006","name":"BARBON, ANNE KIRSTEN V.","team":"CPE"},{"id":"CPE-007","code":"CPE-007","name":"BARCELLANO, MAR JOSEF V.","team":"CPE"},{"id":"CPE-008","code":"CPE-008","name":"BEGAS, JAYCEL NIEL C.","team":"CPE"},{"id":"CPE-009","code":"CPE-009","name":"BIESCAS, REYSSA JEAN D.","team":"CPE"},{"id":"CPE-010","code":"CPE-010","name":"BITANA, MARK EDRIAN J.","team":"CPE"},{"id":"CPE-011","code":"CPE-011","name":"BUSTAMANTE, DANIEL JOHN T.","team":"CPE"},{"id":"CPE-012","code":"CPE-012","name":"CAMACHO, BERNARD JOEY B.","team":"CPE"},{"id":"CPE-013","code":"CPE-013","name":"CAMBEL, KIRSTEN M.","team":"CPE"},{"id":"CPE-014","code":"CPE-014","name":"CANTALEJO, KAIDE M.","team":"CPE"},{"id":"CPE-015","code":"CPE-015","name":"CASTILLO, CHINI MARIELLI","team":"CPE"},{"id":"CPE-016","code":"CPE-016","name":"CENA, LEO M.","team":"CPE"},{"id":"CPE-017","code":"CPE-017","name":"CESAR, KLYDE GABRIEL A.","team":"CPE"},{"id":"CPE-018","code":"CPE-018","name":"CLARO, SHAWN ROMINICK T.","team":"CPE"},{"id":"CPE-019","code":"CPE-019","name":"CONEJARES, RODCORT ELVEN V.","team":"CPE"},{"id":"CPE-020","code":"CPE-020","name":"DE JESUS, KENNETH G.","team":"CPE"},{"id":"CPE-021","code":"CPE-021","name":"DOLLETON, DWAYNE KENSHIN R.","team":"CPE"},{"id":"CPE-022","code":"CPE-022","name":"DOMINGO, JOSE URBANO B.","team":"CPE"},{"id":"CPE-023","code":"CPE-023","name":"DULLAS, CHARLES EZEKIEL F.","team":"CPE"},{"id":"CPE-024","code":"CPE-024","name":"DY, LEIGH ICEN G.","team":"CPE"},{"id":"CPE-025","code":"CPE-025","name":"ESCULTURA, PRINCE ERROLL M.","team":"CPE"},{"id":"CPE-026","code":"CPE-026","name":"ESTEBAN, JEANE ANDREI C.","team":"CPE"},{"id":"CPE-027","code":"CPE-027","name":"GALOYO, IRIS L.","team":"CPE"},{"id":"CPE-028","code":"CPE-028","name":"GARCIA, JUSTIN ADRIENN P.","team":"CPE"},{"id":"CPE-029","code":"CPE-029","name":"KODAKA, KIAN KENTA D.","team":"CPE"},{"id":"CPE-030","code":"CPE-030","name":"LLANETA, JOHN VINCENT M.","team":"CPE"},{"id":"CPE-031","code":"CPE-031","name":"LLANETA, KENJIE-LIM A.","team":"CPE"},{"id":"CPE-032","code":"CPE-032","name":"MAALINDOG, ALAN PAUL C.","team":"CPE"},{"id":"CPE-033","code":"CPE-033","name":"MAGNO, DAN LLOYD L.","team":"CPE"},{"id":"CPE-034","code":"CPE-034","name":"MALABANAN, JUSTINE RALPH B.","team":"CPE"},{"id":"CPE-035","code":"CPE-035","name":"MANE, FRANCINE JADE G.","team":"CPE"},{"id":"CPE-036","code":"CPE-036","name":"MEDINA, ALLAEN MARK S.","team":"CPE"},{"id":"CPE-037","code":"CPE-037","name":"NAGPALA, EERSEL ANDREY V.","team":"CPE"},{"id":"CPE-038","code":"CPE-038","name":"OCASLA, NORMAN DAVID J.","team":"CPE"},{"id":"CPE-039","code":"CPE-039","name":"OLIVAR, CHRISTIAN JOSH D.","team":"CPE"},{"id":"CPE-040","code":"CPE-040","name":"OPULENCIA, ALLEXASHEENA DEINNE S.","team":"CPE"},{"id":"CPE-041","code":"CPE-041","name":"ORDANZA, JAMEZ IVAN V.","team":"CPE"},{"id":"CPE-042","code":"CPE-042","name":"PADUA, RHIANA ASHLEY G.","team":"CPE"},{"id":"CPE-043","code":"CPE-043","name":"PALISOC, MARK ELEAZAR M.","team":"CPE"},{"id":"CPE-044","code":"CPE-044","name":"PALOMO, CHARLEMAGNE B.","team":"CPE"},{"id":"CPE-045","code":"CPE-045","name":"PEDRIGAL, MARGARETE JANE PAULEY D.","team":"CPE"},{"id":"CPE-046","code":"CPE-046","name":"PETATE, KARL JANSEN S.","team":"CPE"},{"id":"CPE-047","code":"CPE-047","name":"PETATE, KIERVY R.","team":"CPE"},{"id":"CPE-048","code":"CPE-048","name":"RAFA, RAFAEL ALEX A.","team":"CPE"},{"id":"CPE-049","code":"CPE-049","name":"REGASPI, MARY MARGARETTE D.","team":"CPE"},{"id":"CPE-050","code":"CPE-050","name":"RUANTO, RANIELLE JEDD R.","team":"CPE"},{"id":"CPE-051","code":"CPE-051","name":"SANTIAGO, ULRICA LORAINE D.","team":"CPE"},{"id":"CPE-052","code":"CPE-052","name":"SASPA, ASHLEY KHATE R.","team":"CPE"},{"id":"CPE-053","code":"CPE-053","name":"SERRANA, JESSIE B.","team":"CPE"},{"id":"CPE-054","code":"CPE-054","name":"TAN, SIMON M.","team":"CPE"},{"id":"CPE-055","code":"CPE-055","name":"TOLENTINO, BENJAMIN M.","team":"CPE"},{"id":"CPE-056","code":"CPE-056","name":"TORALES, REUEL ANNE A.","team":"CPE"},{"id":"CPE-057","code":"CPE-057","name":"TORRES, JOSHUA ALLEN D.","team":"CPE"},{"id":"CPE-058","code":"CPE-058","name":"VIVAS, BENEDICT MIGUEL C.","team":"CPE"},{"id":"CPE-059","code":"CPE-059","name":"YANSON, RANDEL C.","team":"CPE"},{"id":"CPE-060","code":"CPE-060","name":"ZARSUELO, JOHN GAVERIEL D.","team":"CPE"},{"id":"ECE-001","code":"ECE-001","name":"MARQUEZ, GISELLE A.","team":"ECE"},{"id":"ECE-002","code":"ECE-002","name":"GUANIESO, ANGELLIC RENANELYN O.","team":"ECE"},{"id":"ECE-003","code":"ECE-003","name":"CAMAT, RENUARD A.","team":"ECE"},{"id":"ECE-004","code":"ECE-004","name":"ALKHATIB, SAMER B.","team":"ECE"},{"id":"ECE-005","code":"ECE-005","name":"OPULENCIA, MARIA GEE-ANNE P.","team":"ECE"},{"id":"ECE-006","code":"ECE-006","name":"GAMITIN, JOMAR GABRIEL B.","team":"ECE"},{"id":"ECE-007","code":"ECE-007","name":"PAGUINTO, OLIEMAR LEINER P.","team":"ECE"},{"id":"ECE-008","code":"ECE-008","name":"MARASIGAN, JERICHO MIGUEL R.","team":"ECE"},{"id":"ECE-009","code":"ECE-009","name":"GUERRERO, OWEN DOMINIC V.","team":"ECE"},{"id":"ECE-010","code":"ECE-010","name":"MENOR, ANGELO C.","team":"ECE"},{"id":"IE-001","code":"IE-001","name":"ABAD, JUDITH MARIAN SILVA","team":"IE"},{"id":"IE-002","code":"IE-002","name":"AGUILAR, RUSSEL ALLEN CASTILLO","team":"IE"},{"id":"IE-003","code":"IE-003","name":"BALLEZA, BRUNZON ANSANO","team":"IE"},{"id":"IE-004","code":"IE-004","name":"BAUTISTA, MA. CHARICE JAYONA","team":"IE"},{"id":"IE-005","code":"IE-005","name":"CANATUAN, YSABELA MERCADO","team":"IE"},{"id":"IE-006","code":"IE-006","name":"CICERON, HANS GABRIEL CONJARES","team":"IE"},{"id":"IE-007","code":"IE-007","name":"CONSIGNADO, KASSANDRA SARMIENTO","team":"IE"},{"id":"IE-008","code":"IE-008","name":"DE LEON, YANZ MARLOU BAYBAY","team":"IE"},{"id":"IE-009","code":"IE-009","name":"ELISAN, JOSHUA BRYCE OLINARES","team":"IE"},{"id":"IE-010","code":"IE-010","name":"ESTRADA, JERILOU MAE NAZARETH","team":"IE"},{"id":"IE-011","code":"IE-011","name":"FRANCISCO, ANDRES LUIS MADEJA","team":"IE"},{"id":"IE-012","code":"IE-012","name":"HALILI, MARK CLARENCE ALDABE","team":"IE"},{"id":"IE-013","code":"IE-013","name":"IYOG, HANNAH MEKIE SHANE JUNGAY","team":"IE"},{"id":"IE-014","code":"IE-014","name":"KODAKA, KYLE KENYA DELUANA","team":"IE"},{"id":"IE-015","code":"IE-015","name":"LARINO, JOANA SOPHIA BEATRICE REYEG","team":"IE"},{"id":"IE-016","code":"IE-016","name":"LECHUGA, CASSANDRA SHANEYA MANINGAS","team":"IE"},{"id":"IE-017","code":"IE-017","name":"LEGASPI, TRAVIS MATHEW PARO","team":"IE"},{"id":"IE-018","code":"IE-018","name":"MALLORCA, ANTON JOSEPH NARVAEZ","team":"IE"},{"id":"IE-019","code":"IE-019","name":"NIEM, JARED CIRENE GOLE","team":"IE"},{"id":"IE-020","code":"IE-020","name":"OCAMPO, RENZO HADI","team":"IE"},{"id":"IE-021","code":"IE-021","name":"PADIT, ANDREI ANG","team":"IE"},{"id":"IE-022","code":"IE-022","name":"PALIZA, PATRICK ANJELLO SOLINAP","team":"IE"},{"id":"IE-023","code":"IE-023","name":"RAÑOLA, PRINCESS ARIANI ROXAS","team":"IE"},{"id":"IE-024","code":"IE-024","name":"ROSALES, LOUISE ALLEN BALBIN","team":"IE"},{"id":"IE-025","code":"IE-025","name":"SOJOR, ALBERT MARCELO","team":"IE"},{"id":"IE-026","code":"IE-026","name":"VALIÑA, ANGELA CLAIRE PERILLO","team":"IE"},{"id":"IE-027","code":"IE-027","name":"BANTOC, VINCE LYNDON ABENDAN","team":"IE"},{"id":"IE-028","code":"IE-028","name":"BESAS, CHEN ZHEN LUMACANG","team":"IE"},{"id":"IE-029","code":"IE-029","name":"DOROJA, PRINCESS FHAYE COLLINE TAMONDONG","team":"IE"},{"id":"IE-030","code":"IE-030","name":"FRANCISCO, DERRICK GABRIEL ESCONDO","team":"IE"},{"id":"IE-031","code":"IE-031","name":"GALINDEZ, JOHN PAUL JAVIER","team":"IE"},{"id":"IE-032","code":"IE-032","name":"GARDAYA, PRINCESS JANEL DE OCAMPO","team":"IE"},{"id":"IE-033","code":"IE-033","name":"GUELAS, MARK KRISTIAN ROMEO DUSONG","team":"IE"},{"id":"IE-034","code":"IE-034","name":"IMSON, CHRISTIAN SIMON OLIVEROS","team":"IE"},{"id":"IE-035","code":"IE-035","name":"JAYME, PRINCESS MAE MANAIG","team":"IE"},{"id":"IE-036","code":"IE-036","name":"MALABANAN, ALJON RAMOS","team":"IE"},{"id":"IE-037","code":"IE-037","name":"MALATE, LUJILL DYLAN SEÑORISES","team":"IE"},{"id":"IE-038","code":"IE-038","name":"MANNAN, ABDULHAFIDZ MAUJOD","team":"IE"},{"id":"IE-039","code":"IE-039","name":"MILANES, SHANE SALIBIO","team":"IE"},{"id":"IE-040","code":"IE-040","name":"NAVARRO, NEON GENESIS DE CASTRO","team":"IE"},{"id":"IE-041","code":"IE-041","name":"NOBLEFRANCA, VARY ALEM CANDELARIA","team":"IE"},{"id":"IE-042","code":"IE-042","name":"OQUERIA, CAMILLE ANNE CANLOBO","team":"IE"},{"id":"IE-043","code":"IE-043","name":"ORELLANES, JOHN MARK BATASINGEN","team":"IE"},{"id":"IE-044","code":"IE-044","name":"PACALDO, JHAYSAMEL ALALIM","team":"IE"},{"id":"IE-045","code":"IE-045","name":"PINEDA, KIENNA DENISE ORUGA","team":"IE"},{"id":"IE-046","code":"IE-046","name":"RAMILO, JONAIRA MARI LUCIDO","team":"IE"},{"id":"IE-047","code":"IE-047","name":"RIVERA, RALPH HENRY CAAGBAY","team":"IE"},{"id":"IE-048","code":"IE-048","name":"ROBLES, MARK ANDREI BANIGO-OS","team":"IE"},{"id":"IE-049","code":"IE-049","name":"SUAREZ, KEN DELA CRUZ","team":"IE"},{"id":"IE-050","code":"IE-050","name":"SUATING, DARVIE ANGELO DELA PEÑA","team":"IE"},{"id":"IE-051","code":"IE-051","name":"ATENCIO, IRISH MAE ADRIATICO","team":"IE"},{"id":"IE-052","code":"IE-052","name":"BAUTISTA, MAURHIZ LIRA","team":"IE"},{"id":"IE-053","code":"IE-053","name":"BONIFACIO, MARC ANTHONY PEREZ","team":"IE"},{"id":"IE-054","code":"IE-054","name":"BUSTAMANTE, ZYRUS DIMAANO","team":"IE"},{"id":"IE-055","code":"IE-055","name":"CASAJE, PRINCESS JANE DEQUIÑA","team":"IE"},{"id":"IE-056","code":"IE-056","name":"DALIS, LESTER MARU CABRERA","team":"IE"},{"id":"IE-057","code":"IE-057","name":"DE LA CRUZ, CHRISTIAN EARL MANANGAN","team":"IE"},{"id":"IE-058","code":"IE-058","name":"DELA TORRE, ANGELICA FAYE TUBILLO","team":"IE"},{"id":"IE-059","code":"IE-059","name":"JACINTO, GILLIANE MARGARETTE CREDO","team":"IE"},{"id":"IE-060","code":"IE-060","name":"LAOMOC, JANSENN LOU DIMALALUAN","team":"IE"},{"id":"IE-061","code":"IE-061","name":"LUBATON, ALTHEA FEI MOLINTAPANG","team":"IE"},{"id":"IE-062","code":"IE-062","name":"LUMBRES, JENELLE MANIMTIM","team":"IE"},{"id":"IE-063","code":"IE-063","name":"MALBAS, MARJORI DAUSON","team":"IE"},{"id":"IE-064","code":"IE-064","name":"MANUEL, CARL JUSTIN BUENA","team":"IE"},{"id":"IE-065","code":"IE-065","name":"MARIANO, IVAN CLARK JORISH MENDOZA","team":"IE"},{"id":"IE-066","code":"IE-066","name":"MARIANO, JUAN PAULO MIRASOL","team":"IE"},{"id":"IE-067","code":"IE-067","name":"MATANGUIHAN, KYLA AVILA","team":"IE"},{"id":"IE-068","code":"IE-068","name":"MORADA, MICAIAH GWYNNETH GONZALES","team":"IE"},{"id":"IE-069","code":"IE-069","name":"QUEZON, JOHN ARIEL ROSALES","team":"IE"},{"id":"IE-070","code":"IE-070","name":"RAMIRO, JAYPEE DOMINGO","team":"IE"},{"id":"IE-071","code":"IE-071","name":"RAPAL, KHRISTIAN LEGASPI","team":"IE"},{"id":"IE-072","code":"IE-072","name":"TAYONI, DUSTIN KYLE QUIJADA","team":"IE"},{"id":"IE-073","code":"IE-073","name":"TEMEÑA, MARK ANGELO BOMBITA","team":"IE"},{"id":"IE-074","code":"IE-074","name":"VIDAL, JULIAN VICTOR NARVAEZ","team":"IE"},{"id":"IE-075","code":"IE-075","name":"VILLANUEVA, RALPH CYRIL VIDAERA","team":"IE"},{"id":"IE-076","code":"IE-076","name":"VIZCONDE, ARYZA GRACE ESCOBELLA","team":"IE"},{"id":"IE-077","code":"IE-077","name":"ALCASABAS, JERICHO CRIS ARCEO","team":"IE"},{"id":"IE-078","code":"IE-078","name":"AMPELOQUIO, JOHN ARMIL PILAR","team":"IE"},{"id":"IE-079","code":"IE-079","name":"ANCAYAN, ALLUJ PHILIP BELEN","team":"IE"},{"id":"IE-080","code":"IE-080","name":"BARRIENTOS, VINCENT BACANI","team":"IE"},{"id":"IE-081","code":"IE-081","name":"BARUNDIA, BRYLLE RAPHAEL MANDIGMA","team":"IE"},{"id":"IE-082","code":"IE-082","name":"BAYOT, HELEINA JANE IGUAL","team":"IE"},{"id":"IE-083","code":"IE-083","name":"CABALES, RAYVER JUSTINE NOCHETE","team":"IE"},{"id":"IE-084","code":"IE-084","name":"CABUDSAN, CATHERINE JOY MUSNGI","team":"IE"},{"id":"IE-085","code":"IE-085","name":"DISIMULACION, KIM BRAYN RAMOS","team":"IE"},{"id":"IE-086","code":"IE-086","name":"IBO, JOHN LLOYD FARIÑAS","team":"IE"},{"id":"IE-087","code":"IE-087","name":"LABUTAP, DAVE ALDRIN LARA","team":"IE"},{"id":"IE-088","code":"IE-088","name":"MARQUEZ, ARIES SALUD","team":"IE"},{"id":"IE-089","code":"IE-089","name":"NENENG, FRANKY PARAISO","team":"IE"},{"id":"IE-090","code":"IE-090","name":"PEREZ, ZYREL MANIMTIM","team":"IE"},{"id":"IE-091","code":"IE-091","name":"REGINIO JR., ROLANDO AMPELOQUIO","team":"IE"},{"id":"IE-092","code":"IE-092","name":"RUEDA, MARCUS BELMONTE","team":"IE"},{"id":"IE-093","code":"IE-093","name":"RUEDA, NICOLE BELMONTE","team":"IE"},{"id":"IE-094","code":"IE-094","name":"TIAMSIM, LOREN JADE JANDUSAY","team":"IE"},{"id":"IE-095","code":"IE-095","name":"TORRES, SER JOAQUIN EMMANUEL DELA VEGA","team":"IE"},{"id":"IE-096","code":"IE-096","name":"TUIZA, LANZ ROBLES","team":"IE"},{"id":"IE-097","code":"IE-097","name":"VELASCO, PRINCE CHOLO MASAGNAY","team":"IE"},{"id":"CE-001","code":"CE-001","name":"ACLAN, SHAYNE PRANCESS E.","team":"CE"},{"id":"CE-002","code":"CE-002","name":"ACULA, MARY HONEY KAYE C.","team":"CE"},{"id":"CE-003","code":"CE-003","name":"AGUANTA, ALYSSA A.","team":"CE"},{"id":"CE-004","code":"CE-004","name":"ALBUFERA, RALF HOMER F.","team":"CE"},{"id":"CE-005","code":"CE-005","name":"ALCANTARA, LIAM GABRIEL L.","team":"CE"},{"id":"CE-006","code":"CE-006","name":"ALMEDA, MARIONNE C.","team":"CE"},{"id":"CE-007","code":"CE-007","name":"ALMONTE, YAEL GABRIEL S.","team":"CE"},{"id":"CE-008","code":"CE-008","name":"AMANTE, CYRA IYA A.","team":"CE"},{"id":"CE-009","code":"CE-009","name":"AMPER, DIVINE JOY B.","team":"CE"},{"id":"CE-010","code":"CE-010","name":"APOSTOL, APPLE-KRIS E.","team":"CE"},{"id":"CE-011","code":"CE-011","name":"AQUINO, JESSA MAE D.","team":"CE"},{"id":"CE-012","code":"CE-012","name":"ARABE, DOMINIC JAMES D.","team":"CE"},{"id":"CE-013","code":"CE-013","name":"ARBO, EVAN JEROME P.","team":"CE"},{"id":"CE-014","code":"CE-014","name":"ASUNCION, KRYSTAL CLAIRE L.","team":"CE"},{"id":"CE-015","code":"CE-015","name":"AVELLANO, FERLIONA C.","team":"CE"},{"id":"CE-016","code":"CE-016","name":"BALDERAMA, CHRISTIAN LLOYD B.","team":"CE"},{"id":"CE-017","code":"CE-017","name":"BALLESTEROS, KIRSTINE DOLL B.","team":"CE"},{"id":"CE-018","code":"CE-018","name":"BANSUELO, SHAINE LARA A.","team":"CE"},{"id":"CE-019","code":"CE-019","name":"BARREDO, JEWEL P.","team":"CE"},{"id":"CE-020","code":"CE-020","name":"BLAZA, ANGELICA LOURINE R.","team":"CE"},{"id":"CE-021","code":"CE-021","name":"BORLAGDATAN, REIGN ASHLEY P.","team":"CE"},{"id":"CE-022","code":"CE-022","name":"BREGANZA, JOHN LOYD R.","team":"CE"},{"id":"CE-023","code":"CE-023","name":"BUENAOBRA, MHICA S.","team":"CE"},{"id":"CE-024","code":"CE-024","name":"BUNDALIAN, KATHLEEN V.","team":"CE"},{"id":"CE-025","code":"CE-025","name":"CACAO, IRISH F.","team":"CE"},{"id":"CE-026","code":"CE-026","name":"CANCEJO, LORIE JANE M.","team":"CE"},{"id":"CE-027","code":"CE-027","name":"CAPIROSO, JEANIE AMBER L.","team":"CE"},{"id":"CE-028","code":"CE-028","name":"CASTRO, JEFFER KERBY M.","team":"CE"},{"id":"CE-029","code":"CE-029","name":"CLEMENTE, LERI ALEXANDRA S.","team":"CE"},{"id":"CE-030","code":"CE-030","name":"CONCEPCION, ROSELYN B.","team":"CE"},{"id":"CE-031","code":"CE-031","name":"CORDETA, LHORENCE BEIN M.","team":"CE"},{"id":"CE-032","code":"CE-032","name":"CORPUZ, JAZMIN MYKHAELA N.","team":"CE"},{"id":"CE-033","code":"CE-033","name":"COSICO, SOPHIA SANE A.","team":"CE"},{"id":"CE-034","code":"CE-034","name":"CRUZ, REI ANNE R.","team":"CE"},{"id":"CE-035","code":"CE-035","name":"CUBE, VAN JUZZEN SENA S.","team":"CE"},{"id":"CE-036","code":"CE-036","name":"CUÑADO, GIAN GABRIEL R.","team":"CE"},{"id":"CE-037","code":"CE-037","name":"DALISAY, APRIL CHARIZ C.","team":"CE"},{"id":"CE-038","code":"CE-038","name":"DALISAY, JOHN CHRIS P.","team":"CE"},{"id":"CE-039","code":"CE-039","name":"DE ALDAY, JOHN FLOYD A.","team":"CE"},{"id":"CE-040","code":"CE-040","name":"DE CASTRO, CHERRYANN L.","team":"CE"},{"id":"CE-041","code":"CE-041","name":"DE JUAN, SHAINE H.","team":"CE"},{"id":"CE-042","code":"CE-042","name":"DE LEON, KIM ALLAINE B.","team":"CE"},{"id":"CE-043","code":"CE-043","name":"DE MESA, LORAINNE P.","team":"CE"},{"id":"CE-044","code":"CE-044","name":"DEGULLADO, ANA MARIE G.","team":"CE"},{"id":"CE-045","code":"CE-045","name":"DELA CRUZ, CZARINAH BEATRICE C.","team":"CE"},{"id":"CE-046","code":"CE-046","name":"DELOS REYES, JOROSS MARK E.","team":"CE"},{"id":"CE-047","code":"CE-047","name":"DEMDAM, MARK GERALD F.","team":"CE"},{"id":"CE-048","code":"CE-048","name":"DICHOSO, JAMES RUSSEL R.","team":"CE"},{"id":"CE-049","code":"CE-049","name":"DOBLES II, ARTURO R.","team":"CE"},{"id":"CE-050","code":"CE-050","name":"DOSADO, CHLOE NICOLE A.","team":"CE"},{"id":"CE-051","code":"CE-051","name":"ENCANTO, GLYCEL R.","team":"CE"},{"id":"CE-052","code":"CE-052","name":"ENCARNACION, JASPER R.","team":"CE"},{"id":"CE-053","code":"CE-053","name":"ENRIQUEZ, MARK DAVE R.","team":"CE"},{"id":"CE-054","code":"CE-054","name":"ESCALANTE, FREDERICK ERVIN ALLEN T.","team":"CE"},{"id":"CE-055","code":"CE-055","name":"ESPINA, VENUS L.","team":"CE"},{"id":"CE-056","code":"CE-056","name":"EVANGELISTA, JOHN DOMINIC B.","team":"CE"},{"id":"CE-057","code":"CE-057","name":"FAMILARAN, PRINCE MHUEL B.","team":"CE"},{"id":"CE-058","code":"CE-058","name":"FERRER, DENNIS PIOLO D.","team":"CE"},{"id":"CE-059","code":"CE-059","name":"FIGUEROA, JUSTIN V.","team":"CE"},{"id":"CE-060","code":"CE-060","name":"FILIO, DANIEL S.","team":"CE"},{"id":"CE-061","code":"CE-061","name":"FLORES, MEL GIBSON L.","team":"CE"},{"id":"CE-062","code":"CE-062","name":"FLORORITA, DHONA MARIE A.","team":"CE"},{"id":"CE-063","code":"CE-063","name":"FRANCISCO, MARC JUSTINE B.","team":"CE"},{"id":"CE-064","code":"CE-064","name":"GALANG, SAMANTHA ADRIENNE Q.","team":"CE"},{"id":"CE-065","code":"CE-065","name":"GALINATO, LORENZO DUSTIN B.","team":"CE"},{"id":"CE-066","code":"CE-066","name":"GALIZA, TRISTAN HARVEY M.","team":"CE"},{"id":"CE-067","code":"CE-067","name":"GARBO, NIRAH S.","team":"CE"},{"id":"CE-068","code":"CE-068","name":"GARCIA, ELISHA RHEIN MULIMBAYAN M.","team":"CE"},{"id":"CE-069","code":"CE-069","name":"GARCIA, FRANCIS P.","team":"CE"},{"id":"CE-070","code":"CE-070","name":"GLINOGA, JHAY EL C.","team":"CE"},{"id":"CE-071","code":"CE-071","name":"GLIPO, CRISTINE NICOLE M.","team":"CE"},{"id":"CE-072","code":"CE-072","name":"GO, MIASHI I.","team":"CE"},{"id":"CE-073","code":"CE-073","name":"GRAPANI, LEEAN MAE T.","team":"CE"},{"id":"CE-074","code":"CE-074","name":"HAEL, MICHAEL CLARK C.","team":"CE"},{"id":"CE-075","code":"CE-075","name":"HAEL, EDMELYN D.","team":"CE"},{"id":"CE-076","code":"CE-076","name":"JAVIER, TRIXIE B.","team":"CE"},{"id":"CE-077","code":"CE-077","name":"JUANANE, LUIS JAN YVES M.","team":"CE"},{"id":"CE-078","code":"CE-078","name":"LABILLES, MARK DARYL R.","team":"CE"},{"id":"CE-079","code":"CE-079","name":"LAGDAMEN, MARK DADEN A.","team":"CE"},{"id":"CE-080","code":"CE-080","name":"LAGOC, EURIELLE CLAIRE L.","team":"CE"},{"id":"CE-081","code":"CE-081","name":"LAGRAZON, GIAN JUDD S.","team":"CE"},{"id":"CE-082","code":"CE-082","name":"LANSANGAN, JOHN DANIEL T.","team":"CE"},{"id":"CE-083","code":"CE-083","name":"LAPITAN, STEPHEN JACOB P.","team":"CE"},{"id":"CE-084","code":"CE-084","name":"LAVENTE, JUDY ANN A.","team":"CE"},{"id":"CE-085","code":"CE-085","name":"LAZARO, JARNIE CARL","team":"CE"},{"id":"CE-086","code":"CE-086","name":"LEYCANO, JAMEROS A.","team":"CE"},{"id":"CE-087","code":"CE-087","name":"LOGO, KERVIN JON N.","team":"CE"},{"id":"CE-088","code":"CE-088","name":"LOPEZ, JOHN CARLO C.","team":"CE"},{"id":"CE-089","code":"CE-089","name":"LOPEZ, JOHN HENRY B.","team":"CE"},{"id":"CE-090","code":"CE-090","name":"LUGTU, CHRYSTAL SAPPHIRE D.","team":"CE"},{"id":"CE-091","code":"CE-091","name":"LULU, AIRA LEI C.","team":"CE"},{"id":"CE-092","code":"CE-092","name":"LUMBRES, JEROME B.","team":"CE"},{"id":"CE-093","code":"CE-093","name":"LUTA, TRISHA SHANE","team":"CE"},{"id":"CE-094","code":"CE-094","name":"MACATOL, KESIA MAE A.","team":"CE"},{"id":"CE-095","code":"CE-095","name":"MAGTAN-AO, LOVELY B.","team":"CE"},{"id":"CE-096","code":"CE-096","name":"MANAIG, KURT ANDREI","team":"CE"},{"id":"CE-097","code":"CE-097","name":"MANAIG, ROBBIE D.","team":"CE"},{"id":"CE-098","code":"CE-098","name":"MARASIGAN, KURT AERRON P.","team":"CE"},{"id":"CE-099","code":"CE-099","name":"MARIANO, JOHN PAUL S.","team":"CE"},{"id":"CE-100","code":"CE-100","name":"MARTEJA, JAMES HECTOR G.","team":"CE"},{"id":"CE-101","code":"CE-101","name":"MAYOLA, JASPER D.","team":"CE"},{"id":"CE-102","code":"CE-102","name":"MELENDREZ, AIRISH JAMES M.","team":"CE"},{"id":"CE-103","code":"CE-103","name":"MENDOZA, ROLDAN L.","team":"CE"},{"id":"CE-104","code":"CE-104","name":"MERAÑA, LORAINE KISHA A.","team":"CE"},{"id":"CE-105","code":"CE-105","name":"MERILLES, JHARED A.","team":"CE"},{"id":"CE-106","code":"CE-106","name":"MERTO, HANNAH CES C.","team":"CE"},{"id":"CE-107","code":"CE-107","name":"MIRANDA, RANIEL Y.","team":"CE"},{"id":"CE-108","code":"CE-108","name":"MORADA, JHANELL SOPHIA B.","team":"CE"},{"id":"CE-109","code":"CE-109","name":"NACARIO, SOFIA MARIE A.","team":"CE"},{"id":"CE-110","code":"CE-110","name":"NAVARRO, GERALD JAMES O.","team":"CE"},{"id":"CE-111","code":"CE-111","name":"NAVARTE, JOSEPH ROEM E.","team":"CE"},{"id":"CE-112","code":"CE-112","name":"OCTAVIO, LEVIN JANE D.","team":"CE"},{"id":"CE-113","code":"CE-113","name":"ORTIZ, ELEUMAR NIMROD ITHEL T.","team":"CE"},{"id":"CE-114","code":"CE-114","name":"PALASIGUE, ANDREI C.","team":"CE"},{"id":"CE-115","code":"CE-115","name":"PANTERIA, SHANELLE B.","team":"CE"},{"id":"CE-116","code":"CE-116","name":"PASATIEMPO, TRICIA N.","team":"CE"},{"id":"CE-117","code":"CE-117","name":"PASTRANA, RENMAR C.","team":"CE"},{"id":"CE-118","code":"CE-118","name":"PEDIDA, KELLY ANNE E.","team":"CE"},{"id":"CE-119","code":"CE-119","name":"PEREZ, CEEJHAE D.","team":"CE"},{"id":"CE-120","code":"CE-120","name":"PEREZ, REAH MAE","team":"CE"},{"id":"CE-121","code":"CE-121","name":"PINEDA, RAISHELL B.","team":"CE"},{"id":"CE-122","code":"CE-122","name":"PISANTE, ERICA A.","team":"CE"},{"id":"CE-123","code":"CE-123","name":"RAFOL, REDGEM M.","team":"CE"},{"id":"CE-124","code":"CE-124","name":"RAMIREZ, JAYCEE D.","team":"CE"},{"id":"CE-125","code":"CE-125","name":"RAMOS, EARL JOSHUA E.","team":"CE"},{"id":"CE-126","code":"CE-126","name":"RAMOS, GLENN LEONARD C.","team":"CE"},{"id":"CE-127","code":"CE-127","name":"RAMOS, JANELLE F.","team":"CE"},{"id":"CE-128","code":"CE-128","name":"REBADEO, JHON RODNEY C.","team":"CE"},{"id":"CE-129","code":"CE-129","name":"REBLORA, JOHN NATHANIEL S.","team":"CE"},{"id":"CE-130","code":"CE-130","name":"REGONDOLA, MARIA ANDREA R.","team":"CE"},{"id":"CE-131","code":"CE-131","name":"RELENTE, JOSH KOJI L.","team":"CE"},{"id":"CE-132","code":"CE-132","name":"RELOJ, KARL ANDREI A.","team":"CE"},{"id":"CE-133","code":"CE-133","name":"REOGO, DRIZELLA JAYNE A.","team":"CE"},{"id":"CE-134","code":"CE-134","name":"RODRIGUEZ, RUSSEL P.","team":"CE"},{"id":"CE-135","code":"CE-135","name":"ROSARIO, LAURENZ JAMES I.","team":"CE"},{"id":"CE-136","code":"CE-136","name":"RUBILLA, VON LAUVIN J.","team":"CE"},{"id":"CE-137","code":"CE-137","name":"SALO, REIN SAM M.","team":"CE"},{"id":"CE-138","code":"CE-138","name":"SALVADOR, CARLOS IVAN N.","team":"CE"},{"id":"CE-139","code":"CE-139","name":"SANDOVAL, JOHN MICHAEL L.","team":"CE"},{"id":"CE-140","code":"CE-140","name":"SARDIDO, LARZ JENRIL R.","team":"CE"},{"id":"CE-141","code":"CE-141","name":"SECRETARIO, ELAIZA M.","team":"CE"},{"id":"CE-142","code":"CE-142","name":"SUBIA, CHIN AIKEE A.","team":"CE"},{"id":"CE-143","code":"CE-143","name":"TABION, RENDEL Q.","team":"CE"},{"id":"CE-144","code":"CE-144","name":"TAHAMIL, ARMANI M.","team":"CE"},{"id":"CE-145","code":"CE-145","name":"TAN, LORENCE DAVID R.","team":"CE"},{"id":"CE-146","code":"CE-146","name":"TEMPLONUEVO, NICOLE G.","team":"CE"},{"id":"CE-147","code":"CE-147","name":"TOLEDO, NICOLE P.","team":"CE"},{"id":"CE-148","code":"CE-148","name":"TORRECAMPO, CHRISTIAN ARON P.","team":"CE"},{"id":"CE-149","code":"CE-149","name":"TORRENDON, JASPHER M.","team":"CE"},{"id":"CE-150","code":"CE-150","name":"VILLA, DAISY ANN S.","team":"CE"},{"id":"CE-151","code":"CE-151","name":"VILLANUEVA, LUIS MIGUEL D.","team":"CE"},{"id":"CE-152","code":"CE-152","name":"YLAGAN, ADRIENNE G.","team":"CE"}] ;

const EDAYS_2026_ME_ROSTER = [{"id":"student-0001","code":"MEODL-0001","name":"ABSALUD, EDWARD KEEN TAGLE","team":"ME"},{"id":"student-0002","code":"MEODL-0002","name":"ALMORO, STEPHEN NASH GACILLOS","team":"ME"},{"id":"student-0003","code":"MEODL-0003","name":"ASPERIN, ENRIQUE ACLAN","team":"ME"},{"id":"student-0004","code":"MEODL-0004","name":"AUSTRIA, ANDREA RIVERA","team":"ME"},{"id":"student-0005","code":"MEODL-0005","name":"BANATIN, CRISTOFF JIMSON TEJERO","team":"ME"},{"id":"student-0006","code":"MEODL-0006","name":"BARBA III, DANILO MAYLON","team":"ME"},{"id":"student-0007","code":"MEODL-0007","name":"BOLA, AR-JAMES REMOROZA","team":"ME"},{"id":"student-0008","code":"MEODL-0008","name":"CAGANAN, JOHN CEDRIC TAMAYO","team":"ME"},{"id":"student-0009","code":"MEODL-0009","name":"CARANDANG, GABRIEL FLORES","team":"ME"},{"id":"student-0010","code":"MEODL-0010","name":"CHAMIAN, BRADEN CHOZAS","team":"ME"},{"id":"student-0011","code":"MEODL-0011","name":"CONTRERAS, KENDRICK ZABDIEL RECIO","team":"ME"},{"id":"student-0012","code":"MEODL-0012","name":"CREMEN, AMIR MCKALE DEL SOL","team":"ME"},{"id":"student-0013","code":"MEODL-0013","name":"DE JESUS, JOHN JERNIECHO TABUYO","team":"ME"},{"id":"student-0014","code":"MEODL-0014","name":"DEBLOLS, REDD YUAN MERILLES","team":"ME"},{"id":"student-0015","code":"MEODL-0015","name":"DIZON, LEE JHUDIEL ANGARA","team":"ME"},{"id":"student-0016","code":"MEODL-0016","name":"ECHAPARE, PRINCE MEINARD MARCELLANA","team":"ME"},{"id":"student-0017","code":"MEODL-0017","name":"ETORMA, CHRIS ADVIEN LIBELO","team":"ME"},{"id":"student-0018","code":"MEODL-0018","name":"FLORES, HABIB DHEREX","team":"ME"},{"id":"student-0019","code":"MEODL-0019","name":"FONTANILLA, LORDRYAN CLYDE MORANTE","team":"ME"},{"id":"student-0020","code":"MEODL-0020","name":"GALANG, MARK KIRBY MORES","team":"ME"},{"id":"student-0021","code":"MEODL-0021","name":"GARCELLANO, AUDREY CALVIN PRADO","team":"ME"},{"id":"student-0022","code":"MEODL-0022","name":"GARCIA, JOHN LEMUEL","team":"ME"},{"id":"student-0023","code":"MEODL-0023","name":"GARCIA, KERBY ORUGA","team":"ME"},{"id":"student-0024","code":"MEODL-0024","name":"GERVACIO, LJ DENISSE HERNANDEZ","team":"ME"},{"id":"student-0025","code":"MEODL-0025","name":"GRATE, STOFFEL JASEN PERALTA","team":"ME"},{"id":"student-0026","code":"MEODL-0026","name":"ILARDE, RAISEL BORROMEO","team":"ME"},{"id":"student-0027","code":"MEODL-0027","name":"JUAN, MARK CLARENCE HIPOS","team":"ME"},{"id":"student-0028","code":"MEODL-0028","name":"LAFORTEZA, SAMANTHA NICOLE GLIPONEO","team":"ME"},{"id":"student-0029","code":"MEODL-0029","name":"LAIT, MARWELL SELWIN JABONILLO","team":"ME"},{"id":"student-0030","code":"MEODL-0030","name":"LEONOR, JOHN ROVEE VERGARA","team":"ME"},{"id":"student-0031","code":"MEODL-0031","name":"MAGHANOY, DAVID JAN RUZZEL BUMAGAT","team":"ME"},{"id":"student-0032","code":"MEODL-0032","name":"MALIPOL, CARL JEAN NOEL LARIOS","team":"ME"},{"id":"student-0033","code":"MEODL-0033","name":"MALLARI, LOUISE ANDREY DACLIZON","team":"ME"},{"id":"student-0034","code":"MEODL-0034","name":"MANALASTAS, JAMES SERDAN","team":"ME"},{"id":"student-0035","code":"MEODL-0035","name":"MANALO, CHARLES JOSEPH GAMBOA","team":"ME"},{"id":"student-0036","code":"MEODL-0036","name":"MONTERO, JOSHUA TAPIA","team":"ME"},{"id":"student-0037","code":"MEODL-0037","name":"ORENSE, EMIL GABRIEL MANGILIN","team":"ME"},{"id":"student-0038","code":"MEODL-0038","name":"PACLIBAR, JOHN MICHAEL VILLARAZA","team":"ME"},{"id":"student-0039","code":"MEODL-0039","name":"PALICPIC, CHRIS JERICO MIRANDA","team":"ME"},{"id":"student-0040","code":"MEODL-0040","name":"PUA, LIAM AKIEM CARASUS","team":"ME"},{"id":"student-0041","code":"MEODL-0041","name":"PUBLICO, JOHN MICHAEL BANAAG","team":"ME"},{"id":"student-0042","code":"MEODL-0042","name":"PULGAR, ROWEN VICTOR CUBILE","team":"ME"},{"id":"student-0043","code":"MEODL-0043","name":"QUIRANTE, SHIANELA BALANAY","team":"ME"},{"id":"student-0044","code":"MEODL-0044","name":"RIPO, RENZ ALJUN DOMINGUEZ","team":"ME"},{"id":"student-0045","code":"MEODL-0045","name":"SALIBA, GIAN KARLO BRAGADO","team":"ME"},{"id":"student-0046","code":"MEODL-0046","name":"SAN PASCUAL, JAMES DOMINIC TADONG","team":"ME"},{"id":"student-0047","code":"MEODL-0047","name":"SANTOS, KARL ANGELO DIAGO","team":"ME"},{"id":"student-0048","code":"MEODL-0048","name":"TALASTASIN, ALHJHON ANCHETA","team":"ME"},{"id":"student-0049","code":"MEODL-0049","name":"TAYAG, JAYSON BARQUILLA","team":"ME"},{"id":"student-0050","code":"MEODL-0050","name":"TEJERO, ARCH RYLER LOZADA","team":"ME"},{"id":"student-0051","code":"MEODL-0051","name":"TIZON, THEO DAN GHERICK MERALPES","team":"ME"},{"id":"student-0052","code":"MEODL-0052","name":"TULUD, MARCOS JOHN BONSO","team":"ME"},{"id":"student-0053","code":"MEODL-0053","name":"TURAJA, VIEN XYRILLE SANGALANG","team":"ME"},{"id":"student-0054","code":"MEODL-0054","name":"VILLAPANDO, RUSSEL THOMSON C.","team":"ME"},{"id":"student-0055","code":"MEODL-0055","name":"ZUÑIGA, KENNETH JOHN RIVEL","team":"ME"},{"id":"student-0056","code":"MEODL-0056","name":"ABERDE, NOMEL ACE CERBO","team":"ME"},{"id":"student-0057","code":"MEODL-0057","name":"ALGIRE, JEROME DAVE DEVOMA","team":"ME"},{"id":"student-0058","code":"MEODL-0058","name":"ALMORO, AERON JAMES PALENTINOS","team":"ME"},{"id":"student-0059","code":"MEODL-0059","name":"ASI, JOSH EROLD GOPOLLA","team":"ME"},{"id":"student-0060","code":"MEODL-0060","name":"CANA, AARON JAY CONDALOR","team":"ME"},{"id":"student-0061","code":"MEODL-0061","name":"CONTRERAS, CHAUNCEY DRE MALAPITAN","team":"ME"},{"id":"student-0062","code":"MEODL-0062","name":"DELA VIÑA, RHYME SOLAMO","team":"ME"},{"id":"student-0063","code":"MEODL-0063","name":"ELAURIA, JYMNASH CZAR ENDOZO","team":"ME"},{"id":"student-0064","code":"MEODL-0064","name":"ERJAS, CARL ANTHONY LAMAR","team":"ME"},{"id":"student-0065","code":"MEODL-0065","name":"ESPINA, CARL DUSTIN INOC","team":"ME"},{"id":"student-0066","code":"MEODL-0066","name":"GARCIA, JAMES ANDREW","team":"ME"},{"id":"student-0067","code":"MEODL-0067","name":"GAVINO, JHON RAVEN","team":"ME"},{"id":"student-0068","code":"MEODL-0068","name":"GLIPONEO, PRINCESS KYLE GUIM","team":"ME"},{"id":"student-0069","code":"MEODL-0069","name":"HERNANDEZ, NATHANIEL TUÑACAO","team":"ME"},{"id":"student-0070","code":"MEODL-0070","name":"HODRIAL, ALLEN VINCE CEDRO","team":"ME"},{"id":"student-0071","code":"MEODL-0071","name":"LACORTE, JOHN LAWRENCE DELATADO","team":"ME"},{"id":"student-0072","code":"MEODL-0072","name":"LIMBO, MARK REGIE ASISTIDO","team":"ME"},{"id":"student-0073","code":"MEODL-0073","name":"LLAMZON, ZYMON HILL PASCUAL","team":"ME"},{"id":"student-0074","code":"MEODL-0074","name":"MANZANILLA, BRIXTER JOSEPH GONZALES","team":"ME"},{"id":"student-0075","code":"MEODL-0075","name":"MATUNDAN, KHAEOUS AERAY COLLADO","team":"ME"},{"id":"student-0076","code":"MEODL-0076","name":"MIRASOL, MARTIN NEIL LAQUINDANUM","team":"ME"},{"id":"student-0077","code":"MEODL-0077","name":"NERO, GABBIELLE CACAL","team":"ME"},{"id":"student-0078","code":"MEODL-0078","name":"NUNO, RON EXEQUIEL","team":"ME"},{"id":"student-0079","code":"MEODL-0079","name":"OBLIPIAS, ZIGGY SABDAO","team":"ME"},{"id":"student-0080","code":"MEODL-0080","name":"OLINO, JOPETH ORBESO","team":"ME"},{"id":"student-0081","code":"MEODL-0081","name":"OLIQUINO, CHRISTIAN ARROYO","team":"ME"},{"id":"student-0082","code":"MEODL-0082","name":"ONTE, RAFAEL PAMPLONA","team":"ME"},{"id":"student-0083","code":"MEODL-0083","name":"PEÑA, CARLOS MIGUEL ANTIDO","team":"ME"},{"id":"student-0084","code":"MEODL-0084","name":"PRADO, JOHN LENRICK TABERNILLA","team":"ME"},{"id":"student-0085","code":"MEODL-0085","name":"QUILAO, LORD JOHN LUMACAD","team":"ME"},{"id":"student-0086","code":"MEODL-0086","name":"REAL, JILLIAN CAÑUBAS","team":"ME"},{"id":"student-0087","code":"MEODL-0087","name":"RUTAQUIO, BENEDICT GUCILATAR","team":"ME"},{"id":"student-0088","code":"MEODL-0088","name":"SALON, JAN MIKHAIL FORTUNO","team":"ME"},{"id":"student-0089","code":"MEODL-0089","name":"SANTOS, KARYLLE JOY SADIA","team":"ME"},{"id":"student-0090","code":"MEODL-0090","name":"TAGUIAM, JAE HARVEY BALASTA","team":"ME"},{"id":"student-0091","code":"MEODL-0091","name":"TALATALA, REIN EISEN BANDOLA","team":"ME"},{"id":"student-0092","code":"MEODL-0092","name":"ALVAREZ, VANNA JENILLE ROCCO","team":"ME"},{"id":"student-0093","code":"MEODL-0093","name":"ARGAÑOSA, RYU EMANUEL DELA CRUZ","team":"ME"},{"id":"student-0094","code":"MEODL-0094","name":"BAÑEZ, JOSEL DE CASTRO","team":"ME"},{"id":"student-0095","code":"MEODL-0095","name":"BARLETA, BRYANT DOCTORA","team":"ME"},{"id":"student-0096","code":"MEODL-0096","name":"BENGCO, EPHRAIM RICK REYES","team":"ME"},{"id":"student-0097","code":"MEODL-0097","name":"CABUCO, ZEDRICK CABANIG","team":"ME"},{"id":"student-0098","code":"MEODL-0098","name":"CAJUCOM, AEROL JOHN MARASIGAN","team":"ME"},{"id":"student-0099","code":"MEODL-0099","name":"CARLOS, KING ARDEE NHEL FLORES","team":"ME"},{"id":"student-0100","code":"MEODL-0100","name":"CATLI, JIJAH KARAN CAAGBAY","team":"ME"},{"id":"student-0101","code":"MEODL-0101","name":"DADIS, JARUZZ LANCELOT LAXAMANA","team":"ME"},{"id":"student-0102","code":"MEODL-0102","name":"DANTE, KEN-ZY RACHO","team":"ME"},{"id":"student-0103","code":"MEODL-0103","name":"DE JURAS, IVAN DICHOSO","team":"ME"},{"id":"student-0104","code":"MEODL-0104","name":"DELA ROSA, KEN ALVIN ULEP","team":"ME"},{"id":"student-0105","code":"MEODL-0105","name":"DIMAPILIS, EIDRIAN ROA","team":"ME"},{"id":"student-0106","code":"MEODL-0106","name":"ESTRELLADO, GABRIELLE LANCE MALALUAN","team":"ME"},{"id":"student-0107","code":"MEODL-0107","name":"GLOVO, RISTY AGULLANO","team":"ME"},{"id":"student-0108","code":"MEODL-0108","name":"MARTINEZ, JAY MAR ROMERO","team":"ME"},{"id":"student-0109","code":"MEODL-0109","name":"MEJILLA, JEDIMAR MAGLANGIT","team":"ME"},{"id":"student-0110","code":"MEODL-0110","name":"MERABE, PRINCE ANDEL RODRIGUEZ","team":"ME"},{"id":"student-0111","code":"MEODL-0111","name":"MILAR, EARL JOHN FEDILES","team":"ME"},{"id":"student-0112","code":"MEODL-0112","name":"MIRONES, GIANN CARLO ORTIZ","team":"ME"},{"id":"student-0113","code":"MEODL-0113","name":"OCBINA, ANTHONY REYES","team":"ME"},{"id":"student-0114","code":"MEODL-0114","name":"OPINIO, EDMEL JOHN CONDE","team":"ME"},{"id":"student-0115","code":"MEODL-0115","name":"PEREY, LUIS EMMANUEL MARASIGAN","team":"ME"},{"id":"student-0116","code":"MEODL-0116","name":"QUILITIS, VINCE ALJOE ROBLES","team":"ME"},{"id":"student-0117","code":"MEODL-0117","name":"RECIO, JHEZRIEL EDWARD FLORES","team":"ME"},{"id":"student-0118","code":"MEODL-0118","name":"REYES, LEILA MAY LABACO","team":"ME"},{"id":"student-0119","code":"MEODL-0119","name":"SANDOVAL, EDWARD SOLOMON ALVAREZ","team":"ME"},{"id":"student-0120","code":"MEODL-0120","name":"SEÑEREZ, KYLE CYRIS LLANTO","team":"ME"},{"id":"student-0121","code":"MEODL-0121","name":"TAJAO, PAUL ALDREY BARENG","team":"ME"},{"id":"student-0122","code":"MEODL-0122","name":"TORRES, JAMES CARLOS LAGDAAN","team":"ME"},{"id":"student-0123","code":"MEODL-0123","name":"VASQUEZ, JEPTHAH AGUILA","team":"ME"},{"id":"student-0124","code":"MEODL-0124","name":"YABUT, ASHLEY KURT BERMILLO","team":"ME"},{"id":"student-0125","code":"MEODL-0125","name":"AÑONUEVO, CHRIS","team":"ME"},{"id":"student-0126","code":"MEODL-0126","name":"ATIENZA, MATHEW GARCIA","team":"ME"},{"id":"student-0127","code":"MEODL-0127","name":"BALLESTEROS, MARK ANDERSEN TANDOC","team":"ME"},{"id":"student-0128","code":"MEODL-0128","name":"BANDIOLA, JOHN MARC TORRES","team":"ME"},{"id":"student-0129","code":"MEODL-0129","name":"BARCARSE, SEALTIEL UZZIEL LEGASPI","team":"ME"},{"id":"student-0130","code":"MEODL-0130","name":"BARONIA, JOHN RICHIE DIAZ","team":"ME"},{"id":"student-0131","code":"MEODL-0131","name":"BAYLON, JUSTINE IAN BANAWA","team":"ME"},{"id":"student-0132","code":"MEODL-0132","name":"CAGANAN, JOHN CEDRIC TAMAYO","team":"ME"},{"id":"student-0133","code":"MEODL-0133","name":"CALARA, TYRON JOEL VINOYA","team":"ME"},{"id":"student-0134","code":"MEODL-0134","name":"CAPERARE, CYRUS CESAR MAGAHIS","team":"ME"},{"id":"student-0135","code":"MEODL-0135","name":"CARANIWAN, RHODYLIE KIANA LUNA","team":"ME"},{"id":"student-0136","code":"MEODL-0136","name":"CAYAYAN, LANCE RUSSEL SUMICAD","team":"ME"},{"id":"student-0137","code":"MEODL-0137","name":"CEDALLA, JOHN LESTER HERNANDEZ","team":"ME"},{"id":"student-0138","code":"MEODL-0138","name":"CONVENTO, ADRIAN JAMES LADIA","team":"ME"},{"id":"student-0139","code":"MEODL-0139","name":"DE MESA, ANNA LOREN TUSCANO","team":"ME"},{"id":"student-0140","code":"MEODL-0140","name":"DE TORRES, JAMES IMMANUEL ASILO","team":"ME"},{"id":"student-0141","code":"MEODL-0141","name":"DELA CRUZ, JOHN RINGGO ADELINO","team":"ME"},{"id":"student-0142","code":"MEODL-0142","name":"DELA TORRE, JERALD ROBEL","team":"ME"},{"id":"student-0143","code":"MEODL-0143","name":"DESCALLAR, JOHN PAUL TRAJANO","team":"ME"},{"id":"student-0144","code":"MEODL-0144","name":"ELEFANE, DANAH VALERIE MORALES","team":"ME"},{"id":"student-0145","code":"MEODL-0145","name":"ENRIQUEZ, RAE SHERIZ NECESITO","team":"ME"},{"id":"student-0146","code":"MEODL-0146","name":"EVASCO, ONIMUS AMIR SANCHEZ","team":"ME"},{"id":"student-0147","code":"MEODL-0147","name":"FAJARDO, KING ZHAREN MAMALAYAN","team":"ME"},{"id":"student-0148","code":"MEODL-0148","name":"FAMINIAL, EARL VINCENT MAZO","team":"ME"},{"id":"student-0149","code":"MEODL-0149","name":"FERNANDEZ, NATHANIEL FRANCISCO","team":"ME"},{"id":"student-0150","code":"MEODL-0150","name":"FRANCISCO, RIDJY VILLARIN","team":"ME"},{"id":"student-0151","code":"MEODL-0151","name":"GALANG, KOBIE CONSTANTINE CAPILOS","team":"ME"},{"id":"student-0152","code":"MEODL-0152","name":"JAVIER, DENZEL JOHN LIMSON","team":"ME"},{"id":"student-0153","code":"MEODL-0153","name":"LABRADOR, JOHN PAUL PLASTINAA","team":"ME"},{"id":"student-0154","code":"MEODL-0154","name":"LUMINATE, JIETHER SALMORIN","team":"ME"},{"id":"student-0155","code":"MEODL-0155","name":"MADRONA, CARLOS MIGUEL BANAL","team":"ME"},{"id":"student-0156","code":"MEODL-0156","name":"MAÑEBO, KEITH RUSSELL ALVAREZ","team":"ME"},{"id":"student-0157","code":"MEODL-0157","name":"MARAÑA, RICK JAMES EVANGELISTA","team":"ME"},{"id":"student-0158","code":"MEODL-0158","name":"MARASIGAN, KEMP JOHN RACEL RAMOS","team":"ME"},{"id":"student-0159","code":"MEODL-0159","name":"MESINA, CEDRICK BALLARAN","team":"ME"},{"id":"student-0160","code":"MEODL-0160","name":"MOLDEZ, CARMELO CUNANAN","team":"ME"},{"id":"student-0161","code":"MEODL-0161","name":"ORENSE, EMIL GABRIEL MANGILIN","team":"ME"},{"id":"student-0162","code":"MEODL-0162","name":"PADUGA, EARL JUSTINE ESPELETA","team":"ME"},{"id":"student-0163","code":"MEODL-0163","name":"PAMPLONA, JAMES ADRIAN ENRIQUEZ","team":"ME"},{"id":"student-0164","code":"MEODL-0164","name":"PAYO, DYLAN ATIENZA","team":"ME"},{"id":"student-0165","code":"MEODL-0165","name":"PAYO, PATRICK DANIEL CASTILLO","team":"ME"},{"id":"student-0166","code":"MEODL-0166","name":"QUINTOS, LANCE KENNETH VICTA","team":"ME"},{"id":"student-0167","code":"MEODL-0167","name":"RAMOS, RED MATTHEW DE LEON","team":"ME"},{"id":"student-0168","code":"MEODL-0168","name":"RAPSING, EARL CONTRERAS","team":"ME"},{"id":"student-0169","code":"MEODL-0169","name":"RODIS, CLIFFORD ULLYSSES CASTOR","team":"ME"},{"id":"student-0170","code":"MEODL-0170","name":"SONGALLA, EZEKIEL JENNEL PENIDA","team":"ME"},{"id":"student-0171","code":"MEODL-0171","name":"STEVENS, GILBERT CARAAN","team":"ME"},{"id":"student-0172","code":"MEODL-0172","name":"SUYAT, RYAN BANCORO","team":"ME"},{"id":"student-0173","code":"MEODL-0173","name":"TALAY, SIMON JOHN ASISTORES","team":"ME"},{"id":"student-0174","code":"MEODL-0174","name":"TAN, TYRON JAMES","team":"ME"},{"id":"student-0175","code":"MEODL-0175","name":"VILLACERAN, EMMUEL ROI RIVERA","team":"ME"},{"id":"custom_stu_999","code":"2026-CPE-999","name":"DELA CRUZ, ENGR","team":"ME"},{"id":"stu_2026-ece-777","code":"2026-ECE-777","name":"SANTOS, MARIA","team":"ME"}] ;


function ensureFullMasterRoster(targetStudentsMap, sessionsList) {
  if (!targetStudentsMap || typeof targetStudentsMap !== 'object') {
    targetStudentsMap = {};
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

if (typeof window !== 'undefined') {
  window.EDAYS_2026_ADDITIONAL_ROSTER = EDAYS_2026_ADDITIONAL_ROSTER;
  window.EDAYS_2026_ME_ROSTER = EDAYS_2026_ME_ROSTER;
  window.EDAYS_2026_MASTER_ROSTER = [...EDAYS_2026_ME_ROSTER, ...EDAYS_2026_ADDITIONAL_ROSTER];
  window.ensureFullMasterRoster = ensureFullMasterRoster;
}

window.MEODL_DATA = {
  "rosterVersion": "2026-EDAYS-588",
  "rosterSeedKey": "2026-EDAYS-588",
  "teams": [
    {
      "id": "me",
      "name": "MECHANICAL ENGINEERING",
      "shortCode": "ME",
      "color": "red",
      "hex": "#ef4444",
      "badgeBg": "bg-rose-950/80",
      "badgeText": "text-rose-400",
      "badgeBorder": "border-rose-700/80",
      "icon": "⚙️",
      "count": 175
    },
    {
      "id": "ee",
      "name": "ELECTRICAL ENGINEERING",
      "shortCode": "EE",
      "color": "emerald",
      "hex": "#10b981",
      "badgeBg": "bg-emerald-950/80",
      "badgeText": "text-emerald-400",
      "badgeBorder": "border-emerald-700/80",
      "icon": "⚡",
      "count": 92
    },
    {
      "id": "cpe",
      "name": "COMPUTER ENGINEERING",
      "shortCode": "CPE",
      "color": "sky",
      "hex": "#0ea5e9",
      "badgeBg": "bg-sky-950/80",
      "badgeText": "text-sky-400",
      "badgeBorder": "border-sky-700/80",
      "icon": "💻",
      "count": 61
    },
    {
      "id": "ece",
      "name": "ELECTRONICS ENGINEERING",
      "shortCode": "ECE",
      "color": "violet",
      "hex": "#8b5cf6",
      "badgeBg": "bg-violet-950/80",
      "badgeText": "text-violet-400",
      "badgeBorder": "border-violet-700/80",
      "icon": "📡",
      "count": 11
    },
    {
      "id": "ie",
      "name": "INDUSTRIAL ENGINEERING",
      "shortCode": "IE",
      "color": "amber",
      "hex": "#f59e0b",
      "badgeBg": "bg-amber-950/80",
      "badgeText": "text-amber-400",
      "badgeBorder": "border-amber-700/80",
      "icon": "🏭",
      "count": 97
    },
    {
      "id": "ce",
      "name": "CIVIL ENGINEERING",
      "shortCode": "CE",
      "color": "cyan",
      "hex": "#06b6d4",
      "badgeBg": "bg-cyan-950/80",
      "badgeText": "text-cyan-400",
      "badgeBorder": "border-cyan-700/80",
      "icon": "🏗️",
      "count": 152
    }
  ],
  "rosters": {
    "ME": [
      "ABSALUD, EDWARD KEEN TAGLE",
      "ALMORO, STEPHEN NASH GACILLOS",
      "ASPERIN, ENRIQUE ACLAN",
      "AUSTRIA, ANDREA RIVERA",
      "BANATIN, CRISTOFF JIMSON TEJERO",
      "BARBA III, DANILO MAYLON",
      "BOLA, AR-JAMES REMOROZA",
      "CAGANAN, JOHN CEDRIC TAMAYO",
      "CARANDANG, GABRIEL FLORES",
      "CHAMIAN, BRADEN CHOZAS",
      "CONTRERAS, KENDRICK ZABDIEL RECIO",
      "CREMEN, AMIR MCKALE DEL SOL",
      "DE JESUS, JOHN JERNIECHO TABUYO",
      "DEBLOLS, REDD YUAN MERILLES",
      "DIZON, LEE JHUDIEL ANGARA",
      "ECHAPARE, PRINCE MEINARD MARCELLANA",
      "ETORMA, CHRIS ADVIEN LIBELO",
      "FLORES, HABIB DHEREX",
      "FONTANILLA, LORDRYAN CLYDE MORANTE",
      "GALANG, MARK KIRBY MORES",
      "GARCELLANO, AUDREY CALVIN PRADO",
      "GARCIA, JOHN LEMUEL",
      "GARCIA, KERBY ORUGA",
      "GERVACIO, LJ DENISSE HERNANDEZ",
      "GRATE, STOFFEL JASEN PERALTA",
      "ILARDE, RAISEL BORROMEO",
      "JUAN, MARK CLARENCE HIPOS",
      "LAFORTEZA, SAMANTHA NICOLE GLIPONEO",
      "LAIT, MARWELL SELWIN JABONILLO",
      "LEONOR, JOHN ROVEE VERGARA",
      "MAGHANOY, DAVID JAN RUZZEL BUMAGAT",
      "MALIPOL, CARL JEAN NOEL LARIOS",
      "MALLARI, LOUISE ANDREY DACLIZON",
      "MANALASTAS, JAMES SERDAN",
      "MANALO, CHARLES JOSEPH GAMBOA",
      "MONTERO, JOSHUA TAPIA",
      "ORENSE, EMIL GABRIEL MANGILIN",
      "PACLIBAR, JOHN MICHAEL VILLARAZA",
      "PALICPIC, CHRIS JERICO MIRANDA",
      "PUA, LIAM AKIEM CARASUS",
      "PUBLICO, JOHN MICHAEL BANAAG",
      "PULGAR, ROWEN VICTOR CUBILE",
      "QUIRANTE, SHIANELA BALANAY",
      "RIPO, RENZ ALJUN DOMINGUEZ",
      "SALIBA, GIAN KARLO BRAGADO",
      "SAN PASCUAL, JAMES DOMINIC TADONG",
      "SANTOS, KARL ANGELO DIAGO",
      "TALASTASIN, ALHJHON ANCHETA",
      "TAYAG, JAYSON BARQUILLA",
      "TEJERO, ARCH RYLER LOZADA",
      "TIZON, THEO DAN GHERICK MERALPES",
      "TULUD, MARCOS JOHN BONSO",
      "TURAJA, VIEN XYRILLE SANGALANG",
      "VILLAPANDO, RUSSEL THOMSON C.",
      "ZUÑIGA, KENNETH JOHN RIVEL",
      "ABERDE, NOMEL ACE CERBO",
      "ALGIRE, JEROME DAVE DEVOMA",
      "ALMORO, AERON JAMES PALENTINOS",
      "ASI, JOSH EROLD GOPOLLA",
      "CANA, AARON JAY CONDALOR",
      "CONTRERAS, CHAUNCEY DRE MALAPITAN",
      "DELA VIÑA, RHYME SOLAMO",
      "ELAURIA, JYMNASH CZAR ENDOZO",
      "ERJAS, CARL ANTHONY LAMAR",
      "ESPINA, CARL DUSTIN INOC",
      "GARCIA, JAMES ANDREW",
      "GAVINO, JHON RAVEN",
      "GLIPONEO, PRINCESS KYLE GUIM",
      "HERNANDEZ, NATHANIEL TUÑACAO",
      "HODRIAL, ALLEN VINCE CEDRO",
      "LACORTE, JOHN LAWRENCE DELATADO",
      "LIMBO, MARK REGIE ASISTIDO",
      "LLAMZON, ZYMON HILL PASCUAL",
      "MANZANILLA, BRIXTER JOSEPH GONZALES",
      "MATUNDAN, KHAEOUS AERAY COLLADO",
      "MIRASOL, MARTIN NEIL LAQUINDANUM",
      "NERO, GABBIELLE CACAL",
      "NUNO, RON EXEQUIEL",
      "OBLIPIAS, ZIGGY SABDAO",
      "OLINO, JOPETH ORBESO",
      "OLIQUINO, CHRISTIAN ARROYO",
      "ONTE, RAFAEL PAMPLONA",
      "PEÑA, CARLOS MIGUEL ANTIDO",
      "PRADO, JOHN LENRICK TABERNILLA",
      "QUILAO, LORD JOHN LUMACAD",
      "REAL, JILLIAN CAÑUBAS",
      "RUTAQUIO, BENEDICT GUCILATAR",
      "SALON, JAN MIKHAIL FORTUNO",
      "SANTOS, KARYLLE JOY SADIA",
      "TAGUIAM, JAE HARVEY BALASTA",
      "TALATALA, REIN EISEN BANDOLA",
      "ALVAREZ, VANNA JENILLE ROCCO",
      "ARGAÑOSA, RYU EMANUEL DELA CRUZ",
      "BAÑEZ, JOSEL DE CASTRO",
      "BARLETA, BRYANT DOCTORA",
      "BENGCO, EPHRAIM RICK REYES",
      "CABUCO, ZEDRICK CABANIG",
      "CAJUCOM, AEROL JOHN MARASIGAN",
      "CARLOS, KING ARDEE NHEL FLORES",
      "CATLI, JIJAH KARAN CAAGBAY",
      "DADIS, JARUZZ LANCELOT LAXAMANA",
      "DANTE, KEN-ZY RACHO",
      "DE JURAS, IVAN DICHOSO",
      "DELA ROSA, KEN ALVIN ULEP",
      "DIMAPILIS, EIDRIAN ROA",
      "ESTRELLADO, GABRIELLE LANCE MALALUAN",
      "GLOVO, RISTY AGULLANO",
      "MARTINEZ, JAY MAR ROMERO",
      "MEJILLA, JEDIMAR MAGLANGIT",
      "MERABE, PRINCE ANDEL RODRIGUEZ",
      "MILAR, EARL JOHN FEDILES",
      "MIRONES, GIANN CARLO ORTIZ",
      "OCBINA, ANTHONY REYES",
      "OPINIO, EDMEL JOHN CONDE",
      "PEREY, LUIS EMMANUEL MARASIGAN",
      "QUILITIS, VINCE ALJOE ROBLES",
      "RECIO, JHEZRIEL EDWARD FLORES",
      "REYES, LEILA MAY LABACO",
      "SANDOVAL, EDWARD SOLOMON ALVAREZ",
      "SEÑEREZ, KYLE CYRIS LLANTO",
      "TAJAO, PAUL ALDREY BARENG",
      "TORRES, JAMES CARLOS LAGDAAN",
      "VASQUEZ, JEPTHAH AGUILA",
      "YABUT, ASHLEY KURT BERMILLO",
      "AÑONUEVO, CHRIS",
      "ATIENZA, MATHEW GARCIA",
      "BALLESTEROS, MARK ANDERSEN TANDOC",
      "BANDIOLA, JOHN MARC TORRES",
      "BARCARSE, SEALTIEL UZZIEL LEGASPI",
      "BARONIA, JOHN RICHIE DIAZ",
      "BAYLON, JUSTINE IAN BANAWA",
      "CAGANAN, JOHN CEDRIC TAMAYO",
      "CALARA, TYRON JOEL VINOYA",
      "CAPERARE, CYRUS CESAR MAGAHIS",
      "CARANIWAN, RHODYLIE KIANA LUNA",
      "CAYAYAN, LANCE RUSSEL SUMICAD",
      "CEDALLA, JOHN LESTER HERNANDEZ",
      "CONVENTO, ADRIAN JAMES LADIA",
      "DE MESA, ANNA LOREN TUSCANO",
      "DE TORRES, JAMES IMMANUEL ASILO",
      "DELA CRUZ, JOHN RINGGO ADELINO",
      "DELA TORRE, JERALD ROBEL",
      "DESCALLAR, JOHN PAUL TRAJANO",
      "ELEFANE, DANAH VALERIE MORALES",
      "ENRIQUEZ, RAE SHERIZ NECESITO",
      "EVASCO, ONIMUS AMIR SANCHEZ",
      "FAJARDO, KING ZHAREN MAMALAYAN",
      "FAMINIAL, EARL VINCENT MAZO",
      "FERNANDEZ, NATHANIEL FRANCISCO",
      "FRANCISCO, RIDJY VILLARIN",
      "GALANG, KOBIE CONSTANTINE CAPILOS",
      "JAVIER, DENZEL JOHN LIMSON",
      "LABRADOR, JOHN PAUL PLASTINAA",
      "LUMINATE, JIETHER SALMORIN",
      "MADRONA, CARLOS MIGUEL BANAL",
      "MAÑEBO, KEITH RUSSELL ALVAREZ",
      "MARAÑA, RICK JAMES EVANGELISTA",
      "MARASIGAN, KEMP JOHN RACEL RAMOS",
      "MESINA, CEDRICK BALLARAN",
      "MOLDEZ, CARMELO CUNANAN",
      "ORENSE, EMIL GABRIEL MANGILIN",
      "PADUGA, EARL JUSTINE ESPELETA",
      "PAMPLONA, JAMES ADRIAN ENRIQUEZ",
      "PAYO, DYLAN ATIENZA",
      "PAYO, PATRICK DANIEL CASTILLO",
      "QUINTOS, LANCE KENNETH VICTA",
      "RAMOS, RED MATTHEW DE LEON",
      "RAPSING, EARL CONTRERAS",
      "RODIS, CLIFFORD ULLYSSES CASTOR",
      "SONGALLA, EZEKIEL JENNEL PENIDA",
      "STEVENS, GILBERT CARAAN",
      "SUYAT, RYAN BANCORO",
      "TALAY, SIMON JOHN ASISTORES",
      "TAN, TYRON JAMES",
      "VILLACERAN, EMMUEL ROI RIVERA"
    ],
    "RANKINE": [
      "ABSALUD, EDWARD KEEN TAGLE",
      "ALMORO, STEPHEN NASH GACILLOS",
      "ASPERIN, ENRIQUE ACLAN",
      "AUSTRIA, ANDREA RIVERA",
      "BANATIN, CRISTOFF JIMSON TEJERO",
      "BARBA III, DANILO MAYLON",
      "BOLA, AR-JAMES REMOROZA",
      "CAGANAN, JOHN CEDRIC TAMAYO",
      "CARANDANG, GABRIEL FLORES",
      "CHAMIAN, BRADEN CHOZAS",
      "CONTRERAS, KENDRICK ZABDIEL RECIO",
      "CREMEN, AMIR MCKALE DEL SOL",
      "DE JESUS, JOHN JERNIECHO TABUYO",
      "DEBLOLS, REDD YUAN MERILLES",
      "DIZON, LEE JHUDIEL ANGARA",
      "ECHAPARE, PRINCE MEINARD MARCELLANA",
      "ETORMA, CHRIS ADVIEN LIBELO",
      "FLORES, HABIB DHEREX",
      "FONTANILLA, LORDRYAN CLYDE MORANTE",
      "GALANG, MARK KIRBY MORES",
      "GARCELLANO, AUDREY CALVIN PRADO",
      "GARCIA, JOHN LEMUEL",
      "GARCIA, KERBY ORUGA",
      "GERVACIO, LJ DENISSE HERNANDEZ",
      "GRATE, STOFFEL JASEN PERALTA",
      "ILARDE, RAISEL BORROMEO",
      "JUAN, MARK CLARENCE HIPOS",
      "LAFORTEZA, SAMANTHA NICOLE GLIPONEO",
      "LAIT, MARWELL SELWIN JABONILLO",
      "LEONOR, JOHN ROVEE VERGARA",
      "MAGHANOY, DAVID JAN RUZZEL BUMAGAT",
      "MALIPOL, CARL JEAN NOEL LARIOS",
      "MALLARI, LOUISE ANDREY DACLIZON",
      "MANALASTAS, JAMES SERDAN",
      "MANALO, CHARLES JOSEPH GAMBOA",
      "MONTERO, JOSHUA TAPIA",
      "ORENSE, EMIL GABRIEL MANGILIN",
      "PACLIBAR, JOHN MICHAEL VILLARAZA",
      "PALICPIC, CHRIS JERICO MIRANDA",
      "PUA, LIAM AKIEM CARASUS",
      "PUBLICO, JOHN MICHAEL BANAAG",
      "PULGAR, ROWEN VICTOR CUBILE",
      "QUIRANTE, SHIANELA BALANAY",
      "RIPO, RENZ ALJUN DOMINGUEZ",
      "SALIBA, GIAN KARLO BRAGADO",
      "SAN PASCUAL, JAMES DOMINIC TADONG",
      "SANTOS, KARL ANGELO DIAGO",
      "TALASTASIN, ALHJHON ANCHETA",
      "TAYAG, JAYSON BARQUILLA",
      "TEJERO, ARCH RYLER LOZADA",
      "TIZON, THEO DAN GHERICK MERALPES",
      "TULUD, MARCOS JOHN BONSO",
      "TURAJA, VIEN XYRILLE SANGALANG",
      "VILLAPANDO, RUSSEL THOMSON C.",
      "ZUÑIGA, KENNETH JOHN RIVEL"
    ],
    "OTTO": [
      "ABERDE, NOMEL ACE CERBO",
      "ALGIRE, JEROME DAVE DEVOMA",
      "ALMORO, AERON JAMES PALENTINOS",
      "ASI, JOSH EROLD GOPOLLA",
      "CANA, AARON JAY CONDALOR",
      "CONTRERAS, CHAUNCEY DRE MALAPITAN",
      "DELA VIÑA, RHYME SOLAMO",
      "ELAURIA, JYMNASH CZAR ENDOZO",
      "ERJAS, CARL ANTHONY LAMAR",
      "ESPINA, CARL DUSTIN INOC",
      "GARCIA, JAMES ANDREW",
      "GAVINO, JHON RAVEN",
      "GLIPONEO, PRINCESS KYLE GUIM",
      "HERNANDEZ, NATHANIEL TUÑACAO",
      "HODRIAL, ALLEN VINCE CEDRO",
      "LACORTE, JOHN LAWRENCE DELATADO",
      "LIMBO, MARK REGIE ASISTIDO",
      "LLAMZON, ZYMON HILL PASCUAL",
      "MANZANILLA, BRIXTER JOSEPH GONZALES",
      "MATUNDAN, KHAEOUS AERAY COLLADO",
      "MIRASOL, MARTIN NEIL LAQUINDANUM",
      "NERO, GABBIELLE CACAL",
      "NUNO, RON EXEQUIEL",
      "OBLIPIAS, ZIGGY SABDAO",
      "OLINO, JOPETH ORBESO",
      "OLIQUINO, CHRISTIAN ARROYO",
      "ONTE, RAFAEL PAMPLONA",
      "PEÑA, CARLOS MIGUEL ANTIDO",
      "PRADO, JOHN LENRICK TABERNILLA",
      "QUILAO, LORD JOHN LUMACAD",
      "REAL, JILLIAN CAÑUBAS",
      "RUTAQUIO, BENEDICT GUCILATAR",
      "SALON, JAN MIKHAIL FORTUNO",
      "SANTOS, KARYLLE JOY SADIA",
      "TAGUIAM, JAE HARVEY BALASTA",
      "TALATALA, REIN EISEN BANDOLA"
    ],
    "BRAYTON": [
      "ALVAREZ, VANNA JENILLE ROCCO",
      "ARGAÑOSA, RYU EMANUEL DELA CRUZ",
      "BAÑEZ, JOSEL DE CASTRO",
      "BARLETA, BRYANT DOCTORA",
      "BENGCO, EPHRAIM RICK REYES",
      "CABUCO, ZEDRICK CABANIG",
      "CAJUCOM, AEROL JOHN MARASIGAN",
      "CARLOS, KING ARDEE NHEL FLORES",
      "CATLI, JIJAH KARAN CAAGBAY",
      "DADIS, JARUZZ LANCELOT LAXAMANA",
      "DANTE, KEN-ZY RACHO",
      "DE JURAS, IVAN DICHOSO",
      "DELA ROSA, KEN ALVIN ULEP",
      "DIMAPILIS, EIDRIAN ROA",
      "ESTRELLADO, GABRIELLE LANCE MALALUAN",
      "GLOVO, RISTY AGULLANO",
      "MARTINEZ, JAY MAR ROMERO",
      "MEJILLA, JEDIMAR MAGLANGIT",
      "MERABE, PRINCE ANDEL RODRIGUEZ",
      "MILAR, EARL JOHN FEDILES",
      "MIRONES, GIANN CARLO ORTIZ",
      "OCBINA, ANTHONY REYES",
      "OPINIO, EDMEL JOHN CONDE",
      "PEREY, LUIS EMMANUEL MARASIGAN",
      "QUILITIS, VINCE ALJOE ROBLES",
      "RECIO, JHEZRIEL EDWARD FLORES",
      "REYES, LEILA MAY LABACO",
      "SANDOVAL, EDWARD SOLOMON ALVAREZ",
      "SEÑEREZ, KYLE CYRIS LLANTO",
      "TAJAO, PAUL ALDREY BARENG",
      "TORRES, JAMES CARLOS LAGDAAN",
      "VASQUEZ, JEPTHAH AGUILA",
      "YABUT, ASHLEY KURT BERMILLO"
    ],
    "DIESEL": [
      "AÑONUEVO, CHRIS",
      "ATIENZA, MATHEW GARCIA",
      "BALLESTEROS, MARK ANDERSEN TANDOC",
      "BANDIOLA, JOHN MARC TORRES",
      "BARCARSE, SEALTIEL UZZIEL LEGASPI",
      "BARONIA, JOHN RICHIE DIAZ",
      "BAYLON, JUSTINE IAN BANAWA",
      "CAGANAN, JOHN CEDRIC TAMAYO",
      "CALARA, TYRON JOEL VINOYA",
      "CAPERARE, CYRUS CESAR MAGAHIS",
      "CARANIWAN, RHODYLIE KIANA LUNA",
      "CAYAYAN, LANCE RUSSEL SUMICAD",
      "CEDALLA, JOHN LESTER HERNANDEZ",
      "CONVENTO, ADRIAN JAMES LADIA",
      "DE MESA, ANNA LOREN TUSCANO",
      "DE TORRES, JAMES IMMANUEL ASILO",
      "DELA CRUZ, JOHN RINGGO ADELINO",
      "DELA TORRE, JERALD ROBEL",
      "DESCALLAR, JOHN PAUL TRAJANO",
      "ELEFANE, DANAH VALERIE MORALES",
      "ENRIQUEZ, RAE SHERIZ NECESITO",
      "EVASCO, ONIMUS AMIR SANCHEZ",
      "FAJARDO, KING ZHAREN MAMALAYAN",
      "FAMINIAL, EARL VINCENT MAZO",
      "FERNANDEZ, NATHANIEL FRANCISCO",
      "FRANCISCO, RIDJY VILLARIN",
      "GALANG, KOBIE CONSTANTINE CAPILOS",
      "JAVIER, DENZEL JOHN LIMSON",
      "LABRADOR, JOHN PAUL PLASTINAA",
      "LUMINATE, JIETHER SALMORIN",
      "MADRONA, CARLOS MIGUEL BANAL",
      "MAÑEBO, KEITH RUSSELL ALVAREZ",
      "MARAÑA, RICK JAMES EVANGELISTA",
      "MARASIGAN, KEMP JOHN RACEL RAMOS",
      "MESINA, CEDRICK BALLARAN",
      "MOLDEZ, CARMELO CUNANAN",
      "ORENSE, EMIL GABRIEL MANGILIN",
      "PADUGA, EARL JUSTINE ESPELETA",
      "PAMPLONA, JAMES ADRIAN ENRIQUEZ",
      "PAYO, DYLAN ATIENZA",
      "PAYO, PATRICK DANIEL CASTILLO",
      "QUINTOS, LANCE KENNETH VICTA",
      "RAMOS, RED MATTHEW DE LEON",
      "RAPSING, EARL CONTRERAS",
      "RODIS, CLIFFORD ULLYSSES CASTOR",
      "SONGALLA, EZEKIEL JENNEL PENIDA",
      "STEVENS, GILBERT CARAAN",
      "SUYAT, RYAN BANCORO",
      "TALAY, SIMON JOHN ASISTORES",
      "TAN, TYRON JAMES",
      "VILLACERAN, EMMUEL ROI RIVERA"
    ],
    "EE": [
      "ABAD, EARL JOHN A.",
      "ABOCEJO, KING CHRISTOPHER",
      "ABUDA, RUPERTH KNIE P.",
      "ALANIB, RYLE BASTY B.",
      "ALVAREZ, EVANN C.",
      "ANACION, RHAINE DOMINIC D.",
      "ANDAYA, JOHN MICHAEL L.",
      "ANDRADA, JOSE ANDREI P.",
      "ARANDIA, JOHN ANSELLE M.",
      "ASCAÑO, RHICO S.",
      "ASTROLABIO, RHAY JUSTIN P.",
      "ATIENZA, PAUL JERICO H.",
      "BAHOY, DWIGHT IVAN V.",
      "BERMUDEZ, MARK LEO M.",
      "BONCAJES, ROB MARTIN A.",
      "CABARLES, TYRON Q.",
      "CAJUCOM, BRYAN JAMES M.",
      "CALMA, WENDELL D.",
      "CANTARA, CHILVERT REIN C.",
      "CARMONA, LEE ROUAN C.",
      "CHAVEZ, JOHN DAVID B.",
      "COMMINS, FRANCHESKA MAE A.",
      "CRISTOBAL, CHRISTOPHER Y.",
      "CUIZON, ALEXANDER D.",
      "DALISAY, RANIEL T.",
      "DAMAYO, CHRISTOPHER DANIELLE C.",
      "DAPADAP, JOSHUA NAHIL N.",
      "DATUS, RAIN R.",
      "DE LEON, RITCH GERMAINE M.",
      "DELA CRUZ, JOHN JOSEPH R.",
      "DELOS REYES, JEROME V.",
      "DELOS REYES, MARK STEPHEN B.",
      "DULAY, GEIBRIEL RENE P.",
      "ENDRINAL, EMMANUEL H.",
      "EREJIAS, JOHN MARK M.",
      "EUGENIO, JOHN MICHAEL A.",
      "FAELMARIN, JHON AX'L F.",
      "FLORES, NORIEL A.",
      "FLORES, RHONA LYN R.",
      "FLORIDO, DUSTINE ANGELO M.",
      "GADAZA, JOSE GABRIEL B.",
      "GALLEGO, HARIS JHON S.",
      "GAYOSA, KHENA KATLEEN G.",
      "GERODIAS, BRENT GERSON A.",
      "GOMEZ, MA. ALSHICA K.",
      "GONZALES, SEAN ALLEN M.",
      "GUIRUELA, JAMES L.",
      "HASHIM, BRINLY HAMIM M.",
      "HERNANDEZ, JAY CYRIL C.",
      "HERNANDEZ, SAM ANDREI V.",
      "IBARROLA, HANS KEN M.",
      "JUANICO, NYNGEL S.",
      "LACORTE, CRIS JASON M.",
      "LAYACAN, VHEA EDRICH M.",
      "LEGASPI, ULYCES P.",
      "LOPEZ, CHARLES ROBERT L.",
      "LUMBRES, DUSTIN M.",
      "MACALALAD, FRANS RYLCO C.",
      "MAGSOMBOL, JAMES RYAN J.",
      "MALABAG, JOHN MICHAEL B.",
      "MALANA, ROSSETTE NATHALIE A.",
      "MALOLOY-ON, DEFFERSON JOHN T.",
      "MAÑOBRA, LORENZO A.",
      "MAPUTE, CHRIS CORNELL F.",
      "MICA, CLARK DUSTIN COSME D.",
      "MILCA, JERALD O.",
      "MONDIA, JOHN VINCENT M.",
      "MORAN, MARK NIÑO A.",
      "MOSCA, JAMESTEVE SEAN G.",
      "NUNO, ROYD ALFONSO M.",
      "OPULENCIA, AARON ALLEXIS S.",
      "ORTEGA, JAMES V.",
      "ORTIZ, PAULA EUNISE A.",
      "PABALATE, RHED S.",
      "PAMPLONA, NELO DRIX T.",
      "PANARIGAN, KARLO P.",
      "PANER, ORLANDO GABRIEL C.",
      "PATARAY, EUNICE L.",
      "PECAYO, RHIANE MAE L.",
      "PEDRAJA, JOMARI D.",
      "PEREZ, JARED ELWOOD P.",
      "PIOQUINTO, ELREY D.",
      "PIZARRA, DOMAR A.",
      "RAMILO, DRACIR JOSH G.",
      "SALIBA, DEROSS D.",
      "SANTOS, RAFAEL P.",
      "SOLATORIO, JOHN JETRO C.",
      "TABAMO, EJ GODWIN B.",
      "TORIAGA, KURT LOUISE M.",
      "URRIZA, BRYLLE KRISTEN A.",
      "VILLARE, RYE LEE E.",
      "YABUT, CRISENCIO JR. P."
    ],
    "CPE": [
      "AMICAN, GABRIEL EMMANUEL B.",
      "ANDAYA, SEAN COLLIN S.",
      "ARQUILLO, MARK P.",
      "ARROCO, DAVID SZUIN R.",
      "BALBUENA, EDUARDO III J.",
      "BARBON, ANNE KIRSTEN V.",
      "BARCELLANO, MAR JOSEF V.",
      "BEGAS, JAYCEL NIEL C.",
      "BIESCAS, REYSSA JEAN D.",
      "BITANA, MARK EDRIAN J.",
      "BUSTAMANTE, DANIEL JOHN T.",
      "CAMACHO, BERNARD JOEY B.",
      "CAMBEL, KIRSTEN M.",
      "CANTALEJO, KAIDE M.",
      "CASTILLO, CHINI MARIELLI",
      "CENA, LEO M.",
      "CESAR, KLYDE GABRIEL A.",
      "CLARO, SHAWN ROMINICK T.",
      "CONEJARES, RODCORT ELVEN V.",
      "DE JESUS, KENNETH G.",
      "DOLLETON, DWAYNE KENSHIN R.",
      "DOMINGO, JOSE URBANO B.",
      "DULLAS, CHARLES EZEKIEL F.",
      "DY, LEIGH ICEN G.",
      "ESCULTURA, PRINCE ERROLL M.",
      "ESTEBAN, JEANE ANDREI C.",
      "GALOYO, IRIS L.",
      "GARCIA, JUSTIN ADRIENN P.",
      "KODAKA, KIAN KENTA D.",
      "LLANETA, JOHN VINCENT M.",
      "LLANETA, KENJIE-LIM A.",
      "MAALINDOG, ALAN PAUL C.",
      "MAGNO, DAN LLOYD L.",
      "MALABANAN, JUSTINE RALPH B.",
      "MANE, FRANCINE JADE G.",
      "MEDINA, ALLAEN MARK S.",
      "NAGPALA, EERSEL ANDREY V.",
      "OCASLA, NORMAN DAVID J.",
      "OLIVAR, CHRISTIAN JOSH D.",
      "OPULENCIA, ALLEXASHEENA DEINNE S.",
      "ORDANZA, JAMEZ IVAN V.",
      "PADUA, RHIANA ASHLEY G.",
      "PALISOC, MARK ELEAZAR M.",
      "PALOMO, CHARLEMAGNE B.",
      "PEDRIGAL, MARGARETE JANE PAULEY D.",
      "PETATE, KARL JANSEN S.",
      "PETATE, KIERVY R.",
      "RAFA, RAFAEL ALEX A.",
      "REGASPI, MARY MARGARETTE D.",
      "RUANTO, RANIELLE JEDD R.",
      "SANTIAGO, ULRICA LORAINE D.",
      "SASPA, ASHLEY KHATE R.",
      "SERRANA, JESSIE B.",
      "TAN, SIMON M.",
      "TOLENTINO, BENJAMIN M.",
      "TORALES, REUEL ANNE A.",
      "TORRES, JOSHUA ALLEN D.",
      "VIVAS, BENEDICT MIGUEL C.",
      "YANSON, RANDEL C.",
      "ZARSUELO, JOHN GAVERIEL D."
    ],
    "ECE": [
      "MARQUEZ, GISELLE A.",
      "GUANIESO, ANGELLIC RENANELYN O.",
      "CAMAT, RENUARD A.",
      "ALKHATIB, SAMER B.",
      "OPULENCIA, MARIA GEE-ANNE P.",
      "GAMITIN, JOMAR GABRIEL B.",
      "PAGUINTO, OLIEMAR LEINER P.",
      "MARASIGAN, JERICHO MIGUEL R.",
      "GUERRERO, OWEN DOMINIC V.",
      "MENOR, ANGELO C."
    ],
    "IE": [
      "ABAD, JUDITH MARIAN SILVA",
      "AGUILAR, RUSSEL ALLEN CASTILLO",
      "BALLEZA, BRUNZON ANSANO",
      "BAUTISTA, MA. CHARICE JAYONA",
      "CANATUAN, YSABELA MERCADO",
      "CICERON, HANS GABRIEL CONJARES",
      "CONSIGNADO, KASSANDRA SARMIENTO",
      "DE LEON, YANZ MARLOU BAYBAY",
      "ELISAN, JOSHUA BRYCE OLINARES",
      "ESTRADA, JERILOU MAE NAZARETH",
      "FRANCISCO, ANDRES LUIS MADEJA",
      "HALILI, MARK CLARENCE ALDABE",
      "IYOG, HANNAH MEKIE SHANE JUNGAY",
      "KODAKA, KYLE KENYA DELUANA",
      "LARINO, JOANA SOPHIA BEATRICE REYEG",
      "LECHUGA, CASSANDRA SHANEYA MANINGAS",
      "LEGASPI, TRAVIS MATHEW PARO",
      "MALLORCA, ANTON JOSEPH NARVAEZ",
      "NIEM, JARED CIRENE GOLE",
      "OCAMPO, RENZO HADI",
      "PADIT, ANDREI ANG",
      "PALIZA, PATRICK ANJELLO SOLINAP",
      "RAÑOLA, PRINCESS ARIANI ROXAS",
      "ROSALES, LOUISE ALLEN BALBIN",
      "SOJOR, ALBERT MARCELO",
      "VALIÑA, ANGELA CLAIRE PERILLO",
      "BANTOC, VINCE LYNDON ABENDAN",
      "BESAS, CHEN ZHEN LUMACANG",
      "DOROJA, PRINCESS FHAYE COLLINE TAMONDONG",
      "FRANCISCO, DERRICK GABRIEL ESCONDO",
      "GALINDEZ, JOHN PAUL JAVIER",
      "GARDAYA, PRINCESS JANEL DE OCAMPO",
      "GUELAS, MARK KRISTIAN ROMEO DUSONG",
      "IMSON, CHRISTIAN SIMON OLIVEROS",
      "JAYME, PRINCESS MAE MANAIG",
      "MALABANAN, ALJON RAMOS",
      "MALATE, LUJILL DYLAN SEÑORISES",
      "MANNAN, ABDULHAFIDZ MAUJOD",
      "MILANES, SHANE SALIBIO",
      "NAVARRO, NEON GENESIS DE CASTRO",
      "NOBLEFRANCA, VARY ALEM CANDELARIA",
      "OQUERIA, CAMILLE ANNE CANLOBO",
      "ORELLANES, JOHN MARK BATASINGEN",
      "PACALDO, JHAYSAMEL ALALIM",
      "PINEDA, KIENNA DENISE ORUGA",
      "RAMILO, JONAIRA MARI LUCIDO",
      "RIVERA, RALPH HENRY CAAGBAY",
      "ROBLES, MARK ANDREI BANIGO-OS",
      "SUAREZ, KEN DELA CRUZ",
      "SUATING, DARVIE ANGELO DELA PEÑA",
      "ATENCIO, IRISH MAE ADRIATICO",
      "BAUTISTA, MAURHIZ LIRA",
      "BONIFACIO, MARC ANTHONY PEREZ",
      "BUSTAMANTE, ZYRUS DIMAANO",
      "CASAJE, PRINCESS JANE DEQUIÑA",
      "DALIS, LESTER MARU CABRERA",
      "DE LA CRUZ, CHRISTIAN EARL MANANGAN",
      "DELA TORRE, ANGELICA FAYE TUBILLO",
      "JACINTO, GILLIANE MARGARETTE CREDO",
      "LAOMOC, JANSENN LOU DIMALALUAN",
      "LUBATON, ALTHEA FEI MOLINTAPANG",
      "LUMBRES, JENELLE MANIMTIM",
      "MALBAS, MARJORI DAUSON",
      "MANUEL, CARL JUSTIN BUENA",
      "MARIANO, IVAN CLARK JORISH MENDOZA",
      "MARIANO, JUAN PAULO MIRASOL",
      "MATANGUIHAN, KYLA AVILA",
      "MORADA, MICAIAH GWYNNETH GONZALES",
      "QUEZON, JOHN ARIEL ROSALES",
      "RAMIRO, JAYPEE DOMINGO",
      "RAPAL, KHRISTIAN LEGASPI",
      "TAYONI, DUSTIN KYLE QUIJADA",
      "TEMEÑA, MARK ANGELO BOMBITA",
      "VIDAL, JULIAN VICTOR NARVAEZ",
      "VILLANUEVA, RALPH CYRIL VIDAERA",
      "VIZCONDE, ARYZA GRACE ESCOBELLA",
      "ALCASABAS, JERICHO CRIS ARCEO",
      "AMPELOQUIO, JOHN ARMIL PILAR",
      "ANCAYAN, ALLUJ PHILIP BELEN",
      "BARRIENTOS, VINCENT BACANI",
      "BARUNDIA, BRYLLE RAPHAEL MANDIGMA",
      "BAYOT, HELEINA JANE IGUAL",
      "CABALES, RAYVER JUSTINE NOCHETE",
      "CABUDSAN, CATHERINE JOY MUSNGI",
      "DISIMULACION, KIM BRAYN RAMOS",
      "IBO, JOHN LLOYD FARIÑAS",
      "LABUTAP, DAVE ALDRIN LARA",
      "MARQUEZ, ARIES SALUD",
      "NENENG, FRANKY PARAISO",
      "PEREZ, ZYREL MANIMTIM",
      "REGINIO JR., ROLANDO AMPELOQUIO",
      "RUEDA, MARCUS BELMONTE",
      "RUEDA, NICOLE BELMONTE",
      "TIAMSIM, LOREN JADE JANDUSAY",
      "TORRES, SER JOAQUIN EMMANUEL DELA VEGA",
      "TUIZA, LANZ ROBLES",
      "VELASCO, PRINCE CHOLO MASAGNAY"
    ],
    "CE": [
      "ACLAN, SHAYNE PRANCESS E.",
      "ACULA, MARY HONEY KAYE C.",
      "AGUANTA, ALYSSA A.",
      "ALBUFERA, RALF HOMER F.",
      "ALCANTARA, LIAM GABRIEL L.",
      "ALMEDA, MARIONNE C.",
      "ALMONTE, YAEL GABRIEL S.",
      "AMANTE, CYRA IYA A.",
      "AMPER, DIVINE JOY B.",
      "APOSTOL, APPLE-KRIS E.",
      "AQUINO, JESSA MAE D.",
      "ARABE, DOMINIC JAMES D.",
      "ARBO, EVAN JEROME P.",
      "ASUNCION, KRYSTAL CLAIRE L.",
      "AVELLANO, FERLIONA C.",
      "BALDERAMA, CHRISTIAN LLOYD B.",
      "BALLESTEROS, KIRSTINE DOLL B.",
      "BANSUELO, SHAINE LARA A.",
      "BARREDO, JEWEL P.",
      "BLAZA, ANGELICA LOURINE R.",
      "BORLAGDATAN, REIGN ASHLEY P.",
      "BREGANZA, JOHN LOYD R.",
      "BUENAOBRA, MHICA S.",
      "BUNDALIAN, KATHLEEN V.",
      "CACAO, IRISH F.",
      "CANCEJO, LORIE JANE M.",
      "CAPIROSO, JEANIE AMBER L.",
      "CASTRO, JEFFER KERBY M.",
      "CLEMENTE, LERI ALEXANDRA S.",
      "CONCEPCION, ROSELYN B.",
      "CORDETA, LHORENCE BEIN M.",
      "CORPUZ, JAZMIN MYKHAELA N.",
      "COSICO, SOPHIA SANE A.",
      "CRUZ, REI ANNE R.",
      "CUBE, VAN JUZZEN SENA S.",
      "CUÑADO, GIAN GABRIEL R.",
      "DALISAY, APRIL CHARIZ C.",
      "DALISAY, JOHN CHRIS P.",
      "DE ALDAY, JOHN FLOYD A.",
      "DE CASTRO, CHERRYANN L.",
      "DE JUAN, SHAINE H.",
      "DE LEON, KIM ALLAINE B.",
      "DE MESA, LORAINNE P.",
      "DEGULLADO, ANA MARIE G.",
      "DELA CRUZ, CZARINAH BEATRICE C.",
      "DELOS REYES, JOROSS MARK E.",
      "DEMDAM, MARK GERALD F.",
      "DICHOSO, JAMES RUSSEL R.",
      "DOBLES II, ARTURO R.",
      "DOSADO, CHLOE NICOLE A.",
      "ENCANTO, GLYCEL R.",
      "ENCARNACION, JASPER R.",
      "ENRIQUEZ, MARK DAVE R.",
      "ESCALANTE, FREDERICK ERVIN ALLEN T.",
      "ESPINA, VENUS L.",
      "EVANGELISTA, JOHN DOMINIC B.",
      "FAMILARAN, PRINCE MHUEL B.",
      "FERRER, DENNIS PIOLO D.",
      "FIGUEROA, JUSTIN V.",
      "FILIO, DANIEL S.",
      "FLORES, MEL GIBSON L.",
      "FLORORITA, DHONA MARIE A.",
      "FRANCISCO, MARC JUSTINE B.",
      "GALANG, SAMANTHA ADRIENNE Q.",
      "GALINATO, LORENZO DUSTIN B.",
      "GALIZA, TRISTAN HARVEY M.",
      "GARBO, NIRAH S.",
      "GARCIA, ELISHA RHEIN MULIMBAYAN M.",
      "GARCIA, FRANCIS P.",
      "GLINOGA, JHAY EL C.",
      "GLIPO, CRISTINE NICOLE M.",
      "GO, MIASHI I.",
      "GRAPANI, LEEAN MAE T.",
      "HAEL, MICHAEL CLARK C.",
      "HAEL, EDMELYN D.",
      "JAVIER, TRIXIE B.",
      "JUANANE, LUIS JAN YVES M.",
      "LABILLES, MARK DARYL R.",
      "LAGDAMEN, MARK DADEN A.",
      "LAGOC, EURIELLE CLAIRE L.",
      "LAGRAZON, GIAN JUDD S.",
      "LANSANGAN, JOHN DANIEL T.",
      "LAPITAN, STEPHEN JACOB P.",
      "LAVENTE, JUDY ANN A.",
      "LAZARO, JARNIE CARL",
      "LEYCANO, JAMEROS A.",
      "LOGO, KERVIN JON N.",
      "LOPEZ, JOHN CARLO C.",
      "LOPEZ, JOHN HENRY B.",
      "LUGTU, CHRYSTAL SAPPHIRE D.",
      "LULU, AIRA LEI C.",
      "LUMBRES, JEROME B.",
      "LUTA, TRISHA SHANE",
      "MACATOL, KESIA MAE A.",
      "MAGTAN-AO, LOVELY B.",
      "MANAIG, KURT ANDREI",
      "MANAIG, ROBBIE D.",
      "MARASIGAN, KURT AERRON P.",
      "MARIANO, JOHN PAUL S.",
      "MARTEJA, JAMES HECTOR G.",
      "MAYOLA, JASPER D.",
      "MELENDREZ, AIRISH JAMES M.",
      "MENDOZA, ROLDAN L.",
      "MERAÑA, LORAINE KISHA A.",
      "MERILLES, JHARED A.",
      "MERTO, HANNAH CES C.",
      "MIRANDA, RANIEL Y.",
      "MORADA, JHANELL SOPHIA B.",
      "NACARIO, SOFIA MARIE A.",
      "NAVARRO, GERALD JAMES O.",
      "NAVARTE, JOSEPH ROEM E.",
      "OCTAVIO, LEVIN JANE D.",
      "ORTIZ, ELEUMAR NIMROD ITHEL T.",
      "PALASIGUE, ANDREI C.",
      "PANTERIA, SHANELLE B.",
      "PASATIEMPO, TRICIA N.",
      "PASTRANA, RENMAR C.",
      "PEDIDA, KELLY ANNE E.",
      "PEREZ, CEEJHAE D.",
      "PEREZ, REAH MAE",
      "PINEDA, RAISHELL B.",
      "PISANTE, ERICA A.",
      "RAFOL, REDGEM M.",
      "RAMIREZ, JAYCEE D.",
      "RAMOS, EARL JOSHUA E.",
      "RAMOS, GLENN LEONARD C.",
      "RAMOS, JANELLE F.",
      "REBADEO, JHON RODNEY C.",
      "REBLORA, JOHN NATHANIEL S.",
      "REGONDOLA, MARIA ANDREA R.",
      "RELENTE, JOSH KOJI L.",
      "RELOJ, KARL ANDREI A.",
      "REOGO, DRIZELLA JAYNE A.",
      "RODRIGUEZ, RUSSEL P.",
      "ROSARIO, LAURENZ JAMES I.",
      "RUBILLA, VON LAUVIN J.",
      "SALO, REIN SAM M.",
      "SALVADOR, CARLOS IVAN N.",
      "SANDOVAL, JOHN MICHAEL L.",
      "SARDIDO, LARZ JENRIL R.",
      "SECRETARIO, ELAIZA M.",
      "SUBIA, CHIN AIKEE A.",
      "TABION, RENDEL Q.",
      "TAHAMIL, ARMANI M.",
      "TAN, LORENCE DAVID R.",
      "TEMPLONUEVO, NICOLE G.",
      "TOLEDO, NICOLE P.",
      "TORRECAMPO, CHRISTIAN ARON P.",
      "TORRENDON, JASPHER M.",
      "VILLA, DAISY ANN S.",
      "VILLANUEVA, LUIS MIGUEL D.",
      "YLAGAN, ADRIENNE G."
    ]
  },
  "students": [
    {
      "id": "student-0001",
      "code": "MEODL-0001",
      "studentCode": "MEODL-0001",
      "name": "ABSALUD, EDWARD KEEN TAGLE",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0002",
      "code": "MEODL-0002",
      "studentCode": "MEODL-0002",
      "name": "ALMORO, STEPHEN NASH GACILLOS",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0003",
      "code": "MEODL-0003",
      "studentCode": "MEODL-0003",
      "name": "ASPERIN, ENRIQUE ACLAN",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0004",
      "code": "MEODL-0004",
      "studentCode": "MEODL-0004",
      "name": "AUSTRIA, ANDREA RIVERA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0005",
      "code": "MEODL-0005",
      "studentCode": "MEODL-0005",
      "name": "BANATIN, CRISTOFF JIMSON TEJERO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0006",
      "code": "MEODL-0006",
      "studentCode": "MEODL-0006",
      "name": "BARBA III, DANILO MAYLON",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0007",
      "code": "MEODL-0007",
      "studentCode": "MEODL-0007",
      "name": "BOLA, AR-JAMES REMOROZA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0008",
      "code": "MEODL-0008",
      "studentCode": "MEODL-0008",
      "name": "CAGANAN, JOHN CEDRIC TAMAYO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0009",
      "code": "MEODL-0009",
      "studentCode": "MEODL-0009",
      "name": "CARANDANG, GABRIEL FLORES",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0010",
      "code": "MEODL-0010",
      "studentCode": "MEODL-0010",
      "name": "CHAMIAN, BRADEN CHOZAS",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0011",
      "code": "MEODL-0011",
      "studentCode": "MEODL-0011",
      "name": "CONTRERAS, KENDRICK ZABDIEL RECIO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0012",
      "code": "MEODL-0012",
      "studentCode": "MEODL-0012",
      "name": "CREMEN, AMIR MCKALE DEL SOL",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0013",
      "code": "MEODL-0013",
      "studentCode": "MEODL-0013",
      "name": "DE JESUS, JOHN JERNIECHO TABUYO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0014",
      "code": "MEODL-0014",
      "studentCode": "MEODL-0014",
      "name": "DEBLOLS, REDD YUAN MERILLES",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0015",
      "code": "MEODL-0015",
      "studentCode": "MEODL-0015",
      "name": "DIZON, LEE JHUDIEL ANGARA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0016",
      "code": "MEODL-0016",
      "studentCode": "MEODL-0016",
      "name": "ECHAPARE, PRINCE MEINARD MARCELLANA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0017",
      "code": "MEODL-0017",
      "studentCode": "MEODL-0017",
      "name": "ETORMA, CHRIS ADVIEN LIBELO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0018",
      "code": "MEODL-0018",
      "studentCode": "MEODL-0018",
      "name": "FLORES, HABIB DHEREX",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0019",
      "code": "MEODL-0019",
      "studentCode": "MEODL-0019",
      "name": "FONTANILLA, LORDRYAN CLYDE MORANTE",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0020",
      "code": "MEODL-0020",
      "studentCode": "MEODL-0020",
      "name": "GALANG, MARK KIRBY MORES",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0021",
      "code": "MEODL-0021",
      "studentCode": "MEODL-0021",
      "name": "GARCELLANO, AUDREY CALVIN PRADO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0022",
      "code": "MEODL-0022",
      "studentCode": "MEODL-0022",
      "name": "GARCIA, JOHN LEMUEL",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0023",
      "code": "MEODL-0023",
      "studentCode": "MEODL-0023",
      "name": "GARCIA, KERBY ORUGA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0024",
      "code": "MEODL-0024",
      "studentCode": "MEODL-0024",
      "name": "GERVACIO, LJ DENISSE HERNANDEZ",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0025",
      "code": "MEODL-0025",
      "studentCode": "MEODL-0025",
      "name": "GRATE, STOFFEL JASEN PERALTA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0026",
      "code": "MEODL-0026",
      "studentCode": "MEODL-0026",
      "name": "ILARDE, RAISEL BORROMEO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0027",
      "code": "MEODL-0027",
      "studentCode": "MEODL-0027",
      "name": "JUAN, MARK CLARENCE HIPOS",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0028",
      "code": "MEODL-0028",
      "studentCode": "MEODL-0028",
      "name": "LAFORTEZA, SAMANTHA NICOLE GLIPONEO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0029",
      "code": "MEODL-0029",
      "studentCode": "MEODL-0029",
      "name": "LAIT, MARWELL SELWIN JABONILLO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0030",
      "code": "MEODL-0030",
      "studentCode": "MEODL-0030",
      "name": "LEONOR, JOHN ROVEE VERGARA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0031",
      "code": "MEODL-0031",
      "studentCode": "MEODL-0031",
      "name": "MAGHANOY, DAVID JAN RUZZEL BUMAGAT",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0032",
      "code": "MEODL-0032",
      "studentCode": "MEODL-0032",
      "name": "MALIPOL, CARL JEAN NOEL LARIOS",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0033",
      "code": "MEODL-0033",
      "studentCode": "MEODL-0033",
      "name": "MALLARI, LOUISE ANDREY DACLIZON",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0034",
      "code": "MEODL-0034",
      "studentCode": "MEODL-0034",
      "name": "MANALASTAS, JAMES SERDAN",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0035",
      "code": "MEODL-0035",
      "studentCode": "MEODL-0035",
      "name": "MANALO, CHARLES JOSEPH GAMBOA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0036",
      "code": "MEODL-0036",
      "studentCode": "MEODL-0036",
      "name": "MONTERO, JOSHUA TAPIA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0037",
      "code": "MEODL-0037",
      "studentCode": "MEODL-0037",
      "name": "ORENSE, EMIL GABRIEL MANGILIN",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0038",
      "code": "MEODL-0038",
      "studentCode": "MEODL-0038",
      "name": "PACLIBAR, JOHN MICHAEL VILLARAZA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0039",
      "code": "MEODL-0039",
      "studentCode": "MEODL-0039",
      "name": "PALICPIC, CHRIS JERICO MIRANDA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0040",
      "code": "MEODL-0040",
      "studentCode": "MEODL-0040",
      "name": "PUA, LIAM AKIEM CARASUS",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0041",
      "code": "MEODL-0041",
      "studentCode": "MEODL-0041",
      "name": "PUBLICO, JOHN MICHAEL BANAAG",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0042",
      "code": "MEODL-0042",
      "studentCode": "MEODL-0042",
      "name": "PULGAR, ROWEN VICTOR CUBILE",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0043",
      "code": "MEODL-0043",
      "studentCode": "MEODL-0043",
      "name": "QUIRANTE, SHIANELA BALANAY",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0044",
      "code": "MEODL-0044",
      "studentCode": "MEODL-0044",
      "name": "RIPO, RENZ ALJUN DOMINGUEZ",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0045",
      "code": "MEODL-0045",
      "studentCode": "MEODL-0045",
      "name": "SALIBA, GIAN KARLO BRAGADO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0046",
      "code": "MEODL-0046",
      "studentCode": "MEODL-0046",
      "name": "SAN PASCUAL, JAMES DOMINIC TADONG",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0047",
      "code": "MEODL-0047",
      "studentCode": "MEODL-0047",
      "name": "SANTOS, KARL ANGELO DIAGO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0048",
      "code": "MEODL-0048",
      "studentCode": "MEODL-0048",
      "name": "TALASTASIN, ALHJHON ANCHETA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0049",
      "code": "MEODL-0049",
      "studentCode": "MEODL-0049",
      "name": "TAYAG, JAYSON BARQUILLA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0050",
      "code": "MEODL-0050",
      "studentCode": "MEODL-0050",
      "name": "TEJERO, ARCH RYLER LOZADA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0051",
      "code": "MEODL-0051",
      "studentCode": "MEODL-0051",
      "name": "TIZON, THEO DAN GHERICK MERALPES",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0052",
      "code": "MEODL-0052",
      "studentCode": "MEODL-0052",
      "name": "TULUD, MARCOS JOHN BONSO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0053",
      "code": "MEODL-0053",
      "studentCode": "MEODL-0053",
      "name": "TURAJA, VIEN XYRILLE SANGALANG",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0054",
      "code": "MEODL-0054",
      "studentCode": "MEODL-0054",
      "name": "VILLAPANDO, RUSSEL THOMSON C.",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0055",
      "code": "MEODL-0055",
      "studentCode": "MEODL-0055",
      "name": "ZUÑIGA, KENNETH JOHN RIVEL",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0056",
      "code": "MEODL-0056",
      "studentCode": "MEODL-0056",
      "name": "ABERDE, NOMEL ACE CERBO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0057",
      "code": "MEODL-0057",
      "studentCode": "MEODL-0057",
      "name": "ALGIRE, JEROME DAVE DEVOMA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0058",
      "code": "MEODL-0058",
      "studentCode": "MEODL-0058",
      "name": "ALMORO, AERON JAMES PALENTINOS",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0059",
      "code": "MEODL-0059",
      "studentCode": "MEODL-0059",
      "name": "ASI, JOSH EROLD GOPOLLA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0060",
      "code": "MEODL-0060",
      "studentCode": "MEODL-0060",
      "name": "CANA, AARON JAY CONDALOR",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0061",
      "code": "MEODL-0061",
      "studentCode": "MEODL-0061",
      "name": "CONTRERAS, CHAUNCEY DRE MALAPITAN",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0062",
      "code": "MEODL-0062",
      "studentCode": "MEODL-0062",
      "name": "DELA VIÑA, RHYME SOLAMO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0063",
      "code": "MEODL-0063",
      "studentCode": "MEODL-0063",
      "name": "ELAURIA, JYMNASH CZAR ENDOZO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0064",
      "code": "MEODL-0064",
      "studentCode": "MEODL-0064",
      "name": "ERJAS, CARL ANTHONY LAMAR",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0065",
      "code": "MEODL-0065",
      "studentCode": "MEODL-0065",
      "name": "ESPINA, CARL DUSTIN INOC",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0066",
      "code": "MEODL-0066",
      "studentCode": "MEODL-0066",
      "name": "GARCIA, JAMES ANDREW",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0067",
      "code": "MEODL-0067",
      "studentCode": "MEODL-0067",
      "name": "GAVINO, JHON RAVEN",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0068",
      "code": "MEODL-0068",
      "studentCode": "MEODL-0068",
      "name": "GLIPONEO, PRINCESS KYLE GUIM",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0069",
      "code": "MEODL-0069",
      "studentCode": "MEODL-0069",
      "name": "HERNANDEZ, NATHANIEL TUÑACAO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0070",
      "code": "MEODL-0070",
      "studentCode": "MEODL-0070",
      "name": "HODRIAL, ALLEN VINCE CEDRO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0071",
      "code": "MEODL-0071",
      "studentCode": "MEODL-0071",
      "name": "LACORTE, JOHN LAWRENCE DELATADO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0072",
      "code": "MEODL-0072",
      "studentCode": "MEODL-0072",
      "name": "LIMBO, MARK REGIE ASISTIDO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0073",
      "code": "MEODL-0073",
      "studentCode": "MEODL-0073",
      "name": "LLAMZON, ZYMON HILL PASCUAL",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0074",
      "code": "MEODL-0074",
      "studentCode": "MEODL-0074",
      "name": "MANZANILLA, BRIXTER JOSEPH GONZALES",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0075",
      "code": "MEODL-0075",
      "studentCode": "MEODL-0075",
      "name": "MATUNDAN, KHAEOUS AERAY COLLADO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0076",
      "code": "MEODL-0076",
      "studentCode": "MEODL-0076",
      "name": "MIRASOL, MARTIN NEIL LAQUINDANUM",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0077",
      "code": "MEODL-0077",
      "studentCode": "MEODL-0077",
      "name": "NERO, GABBIELLE CACAL",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0078",
      "code": "MEODL-0078",
      "studentCode": "MEODL-0078",
      "name": "NUNO, RON EXEQUIEL",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0079",
      "code": "MEODL-0079",
      "studentCode": "MEODL-0079",
      "name": "OBLIPIAS, ZIGGY SABDAO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0080",
      "code": "MEODL-0080",
      "studentCode": "MEODL-0080",
      "name": "OLINO, JOPETH ORBESO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0081",
      "code": "MEODL-0081",
      "studentCode": "MEODL-0081",
      "name": "OLIQUINO, CHRISTIAN ARROYO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0082",
      "code": "MEODL-0082",
      "studentCode": "MEODL-0082",
      "name": "ONTE, RAFAEL PAMPLONA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0083",
      "code": "MEODL-0083",
      "studentCode": "MEODL-0083",
      "name": "PEÑA, CARLOS MIGUEL ANTIDO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0084",
      "code": "MEODL-0084",
      "studentCode": "MEODL-0084",
      "name": "PRADO, JOHN LENRICK TABERNILLA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0085",
      "code": "MEODL-0085",
      "studentCode": "MEODL-0085",
      "name": "QUILAO, LORD JOHN LUMACAD",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0086",
      "code": "MEODL-0086",
      "studentCode": "MEODL-0086",
      "name": "REAL, JILLIAN CAÑUBAS",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0087",
      "code": "MEODL-0087",
      "studentCode": "MEODL-0087",
      "name": "RUTAQUIO, BENEDICT GUCILATAR",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0088",
      "code": "MEODL-0088",
      "studentCode": "MEODL-0088",
      "name": "SALON, JAN MIKHAIL FORTUNO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0089",
      "code": "MEODL-0089",
      "studentCode": "MEODL-0089",
      "name": "SANTOS, KARYLLE JOY SADIA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0090",
      "code": "MEODL-0090",
      "studentCode": "MEODL-0090",
      "name": "TAGUIAM, JAE HARVEY BALASTA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0091",
      "code": "MEODL-0091",
      "studentCode": "MEODL-0091",
      "name": "TALATALA, REIN EISEN BANDOLA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0092",
      "code": "MEODL-0092",
      "studentCode": "MEODL-0092",
      "name": "ALVAREZ, VANNA JENILLE ROCCO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0093",
      "code": "MEODL-0093",
      "studentCode": "MEODL-0093",
      "name": "ARGAÑOSA, RYU EMANUEL DELA CRUZ",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0094",
      "code": "MEODL-0094",
      "studentCode": "MEODL-0094",
      "name": "BAÑEZ, JOSEL DE CASTRO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0095",
      "code": "MEODL-0095",
      "studentCode": "MEODL-0095",
      "name": "BARLETA, BRYANT DOCTORA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0096",
      "code": "MEODL-0096",
      "studentCode": "MEODL-0096",
      "name": "BENGCO, EPHRAIM RICK REYES",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0097",
      "code": "MEODL-0097",
      "studentCode": "MEODL-0097",
      "name": "CABUCO, ZEDRICK CABANIG",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0098",
      "code": "MEODL-0098",
      "studentCode": "MEODL-0098",
      "name": "CAJUCOM, AEROL JOHN MARASIGAN",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0099",
      "code": "MEODL-0099",
      "studentCode": "MEODL-0099",
      "name": "CARLOS, KING ARDEE NHEL FLORES",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0100",
      "code": "MEODL-0100",
      "studentCode": "MEODL-0100",
      "name": "CATLI, JIJAH KARAN CAAGBAY",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0101",
      "code": "MEODL-0101",
      "studentCode": "MEODL-0101",
      "name": "DADIS, JARUZZ LANCELOT LAXAMANA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0102",
      "code": "MEODL-0102",
      "studentCode": "MEODL-0102",
      "name": "DANTE, KEN-ZY RACHO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0103",
      "code": "MEODL-0103",
      "studentCode": "MEODL-0103",
      "name": "DE JURAS, IVAN DICHOSO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0104",
      "code": "MEODL-0104",
      "studentCode": "MEODL-0104",
      "name": "DELA ROSA, KEN ALVIN ULEP",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0105",
      "code": "MEODL-0105",
      "studentCode": "MEODL-0105",
      "name": "DIMAPILIS, EIDRIAN ROA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0106",
      "code": "MEODL-0106",
      "studentCode": "MEODL-0106",
      "name": "ESTRELLADO, GABRIELLE LANCE MALALUAN",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0107",
      "code": "MEODL-0107",
      "studentCode": "MEODL-0107",
      "name": "GLOVO, RISTY AGULLANO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0108",
      "code": "MEODL-0108",
      "studentCode": "MEODL-0108",
      "name": "MARTINEZ, JAY MAR ROMERO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0109",
      "code": "MEODL-0109",
      "studentCode": "MEODL-0109",
      "name": "MEJILLA, JEDIMAR MAGLANGIT",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0110",
      "code": "MEODL-0110",
      "studentCode": "MEODL-0110",
      "name": "MERABE, PRINCE ANDEL RODRIGUEZ",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0111",
      "code": "MEODL-0111",
      "studentCode": "MEODL-0111",
      "name": "MILAR, EARL JOHN FEDILES",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0112",
      "code": "MEODL-0112",
      "studentCode": "MEODL-0112",
      "name": "MIRONES, GIANN CARLO ORTIZ",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0113",
      "code": "MEODL-0113",
      "studentCode": "MEODL-0113",
      "name": "OCBINA, ANTHONY REYES",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0114",
      "code": "MEODL-0114",
      "studentCode": "MEODL-0114",
      "name": "OPINIO, EDMEL JOHN CONDE",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0115",
      "code": "MEODL-0115",
      "studentCode": "MEODL-0115",
      "name": "PEREY, LUIS EMMANUEL MARASIGAN",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0116",
      "code": "MEODL-0116",
      "studentCode": "MEODL-0116",
      "name": "QUILITIS, VINCE ALJOE ROBLES",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0117",
      "code": "MEODL-0117",
      "studentCode": "MEODL-0117",
      "name": "RECIO, JHEZRIEL EDWARD FLORES",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0118",
      "code": "MEODL-0118",
      "studentCode": "MEODL-0118",
      "name": "REYES, LEILA MAY LABACO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0119",
      "code": "MEODL-0119",
      "studentCode": "MEODL-0119",
      "name": "SANDOVAL, EDWARD SOLOMON ALVAREZ",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0120",
      "code": "MEODL-0120",
      "studentCode": "MEODL-0120",
      "name": "SEÑEREZ, KYLE CYRIS LLANTO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0121",
      "code": "MEODL-0121",
      "studentCode": "MEODL-0121",
      "name": "TAJAO, PAUL ALDREY BARENG",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0122",
      "code": "MEODL-0122",
      "studentCode": "MEODL-0122",
      "name": "TORRES, JAMES CARLOS LAGDAAN",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0123",
      "code": "MEODL-0123",
      "studentCode": "MEODL-0123",
      "name": "VASQUEZ, JEPTHAH AGUILA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0124",
      "code": "MEODL-0124",
      "studentCode": "MEODL-0124",
      "name": "YABUT, ASHLEY KURT BERMILLO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0125",
      "code": "MEODL-0125",
      "studentCode": "MEODL-0125",
      "name": "AÑONUEVO, CHRIS",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0126",
      "code": "MEODL-0126",
      "studentCode": "MEODL-0126",
      "name": "ATIENZA, MATHEW GARCIA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0127",
      "code": "MEODL-0127",
      "studentCode": "MEODL-0127",
      "name": "BALLESTEROS, MARK ANDERSEN TANDOC",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0128",
      "code": "MEODL-0128",
      "studentCode": "MEODL-0128",
      "name": "BANDIOLA, JOHN MARC TORRES",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0129",
      "code": "MEODL-0129",
      "studentCode": "MEODL-0129",
      "name": "BARCARSE, SEALTIEL UZZIEL LEGASPI",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0130",
      "code": "MEODL-0130",
      "studentCode": "MEODL-0130",
      "name": "BARONIA, JOHN RICHIE DIAZ",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0131",
      "code": "MEODL-0131",
      "studentCode": "MEODL-0131",
      "name": "BAYLON, JUSTINE IAN BANAWA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0132",
      "code": "MEODL-0132",
      "studentCode": "MEODL-0132",
      "name": "CAGANAN, JOHN CEDRIC TAMAYO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0133",
      "code": "MEODL-0133",
      "studentCode": "MEODL-0133",
      "name": "CALARA, TYRON JOEL VINOYA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0134",
      "code": "MEODL-0134",
      "studentCode": "MEODL-0134",
      "name": "CAPERARE, CYRUS CESAR MAGAHIS",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0135",
      "code": "MEODL-0135",
      "studentCode": "MEODL-0135",
      "name": "CARANIWAN, RHODYLIE KIANA LUNA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0136",
      "code": "MEODL-0136",
      "studentCode": "MEODL-0136",
      "name": "CAYAYAN, LANCE RUSSEL SUMICAD",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0137",
      "code": "MEODL-0137",
      "studentCode": "MEODL-0137",
      "name": "CEDALLA, JOHN LESTER HERNANDEZ",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0138",
      "code": "MEODL-0138",
      "studentCode": "MEODL-0138",
      "name": "CONVENTO, ADRIAN JAMES LADIA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0139",
      "code": "MEODL-0139",
      "studentCode": "MEODL-0139",
      "name": "DE MESA, ANNA LOREN TUSCANO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0140",
      "code": "MEODL-0140",
      "studentCode": "MEODL-0140",
      "name": "DE TORRES, JAMES IMMANUEL ASILO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0141",
      "code": "MEODL-0141",
      "studentCode": "MEODL-0141",
      "name": "DELA CRUZ, JOHN RINGGO ADELINO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0142",
      "code": "MEODL-0142",
      "studentCode": "MEODL-0142",
      "name": "DELA TORRE, JERALD ROBEL",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0143",
      "code": "MEODL-0143",
      "studentCode": "MEODL-0143",
      "name": "DESCALLAR, JOHN PAUL TRAJANO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0144",
      "code": "MEODL-0144",
      "studentCode": "MEODL-0144",
      "name": "ELEFANE, DANAH VALERIE MORALES",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0145",
      "code": "MEODL-0145",
      "studentCode": "MEODL-0145",
      "name": "ENRIQUEZ, RAE SHERIZ NECESITO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0146",
      "code": "MEODL-0146",
      "studentCode": "MEODL-0146",
      "name": "EVASCO, ONIMUS AMIR SANCHEZ",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0147",
      "code": "MEODL-0147",
      "studentCode": "MEODL-0147",
      "name": "FAJARDO, KING ZHAREN MAMALAYAN",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0148",
      "code": "MEODL-0148",
      "studentCode": "MEODL-0148",
      "name": "FAMINIAL, EARL VINCENT MAZO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0149",
      "code": "MEODL-0149",
      "studentCode": "MEODL-0149",
      "name": "FERNANDEZ, NATHANIEL FRANCISCO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0150",
      "code": "MEODL-0150",
      "studentCode": "MEODL-0150",
      "name": "FRANCISCO, RIDJY VILLARIN",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0151",
      "code": "MEODL-0151",
      "studentCode": "MEODL-0151",
      "name": "GALANG, KOBIE CONSTANTINE CAPILOS",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0152",
      "code": "MEODL-0152",
      "studentCode": "MEODL-0152",
      "name": "JAVIER, DENZEL JOHN LIMSON",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0153",
      "code": "MEODL-0153",
      "studentCode": "MEODL-0153",
      "name": "LABRADOR, JOHN PAUL PLASTINAA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0154",
      "code": "MEODL-0154",
      "studentCode": "MEODL-0154",
      "name": "LUMINATE, JIETHER SALMORIN",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0155",
      "code": "MEODL-0155",
      "studentCode": "MEODL-0155",
      "name": "MADRONA, CARLOS MIGUEL BANAL",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0156",
      "code": "MEODL-0156",
      "studentCode": "MEODL-0156",
      "name": "MAÑEBO, KEITH RUSSELL ALVAREZ",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0157",
      "code": "MEODL-0157",
      "studentCode": "MEODL-0157",
      "name": "MARAÑA, RICK JAMES EVANGELISTA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0158",
      "code": "MEODL-0158",
      "studentCode": "MEODL-0158",
      "name": "MARASIGAN, KEMP JOHN RACEL RAMOS",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0159",
      "code": "MEODL-0159",
      "studentCode": "MEODL-0159",
      "name": "MESINA, CEDRICK BALLARAN",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0160",
      "code": "MEODL-0160",
      "studentCode": "MEODL-0160",
      "name": "MOLDEZ, CARMELO CUNANAN",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0161",
      "code": "MEODL-0161",
      "studentCode": "MEODL-0161",
      "name": "ORENSE, EMIL GABRIEL MANGILIN",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0162",
      "code": "MEODL-0162",
      "studentCode": "MEODL-0162",
      "name": "PADUGA, EARL JUSTINE ESPELETA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0163",
      "code": "MEODL-0163",
      "studentCode": "MEODL-0163",
      "name": "PAMPLONA, JAMES ADRIAN ENRIQUEZ",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0164",
      "code": "MEODL-0164",
      "studentCode": "MEODL-0164",
      "name": "PAYO, DYLAN ATIENZA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0165",
      "code": "MEODL-0165",
      "studentCode": "MEODL-0165",
      "name": "PAYO, PATRICK DANIEL CASTILLO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0166",
      "code": "MEODL-0166",
      "studentCode": "MEODL-0166",
      "name": "QUINTOS, LANCE KENNETH VICTA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0167",
      "code": "MEODL-0167",
      "studentCode": "MEODL-0167",
      "name": "RAMOS, RED MATTHEW DE LEON",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0168",
      "code": "MEODL-0168",
      "studentCode": "MEODL-0168",
      "name": "RAPSING, EARL CONTRERAS",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0169",
      "code": "MEODL-0169",
      "studentCode": "MEODL-0169",
      "name": "RODIS, CLIFFORD ULLYSSES CASTOR",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0170",
      "code": "MEODL-0170",
      "studentCode": "MEODL-0170",
      "name": "SONGALLA, EZEKIEL JENNEL PENIDA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0171",
      "code": "MEODL-0171",
      "studentCode": "MEODL-0171",
      "name": "STEVENS, GILBERT CARAAN",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0172",
      "code": "MEODL-0172",
      "studentCode": "MEODL-0172",
      "name": "SUYAT, RYAN BANCORO",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0173",
      "code": "MEODL-0173",
      "studentCode": "MEODL-0173",
      "name": "TALAY, SIMON JOHN ASISTORES",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0174",
      "code": "MEODL-0174",
      "studentCode": "MEODL-0174",
      "name": "TAN, TYRON JAMES",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "student-0175",
      "code": "MEODL-0175",
      "studentCode": "MEODL-0175",
      "name": "VILLACERAN, EMMUEL ROI RIVERA",
      "team": "me",
      "teamName": "ME (Mechanical Engineering)"
    },
    {
      "id": "custom_stu_999",
      "code": "2026-CPE-999",
      "studentCode": "2026-CPE-999",
      "name": "DELA CRUZ, ENGR",
      "team": "cpe",
      "teamName": "CPE (Computer Engineering)"
    },
    {
      "id": "stu_2026-ece-777",
      "code": "2026-ECE-777",
      "studentCode": "2026-ECE-777",
      "name": "SANTOS, MARIA",
      "team": "ece",
      "teamName": "ECE (Electronics Engineering)"
    },
    {
      "id": "EE-001",
      "code": "EE-001",
      "studentCode": "EE-001",
      "name": "ABAD, EARL JOHN A.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-002",
      "code": "EE-002",
      "studentCode": "EE-002",
      "name": "ABOCEJO, KING CHRISTOPHER",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-003",
      "code": "EE-003",
      "studentCode": "EE-003",
      "name": "ABUDA, RUPERTH KNIE P.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-004",
      "code": "EE-004",
      "studentCode": "EE-004",
      "name": "ALANIB, RYLE BASTY B.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-005",
      "code": "EE-005",
      "studentCode": "EE-005",
      "name": "ALVAREZ, EVANN C.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-006",
      "code": "EE-006",
      "studentCode": "EE-006",
      "name": "ANACION, RHAINE DOMINIC D.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-007",
      "code": "EE-007",
      "studentCode": "EE-007",
      "name": "ANDAYA, JOHN MICHAEL L.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-008",
      "code": "EE-008",
      "studentCode": "EE-008",
      "name": "ANDRADA, JOSE ANDREI P.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-009",
      "code": "EE-009",
      "studentCode": "EE-009",
      "name": "ARANDIA, JOHN ANSELLE M.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-010",
      "code": "EE-010",
      "studentCode": "EE-010",
      "name": "ASCAÑO, RHICO S.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-011",
      "code": "EE-011",
      "studentCode": "EE-011",
      "name": "ASTROLABIO, RHAY JUSTIN P.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-012",
      "code": "EE-012",
      "studentCode": "EE-012",
      "name": "ATIENZA, PAUL JERICO H.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-013",
      "code": "EE-013",
      "studentCode": "EE-013",
      "name": "BAHOY, DWIGHT IVAN V.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-014",
      "code": "EE-014",
      "studentCode": "EE-014",
      "name": "BERMUDEZ, MARK LEO M.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-015",
      "code": "EE-015",
      "studentCode": "EE-015",
      "name": "BONCAJES, ROB MARTIN A.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-016",
      "code": "EE-016",
      "studentCode": "EE-016",
      "name": "CABARLES, TYRON Q.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-017",
      "code": "EE-017",
      "studentCode": "EE-017",
      "name": "CAJUCOM, BRYAN JAMES M.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-018",
      "code": "EE-018",
      "studentCode": "EE-018",
      "name": "CALMA, WENDELL D.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-019",
      "code": "EE-019",
      "studentCode": "EE-019",
      "name": "CANTARA, CHILVERT REIN C.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-020",
      "code": "EE-020",
      "studentCode": "EE-020",
      "name": "CARMONA, LEE ROUAN C.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-021",
      "code": "EE-021",
      "studentCode": "EE-021",
      "name": "CHAVEZ, JOHN DAVID B.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-022",
      "code": "EE-022",
      "studentCode": "EE-022",
      "name": "COMMINS, FRANCHESKA MAE A.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-023",
      "code": "EE-023",
      "studentCode": "EE-023",
      "name": "CRISTOBAL, CHRISTOPHER Y.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-024",
      "code": "EE-024",
      "studentCode": "EE-024",
      "name": "CUIZON, ALEXANDER D.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-025",
      "code": "EE-025",
      "studentCode": "EE-025",
      "name": "DALISAY, RANIEL T.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-026",
      "code": "EE-026",
      "studentCode": "EE-026",
      "name": "DAMAYO, CHRISTOPHER DANIELLE C.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-027",
      "code": "EE-027",
      "studentCode": "EE-027",
      "name": "DAPADAP, JOSHUA NAHIL N.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-028",
      "code": "EE-028",
      "studentCode": "EE-028",
      "name": "DATUS, RAIN R.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-029",
      "code": "EE-029",
      "studentCode": "EE-029",
      "name": "DE LEON, RITCH GERMAINE M.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-030",
      "code": "EE-030",
      "studentCode": "EE-030",
      "name": "DELA CRUZ, JOHN JOSEPH R.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-031",
      "code": "EE-031",
      "studentCode": "EE-031",
      "name": "DELOS REYES, JEROME V.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-032",
      "code": "EE-032",
      "studentCode": "EE-032",
      "name": "DELOS REYES, MARK STEPHEN B.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-033",
      "code": "EE-033",
      "studentCode": "EE-033",
      "name": "DULAY, GEIBRIEL RENE P.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-034",
      "code": "EE-034",
      "studentCode": "EE-034",
      "name": "ENDRINAL, EMMANUEL H.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-035",
      "code": "EE-035",
      "studentCode": "EE-035",
      "name": "EREJIAS, JOHN MARK M.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-036",
      "code": "EE-036",
      "studentCode": "EE-036",
      "name": "EUGENIO, JOHN MICHAEL A.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-037",
      "code": "EE-037",
      "studentCode": "EE-037",
      "name": "FAELMARIN, JHON AX'L F.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-038",
      "code": "EE-038",
      "studentCode": "EE-038",
      "name": "FLORES, NORIEL A.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-039",
      "code": "EE-039",
      "studentCode": "EE-039",
      "name": "FLORES, RHONA LYN R.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-040",
      "code": "EE-040",
      "studentCode": "EE-040",
      "name": "FLORIDO, DUSTINE ANGELO M.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-041",
      "code": "EE-041",
      "studentCode": "EE-041",
      "name": "GADAZA, JOSE GABRIEL B.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-042",
      "code": "EE-042",
      "studentCode": "EE-042",
      "name": "GALLEGO, HARIS JHON S.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-043",
      "code": "EE-043",
      "studentCode": "EE-043",
      "name": "GAYOSA, KHENA KATLEEN G.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-044",
      "code": "EE-044",
      "studentCode": "EE-044",
      "name": "GERODIAS, BRENT GERSON A.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-045",
      "code": "EE-045",
      "studentCode": "EE-045",
      "name": "GOMEZ, MA. ALSHICA K.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-046",
      "code": "EE-046",
      "studentCode": "EE-046",
      "name": "GONZALES, SEAN ALLEN M.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-047",
      "code": "EE-047",
      "studentCode": "EE-047",
      "name": "GUIRUELA, JAMES L.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-048",
      "code": "EE-048",
      "studentCode": "EE-048",
      "name": "HASHIM, BRINLY HAMIM M.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-049",
      "code": "EE-049",
      "studentCode": "EE-049",
      "name": "HERNANDEZ, JAY CYRIL C.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-050",
      "code": "EE-050",
      "studentCode": "EE-050",
      "name": "HERNANDEZ, SAM ANDREI V.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-051",
      "code": "EE-051",
      "studentCode": "EE-051",
      "name": "IBARROLA, HANS KEN M.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-052",
      "code": "EE-052",
      "studentCode": "EE-052",
      "name": "JUANICO, NYNGEL S.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-053",
      "code": "EE-053",
      "studentCode": "EE-053",
      "name": "LACORTE, CRIS JASON M.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-054",
      "code": "EE-054",
      "studentCode": "EE-054",
      "name": "LAYACAN, VHEA EDRICH M.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-055",
      "code": "EE-055",
      "studentCode": "EE-055",
      "name": "LEGASPI, ULYCES P.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-056",
      "code": "EE-056",
      "studentCode": "EE-056",
      "name": "LOPEZ, CHARLES ROBERT L.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-057",
      "code": "EE-057",
      "studentCode": "EE-057",
      "name": "LUMBRES, DUSTIN M.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-058",
      "code": "EE-058",
      "studentCode": "EE-058",
      "name": "MACALALAD, FRANS RYLCO C.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-059",
      "code": "EE-059",
      "studentCode": "EE-059",
      "name": "MAGSOMBOL, JAMES RYAN J.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-060",
      "code": "EE-060",
      "studentCode": "EE-060",
      "name": "MALABAG, JOHN MICHAEL B.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-061",
      "code": "EE-061",
      "studentCode": "EE-061",
      "name": "MALANA, ROSSETTE NATHALIE A.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-062",
      "code": "EE-062",
      "studentCode": "EE-062",
      "name": "MALOLOY-ON, DEFFERSON JOHN T.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-063",
      "code": "EE-063",
      "studentCode": "EE-063",
      "name": "MAÑOBRA, LORENZO A.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-064",
      "code": "EE-064",
      "studentCode": "EE-064",
      "name": "MAPUTE, CHRIS CORNELL F.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-065",
      "code": "EE-065",
      "studentCode": "EE-065",
      "name": "MICA, CLARK DUSTIN COSME D.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-066",
      "code": "EE-066",
      "studentCode": "EE-066",
      "name": "MILCA, JERALD O.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-067",
      "code": "EE-067",
      "studentCode": "EE-067",
      "name": "MONDIA, JOHN VINCENT M.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-068",
      "code": "EE-068",
      "studentCode": "EE-068",
      "name": "MORAN, MARK NIÑO A.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-069",
      "code": "EE-069",
      "studentCode": "EE-069",
      "name": "MOSCA, JAMESTEVE SEAN G.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-070",
      "code": "EE-070",
      "studentCode": "EE-070",
      "name": "NUNO, ROYD ALFONSO M.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-071",
      "code": "EE-071",
      "studentCode": "EE-071",
      "name": "OPULENCIA, AARON ALLEXIS S.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-072",
      "code": "EE-072",
      "studentCode": "EE-072",
      "name": "ORTEGA, JAMES V.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-073",
      "code": "EE-073",
      "studentCode": "EE-073",
      "name": "ORTIZ, PAULA EUNISE A.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-074",
      "code": "EE-074",
      "studentCode": "EE-074",
      "name": "PABALATE, RHED S.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-075",
      "code": "EE-075",
      "studentCode": "EE-075",
      "name": "PAMPLONA, NELO DRIX T.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-076",
      "code": "EE-076",
      "studentCode": "EE-076",
      "name": "PANARIGAN, KARLO P.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-077",
      "code": "EE-077",
      "studentCode": "EE-077",
      "name": "PANER, ORLANDO GABRIEL C.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-078",
      "code": "EE-078",
      "studentCode": "EE-078",
      "name": "PATARAY, EUNICE L.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-079",
      "code": "EE-079",
      "studentCode": "EE-079",
      "name": "PECAYO, RHIANE MAE L.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-080",
      "code": "EE-080",
      "studentCode": "EE-080",
      "name": "PEDRAJA, JOMARI D.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-081",
      "code": "EE-081",
      "studentCode": "EE-081",
      "name": "PEREZ, JARED ELWOOD P.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-082",
      "code": "EE-082",
      "studentCode": "EE-082",
      "name": "PIOQUINTO, ELREY D.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-083",
      "code": "EE-083",
      "studentCode": "EE-083",
      "name": "PIZARRA, DOMAR A.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-084",
      "code": "EE-084",
      "studentCode": "EE-084",
      "name": "RAMILO, DRACIR JOSH G.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-085",
      "code": "EE-085",
      "studentCode": "EE-085",
      "name": "SALIBA, DEROSS D.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-086",
      "code": "EE-086",
      "studentCode": "EE-086",
      "name": "SANTOS, RAFAEL P.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-087",
      "code": "EE-087",
      "studentCode": "EE-087",
      "name": "SOLATORIO, JOHN JETRO C.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-088",
      "code": "EE-088",
      "studentCode": "EE-088",
      "name": "TABAMO, EJ GODWIN B.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-089",
      "code": "EE-089",
      "studentCode": "EE-089",
      "name": "TORIAGA, KURT LOUISE M.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-090",
      "code": "EE-090",
      "studentCode": "EE-090",
      "name": "URRIZA, BRYLLE KRISTEN A.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-091",
      "code": "EE-091",
      "studentCode": "EE-091",
      "name": "VILLARE, RYE LEE E.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "EE-092",
      "code": "EE-092",
      "studentCode": "EE-092",
      "name": "YABUT, CRISENCIO JR. P.",
      "team": "ee",
      "teamName": "ELECTRICAL ENGINEERING"
    },
    {
      "id": "CPE-001",
      "code": "CPE-001",
      "studentCode": "CPE-001",
      "name": "AMICAN, GABRIEL EMMANUEL B.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-002",
      "code": "CPE-002",
      "studentCode": "CPE-002",
      "name": "ANDAYA, SEAN COLLIN S.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-003",
      "code": "CPE-003",
      "studentCode": "CPE-003",
      "name": "ARQUILLO, MARK P.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-004",
      "code": "CPE-004",
      "studentCode": "CPE-004",
      "name": "ARROCO, DAVID SZUIN R.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-005",
      "code": "CPE-005",
      "studentCode": "CPE-005",
      "name": "BALBUENA, EDUARDO III J.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-006",
      "code": "CPE-006",
      "studentCode": "CPE-006",
      "name": "BARBON, ANNE KIRSTEN V.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-007",
      "code": "CPE-007",
      "studentCode": "CPE-007",
      "name": "BARCELLANO, MAR JOSEF V.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-008",
      "code": "CPE-008",
      "studentCode": "CPE-008",
      "name": "BEGAS, JAYCEL NIEL C.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-009",
      "code": "CPE-009",
      "studentCode": "CPE-009",
      "name": "BIESCAS, REYSSA JEAN D.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-010",
      "code": "CPE-010",
      "studentCode": "CPE-010",
      "name": "BITANA, MARK EDRIAN J.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-011",
      "code": "CPE-011",
      "studentCode": "CPE-011",
      "name": "BUSTAMANTE, DANIEL JOHN T.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-012",
      "code": "CPE-012",
      "studentCode": "CPE-012",
      "name": "CAMACHO, BERNARD JOEY B.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-013",
      "code": "CPE-013",
      "studentCode": "CPE-013",
      "name": "CAMBEL, KIRSTEN M.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-014",
      "code": "CPE-014",
      "studentCode": "CPE-014",
      "name": "CANTALEJO, KAIDE M.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-015",
      "code": "CPE-015",
      "studentCode": "CPE-015",
      "name": "CASTILLO, CHINI MARIELLI",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-016",
      "code": "CPE-016",
      "studentCode": "CPE-016",
      "name": "CENA, LEO M.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-017",
      "code": "CPE-017",
      "studentCode": "CPE-017",
      "name": "CESAR, KLYDE GABRIEL A.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-018",
      "code": "CPE-018",
      "studentCode": "CPE-018",
      "name": "CLARO, SHAWN ROMINICK T.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-019",
      "code": "CPE-019",
      "studentCode": "CPE-019",
      "name": "CONEJARES, RODCORT ELVEN V.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-020",
      "code": "CPE-020",
      "studentCode": "CPE-020",
      "name": "DE JESUS, KENNETH G.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-021",
      "code": "CPE-021",
      "studentCode": "CPE-021",
      "name": "DOLLETON, DWAYNE KENSHIN R.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-022",
      "code": "CPE-022",
      "studentCode": "CPE-022",
      "name": "DOMINGO, JOSE URBANO B.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-023",
      "code": "CPE-023",
      "studentCode": "CPE-023",
      "name": "DULLAS, CHARLES EZEKIEL F.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-024",
      "code": "CPE-024",
      "studentCode": "CPE-024",
      "name": "DY, LEIGH ICEN G.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-025",
      "code": "CPE-025",
      "studentCode": "CPE-025",
      "name": "ESCULTURA, PRINCE ERROLL M.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-026",
      "code": "CPE-026",
      "studentCode": "CPE-026",
      "name": "ESTEBAN, JEANE ANDREI C.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-027",
      "code": "CPE-027",
      "studentCode": "CPE-027",
      "name": "GALOYO, IRIS L.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-028",
      "code": "CPE-028",
      "studentCode": "CPE-028",
      "name": "GARCIA, JUSTIN ADRIENN P.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-029",
      "code": "CPE-029",
      "studentCode": "CPE-029",
      "name": "KODAKA, KIAN KENTA D.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-030",
      "code": "CPE-030",
      "studentCode": "CPE-030",
      "name": "LLANETA, JOHN VINCENT M.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-031",
      "code": "CPE-031",
      "studentCode": "CPE-031",
      "name": "LLANETA, KENJIE-LIM A.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-032",
      "code": "CPE-032",
      "studentCode": "CPE-032",
      "name": "MAALINDOG, ALAN PAUL C.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-033",
      "code": "CPE-033",
      "studentCode": "CPE-033",
      "name": "MAGNO, DAN LLOYD L.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-034",
      "code": "CPE-034",
      "studentCode": "CPE-034",
      "name": "MALABANAN, JUSTINE RALPH B.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-035",
      "code": "CPE-035",
      "studentCode": "CPE-035",
      "name": "MANE, FRANCINE JADE G.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-036",
      "code": "CPE-036",
      "studentCode": "CPE-036",
      "name": "MEDINA, ALLAEN MARK S.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-037",
      "code": "CPE-037",
      "studentCode": "CPE-037",
      "name": "NAGPALA, EERSEL ANDREY V.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-038",
      "code": "CPE-038",
      "studentCode": "CPE-038",
      "name": "OCASLA, NORMAN DAVID J.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-039",
      "code": "CPE-039",
      "studentCode": "CPE-039",
      "name": "OLIVAR, CHRISTIAN JOSH D.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-040",
      "code": "CPE-040",
      "studentCode": "CPE-040",
      "name": "OPULENCIA, ALLEXASHEENA DEINNE S.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-041",
      "code": "CPE-041",
      "studentCode": "CPE-041",
      "name": "ORDANZA, JAMEZ IVAN V.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-042",
      "code": "CPE-042",
      "studentCode": "CPE-042",
      "name": "PADUA, RHIANA ASHLEY G.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-043",
      "code": "CPE-043",
      "studentCode": "CPE-043",
      "name": "PALISOC, MARK ELEAZAR M.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-044",
      "code": "CPE-044",
      "studentCode": "CPE-044",
      "name": "PALOMO, CHARLEMAGNE B.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-045",
      "code": "CPE-045",
      "studentCode": "CPE-045",
      "name": "PEDRIGAL, MARGARETE JANE PAULEY D.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-046",
      "code": "CPE-046",
      "studentCode": "CPE-046",
      "name": "PETATE, KARL JANSEN S.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-047",
      "code": "CPE-047",
      "studentCode": "CPE-047",
      "name": "PETATE, KIERVY R.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-048",
      "code": "CPE-048",
      "studentCode": "CPE-048",
      "name": "RAFA, RAFAEL ALEX A.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-049",
      "code": "CPE-049",
      "studentCode": "CPE-049",
      "name": "REGASPI, MARY MARGARETTE D.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-050",
      "code": "CPE-050",
      "studentCode": "CPE-050",
      "name": "RUANTO, RANIELLE JEDD R.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-051",
      "code": "CPE-051",
      "studentCode": "CPE-051",
      "name": "SANTIAGO, ULRICA LORAINE D.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-052",
      "code": "CPE-052",
      "studentCode": "CPE-052",
      "name": "SASPA, ASHLEY KHATE R.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-053",
      "code": "CPE-053",
      "studentCode": "CPE-053",
      "name": "SERRANA, JESSIE B.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-054",
      "code": "CPE-054",
      "studentCode": "CPE-054",
      "name": "TAN, SIMON M.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-055",
      "code": "CPE-055",
      "studentCode": "CPE-055",
      "name": "TOLENTINO, BENJAMIN M.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-056",
      "code": "CPE-056",
      "studentCode": "CPE-056",
      "name": "TORALES, REUEL ANNE A.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-057",
      "code": "CPE-057",
      "studentCode": "CPE-057",
      "name": "TORRES, JOSHUA ALLEN D.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-058",
      "code": "CPE-058",
      "studentCode": "CPE-058",
      "name": "VIVAS, BENEDICT MIGUEL C.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-059",
      "code": "CPE-059",
      "studentCode": "CPE-059",
      "name": "YANSON, RANDEL C.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "CPE-060",
      "code": "CPE-060",
      "studentCode": "CPE-060",
      "name": "ZARSUELO, JOHN GAVERIEL D.",
      "team": "cpe",
      "teamName": "COMPUTER ENGINEERING"
    },
    {
      "id": "ECE-001",
      "code": "ECE-001",
      "studentCode": "ECE-001",
      "name": "MARQUEZ, GISELLE A.",
      "team": "ece",
      "teamName": "ELECTRONICS ENGINEERING"
    },
    {
      "id": "ECE-002",
      "code": "ECE-002",
      "studentCode": "ECE-002",
      "name": "GUANIESO, ANGELLIC RENANELYN O.",
      "team": "ece",
      "teamName": "ELECTRONICS ENGINEERING"
    },
    {
      "id": "ECE-003",
      "code": "ECE-003",
      "studentCode": "ECE-003",
      "name": "CAMAT, RENUARD A.",
      "team": "ece",
      "teamName": "ELECTRONICS ENGINEERING"
    },
    {
      "id": "ECE-004",
      "code": "ECE-004",
      "studentCode": "ECE-004",
      "name": "ALKHATIB, SAMER B.",
      "team": "ece",
      "teamName": "ELECTRONICS ENGINEERING"
    },
    {
      "id": "ECE-005",
      "code": "ECE-005",
      "studentCode": "ECE-005",
      "name": "OPULENCIA, MARIA GEE-ANNE P.",
      "team": "ece",
      "teamName": "ELECTRONICS ENGINEERING"
    },
    {
      "id": "ECE-006",
      "code": "ECE-006",
      "studentCode": "ECE-006",
      "name": "GAMITIN, JOMAR GABRIEL B.",
      "team": "ece",
      "teamName": "ELECTRONICS ENGINEERING"
    },
    {
      "id": "ECE-007",
      "code": "ECE-007",
      "studentCode": "ECE-007",
      "name": "PAGUINTO, OLIEMAR LEINER P.",
      "team": "ece",
      "teamName": "ELECTRONICS ENGINEERING"
    },
    {
      "id": "ECE-008",
      "code": "ECE-008",
      "studentCode": "ECE-008",
      "name": "MARASIGAN, JERICHO MIGUEL R.",
      "team": "ece",
      "teamName": "ELECTRONICS ENGINEERING"
    },
    {
      "id": "ECE-009",
      "code": "ECE-009",
      "studentCode": "ECE-009",
      "name": "GUERRERO, OWEN DOMINIC V.",
      "team": "ece",
      "teamName": "ELECTRONICS ENGINEERING"
    },
    {
      "id": "ECE-010",
      "code": "ECE-010",
      "studentCode": "ECE-010",
      "name": "MENOR, ANGELO C.",
      "team": "ece",
      "teamName": "ELECTRONICS ENGINEERING"
    },
    {
      "id": "IE-001",
      "code": "IE-001",
      "studentCode": "IE-001",
      "name": "ABAD, JUDITH MARIAN SILVA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-002",
      "code": "IE-002",
      "studentCode": "IE-002",
      "name": "AGUILAR, RUSSEL ALLEN CASTILLO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-003",
      "code": "IE-003",
      "studentCode": "IE-003",
      "name": "BALLEZA, BRUNZON ANSANO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-004",
      "code": "IE-004",
      "studentCode": "IE-004",
      "name": "BAUTISTA, MA. CHARICE JAYONA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-005",
      "code": "IE-005",
      "studentCode": "IE-005",
      "name": "CANATUAN, YSABELA MERCADO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-006",
      "code": "IE-006",
      "studentCode": "IE-006",
      "name": "CICERON, HANS GABRIEL CONJARES",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-007",
      "code": "IE-007",
      "studentCode": "IE-007",
      "name": "CONSIGNADO, KASSANDRA SARMIENTO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-008",
      "code": "IE-008",
      "studentCode": "IE-008",
      "name": "DE LEON, YANZ MARLOU BAYBAY",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-009",
      "code": "IE-009",
      "studentCode": "IE-009",
      "name": "ELISAN, JOSHUA BRYCE OLINARES",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-010",
      "code": "IE-010",
      "studentCode": "IE-010",
      "name": "ESTRADA, JERILOU MAE NAZARETH",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-011",
      "code": "IE-011",
      "studentCode": "IE-011",
      "name": "FRANCISCO, ANDRES LUIS MADEJA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-012",
      "code": "IE-012",
      "studentCode": "IE-012",
      "name": "HALILI, MARK CLARENCE ALDABE",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-013",
      "code": "IE-013",
      "studentCode": "IE-013",
      "name": "IYOG, HANNAH MEKIE SHANE JUNGAY",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-014",
      "code": "IE-014",
      "studentCode": "IE-014",
      "name": "KODAKA, KYLE KENYA DELUANA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-015",
      "code": "IE-015",
      "studentCode": "IE-015",
      "name": "LARINO, JOANA SOPHIA BEATRICE REYEG",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-016",
      "code": "IE-016",
      "studentCode": "IE-016",
      "name": "LECHUGA, CASSANDRA SHANEYA MANINGAS",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-017",
      "code": "IE-017",
      "studentCode": "IE-017",
      "name": "LEGASPI, TRAVIS MATHEW PARO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-018",
      "code": "IE-018",
      "studentCode": "IE-018",
      "name": "MALLORCA, ANTON JOSEPH NARVAEZ",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-019",
      "code": "IE-019",
      "studentCode": "IE-019",
      "name": "NIEM, JARED CIRENE GOLE",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-020",
      "code": "IE-020",
      "studentCode": "IE-020",
      "name": "OCAMPO, RENZO HADI",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-021",
      "code": "IE-021",
      "studentCode": "IE-021",
      "name": "PADIT, ANDREI ANG",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-022",
      "code": "IE-022",
      "studentCode": "IE-022",
      "name": "PALIZA, PATRICK ANJELLO SOLINAP",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-023",
      "code": "IE-023",
      "studentCode": "IE-023",
      "name": "RAÑOLA, PRINCESS ARIANI ROXAS",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-024",
      "code": "IE-024",
      "studentCode": "IE-024",
      "name": "ROSALES, LOUISE ALLEN BALBIN",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-025",
      "code": "IE-025",
      "studentCode": "IE-025",
      "name": "SOJOR, ALBERT MARCELO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-026",
      "code": "IE-026",
      "studentCode": "IE-026",
      "name": "VALIÑA, ANGELA CLAIRE PERILLO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-027",
      "code": "IE-027",
      "studentCode": "IE-027",
      "name": "BANTOC, VINCE LYNDON ABENDAN",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-028",
      "code": "IE-028",
      "studentCode": "IE-028",
      "name": "BESAS, CHEN ZHEN LUMACANG",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-029",
      "code": "IE-029",
      "studentCode": "IE-029",
      "name": "DOROJA, PRINCESS FHAYE COLLINE TAMONDONG",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-030",
      "code": "IE-030",
      "studentCode": "IE-030",
      "name": "FRANCISCO, DERRICK GABRIEL ESCONDO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-031",
      "code": "IE-031",
      "studentCode": "IE-031",
      "name": "GALINDEZ, JOHN PAUL JAVIER",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-032",
      "code": "IE-032",
      "studentCode": "IE-032",
      "name": "GARDAYA, PRINCESS JANEL DE OCAMPO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-033",
      "code": "IE-033",
      "studentCode": "IE-033",
      "name": "GUELAS, MARK KRISTIAN ROMEO DUSONG",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-034",
      "code": "IE-034",
      "studentCode": "IE-034",
      "name": "IMSON, CHRISTIAN SIMON OLIVEROS",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-035",
      "code": "IE-035",
      "studentCode": "IE-035",
      "name": "JAYME, PRINCESS MAE MANAIG",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-036",
      "code": "IE-036",
      "studentCode": "IE-036",
      "name": "MALABANAN, ALJON RAMOS",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-037",
      "code": "IE-037",
      "studentCode": "IE-037",
      "name": "MALATE, LUJILL DYLAN SEÑORISES",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-038",
      "code": "IE-038",
      "studentCode": "IE-038",
      "name": "MANNAN, ABDULHAFIDZ MAUJOD",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-039",
      "code": "IE-039",
      "studentCode": "IE-039",
      "name": "MILANES, SHANE SALIBIO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-040",
      "code": "IE-040",
      "studentCode": "IE-040",
      "name": "NAVARRO, NEON GENESIS DE CASTRO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-041",
      "code": "IE-041",
      "studentCode": "IE-041",
      "name": "NOBLEFRANCA, VARY ALEM CANDELARIA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-042",
      "code": "IE-042",
      "studentCode": "IE-042",
      "name": "OQUERIA, CAMILLE ANNE CANLOBO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-043",
      "code": "IE-043",
      "studentCode": "IE-043",
      "name": "ORELLANES, JOHN MARK BATASINGEN",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-044",
      "code": "IE-044",
      "studentCode": "IE-044",
      "name": "PACALDO, JHAYSAMEL ALALIM",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-045",
      "code": "IE-045",
      "studentCode": "IE-045",
      "name": "PINEDA, KIENNA DENISE ORUGA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-046",
      "code": "IE-046",
      "studentCode": "IE-046",
      "name": "RAMILO, JONAIRA MARI LUCIDO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-047",
      "code": "IE-047",
      "studentCode": "IE-047",
      "name": "RIVERA, RALPH HENRY CAAGBAY",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-048",
      "code": "IE-048",
      "studentCode": "IE-048",
      "name": "ROBLES, MARK ANDREI BANIGO-OS",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-049",
      "code": "IE-049",
      "studentCode": "IE-049",
      "name": "SUAREZ, KEN DELA CRUZ",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-050",
      "code": "IE-050",
      "studentCode": "IE-050",
      "name": "SUATING, DARVIE ANGELO DELA PEÑA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-051",
      "code": "IE-051",
      "studentCode": "IE-051",
      "name": "ATENCIO, IRISH MAE ADRIATICO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-052",
      "code": "IE-052",
      "studentCode": "IE-052",
      "name": "BAUTISTA, MAURHIZ LIRA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-053",
      "code": "IE-053",
      "studentCode": "IE-053",
      "name": "BONIFACIO, MARC ANTHONY PEREZ",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-054",
      "code": "IE-054",
      "studentCode": "IE-054",
      "name": "BUSTAMANTE, ZYRUS DIMAANO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-055",
      "code": "IE-055",
      "studentCode": "IE-055",
      "name": "CASAJE, PRINCESS JANE DEQUIÑA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-056",
      "code": "IE-056",
      "studentCode": "IE-056",
      "name": "DALIS, LESTER MARU CABRERA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-057",
      "code": "IE-057",
      "studentCode": "IE-057",
      "name": "DE LA CRUZ, CHRISTIAN EARL MANANGAN",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-058",
      "code": "IE-058",
      "studentCode": "IE-058",
      "name": "DELA TORRE, ANGELICA FAYE TUBILLO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-059",
      "code": "IE-059",
      "studentCode": "IE-059",
      "name": "JACINTO, GILLIANE MARGARETTE CREDO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-060",
      "code": "IE-060",
      "studentCode": "IE-060",
      "name": "LAOMOC, JANSENN LOU DIMALALUAN",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-061",
      "code": "IE-061",
      "studentCode": "IE-061",
      "name": "LUBATON, ALTHEA FEI MOLINTAPANG",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-062",
      "code": "IE-062",
      "studentCode": "IE-062",
      "name": "LUMBRES, JENELLE MANIMTIM",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-063",
      "code": "IE-063",
      "studentCode": "IE-063",
      "name": "MALBAS, MARJORI DAUSON",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-064",
      "code": "IE-064",
      "studentCode": "IE-064",
      "name": "MANUEL, CARL JUSTIN BUENA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-065",
      "code": "IE-065",
      "studentCode": "IE-065",
      "name": "MARIANO, IVAN CLARK JORISH MENDOZA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-066",
      "code": "IE-066",
      "studentCode": "IE-066",
      "name": "MARIANO, JUAN PAULO MIRASOL",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-067",
      "code": "IE-067",
      "studentCode": "IE-067",
      "name": "MATANGUIHAN, KYLA AVILA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-068",
      "code": "IE-068",
      "studentCode": "IE-068",
      "name": "MORADA, MICAIAH GWYNNETH GONZALES",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-069",
      "code": "IE-069",
      "studentCode": "IE-069",
      "name": "QUEZON, JOHN ARIEL ROSALES",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-070",
      "code": "IE-070",
      "studentCode": "IE-070",
      "name": "RAMIRO, JAYPEE DOMINGO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-071",
      "code": "IE-071",
      "studentCode": "IE-071",
      "name": "RAPAL, KHRISTIAN LEGASPI",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-072",
      "code": "IE-072",
      "studentCode": "IE-072",
      "name": "TAYONI, DUSTIN KYLE QUIJADA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-073",
      "code": "IE-073",
      "studentCode": "IE-073",
      "name": "TEMEÑA, MARK ANGELO BOMBITA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-074",
      "code": "IE-074",
      "studentCode": "IE-074",
      "name": "VIDAL, JULIAN VICTOR NARVAEZ",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-075",
      "code": "IE-075",
      "studentCode": "IE-075",
      "name": "VILLANUEVA, RALPH CYRIL VIDAERA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-076",
      "code": "IE-076",
      "studentCode": "IE-076",
      "name": "VIZCONDE, ARYZA GRACE ESCOBELLA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-077",
      "code": "IE-077",
      "studentCode": "IE-077",
      "name": "ALCASABAS, JERICHO CRIS ARCEO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-078",
      "code": "IE-078",
      "studentCode": "IE-078",
      "name": "AMPELOQUIO, JOHN ARMIL PILAR",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-079",
      "code": "IE-079",
      "studentCode": "IE-079",
      "name": "ANCAYAN, ALLUJ PHILIP BELEN",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-080",
      "code": "IE-080",
      "studentCode": "IE-080",
      "name": "BARRIENTOS, VINCENT BACANI",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-081",
      "code": "IE-081",
      "studentCode": "IE-081",
      "name": "BARUNDIA, BRYLLE RAPHAEL MANDIGMA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-082",
      "code": "IE-082",
      "studentCode": "IE-082",
      "name": "BAYOT, HELEINA JANE IGUAL",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-083",
      "code": "IE-083",
      "studentCode": "IE-083",
      "name": "CABALES, RAYVER JUSTINE NOCHETE",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-084",
      "code": "IE-084",
      "studentCode": "IE-084",
      "name": "CABUDSAN, CATHERINE JOY MUSNGI",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-085",
      "code": "IE-085",
      "studentCode": "IE-085",
      "name": "DISIMULACION, KIM BRAYN RAMOS",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-086",
      "code": "IE-086",
      "studentCode": "IE-086",
      "name": "IBO, JOHN LLOYD FARIÑAS",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-087",
      "code": "IE-087",
      "studentCode": "IE-087",
      "name": "LABUTAP, DAVE ALDRIN LARA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-088",
      "code": "IE-088",
      "studentCode": "IE-088",
      "name": "MARQUEZ, ARIES SALUD",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-089",
      "code": "IE-089",
      "studentCode": "IE-089",
      "name": "NENENG, FRANKY PARAISO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-090",
      "code": "IE-090",
      "studentCode": "IE-090",
      "name": "PEREZ, ZYREL MANIMTIM",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-091",
      "code": "IE-091",
      "studentCode": "IE-091",
      "name": "REGINIO JR., ROLANDO AMPELOQUIO",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-092",
      "code": "IE-092",
      "studentCode": "IE-092",
      "name": "RUEDA, MARCUS BELMONTE",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-093",
      "code": "IE-093",
      "studentCode": "IE-093",
      "name": "RUEDA, NICOLE BELMONTE",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-094",
      "code": "IE-094",
      "studentCode": "IE-094",
      "name": "TIAMSIM, LOREN JADE JANDUSAY",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-095",
      "code": "IE-095",
      "studentCode": "IE-095",
      "name": "TORRES, SER JOAQUIN EMMANUEL DELA VEGA",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-096",
      "code": "IE-096",
      "studentCode": "IE-096",
      "name": "TUIZA, LANZ ROBLES",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "IE-097",
      "code": "IE-097",
      "studentCode": "IE-097",
      "name": "VELASCO, PRINCE CHOLO MASAGNAY",
      "team": "ie",
      "teamName": "INDUSTRIAL ENGINEERING"
    },
    {
      "id": "CE-001",
      "code": "CE-001",
      "studentCode": "CE-001",
      "name": "ACLAN, SHAYNE PRANCESS E.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-002",
      "code": "CE-002",
      "studentCode": "CE-002",
      "name": "ACULA, MARY HONEY KAYE C.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-003",
      "code": "CE-003",
      "studentCode": "CE-003",
      "name": "AGUANTA, ALYSSA A.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-004",
      "code": "CE-004",
      "studentCode": "CE-004",
      "name": "ALBUFERA, RALF HOMER F.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-005",
      "code": "CE-005",
      "studentCode": "CE-005",
      "name": "ALCANTARA, LIAM GABRIEL L.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-006",
      "code": "CE-006",
      "studentCode": "CE-006",
      "name": "ALMEDA, MARIONNE C.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-007",
      "code": "CE-007",
      "studentCode": "CE-007",
      "name": "ALMONTE, YAEL GABRIEL S.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-008",
      "code": "CE-008",
      "studentCode": "CE-008",
      "name": "AMANTE, CYRA IYA A.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-009",
      "code": "CE-009",
      "studentCode": "CE-009",
      "name": "AMPER, DIVINE JOY B.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-010",
      "code": "CE-010",
      "studentCode": "CE-010",
      "name": "APOSTOL, APPLE-KRIS E.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-011",
      "code": "CE-011",
      "studentCode": "CE-011",
      "name": "AQUINO, JESSA MAE D.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-012",
      "code": "CE-012",
      "studentCode": "CE-012",
      "name": "ARABE, DOMINIC JAMES D.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-013",
      "code": "CE-013",
      "studentCode": "CE-013",
      "name": "ARBO, EVAN JEROME P.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-014",
      "code": "CE-014",
      "studentCode": "CE-014",
      "name": "ASUNCION, KRYSTAL CLAIRE L.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-015",
      "code": "CE-015",
      "studentCode": "CE-015",
      "name": "AVELLANO, FERLIONA C.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-016",
      "code": "CE-016",
      "studentCode": "CE-016",
      "name": "BALDERAMA, CHRISTIAN LLOYD B.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-017",
      "code": "CE-017",
      "studentCode": "CE-017",
      "name": "BALLESTEROS, KIRSTINE DOLL B.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-018",
      "code": "CE-018",
      "studentCode": "CE-018",
      "name": "BANSUELO, SHAINE LARA A.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-019",
      "code": "CE-019",
      "studentCode": "CE-019",
      "name": "BARREDO, JEWEL P.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-020",
      "code": "CE-020",
      "studentCode": "CE-020",
      "name": "BLAZA, ANGELICA LOURINE R.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-021",
      "code": "CE-021",
      "studentCode": "CE-021",
      "name": "BORLAGDATAN, REIGN ASHLEY P.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-022",
      "code": "CE-022",
      "studentCode": "CE-022",
      "name": "BREGANZA, JOHN LOYD R.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-023",
      "code": "CE-023",
      "studentCode": "CE-023",
      "name": "BUENAOBRA, MHICA S.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-024",
      "code": "CE-024",
      "studentCode": "CE-024",
      "name": "BUNDALIAN, KATHLEEN V.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-025",
      "code": "CE-025",
      "studentCode": "CE-025",
      "name": "CACAO, IRISH F.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-026",
      "code": "CE-026",
      "studentCode": "CE-026",
      "name": "CANCEJO, LORIE JANE M.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-027",
      "code": "CE-027",
      "studentCode": "CE-027",
      "name": "CAPIROSO, JEANIE AMBER L.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-028",
      "code": "CE-028",
      "studentCode": "CE-028",
      "name": "CASTRO, JEFFER KERBY M.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-029",
      "code": "CE-029",
      "studentCode": "CE-029",
      "name": "CLEMENTE, LERI ALEXANDRA S.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-030",
      "code": "CE-030",
      "studentCode": "CE-030",
      "name": "CONCEPCION, ROSELYN B.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-031",
      "code": "CE-031",
      "studentCode": "CE-031",
      "name": "CORDETA, LHORENCE BEIN M.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-032",
      "code": "CE-032",
      "studentCode": "CE-032",
      "name": "CORPUZ, JAZMIN MYKHAELA N.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-033",
      "code": "CE-033",
      "studentCode": "CE-033",
      "name": "COSICO, SOPHIA SANE A.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-034",
      "code": "CE-034",
      "studentCode": "CE-034",
      "name": "CRUZ, REI ANNE R.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-035",
      "code": "CE-035",
      "studentCode": "CE-035",
      "name": "CUBE, VAN JUZZEN SENA S.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-036",
      "code": "CE-036",
      "studentCode": "CE-036",
      "name": "CUÑADO, GIAN GABRIEL R.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-037",
      "code": "CE-037",
      "studentCode": "CE-037",
      "name": "DALISAY, APRIL CHARIZ C.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-038",
      "code": "CE-038",
      "studentCode": "CE-038",
      "name": "DALISAY, JOHN CHRIS P.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-039",
      "code": "CE-039",
      "studentCode": "CE-039",
      "name": "DE ALDAY, JOHN FLOYD A.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-040",
      "code": "CE-040",
      "studentCode": "CE-040",
      "name": "DE CASTRO, CHERRYANN L.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-041",
      "code": "CE-041",
      "studentCode": "CE-041",
      "name": "DE JUAN, SHAINE H.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-042",
      "code": "CE-042",
      "studentCode": "CE-042",
      "name": "DE LEON, KIM ALLAINE B.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-043",
      "code": "CE-043",
      "studentCode": "CE-043",
      "name": "DE MESA, LORAINNE P.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-044",
      "code": "CE-044",
      "studentCode": "CE-044",
      "name": "DEGULLADO, ANA MARIE G.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-045",
      "code": "CE-045",
      "studentCode": "CE-045",
      "name": "DELA CRUZ, CZARINAH BEATRICE C.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-046",
      "code": "CE-046",
      "studentCode": "CE-046",
      "name": "DELOS REYES, JOROSS MARK E.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-047",
      "code": "CE-047",
      "studentCode": "CE-047",
      "name": "DEMDAM, MARK GERALD F.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-048",
      "code": "CE-048",
      "studentCode": "CE-048",
      "name": "DICHOSO, JAMES RUSSEL R.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-049",
      "code": "CE-049",
      "studentCode": "CE-049",
      "name": "DOBLES II, ARTURO R.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-050",
      "code": "CE-050",
      "studentCode": "CE-050",
      "name": "DOSADO, CHLOE NICOLE A.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-051",
      "code": "CE-051",
      "studentCode": "CE-051",
      "name": "ENCANTO, GLYCEL R.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-052",
      "code": "CE-052",
      "studentCode": "CE-052",
      "name": "ENCARNACION, JASPER R.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-053",
      "code": "CE-053",
      "studentCode": "CE-053",
      "name": "ENRIQUEZ, MARK DAVE R.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-054",
      "code": "CE-054",
      "studentCode": "CE-054",
      "name": "ESCALANTE, FREDERICK ERVIN ALLEN T.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-055",
      "code": "CE-055",
      "studentCode": "CE-055",
      "name": "ESPINA, VENUS L.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-056",
      "code": "CE-056",
      "studentCode": "CE-056",
      "name": "EVANGELISTA, JOHN DOMINIC B.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-057",
      "code": "CE-057",
      "studentCode": "CE-057",
      "name": "FAMILARAN, PRINCE MHUEL B.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-058",
      "code": "CE-058",
      "studentCode": "CE-058",
      "name": "FERRER, DENNIS PIOLO D.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-059",
      "code": "CE-059",
      "studentCode": "CE-059",
      "name": "FIGUEROA, JUSTIN V.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-060",
      "code": "CE-060",
      "studentCode": "CE-060",
      "name": "FILIO, DANIEL S.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-061",
      "code": "CE-061",
      "studentCode": "CE-061",
      "name": "FLORES, MEL GIBSON L.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-062",
      "code": "CE-062",
      "studentCode": "CE-062",
      "name": "FLORORITA, DHONA MARIE A.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-063",
      "code": "CE-063",
      "studentCode": "CE-063",
      "name": "FRANCISCO, MARC JUSTINE B.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-064",
      "code": "CE-064",
      "studentCode": "CE-064",
      "name": "GALANG, SAMANTHA ADRIENNE Q.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-065",
      "code": "CE-065",
      "studentCode": "CE-065",
      "name": "GALINATO, LORENZO DUSTIN B.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-066",
      "code": "CE-066",
      "studentCode": "CE-066",
      "name": "GALIZA, TRISTAN HARVEY M.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-067",
      "code": "CE-067",
      "studentCode": "CE-067",
      "name": "GARBO, NIRAH S.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-068",
      "code": "CE-068",
      "studentCode": "CE-068",
      "name": "GARCIA, ELISHA RHEIN MULIMBAYAN M.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-069",
      "code": "CE-069",
      "studentCode": "CE-069",
      "name": "GARCIA, FRANCIS P.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-070",
      "code": "CE-070",
      "studentCode": "CE-070",
      "name": "GLINOGA, JHAY EL C.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-071",
      "code": "CE-071",
      "studentCode": "CE-071",
      "name": "GLIPO, CRISTINE NICOLE M.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-072",
      "code": "CE-072",
      "studentCode": "CE-072",
      "name": "GO, MIASHI I.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-073",
      "code": "CE-073",
      "studentCode": "CE-073",
      "name": "GRAPANI, LEEAN MAE T.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-074",
      "code": "CE-074",
      "studentCode": "CE-074",
      "name": "HAEL, MICHAEL CLARK C.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-075",
      "code": "CE-075",
      "studentCode": "CE-075",
      "name": "HAEL, EDMELYN D.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-076",
      "code": "CE-076",
      "studentCode": "CE-076",
      "name": "JAVIER, TRIXIE B.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-077",
      "code": "CE-077",
      "studentCode": "CE-077",
      "name": "JUANANE, LUIS JAN YVES M.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-078",
      "code": "CE-078",
      "studentCode": "CE-078",
      "name": "LABILLES, MARK DARYL R.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-079",
      "code": "CE-079",
      "studentCode": "CE-079",
      "name": "LAGDAMEN, MARK DADEN A.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-080",
      "code": "CE-080",
      "studentCode": "CE-080",
      "name": "LAGOC, EURIELLE CLAIRE L.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-081",
      "code": "CE-081",
      "studentCode": "CE-081",
      "name": "LAGRAZON, GIAN JUDD S.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-082",
      "code": "CE-082",
      "studentCode": "CE-082",
      "name": "LANSANGAN, JOHN DANIEL T.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-083",
      "code": "CE-083",
      "studentCode": "CE-083",
      "name": "LAPITAN, STEPHEN JACOB P.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-084",
      "code": "CE-084",
      "studentCode": "CE-084",
      "name": "LAVENTE, JUDY ANN A.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-085",
      "code": "CE-085",
      "studentCode": "CE-085",
      "name": "LAZARO, JARNIE CARL",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-086",
      "code": "CE-086",
      "studentCode": "CE-086",
      "name": "LEYCANO, JAMEROS A.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-087",
      "code": "CE-087",
      "studentCode": "CE-087",
      "name": "LOGO, KERVIN JON N.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-088",
      "code": "CE-088",
      "studentCode": "CE-088",
      "name": "LOPEZ, JOHN CARLO C.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-089",
      "code": "CE-089",
      "studentCode": "CE-089",
      "name": "LOPEZ, JOHN HENRY B.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-090",
      "code": "CE-090",
      "studentCode": "CE-090",
      "name": "LUGTU, CHRYSTAL SAPPHIRE D.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-091",
      "code": "CE-091",
      "studentCode": "CE-091",
      "name": "LULU, AIRA LEI C.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-092",
      "code": "CE-092",
      "studentCode": "CE-092",
      "name": "LUMBRES, JEROME B.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-093",
      "code": "CE-093",
      "studentCode": "CE-093",
      "name": "LUTA, TRISHA SHANE",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-094",
      "code": "CE-094",
      "studentCode": "CE-094",
      "name": "MACATOL, KESIA MAE A.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-095",
      "code": "CE-095",
      "studentCode": "CE-095",
      "name": "MAGTAN-AO, LOVELY B.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-096",
      "code": "CE-096",
      "studentCode": "CE-096",
      "name": "MANAIG, KURT ANDREI",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-097",
      "code": "CE-097",
      "studentCode": "CE-097",
      "name": "MANAIG, ROBBIE D.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-098",
      "code": "CE-098",
      "studentCode": "CE-098",
      "name": "MARASIGAN, KURT AERRON P.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-099",
      "code": "CE-099",
      "studentCode": "CE-099",
      "name": "MARIANO, JOHN PAUL S.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-100",
      "code": "CE-100",
      "studentCode": "CE-100",
      "name": "MARTEJA, JAMES HECTOR G.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-101",
      "code": "CE-101",
      "studentCode": "CE-101",
      "name": "MAYOLA, JASPER D.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-102",
      "code": "CE-102",
      "studentCode": "CE-102",
      "name": "MELENDREZ, AIRISH JAMES M.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-103",
      "code": "CE-103",
      "studentCode": "CE-103",
      "name": "MENDOZA, ROLDAN L.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-104",
      "code": "CE-104",
      "studentCode": "CE-104",
      "name": "MERAÑA, LORAINE KISHA A.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-105",
      "code": "CE-105",
      "studentCode": "CE-105",
      "name": "MERILLES, JHARED A.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-106",
      "code": "CE-106",
      "studentCode": "CE-106",
      "name": "MERTO, HANNAH CES C.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-107",
      "code": "CE-107",
      "studentCode": "CE-107",
      "name": "MIRANDA, RANIEL Y.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-108",
      "code": "CE-108",
      "studentCode": "CE-108",
      "name": "MORADA, JHANELL SOPHIA B.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-109",
      "code": "CE-109",
      "studentCode": "CE-109",
      "name": "NACARIO, SOFIA MARIE A.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-110",
      "code": "CE-110",
      "studentCode": "CE-110",
      "name": "NAVARRO, GERALD JAMES O.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-111",
      "code": "CE-111",
      "studentCode": "CE-111",
      "name": "NAVARTE, JOSEPH ROEM E.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-112",
      "code": "CE-112",
      "studentCode": "CE-112",
      "name": "OCTAVIO, LEVIN JANE D.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-113",
      "code": "CE-113",
      "studentCode": "CE-113",
      "name": "ORTIZ, ELEUMAR NIMROD ITHEL T.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-114",
      "code": "CE-114",
      "studentCode": "CE-114",
      "name": "PALASIGUE, ANDREI C.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-115",
      "code": "CE-115",
      "studentCode": "CE-115",
      "name": "PANTERIA, SHANELLE B.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-116",
      "code": "CE-116",
      "studentCode": "CE-116",
      "name": "PASATIEMPO, TRICIA N.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-117",
      "code": "CE-117",
      "studentCode": "CE-117",
      "name": "PASTRANA, RENMAR C.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-118",
      "code": "CE-118",
      "studentCode": "CE-118",
      "name": "PEDIDA, KELLY ANNE E.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-119",
      "code": "CE-119",
      "studentCode": "CE-119",
      "name": "PEREZ, CEEJHAE D.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-120",
      "code": "CE-120",
      "studentCode": "CE-120",
      "name": "PEREZ, REAH MAE",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-121",
      "code": "CE-121",
      "studentCode": "CE-121",
      "name": "PINEDA, RAISHELL B.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-122",
      "code": "CE-122",
      "studentCode": "CE-122",
      "name": "PISANTE, ERICA A.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-123",
      "code": "CE-123",
      "studentCode": "CE-123",
      "name": "RAFOL, REDGEM M.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-124",
      "code": "CE-124",
      "studentCode": "CE-124",
      "name": "RAMIREZ, JAYCEE D.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-125",
      "code": "CE-125",
      "studentCode": "CE-125",
      "name": "RAMOS, EARL JOSHUA E.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-126",
      "code": "CE-126",
      "studentCode": "CE-126",
      "name": "RAMOS, GLENN LEONARD C.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-127",
      "code": "CE-127",
      "studentCode": "CE-127",
      "name": "RAMOS, JANELLE F.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-128",
      "code": "CE-128",
      "studentCode": "CE-128",
      "name": "REBADEO, JHON RODNEY C.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-129",
      "code": "CE-129",
      "studentCode": "CE-129",
      "name": "REBLORA, JOHN NATHANIEL S.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-130",
      "code": "CE-130",
      "studentCode": "CE-130",
      "name": "REGONDOLA, MARIA ANDREA R.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-131",
      "code": "CE-131",
      "studentCode": "CE-131",
      "name": "RELENTE, JOSH KOJI L.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-132",
      "code": "CE-132",
      "studentCode": "CE-132",
      "name": "RELOJ, KARL ANDREI A.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-133",
      "code": "CE-133",
      "studentCode": "CE-133",
      "name": "REOGO, DRIZELLA JAYNE A.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-134",
      "code": "CE-134",
      "studentCode": "CE-134",
      "name": "RODRIGUEZ, RUSSEL P.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-135",
      "code": "CE-135",
      "studentCode": "CE-135",
      "name": "ROSARIO, LAURENZ JAMES I.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-136",
      "code": "CE-136",
      "studentCode": "CE-136",
      "name": "RUBILLA, VON LAUVIN J.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-137",
      "code": "CE-137",
      "studentCode": "CE-137",
      "name": "SALO, REIN SAM M.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-138",
      "code": "CE-138",
      "studentCode": "CE-138",
      "name": "SALVADOR, CARLOS IVAN N.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-139",
      "code": "CE-139",
      "studentCode": "CE-139",
      "name": "SANDOVAL, JOHN MICHAEL L.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-140",
      "code": "CE-140",
      "studentCode": "CE-140",
      "name": "SARDIDO, LARZ JENRIL R.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-141",
      "code": "CE-141",
      "studentCode": "CE-141",
      "name": "SECRETARIO, ELAIZA M.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-142",
      "code": "CE-142",
      "studentCode": "CE-142",
      "name": "SUBIA, CHIN AIKEE A.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-143",
      "code": "CE-143",
      "studentCode": "CE-143",
      "name": "TABION, RENDEL Q.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-144",
      "code": "CE-144",
      "studentCode": "CE-144",
      "name": "TAHAMIL, ARMANI M.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-145",
      "code": "CE-145",
      "studentCode": "CE-145",
      "name": "TAN, LORENCE DAVID R.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-146",
      "code": "CE-146",
      "studentCode": "CE-146",
      "name": "TEMPLONUEVO, NICOLE G.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-147",
      "code": "CE-147",
      "studentCode": "CE-147",
      "name": "TOLEDO, NICOLE P.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-148",
      "code": "CE-148",
      "studentCode": "CE-148",
      "name": "TORRECAMPO, CHRISTIAN ARON P.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-149",
      "code": "CE-149",
      "studentCode": "CE-149",
      "name": "TORRENDON, JASPHER M.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-150",
      "code": "CE-150",
      "studentCode": "CE-150",
      "name": "VILLA, DAISY ANN S.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-151",
      "code": "CE-151",
      "studentCode": "CE-151",
      "name": "VILLANUEVA, LUIS MIGUEL D.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    },
    {
      "id": "CE-152",
      "code": "CE-152",
      "studentCode": "CE-152",
      "name": "YLAGAN, ADRIENNE G.",
      "team": "ce",
      "teamName": "CIVIL ENGINEERING"
    }
  ],
  "guidelines": {
    "basketball": {
      "title": "Basketball Guidelines & Rules",
      "eligibility": "Must be a bonafide student of the College of Mechanical Engineering at UPHSD Calamba.",
      "roster": "5 active players on court, up to 7 reserve players (maximum 12 players per team).",
      "settings": "4 quarters of 8 minutes with running time until the final 2 minutes of each quarter. 1-minute interval between quarters and 5-minute halftime.",
      "defaultRule": "10-minute grace period from scheduled match time. Failure results in automatic forfeit.",
      "bracket": "Single Elimination (Configurable to Double Elimination or Round Robin)."
    },
    "volleyball": {
      "title": "Volleyball Guidelines & Rules",
      "eligibility": "Must be a bonafide student of the College of Mechanical Engineering at UPHSD Calamba.",
      "roster": "6 active players with at least 1 female player on court, up to 6 reserve players (maximum 12 players per team).",
      "settings": "Best of 3 sets. First 2 sets to 25 points. Third set (if needed) to 15 points. Must win by at least 2 points. 1-minute interval between sets.",
      "defaultRule": "10-minute grace period. Teams must have 6 players on court. Maximum 3 touches before crossing net.",
      "bracket": "Single Elimination (Configurable to Double Elimination or Round Robin)."
    },
    "badmintonSingles": {
      "title": "Badminton Singles Guidelines",
      "eligibility": "Must be a bonafide student of the College of Mechanical Engineering at UPHSD Calamba.",
      "format": "Singles (1 vs 1).",
      "scoring": "Standard BWF Rally Point System: Best 2 out of 3 games to 21 points. At 20-all, 2-point lead wins. At 29-all, 30th point wins.",
      "rules": "Contact below server waist. Lines are IN. 10-minute grace period.",
      "bracket": "Single Elimination (Configurable)."
    },
    "badmintonDoubles": {
      "title": "Badminton Doubles Guidelines",
      "eligibility": "Must be a bonafide student of the College of Mechanical Engineering at UPHSD Calamba.",
      "format": "Doubles (2 vs 2).",
      "scoring": "Standard BWF Rally Point System: Best 2 out of 3 games to 21 points. At 20-all, 2-point lead wins. At 29-all, 30th point wins.",
      "rules": "Server serves from right court on even team scores and left on odd. Only designated receiver may return serve.",
      "bracket": "Single Elimination (Configurable)."
    },
    "chess": {
      "title": "Board Games: Chess Guidelines",
      "eligibility": "Must be a bonafide student of the College of Mechanical Engineering at UPHSD Calamba.",
      "timeControl": "15 minutes per player. Exceeding time results in loss by clock fall.",
      "rules": "Touch-move rule enforced: If a player touches a piece, they must move that piece if a legal move exists.",
      "bracket": "Single Elimination / Swiss System. Best-of-3 for finals matches."
    },
    "scrabble": {
      "title": "Board Games: Scrabble Guidelines",
      "eligibility": "Must be a bonafide student of the College of Mechanical Engineering at UPHSD Calamba.",
      "timeControl": "25 minutes per player.",
      "rules": "Standard official dictionary rules apply. Challenges must be raised prior to the next player's turn.",
      "bracket": "Single Elimination / Round Robin."
    },
    "swimming": {
      "title": "Swimming Guidelines & Regulations",
      "eligibility": "Must be a bonafide student of the College of Mechanical Engineering at UPHSD Calamba.",
      "categories": "Freestyle, Backstroke, and Breaststroke (individual sprints / distance heats).",
      "strokeRules": "Breaststroke: Two-hand simultaneous wall touch. Backstroke: On back through finish. Freestyle: Any style, continuous lap touch.",
      "rules": "Single false start rule applies: early start leads to immediate disqualification. Obstructing other lanes is prohibited."
    },
    "amazingRace": {
      "title": "Amazing Race Guidelines",
      "teams": "4 teams of 10 members each.",
      "stations": "4 main stations + Final Escape Room in ME LAB (Rm120). Simultaneous start with staggered station sequence.",
      "rotation": "Team 1: 1->2->3->4; Team 2: 2->3->4->1; Team 3: 3->4->1->2; Team 4: 4->1->2->3.",
      "rules": "Each station gives one letter and position number. Collected code opens Escape Room. Fastest overall time wins."
    },
    "eggHunt": {
      "title": "Egg Hunt Guidelines & Pointing System",
      "eligibility": "Must be a bonafide student of the College of Mechanical Engineering at UPHSD Calamba.",
      "pointing": "Bronze Egg: 10 points | Silver Egg: 25 points | Gold Egg: 50 points.",
      "rules": "Must stay strictly within designated search boundaries. Unsportsmanlike conduct leads to DQ. Collected eggs must be scored before hunt time expires."
    },
    "tekken8": {
      "title": "Tekken 8 Championship Guidelines",
      "eligibility": "Must be a bonafide student of the College of Engineering at UPHSD Calamba.",
      "matchSettings": "60 seconds per round, Round Score Limit: 3. Regular matches: Best-of-3 (first to 2 wins). Finals: Best-of-5 (first to 3 wins).",
      "rules": "Random stage selection. Winner must keep character; loser may switch character or stage. Double elimination with Grand Finals reset."
    },
    "codm": {
      "title": "Call of Duty: Mobile Championship Guidelines",
      "roster": "5 players + optional 1-2 reserves.",
      "matchSettings": "Hardpoint (250 pts / 600s), Search & Destroy (7 round win limit / 120s), Control (3 round win limit / 90s).",
      "rules": "Unique Operator Skills per team. Weapon class roles enforced. Single or Double elimination."
    },
    "ml": {
      "title": "Mobile Legends: Bang Bang Guidelines",
      "roster": "5 players + optional 1-2 reserves.",
      "matchSettings": "Best of 3 (or Best of 1 / Best of 5). 10-minute ping check before match.",
      "rules": "Tournament lobby draft pick mode. Single or Double elimination."
    }
  }
};

const PROGRAM_FLOW_DATA = {
  title: "MEODL Official Program Flow",
  subtitle: "University of Perpetual Help System Dalta Calamba • Mechanical Engineering Society",
  sheets: [
    {
      id: "cover",
      title: "Program Flow Official Cover Pubmat",
      image: "./assets/official/program_flow_cover.jpg",
      description: "Official 3D Program Flow Pubmat with Mechanical Engineering Society seal"
    },
    {
      id: "part1",
      title: "Program Flow Part 1 (Morning Ceremonies & Basketball)",
      image: "./assets/official/program_flow_part1.jpg",
      description: "Registration, Ceremonies, Opening Remarks, Guest Speaker, Basketball Games 1-3"
    },
    {
      id: "part2",
      title: "Program Flow Part 2 (Swimming, Amazing Race, Lunch & Volleyball)",
      image: "./assets/official/program_flow_part2.jpg",
      description: "Swimming Heats (Freestyle, Backstroke, Breaststroke), Amazing Race, Lunch & Attendance Roll Call, Volleyball Games 1-2"
    },
    {
      id: "part3",
      title: "Program Flow Part 3 (Volleyball Game 3, Badminton, Awarding & After Party)",
      image: "./assets/official/program_flow_part3.jpg",
      description: "Volleyball Game 3, Badminton Singles & Doubles Games 1-3, Preparation for Awarding, Awarding, After Party"
    }
  ],
  schedule: [
    {
      time: "7:30 AM – 8:00 AM",
      activity: "Registration",
      person: "MES Officers",
      venue: "Main Venue Entrance / Registration Booth",
      block: "morning",
      badge: "CEREMONY",
      icon: "📝"
    },
    {
      time: "8:00 AM – 8:15 AM",
      activity: "Opening Prayer • National Anthem • Perpetual Hymn",
      person: "MES Officers",
      venue: "Main Stage / Arena Court",
      block: "morning",
      badge: "CEREMONY",
      icon: "🙏"
    },
    {
      time: "8:15 AM – 8:30 AM",
      activity: "Opening Remarks • Introduction of Guest Speaker",
      person: "Engr. Mc Luginn Seña",
      venue: "Main Stage",
      block: "morning",
      badge: "KEYNOTE",
      icon: "🎙️"
    },
    {
      time: "8:30 AM – 9:00 AM",
      activity: "Inspirational Message",
      person: "Guest Speaker",
      venue: "Main Stage",
      block: "morning",
      badge: "KEYNOTE",
      icon: "⭐"
    },
    {
      time: "9:00 AM – 9:50 AM",
      activity: "Basketball Game 1",
      person: "Edmel John Opinio, John Lenrick Prado",
      venue: "Basketball Court",
      block: "morning",
      sportId: "basketball",
      badge: "SPORTS",
      icon: "🏀"
    },
    {
      time: "9:00 AM – 9:30 AM",
      activity: "Swimming (Free Style)",
      person: "Ephraim Rick Bengco",
      venue: "Swimming Pool Area",
      block: "morning",
      sportId: "swimming",
      badge: "AQUATICS",
      icon: "🏊‍♂️"
    },
    {
      time: "9:30 AM – 10:00 AM",
      activity: "Swimming (Back Stroke)",
      person: "Ephraim Rick Bengco",
      venue: "Swimming Pool Area",
      block: "morning",
      sportId: "swimming",
      badge: "AQUATICS",
      icon: "🏊‍♂️"
    },
    {
      time: "9:50 AM – 10:40 AM",
      activity: "Basketball Game 2",
      person: "Edmel John Opinio, John Lenrick Prado",
      venue: "Basketball Court",
      block: "morning",
      sportId: "basketball",
      badge: "SPORTS",
      icon: "🏀"
    },
    {
      time: "10:00 AM – 10:30 AM",
      activity: "Swimming (Breaststroke)",
      person: "Ephraim Rick Bengco",
      venue: "Swimming Pool Area",
      block: "morning",
      sportId: "swimming",
      badge: "AQUATICS",
      icon: "🏊‍♂️"
    },
    {
      time: "10:40 AM – 11:30 AM",
      activity: "Basketball Game 3",
      person: "Edmel John Opinio, John Lenrick Prado",
      venue: "Basketball Court",
      block: "morning",
      sportId: "basketball",
      badge: "SPORTS",
      icon: "🏀"
    },
    {
      time: "9:00 AM – 12:00 NN",
      activity: "Amazing Race",
      person: "MES Officers",
      venue: "4 Campus Stations + Final Escape Room (ME LAB Rm120)",
      block: "morning",
      sportId: "amazingRace",
      badge: "CHALLENGE",
      icon: "🏃‍♂️"
    },
    {
      time: "12:00 NN – 1:00 PM",
      activity: "Lunch Break",
      person: "MES Officers",
      venue: "Designated Dining / Pavilion Area",
      block: "midday",
      badge: "INTERMISSION",
      icon: "🍱"
    },
    {
      time: "12:45 PM – 1:00 PM",
      activity: "Afternoon Attendance Roll Call",
      person: "MES Officers",
      venue: "Gate Marshal Scanner Stations & Main Pavilion",
      block: "midday",
      badge: "AUDIT & ROLL CALL",
      icon: "📲"
    },
    {
      time: "1:00 PM – 2:00 PM",
      activity: "Volleyball Game 1",
      person: "Vanna Jenille Alvarez, Gabrielle Lance Estrellado, Gabbielle Nero, Rowen Victor Pulgar",
      venue: "Volleyball Court",
      block: "afternoon",
      sportId: "volleyball",
      badge: "SPORTS",
      icon: "🏐"
    },
    {
      time: "1:00 PM – 1:30 PM",
      activity: "Badminton (Singles and Doubles) Game 1",
      person: "Ephraim Rick Bengco, Jaruzz Lancelot Dadis, Ryu Emanuel Argañosa, Edmel John Opinio",
      venue: "Badminton Courts",
      block: "afternoon",
      sportId: "badmintonSingles",
      badge: "SPORTS",
      icon: "🏸"
    },
    {
      time: "1:30 PM – 2:00 PM",
      activity: "Badminton (Singles and Doubles) Game 2",
      person: "Ephraim Rick Bengco, Jaruzz Lancelot Dadis, Ryu Emanuel Argañosa, Edmel John Opinio",
      venue: "Badminton Courts",
      block: "afternoon",
      sportId: "badmintonSingles",
      badge: "SPORTS",
      icon: "🏸"
    },
    {
      time: "2:00 PM – 3:00 PM",
      activity: "Volleyball Game 2",
      person: "Vanna Jenille Alvarez, Gabrielle Lance Estrellado, Gabbielle Nero, Rowen Victor Pulgar",
      venue: "Volleyball Court",
      block: "afternoon",
      sportId: "volleyball",
      badge: "SPORTS",
      icon: "🏐"
    },
    {
      time: "2:00 PM – 2:30 PM",
      activity: "Badminton (Singles and Doubles) Game 3",
      person: "Ephraim Rick Bengco, Jaruzz Lancelot Dadis, Ryu Emanuel Argañosa, Edmel John Opinio",
      venue: "Badminton Courts",
      block: "afternoon",
      sportId: "badmintonSingles",
      badge: "SPORTS",
      icon: "🏸"
    },
    {
      time: "3:00 PM – 4:00 PM",
      activity: "Volleyball Game 3",
      person: "Vanna Jenille Alvarez, Gabrielle Lance Estrellado, Gabbielle Nero, Rowen Victor Pulgar",
      venue: "Volleyball Court",
      block: "afternoon",
      sportId: "volleyball",
      badge: "SPORTS",
      icon: "🏐"
    },
    {
      time: "4:00 PM – 5:00 PM",
      activity: "Preparation for Awarding",
      person: "MES Officers",
      venue: "Main Stage / Tally Center",
      block: "evening",
      badge: "CEREMONY",
      icon: "🎖️"
    },
    {
      time: "5:00 PM – 6:00 PM",
      activity: "Awarding",
      person: "MES Officers",
      venue: "Main Stage",
      block: "evening",
      badge: "AWARDING",
      icon: "🏆"
    },
    {
      time: "6:00 PM – 9:00 PM",
      activity: "After Party",
      person: "MES Officers",
      venue: "Main Grounds & Fellowship Hall",
      block: "evening",
      badge: "FELLOWSHIP",
      icon: "🎉"
    }
  ]
};

window.PROGRAM_FLOW_DATA = PROGRAM_FLOW_DATA;
window.SPORT_BACKGROUNDS = window.SPORT_BACKGROUNDS || {};
window.SPORT_BACKGROUNDS.programFlow = './assets/official/program_flow_cover.jpg';

