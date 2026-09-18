# MEODL Esports — Tekken 8 Tournament System

Production-ready, dark-mode interactive web application and tournament management engine for a **16-player Double Elimination Tekken 8 Championship** (15 active competitors + 1 Seed #1 BYE), styled after the modern esports analytics aesthetic of `ewgf.gg`.

---

## Key Features

- **Double Elimination Bracket Engine:**
  - Complete Winners Bracket (R1, Quarterfinals, Semifinals, Winners Finals).
  - Complete Losers Bracket (LR1 through LR6 Losers Finals).
  - Automatic Seed 1 BYE routing (`Paduga, Earl Justin` auto-advances to `W9`).
  - Grand Finals with automatic **Bracket Reset** detection if the Losers Champion wins Set 1.
  - Interactive SVG dynamic connector lines between matches with live canvas zooming.

- **Tournament Operations Control Room:**
  - Dedicated esports broadcast operator panel.
  - Large live digital scoreboards with quick-click point adjustment and 1-click winner advancement.
  - On-Deck Queue showing next playable sets topologically.
  - Bracket routing preview explaining next match destinations.

- **Schedule & Venue Cutoff System:**
  - **Room Closes at 5:00 PM** hard venue cutoff prominently displayed across the app.
  - Rolling target call schedule starting at **12:00 PM** (All Matches BO3 = 8 mins).
  - Matches can start early whenever previous sets finish early.
  - Live pace tracking (`ON SCHEDULE`, `AHEAD`, `BEHIND`, `CRITICAL`, `ROOM CUTOFF`).
  - Dynamic estimated finish time calculation with venue safety buffer.

- **Stage / Presentation Mode (<kbd>P</kbd>):**
  - Distraction-free full-screen display for venue projectors and stream overlays.
  - Clean floating schedule status overlay.

- **Live Standings & Statistics:**
  - Real-time tournament leaderboard (1st to 16th place) dynamically updated.
  - Match history and character pick distribution.

- **Data Persistence & Portability:**
  - Automatic `localStorage` persistence.
  - Full JSON state export and import.
  - Clipboard export for standings.
  - Web Audio API electric sound effects.

---

## Schedule Target Call Times

| Time | Match | Round | Format | Planned Duration |
| :--- | :--- | :--- | :--- | :--- |
| **12:00 PM** | `W1` | Winners R1 | BO3 | 0m (Auto-Advance BYE) |
| **12:00 PM** | `W2` | Winners R1 | BO3 | 8 mins |
| **12:08 PM** | `W3` | Winners R1 | BO3 | 8 mins |
| **12:16 PM** | `W4` | Winners R1 | BO3 | 8 mins |
| **12:24 PM** | `W5` | Winners R1 | BO3 | 8 mins |
| **12:32 PM** | `W6` | Winners R1 | BO3 | 8 mins |
| **12:40 PM** | `W7` | Winners R1 | BO3 | 8 mins |
| **12:48 PM** | `W8` | Winners R1 | BO3 | 8 mins |
| **12:56 PM** | `L2` | Losers R1 | BO3 | 8 mins |
| **1:04 PM** | `L3` | Losers R1 | BO3 | 8 mins |
| **1:12 PM** | `L4` | Losers R1 | BO3 | 8 mins |
| **1:20 PM** | `W9` | Quarterfinals | BO3 | 8 mins |
| **1:28 PM** | `W10` | Quarterfinals | BO3 | 8 mins |
| **1:36 PM** | `W11` | Quarterfinals | BO3 | 8 mins |
| **1:44 PM** | `W12` | Quarterfinals | BO3 | 8 mins |
| **1:52 PM** | `L5` | Losers R2 | BO3 | 8 mins |
| **2:00 PM** | `L6` | Losers R2 | BO3 | 8 mins |
| **2:08 PM** | `L7` | Losers R2 | BO3 | 8 mins |
| **2:16 PM** | `L8` | Losers R2 | BO3 | 8 mins |
| **2:24 PM** | `L9` | Losers R3 | BO3 | 8 mins |
| **2:32 PM** | `L10` | Losers R3 | BO3 | 8 mins |
| **2:40 PM** | `W13` | Semifinals | BO3 | 8 mins |
| **2:48 PM** | `W14` | Semifinals | BO3 | 8 mins |
| **2:56 PM** | `L11` | Losers Quarters | BO3 | 8 mins |
| **3:04 PM** | `L12` | Losers Quarters | BO3 | 8 mins |
| **3:12 PM** | `L13` | Losers Semis | BO3 | 8 mins |
| **3:20 PM** | `W15` | Winners Finals | BO3 | 8 mins |
| **3:28 PM** | `L14` | Losers Finals | BO3 | 8 mins |
| **3:36 PM** | `GF Setup` | Grand Finals Stage | -- | 4 mins |
| **3:40 PM** | `GF1` | Grand Finals | BO3 | 8 mins |
| **3:48 PM** | `GF2` | Grand Finals Reset | BO3 | 8 mins (If Needed) |

**Room Closes:** `5:00 PM` (Hard Cutoff)

---

## Quick Start

### 1. Run with Node.js
```bash
npm start
```
Then navigate to:
**http://localhost:3333**

### 2. Run Standalone (Offline)
Simply open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Brave, Firefox).

---

## Keyboard Shortcuts

- <kbd>N</kbd> — Open Next Ready Match on deck
- <kbd>P</kbd> — Toggle Stage / Presentation Mode
- <kbd>F</kbd> — Toggle Fullscreen
- <kbd>/</kbd> — Jump directly to Match Search
- <kbd>Esc</kbd> — Dismiss open dialogs / modals

---

## License
MIT License. Created for MEODL Esports & Mechanical Engineering Society (UPHSD DALTA).
