/* MEODL Authoritative Roster & Guidelines Data */
const TEAM_ASSETS = {
  rankine: {
    name: 'TEAM RANKINE',
    cycle: 'Rankine Cycle',
    description: 'Steam turbine • thermal power generation',
    banner: './assets/rankine_banner.png',
    logo: './assets/rankine_logo.png',
    accent: 'crimson'
  },

  otto: {
    name: 'TEAM OTTO',
    cycle: 'Otto Cycle',
    description: 'Four-stroke • spark ignition',
    banner: './assets/otto_banner.png',
    logo: './assets/otto_logo.png',
    accent: 'amber'
  },

  brayton: {
    name: 'TEAM BRAYTON',
    cycle: 'Brayton Cycle',
    description: 'Gas turbine • jet propulsion',
    banner: './assets/brayton_banner.png',
    logo: './assets/brayton_logo.png',
    accent: 'cyan'
  },

  diesel: {
    name: 'TEAM DIESEL',
    cycle: 'Diesel Cycle',
    description: 'Compression ignition • heavy-duty power',
    banner: './assets/diesel_banner.png',
    logo: './assets/diesel_logo.png',
    accent: 'emerald'
  }
};

function getTeamKey(name) {
  if (!name) return null;
  const s = String(name).toUpperCase();
  if (s.includes('RANKINE')) return 'rankine';
  if (s.includes('OTTO')) return 'otto';
  if (s.includes('BRAYTON')) return 'brayton';
  if (s.includes('DIESEL')) return 'diesel';
  return null;
}

function assetFallback(img, fallback) {
  if (!img) return;
  img.onerror = null;
  img.src = fallback || './assets/mes_logo.png';
}

window.TEAM_ASSETS = TEAM_ASSETS;
window.getTeamKey = getTeamKey;
window.assetFallback = assetFallback;

window.MEODL_DATA = {
  "teams": [
    {
      "id": "rankine",
      "name": "TEAM RANKINE",
      "color": "crimson",
      "hex": "#ef4444",
      "badgeBg": "bg-red-950/80",
      "badgeText": "text-red-400",
      "badgeBorder": "border-red-700/80",
      "icon": "🔥",
      "count": 55
    },
    {
      "id": "otto",
      "name": "TEAM OTTO",
      "color": "amber",
      "hex": "#f59e0b",
      "badgeBg": "bg-amber-950/80",
      "badgeText": "text-amber-400",
      "badgeBorder": "border-amber-700/80",
      "icon": "⚡",
      "count": 36
    },
    {
      "id": "brayton",
      "name": "TEAM BRAYTON",
      "color": "cyan",
      "hex": "#06b6d4",
      "badgeBg": "bg-cyan-950/80",
      "badgeText": "text-cyan-400",
      "badgeBorder": "border-cyan-700/80",
      "icon": "🌪️",
      "count": 33
    },
    {
      "id": "diesel",
      "name": "TEAM DIESEL",
      "color": "emerald",
      "hex": "#10b981",
      "badgeBg": "bg-emerald-950/80",
      "badgeText": "text-emerald-400",
      "badgeBorder": "border-emerald-700/80",
      "icon": "⚙️",
      "count": 51
    }
  ],
  "rosters": {
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
    ]
  },
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
    "generals": {
      "title": "Board Games: Game of the Generals Guidelines",
      "eligibility": "Must be a bonafide student of the College of Mechanical Engineering at UPHSD Calamba.",
      "timeControl": "15 minutes per player.",
      "rules": "Neutral arbiter / referee inspects piece clashes according to rank hierarchy.",
      "bracket": "Single Elimination / Swiss."
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
