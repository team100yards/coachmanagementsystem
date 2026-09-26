/**
 * Session Planner Studio - Standalone Pro Engine
 * Team 100 Yards / Coach Management System
 */

// ══ Firebase Initialization ══
const firebaseConfig = {
  apiKey: "AIzaSyBf_L4yFf_P-SS6SIQjDA67OaZ8pJQtRuk",
  authDomain: "coachmanagementsystem.firebaseapp.com",
  projectId: "coachmanagementsystem",
  storageBucket: "coachmanagementsystem.firebasestorage.app",
  messagingSenderId: "892324628193",
  appId: "1:892324628193:web:2cbbc23fc851d15aee99a0"
};

const fbApp = (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0)
  ? firebase.app()
  : (typeof firebase !== 'undefined' ? firebase.initializeApp(firebaseConfig) : null);

const db = fbApp ? fbApp.firestore() : null;
const auth = fbApp ? fbApp.auth() : null;

// ══ Helper Utilities ══
const $ = id => document.getElementById(id);
const esc = s => (s === null || s === undefined) ? '' : String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function openM(id) { const el = $(id); if(el) el.classList.add('open'); }
function closeM(id) { const el = $(id); if(el) el.classList.remove('open'); }

function formatSessionDate(dateStr) {
  if(!dateStr) return 'TBD Date';
  try {
    const parts = dateStr.split('-');
    if(parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }
  } catch(e){}
  return dateStr;
}

function getCategoryBadgeClass(cat) {
  switch((cat || '').toLowerCase()) {
    case 'tactical': return 'sp-badge-tactical';
    case 'technical': return 'sp-badge-technical';
    case 'ssg': return 'sp-badge-ssg';
    case 'physical': return 'sp-badge-physical';
    case 'match prep': return 'sp-badge-matchprep';
    case 'set pieces': return 'sp-badge-setpieces';
    default: return 'sp-badge-tactical';
  }
}

// ══ Equipment Presets ══
const EQUIPMENT_PRESETS = [
  { id: 'balls', label: 'Footballs (12)', icon: '⚽', def: true },
  { id: 'cones_orange', label: 'Orange Cones', icon: '🔺', def: true },
  { id: 'cones_yellow', label: 'Yellow Discs', icon: '🟡', def: true },
  { id: 'bibs_yellow', label: 'Yellow Bibs (10)', icon: '🎽', def: true },
  { id: 'bibs_blue', label: 'Blue Bibs (10)', icon: '🎽', def: true },
  { id: 'bibs_red', label: 'Red Bibs (10)', icon: '🎽', def: false },
  { id: 'goals_mini', label: 'Mini Goals (2-4)', icon: '🥅', def: true },
  { id: 'hurdles', label: 'Agility Hurdles', icon: '🚧', def: false },
  { id: 'ladders', label: 'Agility Ladders', icon: '🪜', def: false },
  { id: 'poles', label: 'Slalom Poles', icon: '🚩', def: false },
  { id: 'mannequins', label: 'Free-Kick Mannequins', icon: '👤', def: false },
  { id: 'stopwatch', label: 'Stopwatch & Whistle', icon: '⏱️', def: true },
  { id: 'board', label: 'Tactics Board & Markers', icon: '📋', def: true }
];

// ══ Pro Drill Library ══
const DRILL_LIBRARY = [
  {
    id: 'd_rondo_5v2',
    phase: 'Warm-up',
    name: '5v2 High-Tempo Transition Rondo',
    duration: 15,
    dimensions: '12x12m Grid',
    players: '7 Players (5v2)',
    description: '5 outside players maintain possession with 1-2 touches max. 2 central pressing defenders hunt the ball. When possession is lost or forced out of bounds, the error player switches with a central defender.',
    coachingPoints: '• Open body profile facing across the pitch\n• Crisp pass weight to the correct foot\n• Deceptive disguise with hips and eyes\n• Immediate aggressive counter-press upon ball loss',
    diagram: ''
  },
  {
    id: 'd_y_passing',
    phase: 'Technical',
    name: 'Y-Pattern 3rd Man Combination Passing',
    duration: 20,
    dimensions: '25x20m Zone',
    players: '8-12 Players',
    description: 'Player A plays to B checking down. B drops set pass to A. A penetrates deep diagonally to C making a blindside overlapping run. C finishes or crosses into mini goal. Rotations: A -> B -> C -> A.',
    coachingPoints: '• Trigger checking run as passer prepares to strike\n• Soft cushioned bounce pass on the half-turn\n• Acceleration after release to offer support angle\n• Precision execution over speed',
    diagram: ''
  },
  {
    id: 'd_1v1_finishing',
    phase: 'Technical',
    name: '1v1 Channel Duel & Rapid Box Finishing',
    duration: 20,
    dimensions: '30x20m Box with Full Goal',
    players: '8 Players + 1 GK',
    description: 'Attacker receives pass from coach, turns and commits isolated defender in a 1v1 corridor. Attacker has 6 seconds to generate a shot on goal. If defender intercepts, they counter into two mini goals.',
    coachingPoints: '• Positive aggressive first touch directly toward goal\n• Change of pace and sharp body feint\n• Early strike across the goalkeeper into corners\n• Defender stays low and dictates play away from center',
    diagram: ''
  },
  {
    id: 'd_4v4_3_possession',
    phase: 'Tactical',
    name: '4v4 + 3 Neutral Positional Overload Box',
    duration: 25,
    dimensions: '32x26m Box',
    players: '11 Players (4v4 + 3)',
    description: '4 vs 4 inside the grid with 3 neutral playmakers (1 deep, 1 high, 1 central #10). Possession team works to complete 7 consecutive passes or connect from deep neutral to high neutral for a point.',
    coachingPoints: '• Constant diamond and triangle passing networks\n• Exploit central #10 to draw pressure then switch weakside\n• Instant 3-second counter-press trigger on turnovers\n• Maximise width and vertical depth',
    diagram: ''
  },
  {
    id: 'd_high_press_ssg',
    phase: 'SSG',
    name: '6v6 + 2 Flank Gate Pressing Game',
    duration: 25,
    dimensions: '45x35m with 2 Goals',
    players: '12 Players + 2 GKs',
    description: '6v6 game with mini target gates on both wings. The defending block sets a pressing line. If a team wins the ball in the opponent half and scores within 8 seconds, the goal counts double.',
    coachingPoints: '• Recognize pressing triggers (bad touch, floating ball, back-pass)\n• Collective block shifts across as a unit to cut channels\n• Decisive forward vertical penetration on transition\n• Sweeper keeper maintains high active stance',
    diagram: ''
  },
  {
    id: 'd_cooldown_stretch',
    phase: 'Cool-down',
    name: 'Active Deload, Mobility & Tactical Debrief',
    duration: 10,
    dimensions: 'Penalty Box Area',
    players: 'Entire Squad',
    description: 'Light active recovery jog followed by dynamic mobility and static lower-body stretches (hip flexors, hamstrings, calves, groin). Coach reviews session objectives and previews next fixture.',
    coachingPoints: '• Controlled diaphragmatic breathing to lower heart rate\n• Hold each stretch 20-30 seconds without bouncing\n• Hydration & recovery shake intake\n• Clear player questions & tactical alignment',
    diagram: ''
  }
];

// ══ Full Session Templates ══
const SESSION_PRESETS = [
  {
    id: 'preset_high_press_433',
    title: '4-3-3 High Pressing & Rapid Counter-Attack',
    category: 'Tactical',
    intensity: 'High',
    duration: 90,
    objectives: '• Establish aggressive pressing triggers inside opponent build-up zone\n• Cut central vertical passing lanes and channel play wide\n• Rapid 4-second counter-attack transition upon ball recovery',
    equipment: ['balls', 'cones_orange', 'cones_yellow', 'bibs_yellow', 'bibs_blue', 'goals_mini', 'stopwatch', 'board'],
    drills: [
      {
        phase: 'Warm-up',
        name: 'Dynamic SAQ Ladder & 5v2 Keep-Away Rondo',
        duration: 15,
        dimensions: '15x15m',
        players: 'Squad split in 2 groups',
        description: '5 minutes of speed ladder and hurdle activation, followed by 10 minutes of intense 5v2 rondo with 2-touch limit.',
        coachingPoints: '• Explosive first step\n• Rapid ball circulation\n• Instant pressing reaction',
        diagram: ''
      },
      {
        phase: 'Technical',
        name: 'Vertical Line-Breaking & Rapid 1-2 Combinations',
        duration: 20,
        dimensions: '25x20m',
        players: 'Full Squad',
        description: 'Combination drill simulating midfield line-breaking balls into checking wingers and overlapping fullbacks.',
        coachingPoints: '• Ball velocity\n• Open body orientation\n• Blindside 3rd man runs',
        diagram: ''
      },
      {
        phase: 'Tactical',
        name: '4v4+3 Central Pressing & Trap Zone',
        duration: 25,
        dimensions: '35x25m',
        players: '11 Players (4v4+3)',
        description: 'Defending unit coordinates as a compact 4-man block to force errors and release quick vertical pass to neutral target.',
        coachingPoints: '• Curved approach run to shadow passing lane\n• Synchronized step-up\n• Immediate forward strike',
        diagram: ''
      },
      {
        phase: 'SSG',
        name: '7v7 + 2 High-Press Transition Match',
        duration: 20,
        dimensions: '55x40m Box-to-Box',
        players: '14 Players + 2 GKs',
        description: '7v7 full intensity match. Goals scored within 8 seconds of winning the ball in attacking half count double.',
        coachingPoints: '• Hunt together in packs\n• Shoot or cross early before defense recovers\n• Sweeper-keeper communication',
        diagram: ''
      },
      {
        phase: 'Cool-down',
        name: 'Recovery Walk, Hamstring/Groin Stretch & Recap',
        duration: 10,
        dimensions: 'Half Pitch',
        players: 'Entire Squad',
        description: 'Gradual heart-rate recovery walk, full lower body static stretch, and 5-minute tactical recap with coaching staff.',
        coachingPoints: '• Hydration intake\n• Review match day pressing rules',
        diagram: ''
      }
    ]
  },
  {
    id: 'preset_tikitaka_possession',
    title: 'Tiki-Taka 3rd Man Possession & Positional Play',
    category: 'Technical',
    intensity: 'Medium',
    duration: 90,
    objectives: '• Build positional superiority through diamonds and triangles\n• Exploit third-man runs to penetrate packed midfields\n• Maintain calm ball retention under intense pressing',
    equipment: ['balls', 'cones_orange', 'cones_yellow', 'bibs_yellow', 'bibs_blue', 'goals_mini', 'stopwatch'],
    drills: [
      {
        phase: 'Warm-up',
        name: 'Passing Diamond & Continuous Give-and-Go Overlaps',
        duration: 15,
        dimensions: '18x18m Diamond',
        players: 'Squad in 2 groups',
        description: 'Continuous 1-touch and 2-touch passing diamond with give-and-go overlaps and blindside check-runs.',
        coachingPoints: '• Weight of pass to back foot\n• Disguise intentions with eye movement\n• Sharp deceleration into space',
        diagram: ''
      },
      {
        phase: 'Technical',
        name: '3v1 to 3v3 Positional Transfer Channels',
        duration: 20,
        dimensions: '30x15m (3 Channels)',
        players: '12 Players (4 teams of 3)',
        description: 'Teams keep 3v1 in end zone, after 4 passes they must transfer ball through central midfield zone to opposite end.',
        coachingPoints: '• Calmness under tight pressure\n• Penetrative pass through central pocket\n• Supporting angles from midfielders',
        diagram: ''
      },
      {
        phase: 'Tactical',
        name: '6v6 + 3 Possession Overload Game',
        duration: 25,
        dimensions: '40x35m',
        players: '15 Players',
        description: '6v6 with 3 neutral players creating a constant +3 attacking overload. Aim is 10 consecutive passes for 1 point.',
        coachingPoints: '• Constant movement off the ball\n• Use neutrals to reset tempo when closed down\n• Quick one-touch switch to weak side',
        diagram: ''
      },
      {
        phase: 'SSG',
        name: '8v8 Small-Sided Game with 4 Mini Goals',
        duration: 20,
        dimensions: '50x40m',
        players: '16 Players',
        description: '8v8 playing to 4 wide mini-goals to encourage switching play and combination passing into wide channels.',
        coachingPoints: '• Quick ball circulation from side to side\n• Exploit underloaded side with overlapping run\n• Speed of play in final third',
        diagram: ''
      },
      {
        phase: 'Cool-down',
        name: 'Gradual De-load & Hip Mobility Routine',
        duration: 10,
        dimensions: 'Center Circle',
        players: 'All Players',
        description: 'Gentle mobility flow, calf/hip stretches, and hydration check-in.',
        coachingPoints: '• Controlled deep breathing\n• Rehydrate with electrolytes',
        diagram: ''
      }
    ]
  }
];

// ══ Studio State ══
let teams = [];
let allSystemPlayers = [];
let players = [];
let sessions = [];
let sessionsUnsub = null;
let currentStudioTeamId = 'all';

let currentEditingSession = null;
let currentEditingDrillIndex = null;
let sessionAttendanceState = {};

let currentBoardTool = 'red';
let boardPitchType = 'half';
let boardObjects = [];
let boardHistory = [];
let isDraggingObject = false;
let draggedObjectIndex = -1;
let dragOffset = { x: 0, y: 0 };

let currentViewingDiagram = null;
let currentPrintingSession = null;

// ══ Initialization ══
window.addEventListener('DOMContentLoaded', async () => {
  loadBranding();
  initCanvasPitch();
  initCanvasEvents();

  // Read teamId from URL if opened from a specific team
  const urlParams = new URLSearchParams(window.location.search);
  const requestedTeamId = urlParams.get('teamId') || 'all';

  // Load cached teams immediately
  try {
    const cached = localStorage.getItem('fhq_teams_cache');
    if(cached) {
      teams = JSON.parse(cached);
      populateTeamDropdown(requestedTeamId);
    }
  } catch(e){}

  // Fetch live teams from Firestore
  if(db) {
    try {
      const snap = await db.collection('teams').get();
      teams = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => ((b.createdAt||'') > (a.createdAt||'') ? 1 : -1));
      try { localStorage.setItem('fhq_teams_cache', JSON.stringify(teams)); } catch(e){}
      populateTeamDropdown(requestedTeamId);
    } catch(e){
      console.warn('Could not fetch teams from Firestore:', e);
    }

    // Fetch all players for attendance roster
    try {
      const pSnap = await db.collection('players').get();
      allSystemPlayers = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      updateActivePlayers(currentStudioTeamId);
    } catch(e){
      console.warn('Could not fetch players from Firestore:', e);
    }
  }

  // Subscribe to sessions
  subscribeSessions(currentStudioTeamId);
});

function loadBranding() {
  const clubName = localStorage.getItem('admin_name') || 'Coach Management System';
  const logo = localStorage.getItem('admin_logo');

  const nameEl = $('sp-topbar-club-name');
  if(nameEl) nameEl.textContent = clubName;

  const logoEl = $('sp-topbar-logo-img');
  if(logoEl && logo && logo.length > 30) {
    logoEl.src = logo;
    logoEl.style.display = 'inline-block';
  }
}

function populateTeamDropdown(selectedId = 'all') {
  const select = $('sp-studio-team-select');
  if(!select) return;

  let opts = '<option value="all">🌐 All Teams (Global View)</option>';
  if(Array.isArray(teams) && teams.length > 0) {
    opts += teams.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('');
  }
  select.innerHTML = opts;

  if(selectedId && (selectedId === 'all' || teams.some(t => t.id === selectedId))) {
    select.value = selectedId;
    currentStudioTeamId = selectedId;
  } else {
    select.value = 'all';
    currentStudioTeamId = 'all';
  }

  updateActivePlayers(currentStudioTeamId);
}

function onStudioTeamSelectChange(newTeamId) {
  currentStudioTeamId = newTeamId;
  updateActivePlayers(newTeamId);
  subscribeSessions(newTeamId);
}

function updateActivePlayers(teamId) {
  if(teamId && teamId !== 'all') {
    players = (allSystemPlayers || []).filter(p => p.teamId === teamId);
  } else {
    players = allSystemPlayers || [];
  }
  if(currentEditingSession) {
    renderSessionAttendance();
  }
}

// ══ Realtime Sessions Sync ══
function subscribeSessions(targetTeamId) {
  if(sessionsUnsub) { sessionsUnsub(); sessionsUnsub = null; }
  const tid = targetTeamId || currentStudioTeamId || 'all';
  const isSpecific = tid && tid !== 'all';
  const cacheKey = isSpecific ? ('fhq_sessions_' + tid) : 'fhq_sessions_all';

  // Load from local storage cache for instant rendering
  try {
    const cached = localStorage.getItem(cacheKey);
    if(cached) {
      sessions = JSON.parse(cached);
      renderSessions();
    }
  } catch(e){}

  if(!db) {
    renderSessions();
    return;
  }

  try {
    const q = isSpecific
      ? db.collection('sessions').where('teamId', '==', tid)
      : db.collection('sessions');

    sessionsUnsub = q.onSnapshot(
      snap => {
        const uniqueMap = new Map();
        snap.docs.forEach(d => {
          uniqueMap.set(d.id, { id: d.id, ...d.data() });
        });
        sessions = Array.from(uniqueMap.values())
          .sort((a, b) => (String(b.date || '') + String(b.time || '')).localeCompare(String(a.date || '') + String(a.time || '')));
        try { localStorage.setItem(cacheKey, JSON.stringify(sessions)); } catch(e){}
        renderSessions();
      },
      err => {
        console.warn('Firestore sessions subscription error:', err);
      }
    );
  } catch(e) {
    console.warn('Could not initialize sessions listener:', e);
  }
}

// ══ Render Sessions List ══
function renderSessions() {
  const search = ($('sp-search')?.value || '').toLowerCase().trim();
  const catFilter = $('sp-filter-cat')?.value || '';
  const statusFilter = $('sp-filter-status')?.value || '';
  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = sessions.filter(s => {
    if(catFilter && s.category !== catFilter) return false;
    if(statusFilter === 'upcoming' && (s.date < todayStr)) return false;
    if(statusFilter === 'today' && (s.date !== todayStr)) return false;
    if(statusFilter === 'completed' && (s.date > todayStr && s.debrief?.status !== 'completed')) return false;
    if(search) {
      const matchTitle = (s.title || '').toLowerCase().includes(search);
      const matchObj = (s.objectives || '').toLowerCase().includes(search);
      const matchVenue = (s.venue || '').toLowerCase().includes(search);
      const matchDrills = (s.drills || []).some(d => (d.name || '').toLowerCase().includes(search) || (d.description || '').toLowerCase().includes(search));
      if(!matchTitle && !matchObj && !matchVenue && !matchDrills) return false;
    }
    return true;
  });

  // Calculate statistics
  const totalSessions = sessions.length;
  const upcomingCount = sessions.filter(s => (s.date || '') >= todayStr).length;
  const totalMins = sessions.reduce((acc, s) => acc + (parseInt(s.duration) || 0), 0);
  const totalHours = (totalMins / 60).toFixed(1);

  let attTotalP = 0, attTotalA = 0;
  sessions.forEach(s => {
    if(s.attendance) {
      const vals = Object.values(s.attendance);
      if(vals.length) {
        const presentCount = vals.filter(v => v === 'present' || v === 'late').length;
        attTotalP += presentCount;
        attTotalA += vals.length;
      }
    }
  });
  const avgAtt = attTotalA > 0 ? Math.round((attTotalP / attTotalA) * 100) : (players.length ? 100 : 0);

  if($('sp-st-total')) $('sp-st-total').textContent = totalSessions;
  if($('sp-st-upcoming')) $('sp-st-upcoming').textContent = upcomingCount;
  if($('sp-st-hours')) $('sp-st-hours').textContent = totalHours + 'h';
  if($('sp-st-att')) $('sp-st-att').textContent = avgAtt + '%';

  const listEl = $('sp-list');
  if(!listEl) return;

  if(!filtered.length) {
    listEl.innerHTML = `
      <div class="empty" style="grid-column: 1/-1; padding: 48px 20px; text-align: center; background: var(--card); border-radius: 16px; border: 1.5px dashed var(--bd);">
        <div style="font-size: 40px; margin-bottom: 12px;">📋</div>
        <h3 style="margin: 0 0 6px; font-size: 18px; color: var(--tx);">No training sessions found</h3>
        <p style="margin: 0 0 16px; font-size: 13px; color: var(--mt);">Plan a new training session or select ready-made pro presets.</p>
        <div style="display: flex; justify-content: center; gap: 10px;">
          <button class="obtn" onclick="openTemplatePicker()">⚡ Load Presets</button>
          <button class="mok" onclick="openNewSession()">＋ Plan New Session</button>
        </div>
      </div>
    `;
    return;
  }

  listEl.innerHTML = filtered.map(s => {
    const drills = s.drills || [];
    const totalDuration = drills.reduce((sum, d) => sum + (parseInt(d.duration) || 0), 0) || s.duration || 90;
    const teamObj = Array.isArray(teams) ? teams.find(t => t.id === s.teamId) : null;
    const teamBadgeHTML = teamObj ? `<span class="sp-badge" style="background: rgba(26,92,26,0.1); color: #1a5c1a; border: 1px solid rgba(26,92,26,0.25); font-weight: 700;">⚽ ${esc(teamObj.name)}</span>` : '';
    const intensityClass = s.intensity === 'High' ? 'sp-intensity-high' : (s.intensity === 'Low' ? 'sp-intensity-low' : (s.intensity === 'Match' ? 'sp-intensity-match' : 'sp-intensity-med'));

    return `
      <div class="sp-card">
        <div class="sp-card-head">
          <div class="sp-date-badge">
            <span>📅 ${formatSessionDate(s.date)}</span>
            ${s.time ? `<span style="font-weight: 400; opacity: .8;">${s.time}</span>` : ''}
          </div>
          <div class="sp-badge-group">
            ${teamBadgeHTML}
            <span class="sp-badge ${getCategoryBadgeClass(s.category)}">${esc(s.category || 'Tactical')}</span>
            <span class="sp-badge ${intensityClass}">⚡ ${esc(s.intensity || 'Medium')}</span>
          </div>
        </div>

        <div class="sp-card-title">${esc(s.title || 'Training Session')}</div>
        <div class="sp-card-topic">${esc(s.objectives ? s.objectives.split('\n')[0] : (s.venue ? '📍 ' + s.venue : 'Team Practice'))}</div>

        <div style="display: flex; flex-wrap: wrap; gap: 5px; margin: 10px 0;">
          ${drills.slice(0, 4).map(d => `
            <span style="font-size: 11px; padding: 2px 7px; background: var(--card2); border: 1px solid var(--bd); border-radius: 5px; color: var(--tx);">
              ${esc(d.name)} <strong style="color: var(--g);">${d.duration}m</strong>
            </span>
          `).join('')}
          ${drills.length > 4 ? `<span style="font-size: 11px; color: var(--mt); align-self: center;">+${drills.length - 4} more</span>` : ''}
        </div>

        <div class="sp-card-footer">
          <div class="sp-card-meta">
            <span>⏱️ ${totalDuration}m</span>
            <span>📍 ${esc(s.venue || 'Pitch')}</span>
            ${s.coach ? `<span>🧑‍💼 ${esc(s.coach)}</span>` : ''}
          </div>
          <div class="sp-card-acts">
            <button class="sp-btn" onclick="openSessionEditor('${s.id}')" title="Edit Session">✏️ Edit</button>
            <button class="sp-btn" onclick="openPrintModal('${s.id}')" title="Print / PDF">🖨️ PDF</button>
            <button class="sp-btn" onclick="shareSessionWhatsApp('${s.id}')" title="Share via WhatsApp">💬 Share</button>
            <button class="sp-btn" onclick="duplicateSession('${s.id}')" title="Duplicate Session">📋 Copy</button>
            <button class="sp-btn sp-btn-del" onclick="doDeleteSession('${s.id}')" title="Delete Session">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ══ Session Editor ══
function openNewSession() {
  const today = new Date().toISOString().split('T')[0];
  const assignedTeamId = (currentStudioTeamId && currentStudioTeamId !== 'all') ? currentStudioTeamId : (teams[0] ? teams[0].id : '');

  currentEditingSession = {
    id: null,
    teamId: assignedTeamId,
    title: '',
    date: today,
    time: '17:30',
    venue: '',
    category: 'Tactical',
    intensity: 'Medium',
    coach: '',
    objectives: '',
    equipment: ['balls', 'cones_orange', 'bibs_yellow', 'stopwatch'],
    drills: [
      {
        phase: 'Warm-up',
        name: 'Dynamic SAQ & Activation Rondo',
        duration: 15,
        dimensions: '12x12m Grid',
        players: 'Entire Squad',
        description: 'Dynamic stretching, agility footwork through ladders followed by 5v2 rondo with 2 touches max.',
        coachingPoints: '• Sharp first touch\n• High intensity communication',
        diagram: ''
      }
    ],
    attendance: {},
    debrief: { rating: '', status: 'scheduled', notes: '' }
  };

  sessionAttendanceState = {};
  populateSessionEditorForm();
  openM('m-session-editor');
}

function openSessionEditor(id) {
  const s = sessions.find(item => item.id === id);
  if(!s) return;
  currentEditingSession = JSON.parse(JSON.stringify(s));
  sessionAttendanceState = currentEditingSession.attendance ? JSON.parse(JSON.stringify(currentEditingSession.attendance)) : {};
  populateSessionEditorForm();
  openM('m-session-editor');
}

function closeSessionEditor() {
  currentEditingSession = null;
  closeM('m-session-editor');
}

function populateSessionEditorForm() {
  const s = currentEditingSession;
  if(!s) return;

  $('se-modal-title').textContent = s.id ? 'EDIT TRAINING SESSION' : 'PLAN TRAINING SESSION';
  $('se-title').value = s.title || '';
  $('se-date').value = s.date || '';
  $('se-time').value = s.time || '17:30';
  $('se-venue').value = s.venue || '';
  $('se-cat').value = s.category || 'Tactical';
  $('se-intensity').value = s.intensity || 'Medium';
  $('se-objectives').value = s.objectives || '';
  $('se-rating').value = s.debrief?.rating || '';
  $('se-status').value = s.debrief?.status || 'scheduled';
  $('se-notes').value = s.debrief?.notes || '';

  // Team dropdown in editor
  const teamSelect = $('se-team');
  if(teamSelect) {
    let opts = '';
    if(Array.isArray(teams) && teams.length > 0) {
      opts = teams.map(t => `<option value="${t.id}"${(s.teamId === t.id) ? ' selected' : ''}>${esc(t.name)}</option>`).join('');
    }
    teamSelect.innerHTML = opts;
    if(!s.teamId && teams.length > 0) s.teamId = teams[0].id;
  }

  populateCoachDropdown(s.teamId, s.coach);
  updateEditorPlayers(s.teamId);
  renderEquipmentChecklist();
  renderDrillsList();
  renderSessionAttendance();
}

function onSessionEditorTeamChanged(newTeamId) {
  if(!currentEditingSession) return;
  currentEditingSession.teamId = newTeamId;
  populateCoachDropdown(newTeamId);
  updateEditorPlayers(newTeamId);
  renderSessionAttendance();
}

function populateCoachDropdown(teamId, selectedCoach = '') {
  const activeTeam = Array.isArray(teams) ? teams.find(t => t.id === teamId) : null;
  const coachSelect = $('se-coach');
  if(coachSelect) {
    const staffList = (activeTeam && activeTeam.staff) || [];
    coachSelect.innerHTML = '<option value="">Select Coach</option>' + staffList.map(st => `
      <option value="${esc(st.name)}"${selectedCoach === st.name ? ' selected' : ''}>${esc(st.name)} (${esc(st.role || 'Staff')})</option>
    `).join('');
  }
}

function updateEditorPlayers(teamId) {
  if(teamId) {
    players = (allSystemPlayers || []).filter(p => p.teamId === teamId);
  } else {
    players = allSystemPlayers || [];
  }
}

// ══ Equipment Checklist ══
function renderEquipmentChecklist() {
  const container = $('se-equip-grid');
  if(!container || !currentEditingSession) return;
  const currentEquip = currentEditingSession.equipment || [];

  container.innerHTML = EQUIPMENT_PRESETS.map(eq => {
    const checked = currentEquip.includes(eq.id);
    return `
      <div class="sp-equip-item ${checked ? 'selected' : ''}" onclick="toggleEquipment('${eq.id}')">
        <span>${eq.icon}</span>
        <span style="font-size: 12.5px; font-weight: 600;">${esc(eq.label)}</span>
        <input type="checkbox" ${checked ? 'checked' : ''} style="margin-left: auto; pointer-events: none;">
      </div>
    `;
  }).join('');
}

function toggleEquipment(id) {
  if(!currentEditingSession) return;
  currentEditingSession.equipment = currentEditingSession.equipment || [];
  const idx = currentEditingSession.equipment.indexOf(id);
  if(idx > -1) {
    currentEditingSession.equipment.splice(idx, 1);
  } else {
    currentEditingSession.equipment.push(id);
  }
  renderEquipmentChecklist();
}

function addCustomEquipment() {
  const inp = $('se-custom-equip');
  const val = (inp?.value || '').trim();
  if(!val || !currentEditingSession) return;
  const customId = 'custom_' + Date.now();
  EQUIPMENT_PRESETS.push({ id: customId, label: val, icon: '📦', def: true });
  currentEditingSession.equipment = currentEditingSession.equipment || [];
  currentEditingSession.equipment.push(customId);
  inp.value = '';
  renderEquipmentChecklist();
}

// ══ Drills Management ══
function renderDrillsList() {
  const container = $('se-drills-list');
  if(!container || !currentEditingSession) return;
  const drills = currentEditingSession.drills || [];

  let totalMins = 0;
  container.innerHTML = drills.map((d, index) => {
    const dur = parseInt(d.duration) || 0;
    totalMins += dur;

    return `
      <div class="sp-drill-card" style="background: var(--card); border: 1.5px solid var(--bd); border-radius: 12px; padding: 14px 16px; margin-bottom: 10px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 800; font-size: 13px; color: var(--g); background: rgba(26,92,26,0.1); padding: 3px 8px; border-radius: 6px;">#${index + 1}</span>
            <select style="padding: 4px 8px; font-size: 12px; font-weight: 700; border-radius: 6px; background: var(--card2); border: 1px solid var(--bd); color: var(--tx);" onchange="updateDrillField(${index}, 'phase', this.value)">
              <option value="Warm-up"${d.phase === 'Warm-up' ? ' selected' : ''}>Warm-up</option>
              <option value="Technical"${d.phase === 'Technical' ? ' selected' : ''}>Technical</option>
              <option value="Tactical"${d.phase === 'Tactical' ? ' selected' : ''}>Tactical</option>
              <option value="SSG"${d.phase === 'SSG' ? ' selected' : ''}>Small-Sided Game (SSG)</option>
              <option value="Physical"${d.phase === 'Physical' ? ' selected' : ''}>Physical / SAQ</option>
              <option value="Cool-down"${d.phase === 'Cool-down' ? ' selected' : ''}>Cool-down</option>
            </select>
            <input type="text" value="${esc(d.name)}" placeholder="Drill Name" style="padding: 4px 10px; font-size: 13px; font-weight: 700; border-radius: 6px; background: var(--card2); border: 1px solid var(--bd); color: var(--tx); width: 220px;" oninput="updateDrillField(${index}, 'name', this.value)">
          </div>

          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 12px; color: var(--mt);">Duration:</span>
            <input type="number" value="${dur}" min="1" max="180" style="width: 55px; padding: 4px 6px; font-size: 12px; font-weight: 700; border-radius: 6px; background: var(--card2); border: 1px solid var(--bd); color: var(--g); text-align: center;" oninput="updateDrillField(${index}, 'duration', parseInt(this.value) || 0); recalculateTotalTime();">
            <span style="font-size: 12px; color: var(--mt);">mins</span>
            <button type="button" class="obtn" style="padding: 4px 8px; font-size: 12px;" onclick="openDrillBoard(${index})" title="Open Tactical Pitch Sketcher">📐 Board</button>
            <button type="button" class="mc" style="padding: 4px 8px; font-size: 12px; color: #d32f2f;" onclick="removeDrillRow(${index})" title="Remove Drill">✕</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 11px; font-weight: 700; color: var(--mt); text-transform: uppercase;">Dimensions / Players:</label>
            <input type="text" value="${esc(d.dimensions || '')}" placeholder="e.g. 25x20m | 8 Players" style="width: 100%; padding: 4px 8px; font-size: 12px; border-radius: 6px; background: var(--card2); border: 1px solid var(--bd); color: var(--tx); box-sizing: border-box; margin-top: 3px;" oninput="updateDrillField(${index}, 'dimensions', this.value)">
          </div>
          <div>
            <label style="font-size: 11px; font-weight: 700; color: var(--mt); text-transform: uppercase;">Coaching Keys:</label>
            <input type="text" value="${esc(d.coachingPoints || '')}" placeholder="Key principles & cues" style="width: 100%; padding: 4px 8px; font-size: 12px; border-radius: 6px; background: var(--card2); border: 1px solid var(--bd); color: var(--tx); box-sizing: border-box; margin-top: 3px;" oninput="updateDrillField(${index}, 'coachingPoints', this.value)">
          </div>
        </div>

        <div style="margin-top: 8px;">
          <textarea rows="2" placeholder="Drill setup, rules, and progression…" style="width: 100%; padding: 6px 10px; font-size: 12px; border-radius: 6px; background: var(--card2); border: 1px solid var(--bd); color: var(--tx); box-sizing: border-box; resize: vertical;" oninput="updateDrillField(${index}, 'description', this.value)">${esc(d.description || '')}</textarea>
        </div>

        ${d.diagram ? `
          <div style="margin-top: 10px; display: flex; align-items: center; gap: 10px; background: rgba(20,90,39,0.1); border: 1px solid rgba(26,122,53,0.3); border-radius: 8px; padding: 6px 10px;">
            <img src="${d.diagram}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #145a27; cursor: pointer;" onclick="viewDrillDiagram(${index})" title="Click to view diagram full-size">
            <div style="font-size: 11.5px; color: var(--tx); flex: 1;">Tactical pitch diagram attached</div>
            <button type="button" class="obtn" style="padding: 3px 8px; font-size: 11px;" onclick="viewDrillDiagram(${index})">👁️ Preview</button>
            <button type="button" class="mc" style="padding: 3px 6px; font-size: 11px; color: #d32f2f;" onclick="removeDrillDiagram(${index})">Remove</button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  if($('se-total-mins')) $('se-total-mins').textContent = totalMins + ' mins';
}

function updateDrillField(index, field, value) {
  if(!currentEditingSession || !currentEditingSession.drills[index]) return;
  currentEditingSession.drills[index][field] = value;
}

function recalculateTotalTime() {
  if(!currentEditingSession) return;
  const total = (currentEditingSession.drills || []).reduce((acc, d) => acc + (parseInt(d.duration) || 0), 0);
  if($('se-total-mins')) $('se-total-mins').textContent = total + ' mins';
}

function addNewDrillRow() {
  if(!currentEditingSession) return;
  currentEditingSession.drills = currentEditingSession.drills || [];
  currentEditingSession.drills.push({
    phase: 'Technical',
    name: 'New Training Drill',
    duration: 15,
    dimensions: '20x15m',
    players: '',
    description: '',
    coachingPoints: '',
    diagram: ''
  });
  renderDrillsList();
}

function removeDrillRow(index) {
  if(!currentEditingSession || !currentEditingSession.drills[index]) return;
  currentEditingSession.drills.splice(index, 1);
  renderDrillsList();
}

function removeDrillDiagram(index) {
  if(!currentEditingSession || !currentEditingSession.drills[index]) return;
  currentEditingSession.drills[index].diagram = '';
  renderDrillsList();
}

// ══ Squad Attendance ══
function renderSessionAttendance() {
  const container = $('se-att-roster');
  if(!container) return;

  if(!players || !players.length) {
    container.innerHTML = '<div style="grid-column: 1/-1; font-size: 12px; color: var(--mt); padding: 12px; background: var(--card2); border-radius: 8px;">No players registered in this squad. Add players in the Database tab.</div>';
    return;
  }

  container.innerHTML = players.map(p => {
    const currentStatus = sessionAttendanceState[p.id] || 'present';

    return `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: var(--card2); border: 1px solid var(--bd); border-radius: 8px;">
        <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
          <span style="font-weight: 800; font-size: 12px; color: var(--g); width: 22px;">#${p.jersey || p.playernum || '-'}</span>
          <span style="font-size: 12.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${esc(p.name)}</span>
        </div>
        <div style="display: flex; gap: 3px;">
          <button type="button" class="att-pill ${currentStatus === 'present' ? 'act-present' : ''}" style="padding: 2px 7px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid var(--bd); cursor: pointer; background: ${currentStatus === 'present' ? '#2e7d32' : 'var(--card)'}; color: ${currentStatus === 'present' ? '#fff' : 'var(--tx)'};" onclick="setAttendance('${p.id}', 'present')">P</button>
          <button type="button" class="att-pill ${currentStatus === 'late' ? 'act-late' : ''}" style="padding: 2px 7px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid var(--bd); cursor: pointer; background: ${currentStatus === 'late' ? '#f57f17' : 'var(--card)'}; color: ${currentStatus === 'late' ? '#fff' : 'var(--tx)'};" onclick="setAttendance('${p.id}', 'late')">L</button>
          <button type="button" class="att-pill ${currentStatus === 'absent' ? 'act-absent' : ''}" style="padding: 2px 7px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid var(--bd); cursor: pointer; background: ${currentStatus === 'absent' ? '#c62828' : 'var(--card)'}; color: ${currentStatus === 'absent' ? '#fff' : 'var(--tx)'};" onclick="setAttendance('${p.id}', 'absent')">A</button>
          <button type="button" class="att-pill ${currentStatus === 'injured' ? 'act-injured' : ''}" style="padding: 2px 7px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid var(--bd); cursor: pointer; background: ${currentStatus === 'injured' ? '#6a1b9a' : 'var(--card)'}; color: ${currentStatus === 'injured' ? '#fff' : 'var(--tx)'};" onclick="setAttendance('${p.id}', 'injured')">I</button>
        </div>
      </div>
    `;
  }).join('');
}

function setAttendance(playerId, status) {
  sessionAttendanceState[playerId] = status;
  renderSessionAttendance();
}

function markAllAttendance(status) {
  (players || []).forEach(p => {
    sessionAttendanceState[p.id] = status;
  });
  renderSessionAttendance();
}

// ══ Save & Delete ══
async function saveSessionPlan() {
  if(!currentEditingSession) return;
  const title = ($('se-title')?.value || '').trim();
  const date = $('se-date')?.value || '';

  if(!title) { alert('Please enter a session title / theme.'); return; }
  if(!date) { alert('Please choose a session date.'); return; }

  const totalDuration = (currentEditingSession.drills || []).reduce((acc, d) => acc + (parseInt(d.duration) || 0), 0) || 90;
  const selectedTeamId = $('se-team')?.value || currentEditingSession.teamId || (teams[0] ? teams[0].id : '');

  const payload = {
    title,
    date,
    time: $('se-time')?.value || '17:30',
    venue: ($('se-venue')?.value || '').trim(),
    teamId: selectedTeamId,
    category: $('se-cat')?.value || 'Tactical',
    intensity: $('se-intensity')?.value || 'Medium',
    coach: $('se-coach')?.value || '',
    objectives: ($('se-objectives')?.value || '').trim(),
    duration: totalDuration,
    equipment: currentEditingSession.equipment || [],
    drills: currentEditingSession.drills || [],
    attendance: sessionAttendanceState,
    debrief: {
      rating: $('se-rating')?.value || '',
      status: $('se-status')?.value || 'scheduled',
      notes: ($('se-notes')?.value || '').trim()
    },
    updatedAt: new Date().toISOString()
  };

  try {
    if(currentEditingSession.id && db) {
      await db.collection('sessions').doc(currentEditingSession.id).update(payload);
      const idx = sessions.findIndex(s => s.id === currentEditingSession.id);
      if(idx > -1) sessions[idx] = { id: currentEditingSession.id, ...payload };
    } else if(db) {
      payload.createdAt = new Date().toISOString();
      const ref = await db.collection('sessions').add(payload);
      payload.id = ref.id;
      sessions.unshift(payload);
    } else {
      payload.id = 'local_' + Date.now();
      sessions.unshift(payload);
    }

    const cacheKey = selectedTeamId ? ('fhq_sessions_' + selectedTeamId) : 'fhq_sessions_all';
    try { localStorage.setItem(cacheKey, JSON.stringify(sessions)); } catch(e){}

    closeSessionEditor();
    renderSessions();
    alert('✅ Training session saved successfully!');
  } catch(e) {
    alert('❌ Could not save session: ' + (e.message || e));
  }
}

function duplicateSession(id) {
  const s = sessions.find(item => item.id === id);
  if(!s) return;
  const clone = JSON.parse(JSON.stringify(s));
  delete clone.id;
  clone.title = 'Copy of ' + (clone.title || 'Training Plan');
  clone.createdAt = new Date().toISOString();
  clone.updatedAt = new Date().toISOString();

  if(db) {
    db.collection('sessions').add(clone).then(() => {
      alert('✅ Session duplicated successfully!');
    }).catch(e => {
      alert('❌ Error duplicating: ' + (e.message || e));
    });
  }
}

async function doDeleteSession(id) {
  if(!confirm('⚠️ Are you sure you want to permanently delete this training session?')) return;
  try {
    if(db) {
      await db.collection('sessions').doc(id).delete();
    }
    sessions = sessions.filter(s => s.id !== id);
    renderSessions();
    alert('✅ Session deleted.');
  } catch(e) {
    alert('❌ Error deleting session: ' + (e.message || e));
  }
}

// ══ Tactical Board Engine ══
let canvas, ctx;

function initCanvasPitch() {
  canvas = $('pitch-canvas');
  if(!canvas) return;
  ctx = canvas.getContext('2d');
  drawPitch();
}

function setBoardPitch(type) {
  boardPitchType = type;
  ['bt-pitch-half', 'bt-pitch-full', 'bt-pitch-box'].forEach(id => {
    const b = $(id);
    if(b) b.classList.toggle('active', id === 'bt-pitch-' + type);
  });
  drawPitch();
}

function setBoardTool(tool) {
  currentBoardTool = tool;
  ['bt-red', 'bt-blue', 'bt-yellow', 'bt-ball', 'bt-cone', 'bt-line', 'bt-arrow', 'bt-text'].forEach(id => {
    const b = $(id);
    if(b) b.classList.toggle('active', id === 'bt-' + tool);
  });
}

function drawPitch() {
  if(!ctx || !canvas) return;
  const w = canvas.width;
  const h = canvas.height;

  // Background Grass Pitch
  ctx.fillStyle = '#145a27';
  ctx.fillRect(0, 0, w, h);

  // Mowed grass strips
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  const stripW = w / 8;
  for(let i = 0; i < 8; i += 2) {
    ctx.fillRect(i * stripW, 0, stripW, h);
  }

  // Pitch Lines
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2.5;

  const pad = 24;
  ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

  if(boardPitchType === 'full') {
    // Halfway line
    ctx.beginPath();
    ctx.moveTo(w / 2, pad);
    ctx.lineTo(w / 2, h - pad);
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 55, 0, Math.PI * 2);
    ctx.stroke();

    // Penalty Boxes
    ctx.strokeRect(pad, h / 2 - 80, 100, 160);
    ctx.strokeRect(w - pad - 100, h / 2 - 80, 100, 160);
    // Goal areas
    ctx.strokeRect(pad, h / 2 - 40, 40, 80);
    ctx.strokeRect(w - pad - 40, h / 2 - 40, 40, 80);
  } else if(boardPitchType === 'half') {
    // Goal line at bottom, halfway line at top
    ctx.strokeRect(pad, h - pad - 120, w - pad * 2, 120);
    ctx.strokeRect(w / 2 - 120, h - pad - 120, 240, 120);
    ctx.strokeRect(w / 2 - 60, h - pad - 45, 120, 45);
    // Penalty arc
    ctx.beginPath();
    ctx.arc(w / 2, h - pad - 120, 50, Math.PI, Math.PI * 2);
    ctx.stroke();
  } else if(boardPitchType === 'box') {
    // Zoomed in 18-yard box & goal
    ctx.strokeRect(w / 2 - 200, pad, 400, h - pad * 2);
    ctx.strokeRect(w / 2 - 90, pad, 180, 70);
    // Goal
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(w / 2 - 60, pad - 12, 120, 12);
    ctx.strokeRect(w / 2 - 60, pad - 12, 120, 12);
  }

  // Draw board objects
  boardObjects.forEach(obj => {
    drawBoardObject(obj);
  });
}

function drawBoardObject(obj) {
  if(!ctx) return;
  const { x, y, tool, text } = obj;

  if(tool === 'red') {
    ctx.fillStyle = '#e53935';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if(text) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, x, y + 3.5);
    }
  } else if(tool === 'blue') {
    ctx.fillStyle = '#1e88e5';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if(text) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, x, y + 3.5);
    }
  } else if(tool === 'yellow') {
    ctx.fillStyle = '#ffd600';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if(text) {
      ctx.fillStyle = '#111';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, x, y + 3.5);
    }
  } else if(tool === 'ball') {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if(tool === 'cone') {
    ctx.fillStyle = '#ff6d00';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y - 8);
    ctx.lineTo(x + 7, y + 7);
    ctx.lineTo(x - 7, y + 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if(tool === 'line' && obj.x2 !== undefined) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(obj.x2, obj.y2);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if(tool === 'arrow' && obj.x2 !== undefined) {
    ctx.strokeStyle = '#ffd600';
    ctx.fillStyle = '#ffd600';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(obj.x2, obj.y2);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(obj.y2 - y, obj.x2 - x);
    ctx.beginPath();
    ctx.moveTo(obj.x2, obj.y2);
    ctx.lineTo(obj.x2 - 12 * Math.cos(angle - Math.PI / 6), obj.y2 - 12 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(obj.x2 - 12 * Math.cos(angle + Math.PI / 6), obj.y2 - 12 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  } else if(tool === 'text') {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text || 'Zone', x, y);
  }
}

let lineDrawing = false;
let startX = 0, startY = 0;

function initCanvasEvents() {
  const c = $('pitch-canvas');
  if(!c) return;

  c.addEventListener('mousedown', e => {
    const rect = c.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if dragging existing object
    for(let i = boardObjects.length - 1; i >= 0; i--) {
      const o = boardObjects[i];
      if(Math.hypot(o.x - x, o.y - y) < 16) {
        isDraggingObject = true;
        draggedObjectIndex = i;
        dragOffset = { x: o.x - x, y: o.y - y };
        return;
      }
    }

    if(currentBoardTool === 'line' || currentBoardTool === 'arrow') {
      lineDrawing = true;
      startX = x;
      startY = y;
    } else {
      let txt = '';
      if(currentBoardTool === 'red' || currentBoardTool === 'blue' || currentBoardTool === 'yellow') {
        const num = prompt('Player jersey number or role (optional):', '');
        txt = num || '';
      } else if(currentBoardTool === 'text') {
        txt = prompt('Enter tactical label text:', 'Press') || '';
      }

      boardHistory.push(JSON.stringify(boardObjects));
      boardObjects.push({ x, y, tool: currentBoardTool, text: txt });
      drawPitch();
    }
  });

  c.addEventListener('mousemove', e => {
    const rect = c.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if(isDraggingObject && draggedObjectIndex > -1) {
      boardObjects[draggedObjectIndex].x = x + dragOffset.x;
      boardObjects[draggedObjectIndex].y = y + dragOffset.y;
      drawPitch();
    } else if(lineDrawing) {
      drawPitch();
      ctx.strokeStyle = currentBoardTool === 'arrow' ? '#ffd600' : '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  });

  window.addEventListener('mouseup', e => {
    if(isDraggingObject) {
      isDraggingObject = false;
      draggedObjectIndex = -1;
    }
    if(lineDrawing && c) {
      const rect = c.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      lineDrawing = false;
      boardHistory.push(JSON.stringify(boardObjects));
      boardObjects.push({ x: startX, y: startY, x2: x, y2: y, tool: currentBoardTool });
      drawPitch();
    }
  });
}

function openDrillBoard(drillIdx) {
  currentEditingDrillIndex = drillIdx;
  const drill = currentEditingSession.drills[drillIdx];
  boardObjects = drill.boardObjects ? JSON.parse(JSON.stringify(drill.boardObjects)) : [];
  boardHistory = [];
  openM('m-drill-board');
  setTimeout(() => {
    initCanvasPitch();
    setBoardPitch('half');
    setBoardTool('red');
    drawPitch();
  }, 100);
}

function closeBoardSketcher() {
  closeM('m-drill-board');
}

function undoBoardObject() {
  if(boardHistory.length > 0) {
    boardObjects = JSON.parse(boardHistory.pop());
    drawPitch();
  }
}

function clearBoardObjects() {
  if(!confirm('Clear all tactical markers from this diagram?')) return;
  boardHistory.push(JSON.stringify(boardObjects));
  boardObjects = [];
  drawPitch();
}

function saveBoardToDrill() {
  if(!canvas || currentEditingDrillIndex === null || !currentEditingSession) return;
  const drill = currentEditingSession.drills[currentEditingDrillIndex];
  if(drill) {
    drill.diagram = canvas.toDataURL('image/png');
    drill.boardObjects = JSON.parse(JSON.stringify(boardObjects));
    renderDrillsList();
    closeBoardSketcher();
  }
}

function viewDrillDiagram(drillIndex) {
  if(!currentEditingSession || !currentEditingSession.drills[drillIndex]) return;
  const drill = currentEditingSession.drills[drillIndex];
  if(!drill.diagram) return;
  $('diag-view-img').src = drill.diagram;
  $('diag-view-title').textContent = drill.name || 'Tactical Drill Diagram';
  $('diag-view-subtitle').textContent = `Phase: ${drill.phase || 'General'} | Duration: ${drill.duration || 15}m`;
  $('diag-view-notes').textContent = drill.coachingPoints || drill.description || 'No coaching notes provided.';
  openM('m-drill-diagram-viewer');
}

// ══ Drill Library Modal ══
function openDrillLibraryModal() {
  renderDrillLibrary();
  openM('m-drill-library');
}

function renderDrillLibrary() {
  const container = $('dl-grid');
  if(!container) return;
  const search = ($('dl-search')?.value || '').toLowerCase().trim();
  const cat = $('dl-filter-cat')?.value || '';

  const filtered = DRILL_LIBRARY.filter(d => {
    if(cat && d.phase !== cat) return false;
    if(search && !d.name.toLowerCase().includes(search) && !d.description.toLowerCase().includes(search)) return false;
    return true;
  });

  container.innerHTML = filtered.map(d => `
    <div class="sp-card" style="padding: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span class="sp-badge sp-badge-tactical">${esc(d.phase)}</span>
        <span style="font-size: 12px; font-weight: 700; color: var(--g);">⏱️ ${d.duration} mins</span>
      </div>
      <div style="font-weight: 800; font-size: 14.5px; margin-bottom: 6px;">${esc(d.name)}</div>
      <div style="font-size: 12px; color: var(--mt); margin-bottom: 10px; line-height: 1.4;">${esc(d.description)}</div>
      <div style="font-size: 11px; color: var(--g); margin-bottom: 12px; font-weight: 600;">📐 ${esc(d.dimensions)} | 👥 ${esc(d.players)}</div>
      <button class="mok" style="width: 100%; padding: 6px 12px; font-size: 12px;" onclick="insertDrillFromLibrary('${d.id}')">＋ Insert into Session</button>
    </div>
  `).join('');
}

function insertDrillFromLibrary(drillId) {
  const d = DRILL_LIBRARY.find(item => item.id === drillId);
  if(!d || !currentEditingSession) return;
  currentEditingSession.drills = currentEditingSession.drills || [];
  currentEditingSession.drills.push(JSON.parse(JSON.stringify(d)));
  renderDrillsList();
  closeM('m-drill-library');
}

// ══ Presets Modal ══
function openTemplatePicker() {
  renderTemplatePicker();
  openM('m-template-picker');
}

function renderTemplatePicker() {
  const container = $('tp-presets-list');
  if(!container) return;

  container.innerHTML = SESSION_PRESETS.map(p => `
    <div class="sp-card" style="padding: 18px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span class="sp-badge sp-badge-tactical">${esc(p.category)}</span>
        <span style="font-size: 12px; font-weight: 700; color: var(--g);">⏱️ ${p.duration} mins</span>
      </div>
      <div style="font-weight: 800; font-size: 16px; margin-bottom: 8px;">${esc(p.title)}</div>
      <div style="font-size: 12px; color: var(--mt); margin-bottom: 14px; line-height: 1.4; white-space: pre-line;">${esc(p.objectives)}</div>
      <button class="mok" style="width: 100%; padding: 8px 14px; font-size: 13px; font-weight: 700;" onclick="openSessionWithPreset('${p.id}')">⚡ Load This Session</button>
    </div>
  `).join('');
}

function openSessionWithPreset(presetId) {
  const p = SESSION_PRESETS.find(item => item.id === presetId);
  if(!p) return;
  const today = new Date().toISOString().split('T')[0];
  const assignedTeamId = (currentStudioTeamId && currentStudioTeamId !== 'all') ? currentStudioTeamId : (teams[0] ? teams[0].id : '');

  currentEditingSession = {
    id: null,
    teamId: assignedTeamId,
    title: p.title,
    date: today,
    time: '17:30',
    venue: 'Training Ground',
    category: p.category,
    intensity: p.intensity,
    coach: '',
    objectives: p.objectives,
    equipment: p.equipment || [],
    drills: JSON.parse(JSON.stringify(p.drills || [])),
    attendance: {},
    debrief: { rating: '', status: 'scheduled', notes: '' }
  };

  sessionAttendanceState = {};
  closeM('m-template-picker');
  populateSessionEditorForm();
  openM('m-session-editor');
}

// ══ Printable Session Sheet ══
function openPrintModal(id) {
  const s = sessions.find(item => item.id === id);
  if(!s) return;
  currentPrintingSession = s;
  renderPrintableSheet(s);
  openM('m-session-print');
}

function printCurrentEditorSession() {
  if(!currentEditingSession) return;
  renderPrintableSheet(currentEditingSession);
  openM('m-session-print');
}

function renderPrintableSheet(s) {
  const container = $('sp-print-container');
  if(!container) return;

  const teamObj = Array.isArray(teams) ? teams.find(t => t.id === s.teamId) : null;
  const teamName = teamObj ? teamObj.name : 'PRO FOOTBALL SQUAD';
  const drills = s.drills || [];
  const totalDuration = drills.reduce((sum, d) => sum + (parseInt(d.duration) || 0), 0) || s.duration || 90;

  container.innerHTML = `
    <div style="border-bottom: 2px solid #1a5c1a; padding-bottom: 14px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <h1 style="margin: 0; font-size: 26px; color: #1a5c1a; text-transform: uppercase;">${esc(teamName)}</h1>
        <div style="font-size: 13px; color: #555; margin-top: 4px;">OFFICIAL TRAINING SESSION PLAN</div>
      </div>
      <div style="text-align: right; font-size: 13px; color: #333;">
        <div><strong>Date:</strong> ${formatSessionDate(s.date)} ${s.time ? 'at ' + s.time : ''}</div>
        <div><strong>Venue:</strong> ${esc(s.venue || 'Pitch 1')} | <strong>Coach:</strong> ${esc(s.coach || 'Lead Staff')}</div>
      </div>
    </div>

    <div style="margin-bottom: 16px; background: #f4fbf5; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #1a5c1a;">
      <div style="font-size: 18px; font-weight: 800; color: #111; margin-bottom: 4px;">${esc(s.title || 'Session Plan')}</div>
      <div style="font-size: 12.5px; color: #444; line-height: 1.5; white-space: pre-line;"><strong>Session Focus:</strong> ${esc(s.objectives || 'Tactical progression.')}</div>
      <div style="font-size: 12px; color: #1a5c1a; font-weight: 700; margin-top: 6px;">Total Duration: ${totalDuration} mins | Intensity: ${esc(s.intensity || 'Medium')}</div>
    </div>

    <h3 style="font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin: 20px 0 12px; color: #1a5c1a;">SESSION DRILLS & PROGRESSION</h3>
    ${drills.map((d, i) => `
      <div style="margin-bottom: 20px; page-break-inside: avoid; border: 1px solid #ddd; border-radius: 8px; padding: 14px;">
        <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 14px; margin-bottom: 6px;">
          <span>#${i + 1} [${esc(d.phase)}] ${esc(d.name)}</span>
          <span style="color: #1a5c1a;">${d.duration} mins</span>
        </div>
        <div style="font-size: 12px; color: #666; margin-bottom: 8px;"><strong>Dimensions:</strong> ${esc(d.dimensions || 'N/A')}</div>
        <div style="font-size: 12.5px; line-height: 1.4; color: #222; margin-bottom: 8px; white-space: pre-line;">${esc(d.description || '')}</div>
        ${d.coachingPoints ? `<div style="font-size: 12px; color: #1a5c1a; background: #f0f7f1; padding: 8px; border-radius: 6px;"><strong>Coaching Keys:</strong> ${esc(d.coachingPoints)}</div>` : ''}
        ${d.diagram ? `<div style="text-align: center; margin-top: 10px;"><img src="${d.diagram}" style="max-width: 100%; height: 260px; object-fit: contain; border-radius: 6px; border: 1px solid #ccc;"></div>` : ''}
      </div>
    `).join('')}
  `;
}

// ══ WhatsApp Sharing ══
function shareSessionWhatsApp(id) {
  const s = sessions.find(item => item.id === id);
  if(!s) return;
  const teamObj = Array.isArray(teams) ? teams.find(t => t.id === s.teamId) : null;
  const teamName = teamObj ? teamObj.name.toUpperCase() : 'FOOTBALL CLUB';
  const drills = s.drills || [];
  const totalMins = drills.reduce((sum, d) => sum + (parseInt(d.duration) || 0), 0) || s.duration || 90;

  const text = `⚽ *${teamName} — TRAINING SESSION*
📅 *Date:* ${formatSessionDate(s.date)} ${s.time ? 'at ' + s.time : ''}
📍 *Venue:* ${s.venue || 'Training Ground'}
🎯 *Focus:* ${s.title || 'Team Practice'}
⏱️ *Duration:* ${totalMins} mins (${s.intensity || 'Medium'} Intensity)

📋 *Objectives:*
${s.objectives || 'Team development and tactical preparation.'}

⏱️ *Session Timeline:*
${drills.map((d, i) => `${i + 1}. [${d.phase}] ${d.name} (${d.duration}m)`).join('\n')}

👥 *Please arrive 15 minutes before start time!*`;

  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');
}
