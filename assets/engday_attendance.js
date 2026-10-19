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

const EDAYS_2026_ADDITIONAL_ROSTER = [{"id":"EE-001","code":"EE-001","name":"ABAD, EARL JOHN A.","team":"EE"},{"id":"EE-002","code":"EE-002","name":"ABOCEJO, KING CHRISTOPHER","team":"EE"},{"id":"EE-003","code":"EE-003","name":"ABUDA, RUPERTH KNIE P.","team":"EE"},{"id":"EE-004","code":"EE-004","name":"ALANIB, RYLE BASTY B.","team":"EE"},{"id":"EE-005","code":"EE-005","name":"ALVAREZ, EVANN C.","team":"EE"},{"id":"EE-006","code":"EE-006","name":"ANACION, RHAINE DOMINIC D.","team":"EE"},{"id":"EE-007","code":"EE-007","name":"ANDAYA, JOHN MICHAEL L.","team":"EE"},{"id":"EE-008","code":"EE-008","name":"ANDRADA, JOSE ANDREI P.","team":"EE"},{"id":"EE-009","code":"EE-009","name":"ARANDIA, JOHN ANSELLE M.","team":"EE"},{"id":"EE-010","code":"EE-010","name":"ASCAÑO, RHICO S.","team":"EE"},{"id":"EE-011","code":"EE-011","name":"ASTROLABIO, RHAY JUSTIN P.","team":"EE"},{"id":"EE-012","code":"EE-012","name":"ATIENZA, PAUL JERICO H.","team":"EE"},{"id":"EE-013","code":"EE-013","name":"BAHOY, DWIGHT IVAN V.","team":"EE"},{"id":"EE-014","code":"EE-014","name":"BERMUDEZ, MARK LEO M.","team":"EE"},{"id":"EE-015","code":"EE-015","name":"BONCAJES, ROB MARTIN A.","team":"EE"},{"id":"EE-016","code":"EE-016","name":"CABARLES, TYRON Q.","team":"EE"},{"id":"EE-017","code":"EE-017","name":"CAJUCOM, BRYAN JAMES M.","team":"EE"},{"id":"EE-018","code":"EE-018","name":"CALMA, WENDELL D.","team":"EE"},{"id":"EE-019","code":"EE-019","name":"CANTARA, CHILVERT REIN C.","team":"EE"},{"id":"EE-020","code":"EE-020","name":"CARMONA, LEE ROUAN C.","team":"EE"},{"id":"EE-021","code":"EE-021","name":"CHAVEZ, JOHN DAVID B.","team":"EE"},{"id":"EE-022","code":"EE-022","name":"COMMINS, FRANCHESKA MAE A.","team":"EE"},{"id":"EE-023","code":"EE-023","name":"CRISTOBAL, CHRISTOPHER Y.","team":"EE"},{"id":"EE-024","code":"EE-024","name":"CUIZON, ALEXANDER D.","team":"EE"},{"id":"EE-025","code":"EE-025","name":"DALISAY, RANIEL T.","team":"EE"},{"id":"EE-026","code":"EE-026","name":"DAMAYO, CHRISTOPHER DANIELLE C.","team":"EE"},{"id":"EE-027","code":"EE-027","name":"DAPADAP, JOSHUA NAHIL N.","team":"EE"},{"id":"EE-028","code":"EE-028","name":"DATUS, RAIN R.","team":"EE"},{"id":"EE-029","code":"EE-029","name":"DE LEON, RITCH GERMAINE M.","team":"EE"},{"id":"EE-030","code":"EE-030","name":"DELA CRUZ, JOHN JOSEPH R.","team":"EE"},{"id":"EE-031","code":"EE-031","name":"DELOS REYES, JEROME V.","team":"EE"},{"id":"EE-032","code":"EE-032","name":"DELOS REYES, MARK STEPHEN B.","team":"EE"},{"id":"EE-033","code":"EE-033","name":"DULAY, GEIBRIEL RENE P.","team":"EE"},{"id":"EE-034","code":"EE-034","name":"ENDRINAL, EMMANUEL H.","team":"EE"},{"id":"EE-035","code":"EE-035","name":"EREJIAS, JOHN MARK M.","team":"EE"},{"id":"EE-036","code":"EE-036","name":"EUGENIO, JOHN MICHAEL A.","team":"EE"},{"id":"EE-037","code":"EE-037","name":"FAELMARIN, JHON AX'L F.","team":"EE"},{"id":"EE-038","code":"EE-038","name":"FLORES, NORIEL A.","team":"EE"},{"id":"EE-039","code":"EE-039","name":"FLORES, RHONA LYN R.","team":"EE"},{"id":"EE-040","code":"EE-040","name":"FLORIDO, DUSTINE ANGELO M.","team":"EE"},{"id":"EE-041","code":"EE-041","name":"GADAZA, JOSE GABRIEL B.","team":"EE"},{"id":"EE-042","code":"EE-042","name":"GALLEGO, HARIS JHON S.","team":"EE"},{"id":"EE-043","code":"EE-043","name":"GAYOSA, KHENA KATLEEN G.","team":"EE"},{"id":"EE-044","code":"EE-044","name":"GERODIAS, BRENT GERSON A.","team":"EE"},{"id":"EE-045","code":"EE-045","name":"GOMEZ, MA. ALSHICA K.","team":"EE"},{"id":"EE-046","code":"EE-046","name":"GONZALES, SEAN ALLEN M.","team":"EE"},{"id":"EE-047","code":"EE-047","name":"GUIRUELA, JAMES L.","team":"EE"},{"id":"EE-048","code":"EE-048","name":"HASHIM, BRINLY HAMIM M.","team":"EE"},{"id":"EE-049","code":"EE-049","name":"HERNANDEZ, JAY CYRIL C.","team":"EE"},{"id":"EE-050","code":"EE-050","name":"HERNANDEZ, SAM ANDREI V.","team":"EE"},{"id":"EE-051","code":"EE-051","name":"IBARROLA, HANS KEN M.","team":"EE"},{"id":"EE-052","code":"EE-052","name":"JUANICO, NYNGEL S.","team":"EE"},{"id":"EE-053","code":"EE-053","name":"LACORTE, CRIS JASON M.","team":"EE"},{"id":"EE-054","code":"EE-054","name":"LAYACAN, VHEA EDRICH M.","team":"EE"},{"id":"EE-055","code":"EE-055","name":"LEGASPI, ULYCES P.","team":"EE"},{"id":"EE-056","code":"EE-056","name":"LOPEZ, CHARLES ROBERT L.","team":"EE"},{"id":"EE-057","code":"EE-057","name":"LUMBRES, DUSTIN M.","team":"EE"},{"id":"EE-058","code":"EE-058","name":"MACALALAD, FRANS RYLCO C.","team":"EE"},{"id":"EE-059","code":"EE-059","name":"MAGSOMBOL, JAMES RYAN J.","team":"EE"},{"id":"EE-060","code":"EE-060","name":"MALABAG, JOHN MICHAEL B.","team":"EE"},{"id":"EE-061","code":"EE-061","name":"MALANA, ROSSETTE NATHALIE A.","team":"EE"},{"id":"EE-062","code":"EE-062","name":"MALOLOY-ON, DEFFERSON JOHN T.","team":"EE"},{"id":"EE-063","code":"EE-063","name":"MAÑOBRA, LORENZO A.","team":"EE"},{"id":"EE-064","code":"EE-064","name":"MAPUTE, CHRIS CORNELL F.","team":"EE"},{"id":"EE-065","code":"EE-065","name":"MICA, CLARK DUSTIN COSME D.","team":"EE"},{"id":"EE-066","code":"EE-066","name":"MILCA, JERALD O.","team":"EE"},{"id":"EE-067","code":"EE-067","name":"MONDIA, JOHN VINCENT M.","team":"EE"},{"id":"EE-068","code":"EE-068","name":"MORAN, MARK NIÑO A.","team":"EE"},{"id":"EE-069","code":"EE-069","name":"MOSCA, JAMESTEVE SEAN G.","team":"EE"},{"id":"EE-070","code":"EE-070","name":"NUNO, ROYD ALFONSO M.","team":"EE"},{"id":"EE-071","code":"EE-071","name":"OPULENCIA, AARON ALLEXIS S.","team":"EE"},{"id":"EE-072","code":"EE-072","name":"ORTEGA, JAMES V.","team":"EE"},{"id":"EE-073","code":"EE-073","name":"ORTIZ, PAULA EUNISE A.","team":"EE"},{"id":"EE-074","code":"EE-074","name":"PABALATE, RHED S.","team":"EE"},{"id":"EE-075","code":"EE-075","name":"PAMPLONA, NELO DRIX T.","team":"EE"},{"id":"EE-076","code":"EE-076","name":"PANARIGAN, KARLO P.","team":"EE"},{"id":"EE-077","code":"EE-077","name":"PANER, ORLANDO GABRIEL C.","team":"EE"},{"id":"EE-078","code":"EE-078","name":"PATARAY, EUNICE L.","team":"EE"},{"id":"EE-079","code":"EE-079","name":"PECAYO, RHIANE MAE L.","team":"EE"},{"id":"EE-080","code":"EE-080","name":"PEDRAJA, JOMARI D.","team":"EE"},{"id":"EE-081","code":"EE-081","name":"PEREZ, JARED ELWOOD P.","team":"EE"},{"id":"EE-082","code":"EE-082","name":"PIOQUINTO, ELREY D.","team":"EE"},{"id":"EE-083","code":"EE-083","name":"PIZARRA, DOMAR A.","team":"EE"},{"id":"EE-084","code":"EE-084","name":"RAMILO, DRACIR JOSH G.","team":"EE"},{"id":"EE-085","code":"EE-085","name":"SALIBA, DEROSS D.","team":"EE"},{"id":"EE-086","code":"EE-086","name":"SANTOS, RAFAEL P.","team":"EE"},{"id":"EE-087","code":"EE-087","name":"SOLATORIO, JOHN JETRO C.","team":"EE"},{"id":"EE-088","code":"EE-088","name":"TABAMO, EJ GODWIN B.","team":"EE"},{"id":"EE-089","code":"EE-089","name":"TORIAGA, KURT LOUISE M.","team":"EE"},{"id":"EE-090","code":"EE-090","name":"URRIZA, BRYLLE KRISTEN A.","team":"EE"},{"id":"EE-091","code":"EE-091","name":"VILLARE, RYE LEE E.","team":"EE"},{"id":"EE-092","code":"EE-092","name":"YABUT, CRISENCIO JR. P.","team":"EE"},{"id":"CPE-001","code":"CPE-001","name":"AMICAN, GABRIEL EMMANUEL B.","team":"CPE"},{"id":"CPE-002","code":"CPE-002","name":"ANDAYA, SEAN COLLIN S.","team":"CPE"},{"id":"CPE-003","code":"CPE-003","name":"ARQUILLO, MARK P.","team":"CPE"},{"id":"CPE-004","code":"CPE-004","name":"ARROCO, DAVID SZUIN R.","team":"CPE"},{"id":"CPE-005","code":"CPE-005","name":"BALBUENA, EDUARDO III J.","team":"CPE"},{"id":"CPE-006","code":"CPE-006","name":"BARBON, ANNE KIRSTEN V.","team":"CPE"},{"id":"CPE-007","code":"CPE-007","name":"BARCELLANO, MAR JOSEF V.","team":"CPE"},{"id":"CPE-008","code":"CPE-008","name":"BEGAS, JAYCEL NIEL C.","team":"CPE"},{"id":"CPE-009","code":"CPE-009","name":"BIESCAS, REYSSA JEAN D.","team":"CPE"},{"id":"CPE-010","code":"CPE-010","name":"BITANA, MARK EDRIAN J.","team":"CPE"},{"id":"CPE-011","code":"CPE-011","name":"BUSTAMANTE, DANIEL JOHN T.","team":"CPE"},{"id":"CPE-012","code":"CPE-012","name":"CAMACHO, BERNARD JOEY B.","team":"CPE"},{"id":"CPE-013","code":"CPE-013","name":"CAMBEL, KIRSTEN M.","team":"CPE"},{"id":"CPE-014","code":"CPE-014","name":"CANTALEJO, KAIDE M.","team":"CPE"},{"id":"CPE-015","code":"CPE-015","name":"CASTILLO, CHINI MARIELLI","team":"CPE"},{"id":"CPE-016","code":"CPE-016","name":"CENA, LEO M.","team":"CPE"},{"id":"CPE-017","code":"CPE-017","name":"CESAR, KLYDE GABRIEL A.","team":"CPE"},{"id":"CPE-018","code":"CPE-018","name":"CLARO, SHAWN ROMINICK T.","team":"CPE"},{"id":"CPE-019","code":"CPE-019","name":"CONEJARES, RODCORT ELVEN V.","team":"CPE"},{"id":"CPE-020","code":"CPE-020","name":"DE JESUS, KENNETH G.","team":"CPE"},{"id":"CPE-021","code":"CPE-021","name":"DOLLETON, DWAYNE KENSHIN R.","team":"CPE"},{"id":"CPE-022","code":"CPE-022","name":"DOMINGO, JOSE URBANO B.","team":"CPE"},{"id":"CPE-023","code":"CPE-023","name":"DULLAS, CHARLES EZEKIEL F.","team":"CPE"},{"id":"CPE-024","code":"CPE-024","name":"DY, LEIGH ICEN G.","team":"CPE"},{"id":"CPE-025","code":"CPE-025","name":"ESCULTURA, PRINCE ERROLL M.","team":"CPE"},{"id":"CPE-026","code":"CPE-026","name":"ESTEBAN, JEANE ANDREI C.","team":"CPE"},{"id":"CPE-027","code":"CPE-027","name":"GALOYO, IRIS L.","team":"CPE"},{"id":"CPE-028","code":"CPE-028","name":"GARCIA, JUSTIN ADRIENN P.","team":"CPE"},{"id":"CPE-029","code":"CPE-029","name":"KODAKA, KIAN KENTA D.","team":"CPE"},{"id":"CPE-030","code":"CPE-030","name":"LLANETA, JOHN VINCENT M.","team":"CPE"},{"id":"CPE-031","code":"CPE-031","name":"LLANETA, KENJIE-LIM A.","team":"CPE"},{"id":"CPE-032","code":"CPE-032","name":"MAALINDOG, ALAN PAUL C.","team":"CPE"},{"id":"CPE-033","code":"CPE-033","name":"MAGNO, DAN LLOYD L.","team":"CPE"},{"id":"CPE-034","code":"CPE-034","name":"MALABANAN, JUSTINE RALPH B.","team":"CPE"},{"id":"CPE-035","code":"CPE-035","name":"MANE, FRANCINE JADE G.","team":"CPE"},{"id":"CPE-036","code":"CPE-036","name":"MEDINA, ALLAEN MARK S.","team":"CPE"},{"id":"CPE-037","code":"CPE-037","name":"NAGPALA, EERSEL ANDREY V.","team":"CPE"},{"id":"CPE-038","code":"CPE-038","name":"OCASLA, NORMAN DAVID J.","team":"CPE"},{"id":"CPE-039","code":"CPE-039","name":"OLIVAR, CHRISTIAN JOSH D.","team":"CPE"},{"id":"CPE-040","code":"CPE-040","name":"OPULENCIA, ALLEXASHEENA DEINNE S.","team":"CPE"},{"id":"CPE-041","code":"CPE-041","name":"ORDANZA, JAMEZ IVAN V.","team":"CPE"},{"id":"CPE-042","code":"CPE-042","name":"PADUA, RHIANA ASHLEY G.","team":"CPE"},{"id":"CPE-043","code":"CPE-043","name":"PALISOC, MARK ELEAZAR M.","team":"CPE"},{"id":"CPE-044","code":"CPE-044","name":"PALOMO, CHARLEMAGNE B.","team":"CPE"},{"id":"CPE-045","code":"CPE-045","name":"PEDRIGAL, MARGARETE JANE PAULEY D.","team":"CPE"},{"id":"CPE-046","code":"CPE-046","name":"PETATE, KARL JANSEN S.","team":"CPE"},{"id":"CPE-047","code":"CPE-047","name":"PETATE, KIERVY R.","team":"CPE"},{"id":"CPE-048","code":"CPE-048","name":"RAFA, RAFAEL ALEX A.","team":"CPE"},{"id":"CPE-049","code":"CPE-049","name":"REGASPI, MARY MARGARETTE D.","team":"CPE"},{"id":"CPE-050","code":"CPE-050","name":"RUANTO, RANIELLE JEDD R.","team":"CPE"},{"id":"CPE-051","code":"CPE-051","name":"SANTIAGO, ULRICA LORAINE D.","team":"CPE"},{"id":"CPE-052","code":"CPE-052","name":"SASPA, ASHLEY KHATE R.","team":"CPE"},{"id":"CPE-053","code":"CPE-053","name":"SERRANA, JESSIE B.","team":"CPE"},{"id":"CPE-054","code":"CPE-054","name":"TAN, SIMON M.","team":"CPE"},{"id":"CPE-055","code":"CPE-055","name":"TOLENTINO, BENJAMIN M.","team":"CPE"},{"id":"CPE-056","code":"CPE-056","name":"TORALES, REUEL ANNE A.","team":"CPE"},{"id":"CPE-057","code":"CPE-057","name":"TORRES, JOSHUA ALLEN D.","team":"CPE"},{"id":"CPE-058","code":"CPE-058","name":"VIVAS, BENEDICT MIGUEL C.","team":"CPE"},{"id":"CPE-059","code":"CPE-059","name":"YANSON, RANDEL C.","team":"CPE"},{"id":"CPE-060","code":"CPE-060","name":"ZARSUELO, JOHN GAVERIEL D.","team":"CPE"},{"id":"ECE-001","code":"ECE-001","name":"MARQUEZ, GISELLE A.","team":"ECE"},{"id":"ECE-002","code":"ECE-002","name":"GUANIESO, ANGELLIC RENANELYN O.","team":"ECE"},{"id":"ECE-003","code":"ECE-003","name":"CAMAT, RENUARD A.","team":"ECE"},{"id":"ECE-004","code":"ECE-004","name":"ALKHATIB, SAMER B.","team":"ECE"},{"id":"ECE-005","code":"ECE-005","name":"OPULENCIA, MARIA GEE-ANNE P.","team":"ECE"},{"id":"ECE-006","code":"ECE-006","name":"GAMITIN, JOMAR GABRIEL B.","team":"ECE"},{"id":"ECE-007","code":"ECE-007","name":"PAGUINTO, OLIEMAR LEINER P.","team":"ECE"},{"id":"ECE-008","code":"ECE-008","name":"MARASIGAN, JERICHO MIGUEL R.","team":"ECE"},{"id":"ECE-009","code":"ECE-009","name":"GUERRERO, OWEN DOMINIC V.","team":"ECE"},{"id":"ECE-010","code":"ECE-010","name":"MENOR, ANGELO C.","team":"ECE"},{"id":"IE-001","code":"IE-001","name":"ABAD, JUDITH MARIAN SILVA","team":"IE"},{"id":"IE-002","code":"IE-002","name":"AGUILAR, RUSSEL ALLEN CASTILLO","team":"IE"},{"id":"IE-003","code":"IE-003","name":"BALLEZA, BRUNZON ANSANO","team":"IE"},{"id":"IE-004","code":"IE-004","name":"BAUTISTA, MA. CHARICE JAYONA","team":"IE"},{"id":"IE-005","code":"IE-005","name":"CANATUAN, YSABELA MERCADO","team":"IE"},{"id":"IE-006","code":"IE-006","name":"CICERON, HANS GABRIEL CONJARES","team":"IE"},{"id":"IE-007","code":"IE-007","name":"CONSIGNADO, KASSANDRA SARMIENTO","team":"IE"},{"id":"IE-008","code":"IE-008","name":"DE LEON, YANZ MARLOU BAYBAY","team":"IE"},{"id":"IE-009","code":"IE-009","name":"ELISAN, JOSHUA BRYCE OLINARES","team":"IE"},{"id":"IE-010","code":"IE-010","name":"ESTRADA, JERILOU MAE NAZARETH","team":"IE"},{"id":"IE-011","code":"IE-011","name":"FRANCISCO, ANDRES LUIS MADEJA","team":"IE"},{"id":"IE-012","code":"IE-012","name":"HALILI, MARK CLARENCE ALDABE","team":"IE"},{"id":"IE-013","code":"IE-013","name":"IYOG, HANNAH MEKIE SHANE JUNGAY","team":"IE"},{"id":"IE-014","code":"IE-014","name":"KODAKA, KYLE KENYA DELUANA","team":"IE"},{"id":"IE-015","code":"IE-015","name":"LARINO, JOANA SOPHIA BEATRICE REYEG","team":"IE"},{"id":"IE-016","code":"IE-016","name":"LECHUGA, CASSANDRA SHANEYA MANINGAS","team":"IE"},{"id":"IE-017","code":"IE-017","name":"LEGASPI, TRAVIS MATHEW PARO","team":"IE"},{"id":"IE-018","code":"IE-018","name":"MALLORCA, ANTON JOSEPH NARVAEZ","team":"IE"},{"id":"IE-019","code":"IE-019","name":"NIEM, JARED CIRENE GOLE","team":"IE"},{"id":"IE-020","code":"IE-020","name":"OCAMPO, RENZO HADI","team":"IE"},{"id":"IE-021","code":"IE-021","name":"PADIT, ANDREI ANG","team":"IE"},{"id":"IE-022","code":"IE-022","name":"PALIZA, PATRICK ANJELLO SOLINAP","team":"IE"},{"id":"IE-023","code":"IE-023","name":"RAÑOLA, PRINCESS ARIANI ROXAS","team":"IE"},{"id":"IE-024","code":"IE-024","name":"ROSALES, LOUISE ALLEN BALBIN","team":"IE"},{"id":"IE-025","code":"IE-025","name":"SOJOR, ALBERT MARCELO","team":"IE"},{"id":"IE-026","code":"IE-026","name":"VALIÑA, ANGELA CLAIRE PERILLO","team":"IE"},{"id":"IE-027","code":"IE-027","name":"BANTOC, VINCE LYNDON ABENDAN","team":"IE"},{"id":"IE-028","code":"IE-028","name":"BESAS, CHEN ZHEN LUMACANG","team":"IE"},{"id":"IE-029","code":"IE-029","name":"DOROJA, PRINCESS FHAYE COLLINE TAMONDONG","team":"IE"},{"id":"IE-030","code":"IE-030","name":"FRANCISCO, DERRICK GABRIEL ESCONDO","team":"IE"},{"id":"IE-031","code":"IE-031","name":"GALINDEZ, JOHN PAUL JAVIER","team":"IE"},{"id":"IE-032","code":"IE-032","name":"GARDAYA, PRINCESS JANEL DE OCAMPO","team":"IE"},{"id":"IE-033","code":"IE-033","name":"GUELAS, MARK KRISTIAN ROMEO DUSONG","team":"IE"},{"id":"IE-034","code":"IE-034","name":"IMSON, CHRISTIAN SIMON OLIVEROS","team":"IE"},{"id":"IE-035","code":"IE-035","name":"JAYME, PRINCESS MAE MANAIG","team":"IE"},{"id":"IE-036","code":"IE-036","name":"MALABANAN, ALJON RAMOS","team":"IE"},{"id":"IE-037","code":"IE-037","name":"MALATE, LUJILL DYLAN SEÑORISES","team":"IE"},{"id":"IE-038","code":"IE-038","name":"MANNAN, ABDULHAFIDZ MAUJOD","team":"IE"},{"id":"IE-039","code":"IE-039","name":"MILANES, SHANE SALIBIO","team":"IE"},{"id":"IE-040","code":"IE-040","name":"NAVARRO, NEON GENESIS DE CASTRO","team":"IE"},{"id":"IE-041","code":"IE-041","name":"NOBLEFRANCA, VARY ALEM CANDELARIA","team":"IE"},{"id":"IE-042","code":"IE-042","name":"OQUERIA, CAMILLE ANNE CANLOBO","team":"IE"},{"id":"IE-043","code":"IE-043","name":"ORELLANES, JOHN MARK BATASINGEN","team":"IE"},{"id":"IE-044","code":"IE-044","name":"PACALDO, JHAYSAMEL ALALIM","team":"IE"},{"id":"IE-045","code":"IE-045","name":"PINEDA, KIENNA DENISE ORUGA","team":"IE"},{"id":"IE-046","code":"IE-046","name":"RAMILO, JONAIRA MARI LUCIDO","team":"IE"},{"id":"IE-047","code":"IE-047","name":"RIVERA, RALPH HENRY CAAGBAY","team":"IE"},{"id":"IE-048","code":"IE-048","name":"ROBLES, MARK ANDREI BANIGO-OS","team":"IE"},{"id":"IE-049","code":"IE-049","name":"SUAREZ, KEN DELA CRUZ","team":"IE"},{"id":"IE-050","code":"IE-050","name":"SUATING, DARVIE ANGELO DELA PEÑA","team":"IE"},{"id":"IE-051","code":"IE-051","name":"ATENCIO, IRISH MAE ADRIATICO","team":"IE"},{"id":"IE-052","code":"IE-052","name":"BAUTISTA, MAURHIZ LIRA","team":"IE"},{"id":"IE-053","code":"IE-053","name":"BONIFACIO, MARC ANTHONY PEREZ","team":"IE"},{"id":"IE-054","code":"IE-054","name":"BUSTAMANTE, ZYRUS DIMAANO","team":"IE"},{"id":"IE-055","code":"IE-055","name":"CASAJE, PRINCESS JANE DEQUIÑA","team":"IE"},{"id":"IE-056","code":"IE-056","name":"DALIS, LESTER MARU CABRERA","team":"IE"},{"id":"IE-057","code":"IE-057","name":"DE LA CRUZ, CHRISTIAN EARL MANANGAN","team":"IE"},{"id":"IE-058","code":"IE-058","name":"DELA TORRE, ANGELICA FAYE TUBILLO","team":"IE"},{"id":"IE-059","code":"IE-059","name":"JACINTO, GILLIANE MARGARETTE CREDO","team":"IE"},{"id":"IE-060","code":"IE-060","name":"LAOMOC, JANSENN LOU DIMALALUAN","team":"IE"},{"id":"IE-061","code":"IE-061","name":"LUBATON, ALTHEA FEI MOLINTAPANG","team":"IE"},{"id":"IE-062","code":"IE-062","name":"LUMBRES, JENELLE MANIMTIM","team":"IE"},{"id":"IE-063","code":"IE-063","name":"MALBAS, MARJORI DAUSON","team":"IE"},{"id":"IE-064","code":"IE-064","name":"MANUEL, CARL JUSTIN BUENA","team":"IE"},{"id":"IE-065","code":"IE-065","name":"MARIANO, IVAN CLARK JORISH MENDOZA","team":"IE"},{"id":"IE-066","code":"IE-066","name":"MARIANO, JUAN PAULO MIRASOL","team":"IE"},{"id":"IE-067","code":"IE-067","name":"MATANGUIHAN, KYLA AVILA","team":"IE"},{"id":"IE-068","code":"IE-068","name":"MORADA, MICAIAH GWYNNETH GONZALES","team":"IE"},{"id":"IE-069","code":"IE-069","name":"QUEZON, JOHN ARIEL ROSALES","team":"IE"},{"id":"IE-070","code":"IE-070","name":"RAMIRO, JAYPEE DOMINGO","team":"IE"},{"id":"IE-071","code":"IE-071","name":"RAPAL, KHRISTIAN LEGASPI","team":"IE"},{"id":"IE-072","code":"IE-072","name":"TAYONI, DUSTIN KYLE QUIJADA","team":"IE"},{"id":"IE-073","code":"IE-073","name":"TEMEÑA, MARK ANGELO BOMBITA","team":"IE"},{"id":"IE-074","code":"IE-074","name":"VIDAL, JULIAN VICTOR NARVAEZ","team":"IE"},{"id":"IE-075","code":"IE-075","name":"VILLANUEVA, RALPH CYRIL VIDAERA","team":"IE"},{"id":"IE-076","code":"IE-076","name":"VIZCONDE, ARYZA GRACE ESCOBELLA","team":"IE"},{"id":"IE-077","code":"IE-077","name":"ALCASABAS, JERICHO CRIS ARCEO","team":"IE"},{"id":"IE-078","code":"IE-078","name":"AMPELOQUIO, JOHN ARMIL PILAR","team":"IE"},{"id":"IE-079","code":"IE-079","name":"ANCAYAN, ALLUJ PHILIP BELEN","team":"IE"},{"id":"IE-080","code":"IE-080","name":"BARRIENTOS, VINCENT BACANI","team":"IE"},{"id":"IE-081","code":"IE-081","name":"BARUNDIA, BRYLLE RAPHAEL MANDIGMA","team":"IE"},{"id":"IE-082","code":"IE-082","name":"BAYOT, HELEINA JANE IGUAL","team":"IE"},{"id":"IE-083","code":"IE-083","name":"CABALES, RAYVER JUSTINE NOCHETE","team":"IE"},{"id":"IE-084","code":"IE-084","name":"CABUDSAN, CATHERINE JOY MUSNGI","team":"IE"},{"id":"IE-085","code":"IE-085","name":"DISIMULACION, KIM BRAYN RAMOS","team":"IE"},{"id":"IE-086","code":"IE-086","name":"IBO, JOHN LLOYD FARIÑAS","team":"IE"},{"id":"IE-087","code":"IE-087","name":"LABUTAP, DAVE ALDRIN LARA","team":"IE"},{"id":"IE-088","code":"IE-088","name":"MARQUEZ, ARIES SALUD","team":"IE"},{"id":"IE-089","code":"IE-089","name":"NENENG, FRANKY PARAISO","team":"IE"},{"id":"IE-090","code":"IE-090","name":"PEREZ, ZYREL MANIMTIM","team":"IE"},{"id":"IE-091","code":"IE-091","name":"REGINIO JR., ROLANDO AMPELOQUIO","team":"IE"},{"id":"IE-092","code":"IE-092","name":"RUEDA, MARCUS BELMONTE","team":"IE"},{"id":"IE-093","code":"IE-093","name":"RUEDA, NICOLE BELMONTE","team":"IE"},{"id":"IE-094","code":"IE-094","name":"TIAMSIM, LOREN JADE JANDUSAY","team":"IE"},{"id":"IE-095","code":"IE-095","name":"TORRES, SER JOAQUIN EMMANUEL DELA VEGA","team":"IE"},{"id":"IE-096","code":"IE-096","name":"TUIZA, LANZ ROBLES","team":"IE"},{"id":"IE-097","code":"IE-097","name":"VELASCO, PRINCE CHOLO MASAGNAY","team":"IE"},{"id":"CE-001","code":"CE-001","name":"ACLAN, SHAYNE PRANCESS E.","team":"CE"},{"id":"CE-002","code":"CE-002","name":"ACULA, MARY HONEY KAYE C.","team":"CE"},{"id":"CE-003","code":"CE-003","name":"AGUANTA, ALYSSA A.","team":"CE"},{"id":"CE-004","code":"CE-004","name":"ALBUFERA, RALF HOMER F.","team":"CE"},{"id":"CE-005","code":"CE-005","name":"ALCANTARA, LIAM GABRIEL L.","team":"CE"},{"id":"CE-006","code":"CE-006","name":"ALMEDA, MARIONNE C.","team":"CE"},{"id":"CE-007","code":"CE-007","name":"ALMONTE, YAEL GABRIEL S.","team":"CE"},{"id":"CE-008","code":"CE-008","name":"AMANTE, CYRA IYA A.","team":"CE"},{"id":"CE-009","code":"CE-009","name":"AMPER, DIVINE JOY B.","team":"CE"},{"id":"CE-010","code":"CE-010","name":"APOSTOL, APPLE-KRIS E.","team":"CE"},{"id":"CE-011","code":"CE-011","name":"AQUINO, JESSA MAE D.","team":"CE"},{"id":"CE-012","code":"CE-012","name":"ARABE, DOMINIC JAMES D.","team":"CE"},{"id":"CE-013","code":"CE-013","name":"ARBO, EVAN JEROME P.","team":"CE"},{"id":"CE-014","code":"CE-014","name":"ASUNCION, KRYSTAL CLAIRE L.","team":"CE"},{"id":"CE-015","code":"CE-015","name":"AVELLANO, FERLIONA C.","team":"CE"},{"id":"CE-016","code":"CE-016","name":"BALDERAMA, CHRISTIAN LLOYD B.","team":"CE"},{"id":"CE-017","code":"CE-017","name":"BALLESTEROS, KIRSTINE DOLL B.","team":"CE"},{"id":"CE-018","code":"CE-018","name":"BANSUELO, SHAINE LARA A.","team":"CE"},{"id":"CE-019","code":"CE-019","name":"BARREDO, JEWEL P.","team":"CE"},{"id":"CE-020","code":"CE-020","name":"BLAZA, ANGELICA LOURINE R.","team":"CE"},{"id":"CE-021","code":"CE-021","name":"BORLAGDATAN, REIGN ASHLEY P.","team":"CE"},{"id":"CE-022","code":"CE-022","name":"BREGANZA, JOHN LOYD R.","team":"CE"},{"id":"CE-023","code":"CE-023","name":"BUENAOBRA, MHICA S.","team":"CE"},{"id":"CE-024","code":"CE-024","name":"BUNDALIAN, KATHLEEN V.","team":"CE"},{"id":"CE-025","code":"CE-025","name":"CACAO, IRISH F.","team":"CE"},{"id":"CE-026","code":"CE-026","name":"CANCEJO, LORIE JANE M.","team":"CE"},{"id":"CE-027","code":"CE-027","name":"CAPIROSO, JEANIE AMBER L.","team":"CE"},{"id":"CE-028","code":"CE-028","name":"CASTRO, JEFFER KERBY M.","team":"CE"},{"id":"CE-029","code":"CE-029","name":"CLEMENTE, LERI ALEXANDRA S.","team":"CE"},{"id":"CE-030","code":"CE-030","name":"CONCEPCION, ROSELYN B.","team":"CE"},{"id":"CE-031","code":"CE-031","name":"CORDETA, LHORENCE BEIN M.","team":"CE"},{"id":"CE-032","code":"CE-032","name":"CORPUZ, JAZMIN MYKHAELA N.","team":"CE"},{"id":"CE-033","code":"CE-033","name":"COSICO, SOPHIA SANE A.","team":"CE"},{"id":"CE-034","code":"CE-034","name":"CRUZ, REI ANNE R.","team":"CE"},{"id":"CE-035","code":"CE-035","name":"CUBE, VAN JUZZEN SENA S.","team":"CE"},{"id":"CE-036","code":"CE-036","name":"CUÑADO, GIAN GABRIEL R.","team":"CE"},{"id":"CE-037","code":"CE-037","name":"DALISAY, APRIL CHARIZ C.","team":"CE"},{"id":"CE-038","code":"CE-038","name":"DALISAY, JOHN CHRIS P.","team":"CE"},{"id":"CE-039","code":"CE-039","name":"DE ALDAY, JOHN FLOYD A.","team":"CE"},{"id":"CE-040","code":"CE-040","name":"DE CASTRO, CHERRYANN L.","team":"CE"},{"id":"CE-041","code":"CE-041","name":"DE JUAN, SHAINE H.","team":"CE"},{"id":"CE-042","code":"CE-042","name":"DE LEON, KIM ALLAINE B.","team":"CE"},{"id":"CE-043","code":"CE-043","name":"DE MESA, LORAINNE P.","team":"CE"},{"id":"CE-044","code":"CE-044","name":"DEGULLADO, ANA MARIE G.","team":"CE"},{"id":"CE-045","code":"CE-045","name":"DELA CRUZ, CZARINAH BEATRICE C.","team":"CE"},{"id":"CE-046","code":"CE-046","name":"DELOS REYES, JOROSS MARK E.","team":"CE"},{"id":"CE-047","code":"CE-047","name":"DEMDAM, MARK GERALD F.","team":"CE"},{"id":"CE-048","code":"CE-048","name":"DICHOSO, JAMES RUSSEL R.","team":"CE"},{"id":"CE-049","code":"CE-049","name":"DOBLES II, ARTURO R.","team":"CE"},{"id":"CE-050","code":"CE-050","name":"DOSADO, CHLOE NICOLE A.","team":"CE"},{"id":"CE-051","code":"CE-051","name":"ENCANTO, GLYCEL R.","team":"CE"},{"id":"CE-052","code":"CE-052","name":"ENCARNACION, JASPER R.","team":"CE"},{"id":"CE-053","code":"CE-053","name":"ENRIQUEZ, MARK DAVE R.","team":"CE"},{"id":"CE-054","code":"CE-054","name":"ESCALANTE, FREDERICK ERVIN ALLEN T.","team":"CE"},{"id":"CE-055","code":"CE-055","name":"ESPINA, VENUS L.","team":"CE"},{"id":"CE-056","code":"CE-056","name":"EVANGELISTA, JOHN DOMINIC B.","team":"CE"},{"id":"CE-057","code":"CE-057","name":"FAMILARAN, PRINCE MHUEL B.","team":"CE"},{"id":"CE-058","code":"CE-058","name":"FERRER, DENNIS PIOLO D.","team":"CE"},{"id":"CE-059","code":"CE-059","name":"FIGUEROA, JUSTIN V.","team":"CE"},{"id":"CE-060","code":"CE-060","name":"FILIO, DANIEL S.","team":"CE"},{"id":"CE-061","code":"CE-061","name":"FLORES, MEL GIBSON L.","team":"CE"},{"id":"CE-062","code":"CE-062","name":"FLORORITA, DHONA MARIE A.","team":"CE"},{"id":"CE-063","code":"CE-063","name":"FRANCISCO, MARC JUSTINE B.","team":"CE"},{"id":"CE-064","code":"CE-064","name":"GALANG, SAMANTHA ADRIENNE Q.","team":"CE"},{"id":"CE-065","code":"CE-065","name":"GALINATO, LORENZO DUSTIN B.","team":"CE"},{"id":"CE-066","code":"CE-066","name":"GALIZA, TRISTAN HARVEY M.","team":"CE"},{"id":"CE-067","code":"CE-067","name":"GARBO, NIRAH S.","team":"CE"},{"id":"CE-068","code":"CE-068","name":"GARCIA, ELISHA RHEIN MULIMBAYAN M.","team":"CE"},{"id":"CE-069","code":"CE-069","name":"GARCIA, FRANCIS P.","team":"CE"},{"id":"CE-070","code":"CE-070","name":"GLINOGA, JHAY EL C.","team":"CE"},{"id":"CE-071","code":"CE-071","name":"GLIPO, CRISTINE NICOLE M.","team":"CE"},{"id":"CE-072","code":"CE-072","name":"GO, MIASHI I.","team":"CE"},{"id":"CE-073","code":"CE-073","name":"GRAPANI, LEEAN MAE T.","team":"CE"},{"id":"CE-074","code":"CE-074","name":"HAEL, MICHAEL CLARK C.","team":"CE"},{"id":"CE-075","code":"CE-075","name":"HAEL, EDMELYN D.","team":"CE"},{"id":"CE-076","code":"CE-076","name":"JAVIER, TRIXIE B.","team":"CE"},{"id":"CE-077","code":"CE-077","name":"JUANANE, LUIS JAN YVES M.","team":"CE"},{"id":"CE-078","code":"CE-078","name":"LABILLES, MARK DARYL R.","team":"CE"},{"id":"CE-079","code":"CE-079","name":"LAGDAMEN, MARK DADEN A.","team":"CE"},{"id":"CE-080","code":"CE-080","name":"LAGOC, EURIELLE CLAIRE L.","team":"CE"},{"id":"CE-081","code":"CE-081","name":"LAGRAZON, GIAN JUDD S.","team":"CE"},{"id":"CE-082","code":"CE-082","name":"LANSANGAN, JOHN DANIEL T.","team":"CE"},{"id":"CE-083","code":"CE-083","name":"LAPITAN, STEPHEN JACOB P.","team":"CE"},{"id":"CE-084","code":"CE-084","name":"LAVENTE, JUDY ANN A.","team":"CE"},{"id":"CE-085","code":"CE-085","name":"LAZARO, JARNIE CARL","team":"CE"},{"id":"CE-086","code":"CE-086","name":"LEYCANO, JAMEROS A.","team":"CE"},{"id":"CE-087","code":"CE-087","name":"LOGO, KERVIN JON N.","team":"CE"},{"id":"CE-088","code":"CE-088","name":"LOPEZ, JOHN CARLO C.","team":"CE"},{"id":"CE-089","code":"CE-089","name":"LOPEZ, JOHN HENRY B.","team":"CE"},{"id":"CE-090","code":"CE-090","name":"LUGTU, CHRYSTAL SAPPHIRE D.","team":"CE"},{"id":"CE-091","code":"CE-091","name":"LULU, AIRA LEI C.","team":"CE"},{"id":"CE-092","code":"CE-092","name":"LUMBRES, JEROME B.","team":"CE"},{"id":"CE-093","code":"CE-093","name":"LUTA, TRISHA SHANE","team":"CE"},{"id":"CE-094","code":"CE-094","name":"MACATOL, KESIA MAE A.","team":"CE"},{"id":"CE-095","code":"CE-095","name":"MAGTAN-AO, LOVELY B.","team":"CE"},{"id":"CE-096","code":"CE-096","name":"MANAIG, KURT ANDREI","team":"CE"},{"id":"CE-097","code":"CE-097","name":"MANAIG, ROBBIE D.","team":"CE"},{"id":"CE-098","code":"CE-098","name":"MARASIGAN, KURT AERRON P.","team":"CE"},{"id":"CE-099","code":"CE-099","name":"MARIANO, JOHN PAUL S.","team":"CE"},{"id":"CE-100","code":"CE-100","name":"MARTEJA, JAMES HECTOR G.","team":"CE"},{"id":"CE-101","code":"CE-101","name":"MAYOLA, JASPER D.","team":"CE"},{"id":"CE-102","code":"CE-102","name":"MELENDREZ, AIRISH JAMES M.","team":"CE"},{"id":"CE-103","code":"CE-103","name":"MENDOZA, ROLDAN L.","team":"CE"},{"id":"CE-104","code":"CE-104","name":"MERAÑA, LORAINE KISHA A.","team":"CE"},{"id":"CE-105","code":"CE-105","name":"MERILLES, JHARED A.","team":"CE"},{"id":"CE-106","code":"CE-106","name":"MERTO, HANNAH CES C.","team":"CE"},{"id":"CE-107","code":"CE-107","name":"MIRANDA, RANIEL Y.","team":"CE"},{"id":"CE-108","code":"CE-108","name":"MORADA, JHANELL SOPHIA B.","team":"CE"},{"id":"CE-109","code":"CE-109","name":"NACARIO, SOFIA MARIE A.","team":"CE"},{"id":"CE-110","code":"CE-110","name":"NAVARRO, GERALD JAMES O.","team":"CE"},{"id":"CE-111","code":"CE-111","name":"NAVARTE, JOSEPH ROEM E.","team":"CE"},{"id":"CE-112","code":"CE-112","name":"OCTAVIO, LEVIN JANE D.","team":"CE"},{"id":"CE-113","code":"CE-113","name":"ORTIZ, ELEUMAR NIMROD ITHEL T.","team":"CE"},{"id":"CE-114","code":"CE-114","name":"PALASIGUE, ANDREI C.","team":"CE"},{"id":"CE-115","code":"CE-115","name":"PANTERIA, SHANELLE B.","team":"CE"},{"id":"CE-116","code":"CE-116","name":"PASATIEMPO, TRICIA N.","team":"CE"},{"id":"CE-117","code":"CE-117","name":"PASTRANA, RENMAR C.","team":"CE"},{"id":"CE-118","code":"CE-118","name":"PEDIDA, KELLY ANNE E.","team":"CE"},{"id":"CE-119","code":"CE-119","name":"PEREZ, CEEJHAE D.","team":"CE"},{"id":"CE-120","code":"CE-120","name":"PEREZ, REAH MAE","team":"CE"},{"id":"CE-121","code":"CE-121","name":"PINEDA, RAISHELL B.","team":"CE"},{"id":"CE-122","code":"CE-122","name":"PISANTE, ERICA A.","team":"CE"},{"id":"CE-123","code":"CE-123","name":"RAFOL, REDGEM M.","team":"CE"},{"id":"CE-124","code":"CE-124","name":"RAMIREZ, JAYCEE D.","team":"CE"},{"id":"CE-125","code":"CE-125","name":"RAMOS, EARL JOSHUA E.","team":"CE"},{"id":"CE-126","code":"CE-126","name":"RAMOS, GLENN LEONARD C.","team":"CE"},{"id":"CE-127","code":"CE-127","name":"RAMOS, JANELLE F.","team":"CE"},{"id":"CE-128","code":"CE-128","name":"REBADEO, JHON RODNEY C.","team":"CE"},{"id":"CE-129","code":"CE-129","name":"REBLORA, JOHN NATHANIEL S.","team":"CE"},{"id":"CE-130","code":"CE-130","name":"REGONDOLA, MARIA ANDREA R.","team":"CE"},{"id":"CE-131","code":"CE-131","name":"RELENTE, JOSH KOJI L.","team":"CE"},{"id":"CE-132","code":"CE-132","name":"RELOJ, KARL ANDREI A.","team":"CE"},{"id":"CE-133","code":"CE-133","name":"REOGO, DRIZELLA JAYNE A.","team":"CE"},{"id":"CE-134","code":"CE-134","name":"RODRIGUEZ, RUSSEL P.","team":"CE"},{"id":"CE-135","code":"CE-135","name":"ROSARIO, LAURENZ JAMES I.","team":"CE"},{"id":"CE-136","code":"CE-136","name":"RUBILLA, VON LAUVIN J.","team":"CE"},{"id":"CE-137","code":"CE-137","name":"SALO, REIN SAM M.","team":"CE"},{"id":"CE-138","code":"CE-138","name":"SALVADOR, CARLOS IVAN N.","team":"CE"},{"id":"CE-139","code":"CE-139","name":"SANDOVAL, JOHN MICHAEL L.","team":"CE"},{"id":"CE-140","code":"CE-140","name":"SARDIDO, LARZ JENRIL R.","team":"CE"},{"id":"CE-141","code":"CE-141","name":"SECRETARIO, ELAIZA M.","team":"CE"},{"id":"CE-142","code":"CE-142","name":"SUBIA, CHIN AIKEE A.","team":"CE"},{"id":"CE-143","code":"CE-143","name":"TABION, RENDEL Q.","team":"CE"},{"id":"CE-144","code":"CE-144","name":"TAHAMIL, ARMANI M.","team":"CE"},{"id":"CE-145","code":"CE-145","name":"TAN, LORENCE DAVID R.","team":"CE"},{"id":"CE-146","code":"CE-146","name":"TEMPLONUEVO, NICOLE G.","team":"CE"},{"id":"CE-147","code":"CE-147","name":"TOLEDO, NICOLE P.","team":"CE"},{"id":"CE-148","code":"CE-148","name":"TORRECAMPO, CHRISTIAN ARON P.","team":"CE"},{"id":"CE-149","code":"CE-149","name":"TORRENDON, JASPHER M.","team":"CE"},{"id":"CE-150","code":"CE-150","name":"VILLA, DAISY ANN S.","team":"CE"},{"id":"CE-151","code":"CE-151","name":"VILLANUEVA, LUIS MIGUEL D.","team":"CE"},{"id":"CE-152","code":"CE-152","name":"YLAGAN, ADRIENNE G.","team":"CE"}] ;

const EDAYS_2026_ME_ROSTER = [{"id":"student-0001","code":"MEODL-0001","name":"ABSALUD, EDWARD KEEN TAGLE","team":"ME"},{"id":"student-0002","code":"MEODL-0002","name":"ALMORO, STEPHEN NASH GACILLOS","team":"ME"},{"id":"student-0003","code":"MEODL-0003","name":"ASPERIN, ENRIQUE ACLAN","team":"ME"},{"id":"student-0004","code":"MEODL-0004","name":"AUSTRIA, ANDREA RIVERA","team":"ME"},{"id":"student-0005","code":"MEODL-0005","name":"BANATIN, CRISTOFF JIMSON TEJERO","team":"ME"},{"id":"student-0006","code":"MEODL-0006","name":"BARBA III, DANILO MAYLON","team":"ME"},{"id":"student-0007","code":"MEODL-0007","name":"BOLA, AR-JAMES REMOROZA","team":"ME"},{"id":"student-0008","code":"MEODL-0008","name":"CAGANAN, JOHN CEDRIC TAMAYO","team":"ME"},{"id":"student-0009","code":"MEODL-0009","name":"CARANDANG, GABRIEL FLORES","team":"ME"},{"id":"student-0010","code":"MEODL-0010","name":"CHAMIAN, BRADEN CHOZAS","team":"ME"},{"id":"student-0011","code":"MEODL-0011","name":"CONTRERAS, KENDRICK ZABDIEL RECIO","team":"ME"},{"id":"student-0012","code":"MEODL-0012","name":"CREMEN, AMIR MCKALE DEL SOL","team":"ME"},{"id":"student-0013","code":"MEODL-0013","name":"DE JESUS, JOHN JERNIECHO TABUYO","team":"ME"},{"id":"student-0014","code":"MEODL-0014","name":"DEBLOLS, REDD YUAN MERILLES","team":"ME"},{"id":"student-0015","code":"MEODL-0015","name":"DIZON, LEE JHUDIEL ANGARA","team":"ME"},{"id":"student-0016","code":"MEODL-0016","name":"ECHAPARE, PRINCE MEINARD MARCELLANA","team":"ME"},{"id":"student-0017","code":"MEODL-0017","name":"ETORMA, CHRIS ADVIEN LIBELO","team":"ME"},{"id":"student-0018","code":"MEODL-0018","name":"FLORES, HABIB DHEREX","team":"ME"},{"id":"student-0019","code":"MEODL-0019","name":"FONTANILLA, LORDRYAN CLYDE MORANTE","team":"ME"},{"id":"student-0020","code":"MEODL-0020","name":"GALANG, MARK KIRBY MORES","team":"ME"},{"id":"student-0021","code":"MEODL-0021","name":"GARCELLANO, AUDREY CALVIN PRADO","team":"ME"},{"id":"student-0022","code":"MEODL-0022","name":"GARCIA, JOHN LEMUEL","team":"ME"},{"id":"student-0023","code":"MEODL-0023","name":"GARCIA, KERBY ORUGA","team":"ME"},{"id":"student-0024","code":"MEODL-0024","name":"GERVACIO, LJ DENISSE HERNANDEZ","team":"ME"},{"id":"student-0025","code":"MEODL-0025","name":"GRATE, STOFFEL JASEN PERALTA","team":"ME"},{"id":"student-0026","code":"MEODL-0026","name":"ILARDE, RAISEL BORROMEO","team":"ME"},{"id":"student-0027","code":"MEODL-0027","name":"JUAN, MARK CLARENCE HIPOS","team":"ME"},{"id":"student-0028","code":"MEODL-0028","name":"LAFORTEZA, SAMANTHA NICOLE GLIPONEO","team":"ME"},{"id":"student-0029","code":"MEODL-0029","name":"LAIT, MARWELL SELWIN JABONILLO","team":"ME"},{"id":"student-0030","code":"MEODL-0030","name":"LEONOR, JOHN ROVEE VERGARA","team":"ME"},{"id":"student-0031","code":"MEODL-0031","name":"MAGHANOY, DAVID JAN RUZZEL BUMAGAT","team":"ME"},{"id":"student-0032","code":"MEODL-0032","name":"MALIPOL, CARL JEAN NOEL LARIOS","team":"ME"},{"id":"student-0033","code":"MEODL-0033","name":"MALLARI, LOUISE ANDREY DACLIZON","team":"ME"},{"id":"student-0034","code":"MEODL-0034","name":"MANALASTAS, JAMES SERDAN","team":"ME"},{"id":"student-0035","code":"MEODL-0035","name":"MANALO, CHARLES JOSEPH GAMBOA","team":"ME"},{"id":"student-0036","code":"MEODL-0036","name":"MONTERO, JOSHUA TAPIA","team":"ME"},{"id":"student-0037","code":"MEODL-0037","name":"ORENSE, EMIL GABRIEL MANGILIN","team":"ME"},{"id":"student-0038","code":"MEODL-0038","name":"PACLIBAR, JOHN MICHAEL VILLARAZA","team":"ME"},{"id":"student-0039","code":"MEODL-0039","name":"PALICPIC, CHRIS JERICO MIRANDA","team":"ME"},{"id":"student-0040","code":"MEODL-0040","name":"PUA, LIAM AKIEM CARASUS","team":"ME"},{"id":"student-0041","code":"MEODL-0041","name":"PUBLICO, JOHN MICHAEL BANAAG","team":"ME"},{"id":"student-0042","code":"MEODL-0042","name":"PULGAR, ROWEN VICTOR CUBILE","team":"ME"},{"id":"student-0043","code":"MEODL-0043","name":"QUIRANTE, SHIANELA BALANAY","team":"ME"},{"id":"student-0044","code":"MEODL-0044","name":"RIPO, RENZ ALJUN DOMINGUEZ","team":"ME"},{"id":"student-0045","code":"MEODL-0045","name":"SALIBA, GIAN KARLO BRAGADO","team":"ME"},{"id":"student-0046","code":"MEODL-0046","name":"SAN PASCUAL, JAMES DOMINIC TADONG","team":"ME"},{"id":"student-0047","code":"MEODL-0047","name":"SANTOS, KARL ANGELO DIAGO","team":"ME"},{"id":"student-0048","code":"MEODL-0048","name":"TALASTASIN, ALHJHON ANCHETA","team":"ME"},{"id":"student-0049","code":"MEODL-0049","name":"TAYAG, JAYSON BARQUILLA","team":"ME"},{"id":"student-0050","code":"MEODL-0050","name":"TEJERO, ARCH RYLER LOZADA","team":"ME"},{"id":"student-0051","code":"MEODL-0051","name":"TIZON, THEO DAN GHERICK MERALPES","team":"ME"},{"id":"student-0052","code":"MEODL-0052","name":"TULUD, MARCOS JOHN BONSO","team":"ME"},{"id":"student-0053","code":"MEODL-0053","name":"TURAJA, VIEN XYRILLE SANGALANG","team":"ME"},{"id":"student-0054","code":"MEODL-0054","name":"VILLAPANDO, RUSSEL THOMSON C.","team":"ME"},{"id":"student-0055","code":"MEODL-0055","name":"ZUÑIGA, KENNETH JOHN RIVEL","team":"ME"},{"id":"student-0056","code":"MEODL-0056","name":"ABERDE, NOMEL ACE CERBO","team":"ME"},{"id":"student-0057","code":"MEODL-0057","name":"ALGIRE, JEROME DAVE DEVOMA","team":"ME"},{"id":"student-0058","code":"MEODL-0058","name":"ALMORO, AERON JAMES PALENTINOS","team":"ME"},{"id":"student-0059","code":"MEODL-0059","name":"ASI, JOSH EROLD GOPOLLA","team":"ME"},{"id":"student-0060","code":"MEODL-0060","name":"CANA, AARON JAY CONDALOR","team":"ME"},{"id":"student-0061","code":"MEODL-0061","name":"CONTRERAS, CHAUNCEY DRE MALAPITAN","team":"ME"},{"id":"student-0062","code":"MEODL-0062","name":"DELA VIÑA, RHYME SOLAMO","team":"ME"},{"id":"student-0063","code":"MEODL-0063","name":"ELAURIA, JYMNASH CZAR ENDOZO","team":"ME"},{"id":"student-0064","code":"MEODL-0064","name":"ERJAS, CARL ANTHONY LAMAR","team":"ME"},{"id":"student-0065","code":"MEODL-0065","name":"ESPINA, CARL DUSTIN INOC","team":"ME"},{"id":"student-0066","code":"MEODL-0066","name":"GARCIA, JAMES ANDREW","team":"ME"},{"id":"student-0067","code":"MEODL-0067","name":"GAVINO, JHON RAVEN","team":"ME"},{"id":"student-0068","code":"MEODL-0068","name":"GLIPONEO, PRINCESS KYLE GUIM","team":"ME"},{"id":"student-0069","code":"MEODL-0069","name":"HERNANDEZ, NATHANIEL TUÑACAO","team":"ME"},{"id":"student-0070","code":"MEODL-0070","name":"HODRIAL, ALLEN VINCE CEDRO","team":"ME"},{"id":"student-0071","code":"MEODL-0071","name":"LACORTE, JOHN LAWRENCE DELATADO","team":"ME"},{"id":"student-0072","code":"MEODL-0072","name":"LIMBO, MARK REGIE ASISTIDO","team":"ME"},{"id":"student-0073","code":"MEODL-0073","name":"LLAMZON, ZYMON HILL PASCUAL","team":"ME"},{"id":"student-0074","code":"MEODL-0074","name":"MANZANILLA, BRIXTER JOSEPH GONZALES","team":"ME"},{"id":"student-0075","code":"MEODL-0075","name":"MATUNDAN, KHAEOUS AERAY COLLADO","team":"ME"},{"id":"student-0076","code":"MEODL-0076","name":"MIRASOL, MARTIN NEIL LAQUINDANUM","team":"ME"},{"id":"student-0077","code":"MEODL-0077","name":"NERO, GABBIELLE CACAL","team":"ME"},{"id":"student-0078","code":"MEODL-0078","name":"NUNO, RON EXEQUIEL","team":"ME"},{"id":"student-0079","code":"MEODL-0079","name":"OBLIPIAS, ZIGGY SABDAO","team":"ME"},{"id":"student-0080","code":"MEODL-0080","name":"OLINO, JOPETH ORBESO","team":"ME"},{"id":"student-0081","code":"MEODL-0081","name":"OLIQUINO, CHRISTIAN ARROYO","team":"ME"},{"id":"student-0082","code":"MEODL-0082","name":"ONTE, RAFAEL PAMPLONA","team":"ME"},{"id":"student-0083","code":"MEODL-0083","name":"PEÑA, CARLOS MIGUEL ANTIDO","team":"ME"},{"id":"student-0084","code":"MEODL-0084","name":"PRADO, JOHN LENRICK TABERNILLA","team":"ME"},{"id":"student-0085","code":"MEODL-0085","name":"QUILAO, LORD JOHN LUMACAD","team":"ME"},{"id":"student-0086","code":"MEODL-0086","name":"REAL, JILLIAN CAÑUBAS","team":"ME"},{"id":"student-0087","code":"MEODL-0087","name":"RUTAQUIO, BENEDICT GUCILATAR","team":"ME"},{"id":"student-0088","code":"MEODL-0088","name":"SALON, JAN MIKHAIL FORTUNO","team":"ME"},{"id":"student-0089","code":"MEODL-0089","name":"SANTOS, KARYLLE JOY SADIA","team":"ME"},{"id":"student-0090","code":"MEODL-0090","name":"TAGUIAM, JAE HARVEY BALASTA","team":"ME"},{"id":"student-0091","code":"MEODL-0091","name":"TALATALA, REIN EISEN BANDOLA","team":"ME"},{"id":"student-0092","code":"MEODL-0092","name":"ALVAREZ, VANNA JENILLE ROCCO","team":"ME"},{"id":"student-0093","code":"MEODL-0093","name":"ARGAÑOSA, RYU EMANUEL DELA CRUZ","team":"ME"},{"id":"student-0094","code":"MEODL-0094","name":"BAÑEZ, JOSEL DE CASTRO","team":"ME"},{"id":"student-0095","code":"MEODL-0095","name":"BARLETA, BRYANT DOCTORA","team":"ME"},{"id":"student-0096","code":"MEODL-0096","name":"BENGCO, EPHRAIM RICK REYES","team":"ME"},{"id":"student-0097","code":"MEODL-0097","name":"CABUCO, ZEDRICK CABANIG","team":"ME"},{"id":"student-0098","code":"MEODL-0098","name":"CAJUCOM, AEROL JOHN MARASIGAN","team":"ME"},{"id":"student-0099","code":"MEODL-0099","name":"CARLOS, KING ARDEE NHEL FLORES","team":"ME"},{"id":"student-0100","code":"MEODL-0100","name":"CATLI, JIJAH KARAN CAAGBAY","team":"ME"},{"id":"student-0101","code":"MEODL-0101","name":"DADIS, JARUZZ LANCELOT LAXAMANA","team":"ME"},{"id":"student-0102","code":"MEODL-0102","name":"DANTE, KEN-ZY RACHO","team":"ME"},{"id":"student-0103","code":"MEODL-0103","name":"DE JURAS, IVAN DICHOSO","team":"ME"},{"id":"student-0104","code":"MEODL-0104","name":"DELA ROSA, KEN ALVIN ULEP","team":"ME"},{"id":"student-0105","code":"MEODL-0105","name":"DIMAPILIS, EIDRIAN ROA","team":"ME"},{"id":"student-0106","code":"MEODL-0106","name":"ESTRELLADO, GABRIELLE LANCE MALALUAN","team":"ME"},{"id":"student-0107","code":"MEODL-0107","name":"GLOVO, RISTY AGULLANO","team":"ME"},{"id":"student-0108","code":"MEODL-0108","name":"MARTINEZ, JAY MAR ROMERO","team":"ME"},{"id":"student-0109","code":"MEODL-0109","name":"MEJILLA, JEDIMAR MAGLANGIT","team":"ME"},{"id":"student-0110","code":"MEODL-0110","name":"MERABE, PRINCE ANDEL RODRIGUEZ","team":"ME"},{"id":"student-0111","code":"MEODL-0111","name":"MILAR, EARL JOHN FEDILES","team":"ME"},{"id":"student-0112","code":"MEODL-0112","name":"MIRONES, GIANN CARLO ORTIZ","team":"ME"},{"id":"student-0113","code":"MEODL-0113","name":"OCBINA, ANTHONY REYES","team":"ME"},{"id":"student-0114","code":"MEODL-0114","name":"OPINIO, EDMEL JOHN CONDE","team":"ME"},{"id":"student-0115","code":"MEODL-0115","name":"PEREY, LUIS EMMANUEL MARASIGAN","team":"ME"},{"id":"student-0116","code":"MEODL-0116","name":"QUILITIS, VINCE ALJOE ROBLES","team":"ME"},{"id":"student-0117","code":"MEODL-0117","name":"RECIO, JHEZRIEL EDWARD FLORES","team":"ME"},{"id":"student-0118","code":"MEODL-0118","name":"REYES, LEILA MAY LABACO","team":"ME"},{"id":"student-0119","code":"MEODL-0119","name":"SANDOVAL, EDWARD SOLOMON ALVAREZ","team":"ME"},{"id":"student-0120","code":"MEODL-0120","name":"SEÑEREZ, KYLE CYRIS LLANTO","team":"ME"},{"id":"student-0121","code":"MEODL-0121","name":"TAJAO, PAUL ALDREY BARENG","team":"ME"},{"id":"student-0122","code":"MEODL-0122","name":"TORRES, JAMES CARLOS LAGDAAN","team":"ME"},{"id":"student-0123","code":"MEODL-0123","name":"VASQUEZ, JEPTHAH AGUILA","team":"ME"},{"id":"student-0124","code":"MEODL-0124","name":"YABUT, ASHLEY KURT BERMILLO","team":"ME"},{"id":"student-0125","code":"MEODL-0125","name":"AÑONUEVO, CHRIS","team":"ME"},{"id":"student-0126","code":"MEODL-0126","name":"ATIENZA, MATHEW GARCIA","team":"ME"},{"id":"student-0127","code":"MEODL-0127","name":"BALLESTEROS, MARK ANDERSEN TANDOC","team":"ME"},{"id":"student-0128","code":"MEODL-0128","name":"BANDIOLA, JOHN MARC TORRES","team":"ME"},{"id":"student-0129","code":"MEODL-0129","name":"BARCARSE, SEALTIEL UZZIEL LEGASPI","team":"ME"},{"id":"student-0130","code":"MEODL-0130","name":"BARONIA, JOHN RICHIE DIAZ","team":"ME"},{"id":"student-0131","code":"MEODL-0131","name":"BAYLON, JUSTINE IAN BANAWA","team":"ME"},{"id":"student-0132","code":"MEODL-0132","name":"CAGANAN, JOHN CEDRIC TAMAYO","team":"ME"},{"id":"student-0133","code":"MEODL-0133","name":"CALARA, TYRON JOEL VINOYA","team":"ME"},{"id":"student-0134","code":"MEODL-0134","name":"CAPERARE, CYRUS CESAR MAGAHIS","team":"ME"},{"id":"student-0135","code":"MEODL-0135","name":"CARANIWAN, RHODYLIE KIANA LUNA","team":"ME"},{"id":"student-0136","code":"MEODL-0136","name":"CAYAYAN, LANCE RUSSEL SUMICAD","team":"ME"},{"id":"student-0137","code":"MEODL-0137","name":"CEDALLA, JOHN LESTER HERNANDEZ","team":"ME"},{"id":"student-0138","code":"MEODL-0138","name":"CONVENTO, ADRIAN JAMES LADIA","team":"ME"},{"id":"student-0139","code":"MEODL-0139","name":"DE MESA, ANNA LOREN TUSCANO","team":"ME"},{"id":"student-0140","code":"MEODL-0140","name":"DE TORRES, JAMES IMMANUEL ASILO","team":"ME"},{"id":"student-0141","code":"MEODL-0141","name":"DELA CRUZ, JOHN RINGGO ADELINO","team":"ME"},{"id":"student-0142","code":"MEODL-0142","name":"DELA TORRE, JERALD ROBEL","team":"ME"},{"id":"student-0143","code":"MEODL-0143","name":"DESCALLAR, JOHN PAUL TRAJANO","team":"ME"},{"id":"student-0144","code":"MEODL-0144","name":"ELEFANE, DANAH VALERIE MORALES","team":"ME"},{"id":"student-0145","code":"MEODL-0145","name":"ENRIQUEZ, RAE SHERIZ NECESITO","team":"ME"},{"id":"student-0146","code":"MEODL-0146","name":"EVASCO, ONIMUS AMIR SANCHEZ","team":"ME"},{"id":"student-0147","code":"MEODL-0147","name":"FAJARDO, KING ZHAREN MAMALAYAN","team":"ME"},{"id":"student-0148","code":"MEODL-0148","name":"FAMINIAL, EARL VINCENT MAZO","team":"ME"},{"id":"student-0149","code":"MEODL-0149","name":"FERNANDEZ, NATHANIEL FRANCISCO","team":"ME"},{"id":"student-0150","code":"MEODL-0150","name":"FRANCISCO, RIDJY VILLARIN","team":"ME"},{"id":"student-0151","code":"MEODL-0151","name":"GALANG, KOBIE CONSTANTINE CAPILOS","team":"ME"},{"id":"student-0152","code":"MEODL-0152","name":"JAVIER, DENZEL JOHN LIMSON","team":"ME"},{"id":"student-0153","code":"MEODL-0153","name":"LABRADOR, JOHN PAUL PLASTINAA","team":"ME"},{"id":"student-0154","code":"MEODL-0154","name":"LUMINATE, JIETHER SALMORIN","team":"ME"},{"id":"student-0155","code":"MEODL-0155","name":"MADRONA, CARLOS MIGUEL BANAL","team":"ME"},{"id":"student-0156","code":"MEODL-0156","name":"MAÑEBO, KEITH RUSSELL ALVAREZ","team":"ME"},{"id":"student-0157","code":"MEODL-0157","name":"MARAÑA, RICK JAMES EVANGELISTA","team":"ME"},{"id":"student-0158","code":"MEODL-0158","name":"MARASIGAN, KEMP JOHN RACEL RAMOS","team":"ME"},{"id":"student-0159","code":"MEODL-0159","name":"MESINA, CEDRICK BALLARAN","team":"ME"},{"id":"student-0160","code":"MEODL-0160","name":"MOLDEZ, CARMELO CUNANAN","team":"ME"},{"id":"student-0161","code":"MEODL-0161","name":"ORENSE, EMIL GABRIEL MANGILIN","team":"ME"},{"id":"student-0162","code":"MEODL-0162","name":"PADUGA, EARL JUSTINE ESPELETA","team":"ME"},{"id":"student-0163","code":"MEODL-0163","name":"PAMPLONA, JAMES ADRIAN ENRIQUEZ","team":"ME"},{"id":"student-0164","code":"MEODL-0164","name":"PAYO, DYLAN ATIENZA","team":"ME"},{"id":"student-0165","code":"MEODL-0165","name":"PAYO, PATRICK DANIEL CASTILLO","team":"ME"},{"id":"student-0166","code":"MEODL-0166","name":"QUINTOS, LANCE KENNETH VICTA","team":"ME"},{"id":"student-0167","code":"MEODL-0167","name":"RAMOS, RED MATTHEW DE LEON","team":"ME"},{"id":"student-0168","code":"MEODL-0168","name":"RAPSING, EARL CONTRERAS","team":"ME"},{"id":"student-0169","code":"MEODL-0169","name":"RODIS, CLIFFORD ULLYSSES CASTOR","team":"ME"},{"id":"student-0170","code":"MEODL-0170","name":"SONGALLA, EZEKIEL JENNEL PENIDA","team":"ME"},{"id":"student-0171","code":"MEODL-0171","name":"STEVENS, GILBERT CARAAN","team":"ME"},{"id":"student-0172","code":"MEODL-0172","name":"SUYAT, RYAN BANCORO","team":"ME"},{"id":"student-0173","code":"MEODL-0173","name":"TALAY, SIMON JOHN ASISTORES","team":"ME"},{"id":"student-0174","code":"MEODL-0174","name":"TAN, TYRON JAMES","team":"ME"},{"id":"student-0175","code":"MEODL-0175","name":"VILLACERAN, EMMUEL ROI RIVERA","team":"ME"},{"id":"stu_2026-ece-777","code":"2026-ECE-777","name":"SANTOS, MARIA","team":"ME"}] ;


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



  const SCHEMA_VERSION = '2026.5';
  const ROSTER_VERSION = '2026-EDAYS-588';
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
    { id: 'ce', name: 'CE (Civil Engineering)', shortCode: 'CE', color: 'cyan', hex: '#06b6d4' },
    { id: 'ie', name: 'IE (Industrial Engineering)', shortCode: 'IE', color: 'emerald', hex: '#10b981' },
    { id: 'ee', name: 'EE (Electrical Engineering)', shortCode: 'EE', color: 'orange', hex: '#f97316' },
    { id: 'cpe', name: 'CPE (Computer Engineering)', shortCode: 'CPE', color: 'purple', hex: '#a855f7' },
    { id: 'ece', name: 'ECE (Electronics Engineering)', shortCode: 'ECE', color: 'rose', hex: '#f43f5e' },
    { id: 'me', name: 'ME (Mechanical Engineering)', shortCode: 'ME', color: 'orange', hex: '#ea580c' }
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

  function getToday4AMCutoff() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 0, 0, 0);
  }

  function isTimestampBeforeToday4AM(timeVal) {
    if (!timeVal) return true;
    const d = new Date(timeVal);
    if (isNaN(d.getTime())) return true;

    const now = new Date();
    // Compare in device's local timezone (e.g. UTC+8) to eliminate UTC offset bugs
    if (d.getFullYear() < now.getFullYear()) return true;
    if (d.getFullYear() === now.getFullYear()) {
      if (d.getMonth() < now.getMonth()) return true;
      if (d.getMonth() === now.getMonth()) {
        if (d.getDate() < now.getDate()) return true; // Yesterday or earlier!
        if (d.getDate() === now.getDate()) {
          return d.getHours() < 4; // Today before 4:00 AM local time!
        }
      }
    }
    const today4AM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 0, 0, 0);
    return d.getTime() < today4AM.getTime();
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

  function triggerBlobDownload(content, filename, mimeType) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return filename;
    const blob = new Blob([content], { type: mimeType });
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

  function normalizeGroupProgramKey(rawStr) {
    const clean = String(rawStr || '').trim().toUpperCase();
    if (!clean) return { id: 'general', name: 'GENERAL', shortCode: 'GEN' };
    if (clean === 'IE' || clean === 'BSIE' || clean.includes('INDUSTRIAL')) {
      return { id: 'ie', name: 'IE (Industrial Engineering)', shortCode: 'IE' };
    }
    if (clean === 'ME' || clean === 'BSME' || clean.includes('MECHANICAL') || clean.includes('RANKINE') || clean.includes('OTTO') || clean.includes('BRAYTON') || clean.includes('DIESEL')) {
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
      this.lastStateEtag = null;

      this.config = {
        serverUrl: (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '',
        syncIntervalMs: 1200000,
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

      // 20-Minute Scheduled Backup Tracking (Replaces bandwidth-destroying per-scan backups)
      this.hasUnsavedBackupChanges = false;
      this.scansSinceLastBackup = 0;
      this.lastBackupTime = null;
      this.backupIntervalMs = 1200000; // 20 minutes (1,200,000 ms)
      this.backupTimer = null;

      this.loadConfig();
      this.load();
      this.forceMergeSeedStudents();
      this.ensureFullMasterRoster();
      this.autoSelectGameByTime();
      this.initNetworkListeners();
      this.startSyncLoop();
      this.startScheduledBackupTimer();
      setTimeout(() => this.checkAndPurgePre4AMData(), 300);
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
        subtitle: 'UPHSD CALAMBA • ENGINEERING STUDENT COUNCIL • OCT 19–20, 2026 (7:30 AM – 8:00 PM) • UPHSD GYMNASIUM / OVAL',
        venueName: 'Gymnasium / Oval & Engineering Labs',
        staffPin: '2026',
        groups: DEFAULT_GROUPS.map(g => ({ ...g })),
        sessions: sessions,
        students: existingStudents || this.buildDefaultStudentsMap(sessions),
        auditLog: existingAuditLog || [],
        updatedAt: new Date().toISOString()
      };
    }

    
    ensureFullMasterRoster(targetStudents = null) {
      const studentsMap = targetStudents || this.state.students || {};
      ensureFullMasterRoster(studentsMap, this.games);
      this.state.students = studentsMap;
      if (this.state.eventsCatalog && this.state.eventsCatalog[this.activeEventId]) {
        this.state.eventsCatalog[this.activeEventId].students = studentsMap;
      }
      if (this.state.eventsCatalog && this.state.eventsCatalog['engday_2026']) {
        this.state.eventsCatalog['engday_2026'].students = studentsMap;
      }
      this.reconcileStudentGamesStructure();
      this.reconcileGroupsFromStudents();
      return studentsMap;
    }

    loadFromStorage() {
      return this.load();
    }

    buildDefaultStudentsMap(sessionsList = null) {
      const sessions = sessionsList || this.games || ENGDAY_GAMES;
      const data = (typeof window !== 'undefined' && window.MEODL_DATA) ? window.MEODL_DATA : {};
      const students = {};

      if (Array.isArray(data.students) && data.students.length >= 411) {
        data.students.forEach(s => {
          const key = s.id || s.code;
          const code = String(s.code || s.id || '').trim().toUpperCase();
          const id = String(s.id || s.code || key).trim();
          const teamLower = String(s.team || 'general').trim().toLowerCase();
          const teamName = s.teamName || ('TEAM ' + teamLower.toUpperCase());
          students[key] = {
            id: id,
            code: code,
            studentCode: s.studentCode || code,
            name: s.name,
            team: teamLower,
            teamName: teamName,
            games: this.createEmptyGamesRecord(sessions)
          };
        });
        return students;
      }

      const teams = data.teams || [
        { id: 'me', name: 'TEAM ME', shortCode: 'ME' },
        { id: 'ee', name: 'TEAM EE', shortCode: 'EE' },
        { id: 'cpe', name: 'TEAM CPE', shortCode: 'CPE' },
        { id: 'ece', name: 'TEAM ECE', shortCode: 'ECE' },
        { id: 'ie', name: 'TEAM IE', shortCode: 'IE' },
        { id: 'ce', name: 'TEAM CE', shortCode: 'CE' }
      ];
      const rosters = data.rosters || {};

      teams.forEach(team => {
        const teamKey = (team.shortCode || team.id).toUpperCase();
        const members = rosters[teamKey] || rosters[team.id.toUpperCase()] || [];
        members.forEach((item, idx) => {
          const isObj = typeof item === 'object' && item !== null;
          const name = isObj ? item.name : item;
          const code = (isObj && (item.code || item.id)) ? (item.code || item.id) : (teamKey + '-' + String(idx + 1).padStart(3, '0'));
          const id = (isObj && item.id) ? item.id : code;
          const key = id || code;

          students[key] = {
            id: id,
            code: code,
            studentCode: code,
            name: name,
            team: team.id.toLowerCase(),
            teamName: team.name,
            games: this.createEmptyGamesRecord(sessions)
          };
        });
      });

      return students;
    }

    buildInitialRoster(sessionsList = null) {
      return this.buildDefaultStudentsMap(sessionsList);
    }

    forceMergeSeedStudents(targetStudents = null) {
      const studentsMap = targetStudents || this.state.students || {};
      const defaultMap = this.buildDefaultStudentsMap(this.games);

      const existingLookup = new Set();
      for (const [k, s] of Object.entries(studentsMap)) {
        if (k) existingLookup.add(String(k).trim().toUpperCase());
        if (s) {
          if (s.id) existingLookup.add(String(s.id).trim().toUpperCase());
          if (s.code) existingLookup.add(String(s.code).trim().toUpperCase());
          if (s.studentCode) existingLookup.add(String(s.studentCode).trim().toUpperCase());
        }
      }

      let addedCount = 0;
      for (const [seedKey, seedStudent] of Object.entries(defaultMap)) {
        const seedId = String(seedStudent.id || seedKey).trim().toUpperCase();
        const seedCode = String(seedStudent.code || seedStudent.studentCode || seedKey).trim().toUpperCase();

        if (!existingLookup.has(seedId) && !existingLookup.has(seedCode)) {
          const keyToUse = seedStudent.id || seedStudent.code || seedKey;
          studentsMap[keyToUse] = {
            ...seedStudent,
            games: this.createEmptyGamesRecord(this.games)
          };
          existingLookup.add(seedId);
          existingLookup.add(seedCode);
          addedCount++;
        }
      }

      this.state.students = studentsMap;
      if (this.state.eventsCatalog && this.state.eventsCatalog[this.activeEventId]) {
        this.state.eventsCatalog[this.activeEventId].students = studentsMap;
      }
      if (this.state.eventsCatalog && this.state.eventsCatalog['engday_2026']) {
        this.state.eventsCatalog['engday_2026'].students = studentsMap;
      }

      this.reconcileStudentGamesStructure();
      this.reconcileGroupsFromStudents();

      if (addedCount > 0) {
        console.log(`[EngDay] Force-merged ${addedCount} missing seed students into state. Total roster: ${Object.keys(studentsMap).length}`);
        this.save({ preserveVersion: true });
      }

      return studentsMap;
    }

    checkAndMigrateRoster() {
      const isMissingEE = !this.state.students || !this.state.students['EE-001'];
      const isMissingCE = !this.state.students || !this.state.students['CE-001'];
      const isMissingME = !this.state.students || (!this.state.students['student-0001'] && !this.state.students['MEODL-0001']);
      const countTooLow = Object.keys(this.state.students || {}).length < 580;
      const versionMismatch = this.state.rosterVersion !== ROSTER_VERSION;

      if (isMissingEE || isMissingCE || isMissingME || countTooLow || versionMismatch) {
        console.log(`[EngDay] Auto-migrating roster to ${ROSTER_VERSION} (missingEE: ${isMissingEE}, missingCE: ${isMissingCE}, missingME: ${isMissingME}, count: ${Object.keys(this.state.students || {}).length})...`);
        this.forceMergeSeedStudents();
        this.state.rosterVersion = ROSTER_VERSION;
        this.state.schemaVersion = SCHEMA_VERSION;

        if (this.state.eventsCatalog && this.state.eventsCatalog['engday_2026']) {
          this.state.eventsCatalog['engday_2026'].students = this.state.students;
          this.state.eventsCatalog['engday_2026'].rosterVersion = ROSTER_VERSION;
          this.state.eventsCatalog['engday_2026'].schemaVersion = SCHEMA_VERSION;
          this.state.eventsCatalog['engday_2026'].updatedAt = new Date().toISOString();
        }

        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem('ENGDAY_ROSTER_VERSION', ROSTER_VERSION);
          } catch (e) {}
        }

        this.save();
        console.log(`[EngDay] Roster auto-migrated to ${ROSTER_VERSION} with ${Object.keys(this.state.students).length} students.`);
      }
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
          if (hasLegacyRoster || this.state.rosterVersion !== ROSTER_VERSION) {
            this.checkAndMigrateRoster();
          }
          if (!defEvt.title || defEvt.title === 'Engineering Day 2026') {
            defEvt.title = 'ENGINEERING DAYS 2026';
          }
          if (!defEvt.subtitle || defEvt.subtitle.includes('Sports') || defEvt.subtitle.includes('College of Engineering')) {
            defEvt.subtitle = 'UPHSD CALAMBA • ENGINEERING STUDENT COUNCIL • OCT 19–20, 2026 (7:30 AM – 8:00 PM) • UPHSD GYMNASIUM / OVAL';
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

      // Enforce EE orange color across existing groups
      evt.groups.forEach(g => {
        const gid = String(g.id).toLowerCase();
        if (gid === 'ee' && (g.color === 'zinc' || g.hex === '#27272a' || g.color === 'amber')) {
          g.color = 'orange';
          g.hex = '#f97316';
        }
      });

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

      // Official 6 Engineering Programs (Distinct High-Contrast Program Badges)
      if (key === 'ce') {
        return {
          id: 'ce',
          name: 'CE (Civil Engineering)',
          shortCode: 'CE',
          color: 'cyan',
          hex: '#06b6d4',
          badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50',
          bgClass: 'bg-cyan-950/25',
          borderClass: 'border-cyan-400/50',
          textClass: 'text-cyan-300',
          barClass: 'bg-cyan-500'
        };
      }
      if (key === 'ie') {
        return {
          id: 'ie',
          name: 'IE (Industrial Engineering)',
          shortCode: 'IE',
          color: 'emerald',
          hex: '#10b981',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50',
          bgClass: 'bg-emerald-950/25',
          borderClass: 'border-emerald-400/50',
          textClass: 'text-emerald-300',
          barClass: 'bg-emerald-500'
        };
      }
      if (key === 'ee') {
        return {
          id: 'ee',
          name: 'EE (Electrical Engineering)',
          shortCode: 'EE',
          color: 'orange',
          hex: '#f97316',
          badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-400/50',
          bgClass: 'bg-orange-950/25',
          borderClass: 'border-orange-400/50',
          textClass: 'text-orange-300',
          barClass: 'bg-orange-500'
        };
      }
      if (key === 'cpe') {
        return {
          id: 'cpe',
          name: 'CPE (Computer Engineering)',
          shortCode: 'CPE',
          color: 'purple',
          hex: '#a855f7',
          badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-400/50',
          bgClass: 'bg-purple-950/25',
          borderClass: 'border-purple-400/50',
          textClass: 'text-purple-300',
          barClass: 'bg-purple-500'
        };
      }
      if (key === 'ece') {
        return {
          id: 'ece',
          name: 'ECE (Electronics Engineering)',
          shortCode: 'ECE',
          color: 'rose',
          hex: '#f43f5e',
          badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-400/50',
          bgClass: 'bg-rose-950/25',
          borderClass: 'border-rose-400/50',
          textClass: 'text-rose-300',
          barClass: 'bg-rose-500'
        };
      }
      if (key === 'me') {
        return {
          id: 'me',
          name: 'ME (Mechanical Engineering)',
          shortCode: 'ME',
          color: 'orange',
          hex: '#ea580c',
          badgeClass: 'bg-orange-600/25 text-orange-300 border-orange-500/60',
          bgClass: 'bg-orange-950/25',
          borderClass: 'border-orange-500/60',
          textClass: 'text-orange-300',
          barClass: 'bg-orange-500'
        };
      }

      // Preserve classic 4 house colors as fallback (mapped to official attire)
      if (key === 'rankine') {
        return {
          id: 'rankine',
          name: 'TEAM RANKINE',
          shortCode: 'R',
          color: 'orange',
          hex: '#ea580c',
          badgeClass: 'bg-orange-600/25 text-orange-300 border-orange-500/60',
          bgClass: 'bg-orange-950/25',
          borderClass: 'border-orange-500/60',
          textClass: 'text-orange-300',
          barClass: 'bg-orange-500'
        };
      }
      if (key === 'otto') {
        return {
          id: 'otto',
          name: 'TEAM OTTO',
          shortCode: 'O',
          color: 'amber',
          hex: '#f59e0b',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
          bgClass: 'bg-amber-950/25',
          borderClass: 'border-amber-400/50',
          textClass: 'text-amber-300',
          barClass: 'bg-amber-500'
        };
      }
      if (key === 'brayton') {
        return {
          id: 'brayton',
          name: 'TEAM BRAYTON',
          shortCode: 'B',
          color: 'cyan',
          hex: '#06b6d4',
          badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50',
          bgClass: 'bg-cyan-950/25',
          borderClass: 'border-cyan-400/50',
          textClass: 'text-cyan-300',
          barClass: 'bg-cyan-500'
        };
      }
      if (key === 'diesel') {
        return {
          id: 'diesel',
          name: 'TEAM DIESEL',
          shortCode: 'D',
          color: 'emerald',
          hex: '#10b981',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50',
          bgClass: 'bg-emerald-950/25',
          borderClass: 'border-emerald-400/50',
          textClass: 'text-emerald-300',
          barClass: 'bg-emerald-500'
        };
      }

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

    matchesSearch(student, rawQuery) {
      if (!rawQuery) return true;
      const q = String(rawQuery).trim();
      if (!q) return true;

      const terms = q.split(/[,/;\n]+/).map(t => t.trim().toUpperCase()).filter(Boolean);
      if (!terms.length) return true;

      const name = String(student.name || '').toUpperCase();
      const code = String(student.studentCode || student.code || student.id || '').toUpperCase();
      const team = String(student.team || '').toUpperCase();
      const teamName = String(student.teamName || '').toUpperCase();
      const combined = `${code} ${name} ${team} ${teamName}`;

      return terms.some(term => {
        const words = term.split(/\s+/).filter(Boolean);
        if (!words.length) return true;
        return words.every(w => combined.includes(w));
      });
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

      // Bandwidth-Saver: Do not refetch full state on visibilitychange or window focus
      // to prevent excessive Fast Origin Transfer bandwidth consumption.
      // Admins and marshals can use the manual 'Refresh' button if immediate data is desired.
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
          return window.location.origin ? window.location.origin.replace(/\/$/, '') : 'https://meodl.vercel.app';
        }
        return 'https://meodl.vercel.app';
      }
      return url.replace(/\/$/, '');
    }

    resolveApiUrl(endpointPath) {
      const cleanPath = (endpointPath || '').startsWith('/') ? endpointPath : `/${endpointPath || ''}`;
      if (typeof window === 'undefined' || !window.location) {
        return cleanPath;
      }

      const host = window.location.hostname || '';
      const origin = window.location.origin ? window.location.origin.replace(/\/$/, '') : '';

      let configuredUrl = (this.config.serverUrl || '').trim();
      if (!configuredUrl && typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('ENGDAY_SERVER_URL');
        if (saved && saved.trim()) configuredUrl = saved.trim();
      }
      if (configuredUrl) {
        configuredUrl = configuredUrl.replace(/\/$/, '');
      }

      // 1. If running on Vercel (*.vercel.app)
      if (host.includes('vercel.app')) {
        // If no custom URL configured, or configured URL points to vercel or origin, use same-origin relative path!
        if (!configuredUrl || configuredUrl.includes('vercel.app') || (origin && configuredUrl.startsWith(origin))) {
          return cleanPath;
        }
        return `${configuredUrl}${cleanPath}`;
      }

      // 2. If running locally (localhost, 127.0.0.1, or local private IP)
      const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '[::1]' ||
        host.startsWith('192.168.') || host.startsWith('10.') || host.startsWith('172.') || host.endsWith('.local');

      if (isLocalHost) {
        // If user explicitly configured an external remote URL (like https://meodl.vercel.app), use it
        if (configuredUrl && !configuredUrl.includes('localhost') && !configuredUrl.includes('127.0.0.1') && (!origin || !configuredUrl.startsWith(origin))) {
          return `${configuredUrl}${cleanPath}`;
        }
        return cleanPath;
      }

      // 3. If running on GitHub Pages (github.io) or static file
      if (configuredUrl) {
        return `${configuredUrl}${cleanPath}`;
      }
      return `https://meodl.vercel.app${cleanPath}`;
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
          // Enforce minimum 20 minutes (1,200,000 ms) to prevent high-frequency polling from legacy local storage
          if (!this.config.syncIntervalMs || this.config.syncIntervalMs < 1200000) {
            this.config.syncIntervalMs = 1200000;
          }
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
              this.forceMergeSeedStudents();
              this.checkAndMigrateRoster();
              this.ensureFullMasterRoster();
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

    startScheduledBackupTimer() {
      if (typeof window === 'undefined' || typeof setInterval === 'undefined') return;
      if (this.backupTimer && typeof clearInterval !== 'undefined') {
        clearInterval(this.backupTimer);
      }

      // Scheduled 20-minute backup interval (1,200,000 ms)
      this.backupTimer = setInterval(() => {
        this.performScheduledBackup().catch(err => {
          console.warn('[EngDay Backup] Scheduled 20-minute backup error:', err);
        });
      }, this.backupIntervalMs || 1200000);
    }

    async performScheduledBackup() {
      // Bandwidth & Resource Saver: Only run if new scans or changes have occurred
      if (!this.hasUnsavedBackupChanges && (this.scansSinceLastBackup || 0) === 0) {
        return { skipped: true, reason: 'No new scans since last backup' };
      }

      console.log(`[EngDay Backup] 20-Minute Scheduled Backup Triggered (${this.scansSinceLastBackup || 0} scans since last backup)...`);

      // 1. Silent Disk Link write (PC Chrome/Edge File System Access API)
      let diskSaved = false;
      if (this.localFileHandle) {
        try {
          diskSaved = await this.writeToLocalFileHandle();
        } catch (e) {
          console.warn('[EngDay Backup] Local file handle write failed:', e);
        }
      }

      // 2. Refresh local IndexedDB snapshot
      if (this.db && typeof this.db.saveSnapshot === 'function') {
        try {
          await this.db.saveSnapshot(this.state);
        } catch (e) {}
      }

      this.hasUnsavedBackupChanges = false;
      this.scansSinceLastBackup = 0;
      this.lastBackupTime = new Date().toISOString();
      this.notify();

      return {
        success: true,
        diskSaved,
        lastBackupTime: this.lastBackupTime
      };
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
        // Multi-Device & Bandwidth Saver:
        // Do NOT write entire backup JSON to disk on every single scan!
        // Scans are marked dirty and backed up automatically on the 20-minute scheduled interval.
        this.hasUnsavedBackupChanges = true;
        this.scansSinceLastBackup = (this.scansSinceLastBackup || 0) + 1;
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
      this.state.rosterVersion = ROSTER_VERSION;
      this.state.auditLog = [];
      this.ensureEventsCatalogStructure();
      this.save();
    }

    reconcileStudentGamesStructure() {
      if (!this.state.students) return;

      // Purge test student custom_stu_999 / 2026-CPE-999
      delete this.state.students['custom_stu_999'];
      delete this.state.students['2026-CPE-999'];
      for (const [k, s] of Object.entries(this.state.students)) {
        if (!s || s.id === 'custom_stu_999' || s.code === '2026-CPE-999' || s.id === '2026-CPE-999' || s.studentCode === '2026-CPE-999') {
          delete this.state.students[k];
        }
      }

      // Purge test logs from auditLog
      if (Array.isArray(this.state.auditLog)) {
        this.state.auditLog = this.state.auditLog.filter(l => {
          if (!l) return false;
          if (l.studentCode === '2026-CPE-999' || l.studentId === 'custom_stu_999' || l.studentId === '2026-CPE-999') return false;
          if (l.gameId && (l.gameId.startsWith('vb_') || l.gameId.startsWith('bb_'))) return false;
          return true;
        });
      }

      const activeGameIds = new Set((this.games || []).map(g => g.id));
      Object.values(this.state.students).forEach(s => {
        if (!s || typeof s !== 'object') return;
        if (!s.games) s.games = {};
        // Purge legacy test sessions (vb_g1, bb_g1, etc.)
        Object.keys(s.games).forEach(gId => {
          if (!activeGameIds.has(gId) || gId.startsWith('vb_') || gId.startsWith('bb_')) {
            if (!activeGameIds.has(gId)) {
              delete s.games[gId];
            }
          }
        });
        (this.games || []).forEach(g => {
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

    getStudents() {
      this.ensureFullMasterRoster();
      const studentsMap = this.state.students || {};
      return Object.values(studentsMap).map(s => {
        const rawCode = String(s.code || s.studentCode || s.id || '').trim();
        return {
          id: s.id || rawCode,
          code: rawCode,
          studentCode: rawCode,
          name: s.name || '',
          team: s.team || s.group || 'general',
          teamName: s.teamName || '',
          games: s.games || {}
        };
      });
    }

    // -------------------------------------------------------------------------
    // 6. FLEXIBLE QR SCAN & STUDENT LOOKUP (SAFEGUARD 1)
    // -------------------------------------------------------------------------
    getStudentById(id) {
      if (!id || !this.state.students) return null;
      const clean = String(id).trim();
      const upper = clean.toUpperCase();
      if (this.state.students[clean]) return this.state.students[clean];
      if (this.state.students[upper]) return this.state.students[upper];
      return Object.values(this.state.students).find(s =>
        (s.id && s.id.toUpperCase() === upper) ||
        (s.code && s.code.toUpperCase() === upper) ||
        (s.studentCode && s.studentCode.toUpperCase() === upper)
      ) || null;
    }

    getStudentByCode(code) {
      if (!code || !this.state.students) return null;
      const clean = String(code).trim().toUpperCase();
      if (this.state.students[clean]) return this.state.students[clean];
      return Object.values(this.state.students).find(s =>
        (s.studentCode && s.studentCode.trim().toUpperCase() === clean) ||
        (s.code && s.code.trim().toUpperCase() === clean) ||
        (s.id && s.id.trim().toUpperCase() === clean)
      ) || null;
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
          this.syncWithServer({ pushOnly: true }).catch(() => {});
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
          this.syncWithServer({ pushOnly: true }).catch(() => {});
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
          this.syncWithServer({ pushOnly: true }).catch(() => {});
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
    async resetAllAttendanceData(sessionIdFilter = null) {
      this.ensureEventsCatalogStructure();
      const targetEventKey = this.activeEventId || 'engday_2026';
      const nowIso = new Date().toISOString();

      // 1. Clear IndexedDB stores & localStorage event outboxes
      await this.db.clearEventsForEventKey(targetEventKey, sessionIdFilter);

      // 2. Clear state scan logs, audit log, and attendance map
      if (sessionIdFilter) {
        this.state.auditLog = (this.state.auditLog || []).filter(l => l.gameId !== sessionIdFilter);
        if (Array.isArray(this.state.scanLogs)) {
          this.state.scanLogs = this.state.scanLogs.filter(l => l.gameId !== sessionIdFilter);
        }
      } else {
        this.state.auditLog = [];
        this.state.scanLogs = [];
        this.state.attendance = {};
      }

      // 3. Reset student records back to zero (OUTSIDE, 0 visits, null timestamps, empty history)
      const targetStudents = this.state.students || {};
      Object.values(targetStudents).forEach(s => {
        if (!s) return;
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

      // Also reset in active catalog event if separated
      if (this.state.eventsCatalog && this.state.eventsCatalog[targetEventKey]?.students) {
        Object.values(this.state.eventsCatalog[targetEventKey].students).forEach(s => {
          if (!s) return;
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
      }

      // 4. Ensure all ~588 master students remain 100% intact
      this.ensureFullMasterRoster(this.state.students);
      this.reconcileStudentGamesStructure();
      this.reconcileGroupsFromStudents();

      // 5. Update reset metadata & increment version
      this.state.lastResetTimestamp = nowIso;
      this.state.resetSequence = (this.state.resetSequence || 0) + 1;
      this.state.version = (this.state.version || 1) + 10;
      this.state.lastUpdated = nowIso;
      this.lastSyncedServerVersion = this.state.version;

      // 6. Save locally
      this.save({ preserveVersion: true });
      await this.updatePendingCount();

      // 7. Sync reset to server if online
      if (typeof navigator === 'undefined' || navigator.onLine !== false) {
        try {
          const resetUrl = this.resolveApiUrl('/api/engday/attendance/reset');
          await fetch(resetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              confirmation: 'RESET_ENGDAY_ATTENDANCE',
              eventKey: targetEventKey,
              sessionId: sessionIdFilter || null,
              resetAll: !sessionIdFilter,
              keepRoster: true,
              resetTimestamp: nowIso,
              resetSequence: this.state.resetSequence
            })
          });
          this.serverOnline = true;
          this.lastSyncTime = formatManilaTime(new Date());
        } catch (e) {
          console.warn('[EngDay Reset] Server sync failed (will retry on next sync):', e);
        }
      }

      this.notify();
      return { success: true, timestamp: nowIso, resetSequence: this.state.resetSequence };
    }

    async resetActiveEventAttendance(sessionIdFilter = null) {
      return this.resetAllAttendanceData(sessionIdFilter);
    }

    async hardResetAttendanceData(options = {}) {
      this.ensureEventsCatalogStructure();
      const targetEventKey = this.activeEventId || 'engday_2026';
      const evt = this.getActiveEvent();
      const nowIso = new Date().toISOString();

      // 1. Wipe in-memory and state logs, audit log, and attendance maps
      this.state.auditLog = [];
      this.state.scanLogs = [];
      this.state.attendance = {};

      if (evt) {
        evt.auditLog = [];
        evt.scanLogs = [];
        evt.attendance = {};
      }

      // 2. Completely reset student records to zero-state (OUTSIDE, 0 visits, null checkin/out, empty history)
      const targetStudents = this.state.students || {};
      Object.values(targetStudents).forEach(s => {
        if (!s) return;
        s.games = this.createEmptyGamesRecord();
        s.status = 'OUTSIDE';
      });

      if (this.state.eventsCatalog && this.state.eventsCatalog[targetEventKey]?.students) {
        Object.values(this.state.eventsCatalog[targetEventKey].students).forEach(s => {
          if (!s) return;
          s.games = this.createEmptyGamesRecord();
          s.status = 'OUTSIDE';
        });
      }

      // 3. Guarantee full ~588-student roster remains 100% intact
      this.ensureFullMasterRoster(this.state.students);
      this.reconcileStudentGamesStructure();
      this.reconcileGroupsFromStudents();

      // 4. Wipe all IndexedDB stores (attendanceEvents, syncQueue, attendanceSnapshot)
      await this.db.clearAll();

      // 5. Clear localStorage keys
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem('ENGDAY_EVENTS_FALLBACK_V1');
          localStorage.removeItem('ENGDAY_QUEUE_FALLBACK_V1');
          localStorage.removeItem('ENGDAY_SNAPSHOT_FALLBACK_V1');
        } catch (e) {}
      }

      // 6. Update timestamps & sequences
      this.state.lastHardResetTimestamp = nowIso;
      this.state.hardResetSequence = (this.state.hardResetSequence || 0) + 1;
      this.state.lastResetTimestamp = nowIso;
      this.state.resetSequence = (this.state.resetSequence || 0) + 1;
      this.state.version = (this.state.version || 1) + 20;
      this.state.lastUpdated = nowIso;
      this.lastSyncedServerVersion = this.state.version;

      if (evt) {
        evt.lastHardResetTimestamp = nowIso;
        evt.hardResetSequence = this.state.hardResetSequence;
        evt.lastResetTimestamp = nowIso;
        evt.resetSequence = this.state.resetSequence;
        evt.updatedAt = nowIso;
      }

      // 7. Save locally
      this.save({ preserveVersion: true });
      await this.updatePendingCount();

      // 8. Forces a direct payload push to the backend server
      if (typeof navigator === 'undefined' || navigator.onLine !== false) {
        try {
          const resetPayload = {
            action: 'HARD_RESET',
            confirmation: 'HARD_RESET_ENGDAY_ATTENDANCE',
            pin: options.pin || '2026',
            eventKey: targetEventKey,
            resetTimestamp: nowIso,
            hardResetSequence: this.state.hardResetSequence,
            resetSequence: this.state.resetSequence,
            students: this.state.students,
            scanLogs: [],
            attendance: {}
          };

          // 8a. Direct push to dedicated /hard-reset endpoint
          const hardResetUrl = this.resolveApiUrl('/api/engday/attendance/hard-reset');
          await fetch(hardResetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resetPayload)
          }).catch(() => {});

          // 8b. Push clean event config to /config
          await this.syncConfigWithServer().catch(() => {});

          // 8c. Push direct empty state / reset command to /sync
          const syncUrl = this.resolveApiUrl('/api/engday/attendance/sync');
          await fetch(syncUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deviceId: this.deviceId,
              activeEventId: targetEventKey,
              action: 'HARD_RESET',
              hardReset: true,
              lastHardResetTimestamp: nowIso,
              events: []
            })
          }).catch(() => {});

          this.serverOnline = true;
          this.lastSyncTime = formatManilaTime(new Date());
        } catch (e) {
          console.warn('[EngDay Hard Reset] Server sync failed (will retry):', e);
        }
      }

      this.notify();
      return {
        success: true,
        timestamp: nowIso,
        hardResetSequence: this.state.hardResetSequence,
        studentCount: Object.keys(this.state.students).length
      };
    }

    async purgeAttendanceBefore(cutoffTimestampOrString = null) {
      this.ensureEventsCatalogStructure();
      const targetEventKey = this.activeEventId || 'engday_2026';

      let cutoff = null;
      if (cutoffTimestampOrString) {
        cutoff = (cutoffTimestampOrString instanceof Date) ? cutoffTimestampOrString : new Date(cutoffTimestampOrString);
        if (isNaN(cutoff.getTime())) cutoff = null;
      }
      if (!cutoff) {
        cutoff = getToday4AMCutoff();
      }

      const cutoffTime = cutoff.getTime();
      const cutoffIso = cutoff.toISOString();
      const isPre4AMToday = !cutoffTimestampOrString || Math.abs(cutoffTime - getToday4AMCutoff().getTime()) < 60000;

      const isStale = (timeVal) => {
        if (!timeVal) return false;
        if (isPre4AMToday) {
          return isTimestampBeforeToday4AM(timeVal);
        }
        const t = new Date(timeVal).getTime();
        return !isNaN(t) && t < cutoffTime;
      };

      // 1. Filter local IndexedDB events & queue
      const allEvents = await this.db.getAllEvents();
      const validEvents = allEvents.filter(e => {
        const ek = e.eventKey || 'engday_2026';
        if (ek !== targetEventKey) return true; // keep other events untouched
        return !isStale(e.occurredAt || e.time || e.createdAt);
      });
      const staleEventIds = allEvents.filter(e => {
        const ek = e.eventKey || 'engday_2026';
        if (ek !== targetEventKey) return false;
        return isStale(e.occurredAt || e.time || e.createdAt);
      }).map(e => e.eventId);

      // Remove stale event IDs from IndexedDB
      if (staleEventIds.length > 0 && this.db.db) {
        await new Promise(resolve => {
          try {
            const tx = this.db.db.transaction(['attendanceEvents', 'syncQueue'], 'readwrite');
            const evStore = tx.objectStore('attendanceEvents');
            const qStore = tx.objectStore('syncQueue');
            staleEventIds.forEach(id => {
              try { evStore.delete(id); } catch(e) {}
              try { qStore.delete(id); } catch(e) {}
            });
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
          } catch (e) {
            resolve();
          }
        });
      }

      // Update localStorage fallbacks
      try {
        if (typeof localStorage !== 'undefined') {
          const fbEvents = this.db.getAllEventsFromLocalStorage().filter(e => {
            const ek = e.eventKey || 'engday_2026';
            if (ek !== targetEventKey) return true;
            return !isStale(e.occurredAt || e.time || e.createdAt);
          });
          localStorage.setItem('ENGDAY_EVENTS_FALLBACK_V1', JSON.stringify(fbEvents));

          const fbQueue = this.db.getQueueFromLocalStorage().filter(e => {
            const ek = e.eventKey || 'engday_2026';
            if (ek !== targetEventKey) return true;
            return !isStale(e.occurredAt || e.time || e.createdAt);
          });
          this.db.saveQueueToLocalStorage(fbQueue);
        }
      } catch (e) {}

      // 2. Filter state.auditLog and state.scanLogs
      this.state.auditLog = (this.state.auditLog || []).filter(l => {
        const ek = l.eventKey || targetEventKey;
        if (ek !== targetEventKey) return true;
        return !isStale(l.timestamp || l.time || l.occurredAt);
      });
      if (Array.isArray(this.state.scanLogs)) {
        this.state.scanLogs = this.state.scanLogs.filter(l => {
          return !isStale(l.time || l.occurredAt || l.timestamp);
        });
      } else {
        this.state.scanLogs = [];
      }

      // 3. Reset student records to empty games, then replay remaining valid events
      const targetStudents = this.state.students || {};
      Object.values(targetStudents).forEach(s => {
        if (s) s.games = this.createEmptyGamesRecord();
      });

      if (this.state.eventsCatalog && this.state.eventsCatalog[targetEventKey]?.students) {
        Object.values(this.state.eventsCatalog[targetEventKey].students).forEach(s => {
          if (s) s.games = this.createEmptyGamesRecord();
        });
      }

      // Chronologically replay valid events
      const activeValidEvents = validEvents.filter(e => (e.eventKey || 'engday_2026') === targetEventKey);
      activeValidEvents.sort((a, b) => new Date(a.occurredAt || 0) - new Date(b.occurredAt || 0));
      for (const ev of activeValidEvents) {
        this.applySingleEventToStudentState(ev);
      }

      // Rebuild state.attendance summary map
      this.state.attendance = {};
      Object.values(targetStudents).forEach(s => {
        if (!s) return;
        const code = String(s.code || s.studentCode || s.id || '').toUpperCase();
        if (code) {
          this.state.attendance[code] = {
            id: s.id,
            code: code,
            name: s.name,
            team: s.team,
            games: s.games
          };
        }
      });

      // 4. Ensure master 588 roster remains intact
      this.ensureFullMasterRoster(this.state.students);
      this.reconcileStudentGamesStructure();
      this.reconcileGroupsFromStudents();

      // 5. Update metadata
      this.state.lastPurgeTimestamp = cutoffIso;
      this.state.lastPurgeAt = new Date().toISOString();
      this.state.version = (this.state.version || 1) + 5;
      this.state.lastUpdated = new Date().toISOString();
      this.lastSyncedServerVersion = this.state.version;

      // 6. Save locally
      this.save({ preserveVersion: true });
      await this.updatePendingCount();

      // 7. Push purge to backend server if online (with cleanEvents and scanLogs array)
      if (typeof navigator === 'undefined' || navigator.onLine !== false) {
        try {
          const purgeUrl = this.resolveApiUrl('/api/engday/attendance/purge');
          await fetch(purgeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventKey: targetEventKey,
              cutoff: cutoffIso,
              cleanEvents: activeValidEvents,
              scanLogs: this.state.scanLogs || []
            })
          });
          await this.syncConfigWithServer();
          this.serverOnline = true;
          this.lastSyncTime = formatManilaTime(new Date());
        } catch (e) {
          console.warn('[EngDay Purge] Server sync failed (will retry on next sync):', e);
        }
      }

      this.notify();
      return {
        success: true,
        purgedCount: staleEventIds.length,
        remainingCount: activeValidEvents.length,
        cutoff: cutoffIso
      };
    }

    async checkAndPurgePre4AMData() {
      try {
        const cutoff = getToday4AMCutoff();
        const targetEventKey = this.activeEventId || 'engday_2026';

        const allLocalEvents = await this.collectAllLocalEventsForEvent(targetEventKey);
        const hasStaleEvents = allLocalEvents.some(e => {
          return isTimestampBeforeToday4AM(e.occurredAt || e.time || e.createdAt);
        });
        const hasStaleAudit = (this.state.auditLog || []).some(l => {
          return isTimestampBeforeToday4AM(l.timestamp || l.time || l.occurredAt);
        });
        const hasStaleScanLogs = (this.state.scanLogs || []).some(l => {
          return isTimestampBeforeToday4AM(l.time || l.occurredAt || l.timestamp);
        });

        if (hasStaleEvents || hasStaleAudit || hasStaleScanLogs) {
          console.info(`[EngDay Purge] Found scan records timestamped before 4:00 AM (${cutoff.toISOString()}). Purging...`);
          await this.purgeAttendanceBefore(cutoff);
        }
      } catch (err) {
        console.warn('[EngDay Purge] Auto-purge check warning:', err);
      }
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

    exportAttendanceReportCSV() {
      if (typeof this.ensureFullMasterRoster === 'function') {
        this.ensureFullMasterRoster(this.state.students);
      }

      const students = Object.values(this.state.students || {});
      const games = (this.games && this.games.length) ? this.games : ENGDAY_GAMES;

      // Sort students by Department (CE, CPE, EE, ECE, IE, ME) then by student code
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

      // Header row: Student ID, Full Name, Department/Group, [8 Track A Checkpoints], Total Minutes Inside
      const headerCols = ['Student ID', 'Full Name', 'Department/Group'];
      games.forEach(g => {
        const cleanLabel = String(g.shortName || g.name || g.id).replace(/"/g, '""');
        headerCols.push(`${cleanLabel} Status`);
      });
      headerCols.push('Total Minutes Inside');

      let csv = headerCols.map(escapeCsv).join(',') + '\r\n';

      // Rows for all 588 students
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

        games.forEach(g => {
          const gr = (s.games && s.games[g.id]) || {};
          const ds = this.getSessionDwellStats(s, g.id, {
            minMinutesRequired: g.mode === 'check_in_only' ? 0 : 45
          });
          const dwellMins = Number(ds.dwellMinutes) || 0;
          totalMinutesInside += dwellMins;

          let status = 'ABSENT';
          if (gr.status === 'INSIDE') {
            status = 'INSIDE';
          } else if (gr.visits > 0 || ds.hasScanned) {
            if (g.mode === 'check_in_only' || ds.creditStatus === 'VERIFIED') {
              status = 'VERIFIED';
            } else {
              status = 'UNDER_TIME';
            }
          } else {
            status = 'ABSENT';
          }

          rowCols.push(escapeCsv(status));
        });

        rowCols.push(totalMinutesInside);
        csv += rowCols.join(',') + '\r\n';
      });

      return csv;
    }

    async downloadAttendanceReportCSV(filename = 'Engineering_Days_2026_Attendance_Report.csv') {
      const targetFilename = filename || 'Engineering_Days_2026_Attendance_Report.csv';

      // 1. Try to fetch authoritative server-merged master CSV if online
      if (this.config.syncEnabled && (typeof navigator === 'undefined' || navigator.onLine !== false)) {
        try {
          const backupUrl = this.resolveApiUrl(`/api/engday/attendance/backup?eventKey=${encodeURIComponent(this.activeEventId)}&format=csv`);
          const res = await fetch(backupUrl);
          if (res.ok) {
            const csvText = await res.text();
            return triggerBlobDownload(csvText, targetFilename, 'text/csv;charset=utf-8;');
          }
        } catch (e) {
          console.warn('[EngDay Backup] Server CSV fetch failed, falling back to local state:', e);
        }
      }

      // 2. Fallback to local state if offline or server unreachable
      const csv = this.exportAttendanceReportCSV();
      return triggerBlobDownload(csv, targetFilename, 'text/csv;charset=utf-8;');
    }

    async downloadCSV(gameIdFilter = null) {
      if (!gameIdFilter) {
        return this.downloadAttendanceReportCSV();
      }
      const csv = this.exportCSV(gameIdFilter);
      const evtSlug = slugify(this.getActiveEvent().title, 'Attendance');
      const tag = `_${gameIdFilter.toUpperCase()}`;
      const filename = `${evtSlug}${tag}_${new Date().toISOString().slice(0, 10)}.csv`;
      return triggerBlobDownload(csv, filename, 'text/csv;charset=utf-8;');
    }

    exportJSON() {
      return this.exportBackupJSON();
    }

    exportBackupJSON() {
      this.syncActiveBranchToCatalog();
      this.ensureFullMasterRoster();

      const activeEvt = this.getActiveEvent() || {};
      const allStudents = Object.values(this.state.students || {});

      // 1. roster: full array of all ~588 registered students
      const roster = allStudents.map(s => {
        const rawCode = String(s.code || s.studentCode || s.id || '').trim();
        return {
          id: s.id || rawCode,
          code: rawCode,
          name: s.name || '',
          team: s.team || s.group || 'general'
        };
      });

      // 2. sessions: full eventConfig.sessions metadata
      const sessions = (this.games || []).map(g => ({
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

      // 3. groups: with EE in vibrant high-contrast orange
      const groups = (activeEvt.groups || DEFAULT_GROUPS).map(g => {
        const gid = String(g.id).toLowerCase();
        if (gid === 'ee') {
          return {
            id: 'ee',
            name: g.name || 'EE (Electrical Engineering)',
            shortCode: 'EE',
            color: 'orange',
            hex: '#f97316'
          };
        }
        return { ...g };
      });

      // 4. attendance: per-student breakdown with studentSummary and per-session dwell & status
      const attendance = {};
      allStudents.forEach(s => {
        const rawCode = String(s.code || s.studentCode || s.id || '').trim();
        if (!rawCode) return;

        let totalVerifiedSessions = 0;
        let totalDwellMinutes = 0;
        const sessionsMap = {};

        (this.games || []).forEach(g => {
          const gr = (s.games && s.games[g.id]) || {};
          const minReq = g.mode === 'check_in_only' ? 0 : (typeof g.minMinutesRequired === 'number' ? g.minMinutesRequired : 45);
          const ds = this.getSessionDwellStats(s, g.id, { minMinutesRequired: minReq });
          const dwellMins = Number(ds.dwellMinutes) || 0;
          totalDwellMinutes += dwellMins;

          let status = 'ABSENT';
          if (gr.status === 'INSIDE') {
            status = 'INSIDE';
          } else if (gr.visits > 0 || ds.hasScanned) {
            if (g.mode === 'check_in_only' || ds.creditStatus === 'VERIFIED') {
              status = 'VERIFIED';
            } else {
              status = 'UNDER_TIME';
            }
          }

          if (status === 'VERIFIED') {
            totalVerifiedSessions++;
          }

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

      // 5. scanLogs: COMPLETE array of all recorded scan events for active event (never truncated!)
      const scanLogsMap = new Map();
      (this.state.auditLog || []).forEach(l => {
        const id = l.eventId || l.id;
        if (!id) return;
        scanLogsMap.set(id, {
          eventId: id,
          code: l.studentCode || l.studentId || l.code,
          name: l.studentName || l.name,
          team: l.team,
          gameId: l.gameId,
          action: l.action || 'check_in',
          time: l.timestamp || l.occurredAt || l.time,
          by: l.performedBy || l.marshalId || l.by || 'Marshal',
          court: l.court || 'Main Venue',
          notes: l.notes || l.reason || null
        });
      });

      const scanLogs = Array.from(scanLogsMap.values()).sort(
        (a, b) => new Date(a.time || 0) - new Date(b.time || 0)
      );

      const payload = {
        format: 'engday_full_v3',
        version: 3,
        exportedAt: new Date().toISOString(),
        deviceId: this.deviceId || 'main-dashboard',
        activeEventId: this.activeEventId || 'engday_2026',
        eventConfig: {
          id: this.activeEventId || 'engday_2026',
          title: activeEvt.title || 'ENGINEERING DAYS 2026',
          subtitle: activeEvt.subtitle || '',
          venueName: activeEvt.venueName || 'Gymnasium / Oval & Engineering Labs',
          staffPin: activeEvt.staffPin || '2026',
          sessions,
          groups
        },
        roster,
        attendance,
        scanLogs
      };

      return JSON.stringify(payload);
    }

    async downloadJSON(customFilename = null) {
      const activeEvt = this.getActiveEvent() || {};
      const evtSlug = slugify(activeEvt.title || 'Engineering_Days_2026', 'Attendance');
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const filename = customFilename || `${evtSlug}_Backup_${now.toISOString().slice(0, 10)}_${timeStr}.json`;

      // 1. Try to fetch authoritative server-merged master backup if online
      if (this.config.syncEnabled && (typeof navigator === 'undefined' || navigator.onLine !== false)) {
        try {
          const backupUrl = this.resolveApiUrl(`/api/engday/attendance/backup?eventKey=${encodeURIComponent(this.activeEventId)}&format=json`);
          const res = await fetch(backupUrl);
          if (res.ok) {
            const data = await res.json();
            const jsonText = JSON.stringify(data, null, 2);
            this.hasUnsavedBackupChanges = false;
            this.scansSinceLastBackup = 0;
            this.lastBackupTime = new Date().toISOString();
            return triggerBlobDownload(jsonText, filename, 'application/json;charset=utf-8');
          }
        } catch (e) {
          console.warn('[EngDay Backup] Server backup fetch failed, falling back to local state:', e);
        }
      }

      // 2. Fallback to local state if offline or server unreachable
      const localJson = this.exportJSON();
      this.hasUnsavedBackupChanges = false;
      this.scansSinceLastBackup = 0;
      this.lastBackupTime = new Date().toISOString();
      return triggerBlobDownload(localJson, filename, 'application/json;charset=utf-8');
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

        let mergedScans = 0;
        let studentsUpdated = 0;
        const eventsToQueue = [];

        const isFullV3 = parsed.format === 'engday_full_v3' || parsed.version === 3 || Boolean(parsed.roster);
        const isCompact = parsed.format === 'engday_compact_v2' || isFullV3 || Boolean(parsed.eventConfig || parsed.attendance || parsed.scanLogs);

        if (isCompact) {
          // --- FULL V3 & COMPACT V2 FORMAT RESTORE ---
          if (parsed.eventConfig && typeof parsed.eventConfig === 'object') {
            const cfg = parsed.eventConfig;
            const targetEvtId = parsed.activeEventId || cfg.id || this.activeEventId;
            const restoredSessions = (cfg.sessions || []).map((s, i) => decorateSessionStyle(s, i));
            const restoredGroups = (cfg.groups || []).map(g => {
              const gid = String(g.id).toLowerCase();
              if (gid === 'ee' && (g.color === 'zinc' || g.hex === '#27272a' || g.color === 'amber')) {
                return { ...g, color: 'orange', hex: '#f97316' };
              }
              return { ...g };
            });

            if (!this.state.eventsCatalog[targetEvtId]) {
              this.state.eventsCatalog[targetEvtId] = {
                id: targetEvtId,
                title: cfg.title || 'ENGINEERING DAYS 2026',
                subtitle: cfg.subtitle || '',
                venueName: cfg.venueName || 'Gymnasium / Oval & Engineering Labs',
                staffPin: cfg.staffPin || '2026',
                sessions: restoredSessions.length > 0 ? restoredSessions : this.games,
                groups: restoredGroups.length > 0 ? restoredGroups : DEFAULT_GROUPS.map(g => ({ ...g }))
              };
            } else {
              const curEvt = this.state.eventsCatalog[targetEvtId];
              if (cfg.title) curEvt.title = cfg.title;
              if (cfg.venueName) curEvt.venueName = cfg.venueName;
              if (cfg.staffPin) curEvt.staffPin = cfg.staffPin;
              if (restoredSessions.length > 0) curEvt.sessions = restoredSessions;
              if (restoredGroups.length > 0) curEvt.groups = restoredGroups;
            }

            if (targetEvtId && this.state.eventsCatalog[targetEvtId]) {
              this.activeEventId = targetEvtId;
              this.state.activeEventId = targetEvtId;
              if (this.state.eventsCatalog[targetEvtId].sessions && this.state.eventsCatalog[targetEvtId].sessions.length > 0) {
                this.games = this.state.eventsCatalog[targetEvtId].sessions;
              }
            }
            this.ensureEventsCatalogStructure();
          }

          // Restore full roster if present in engday_full_v3
          if (Array.isArray(parsed.roster)) {
            parsed.roster.forEach(r => {
              if (!r) return;
              const rawCode = String(r.code || r.id || '').trim();
              const codeUpper = rawCode.toUpperCase();
              if (!codeUpper) return;

              let student = this.getStudentByCode(codeUpper) || this.getStudentById(codeUpper);
              if (!student) {
                const teamNorm = String(r.team || 'general').trim().toLowerCase();
                const teamName = r.teamName || ('TEAM ' + teamNorm.toUpperCase());
                student = {
                  id: r.id || codeUpper,
                  code: rawCode,
                  studentCode: rawCode,
                  name: r.name || rawCode,
                  team: teamNorm,
                  teamName: teamName,
                  status: 'OUTSIDE',
                  games: this.createEmptyGamesRecord()
                };
                this.state.students[codeUpper] = student;
                studentsUpdated++;
              } else {
                if (r.name && (!student.name || student.name === student.code)) student.name = r.name;
                if (r.team && (!student.team || student.team === 'general')) student.team = String(r.team).toLowerCase();
                studentsUpdated++;
              }
            });
          }

          // Restore custom students if present (engday_compact_v2)
          if (Array.isArray(parsed.customStudents)) {
            parsed.customStudents.forEach(cs => {
              if (!cs) return;
              const rawCode = String(cs.code || cs.studentCode || cs.id || '').trim();
              const codeUpper = rawCode.toUpperCase();
              if (!codeUpper) return;

              let existing = this.getStudentByCode(codeUpper) || this.getStudentById(codeUpper);
              if (!existing) {
                const teamNorm = String(cs.team || 'general').trim().toLowerCase();
                const teamName = cs.teamName || ('TEAM ' + teamNorm.toUpperCase());
                this.state.students[codeUpper] = {
                  id: cs.id || codeUpper,
                  code: rawCode,
                  studentCode: rawCode,
                  name: cs.name || rawCode,
                  team: teamNorm,
                  teamName: teamName,
                  status: 'OUTSIDE',
                  games: this.createEmptyGamesRecord()
                };
                studentsUpdated++;
              }
            });
          }

          // Restore active attendance per student
          if (parsed.attendance && typeof parsed.attendance === 'object') {
            Object.entries(parsed.attendance).forEach(([studentKey, itemMap]) => {
              if (!itemMap || typeof itemMap !== 'object') return;
              let student = this.getStudentByCode(studentKey) || this.getStudentById(studentKey);
              if (!student) {
                const sum = itemMap.studentSummary || {};
                const teamNorm = String(sum.team || 'general').trim().toLowerCase();
                student = {
                  id: studentKey,
                  code: studentKey,
                  studentCode: studentKey,
                  name: sum.name || studentKey,
                  team: teamNorm,
                  teamName: 'TEAM ' + teamNorm.toUpperCase(),
                  status: 'OUTSIDE',
                  games: this.createEmptyGamesRecord()
                };
                this.state.students[studentKey] = student;
              }

              if (!student.games) student.games = this.createEmptyGamesRecord();
              studentsUpdated++;

              Object.entries(itemMap).forEach(([gId, inGame]) => {
                if (!inGame || typeof inGame !== 'object' || gId === 'studentSummary') return;
                const curGame = student.games[gId] || { gameId: gId, status: 'OUTSIDE', visits: 0, history: [] };
                student.games[gId] = curGame;

                const incomingHasScans = (inGame.visits > (curGame.visits || 0)) ||
                  (inGame.status === 'INSIDE' && curGame.status !== 'INSIDE') ||
                  (inGame.checkInTime && !curGame.checkInTime);

                if (incomingHasScans) {
                  student.games[gId] = {
                    ...curGame,
                    ...inGame,
                    gameId: gId
                  };
                  mergedScans++;
                }

                if (Array.isArray(inGame.history)) {
                  inGame.history.forEach(h => {
                    if (h && h.eventId) {
                      eventsToQueue.push({
                        eventId: h.eventId,
                        eventKey: this.activeEventId,
                        gameId: gId,
                        studentId: student.id,
                        studentCode: student.studentCode,
                        studentName: student.name,
                        team: student.team,
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
            });
          }

          // Restore scanLogs / auditLog
          if (Array.isArray(parsed.scanLogs)) {
            const existingIds = new Set((this.state.auditLog || []).map(a => a.eventId || a.id));
            parsed.scanLogs.forEach(l => {
              const key = l.eventId || l.id;
              if (key && !existingIds.has(key)) {
                existingIds.add(key);
                if (!this.state.auditLog) this.state.auditLog = [];
                const logEntry = {
                  id: key,
                  eventId: key,
                  studentCode: l.code,
                  studentId: l.code,
                  studentName: l.name,
                  team: l.team,
                  gameId: l.gameId,
                  action: l.action || 'check_in',
                  timestamp: l.time,
                  occurredAt: l.time,
                  performedBy: l.by || 'Marshal',
                  court: l.court || 'Main Venue',
                  notes: l.notes || null,
                  displayTime: l.time ? formatManilaTime(l.time) : '--:--'
                };
                this.state.auditLog.push(logEntry);

                // Reflect check-in on student game record if missing
                const student = this.getStudentByCode(l.code) || this.getStudentById(l.code);
                if (student && student.games && student.games[l.gameId]) {
                  const gRec = student.games[l.gameId];
                  if (!gRec.checkInTime && l.action === 'check_in') {
                    gRec.checkInTime = l.time;
                    gRec.displayCheckIn = logEntry.displayTime;
                    gRec.status = 'INSIDE';
                    gRec.visits = Math.max(gRec.visits || 0, 1);
                    mergedScans++;
                  }
                }

                eventsToQueue.push({
                  eventId: key,
                  eventKey: this.activeEventId,
                  gameId: l.gameId,
                  studentId: l.code,
                  studentCode: l.code,
                  studentName: l.name,
                  team: l.team,
                  action: l.action || 'check_in',
                  occurredAt: l.time || new Date().toISOString(),
                  marshalId: l.by || 'Marshal',
                  court: l.court || 'Main Venue',
                  reason: l.notes || null
                });
              }
            });
          }

        } else {
          // --- LEGACY FORMAT RESTORE ---
          if (parsed.state && parsed.state.eventsCatalog && typeof parsed.state.eventsCatalog === 'object') {
            Object.entries(parsed.state.eventsCatalog).forEach(([evtId, evtObj]) => {
              if (!this.state.eventsCatalog[evtId]) {
                this.state.eventsCatalog[evtId] = evtObj;
              } else {
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

          if (incomingStudents && typeof incomingStudents === 'object') {
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
          }

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
        }

        // Finalize state
        this.ensureFullMasterRoster(this.state.students);
        this.reconcileStudentGamesStructure();
        this.reconcileGroupsFromStudents();
        this.save();

        // Enqueue restored scan events into pending_sync and push to server
        (async () => {
          try {
            if (eventsToQueue.length > 0) {
              await Promise.all(eventsToQueue.map(ev => this.db.enqueuePending(ev)));
              this.updatePendingCount();
            }
            await this.syncConfigWithServer();
            await this.syncWithServer(true);
          } catch (e) {
            console.warn('[EngDay] Background sync after restore failed:', e);
          }
        })();

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
      }, this.config.syncIntervalMs || 1200000);

      if (typeof navigator === 'undefined' || navigator.onLine !== false) {
        setTimeout(() => this.syncWithServer(), 600);
      }
      this.initSseStream();
    }

    initSseStream() {
      if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

      if (this.sseSource) {
        try { this.sseSource.close(); } catch(e) {}
        this.sseSource = null;
      }

      try {
        const streamUrl = this.resolveApiUrl('/api/engday/attendance/stream');
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
          // Bandwidth-Saver: Do NOT trigger syncWithServer() on SSE error.
          // On serverless environments like Vercel, SSE drops periodically,
          // so polling on error causes a continuous high-volume loop.
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

      // Check if server performed an intentional administrative HARD RESET to zero
      const serverHardResetTime = serverState.lastHardResetTimestamp ? new Date(serverState.lastHardResetTimestamp).getTime() : 0;
      const localHardResetTime = this.state.lastHardResetTimestamp ? new Date(this.state.lastHardResetTimestamp).getTime() : 0;
      const isNewServerHardReset = (serverHardResetTime > 0 && serverHardResetTime > localHardResetTime) ||
        ((serverState.hardResetSequence || 0) > (this.state.hardResetSequence || 0));

      if (isNewServerHardReset) {
        console.info(`[EngDay Hard Reset] Server broadcasted HARD RESET from ${serverState.lastHardResetTimestamp}. Wiping local cache to 0...`);
        await this.db.clearAll();
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.removeItem('ENGDAY_EVENTS_FALLBACK_V1');
            localStorage.removeItem('ENGDAY_QUEUE_FALLBACK_V1');
            localStorage.removeItem('ENGDAY_SNAPSHOT_FALLBACK_V1');
          } catch (e) {}
        }
        this.state.auditLog = [];
        this.state.scanLogs = [];
        this.state.attendance = {};

        if (incomingStudents && typeof incomingStudents === 'object') {
          const resetStudents = {};
          Object.entries(incomingStudents).forEach(([sId, sObj]) => {
            resetStudents[sId] = {
              ...sObj,
              games: this.createEmptyGamesRecord()
            };
          });
          this.state.students = resetStudents;
          if (this.state.eventsCatalog[this.activeEventId]) {
            this.state.eventsCatalog[this.activeEventId].students = resetStudents;
          }
        } else {
          Object.values(this.state.students || {}).forEach(s => {
            if (s) s.games = this.createEmptyGamesRecord();
          });
        }

        this.ensureFullMasterRoster(this.state.students);
        this.reconcileStudentGamesStructure();
        this.reconcileGroupsFromStudents();

        this.state.lastHardResetTimestamp = serverState.lastHardResetTimestamp;
        this.state.hardResetSequence = serverState.hardResetSequence || 1;
        this.state.lastResetTimestamp = serverState.lastHardResetTimestamp;
        this.state.resetSequence = serverState.hardResetSequence || 1;
        this.state.version = Math.max(this.state.version || 1, serverVer);
        this.lastSyncedServerVersion = this.state.version;
        this.state.lastUpdated = serverState.lastUpdated || new Date().toISOString();
        this.serverOnline = true;
        this.lastSyncTime = formatManilaTime(new Date());

        this.save({ preserveVersion: true });
        await this.updatePendingCount();
        this.notify();
        return;
      }

      // Check if server performed an intentional administrative attendance reset to zero
      const serverResetTime = serverState.lastResetTimestamp ? new Date(serverState.lastResetTimestamp).getTime() : 0;
      const localResetTime = this.state.lastResetTimestamp ? new Date(this.state.lastResetTimestamp).getTime() : 0;
      const isNewServerReset = (serverResetTime > 0 && serverResetTime > localResetTime) ||
        ((serverState.resetSequence || 0) > (this.state.resetSequence || 0));

      if (isNewServerReset) {
        console.info(`[EngDay Reset] Server broadcasted zero-reset from ${serverState.lastResetTimestamp}. Wiping local attendance to 0...`);
        await this.db.clearEventsForEventKey(this.activeEventId);
        this.state.auditLog = [];
        this.state.scanLogs = [];
        this.state.attendance = {};

        // Directly adopt clean reset student records
        if (incomingStudents && typeof incomingStudents === 'object') {
          const resetStudents = {};
          Object.entries(incomingStudents).forEach(([sId, sObj]) => {
            resetStudents[sId] = {
              ...sObj,
              games: this.createEmptyGamesRecord()
            };
          });
          this.state.students = resetStudents;
          if (this.state.eventsCatalog[this.activeEventId]) {
            this.state.eventsCatalog[this.activeEventId].students = resetStudents;
          }
        } else {
          Object.values(this.state.students || {}).forEach(s => {
            if (s) s.games = this.createEmptyGamesRecord();
          });
        }

        this.ensureFullMasterRoster(this.state.students);
        this.reconcileStudentGamesStructure();
        this.reconcileGroupsFromStudents();

        this.state.lastResetTimestamp = serverState.lastResetTimestamp;
        this.state.resetSequence = serverState.resetSequence || 0;
        this.state.version = Math.max(this.state.version || 1, serverVer);
        this.lastSyncedServerVersion = this.state.version;
        this.state.lastUpdated = serverState.lastUpdated || new Date().toISOString();
        this.serverOnline = true;
        this.lastSyncTime = formatManilaTime(new Date());

        this.save({ preserveVersion: true });
        await this.updatePendingCount();
        this.notify();
        return;
      }

      // Check if server broadcasted a pre-4AM or time-based attendance purge
      const serverPurgeTime = serverState.lastPurgeTimestamp ? new Date(serverState.lastPurgeTimestamp).getTime() : 0;
      const localPurgeTime = this.state.lastPurgeTimestamp ? new Date(this.state.lastPurgeTimestamp).getTime() : 0;
      if (serverPurgeTime > 0 && serverPurgeTime > localPurgeTime) {
        console.info(`[EngDay Purge] Server broadcasted attendance purge before ${serverState.lastPurgeTimestamp}. Purging locally...`);
        await this.purgeAttendanceBefore(serverState.lastPurgeTimestamp);
        return;
      }

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

      // Automatically force-merge any seed students missing from state so all 6 departments are present
      this.forceMergeSeedStudents();

      // Re-apply any local events (including IndexedDB events and pending outbox) so nothing is lost
      this.ensureFullMasterRoster();
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
            const { deduplicated } = this.deduplicatePendingQueue(localEvents);
            const syncUrl = this.resolveApiUrl('/api/engday/attendance/sync');
            const healRes = await fetch(syncUrl, {
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
        } catch (healErr) {
          console.warn('[EngDay Self-Heal] Failed to heal server:', healErr);
        } finally {
          this._isSelfHealing = false;
        }
      }
    }

    async syncConfigWithServer() {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
      this.syncActiveBranchToCatalog();
      try {
        const configUrl = this.resolveApiUrl('/api/engday/attendance/config');
        const res = await fetch(configUrl, {
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

    async syncWithServer(options = false) {
      if (this.isSyncing) return;
      this.isSyncing = true;
      this.notify();

      const isManual = options === true || (typeof options === 'object' && options.isManual === true);
      const pushOnly = typeof options === 'object' && options.pushOnly === true;

      try {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
          this.serverOnline = false;
          return;
        }

        const rawQueue = await this.db.getPendingQueue();
        const { deduplicated: initialQueue, duplicateIds } = this.deduplicatePendingQueue(rawQueue);
        if (duplicateIds.length > 0) {
          await this.db.markEventsSynced(duplicateIds);
        }

        // Discard any local queue items that occurred before a hard reset
        const hardResetCutoff = this.state.lastHardResetTimestamp ? new Date(this.state.lastHardResetTimestamp).getTime() : 0;
        let queue = initialQueue;
        if (hardResetCutoff > 0) {
          const droppedIds = [];
          queue = initialQueue.filter(ev => {
            const evTime = new Date(ev.occurredAt || ev.time || 0).getTime();
            if (evTime <= hardResetCutoff) {
              droppedIds.push(ev.eventId);
              return false;
            }
            return true;
          });
          if (droppedIds.length > 0) {
            await this.db.markEventsSynced(droppedIds);
          }
        }

        const syncUrl = this.resolveApiUrl('/api/engday/attendance/sync');
        const stateUrl = this.resolveApiUrl(`/api/engday/attendance/state?eventKey=${encodeURIComponent(this.activeEventId)}`);

        // 1. Flush local outbox queue to server
        if (queue.length > 0) {
          const res = await fetch(syncUrl, {
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

        // Multi-Device Safe Bandwidth Saver:
        // When pushing immediate scan records, return early to avoid full-state downloading bandwidth.
        // Full-state fetching remains throttled to 20 minutes (or manual refresh).
        if (pushOnly) {
          return;
        }

        // 2. Fetch latest server state & reconcile safely (with ETag bandwidth-saver support)
        const fetchHeaders = { 'Accept': 'application/json' };
        if (this.lastStateEtag && !isManual) {
          fetchHeaders['If-None-Match'] = this.lastStateEtag;
        }
        const stateRes = await fetch(stateUrl, {
          headers: fetchHeaders
        });

        if (stateRes.status === 304) {
          // 304 Not Modified: Data is unchanged on server, 0 body bytes consumed
          this.serverOnline = true;
          this.lastSyncTime = formatManilaTime(new Date());
        } else if (stateRes.ok) {
          const etag = stateRes.headers.get('ETag');
          if (etag) this.lastStateEtag = etag;
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
  root.ensureFullMasterRoster = ensureFullMasterRoster;
  root.EDAYS_2026_ADDITIONAL_ROSTER = EDAYS_2026_ADDITIONAL_ROSTER;
  root.EDAYS_2026_ME_ROSTER = EDAYS_2026_ME_ROSTER;
  root.formatManilaTime = formatManilaTime;
  root.formatManilaDate = formatManilaDate;
  root.getToday4AMCutoff = getToday4AMCutoff;
  root.isTimestampBeforeToday4AM = isTimestampBeforeToday4AM;

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
      formatManilaDate,
      getToday4AMCutoff,
      isTimestampBeforeToday4AM
    };
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
