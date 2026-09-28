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

// Polyfill for CanvasRenderingContext2D.prototype.roundRect if missing in WebKit/Safari
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
    if (!radii) radii = 0;
    let r = typeof radii === 'number' ? radii : (Array.isArray(radii) ? (radii[0] || 0) : 0);
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

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

function getPhaseClass(phase) {
  const p = String(phase || '').toLowerCase();
  if(p.includes('warm')) return 'phase-warmup';
  if(p.includes('tech')) return 'phase-technical';
  if(p.includes('tact')) return 'phase-tactical';
  if(p.includes('ssg') || p.includes('small')) return 'phase-ssg';
  if(p.includes('match') || p.includes('game')) return 'phase-match';
  return 'phase-recovery';
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

// ══ Pro Drill Library with Authentic Tactical Pitch Setups ══
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
    pitchType: 'half',
    boardObjects: [
      { type: 'token', tool: 'cone_yellow', x: 260, y: 160, sequenceId: 1, showMeasurement: true },
      { type: 'token', tool: 'cone_yellow', x: 540, y: 160, sequenceId: 1, showMeasurement: true },
      { type: 'token', tool: 'cone_yellow', x: 540, y: 400, sequenceId: 1, showMeasurement: true },
      { type: 'token', tool: 'cone_yellow', x: 260, y: 400, sequenceId: 1, showMeasurement: true },
      { type: 'token', tool: 'red', x: 260, y: 280, label: '3' },
      { type: 'token', tool: 'red', x: 540, y: 280, label: '4' },
      { type: 'token', tool: 'red', x: 400, y: 160, label: '2' },
      { type: 'token', tool: 'red', x: 330, y: 400, label: '5' },
      { type: 'token', tool: 'red', x: 470, y: 400, label: '6' },
      { type: 'token', tool: 'blue', x: 370, y: 270, label: '9' },
      { type: 'token', tool: 'blue', x: 430, y: 290, label: '10' },
      { type: 'token', tool: 'ball', x: 416, y: 176 },
      { type: 'line', tool: 'pass', x1: 416, y1: 176, x2: 524, y2: 268, showMeasurement: true },
      { type: 'line', tool: 'run', x1: 385, y1: 270, x2: 480, y2: 260, showMeasurement: true }
    ],
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
    pitchType: 'half',
    boardObjects: [
      { type: 'token', tool: 'goal', x: 400, y: 80, scale: 0.8, rotation: 0 },
      { type: 'token', tool: 'marker_yellow', x: 400, y: 400, sequenceId: 1, showMeasurement: true },
      { type: 'token', tool: 'marker_yellow', x: 400, y: 270, sequenceId: 1, showMeasurement: true },
      { type: 'token', tool: 'marker_yellow', x: 280, y: 160, sequenceId: 1, showMeasurement: true },
      { type: 'token', tool: 'marker_yellow', x: 520, y: 160, sequenceId: 1, showMeasurement: true },
      { type: 'token', tool: 'red', x: 400, y: 418, label: 'A' },
      { type: 'token', tool: 'red', x: 400, y: 288, label: 'B' },
      { type: 'token', tool: 'red', x: 520, y: 178, label: 'C' },
      { type: 'token', tool: 'ball', x: 412, y: 406 },
      { type: 'line', tool: 'pass', x1: 412, y1: 406, x2: 404, y2: 304, showMeasurement: true },
      { type: 'line', tool: 'pass', x1: 392, y1: 288, x2: 380, y2: 350, showMeasurement: true },
      { type: 'line', tool: 'pass', x1: 380, y1: 350, x2: 504, y2: 172, showMeasurement: true },
      { type: 'line', tool: 'run', x1: 520, y1: 160, x2: 440, y2: 100, showMeasurement: true }
    ],
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
    pitchType: 'box',
    boardObjects: [
      { type: 'token', tool: 'goal', x: 400, y: 460, scale: 1.25, rotation: 180 },
      { type: 'token', tool: 'gk', x: 400, y: 435, label: 'GK' },
      { type: 'token', tool: 'mannequin', x: 310, y: 310 },
      { type: 'token', tool: 'mannequin', x: 490, y: 310 },
      { type: 'token', tool: 'cone_red', x: 310, y: 170, sequenceId: 1 },
      { type: 'token', tool: 'cone_red', x: 490, y: 170, sequenceId: 1 },
      { type: 'token', tool: 'red', x: 400, y: 150, label: '9' },
      { type: 'token', tool: 'ball', x: 414, y: 160 },
      { type: 'token', tool: 'blue', x: 400, y: 260, label: '4' },
      { type: 'line', tool: 'dribble', x1: 414, y1: 160, x2: 360, y2: 240, showMeasurement: true },
      { type: 'line', tool: 'pass', x1: 360, y1: 240, x2: 345, y2: 445, showMeasurement: true }
    ],
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
    pitchType: 'half',
    boardObjects: [
      { type: 'line', tool: 'zone', x1: 220, y1: 140, x2: 580, y2: 420, showMeasurement: true },
      { type: 'token', tool: 'cone_yellow', x: 220, y: 140, sequenceId: 1 },
      { type: 'token', tool: 'cone_yellow', x: 580, y: 140, sequenceId: 1 },
      { type: 'token', tool: 'cone_yellow', x: 580, y: 420, sequenceId: 1 },
      { type: 'token', tool: 'cone_yellow', x: 220, y: 420, sequenceId: 1 },
      { type: 'token', tool: 'red', x: 270, y: 210, label: '7' },
      { type: 'token', tool: 'red', x: 530, y: 210, label: '11' },
      { type: 'token', tool: 'red', x: 270, y: 350, label: '8' },
      { type: 'token', tool: 'red', x: 530, y: 350, label: '10' },
      { type: 'token', tool: 'blue', x: 350, y: 230, label: '4' },
      { type: 'token', tool: 'blue', x: 450, y: 230, label: '5' },
      { type: 'token', tool: 'blue', x: 350, y: 330, label: '2' },
      { type: 'token', tool: 'blue', x: 450, y: 330, label: '3' },
      { type: 'token', tool: 'yellow', x: 400, y: 155, label: 'N1' },
      { type: 'token', tool: 'yellow', x: 400, y: 280, label: 'N2' },
      { type: 'token', tool: 'yellow', x: 400, y: 405, label: 'N3' },
      { type: 'token', tool: 'ball', x: 282, y: 345 },
      { type: 'line', tool: 'pass', x1: 282, y1: 345, x2: 390, y2: 288, showMeasurement: true }
    ],
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
    pitchType: 'half',
    boardObjects: [
      { type: 'token', tool: 'goal', x: 400, y: 65, scale: 1.0, rotation: 0 },
      { type: 'token', tool: 'gk', x: 400, y: 80, label: '1' },
      { type: 'token', tool: 'goal', x: 260, y: 440, scale: 0.6, rotation: 180 },
      { type: 'token', tool: 'goal', x: 540, y: 440, scale: 0.6, rotation: 180 },
      { type: 'line', tool: 'zone', x1: 200, y1: 220, x2: 600, y2: 340, showMeasurement: true },
      { type: 'token', tool: 'red', x: 280, y: 150, label: '2' },
      { type: 'token', tool: 'red', x: 520, y: 150, label: '3' },
      { type: 'token', tool: 'red', x: 340, y: 190, label: '4' },
      { type: 'token', tool: 'red', x: 460, y: 190, label: '5' },
      { type: 'token', tool: 'red', x: 400, y: 240, label: '6' },
      { type: 'token', tool: 'red', x: 400, y: 310, label: '8' },
      { type: 'token', tool: 'blue', x: 380, y: 210, label: '9' },
      { type: 'token', tool: 'blue', x: 300, y: 220, label: '7' },
      { type: 'token', tool: 'blue', x: 500, y: 220, label: '11' },
      { type: 'token', tool: 'blue', x: 350, y: 280, label: '10' },
      { type: 'token', tool: 'blue', x: 450, y: 280, label: '8' },
      { type: 'token', tool: 'blue', x: 400, y: 360, label: '4' },
      { type: 'token', tool: 'ball', x: 350, y: 195 },
      { type: 'line', tool: 'lob', x1: 350, y1: 195, x2: 510, y2: 160, showMeasurement: true },
      { type: 'line', tool: 'run', x1: 495, y1: 215, x2: 515, y2: 175, showMeasurement: true }
    ],
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
    pitchType: 'half',
    boardObjects: [
      { type: 'token', tool: 'marker_yellow', x: 400, y: 220, sequenceId: 1 },
      { type: 'token', tool: 'marker_yellow', x: 460, y: 250, sequenceId: 1 },
      { type: 'token', tool: 'marker_yellow', x: 460, y: 310, sequenceId: 1 },
      { type: 'token', tool: 'marker_yellow', x: 400, y: 340, sequenceId: 1 },
      { type: 'token', tool: 'marker_yellow', x: 340, y: 310, sequenceId: 1 },
      { type: 'token', tool: 'marker_yellow', x: 340, y: 250, sequenceId: 1 },
      { type: 'token', tool: 'green', x: 400, y: 235, label: '1' },
      { type: 'token', tool: 'green', x: 445, y: 260, label: '2' },
      { type: 'token', tool: 'green', x: 445, y: 300, label: '3' },
      { type: 'token', tool: 'green', x: 400, y: 325, label: '4' },
      { type: 'token', tool: 'green', x: 355, y: 300, label: '5' },
      { type: 'token', tool: 'green', x: 355, y: 260, label: '6' },
      { type: 'token', tool: 'ladder', x: 230, y: 280, rotation: 90 },
      { type: 'token', tool: 'hurdle', x: 230, y: 200 },
      { type: 'token', tool: 'hurdle', x: 230, y: 230 },
      { type: 'token', tool: 'pole', x: 570, y: 200 },
      { type: 'token', tool: 'pole', x: 570, y: 240 }
    ],
    diagram: ''
  },
  {
    id: 'd_coerver_mastery',
    phase: 'Warm-Up',
    name: 'Wiel Coerver: 1,000-Touch Agility & Ball Mastery',
    duration: 15,
    dimensions: '15x15m Grid',
    players: 'All Players (Each with a Ball)',
    description: 'High-tempo footwork sequences inside the grid: toe taps, Brazilian sole rolls, inside-outside cuts, and scissors. On whistle, explode 5 yards into open space.',
    coachingPoints: '• Soft, rhythmic touches with both feet\n• Keep head up between touches to scan open space\n• Accelerate sharply after performing a move\n• Stay on balls of feet with knees bent',
    pitchType: 'grid',
    boardObjects: [
      { type: 'token', tool: 'cone_yellow', x: 200, y: 120, sequenceId: 1 },
      { type: 'token', tool: 'cone_yellow', x: 600, y: 120, sequenceId: 1 },
      { type: 'token', tool: 'cone_yellow', x: 600, y: 420, sequenceId: 1 },
      { type: 'token', tool: 'cone_yellow', x: 200, y: 420, sequenceId: 1 },
      { type: 'token', tool: 'blue', x: 280, y: 200, label: '7' },
      { type: 'token', tool: 'ball', x: 295, y: 200 },
      { type: 'token', tool: 'blue', x: 520, y: 200, label: '11' },
      { type: 'token', tool: 'ball', x: 535, y: 200 },
      { type: 'token', tool: 'blue', x: 320, y: 340, label: '8' },
      { type: 'token', tool: 'ball', x: 335, y: 340 },
      { type: 'token', tool: 'blue', x: 480, y: 340, label: '10' },
      { type: 'token', tool: 'ball', x: 495, y: 340 },
      { type: 'token', tool: 'red', x: 400, y: 260, label: '9' },
      { type: 'token', tool: 'ball', x: 415, y: 260 },
      { type: 'line', tool: 'dribble', x1: 295, y1: 200, x2: 360, y2: 170, showMeasurement: true },
      { type: 'line', tool: 'dribble', x1: 415, y1: 260, x2: 440, y2: 310, showMeasurement: true }
    ],
    diagram: ''
  },
  {
    id: 'd_coerver_1v1_gates',
    phase: 'Technical',
    name: 'Wiel Coerver: 1v1 Mirror Gate Attack & Dribble Battle',
    duration: 20,
    dimensions: '20x15m with 2 Target Gates',
    players: 'Pairs (1v1)',
    description: 'Attacker commits defender 1v1. Attacker must use a body feint, step-over, or change of direction to dribble through either the left or right cone gate. Defender mirrors on endline.',
    coachingPoints: '• Commit defender with positive forward dribble\n• Sell the fake with upper body movement\n• Sudden change of pace through gate\n• Defender stays low and patient',
    pitchType: 'half_horizontal',
    boardObjects: [
      { type: 'token', tool: 'cone_red', x: 180, y: 190, sequenceId: 1 },
      { type: 'token', tool: 'cone_red', x: 180, y: 230, sequenceId: 1 },
      { type: 'token', tool: 'cone_red', x: 180, y: 290, sequenceId: 1 },
      { type: 'token', tool: 'cone_red', x: 180, y: 330, sequenceId: 1 },
      { type: 'token', tool: 'blue', x: 460, y: 260, label: '9' },
      { type: 'token', tool: 'ball', x: 445, y: 260 },
      { type: 'token', tool: 'red', x: 260, y: 260, label: '4' },
      { type: 'line', tool: 'dribble', x1: 445, y1: 260, x2: 340, y2: 240, showMeasurement: true },
      { type: 'line', tool: 'run', x1: 340, y1: 240, x2: 180, y2: 210, showMeasurement: true }
    ],
    diagram: ''
  },
  {
    id: 'd_ajax_3v1_triangle',
    phase: 'Warm-Up',
    name: 'Ajax TIPS: 3v1 Triangle Passing & Quick Support Rondo',
    duration: 15,
    dimensions: '12x12m Grid',
    players: 'Squad in 4s (3v1)',
    description: '3 attackers form a dynamic passing triangle around 1 defender inside a small grid. 2 touches maximum. Attackers constantly adjust angles to offer left and right options.',
    coachingPoints: '• Never stay flat; create acute passing triangles\n• Receive on back foot to open passing angles\n• Defender presses on ball travel, not after touch\n• Instant transition on mistake',
    pitchType: 'grid',
    boardObjects: [
      { type: 'token', tool: 'cone_yellow', x: 250, y: 150, sequenceId: 1 },
      { type: 'token', tool: 'cone_yellow', x: 550, y: 150, sequenceId: 1 },
      { type: 'token', tool: 'cone_yellow', x: 550, y: 390, sequenceId: 1 },
      { type: 'token', tool: 'cone_yellow', x: 250, y: 390, sequenceId: 1 },
      { type: 'token', tool: 'blue', x: 400, y: 175, label: '6' },
      { type: 'token', tool: 'blue', x: 300, y: 345, label: '8' },
      { type: 'token', tool: 'blue', x: 500, y: 345, label: '10' },
      { type: 'token', tool: 'red', x: 400, y: 280, label: '9' },
      { type: 'token', tool: 'ball', x: 415, y: 185 },
      { type: 'line', tool: 'pass', x1: 415, y1: 185, x2: 485, y2: 335, showMeasurement: true },
      { type: 'line', tool: 'pass', x1: 485, y1: 345, x2: 315, y2: 345, showMeasurement: true }
    ],
    diagram: ''
  },
  {
    id: 'd_ajax_multi_gate',
    phase: 'SSG',
    name: 'Ajax Academy: 4v4 Multi-Goal Directional Transition Match',
    duration: 25,
    dimensions: '35x25m with 4 Corner Gates',
    players: '8 Players (4v4)',
    description: '4v4 game played to 4 corner mini-goals. Scoring in any goal counts as 1 point. Forces players to look up, switch play away from pressure, and exploit open spaces.',
    coachingPoints: '• Head up before receiving to spot open goal\n• Switch play quickly if one side is blocked\n• Immediate defensive transition to protect target gates\n• Width and depth in attack',
    pitchType: 'half',
    boardObjects: [
      { type: 'token', tool: 'goal', x: 220, y: 100, scale: 0.6, rotation: 0 },
      { type: 'token', tool: 'goal', x: 580, y: 100, scale: 0.6, rotation: 0 },
      { type: 'token', tool: 'goal', x: 220, y: 430, scale: 0.6, rotation: 180 },
      { type: 'token', tool: 'goal', x: 580, y: 430, scale: 0.6, rotation: 180 },
      { type: 'token', tool: 'blue', x: 300, y: 200, label: '2' },
      { type: 'token', tool: 'blue', x: 500, y: 200, label: '3' },
      { type: 'token', tool: 'blue', x: 340, y: 350, label: '7' },
      { type: 'token', tool: 'blue', x: 460, y: 350, label: '11' },
      { type: 'token', tool: 'red', x: 400, y: 180, label: '4' },
      { type: 'token', tool: 'red', x: 320, y: 270, label: '6' },
      { type: 'token', tool: 'red', x: 480, y: 270, label: '8' },
      { type: 'token', tool: 'red', x: 400, y: 370, label: '9' },
      { type: 'token', tool: 'ball', x: 415, y: 200 },
      { type: 'line', tool: 'pass', x1: 415, y1: 200, x2: 490, y2: 205, showMeasurement: true }
    ],
    diagram: ''
  },
  {
    id: 'd_bielsa_up_back_through',
    phase: 'Technical',
    name: 'Marcelo Bielsa: "Up-Back-Through" Penetration Circuit',
    duration: 20,
    dimensions: '35x25m Corridor with Goal',
    players: '8-10 Players in Waves',
    description: 'Player A plays up to B (#9 with back to goal). B sets back to advancing midfielder C. C plays diagonal through-ball to winger D sprinting in behind mannequins for a cross/finish.',
    coachingPoints: '• Up pass must be punched firmly into striker feet\n• Bounce pass (Back) must be cushioned into the path of midfielder\n• Through pass timed precisely with winger blindside sprint\n• Maximum speed of ball circulation',
    pitchType: 'half',
    boardObjects: [
      { type: 'token', tool: 'goal', x: 400, y: 60, scale: 1.1, rotation: 0 },
      { type: 'token', tool: 'gk', x: 400, y: 95, label: 'GK' },
      { type: 'token', tool: 'mannequin', x: 330, y: 210 },
      { type: 'token', tool: 'mannequin', x: 470, y: 210 },
      { type: 'token', tool: 'red', x: 400, y: 430, label: 'A' },
      { type: 'token', tool: 'ball', x: 400, y: 415 },
      { type: 'token', tool: 'red', x: 400, y: 260, label: 'B' },
      { type: 'token', tool: 'red', x: 320, y: 350, label: 'C' },
      { type: 'token', tool: 'red', x: 530, y: 290, label: 'D' },
      { type: 'line', tool: 'pass', x1: 400, y1: 415, x2: 400, y2: 280, showMeasurement: true },
      { type: 'line', tool: 'pass', x1: 395, y1: 275, x2: 335, y2: 340, showMeasurement: true },
      { type: 'line', tool: 'pass', x1: 335, y1: 340, x2: 490, y2: 170, showMeasurement: true },
      { type: 'line', tool: 'run', x1: 530, y1: 285, x2: 490, y2: 170, showMeasurement: true }
    ],
    diagram: ''
  },
  {
    id: 'd_ancelotti_crossing',
    phase: 'Technical',
    name: 'Carlo Ancelotti: Dynamic Wing Overlap & 3-Run Box Finishing',
    duration: 20,
    dimensions: 'Final Third with 1 Main Goal',
    players: 'Attackers, Fullbacks & Strikers + 2 GKs',
    description: 'Winger checks inside, drawing mannequin defender. Fullback overlaps on the outside and delivers early whipped or low driven cross. 3 Staggered box runners attack: Near Post, Central Penalty Spot, and Edge of Box Cutback.',
    coachingPoints: '• Fullback crosser looks up before striking\n• Run 1: Near post dart across front of defender to redirect\n• Run 2: Central striker attacks penalty spot with momentum\n• Run 3: Late arriving midfielder hovers for loose cutback\n• High clinical conversion rate on first-time finish',
    pitchType: 'half',
    boardObjects: [
      { type: 'token', tool: 'goal', x: 400, y: 60, scale: 1.2, rotation: 0 },
      { type: 'token', tool: 'gk', x: 400, y: 95, label: 'GK' },
      { type: 'token', tool: 'mannequin', x: 350, y: 160 },
      { type: 'token', tool: 'mannequin', x: 450, y: 160 },
      { type: 'token', tool: 'blue', x: 510, y: 260, label: '7' },
      { type: 'token', tool: 'ball', x: 524, y: 260 },
      { type: 'token', tool: 'blue', x: 570, y: 340, label: '2' },
      { type: 'token', tool: 'blue', x: 340, y: 180, label: '9' },
      { type: 'token', tool: 'blue', x: 400, y: 220, label: '10' },
      { type: 'token', tool: 'blue', x: 450, y: 280, label: '8' },
      { type: 'line', tool: 'pass', x1: 524, y1: 260, x2: 565, y2: 240, showMeasurement: true },
      { type: 'line', tool: 'run', x1: 570, y1: 330, x2: 565, y2: 235, showMeasurement: true },
      { type: 'line', tool: 'lob', x1: 565, y1: 235, x2: 380, y2: 120, showMeasurement: true }
    ],
    diagram: ''
  },
  {
    id: 'd_simeone_low_block',
    phase: 'Tactical',
    name: 'Diego Simeone: 8 vs 6 Low-Block Compactness & Slide',
    duration: 25,
    dimensions: 'Defensive Half Pitch',
    players: '8 Defenders vs 6 Attackers + 1 GK',
    description: 'Defending unit of 4 defenders and 4 midfielders stays ultra-compact (8-10m line distance). Attackers try to penetrate central half-spaces. Defenders slide in unison, force play wide, and clear to target mini-goals.',
    coachingPoints: '• Never allow passes between CB and FB\n• Midfield screen prevents passes to opponent #10\n• Side-on body shape ready to sprint back\n• Instant transition pass to target counter goals on turnover',
    pitchType: 'half',
    boardObjects: [
      { type: 'token', tool: 'goal', x: 400, y: 60, scale: 1.15, rotation: 0 },
      { type: 'token', tool: 'gk', x: 400, y: 95, label: 'GK' },
      { type: 'token', tool: 'blue', x: 250, y: 160, label: '2' },
      { type: 'token', tool: 'blue', x: 350, y: 140, label: '4' },
      { type: 'token', tool: 'blue', x: 450, y: 140, label: '5' },
      { type: 'token', tool: 'blue', x: 550, y: 160, label: '3' },
      { type: 'token', tool: 'blue', x: 270, y: 240, label: '7' },
      { type: 'token', tool: 'blue', x: 360, y: 220, label: '6' },
      { type: 'token', tool: 'blue', x: 440, y: 220, label: '8' },
      { type: 'token', tool: 'blue', x: 530, y: 240, label: '11' },
      { type: 'token', tool: 'red', x: 220, y: 310, label: '2' },
      { type: 'token', tool: 'red', x: 320, y: 300, label: '8' },
      { type: 'token', tool: 'red', x: 400, y: 270, label: '10' },
      { type: 'token', tool: 'red', x: 480, y: 300, label: '6' },
      { type: 'token', tool: 'red', x: 580, y: 310, label: '7' },
      { type: 'token', tool: 'red', x: 400, y: 180, label: '9' },
      { type: 'token', tool: 'ball', x: 415, y: 270 },
      { type: 'line', tool: 'pass', x1: 415, y1: 270, x2: 470, y2: 290, showMeasurement: true }
    ],
    diagram: ''
  },
  {
    id: 'd_dezerbi_buildup',
    phase: 'Tactical',
    name: 'Roberto De Zerbi: Baiting the Press from Goal Kicks',
    duration: 25,
    dimensions: 'Penalty Box & Build-up Zone',
    players: 'GK + 4 Defenders vs 4 Pressing Attackers',
    description: 'Goalkeeper puts sole on the ball to bait the opponent striker forward. Center-backs split deep on the 6-yard line. When striker commits, GK plays to CB or dropping pivot to break the first pressing line vertically.',
    coachingPoints: '• High composure on the ball; invite the pressure\n• Wait until the defender is 1 yard away before releasing pass\n• Pivot drops at an angle, never directly behind striker\n• Third-man pass out of the pressing trap',
    pitchType: 'box',
    boardObjects: [
      { type: 'token', tool: 'goal', x: 400, y: 60, scale: 1.25, rotation: 0 },
      { type: 'token', tool: 'gk', x: 400, y: 110, label: 'GK' },
      { type: 'token', tool: 'ball', x: 416, y: 115 },
      { type: 'token', tool: 'blue', x: 270, y: 160, label: '4' },
      { type: 'token', tool: 'blue', x: 530, y: 160, label: '5' },
      { type: 'token', tool: 'blue', x: 190, y: 280, label: '2' },
      { type: 'token', tool: 'blue', x: 610, y: 280, label: '3' },
      { type: 'token', tool: 'blue', x: 400, y: 230, label: '6' },
      { type: 'token', tool: 'red', x: 370, y: 155, label: '9' },
      { type: 'token', tool: 'red', x: 430, y: 155, label: '10' },
      { type: 'token', tool: 'red', x: 300, y: 240, label: '7' },
      { type: 'token', tool: 'red', x: 500, y: 240, label: '11' },
      { type: 'line', tool: 'pass', x1: 416, y1: 115, x2: 285, y2: 155, showMeasurement: true },
      { type: 'line', tool: 'run', x1: 370, y1: 155, x2: 295, y2: 150, showMeasurement: true }
    ],
    diagram: ''
  },
  {
    id: 'd_11v11_phase',
    phase: 'Match Play',
    name: '11v11 Half-Pitch Tactical Phase Play',
    duration: 20,
    dimensions: 'Full Half-Pitch',
    players: 'Full Squad + 2 GKs',
    description: 'Attacking XI builds out from goalkeeper against defensive compact block. Attackers focus on breaking lines through half-spaces and overlapping full-backs. Defending XI counters into target mini-goals.',
    coachingPoints: '• Positional discipline and spacing\n• Overlaps and underlaps from full-backs\n• Defensive low-block sliding and compactness\n• Communication across defensive back-line',
    pitchType: 'half',
    boardObjects: [
      { type: 'token', tool: 'goal', x: 400, y: 55, scale: 1.25, rotation: 0 },
      { type: 'token', tool: 'gk', x: 400, y: 90, label: 'GK' },
      { type: 'token', tool: 'blue', x: 260, y: 160, label: '2' },
      { type: 'token', tool: 'blue', x: 350, y: 150, label: '4' },
      { type: 'token', tool: 'blue', x: 450, y: 150, label: '5' },
      { type: 'token', tool: 'blue', x: 540, y: 160, label: '3' },
      { type: 'token', tool: 'blue', x: 340, y: 230, label: '6' },
      { type: 'token', tool: 'blue', x: 460, y: 230, label: '8' },
      { type: 'token', tool: 'red', x: 200, y: 340, label: '2' },
      { type: 'token', tool: 'red', x: 320, y: 380, label: '4' },
      { type: 'token', tool: 'red', x: 480, y: 380, label: '5' },
      { type: 'token', tool: 'red', x: 600, y: 340, label: '3' },
      { type: 'token', tool: 'red', x: 400, y: 320, label: '6' },
      { type: 'token', tool: 'red', x: 320, y: 270, label: '8' },
      { type: 'token', tool: 'red', x: 480, y: 270, label: '10' },
      { type: 'token', tool: 'red', x: 210, y: 220, label: '7' },
      { type: 'token', tool: 'red', x: 400, y: 200, label: '9' },
      { type: 'token', tool: 'red', x: 590, y: 220, label: '11' },
      { type: 'token', tool: 'ball', x: 415, y: 320 },
      { type: 'line', tool: 'pass', x1: 415, y1: 320, x2: 470, y2: 275, showMeasurement: true }
    ],
    diagram: ''
  }
];

function getLibDrill(id) {
  const found = DRILL_LIBRARY.find(d => d.id === id);
  return found ? JSON.parse(JSON.stringify(found)) : null;
}

// ══ Full Session Templates with Integrated Tactical Drills ══
const SESSION_PRESETS = [
  // ── U6–U9: Foundation Phase ──
  {
    id: 'preset_coerver_mastery',
    title: 'Wiel Coerver: 1v1 Ball Mastery & Mirror Gate Challenge',
    coach: 'Wiel Coerver',
    coachBadge: 'Wiel Coerver (Ball Mastery)',
    ageGroup: 'u6_u9',
    ageGroupLabel: '🟡 U6–U9 (Foundation)',
    category: 'Technical',
    intensity: 'Medium',
    duration: 60,
    objectives: '• Target 1,000 clean touches per player using sole, inside, and outside\n• Build 1v1 attacking confidence with step-overs, scissors, and body fakes\n• Quick decisions to exploit open gates with zero waiting in lines',
    equipment: ['balls', 'cones_orange', 'cones_yellow', 'bibs_yellow', 'bibs_blue', 'goals_mini', 'stopwatch'],
    drills: [
      getLibDrill('d_coerver_mastery'),
      getLibDrill('d_coerver_1v1_gates'),
      getLibDrill('d_ajax_multi_gate'),
      getLibDrill('d_cooldown_stretch')
    ].filter(Boolean)
  },
  {
    id: 'preset_ajax_foundation',
    title: 'Ajax Academy: TIPS Foundation Passing & 3v3 Tournament',
    coach: 'Ajax Amsterdam Academy',
    coachBadge: 'Ajax Academy (TIPS)',
    ageGroup: 'u6_u9',
    ageGroupLabel: '🟡 U6–U9 (Foundation)',
    category: 'Technical',
    intensity: 'Medium',
    duration: 60,
    objectives: '• Develop Ajax TIPS core: Technique, Intelligence, Personality, Speed\n• Foster spontaneous passing triangles without rigid positions\n• Immediate reaction to win the ball back on turnover with high energy',
    equipment: ['balls', 'cones_orange', 'cones_yellow', 'bibs_yellow', 'bibs_blue', 'goals_mini', 'stopwatch'],
    drills: [
      getLibDrill('d_ajax_3v1_triangle'),
      getLibDrill('d_coerver_1v1_gates'),
      getLibDrill('d_ajax_multi_gate'),
      getLibDrill('d_cooldown_stretch')
    ].filter(Boolean)
  },

  // ── U10–U12: Youth Development Phase ──
  {
    id: 'preset_guardiola_possession',
    title: 'Pep Guardiola: Positional Rondo & 3rd Man Combination',
    coach: 'Pep Guardiola',
    coachBadge: 'Pep Guardiola (Positional Play)',
    ageGroup: 'u10_u12',
    ageGroupLabel: '🟢 U10–U12 (Youth)',
    category: 'Tactical',
    intensity: 'High',
    duration: 75,
    objectives: '• Master passing triangles, open body shape, and receiving on the back foot\n• Exploit third-man runs to penetrate packed midfield lines\n• Instant 3-second counter-press trigger on ball loss',
    equipment: ['balls', 'cones_orange', 'cones_yellow', 'bibs_yellow', 'bibs_blue', 'bibs_red', 'goals_mini', 'stopwatch', 'board'],
    drills: [
      getLibDrill('d_rondo_5v2'),
      getLibDrill('d_y_passing'),
      getLibDrill('d_4v4_3_possession'),
      getLibDrill('d_cooldown_stretch')
    ].filter(Boolean)
  },
  {
    id: 'preset_klopp_reaction',
    title: 'Jürgen Klopp: 5-Second Reaction & Gegenpress Hunt',
    coach: 'Jürgen Klopp',
    coachBadge: 'Jürgen Klopp (Gegenpressing)',
    ageGroup: 'u10_u12',
    ageGroupLabel: '🟢 U10–U12 (Youth)',
    category: 'Tactical',
    intensity: 'High',
    duration: 75,
    objectives: '• Immediate reflex hunt upon losing possession ("Gegenpressing")\n• Cut off central exit channels by pressing in tight pairs\n• Direct vertical attack: shoot within 5 seconds of regaining possession',
    equipment: ['balls', 'cones_orange', 'cones_yellow', 'bibs_yellow', 'bibs_blue', 'goals_mini', 'hurdles', 'stopwatch'],
    drills: [
      getLibDrill('d_rondo_5v2'),
      getLibDrill('d_1v1_finishing'),
      getLibDrill('d_high_press_ssg'),
      getLibDrill('d_cooldown_stretch')
    ].filter(Boolean)
  },
  {
    id: 'preset_bielsa_passing',
    title: 'Marcelo Bielsa: Rapid "Up-Back-Through" Penetration',
    coach: 'Marcelo Bielsa',
    coachBadge: 'Marcelo Bielsa (Rotational Play)',
    ageGroup: 'u10_u12',
    ageGroupLabel: '🟢 U10–U12 (Youth)',
    category: 'Technical',
    intensity: 'High',
    duration: 75,
    objectives: '• Relentless off-the-ball movement and high-velocity passing\n• Rehearse classic Up-Back-Through combinations to bypass pressing lines\n• Dynamic blindside runs behind defensive lines with clinical near-post finishes',
    equipment: ['balls', 'cones_orange', 'cones_yellow', 'bibs_yellow', 'bibs_blue', 'mannequins', 'goals_mini', 'stopwatch'],
    drills: [
      getLibDrill('d_y_passing'),
      getLibDrill('d_bielsa_up_back_through'),
      getLibDrill('d_1v1_finishing'),
      getLibDrill('d_cooldown_stretch')
    ].filter(Boolean)
  },

  // ── U13–U15: Intermediate & Tactical Specialization ──
  {
    id: 'preset_guardiola_juego',
    title: 'Pep Guardiola: Juego de Posición & Half-Space Penetration',
    coach: 'Pep Guardiola',
    coachBadge: 'Pep Guardiola (Positional Play)',
    ageGroup: 'u13_u15',
    ageGroupLabel: '🔵 U13–U15 (Development)',
    category: 'Tactical',
    intensity: 'High',
    duration: 90,
    objectives: '• Master 5 vertical corridor structure, prioritizing left and right half-spaces\n• Pin opposition fullbacks to create 1v1 isolation overloads for wide wingers\n• Fluid rotational interchanges between #8 and #10 attacking midfielders',
    equipment: ['balls', 'cones_orange', 'cones_yellow', 'bibs_yellow', 'bibs_blue', 'bibs_red', 'goals_mini', 'stopwatch', 'board'],
    drills: [
      getLibDrill('d_rondo_5v2'),
      getLibDrill('d_y_passing'),
      getLibDrill('d_4v4_3_possession'),
      getLibDrill('d_high_press_ssg'),
      getLibDrill('d_cooldown_stretch')
    ].filter(Boolean)
  },
  {
    id: 'preset_ancelotti_crossing',
    title: 'Carlo Ancelotti: Direct Wing Overlaps & 3-Run Box Finishing',
    coach: 'Carlo Ancelotti',
    coachBadge: 'Carlo Ancelotti (Clinical Finishing)',
    ageGroup: 'u13_u15',
    ageGroupLabel: '🔵 U13–U15 (Development)',
    category: 'Technical',
    intensity: 'High',
    duration: 90,
    objectives: '• Deliver early whipped and low driven crosses into prime danger zones\n• Coordinate 3 staggered box runs: Near Post dart, Penalty Spot arrival, Edge of Box cutback\n• High clinical conversion rate on first-time finishes under pressure',
    equipment: ['balls', 'cones_orange', 'cones_yellow', 'bibs_yellow', 'bibs_blue', 'mannequins', 'stopwatch', 'board'],
    drills: [
      getLibDrill('d_y_passing'),
      getLibDrill('d_ancelotti_crossing'),
      getLibDrill('d_1v1_finishing'),
      getLibDrill('d_high_press_ssg'),
      getLibDrill('d_cooldown_stretch')
    ].filter(Boolean)
  },

  // ── U16+ & Senior: High Performance / Match Strategy ──
  {
    id: 'preset_klopp_heavy_metal',
    title: 'Jürgen Klopp: Heavy Metal High Press & 4-Second Vertical Counter',
    coach: 'Jürgen Klopp',
    coachBadge: 'Jürgen Klopp (Gegenpressing)',
    ageGroup: 'u16_plus',
    ageGroupLabel: '🟣 U16+ (Senior / Elite)',
    category: 'Tactical',
    intensity: 'High',
    duration: 90,
    objectives: '• Trap opponent build-up against the touchline with 3-man aggressive pressing units\n• Exploit pressing triggers: back-passes, heavy touches, lofted balls\n• Rapid 4-second vertical counter-attack to score before defense recovers shape',
    equipment: ['balls', 'cones_orange', 'cones_yellow', 'bibs_yellow', 'bibs_blue', 'goals_mini', 'stopwatch', 'board'],
    drills: [
      getLibDrill('d_rondo_5v2'),
      getLibDrill('d_bielsa_up_back_through'),
      getLibDrill('d_4v4_3_possession'),
      getLibDrill('d_high_press_ssg'),
      getLibDrill('d_cooldown_stretch')
    ].filter(Boolean)
  },
  {
    id: 'preset_simeone_low_block',
    title: 'Diego Simeone: Low-Block Compactness & Central Denial',
    coach: 'Diego Simeone',
    coachBadge: 'Diego Simeone (Low Block Defense)',
    ageGroup: 'u16_plus',
    ageGroupLabel: '🟣 U16+ (Senior / Elite)',
    category: 'Tactical',
    intensity: 'High',
    duration: 90,
    objectives: '• Maintain compact 8-10m unit distance between back-4 and midfield-4\n• Deny central pocket access and force opponent into low-percentage wide crosses\n• Secure second balls and execute instant counter-attacking transition into open wings',
    equipment: ['balls', 'cones_orange', 'cones_yellow', 'bibs_yellow', 'bibs_blue', 'goals_mini', 'stopwatch', 'board'],
    drills: [
      getLibDrill('d_rondo_5v2'),
      getLibDrill('d_simeone_low_block'),
      getLibDrill('d_1v1_finishing'),
      getLibDrill('d_high_press_ssg'),
      getLibDrill('d_cooldown_stretch')
    ].filter(Boolean)
  },
  {
    id: 'preset_dezerbi_buildup',
    title: 'Roberto De Zerbi: Baiting the Press & Progressive GK Build-Up',
    coach: 'Roberto De Zerbi',
    coachBadge: 'Roberto De Zerbi (Build-Up Play)',
    ageGroup: 'u16_plus',
    ageGroupLabel: '🟣 U16+ (Senior / Elite)',
    category: 'Tactical',
    intensity: 'High',
    duration: 90,
    objectives: '• Goalkeeper and CBs invite opponent first pressing line deep into our defensive box\n• Use sole on the ball to pause tempo and commit opponent strikers\n• Penetrate vertically through dropping pivot to release wide attacking runners',
    equipment: ['balls', 'cones_orange', 'cones_yellow', 'bibs_yellow', 'bibs_blue', 'goals_mini', 'stopwatch', 'board'],
    drills: [
      getLibDrill('d_y_passing'),
      getLibDrill('d_dezerbi_buildup'),
      getLibDrill('d_4v4_3_possession'),
      getLibDrill('d_11v11_phase'),
      getLibDrill('d_cooldown_stretch')
    ].filter(Boolean)
  }
];

// Legacy ID aliases for backwards compatibility with any previously saved sessions
SESSION_PRESETS.find(p => p.id === 'preset_klopp_heavy_metal') && (SESSION_PRESETS.push({ ...SESSION_PRESETS.find(p => p.id === 'preset_klopp_heavy_metal'), id: 'preset_high_press_433' }));
SESSION_PRESETS.find(p => p.id === 'preset_guardiola_possession') && (SESSION_PRESETS.push({ ...SESSION_PRESETS.find(p => p.id === 'preset_guardiola_possession'), id: 'preset_tikitaka_possession' }));
SESSION_PRESETS.find(p => p.id === 'preset_ancelotti_crossing') && (SESSION_PRESETS.push({ ...SESSION_PRESETS.find(p => p.id === 'preset_ancelotti_crossing'), id: 'preset_finishing_transitions' }));


// ══ Studio State ══
let teams = [];
let allSystemPlayers = [];
let players = [];
let sessions = [];
let sessionsUnsub = null;
let currentStudioTeamId = 'all';

let currentEditingSession = null;
let sessionAttendanceState = {};
let currentViewingDiagram = null;
let currentPrintingSession = null;

// ══ Initialization ══
const _spInit = async () => {
  loadBranding();
  initCanvasPitch();
  initCanvasEvents();
  if (typeof initDrillLibraryDiagrams === 'function') initDrillLibraryDiagrams();

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
};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', _spInit);
} else {
  _spInit();
}

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

  // Load from local storage cache for instant rendering (aggregate all team keys)
  try {
    let allCached = [];
    const directCached = localStorage.getItem(cacheKey);
    if(directCached) {
      try { allCached = JSON.parse(directCached) || []; } catch(e){}
    }
    // Also scan all fhq_sessions_* keys in localStorage to aggregate sessions
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('fhq_sessions_') && k !== cacheKey) {
        try {
          const items = JSON.parse(localStorage.getItem(k));
          if (Array.isArray(items)) {
            items.forEach(it => {
              if (it && it.id && !allCached.some(x => x.id === it.id)) {
                if (!isSpecific || it.teamId === tid) {
                  allCached.push(it);
                }
              }
            });
          }
        } catch(e){}
      }
    }
    if (allCached.length > 0) {
      sessions = allCached.sort((a, b) => (String(b.date || '') + String(b.time || '')).localeCompare(String(a.date || '') + String(a.time || '')));
      sessions.forEach(s => {
        (s.drills || []).forEach(d => { if(typeof ensureDrillDiagram === 'function') ensureDrillDiagram(d); });
      });
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
        sessions.forEach(s => {
          (s.drills || []).forEach(d => { if(typeof ensureDrillDiagram === 'function') ensureDrillDiagram(d); });
        });
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
    if(typeof ensureDrillDiagram === 'function') ensureDrillDiagram(d);

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
            <button type="button" class="obtn" style="padding: 3px 8px; font-size: 11px;" onclick="openDrillBoard(${index})">✏️ Edit</button>
            <button type="button" class="mc" style="padding: 3px 6px; font-size: 11px; color: #d32f2f;" onclick="removeDrillDiagram(${index})">✕</button>
          </div>
        ` : `
          <div style="margin-top: 10px; display: flex; align-items: center; gap: 10px; background: var(--card2); border: 1px dashed var(--bd); border-radius: 8px; padding: 6px 10px;">
            <div style="font-size: 18px;">🎨</div>
            <div style="font-size: 11.5px; color: var(--mt); flex: 1;">No tactical pitch diagram attached.</div>
            <button type="button" class="mok" style="padding: 4px 10px; font-size: 11.5px;" onclick="openDrillBoard(${index})">🎨 Draw Pitch Diagram</button>
          </div>
        `}
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
  delete currentEditingSession.drills[index].boardObjects;
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
let currentBoardTool = 'red';
let boardPitchType = 'half';
let boardObjects = [];
let boardHistory = [];
let currentEditingDrillIndex = null;
let currentViewingDrillIdx = null;

let isDraggingObject = false;
let draggedObjectIndex = -1;
let dragOffset = { x: 0, y: 0 };
let hasMovedWhileDragging = false;

let isDrawingLine = false;
let lineStart = null;
let currentCursorCoords = null;

let isRulerEnabled = true;
let isDistancingActive = true;
let currentEquipmentSequenceId = 1;
let currentGoalRotation = 0;
let initialDrillBoardSnapshot = null;

const ALL_BOARD_TOOLS = [
  'select',
  'red', 'black', 'blue', 'yellow', 'green', 'gk', 'ball',
  'cone_yellow', 'cone_red', 'marker_yellow', 'marker_red',
  'mannequin', 'hurdle', 'ladder', 'pole', 'goal',
  'pass', 'lob', 'run', 'dribble', 'zone', 'ruler', 'eraser'
];

function toggleRulerMeasurement() {
  isRulerEnabled = !isRulerEnabled;
  const btn = $('btn-toggle-ruler');
  const txt = $('ruler-toggle-status');
  if(btn && txt) {
    if(isRulerEnabled) {
      btn.classList.add('active');
      btn.style.background = '#1b5e20';
      btn.style.color = '#ffffff';
      btn.style.borderColor = '#43a047';
      txt.textContent = 'ON';
    } else {
      btn.classList.remove('active');
      btn.style.background = '#fff';
      btn.style.color = 'var(--tx)';
      btn.style.borderColor = 'var(--bd)';
      txt.textContent = 'OFF';
    }
  }
  redrawCanvas();
}

function getPixelsPerYard(pitchType) {
  const t = pitchType || boardPitchType || 'half';
  switch(t) {
    case 'half': return 8.0;              // 440px / 55 yds
    case 'half_horizontal': return 10.0;  // 550px / 55 yds
    case 'full': return 6.38;             // 670px / 105 yds
    case 'box': return 12.0;              // 420px / 35 yds
    case 'grid': return 12.0;             // 540px / 45 yds
    case 'plain': return 12.4;            // 620px / 50 yds
    default: return 8.0;
  }
}

function pxToYds(px, pitchType) {
  const scale = getPixelsPerYard(pitchType);
  return Math.max(1, Math.round(px / scale));
}

function openDrillBoard(drillIdx) {
  currentEditingDrillIndex = drillIdx;
  if(!currentEditingSession || !currentEditingSession.drills) return;
  const drill = currentEditingSession.drills[drillIdx];
  boardObjects = drill && drill.boardObjects ? JSON.parse(JSON.stringify(drill.boardObjects)) : [];
  initialDrillBoardSnapshot = JSON.stringify(boardObjects);
  boardHistory = [];
  currentBoardTool = 'red';
  currentEquipmentSequenceId = 1;
  isDistancingActive = true;
  isDraggingObject = false;
  draggedObjectIndex = -1;
  boardPitchType = (drill && drill.pitchType) || 'half';
  if($('board-pitch-type')) $('board-pitch-type').value = boardPitchType;
  setBoardTool('red');

  openM('m-drill-board');
  setTimeout(() => {
    initCanvasPitch();
    redrawCanvas();
  }, 100);
}

function setBoardTool(tool) {
  if(tool !== currentBoardTool) {
    currentEquipmentSequenceId++;
  }
  currentBoardTool = tool;
  isDistancingActive = true;
  ALL_BOARD_TOOLS.forEach(t => {
    const btn = $('tool-' + t);
    if(btn) btn.classList.toggle('active', t === tool);
  });

  const c = $('sp-canvas');
  if(c) {
    if(tool === 'select') c.style.cursor = 'grab';
    else if(tool === 'eraser' || tool === 'ruler') c.style.cursor = 'crosshair';
    else c.style.cursor = 'default';
  }
  redrawCanvas();
}

function changePitchBackground(type) {
  boardPitchType = type;
  redrawCanvas();
}

function getGoalControlLayout(goalObj) {
  const scale = goalObj.scale || 1.0;
  const gd = 24 * scale;
  const pillDist = Math.max(gd + 16, 28);
  const cx = goalObj.x;
  const cy = (goalObj.y - pillDist < 26) ? (goalObj.y + pillDist) : (goalObj.y - pillDist);
  return {
    cx,
    cy,
    minus: { x: cx - 26, y: cy, r: 10 },
    rotate: { x: cx, y: cy, r: 10 },
    plus: { x: cx + 26, y: cy, r: 10 }
  };
}

function findGoalControlButtonAtCoords(x, y) {
  if(currentBoardTool !== 'goal') return null;
  for(let i = boardObjects.length - 1; i >= 0; i--) {
    const o = boardObjects[i];
    if(o.type === 'token' && o.tool === 'goal') {
      const ctrl = getGoalControlLayout(o);
      if(Math.hypot(x - ctrl.minus.x, y - ctrl.minus.y) <= 12) return { goalIndex: i, action: 'minus' };
      if(Math.hypot(x - ctrl.rotate.x, y - ctrl.rotate.y) <= 12) return { goalIndex: i, action: 'rotate' };
      if(Math.hypot(x - ctrl.plus.x, y - ctrl.plus.y) <= 12) return { goalIndex: i, action: 'plus' };
    }
  }
  return null;
}

function findObjectAtCoords(x, y, filterTool = null) {
  for(let i = boardObjects.length - 1; i >= 0; i--) {
    const o = boardObjects[i];
    if(o.type === 'token') {
      if(filterTool && filterTool !== 'select' && filterTool !== 'eraser') {
        const isMatchingTool = (o.tool === filterTool) || (filterTool === 'cone_red' && o.tool === 'cone') || (filterTool === 'cone' && o.tool === 'cone_red');
        if(!isMatchingTool) continue;
      }

      let r = 18;
      if(o.tool === 'goal') r = Math.max(34, 38 * (o.scale || 1.0));
      else if(o.tool === 'ladder') r = 32;
      else if(o.tool === 'mannequin' || o.tool === 'hurdle') r = 22;
      else if(o.tool === 'cone_yellow' || o.tool === 'cone_red' || o.tool === 'cone') r = 16;
      else if(o.tool === 'marker_yellow' || o.tool === 'marker_red') r = 14;
      else if(o.tool === 'pole') r = 16;
      else if(o.tool === 'ball') r = 14;
      if(Math.hypot(x - o.x, y - o.y) <= r) return i;
    } else if(o.type === 'line') {
      if(filterTool && filterTool !== 'select' && filterTool !== 'eraser' && filterTool !== o.tool) {
        continue;
      }

      if(o.tool === 'zone') {
        const rx = Math.min(o.x1, o.x2);
        const ry = Math.min(o.y1, o.y2);
        const rw = Math.abs(o.x2 - o.x1);
        const rh = Math.abs(o.y2 - o.y1);
        const topDist = Math.abs(y - ry);
        const bottomDist = Math.abs(y - (ry + rh));
        const leftDist = Math.abs(x - rx);
        const rightDist = Math.abs(x - (rx + rw));
        const inXBounds = (x >= rx - 8) && (x <= rx + rw + 8);
        const inYBounds = (y >= ry - 8) && (y <= ry + rh + 8);
        const onEdge = (inXBounds && (topDist <= 12 || bottomDist <= 12)) || (inYBounds && (leftDist <= 12 || rightDist <= 12));
        if(onEdge) return i;
      } else {
        const dist = distToSegment({x, y}, {x: o.x1, y: o.y1}, {x: o.x2, y: o.y2});
        if(dist <= 15) return i;
      }
    }
  }
  return -1;
}

function distToSegment(p, v, w) {
  const l2 = (v.x - w.x)*(v.x - w.x) + (v.y - w.y)*(v.y - w.y);
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

function drawYardBadge(ctx, x, y, text, textColor = '#ffffff', bgColor = 'rgba(10, 30, 20, 0.92)') {
  ctx.save();
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const textWidth = ctx.measureText(text).width;
  const paddingX = 7;
  const bw = textWidth + paddingX * 2;
  const bh = 18;
  const bx = x - bw / 2;
  const by = y - bh / 2;

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 5);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawAlignedSegmentYardBadge(ctx, x1, y1, x2, y2, text, offsetDistance = 16, textColor = '#ffffff', bgColor = 'rgba(10, 30, 20, 0.94)') {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if(dist < 5) return;

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const angle = Math.atan2(dy, dx);

  let textAngle = angle;
  if(textAngle > Math.PI / 2) {
    textAngle -= Math.PI;
  } else if(textAngle < -Math.PI / 2) {
    textAngle += Math.PI;
  }

  const nx = -Math.sin(textAngle);
  const ny = Math.cos(textAngle);

  let effectiveOffset = -Math.abs(offsetDistance);
  const targetY = midY + ny * effectiveOffset;
  if(targetY < 18) {
    effectiveOffset = Math.abs(offsetDistance);
  }

  const badgeX = midX + nx * effectiveOffset;
  const badgeY = midY + ny * effectiveOffset;

  ctx.save();
  ctx.translate(badgeX, badgeY);
  ctx.rotate(textAngle);

  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const textWidth = ctx.measureText(text).width;
  const paddingX = 7;
  const bw = textWidth + paddingX * 2;
  const bh = 18;
  const bx = -bw / 2;
  const by = -bh / 2;

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 5);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);

  ctx.restore();
}

function drawPitchScaleBar(ctx, w, h, pitchType) {
  if(!isRulerEnabled) return;
  ctx.save();
  const scaleBarYards = (pitchType === 'full' || pitchType === 'half' || pitchType === 'half_horizontal') ? 20 : 10;
  const barLengthPx = scaleBarYards * getPixelsPerYard(pitchType);
  const startX = 32;
  const startY = h - 14;
  const endX = startX + barLengthPx;

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, startY);
  ctx.moveTo(startX, startY - 4);
  ctx.lineTo(startX, startY + 4);
  const midX = startX + barLengthPx / 2;
  ctx.moveTo(midX, startY - 3);
  ctx.lineTo(midX, startY + 3);
  ctx.moveTo(endX, startY - 4);
  ctx.lineTo(endX, startY + 4);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`📏 SCALE: 0`, startX - 2, startY - 6);
  ctx.textAlign = 'right';
  ctx.fillText(`${scaleBarYards} yds`, endX + 4, startY - 6);

  ctx.restore();
}

function initCanvasPitch() {
  canvas = $('sp-canvas');
  if(!canvas) return;
  ctx = canvas.getContext('2d');
  initCanvasEvents();
  redrawCanvas();
}

function initCanvasEvents() {
  const c = $('sp-canvas');
  if(!c || c._eventsAttached) return;
  c._eventsAttached = true;

  const getCanvasCoords = (e) => {
    const rect = c.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = c.width / rect.width;
    const scaleY = c.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  c.ondblclick = (e) => {
    isDistancingActive = false;
    currentEquipmentSequenceId++;
    redrawCanvas();
  };

  c.onpointerdown = (e) => {
    const coords = getCanvasCoords(e);

    const goalCtrl = findGoalControlButtonAtCoords(coords.x, coords.y);
    if(goalCtrl) {
      boardHistory.push(JSON.parse(JSON.stringify(boardObjects)));
      const goalObj = boardObjects[goalCtrl.goalIndex];
      if(goalCtrl.action === 'minus') {
        goalObj.scale = Math.max(0.5, Math.round(((goalObj.scale || 1.0) - 0.2) * 100) / 100);
      } else if(goalCtrl.action === 'plus') {
        goalObj.scale = Math.min(2.5, Math.round(((goalObj.scale || 1.0) + 0.2) * 100) / 100);
      } else if(goalCtrl.action === 'rotate') {
        goalObj.rotation = ((goalObj.rotation || 0) + 90) % 360;
      }
      redrawCanvas();
      return;
    }

    if(currentBoardTool === 'eraser') {
      const hitIdx = findObjectAtCoords(coords.x, coords.y, 'eraser');
      if(hitIdx > -1) {
        boardHistory.push(JSON.parse(JSON.stringify(boardObjects)));
        boardObjects.splice(hitIdx, 1);
        redrawCanvas();
      }
      return;
    }

    if(currentBoardTool === 'select') {
      const hitIdx = findObjectAtCoords(coords.x, coords.y, 'select');
      if(hitIdx > -1) {
        isDraggingObject = true;
        draggedObjectIndex = hitIdx;
        hasMovedWhileDragging = false;
        const targetObj = boardObjects[hitIdx];
        dragOffset = {
          x: coords.x - (targetObj.x || targetObj.x1 || 0),
          y: coords.y - (targetObj.y || targetObj.y1 || 0)
        };
        c.style.cursor = 'grabbing';
        return;
      }
    }

    const sameToolHitIdx = findObjectAtCoords(coords.x, coords.y, currentBoardTool);
    if(sameToolHitIdx > -1) {
      isDraggingObject = true;
      draggedObjectIndex = sameToolHitIdx;
      hasMovedWhileDragging = false;
      const targetObj = boardObjects[sameToolHitIdx];
      dragOffset = {
        x: coords.x - (targetObj.x || targetObj.x1 || 0),
        y: coords.y - (targetObj.y || targetObj.y1 || 0)
      };
      c.style.cursor = 'grabbing';
      return;
    }

    const isLineTool = ['pass', 'lob', 'run', 'dribble', 'zone', 'ruler'].includes(currentBoardTool);

    if(isLineTool) {
      isDrawingLine = true;
      lineStart = coords;
    } else if(currentBoardTool !== 'select') {
      if(!isDistancingActive) {
        isDistancingActive = true;
        currentEquipmentSequenceId++;
      }

      boardHistory.push(JSON.parse(JSON.stringify(boardObjects)));
      const newObj = {
        type: 'token',
        tool: currentBoardTool,
        x: coords.x,
        y: coords.y,
        rotation: currentBoardTool === 'goal' ? currentGoalRotation : 0,
        scale: 1.0,
        label: getTokenDefaultLabel(currentBoardTool),
        showMeasurement: Boolean(isRulerEnabled),
        sequenceId: currentEquipmentSequenceId
      };
      boardObjects.push(newObj);
      redrawCanvas();
    }
  };

  c.onpointermove = (e) => {
    const coords = getCanvasCoords(e);
    currentCursorCoords = coords;

    if(isDraggingObject && draggedObjectIndex > -1 && boardObjects[draggedObjectIndex]) {
      hasMovedWhileDragging = true;
      const obj = boardObjects[draggedObjectIndex];
      if(obj.type === 'token') {
        obj.x = Math.max(15, Math.min(c.width - 15, coords.x - dragOffset.x));
        obj.y = Math.max(15, Math.min(c.height - 15, coords.y - dragOffset.y));
      }
      redrawCanvas();
      return;
    }

    if(isDrawingLine && lineStart) {
      redrawCanvas();
      drawSingleObject({
        type: 'line',
        tool: currentBoardTool,
        x1: lineStart.x,
        y1: lineStart.y,
        x2: coords.x,
        y2: coords.y,
        showMeasurement: (currentBoardTool === 'ruler') ? true : Boolean(isRulerEnabled)
      }, true);
    } else {
      redrawCanvas();
    }
  };

  c.onpointerleave = () => {
    currentCursorCoords = null;
    if(isDraggingObject) {
      isDraggingObject = false;
      draggedObjectIndex = -1;
    }
    redrawCanvas();
  };

  c.onpointerup = (e) => {
    if(isDraggingObject) {
      if(!hasMovedWhileDragging && draggedObjectIndex > -1 && boardObjects[draggedObjectIndex]) {
        const obj = boardObjects[draggedObjectIndex];
        if(obj.tool === 'goal') {
          boardHistory.push(JSON.parse(JSON.stringify(boardObjects)));
          obj.rotation = ((obj.rotation || 0) + 90) % 360;
        }
      }
      isDraggingObject = false;
      draggedObjectIndex = -1;
      c.style.cursor = currentBoardTool === 'select' ? 'grab' : 'default';
      redrawCanvas();
      return;
    }

    if(!isDrawingLine || !lineStart) return;
    const coords = getCanvasCoords(e);
    const dist = Math.hypot(coords.x - lineStart.x, coords.y - lineStart.y);
    if(dist > 8) {
      boardHistory.push(JSON.parse(JSON.stringify(boardObjects)));
      boardObjects.push({
        type: 'line',
        tool: currentBoardTool,
        x1: lineStart.x,
        y1: lineStart.y,
        x2: coords.x,
        y2: coords.y,
        showMeasurement: (currentBoardTool === 'ruler') ? true : Boolean(isRulerEnabled)
      });
    }
    isDrawingLine = false;
    lineStart = null;
    redrawCanvas();
  };
}

function getTokenDefaultLabel(tool) {
  if(tool === 'gk') return 'GK';
  if(tool === 'red' || tool === 'black' || tool === 'blue' || tool === 'yellow' || tool === 'green') {
    const count = boardObjects.filter(o => o.tool === tool).length + 1;
    return String(count);
  }
  return '';
}

function undoBoard() {
  if(boardHistory.length) {
    boardObjects = JSON.parse(boardHistory.pop());
    redrawCanvas();
  } else if(boardObjects.length) {
    boardObjects.pop();
    redrawCanvas();
  }
}

function clearBoardCanvas() {
  if(!confirm('Clear all tactical markings from this pitch sketch?')) return;
  boardHistory.push(JSON.stringify(boardObjects));
  boardObjects = [];
  redrawCanvas();
}

function redrawCanvas() {
  const c = $('sp-canvas');
  if(!c) return;
  const ctx = c.getContext('2d');
  const w = c.width;
  const h = c.height;

  drawFootballPitchBackground(ctx, w, h, boardPitchType);
  drawSameEquipmentDistances(ctx);
  boardObjects.forEach(obj => drawSingleObject(obj, false));
  drawPitchScaleBar(ctx, w, h, boardPitchType);

  const eqTools = ['ball', 'cone_yellow', 'cone_red', 'cone', 'marker_yellow', 'marker_red', 'mannequin', 'hurdle', 'ladder', 'pole'];
  if(currentCursorCoords && eqTools.includes(currentBoardTool) && !isDraggingObject) {
    drawLiveEquipmentPlacementGuide(ctx, currentCursorCoords, currentBoardTool);
  }
}

function drawSameEquipmentDistances(ctx, objectsList = null, pitchType = null) {
  const items = objectsList || boardObjects;
  const pType = pitchType || boardPitchType;
  const eqKeys = ['cone_yellow', 'cone_red', 'cone', 'marker_yellow', 'marker_red', 'hurdle', 'ladder', 'pole', 'mannequin'];

  eqKeys.forEach(k => {
    const allOfTool = items.filter(o => o.type === 'token' && (o.tool === k || (k === 'cone_red' && o.tool === 'cone')));
    const groups = {};
    allOfTool.forEach(o => {
      const sId = o.sequenceId || 1;
      if(!groups[sId]) groups[sId] = [];
      groups[sId].push(o);
    });

    Object.values(groups).forEach(list => {
      if(list.length >= 2) {
        ctx.save();
        for(let i = 0; i < list.length - 1; i++) {
          const p1 = list[i];
          const p2 = list[i + 1];
          if(p2.showMeasurement === true) {
            const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            if(dist >= 8) {
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.8;
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
              ctx.setLineDash([]);

              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(p1.x, p1.y, 3, 0, Math.PI * 2);
              ctx.arc(p2.x, p2.y, 3, 0, Math.PI * 2);
              ctx.fill();

              const yds = pxToYds(dist, pType);
              drawAlignedSegmentYardBadge(ctx, p1.x, p1.y, p2.x, p2.y, `${yds} yds`, 16, '#ffffff', 'rgba(10, 30, 20, 0.94)');
            }
          }
        }
        ctx.restore();
      }
    });
  });
}

function drawLiveEquipmentPlacementGuide(ctx, cursor, tool) {
  if(isRulerEnabled && isDistancingActive) {
    const currentSeqItems = boardObjects.filter(o => 
      o.type === 'token' && 
      (o.tool === tool || (tool === 'cone_red' && o.tool === 'cone')) && 
      (o.sequenceId === currentEquipmentSequenceId)
    );

    if(currentSeqItems.length > 0) {
      const lastPoint = currentSeqItems[currentSeqItems.length - 1];
      const dist = Math.hypot(cursor.x - lastPoint.x, cursor.y - lastPoint.y);

      if(dist >= 8 && dist <= 650) {
        ctx.save();
        const yds = pxToYds(dist, boardPitchType);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(cursor.x, cursor.y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 3.5, 0, Math.PI * 2);
        ctx.arc(cursor.x, cursor.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        drawAlignedSegmentYardBadge(ctx, lastPoint.x, lastPoint.y, cursor.x, cursor.y, `${yds} yds`, 16, '#ffffff', 'rgba(10, 30, 20, 0.94)');
        ctx.restore();
      }
    }
  }

  ctx.save();
  ctx.globalAlpha = 0.55;
  drawSingleObject({
    type: 'token',
    tool: tool,
    x: cursor.x,
    y: cursor.y,
    rotation: tool === 'goal' ? currentGoalRotation : 0,
    scale: 1.0,
    label: '',
    showMeasurement: false
  }, true);
  ctx.restore();
}

function drawFootballPitchBackground(ctx, w, h, type) {
  ctx.fillStyle = '#164327';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#1a4e2e';
  const stripeCount = 10;
  const stripeWidth = w / stripeCount;
  for(let i = 0; i < stripeCount; i += 2) {
    ctx.fillRect(i * stripeWidth, 0, stripeWidth, h);
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 2.5;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.setLineDash([]);

  const drawGoal = (x, y, gw, gh, direction) => {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillRect(x, y, gw, gh);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 1;
    if(gw > gh) {
      for(let gx = x + 10; gx < x + gw; gx += 10) {
        ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + gh); ctx.stroke();
      }
      for(let gy = y + 8; gy < y + gh; gy += 8) {
        ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + gw, gy); ctx.stroke();
      }
    } else {
      for(let gx = x + 8; gx < x + gw; gx += 8) {
        ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + gh); ctx.stroke();
      }
      for(let gy = y + 10; gy < y + gh; gy += 10) {
        ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + gw, gy); ctx.stroke();
      }
    }
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(x, y, gw, gh);

    ctx.fillStyle = '#ffffff';
    if(direction === 'top' || direction === 'bottom') {
      const lineY = direction === 'top' ? (y + gh) : y;
      ctx.beginPath(); ctx.arc(x, lineY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + gw, lineY, 4, 0, Math.PI * 2); ctx.fill();
    } else {
      const lineX = direction === 'left' ? (x + gw) : x;
      ctx.beginPath(); ctx.arc(lineX, y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(lineX, y + gh, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  const drawCornerArc = (cx, cy, startAngle, endAngle, radius = 18) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.stroke();
  };

  if(type === 'plain') {
    const pw = 640, ph = 440;
    const px = (w - pw) / 2, py = (h - ph) / 2;
    ctx.strokeRect(px, py, pw, ph);
    drawGoal(px - 26, h / 2 - 45, 26, 90, 'left');
    drawGoal(px + pw, h / 2 - 45, 26, 90, 'right');
    return;
  }

  if(type === 'grid') {
    const pw = 540, ph = 440;
    const px = (w - pw) / 2, py = (h - ph) / 2;
    ctx.strokeRect(px, py, pw, ph);

    drawGoal(w / 2 - 45, py - 22, 90, 22, 'top');
    drawGoal(w / 2 - 45, py + ph, 90, 22, 'bottom');

    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 2;
    for(let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(px + (pw / 3) * i, py);
      ctx.lineTo(px + (pw / 3) * i, py + ph);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(px, py + (ph / 3) * i);
      ctx.lineTo(px + pw, py + (ph / 3) * i);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.fillStyle = '#ff7043';
    [
      [px, py], [px + pw / 3, py], [px + (pw / 3) * 2, py], [px + pw, py],
      [px, py + ph / 3], [px + pw, py + ph / 3],
      [px, py + (ph / 3) * 2], [px + pw, py + (ph / 3) * 2],
      [px, py + ph], [px + pw / 3, py + ph], [px + (pw / 3) * 2, py + ph], [px + pw, py + ph]
    ].forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    return;
  }

  if(type === 'full') {
    const pw = 670, ph = 435;
    const px = (w - pw) / 2, py = (h - ph) / 2;
    ctx.strokeRect(px, py, pw, ph);

    ctx.beginPath();
    ctx.moveTo(w / 2, py);
    ctx.lineTo(w / 2, py + ph);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 64, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    drawCornerArc(px, py, 0, Math.PI / 2, 16);
    drawCornerArc(px + pw, py, Math.PI / 2, Math.PI, 16);
    drawCornerArc(px + pw, py + ph, Math.PI, Math.PI * 1.5, 16);
    drawCornerArc(px, py + ph, Math.PI * 1.5, Math.PI * 2, 16);

    const boxW = 115, boxH = 280;
    ctx.strokeRect(px, h / 2 - boxH / 2, boxW, boxH);

    const sBoxW = 38, sBoxH = 128;
    ctx.strokeRect(px, h / 2 - sBoxH / 2, sBoxW, sBoxH);

    const pSpotX_L = px + 76;
    ctx.beginPath();
    ctx.arc(pSpotX_L, h / 2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    const distL = (px + boxW) - pSpotX_L;
    const arcRL = 55;
    const thetaL = Math.acos(Math.min(0.99, distL / arcRL));
    ctx.beginPath();
    ctx.arc(pSpotX_L, h / 2, arcRL, -thetaL, thetaL);
    ctx.stroke();

    drawGoal(px - 28, h / 2 - 45, 28, 90, 'left');

    ctx.strokeRect(px + pw - boxW, h / 2 - boxH / 2, boxW, boxH);
    ctx.strokeRect(px + pw - sBoxW, h / 2 - sBoxH / 2, sBoxW, sBoxH);

    const pSpotX_R = px + pw - 76;
    ctx.beginPath();
    ctx.arc(pSpotX_R, h / 2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    const distR = pSpotX_R - (px + pw - boxW);
    const arcRR = 55;
    const thetaR = Math.acos(Math.min(0.99, distR / arcRR));
    ctx.beginPath();
    ctx.arc(pSpotX_R, h / 2, arcRR, Math.PI - thetaR, Math.PI + thetaR);
    ctx.stroke();

    drawGoal(px + pw, h / 2 - 45, 28, 90, 'right');
    return;
  }

  if(type === 'half_horizontal') {
    const pw = 550, ph = 440;
    const px = (w - pw) / 2, py = (h - ph) / 2;
    ctx.strokeRect(px, py, pw, ph);

    drawCornerArc(px, py, 0, Math.PI / 2, 20);
    drawCornerArc(px, py + ph, Math.PI * 1.5, Math.PI * 2, 20);

    drawGoal(px - 30, h / 2 - 65, 30, 130, 'left');

    const hBoxW = 180, hBoxH = 284;
    ctx.strokeRect(px, h / 2 - hBoxH / 2, hBoxW, hBoxH);

    const hsBoxW = 60, hsBoxH = 130;
    ctx.strokeRect(px, h / 2 - hsBoxH / 2, hsBoxW, hsBoxH);

    const hSpotX = px + 120;
    ctx.beginPath();
    ctx.arc(hSpotX, h / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    const distH = (px + hBoxW) - hSpotX;
    const arcRH = 80;
    const thetaH = Math.acos(Math.min(0.99, distH / arcRH));
    ctx.beginPath();
    ctx.arc(hSpotX, h / 2, arcRH, -thetaH, thetaH);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px + pw, h / 2, 80, Math.PI / 2, Math.PI * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px + pw, h / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.setLineDash([5, 8]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    [py + ph * 0.18, py + ph * 0.38, py + ph * 0.62, py + ph * 0.82].forEach(gy => {
      ctx.beginPath(); ctx.moveTo(px, gy); ctx.lineTo(px + pw, gy); ctx.stroke();
    });
    ctx.setLineDash([]);
    return;
  }

  if(type === 'box') {
    const pw = 620, ph = 420;
    const px = (w - pw) / 2, py = 40;
    ctx.strokeRect(px, py, pw, ph);

    drawGoal(w / 2 - 75, py + ph, 150, 35, 'bottom');

    const boxW = 400, boxH = 216;
    const boxX = w / 2 - boxW / 2;
    const boxY = py + ph - boxH;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    const sBoxW = 182, sBoxH = 72;
    ctx.strokeRect(w / 2 - sBoxW / 2, py + ph - sBoxH, sBoxW, sBoxH);

    const spotY = py + ph - 144;
    ctx.beginPath();
    ctx.arc(w / 2, spotY, 4.5, 0, Math.PI * 2);
    ctx.fill();

    const distBox = spotY - boxY;
    const arcRBox = 96;
    const thetaBox = Math.acos(Math.min(0.99, distBox / arcRBox));
    ctx.beginPath();
    ctx.arc(w / 2, spotY, arcRBox, Math.PI * 1.5 - thetaBox, Math.PI * 1.5 + thetaBox);
    ctx.stroke();

    drawCornerArc(px, py + ph, Math.PI, Math.PI * 1.5, 24);
    drawCornerArc(px + pw, py + ph, Math.PI * 1.5, Math.PI * 2, 24);

    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.beginPath(); ctx.moveTo(boxX, py); ctx.lineTo(boxX, boxY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(boxX + boxW, py); ctx.lineTo(boxX + boxW, boxY); ctx.stroke();
    ctx.setLineDash([]);
    return;
  }

  // 6. HALF PITCH (Vertical - FIFA / FA PROPORTIONS DEFINITION)
  const pw = 560, ph = 405;
  const px = (w - pw) / 2, py = 54;
  ctx.strokeRect(px, py, pw, ph);

  drawGoal(w / 2 - 45, py - 32, 90, 32, 'top');
  drawCornerArc(px, py, 0, Math.PI / 2, 16);
  drawCornerArc(px + pw, py, Math.PI / 2, Math.PI, 16);

  const vBoxW = 360, vBoxH = 135;
  const vBoxX = w / 2 - vBoxW / 2;
  ctx.strokeRect(vBoxX, py, vBoxW, vBoxH);

  const vsBoxW = 160, vsBoxH = 45;
  ctx.strokeRect(w / 2 - vsBoxW / 2, py, vsBoxW, vsBoxH);

  const vSpotY = py + 90;
  ctx.beginPath();
  ctx.arc(w / 2, vSpotY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  const distV = (py + vBoxH) - vSpotY;
  const arcRV = 75;
  const thetaV = Math.acos(Math.min(0.99, distV / arcRV));
  ctx.beginPath();
  ctx.arc(w / 2, vSpotY, arcRV, Math.PI / 2 - thetaV, Math.PI / 2 + thetaV);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(w / 2, py + ph, 75, Math.PI, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w / 2, py + ph, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.setLineDash([5, 8]);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  [px + pw * 0.18, px + pw * 0.38, px + pw * 0.62, px + pw * 0.82].forEach(gx => {
    ctx.beginPath(); ctx.moveTo(gx, py); ctx.lineTo(gx, py + ph); ctx.stroke();
  });
  ctx.setLineDash([]);
}

function drawZigzagArrow(ctx, x1, y1, x2, y2, color = '#ff9800') {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if(dist < 5) return;

  const angle = Math.atan2(dy, dx);
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const px = -uy;
  const py = ux;

  const headLen = 12;
  const arrowBaseDist = Math.max(0, dist - headLen);
  const baseX = x1 + ux * arrowBaseDist;
  const baseY = y1 + uy * arrowBaseDist;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 3;
  ctx.lineCap = 'round';

  if(arrowBaseDist < 10) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(baseX, baseY);
    ctx.stroke();
  } else {
    const wavelength = 14;
    const numCycles = Math.max(1, Math.round(arrowBaseDist / wavelength));
    const numSteps = numCycles * 4;
    const stepLen = arrowBaseDist / numSteps;
    const amp = 5.5;

    ctx.beginPath();
    ctx.moveTo(x1, y1);

    for(let k = 1; k <= numSteps; k++) {
      const t = k * stepLen;
      let offset = 0;
      const mod = k % 4;
      if(mod === 1) offset = amp;
      else if(mod === 3) offset = -amp;
      else offset = 0;

      const zx = x1 + ux * t + px * offset;
      const zy = y1 + uy * t + py * offset;
      ctx.lineTo(zx, zy);
    }
    ctx.stroke();
  }

  const wingWidth = 6.5;
  const wing1X = baseX + px * wingWidth;
  const wing1Y = baseY + py * wingWidth;
  const wing2X = baseX - px * wingWidth;
  const wing2Y = baseY - py * wingWidth;

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(wing1X, wing1Y);
  ctx.lineTo(baseX, baseY);
  ctx.lineTo(wing2X, wing2Y);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawLobPassArrow(ctx, x1, y1, x2, y2, color = '#ffd600') {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if(dist < 5) return;

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const angle = Math.atan2(dy, dx);

  let normX = -Math.sin(angle);
  let normY = Math.cos(angle);

  if(normY > 0 || (normY === 0 && normX < 0)) {
    normX = -normX;
    normY = -normY;
  }

  const arcHeight = Math.min(75, Math.max(20, dist * 0.30));
  const cpX = midX + normX * arcHeight;
  const cpY = midY + normY * arcHeight;

  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.32)';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.arc(x1, y1 + 1.5, 3.5, 0, Math.PI * 2);
  ctx.arc(x2, y2 + 1.5, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x1, y1, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.0;
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cpX, cpY, x2, y2);
  ctx.stroke();

  const endAngle = Math.atan2(y2 - cpY, x2 - cpX);
  const headLen = 13;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(endAngle - Math.PI / 6), y2 - headLen * Math.sin(endAngle - Math.PI / 6));
  ctx.lineTo(x2 - headLen * 0.45 * Math.cos(endAngle), y2 - headLen * 0.45 * Math.sin(endAngle));
  ctx.lineTo(x2 - headLen * Math.cos(endAngle + Math.PI / 6), y2 - headLen * Math.sin(endAngle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.restore();
}

const SP_BALL_SVG_DATA = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <radialGradient id="turfShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.55)" />
      <stop offset="50%" stop-color="rgba(0,0,0,0.25)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0)" />
    </radialGradient>
    <radialGradient id="sphereLight" cx="34%" cy="32%" r="68%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="38%" stop-color="#f5f5f5" />
      <stop offset="68%" stop-color="#e0e0e0" />
      <stop offset="88%" stop-color="#bdbdbd" />
      <stop offset="100%" stop-color="#757575" />
    </radialGradient>
    <radialGradient id="turfBounce" cx="70%" cy="85%" r="45%">
      <stop offset="0%" stop-color="rgba(34,197,94,0.18)" />
      <stop offset="100%" stop-color="rgba(34,197,94,0)" />
    </radialGradient>
    <radialGradient id="patchGrad" cx="36%" cy="34%" r="62%">
      <stop offset="0%" stop-color="#2c2c2c" />
      <stop offset="45%" stop-color="#141414" />
      <stop offset="85%" stop-color="#050505" />
      <stop offset="100%" stop-color="#000000" />
    </radialGradient>
    <radialGradient id="glossFlare" cx="32%" cy="28%" r="48%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.85)" />
      <stop offset="35%" stop-color="rgba(255,255,255,0.32)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </radialGradient>
    <clipPath id="ballClip">
      <circle cx="50" cy="48" r="44" />
    </clipPath>
  </defs>
  <ellipse cx="50" cy="94" rx="38" ry="6" fill="url(#turfShadow)" />
  <ellipse cx="50" cy="92" rx="22" ry="3" fill="rgba(0,0,0,0.4)" />
  <circle cx="50" cy="48" r="44" fill="url(#sphereLight)" stroke="#000000" stroke-width="1.8" />
  <g clip-path="url(#ballClip)">
    <circle cx="50" cy="48" r="44" fill="url(#turfBounce)" />
    <polygon points="41,4 59,4 63,16 50,22 37,16" fill="url(#patchGrad)" stroke="#000000" stroke-width="1.6" stroke-linejoin="round" />
    <polygon points="85,21 96,34 89,47 75,37 78,23" fill="url(#patchGrad)" stroke="#000000" stroke-width="1.6" stroke-linejoin="round" />
    <polygon points="91,69 81,87 66,82 68,68 83,59" fill="url(#patchGrad)" stroke="#000000" stroke-width="1.6" stroke-linejoin="round" />
    <polygon points="9,69 19,87 34,82 32,68 17,59" fill="url(#patchGrad)" stroke="#000000" stroke-width="1.6" stroke-linejoin="round" />
    <polygon points="15,21 4,34 11,47 25,37 22,23" fill="url(#patchGrad)" stroke="#000000" stroke-width="1.6" stroke-linejoin="round" />
    <polygon points="50,30 68,43 61,64 39,64 32,43" fill="url(#patchGrad)" stroke="#000000" stroke-width="1.8" stroke-linejoin="round" />
    <line x1="50" y1="30" x2="50" y2="22" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="68" y1="43" x2="75" y2="37" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="61" y1="64" x2="68" y2="68" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="39" y1="64" x2="32" y2="68" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="32" y1="43" x2="25" y2="37" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="63" y1="16" x2="78" y2="23" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="89" y1="47" x2="83" y2="59" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="66" y1="82" x2="34" y2="82" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="17" y1="59" x2="11" y2="47" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="22" y1="23" x2="37" y2="16" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="50" y1="30" x2="50" y2="22" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" />
    <line x1="32" y1="43" x2="25" y2="37" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" />
    <line x1="22" y1="23" x2="37" y2="16" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" />
    <circle cx="50" cy="48" r="44" fill="url(#glossFlare)" />
    <circle cx="35" cy="30" r="5" fill="rgba(255,255,255,0.9)" />
  </g>
  <circle cx="50" cy="48" r="44" fill="none" stroke="#000000" stroke-width="2.0" />
</svg>`);

const spSoccerBallImage = new Image();
spSoccerBallImage.src = SP_BALL_SVG_DATA;
spSoccerBallImage.onload = () => {
  if (typeof redrawCanvas === 'function') redrawCanvas();
};

function drawRealisticSoccerBall(ctx, bx, by, R = 12.5) {
  if(spSoccerBallImage.complete && spSoccerBallImage.naturalWidth > 0) {
    const D = R * (100 / 44);
    ctx.drawImage(spSoccerBallImage, bx - D * 0.50, by - D * 0.48, D, D);
  } else {
    ctx.save();
    ctx.beginPath();
    ctx.arc(bx, by, R, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

function drawSingleObject(obj, isPreview, targetCtx = null, targetPitchType = null) {
  let ctx = targetCtx;
  const pType = targetPitchType || boardPitchType;
  if(!ctx) {
    const c = $('sp-canvas');
    if(!c) return;
    ctx = c.getContext('2d');
  }

  if(obj.type === 'token') {
    if(obj.tool === 'ball') {
      drawRealisticSoccerBall(ctx, obj.x, obj.y, 12.5);
    } else if(obj.tool === 'cone_yellow') {
      ctx.save();
      const cx = obj.x;
      const cy = obj.y;

      ctx.beginPath();
      ctx.ellipse(cx + 1.2, cy + 9.5, 13, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx - 12, cy + 6.5);
      ctx.lineTo(cx, cy + 2.5);
      ctx.lineTo(cx + 12, cy + 6.5);
      ctx.lineTo(cx, cy + 11.5);
      ctx.closePath();
      const baseGrad = ctx.createLinearGradient(cx - 12, cy + 2.5, cx + 12, cy + 11.5);
      baseGrad.addColorStop(0, '#f57f17');
      baseGrad.addColorStop(0.5, '#ffd600');
      baseGrad.addColorStop(1, '#e65100');
      ctx.fillStyle = baseGrad;
      ctx.fill();
      ctx.strokeStyle = '#bf360c';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      ctx.fillStyle = '#bf360c';
      [[-7, 5.5], [7, 5.5], [0, 9.5], [0, 4.2]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(cx + dx, cy + dy, 0.9, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.beginPath();
      ctx.moveTo(cx - 2.5, cy - 14.5);
      ctx.lineTo(cx + 2.5, cy - 14.5);
      ctx.lineTo(cx + 9.5, cy + 7);
      ctx.lineTo(cx - 9.5, cy + 7);
      ctx.closePath();
      const bodyGrad = ctx.createLinearGradient(cx - 9.5, cy, cx + 9.5, cy);
      bodyGrad.addColorStop(0, '#f57f17');
      bodyGrad.addColorStop(0.25, '#fff176');
      bodyGrad.addColorStop(0.5, '#ffd600');
      bodyGrad.addColorStop(0.85, '#ff8f00');
      bodyGrad.addColorStop(1, '#e65100');
      ctx.fillStyle = bodyGrad;
      ctx.fill();
      ctx.strokeStyle = '#d84315';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 4.8, cy - 3.5);
      ctx.lineTo(cx + 4.8, cy - 3.5);
      ctx.lineTo(cx + 7.2, cy + 2.5);
      ctx.lineTo(cx - 7.2, cy + 2.5);
      ctx.closePath();
      const bandGrad = ctx.createLinearGradient(cx - 7.2, cy, cx + 7.2, cy);
      bandGrad.addColorStop(0, '#e0e0e0');
      bandGrad.addColorStop(0.3, '#ffffff');
      bandGrad.addColorStop(0.8, '#f5f5f5');
      bandGrad.addColorStop(1, '#bdbdbd');
      ctx.fillStyle = bandGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx, cy - 14.5, 2.5, 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#bf360c';
      ctx.fill();
      ctx.strokeStyle = '#fff176';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      ctx.restore();
    } else if(obj.tool === 'cone_red' || obj.tool === 'cone') {
      ctx.save();
      const cx = obj.x;
      const cy = obj.y;

      ctx.beginPath();
      ctx.ellipse(cx + 1.2, cy + 9.5, 13, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx - 12, cy + 6.5);
      ctx.lineTo(cx, cy + 2.5);
      ctx.lineTo(cx + 12, cy + 6.5);
      ctx.lineTo(cx, cy + 11.5);
      ctx.closePath();
      const baseGrad = ctx.createLinearGradient(cx - 12, cy + 2.5, cx + 12, cy + 11.5);
      baseGrad.addColorStop(0, '#c62828');
      baseGrad.addColorStop(0.5, '#ff3d00');
      baseGrad.addColorStop(1, '#880e4f');
      ctx.fillStyle = baseGrad;
      ctx.fill();
      ctx.strokeStyle = '#4a148c';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      ctx.fillStyle = '#4a148c';
      [[-7, 5.5], [7, 5.5], [0, 9.5], [0, 4.2]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(cx + dx, cy + dy, 0.9, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.beginPath();
      ctx.moveTo(cx - 2.5, cy - 14.5);
      ctx.lineTo(cx + 2.5, cy - 14.5);
      ctx.lineTo(cx + 9.5, cy + 7);
      ctx.lineTo(cx - 9.5, cy + 7);
      ctx.closePath();
      const bodyGrad = ctx.createLinearGradient(cx - 9.5, cy, cx + 9.5, cy);
      bodyGrad.addColorStop(0, '#c62828');
      bodyGrad.addColorStop(0.25, '#ff8a80');
      bodyGrad.addColorStop(0.5, '#ff3d00');
      bodyGrad.addColorStop(0.85, '#d50000');
      bodyGrad.addColorStop(1, '#880e4f');
      ctx.fillStyle = bodyGrad;
      ctx.fill();
      ctx.strokeStyle = '#b71c1c';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 4.8, cy - 3.5);
      ctx.lineTo(cx + 4.8, cy - 3.5);
      ctx.lineTo(cx + 7.2, cy + 2.5);
      ctx.lineTo(cx - 7.2, cy + 2.5);
      ctx.closePath();
      const bandGrad = ctx.createLinearGradient(cx - 7.2, cy, cx + 7.2, cy);
      bandGrad.addColorStop(0, '#e0e0e0');
      bandGrad.addColorStop(0.3, '#ffffff');
      bandGrad.addColorStop(0.8, '#f5f5f5');
      bandGrad.addColorStop(1, '#bdbdbd');
      ctx.fillStyle = bandGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx, cy - 14.5, 2.5, 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#4a148c';
      ctx.fill();
      ctx.strokeStyle = '#ff8a80';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      ctx.restore();
    } else if(obj.tool === 'marker_yellow') {
      ctx.save();
      const cx = obj.x;
      const cy = obj.y;

      ctx.beginPath();
      ctx.ellipse(cx + 1, cy + 2.5, 11.5, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx, cy + 0.6, 10.5, 4.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f57f17';
      ctx.fill();
      ctx.strokeStyle = '#e65100';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx, cy - 0.4, 9.8, 4.0, 0, 0, Math.PI * 2);
      const mGrad = ctx.createRadialGradient(cx - 2, cy - 1.5, 0.5, cx, cy, 9.8);
      mGrad.addColorStop(0, '#fff9c4');
      mGrad.addColorStop(0.3, '#ffeb3b');
      mGrad.addColorStop(0.7, '#ffd600');
      mGrad.addColorStop(1, '#f57f17');
      ctx.fillStyle = mGrad;
      ctx.fill();
      ctx.strokeStyle = '#ff8f00';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx, cy - 0.6, 5.8, 2.4, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx, cy - 0.2, 2.6, 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#bf360c';
      ctx.fill();
      ctx.strokeStyle = '#ffd600';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      ctx.restore();
    } else if(obj.tool === 'marker_red') {
      ctx.save();
      const cx = obj.x;
      const cy = obj.y;

      ctx.beginPath();
      ctx.ellipse(cx + 1, cy + 2.5, 11.5, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx, cy + 0.6, 10.5, 4.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#b71c1c';
      ctx.fill();
      ctx.strokeStyle = '#880e4f';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx, cy - 0.4, 9.8, 4.0, 0, 0, Math.PI * 2);
      const mGrad = ctx.createRadialGradient(cx - 2, cy - 1.5, 0.5, cx, cy, 9.8);
      mGrad.addColorStop(0, '#ffcdd2');
      mGrad.addColorStop(0.3, '#ff5252');
      mGrad.addColorStop(0.7, '#f44336');
      mGrad.addColorStop(1, '#b71c1c');
      ctx.fillStyle = mGrad;
      ctx.fill();
      ctx.strokeStyle = '#c62828';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx, cy - 0.6, 5.8, 2.4, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx, cy - 0.2, 2.6, 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#4a148c';
      ctx.fill();
      ctx.strokeStyle = '#ff8a80';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      ctx.restore();
    } else if(obj.tool === 'mannequin') {
      ctx.save();
      ctx.translate(obj.x, obj.y);

      ctx.beginPath();
      ctx.ellipse(0, 18, 14, 4.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
      ctx.fill();

      ctx.fillStyle = '#263238';
      ctx.fillRect(-9, 13, 3, 6);
      ctx.fillRect(6, 13, 3, 6);
      ctx.beginPath();
      ctx.roundRect(-11, 11, 22, 3.5, 1.5);
      ctx.fillStyle = '#37474f';
      ctx.fill();
      ctx.strokeStyle = '#212121';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      const spineGrad = ctx.createLinearGradient(-2, 0, 2, 0);
      spineGrad.addColorStop(0, '#546e7a');
      spineGrad.addColorStop(0.5, '#cfd8dc');
      spineGrad.addColorStop(1, '#37474f');
      ctx.fillStyle = spineGrad;
      ctx.fillRect(-2, -14, 4, 26);
      ctx.strokeStyle = '#263238';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-2, -14, 4, 26);

      const ribBorder = '#1b5e20';
      [-9, -5, -1, 3, 7].forEach((ry, idx) => {
        const rw = (idx === 0 || idx === 4) ? 16 : 21;
        ctx.beginPath();
        ctx.roundRect(-rw / 2, ry, rw, 3, 1.5);
        const ribGrad = ctx.createLinearGradient(-rw / 2, ry, rw / 2, ry);
        ribGrad.addColorStop(0, '#00b0ff');
        ribGrad.addColorStop(0.3, '#00e676');
        ribGrad.addColorStop(0.7, '#69f0ae');
        ribGrad.addColorStop(1, '#00c853');
        ctx.fillStyle = ribGrad;
        ctx.fill();
        ctx.strokeStyle = ribBorder;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.moveTo(-7, -10);
      ctx.lineTo(7, -10);
      ctx.lineTo(5, -2);
      ctx.lineTo(0, 1);
      ctx.lineTo(-5, -2);
      ctx.closePath();
      const shieldGrad = ctx.createLinearGradient(-7, -10, 7, 1);
      shieldGrad.addColorStop(0, '#00e676');
      shieldGrad.addColorStop(0.5, '#b9f6ca');
      shieldGrad.addColorStop(1, '#00c853');
      ctx.fillStyle = shieldGrad;
      ctx.fill();
      ctx.strokeStyle = '#1b5e20';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(0, -17.5, 5, 6.5, 0, 0, Math.PI * 2);
      const headGrad = ctx.createRadialGradient(-1, -19, 1, 0, -17.5, 5.5);
      headGrad.addColorStop(0, '#b9f6ca');
      headGrad.addColorStop(0.6, '#00e676');
      headGrad.addColorStop(1, '#00b248');
      ctx.fillStyle = headGrad;
      ctx.fill();
      ctx.strokeStyle = '#1b5e20';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(0, -17.5, 2.2, 3.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();

      ctx.restore();
    } else if(obj.tool === 'hurdle') {
      ctx.save();
      ctx.translate(obj.x, obj.y);

      ctx.beginPath();
      ctx.ellipse(0, 10, 18, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fill();

      ctx.strokeStyle = '#263238';
      ctx.lineWidth = 3.0;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-18, 9.5); ctx.lineTo(-10, 9.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-14, 9.5); ctx.lineTo(-14, -4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, 9.5); ctx.lineTo(18, 9.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(14, 9.5); ctx.lineTo(14, -4); ctx.stroke();

      ctx.fillStyle = '#ffd600';
      [-18, -10, 10, 18].forEach(fx => {
        ctx.beginPath();
        ctx.arc(fx, 9.5, 2.0, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.beginPath();
      ctx.roundRect(-17, -9, 34, 6.5, 2.5);
      const hGrad = ctx.createLinearGradient(0, -9, 0, -2.5);
      hGrad.addColorStop(0, '#ffab00');
      hGrad.addColorStop(0.3, '#ff6d00');
      hGrad.addColorStop(0.7, '#ff3d00');
      hGrad.addColorStop(1, '#dd2c00');
      ctx.fillStyle = hGrad;
      ctx.fill();
      ctx.strokeStyle = '#bf360c';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      [-6, 0, 6].forEach(sx => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(sx - 1.8, -8.5, 3.6, 5.5, 1);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      });

      ctx.restore();
    } else if(obj.tool === 'ladder') {
      ctx.save();
      ctx.translate(obj.x, obj.y);
      const ladderRot = ((obj.rotation || 0) * Math.PI) / 180;
      ctx.rotate(ladderRot);

      const lLen = 76;
      const lWid = 22;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fillRect(-lWid / 2 + 1.5, -lLen / 2 + 2.5, lWid, lLen);

      ctx.strokeStyle = '#1a237e';
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'butt';
      ctx.beginPath();
      ctx.moveTo(-lWid / 2, -lLen / 2); ctx.lineTo(-lWid / 2, lLen / 2);
      ctx.moveTo(lWid / 2, -lLen / 2); ctx.lineTo(lWid / 2, lLen / 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(-lWid / 2, -lLen / 2); ctx.lineTo(-lWid / 2, lLen / 2);
      ctx.moveTo(lWid / 2, -lLen / 2); ctx.lineTo(lWid / 2, lLen / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const rungCount = 7;
      const step = lLen / (rungCount - 1);
      for(let i = 0; i < rungCount; i++) {
        const ry = -lLen / 2 + i * step;

        ctx.beginPath();
        ctx.roundRect(-lWid / 2 - 1.5, ry - 1.8, lWid + 3, 3.6, 1);
        const rGrad = ctx.createLinearGradient(0, ry - 1.8, 0, ry + 1.8);
        rGrad.addColorStop(0, '#fff59d');
        rGrad.addColorStop(0.4, '#ffd600');
        rGrad.addColorStop(1, '#f57f17');
        ctx.fillStyle = rGrad;
        ctx.fill();
        ctx.strokeStyle = '#e65100';
        ctx.lineWidth = 0.6;
        ctx.stroke();

        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(-lWid / 2, ry, 0.9, 0, Math.PI * 2);
        ctx.arc(lWid / 2, ry, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    } else if(obj.tool === 'pole') {
      ctx.save();
      ctx.translate(obj.x, obj.y);

      ctx.beginPath();
      ctx.ellipse(0, 11, 9.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(0, 9.5, 7.5, 3.0, 0, 0, Math.PI * 2);
      const bDomeGrad = ctx.createRadialGradient(-1, 8.5, 1, 0, 9.5, 7.5);
      bDomeGrad.addColorStop(0, '#546e7a');
      bDomeGrad.addColorStop(0.7, '#263238');
      bDomeGrad.addColorStop(1, '#102027');
      ctx.fillStyle = bDomeGrad;
      ctx.fill();
      ctx.strokeStyle = '#000a12';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      const poleH = 38;
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';

      ctx.strokeStyle = '#ffd600';
      ctx.beginPath();
      ctx.moveTo(0, 9.5);
      ctx.lineTo(0, 9.5 - poleH);
      ctx.stroke();

      ctx.strokeStyle = '#d50000';
      ctx.lineWidth = 3.2;
      [9.5 - 8, 9.5 - 18, 9.5 - 28].forEach(sy => {
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(0, sy - 5.5);
        ctx.stroke();
      });

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-0.6, 9.5);
      ctx.lineTo(-0.6, 9.5 - poleH);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 9.5 - poleH);
      ctx.lineTo(11, 9.5 - poleH + 4.5);
      ctx.lineTo(0, 9.5 - poleH + 9);
      ctx.closePath();
      const flagGrad = ctx.createLinearGradient(0, 9.5 - poleH, 11, 9.5 - poleH + 4.5);
      flagGrad.addColorStop(0, '#ff1744');
      flagGrad.addColorStop(0.6, '#d50000');
      flagGrad.addColorStop(1, '#b71c1c');
      ctx.fillStyle = flagGrad;
      ctx.fill();
      ctx.strokeStyle = '#880e4f';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      ctx.fillStyle = '#ffd600';
      ctx.beginPath();
      ctx.arc(0, 9.5 - poleH, 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    } else if(obj.tool === 'goal') {
      const scale = obj.scale || 1.0;
      const gw = 64 * scale;
      const gd = 26 * scale;
      const rot = ((obj.rotation || 0) * Math.PI) / 180;

      ctx.save();
      ctx.translate(obj.x, obj.y);
      ctx.rotate(rot);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fillRect(-gw / 2, -gd, gw, gd);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      const gridStep = Math.max(4.5, 6.5 * scale);
      for(let gx = -gw / 2 + gridStep; gx < gw / 2; gx += gridStep) {
        ctx.moveTo(gx, -gd);
        ctx.lineTo(gx, 0);
      }
      for(let gy = -gd + gridStep; gy < 0; gy += gridStep) {
        ctx.moveTo(-gw / 2, gy);
        ctx.lineTo(gw / 2, gy);
      }
      ctx.moveTo(-gw / 2, -gd); ctx.lineTo(-gw / 2, 0);
      ctx.moveTo(gw / 2, -gd); ctx.lineTo(gw / 2, 0);
      ctx.moveTo(-gw / 2, -gd); ctx.lineTo(gw / 2, -gd);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(220, 230, 240, 0.85)';
      ctx.lineWidth = Math.max(1.6, 2.2 * scale);
      ctx.beginPath();
      ctx.moveTo(-gw / 2, -gd);
      ctx.lineTo(gw / 2, -gd);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(3.2, 4.2 * scale);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-gw / 2, 0);
      ctx.lineTo(gw / 2, 0);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = Math.max(1.0, 1.4 * scale);
      ctx.beginPath();
      ctx.moveTo(-gw / 2, -0.6);
      ctx.lineTo(gw / 2, -0.6);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-gw / 2, 0, Math.max(3.5, 4.5 * scale), 0, Math.PI * 2);
      ctx.arc(gw / 2, 0, Math.max(3.5, 4.5 * scale), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#cfd8dc';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();

      if(!isPreview && currentBoardTool === 'goal') {
        const ctrl = getGoalControlLayout(obj);
        ctx.save();
        const pillW = 78;
        const pillH = 24;
        ctx.fillStyle = 'rgba(10, 35, 20, 0.94)';
        ctx.beginPath();
        ctx.roundRect(ctrl.cx - pillW / 2, ctrl.cy - pillH / 2, pillW, pillH, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(ctrl.minus.x, ctrl.minus.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('−', ctrl.minus.x, ctrl.minus.y);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(ctrl.rotate.x, ctrl.rotate.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⟳', ctrl.rotate.x, ctrl.rotate.y);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(ctrl.plus.x, ctrl.plus.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', ctrl.plus.x, ctrl.plus.y);

        let sizeLabel = 'Standard';
        if(scale <= 0.6) sizeLabel = 'Mini';
        else if(scale <= 0.85) sizeLabel = 'Small (7v7)';
        else if(scale >= 1.5) sizeLabel = 'Large';
        else if(scale >= 1.25) sizeLabel = 'Medium';

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 9.5px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(sizeLabel, ctrl.cx, ctrl.cy + 14);

        ctx.restore();
      }
    } else {
      let c1 = '#e53935', c2 = '#b71c1c', border = '#7f0000', textColor = '#ffffff';
      if(obj.tool === 'blue') { c1 = '#1e88e5'; c2 = '#0d47a1'; border = '#002171'; textColor = '#ffffff'; }
      if(obj.tool === 'yellow') { c1 = '#ffd600'; c2 = '#f57f17'; border = '#e65100'; textColor = '#1a1a1a'; }
      if(obj.tool === 'green') { c1 = '#00e676'; c2 = '#1b5e20'; border = '#003300'; textColor = '#ffffff'; }
      if(obj.tool === 'gk') { c1 = '#ffffff'; c2 = '#d9e0e8'; border = '#263238'; textColor = '#0d1117'; }

      ctx.save();
      const px = obj.x;
      const py = obj.y;
      const R = 14.5;

      ctx.beginPath();
      ctx.arc(px + 1.2, py + 2.4, R, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, R, 0, Math.PI * 2);
      const rimGrad = ctx.createLinearGradient(px - R, py - R, px + R, py + R);
      rimGrad.addColorStop(0, '#ffffff');
      rimGrad.addColorStop(0.3, '#cfd8dc');
      rimGrad.addColorStop(0.7, '#78909c');
      rimGrad.addColorStop(1, '#37474f');
      ctx.fillStyle = rimGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, R - 2.0, 0, Math.PI * 2);
      const tokenGrad = ctx.createRadialGradient(px - 3, py - 4, 1, px, py, R - 2);
      tokenGrad.addColorStop(0, c1);
      tokenGrad.addColorStop(0.8, c2);
      tokenGrad.addColorStop(1, border);
      ctx.fillStyle = tokenGrad;
      ctx.fill();
      ctx.strokeStyle = border;
      ctx.lineWidth = 1.0;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(px - 3.5, py - 4.5, 6, 2.5, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fill();

      if(obj.label) {
        ctx.fillStyle = textColor;
        ctx.font = 'bold 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obj.label, px, py + 0.5);
      }
      ctx.restore();
    }
  } else if(obj.type === 'line') {
    if(obj.tool === 'dribble') {
      drawZigzagArrow(ctx, obj.x1, obj.y1, obj.x2, obj.y2, '#ff9800');
      const dist = Math.hypot(obj.x2 - obj.x1, obj.y2 - obj.y1);
      const showDist = isPreview ? isRulerEnabled : (obj.showMeasurement === true);
      if(showDist && dist > 15) {
        const yds = pxToYds(dist, pType);
        drawAlignedSegmentYardBadge(ctx, obj.x1, obj.y1, obj.x2, obj.y2, `Dribble: ${yds} yds`, 16, '#ff9800', 'rgba(10, 30, 20, 0.94)');
      }
    } else if(obj.tool === 'zone') {
      ctx.save();
      ctx.strokeStyle = '#ffd600';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.fillStyle = 'rgba(255, 214, 0, 0.15)';
      const rx = Math.min(obj.x1, obj.x2);
      const ry = Math.min(obj.y1, obj.y2);
      const rw = Math.abs(obj.x2 - obj.x1);
      const rh = Math.abs(obj.y2 - obj.y1);
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.restore();

      const showDist = isPreview ? isRulerEnabled : (obj.showMeasurement === true);
      if(showDist && rw > 15 && rh > 15) {
        const ydsW = pxToYds(rw, pType);
        const ydsH = pxToYds(rh, pType);
        drawYardBadge(ctx, rx + rw / 2, ry - 12 < 12 ? ry + rh + 12 : ry - 12, `📐 ${ydsW} × ${ydsH} yds`, '#ffffff', 'rgba(10, 30, 20, 0.94)');
      }
    } else if(obj.tool === 'ruler') {
      ctx.save();
      const dist = Math.hypot(obj.x2 - obj.x1, obj.y2 - obj.y1);
      const angle = Math.atan2(obj.y2 - obj.y1, obj.x2 - obj.x1);
      const px = -Math.sin(angle);
      const py = Math.cos(angle);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(obj.x1, obj.y1);
      ctx.lineTo(obj.x2, obj.y2);
      ctx.stroke();
      ctx.setLineDash([]);

      const tickLen = 8;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(obj.x1 + px * tickLen, obj.y1 + py * tickLen);
      ctx.lineTo(obj.x1 - px * tickLen, obj.y1 - py * tickLen);
      ctx.moveTo(obj.x2 + px * tickLen, obj.y2 + py * tickLen);
      ctx.lineTo(obj.x2 - px * tickLen, obj.y2 - py * tickLen);
      ctx.stroke();
      ctx.restore();

      const yds = pxToYds(dist, pType);
      drawAlignedSegmentYardBadge(ctx, obj.x1, obj.y1, obj.x2, obj.y2, `📏 ${yds} yds`, 16, '#ffffff', 'rgba(10, 30, 20, 0.94)');
    } else if(obj.tool === 'lob') {
      drawLobPassArrow(ctx, obj.x1, obj.y1, obj.x2, obj.y2, '#ffd600');
      const dist = Math.hypot(obj.x2 - obj.x1, obj.y2 - obj.y1);
      const showDist = isPreview ? isRulerEnabled : (obj.showMeasurement === true);
      if(showDist && dist > 15) {
        const yds = pxToYds(dist, pType);
        drawAlignedSegmentYardBadge(ctx, obj.x1, obj.y1, obj.x2, obj.y2, `Lob: ${yds} yds`, 20, '#ffd600', 'rgba(10, 30, 20, 0.94)');
      }
    } else {
      ctx.save();
      const isPass = (obj.tool === 'pass');
      const color = isPass ? '#ffd600' : '#e53935';

      if(isPass) {
        ctx.beginPath();
        ctx.arc(obj.x1, obj.y1, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd600';
        ctx.fill();
        ctx.strokeStyle = '#1b261a';
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;

      if(isPass) ctx.setLineDash([7, 5]);

      ctx.beginPath();
      ctx.moveTo(obj.x1, obj.y1);
      ctx.lineTo(obj.x2, obj.y2);
      ctx.stroke();
      ctx.setLineDash([]);

      const angle = Math.atan2(obj.y2 - obj.y1, obj.x2 - obj.x1);
      const headLen = 12;
      ctx.beginPath();
      ctx.moveTo(obj.x2, obj.y2);
      ctx.lineTo(obj.x2 - headLen * Math.cos(angle - Math.PI / 6), obj.y2 - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(obj.x2 - headLen * Math.cos(angle + Math.PI / 6), obj.y2 - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      const dist = Math.hypot(obj.x2 - obj.x1, obj.y2 - obj.y1);
      const showDist = isPreview ? isRulerEnabled : (obj.showMeasurement === true);
      if(showDist && dist > 18) {
        const yds = pxToYds(dist, pType);
        const labelText = isPass ? `Pass: ${yds} yds` : `Run: ${yds} yds`;
        const badgeColor = isPass ? '#ffd600' : '#ff5252';
        drawAlignedSegmentYardBadge(ctx, obj.x1, obj.y1, obj.x2, obj.y2, labelText, 16, badgeColor, 'rgba(10, 30, 20, 0.94)');
      }
    }
  }
}

function closeBoardSketcher() {
  if(initialDrillBoardSnapshot !== null && JSON.stringify(boardObjects) !== initialDrillBoardSnapshot) {
    if(!confirm('⚠️ You have unsaved markings on this tactical drill sketch.\n\nAre you sure you want to discard them?')) {
      return;
    }
  }
  initialDrillBoardSnapshot = null;
  closeM('m-drill-board');
}

function saveBoardDiagram() {
  const c = $('sp-canvas');
  if(!c || currentEditingDrillIndex === null || !currentEditingSession) return;
  const dataUrl = c.toDataURL('image/png', 0.88);

  const drill = currentEditingSession.drills[currentEditingDrillIndex];
  if(drill) {
    drill.diagram = dataUrl;
    drill.boardObjects = JSON.parse(JSON.stringify(boardObjects));
    drill.pitchType = boardPitchType;
    renderDrillsList();
  }

  initialDrillBoardSnapshot = null;
  closeBoardSketcher();
}

function saveBoardToDrill() {
  saveBoardDiagram();
}

function ensureDrillDiagram(drill) {
  if (!drill) return '';
  if (drill.diagram && drill.diagram.startsWith('data:image/')) return drill.diagram;
  if (!drill.boardObjects || !drill.boardObjects.length) return '';

  const prevPitchType = boardPitchType;
  try {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 800;
    offCanvas.height = 520;
    const offCtx = offCanvas.getContext('2d');
    const pitchType = drill.pitchType || 'half';
    boardPitchType = pitchType;

    drawFootballPitchBackground(offCtx, 800, 520, pitchType);
    drawSameEquipmentDistances(offCtx, drill.boardObjects, pitchType);
    (drill.boardObjects || []).forEach(obj => {
      drawSingleObject(obj, false, offCtx, pitchType);
    });
    drawPitchScaleBar(offCtx, 800, 520, pitchType);

    drill.diagram = offCanvas.toDataURL('image/png', 0.88);
    return drill.diagram;
  } catch(e) {
    console.warn('Could not auto-generate drill diagram:', e);
    return '';
  } finally {
    boardPitchType = prevPitchType;
  }
}

function initDrillLibraryDiagrams() {
  DRILL_LIBRARY.forEach(d => {
    ensureDrillDiagram(d);
  });
  SESSION_PRESETS.forEach(p => {
    (p.drills || []).forEach(d => {
      ensureDrillDiagram(d);
    });
  });
}

function viewDrillDiagram(drillIndex) {
  openPitchDiagramPopup(drillIndex);
}

function openPitchDiagramPopup(drillIdx) {
  if(!currentEditingSession || !currentEditingSession.drills || !currentEditingSession.drills[drillIdx]) return;
  const d = currentEditingSession.drills[drillIdx];
  openPitchDiagramViewerForDrill(d, currentEditingSession.title || 'Training Session', drillIdx);
}

function openPitchDiagramViewerForDrill(d, contextTitle = '', editorDrillIdx = null) {
  if(!d) return;
  if(typeof ensureDrillDiagram === 'function') ensureDrillDiagram(d);
  if(!d.diagram) return;

  currentViewingDrillIdx = editorDrillIdx;
  const editBtn = $('diag-view-edit-btn');
  if(editBtn) {
    editBtn.style.display = (editorDrillIdx !== null) ? 'inline-flex' : 'none';
  }

  if($('diag-view-title')) $('diag-view-title').textContent = (d.name || 'Tactical Drill').toUpperCase();
  if($('diag-view-phase')) {
    $('diag-view-phase').textContent = d.phase || 'Tactical';
    $('diag-view-phase').className = `sp-badge ${getPhaseClass(d.phase).replace('phase-', 'sp-badge-')}`;
  }
  if($('diag-view-subtitle')) {
    $('diag-view-subtitle').textContent = `Phase: ${d.phase || 'Tactical'} | ⏱️ ${d.duration || 15} mins ${d.dimensions ? '· 📐 ' + d.dimensions : ''} ${d.players ? '· 👥 ' + d.players : ''}`;
  }
  if($('diag-view-img')) $('diag-view-img').src = d.diagram;

  let notesHtml = '';
  if(d.description) notesHtml += `<div><strong>Setup:</strong> ${esc(d.description)}</div>`;
  if(d.coachingPoints) notesHtml += `<div style="margin-top:4px;color:#1b5e20;"><strong>Coaching Keys:</strong> ${esc(d.coachingPoints)}</div>`;
  if($('diag-view-notes')) $('diag-view-notes').innerHTML = notesHtml || '<div style="color:var(--mt);">No coaching notes provided.</div>';

  openM('m-drill-diagram-viewer');
}

function editCurrentViewingDiagram() {
  if(currentViewingDrillIdx !== null) {
    closeM('m-drill-diagram-viewer');
    openDrillBoard(currentViewingDrillIdx);
  }
}

function viewPresetDrillDiagram(presetId, drillIdx) {
  const p = SESSION_PRESETS.find(item => item.id === presetId);
  if(!p || !p.drills || !p.drills[drillIdx]) return;
  const d = p.drills[drillIdx];
  openPitchDiagramViewerForDrill(d, p.title || 'Session Preset');
}

function viewLibraryDrillDiagram(drillId) {
  const d = DRILL_LIBRARY.find(item => item.id === drillId);
  if(!d) return;
  openPitchDiagramViewerForDrill(d, 'Drill Library');
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

  container.innerHTML = filtered.map(d => {
    if(typeof ensureDrillDiagram === 'function') ensureDrillDiagram(d);
    return `
      <div class="sp-card" style="padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="sp-badge ${getPhaseClass(d.phase).replace('phase-', 'sp-badge-')}">${esc(d.phase)}</span>
          <span style="font-size: 12px; font-weight: 700; color: var(--g);">⏱️ ${d.duration} mins</span>
        </div>
        <div style="font-weight: 800; font-size: 14.5px; margin-bottom: 6px;">${esc(d.name)}</div>
        <div style="font-size: 12px; color: var(--mt); margin-bottom: 10px; line-height: 1.4;">${esc(d.description)}</div>
        <div style="font-size: 11px; color: var(--g); margin-bottom: 12px; font-weight: 600;">📐 ${esc(d.dimensions)} | 👥 ${esc(d.players)}</div>
        <div style="display:flex;gap:8px;align-items:center;">
          ${d.boardObjects && d.boardObjects.length ? `
            <button class="obtn" style="flex:1;padding:6px 10px;font-size:12px;" onclick="viewLibraryDrillDiagram('${d.id}')">🏟️ Pitch</button>
          ` : ''}
          <button class="mok" style="flex:2;padding:6px 12px;font-size:12px;" onclick="insertDrillFromLibrary('${d.id}')">＋ Insert into Session</button>
        </div>
      </div>
    `;
  }).join('');
}

function insertDrillFromLibrary(drillId) {
  const d = DRILL_LIBRARY.find(item => item.id === drillId);
  if(!d) return;
  if(!currentEditingSession) {
    openNewSession();
    currentEditingSession.drills = [JSON.parse(JSON.stringify(d))];
    currentEditingSession.title = d.name || 'New Training Session';
    populateSessionEditorForm();
  } else {
    currentEditingSession.drills = currentEditingSession.drills || [];
    currentEditingSession.drills.push(JSON.parse(JSON.stringify(d)));
    renderDrillsList();
    recalculateTotalTime();
  }
  closeM('m-drill-library');
  openM('m-session-editor');
}

// ══ Presets Modal ══
let currentTemplateAgeFilter = 'all';

function setTemplateAgeFilter(age){
  currentTemplateAgeFilter = age;
  const container = $('tp-age-filters') || $('preset-age-filters');
  if(container){
    container.querySelectorAll('.sp-age-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.age === age);
    });
  }
  renderTemplatePresetsFilter();
}

function renderTemplatePresetsFilter() {
  const container = $('tp-presets-list') || $('preset-grid');
  if(!container) return;
  const searchInput = $('tp-preset-search') || $('preset-search');
  const search = (searchInput?.value || '').toLowerCase().trim();

  // Pre-generate diagrams for all presets drills
  SESSION_PRESETS.forEach(p => {
    (p.drills || []).forEach(d => {
      if(d && typeof ensureDrillDiagram === 'function') ensureDrillDiagram(d);
    });
  });

  const primaryPresets = SESSION_PRESETS.filter(p => !['preset_high_press_433', 'preset_tikitaka_possession', 'preset_finishing_transitions', 'preset_finishing_crossing', 'preset_low_block_defense'].includes(p.id) || p.coach);

  const filtered = primaryPresets.filter(p => {
    if(currentTemplateAgeFilter !== 'all' && p.ageGroup !== currentTemplateAgeFilter) return false;
    if(search){
      const matchTitle = (p.title || '').toLowerCase().includes(search);
      const matchCoach = (p.coach || '').toLowerCase().includes(search) || (p.coachBadge || '').toLowerCase().includes(search);
      const matchObj = (p.objectives || '').toLowerCase().includes(search);
      const matchCat = (p.category || '').toLowerCase().includes(search);
      if(!matchTitle && !matchCoach && !matchObj && !matchCat) return false;
    }
    return true;
  });

  if(filtered.length === 0){
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:var(--mt);">No session presets found matching your filter.</div>`;
    return;
  }

  container.innerHTML = filtered.map(p => `
    <div class="sp-lib-card" onclick="openSessionWithPreset('${p.id}')">
      <div class="sp-lib-head">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          ${p.ageGroup ? `<span class="sp-age-tag sp-age-${p.ageGroup}">${esc(p.ageGroupLabel || p.ageGroup)}</span>` : ''}
          ${p.coachBadge ? `<span class="sp-coach-tag">👤 ${esc(p.coachBadge)}</span>` : ''}
          <span class="sp-badge ${getCategoryBadgeClass(p.category)}">${esc(p.category)}</span>
        </div>
        <span style="font-size:12px;font-weight:700;color:var(--g);white-space:nowrap;">⚡ ${p.duration} mins</span>
      </div>
      <div class="sp-lib-title" style="margin-top:6px;font-size:14.5px;">${esc(p.title)}</div>
      <div class="sp-lib-desc">${esc(p.objectives)}</div>
      <div class="sp-drills-chips" style="margin-top:8px;">
        ${(p.drills || []).filter(Boolean).map((d, dIdx) => `
          <div class="sp-drill-chip" onclick="event.stopPropagation();viewPresetDrillDiagram('${p.id}', ${dIdx})" title="Click to view pitch diagram for ${esc(d.name)}" style="cursor:pointer;">
            <span class="dot ${getPhaseClass(d ? d.phase : '')}"></span>${esc(d ? d.name : 'Drill')}
            <span style="font-size:11px;opacity:0.8;margin-left:3px;">🏟️</span>
          </div>
        `).join('')}
      </div>
      <div style="margin-top:auto;padding-top:10px;display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:11.5px;color:var(--mt);">${p.intensity || 'Medium'} Intensity · ${p.drills ? p.drills.filter(Boolean).length : 0} Drills</span>
        <button class="mok" style="padding:6px 14px;font-size:12px;" onclick="event.stopPropagation();openSessionWithPreset('${p.id}')">⚡ Load This Session</button>
      </div>
    </div>
  `).join('');
}

function openTemplatePicker() {
  currentTemplateAgeFilter = 'all';
  const searchInput = $('tp-preset-search') || $('preset-search');
  if(searchInput) searchInput.value = '';
  const filterBtns = document.querySelectorAll('.sp-age-btn');
  filterBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.age === 'all'));
  renderTemplatePresetsFilter();
  openM('m-template-picker');
}

function renderTemplatePicker() {
  renderTemplatePresetsFilter();
}

function openSessionWithPreset(presetId) {
  const p = SESSION_PRESETS.find(item => item.id === presetId);
  if(!p) return;
  const today = new Date().toISOString().split('T')[0];
  const assignedTeamId = (currentStudioTeamId && currentStudioTeamId !== 'all') ? currentStudioTeamId : (teams[0] ? teams[0].id : '');

  const clonedDrills = JSON.parse(JSON.stringify((p.drills || []).filter(Boolean)));
  // Pre-generate pitch diagrams from boardObjects so thumbnails show immediately
  clonedDrills.forEach(d => { if (typeof ensureDrillDiagram === 'function') ensureDrillDiagram(d); });

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
    equipment: p.equipment || ['balls', 'cones_orange', 'bibs_yellow', 'stopwatch'],
    drills: clonedDrills,
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
