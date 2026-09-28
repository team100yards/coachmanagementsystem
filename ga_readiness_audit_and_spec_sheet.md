# Coach Management System (CMS) — GA Readiness Audit & Agentic Spec Sheet
**Author:** Google PM, Google Principal Designer & Google Frontend Architect  
**Target Release:** General Availability (GA)  
**Repository Branch Strategy:** Isolated `ga-readiness` / Worktree Protocol (Zero merge to `main` until coach UAT)

---

## 1. Executive Summary & Vision

The Coach Management System (CMS) represents a comprehensive tactical football intelligence suite combining squad management, session planning, video telestration, player tracking, match reporting, and tactical formation design. 

To achieve **Google-Grade General Availability (GA)**, the product must transition from a collection of powerful individual tools into a seamless, unified, resilient **Football Operating System**. This audit establishes the usability, customer experience (CX), user experience (UX), user interface (UI), and architectural gaps that must be closed before GA.

```mermaid
graph TD
    A[index.html: Squad & Club Core] <--> B[session-planner.html: Training Studio]
    A <--> C[match-report.html: Match Ops & AI Reports]
    A <--> D[video-analyzer.html: Telestration Suite]
    D <--> E[player-tracker-lab.html: Vision & Tracking]
    D <--> F[video-clipper.html: Match Clipper]
    A <--> G[formation-builder.html: Tactical Visualizer]
    A <--> H[notes.html: Pitchside Mobile Notes]
    
    subgraph Shared Core Infrastructure [GA Unified Layer]
        NAV[Universal Suite Header & Tool Switcher]
        TOKENS[Material-Elite Sports Design Token System]
        DATA[CMS Unified Data Bus: BroadcastChannel + IndexedDB]
        OFFLINE[Offline First Cache & Pitchside Sync Engine]
    end
    
    Shared Core Infrastructure -.-> A
    Shared Core Infrastructure -.-> B
    Shared Core Infrastructure -.-> C
    Shared Core Infrastructure -.-> D
    Shared Core Infrastructure -.-> E
    Shared Core Infrastructure -.-> F
    Shared Core Infrastructure -.-> G
    Shared Core Infrastructure -.-> H
```

---

## 2. Comprehensive Gap Analysis: Usability, CX, UX & UI

### 2.1 Customer Experience (CX) & Product Journey Gaps (Google PM Lens)

| Area | Current Gap / Friction | Severity | GA Requirement |
| :--- | :--- | :--- | :--- |
| **Cross-Tool Navigation** | Divergent topbars across tools. `match-report.html`, `player-tracker-lab.html`, `video-analyzer.html`, and `session-planner.html` have differing heights, back-links, and missing peer links. | **P0 (Blocker)** | **Universal Suite Header Component**: Standard 56px glassmorphism topbar with 1-click access to all 7 tools, active state pill, club identity, and quick-switch modal (`Cmd/Ctrl+K`). |
| **Data Interoperability** | Siloed data. Squad rosters in `index.html` do not populate seamlessly into `formation-builder.html` or `match-report.html`. Tactical drawings cannot be attached directly to match events or session drills. | **P0 (Blocker)** | **CMS Cross-Tool Bus**: Shared IndexedDB schema (`CMS_Store`) & `BroadcastChannel('CMS_SYNC')` allowing 1-click "Send Lineup to Match Report", "Send Clip to Session Drill", "Open in Video Analyzer". |
| **Pitch-Side Reliability** | Weak cellular/Wi-Fi on training grounds or stadium benches leads to Firebase timeouts, banner errors, or failed saves. | **P0 (Blocker)** | **Offline-First Resilience**: Optimistic local storage with IndexedDB, background queue for Firestore sync, and visual Sync Status Indicator (Cloud Synced / Queued Offline). |
| **First-Run Onboarding** | Blank canvases or empty data tables present a "cold start" hurdle for new coaches. | **P1 (High)** | **Curated Demo Profiles & Presets**: Pre-populated Premier League / Academy tactical drill presets, sample match reports, and sample tracking footage ready out-of-the-box. |
| **Export Unification** | Video exports MP4 in analyzer, match report exports print PDF, tracker exports JSON/PNG, session planner exports PDF — no uniform branded export tray. | **P1 (High)** | **Unified Club Branding Engine**: Shared watermark, club logo, sponsor crest, and typography across all video, PDF, and PNG outputs. |

---

### 2.2 User Experience (UX) & Ergonomics Gaps (Google Designer Lens)

| UX Dimension | Current Friction | GA Specification |
| :--- | :--- | :--- |
| **Touch & Tablet Targets** | Multiple toolbar buttons are 28x28px or 32x32px. Sideline usage on iPad leads to mis-taps. | Enforce minimum **44x44px touch bounding boxes** with 8px clearance. Add haptic/visual scale feedback (`:active` transform). |
| **Outdoor Sun Glare** | Pitch boards with dark backgrounds suffer from severe glare under midday sun. | Add **High-Contrast Pitch Mode Toggle** (`Sunlight Turf` vs `Midnight Tactical`) with high-contrast lines and bright player bibs. |
| **Canvas Gestures** | Single-finger canvas drawing conflicts with page panning/scrolling on mobile/tablets. | Implement **Two-Finger Pan & Pinch-to-Zoom** on tactical canvases with dedicated `Lock/Draw/Navigate` modes. |
| **Undo / Redo Visibility** | Undo/redo relies largely on desktop hotkeys (`Ctrl+Z`, `Ctrl+Y`), invisible to touch users. | Floating, persistent **Undo/Redo HUD widget** with step count indicator on all drawing stages. |
| **Cognitive Load & Clutter** | Overlapping modal windows (Export, Watermark, Color Pickers) obscure video playback. | Dockable glass drawers, tabbed inspection sidebars, and non-blocking floating inspectors. |

---

### 2.3 User Interface (UI) & Visual Cohesion Gaps (Design System Lens)

| UI Element | Inconsistency Across Files | Unified GA Design System Token |
| :--- | :--- | :--- |
| **Backgrounds** | `style.css` uses `#070a0f`; `video-analyzer` uses `#080c14`; `match-report` uses `#0f1724`. | **Canonical Slate Scale**: Base `#060911`, Surface `#0c121e`, Card `#131b2c`, Elevated `#1a253c`. |
| **Accents** | Forest green `#1a5c1a` in core app vs Neon pitch green `#00e676` in video tools. | **Precision Neon Green** `#00e676` (Primary Action), **Tactical Cyan** `#00f0ff` (Vision/Tracking), **Alert Rose** `#ff3b5c`. |
| **Typography** | Mix of DM Sans, Inter, Bebas Neue, Outfit, JetBrains Mono. | **Hierarchy**: Display = `Bebas Neue` (Caps/Numbers), UI Body = `Inter` / `DM Sans`, Tactical Data = `JetBrains Mono`. |
| **Border Radii** | Varies between 6px, 10px, 14px, 18px, and 24px without standard tokens. | Standardized: `radius-xs: 4px`, `radius-sm: 8px`, `radius-md: 12px`, `radius-lg: 16px`, `radius-full: 9999px`. |
| **Modals & Overlays** | Differing backdrops, close buttons, shadow elevations. | Unified Glassmorphic Modal with `backdrop-filter: blur(20px)`, subtle 1px border `rgba(255,255,255,0.12)`, animated spring entry. |

---

### 2.4 Frontend Architecture & Engineering Gaps (Google Architect Lens)

| Architecture Area | Current Risk | GA Architectural Solution |
| :--- | :--- | :--- |
| **Monolithic Scripts** | `app.js` (336KB), `session-planner.js` (154KB), `video-analyzer.html` (683KB, 16.8k lines). | Modularize into clean shared utility modules (`cms-core.js`, `cms-bus.js`, `cms-nav.js`, `cms-storage.js`) via ES modules or clean global namespaces. |
| **Storage Quota (5MB)** | Serializing video frames, tracking keyframes, and sessions into `localStorage` triggers `QuotaExceededError`. | Migrate bulky data (video clips, keyframe tracks, full sessions) to **IndexedDB (`idb-keyval` or native Dexie-lite pattern)**. Reserve `localStorage` strictly for small UI prefs. |
| **WebCodecs & Canvas Leaks** | Video scrubbing and canvas telestration re-renders without explicit memory disposal cause browser tab crashes during long sessions. | Implement explicit disposal lifecycle: `videoFrame.close()`, `fabricCanvas.dispose()`, `cancelAnimationFrame()`, and garbage-collection triggers. |
| **Sync Race Conditions** | Multi-tab editing of players/tactics can overwrite changes. | Implement optimistic concurrency with last-modified timestamps (`updatedAt`) and `BroadcastChannel` live updates. |

---

## 3. Git Branch & Worktree Protocol (Safety & UAT Isolation)

To guarantee that production remains completely untouched until user acceptance testing (UAT) is fully approved by you:

```
[origin/main] ───────(Protected Production Baseline)───────────────
      │
      └───> [ga-readiness] (Dedicated Worktree / Feature Branch)
               ├── 1. Shared Design Tokens & Universal Nav
               ├── 2. Data Interoperability & IndexedDB Bus
               ├── 3. Touch/Ergonomics & Offline Resilience
               └── 4. Performance & Memory Hardening
                       │
                       └──> [Agentic Verification & Coach UAT]
                               │
                               └──> [Merge to main ONLY upon Coach Sign-off]
```

### Protocol Rules:
1. **Branch Isolation**: All implementation takes place exclusively on branch `ga-readiness` (or a dedicated worktree).
2. **Zero Auto-Merge**: No pull requests, automated merges, or force-pushes to `main`.
3. **Local Staging**: The app is served and tested locally on `ga-readiness` via local HTTP server / Firebase emulators.
4. **Sign-off Gate**: Only when you perform UAT across mobile, tablet, and desktop and issue the final approval command will a merge to `main` be executed.

---

## 4. Phase-by-Phase Agentic Implementation Spec Sheet

### Phase 1: Universal Navigation & Design System Shell (Foundation)
- **Goal**: Deliver 100% visual consistency and effortless cross-tool navigation across all 8 sub-tools.
- **Components to Implement**:
  1. `cms-nav.js` / `cms-nav.css`:
     - Standardized 56px topbar injected across `index.html`, `session-planner.html`, `video-analyzer.html`, `video-clipper.html`, `player-tracker-lab.html`, `match-report.html`, `formation-builder.html`, `notes.html`.
     - Active tool indicator, Club crest/name display, Return to Squad button, Quick-Switch Command Palette (`Ctrl/Cmd + K`).
  2. `cms-tokens.css`:
     - Harmonized CSS custom properties for surfaces, borders, neon green/cyan/rose accents, typography, and elevation.
  3. Touch Target Hardening:
     - Ensure every button, input, and icon meets the 44x44px minimum target threshold.

### Phase 2: Data Interoperability & CMS Bus (The Unified Workflow)
- **Goal**: Eradicate data silos so coaches never have to re-enter data.
- **Components to Implement**:
  1. `cms-bus.js`:
     - Cross-window communication using `BroadcastChannel('CMS_BUS')`.
     - Standard event payload formats:
       - `PLAYER_ROSTER_SYNC`: Push squad players to Formation Builder and Match Report.
       - `TACTICAL_SESSION_EXPORT`: Push session drills to Match Day briefing.
       - `VIDEO_CLIP_HANDOFF`: Send clipped events from Clipper/Analyzer to Match Report timeline.
  2. `cms-storage.js`:
     - IndexedDB wrapper (`CMS_DB`) for large assets (video clips, tracking keyframes, formation templates) with transparent fallback to `localStorage`.
     - LRU eviction policy to protect disk quotas.

### Phase 3: Pitch-Side Resilience & Ergonomics (Field Readiness)
- **Goal**: Make the system foolproof when standing on the grass in rain, sun, or poor connectivity.
- **Components to Implement**:
  1. Offline State Machine:
     - Transparent offline queue for squad edits, session notes, and match report ratings.
     - Live Topbar Connection Pill: 🟢 `Live Sync` / 🟡 `Saved Locally (Offline)` / 🔴 `Network Error`.
  2. Pitch High-Contrast Mode:
     - 1-click toggle for tactical pitch canvases switching between broadcast dark grass and crisp, ultra-high-contrast sunlight pitch.
  3. Canvas Gesture Engine:
     - Multi-touch palm rejection, two-finger pan/zoom, and floating Undo/Redo HUD widget on tactical boards.

### Phase 4: Performance, Memory Hardening & Polish
- **Goal**: 60 FPS performance, zero memory leaks, and broadcast-quality exports.
- **Components to Implement**:
  1. Canvas & WebCodecs Lifecycle Manager:
     - Explicit teardown of WebCodecs frames and Fabric canvas instances.
     - Non-blocking export worker with progress bar and time-to-completion telemetry.
  2. Empty States & First-Run Experience:
     - Professional empty states with 1-click "Load Sample Match", "Load Tactical Template".
  3. Cross-Browser & Mobile QA Audit:
     - Verify layout on 1080p, 4K, 11" iPad Pro, and mobile screens.

---

## 5. Verification Checklist & Acceptance Criteria for GA

- [ ] **Cross-Tool Navigation**: Switching between any of the 8 tools requires exactly 1 click and maintains club context.
- [ ] **Data Cohesion**: Creating or editing a player in `index.html` instantly updates `formation-builder.html` and `match-report.html` without manual reload.
- [ ] **Touch Usability**: All buttons on iPad Safari trigger cleanly without zooming or mis-tapping adjacent icons.
- [ ] **Offline Resilience**: Disconnecting network during match note entry or session planning retains 100% of data and syncs upon reconnection.
- [ ] **Export Integrity**: Exported video MP4s and match report PDFs carry sharp, unclipped club watermarks and correct resolution.
- [ ] **Zero Console Errors**: No unhandled promise rejections, fabric canvas leaks, or storage quota warnings during an intensive 30-minute coaching session.
