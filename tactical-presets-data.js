/**
 * Tactical Presets Data (Single Source of Truth)
 * Coach Management System (CMS) — GA Edition
 * 
 * Contains all equipment definitions, tactical drill templates,
 * and age-categorized coaching session presets.
 */

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
      { type: 'token', tool: 'marker_yellow', x: 270, y: 160, sequenceId: 1, showMeasurement: true },
      { type: 'token', tool: 'marker_yellow', x: 530, y: 160, sequenceId: 1, showMeasurement: true },
      { type: 'token', tool: 'red', x: 400, y: 420, label: 'A' },
      { type: 'token', tool: 'red', x: 400, y: 290, label: 'B' },
      { type: 'token', tool: 'red', x: 265, y: 140, label: 'C' },
      { type: 'token', tool: 'ball', x: 415, y: 418 },
      { type: 'line', tool: 'pass', x1: 400, y1: 400, x2: 400, y2: 280, showMeasurement: true },
      { type: 'line', tool: 'run', x1: 400, y1: 400, x2: 430, y2: 340, showMeasurement: true },
      { type: 'line', tool: 'pass', x1: 400, y1: 270, x2: 280, y2: 170, showMeasurement: true }
    ],
    diagram: ''
  },
  {
    id: 'd_1v1_finishing',
    phase: 'Technical',
    name: 'Rapid Transition 1v1 to Big Goal',
    duration: 20,
    dimensions: 'Penalty Box to Halfway',
    players: 'Squad + 2 Goalkeepers',
    description: 'Coach feeds ball into attacking runner. Attacker takes positive first touch attacking the penalty box. Solo defender sprints from opposite endline to recover and contest the 1v1 strike within 6 seconds.',
    coachingPoints: '• Exploit defender recovery angle with aggressive forward touch\n• Change of pace or body feint to open shooting lane\n• Strike early across the goalkeeper\n• Defender must recover on the inside shoulder',
    pitchType: 'box',
    boardObjects: [
      { type: 'token', tool: 'goal', x: 400, y: 65, scale: 1.1, rotation: 0 },
      { type: 'token', tool: 'cone_red', x: 280, y: 350, sequenceId: 1, showMeasurement: true },
      { type: 'token', tool: 'cone_yellow', x: 520, y: 350, sequenceId: 1, showMeasurement: true },
      { type: 'token', tool: 'gk', x: 400, y: 105, label: 'GK' },
      { type: 'token', tool: 'blue', x: 280, y: 375, label: '9' },
      { type: 'token', tool: 'red', x: 520, y: 375, label: '4' },
      { type: 'token', tool: 'ball', x: 295, y: 365 },
      { type: 'line', tool: 'dribble', x1: 295, y1: 365, x2: 350, y2: 240, showMeasurement: true },
      { type: 'line', tool: 'run', x1: 520, y1: 375, x2: 430, y2: 245, showMeasurement: true },
      { type: 'line', tool: 'shot', x1: 350, y1: 240, x2: 385, y2: 110, showMeasurement: true }
    ],
    diagram: ''
  },
  {
    id: 'd_4v4_3_possession',
    phase: 'Tactical',
    name: '4v4+3 Positional Play Grid (Juego de Posición)',
    duration: 25,
    dimensions: '30x25m Corridors',
    players: '11 Players (4v4 + 3 Neutrals)',
    description: 'Possession team (Red) looks to advance the ball from deep neutral through central neutral to attacking neutral. Defending team (Blue) presses compact. On turnover, Blue becomes possession team.',
    coachingPoints: '• Positional discipline: stay in assigned corridors\n• Play through the central #6 neutral to attract pressure, then switch\n• Body shape open to receive across the pitch\n• Fast counter-press within 3 seconds of losing ball',
    pitchType: 'grid',
    boardObjects: [
      { type: 'token', tool: 'cone_yellow', x: 200, y: 130, sequenceId: 1 },
      { type: 'token', tool: 'cone_yellow', x: 600, y: 130, sequenceId: 1 },
      { type: 'token', tool: 'cone_yellow', x: 600, y: 410, sequenceId: 1 },
      { type: 'token', tool: 'cone_yellow', x: 200, y: 410, sequenceId: 1 },
      { type: 'token', tool: 'yellow', x: 200, y: 270, label: 'N1' },
      { type: 'token', tool: 'yellow', x: 400, y: 270, label: 'N2' },
      { type: 'token', tool: 'yellow', x: 600, y: 270, label: 'N3' },
      { type: 'token', tool: 'red', x: 280, y: 190, label: '2' },
      { type: 'token', tool: 'red', x: 520, y: 190, label: '3' },
      { type: 'token', tool: 'red', x: 280, y: 350, label: '4' },
      { type: 'token', tool: 'red', x: 520, y: 350, label: '5' },
      { type: 'token', tool: 'blue', x: 340, y: 230, label: '7' },
      { type: 'token', tool: 'blue', x: 460, y: 230, label: '8' },
      { type: 'token', tool: 'blue', x: 340, y: 310, label: '9' },
      { type: 'token', tool: 'blue', x: 460, y: 310, label: '10' },
      { type: 'token', tool: 'ball', x: 215, y: 270 },
      { type: 'line', tool: 'pass', x1: 215, y1: 270, x2: 385, y2: 270, showMeasurement: true }
    ],
    diagram: ''
  },
  {
    id: 'd_high_press_ssg',
    phase: 'SSG',
    name: 'Half-Pitch 7v7 High-Press Trigger Match',
    duration: 30,
    dimensions: 'Half Pitch (60x50m)',
    players: '14 Players (7v7)',
    description: 'Game restarts from Yellow goalkeeper building out. Red team sets a medium/high pressing block. Goal scored within 8 seconds of winning the ball in the attacking half counts as double points.',
    coachingPoints: '• Pressing cue: backward pass to goalkeeper or closed body profile\n• Nearest attacker arches run to cut off the switch of play\n• Midfield unit steps up simultaneously to squeeze the space\n• Decisive vertical finish once ball is regained',
    pitchType: 'half',
    boardObjects: [
      { type: 'token', tool: 'goal', x: 400, y: 55, scale: 1.15, rotation: 0 },
      { type: 'token', tool: 'goal', x: 230, y: 460, scale: 0.65, rotation: 180 },
      { type: 'token', tool: 'goal', x: 570, y: 460, scale: 0.65, rotation: 180 },
      { type: 'token', tool: 'gk', x: 400, y: 95, label: 'GK' },
      { type: 'token', tool: 'blue', x: 280, y: 160, label: '4' },
      { type: 'token', tool: 'blue', x: 520, y: 160, label: '5' },
      { type: 'token', tool: 'blue', x: 190, y: 230, label: '2' },
      { type: 'token', tool: 'blue', x: 610, y: 230, label: '3' },
      { type: 'token', tool: 'blue', x: 350, y: 250, label: '6' },
      { type: 'token', tool: 'blue', x: 450, y: 250, label: '8' },
      { type: 'token', tool: 'red', x: 400, y: 210, label: '9' },
      { type: 'token', tool: 'red', x: 270, y: 260, label: '7' },
      { type: 'token', tool: 'red', x: 530, y: 260, label: '11' },
      { type: 'token', tool: 'red', x: 360, y: 340, label: '8' },
      { type: 'token', tool: 'red', x: 440, y: 340, label: '10' },
      { type: 'token', tool: 'ball', x: 400, y: 120 },
      { type: 'line', tool: 'pass', x1: 400, y1: 120, x2: 295, y2: 155, showMeasurement: true },
      { type: 'line', tool: 'run', x1: 400, y1: 210, x2: 320, y2: 170, showMeasurement: true }
    ],
    diagram: ''
  },
  {
    id: 'd_cooldown_stretch',
    phase: 'Cool-down',
    name: 'Dynamic Recovery Flush & Tactical Debrief',
    duration: 10,
    dimensions: 'Full Pitch / Center Circle',
    players: 'Entire Squad',
    description: 'Light aerobic flush jog around perimeter followed by coach-led static & dynamic stretching circle. Coach conducts a 5-minute tactical debrief reviewing objectives and intensity goals.',
    coachingPoints: '• Deep diaphragmatic breathing\n• Major muscle groups: hamstrings, groin, calves, hip flexors\n• Active coach review: what worked well, what to adjust next session',
    pitchType: 'full',
    boardObjects: [
      { type: 'token', tool: 'red', x: 380, y: 240, label: 'C' },
      { type: 'token', tool: 'blue', x: 340, y: 220, label: '1' },
      { type: 'token', tool: 'blue', x: 420, y: 220, label: '2' },
      { type: 'token', tool: 'blue', x: 320, y: 260, label: '3' },
      { type: 'token', tool: 'blue', x: 440, y: 260, label: '4' },
      { type: 'token', tool: 'blue', x: 340, y: 300, label: '5' },
      { type: 'token', tool: 'blue', x: 420, y: 300, label: '6' },
      { type: 'token', tool: 'cone_orange', x: 380, y: 260, sequenceId: 1 }
    ],
    diagram: ''
  },
  {
    id: 'd_coerver_mastery',
    phase: 'Technical',
    name: 'Wiel Coerver: 1,000 Touches Ball Mastery Square',
    duration: 15,
    dimensions: '15x15m Grid',
    players: 'All Players (1 Ball Each)',
    description: 'Players execute high-frequency technical footwork inside the square: inside-outside cuts, sole drags, V-pulls, roll-overs, step-overs, and Cruyff turns on the whistle. Zero waiting in lines.',
    coachingPoints: '• Head up scanning open gaps between teammates\n• Soft, rapid touches using all surfaces of both feet\n• Low center of gravity with knee bend\n• Accelerate into space after every turn',
    pitchType: 'grid',
    boardObjects: [
      { type: 'token', tool: 'cone_yellow', x: 220, y: 140, sequenceId: 1 },
      { type: 'token', tool: 'cone_yellow', x: 580, y: 140, sequenceId: 1 },
      { type: 'token', tool: 'cone_yellow', x: 580, y: 380, sequenceId: 1 },
      { type: 'token', tool: 'cone_yellow', x: 220, y: 380, sequenceId: 1 },
      { type: 'token', tool: 'blue', x: 280, y: 200, label: '1' },
      { type: 'token', tool: 'ball', x: 295, y: 200 },
      { type: 'token', tool: 'blue', x: 500, y: 220, label: '2' },
      { type: 'token', tool: 'ball', x: 515, y: 220 },
      { type: 'token', tool: 'blue', x: 350, y: 320, label: '3' },
      { type: 'token', tool: 'ball', x: 365, y: 320 },
      { type: 'token', tool: 'blue', x: 400, y: 260, label: '4' },
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
    phase: 'Warm-up',
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
      { type: 'token', tool: 'blue', x: 320, y: 340, label: '4' },
      { type: 'token', tool: 'blue', x: 480, y: 340, label: '5' },
      { type: 'token', tool: 'red', x: 360, y: 240, label: '7' },
      { type: 'token', tool: 'red', x: 440, y: 240, label: '9' },
      { type: 'token', tool: 'red', x: 350, y: 300, label: '10' },
      { type: 'token', tool: 'red', x: 450, y: 300, label: '11' },
      { type: 'token', tool: 'ball', x: 315, y: 205 },
      { type: 'line', tool: 'pass', x1: 315, y1: 205, x2: 485, y2: 205, showMeasurement: true }
    ],
    diagram: ''
  },
  {
    id: 'd_bielsa_up_back_through',
    phase: 'Technical',
    name: 'Marcelo Bielsa: High-Speed "Up-Back-Through" Diamond',
    duration: 20,
    dimensions: 'Half Pitch Corridors',
    players: '10 Players (Positional Diamond)',
    description: 'CB passes Up to CM. CM lays Back to advancing FB. FB plays Through to blindside overlapping winger crossing for CF. Players rotate positions at maximum sprint speed.',
    coachingPoints: '• Timing of the run: arrive as the ball is hit, not before\n• One-touch cushion pass on the lay-off\n• Crisp, firm penetration pass along the turf\n• Maximum sprint velocity after release',
    pitchType: 'half',
    boardObjects: [
      { type: 'token', tool: 'goal', x: 400, y: 60, scale: 1.1, rotation: 0 },
      { type: 'token', tool: 'mannequin', x: 400, y: 220 },
      { type: 'token', tool: 'mannequin', x: 260, y: 200 },
      { type: 'token', tool: 'red', x: 400, y: 440, label: 'CB' },
      { type: 'token', tool: 'red', x: 400, y: 270, label: 'CM' },
      { type: 'token', tool: 'red', x: 220, y: 360, label: 'FB' },
      { type: 'token', tool: 'red', x: 190, y: 150, label: 'W' },
      { type: 'token', tool: 'red', x: 400, y: 120, label: 'CF' },
      { type: 'token', tool: 'ball', x: 415, y: 440 },
      { type: 'line', tool: 'pass', x1: 400, y1: 440, x2: 400, y2: 285, showMeasurement: true },
      { type: 'line', tool: 'pass', x1: 400, y1: 270, x2: 235, y2: 350, showMeasurement: true },
      { type: 'line', tool: 'pass', x1: 220, y1: 345, x2: 195, y2: 170, showMeasurement: true }
    ],
    diagram: ''
  },
  {
    id: 'd_ancelotti_crossing',
    phase: 'Tactical',
    name: 'Carlo Ancelotti: Box Overload & Half-Space Cutback Attack',
    duration: 25,
    dimensions: 'Attacking Half Pitch',
    players: '12 Players + 2 GKs (Attack vs Defense)',
    description: 'Midfielder switches play to wide winger who combines with overlapping fullback. FB attacks byline and cuts back to 3 attacking runners occupying Near Post, Penalty Spot, and Edge of Box.',
    coachingPoints: '• Timing of the 3 runs: stagger depths to avoid flat lines\n• Cutback targeted to penalty spot (highest conversion zone)\n• Opposite winger attacks back post for rebounds\n• Rest defense: 2 holding midfielders lock the edge',
    pitchType: 'box',
    boardObjects: [
      { type: 'token', tool: 'goal', x: 400, y: 60, scale: 1.2, rotation: 0 },
      { type: 'token', tool: 'gk', x: 400, y: 95, label: 'GK' },
      { type: 'token', tool: 'blue', x: 340, y: 130, label: '4' },
      { type: 'token', tool: 'blue', x: 460, y: 130, label: '5' },
      { type: 'token', tool: 'red', x: 570, y: 140, label: '7' },
      { type: 'token', tool: 'red', x: 370, y: 110, label: '9' },
      { type: 'token', tool: 'red', x: 430, y: 170, label: '10' },
      { type: 'token', tool: 'red', x: 300, y: 220, label: '11' },
      { type: 'token', tool: 'red', x: 400, y: 310, label: '8' },
      { type: 'token', tool: 'ball', x: 580, y: 155 },
      { type: 'line', tool: 'pass', x1: 400, y1: 310, x2: 565, y2: 150, showMeasurement: true },
      { type: 'line', tool: 'pass', x1: 570, y1: 140, x2: 435, y2: 165, showMeasurement: true }
    ],
    diagram: ''
  },
  {
    id: 'd_simeone_low_block',
    phase: 'Tactical',
    name: 'Diego Simeone: 4-4-2 Compact Low Block & Shift',
    duration: 25,
    dimensions: 'Defensive 40m Zone',
    players: '16 Players (8v8)',
    description: 'Defending team sets up in two compact lines of 4. Distance between backline and midfield line is kept strictly between 8-10m. Ball is played across; block shifts laterally as an accordion unit.',
    coachingPoints: '• Shift as the ball travels, not after arrival\n• Protect central corridor at all costs; force opponent wide\n• Near-side winger drops to double up against opposition winger\n• Constant vocal communication from center-backs',
    pitchType: 'half',
    boardObjects: [
      { type: 'token', tool: 'goal', x: 400, y: 60, scale: 1.15, rotation: 0 },
      { type: 'token', tool: 'gk', x: 400, y: 95, label: 'GK' },
      { type: 'token', tool: 'blue', x: 220, y: 170, label: '3' },
      { type: 'token', tool: 'blue', x: 340, y: 160, label: '4' },
      { type: 'token', tool: 'blue', x: 460, y: 160, label: '5' },
      { type: 'token', tool: 'blue', x: 580, y: 170, label: '2' },
      { type: 'token', tool: 'blue', x: 240, y: 250, label: '11' },
      { type: 'token', tool: 'blue', x: 350, y: 240, label: '6' },
      { type: 'token', tool: 'blue', x: 450, y: 240, label: '8' },
      { type: 'token', tool: 'blue', x: 560, y: 250, label: '7' },
      { type: 'token', tool: 'red', x: 200, y: 310, label: '2' },
      { type: 'token', tool: 'red', x: 380, y: 320, label: '8' },
      { type: 'token', tool: 'red', x: 480, y: 320, label: '10' },
      { type: 'token', tool: 'red', x: 600, y: 310, label: '3' },
      { type: 'token', tool: 'ball', x: 395, y: 320 }
    ],
    diagram: ''
  },
  {
    id: 'd_dezerbi_buildup',
    phase: 'Tactical',
    name: 'Roberto De Zerbi: Baiting the Press & 3rd Man Centering',
    duration: 25,
    dimensions: 'Defensive Half Pitch',
    players: '11 Players (GK+4+2 vs 4 Pressers)',
    description: 'Goalkeeper steps out with ball under sole to bait the pressing forward. CBs pin wide on six-yard line. Double pivot creates bounce wall. On press commitment, vertical line breaks instantly into open #10.',
    coachingPoints: '• Stand on the ball (sole control) to freeze and bait opponent forward\n• Pass into feet with high velocity, not space\n• 3rd man combination unlocks the press free man\n• Absolute composure under maximum pressure',
    pitchType: 'box',
    boardObjects: [
      { type: 'token', tool: 'goal', x: 400, y: 60, scale: 1.15, rotation: 0 },
      { type: 'token', tool: 'gk', x: 400, y: 110, label: 'GK' },
      { type: 'token', tool: 'blue', x: 260, y: 150, label: '4' },
      { type: 'token', tool: 'blue', x: 540, y: 150, label: '5' },
      { type: 'token', tool: 'blue', x: 340, y: 220, label: '6' },
      { type: 'token', tool: 'blue', x: 460, y: 220, label: '8' },
      { type: 'token', tool: 'red', x: 380, y: 160, label: '9' },
      { type: 'token', tool: 'red', x: 450, y: 160, label: '10' },
      { type: 'token', tool: 'ball', x: 412, y: 112 },
      { type: 'line', tool: 'pass', x1: 400, y1: 115, x2: 345, y2: 210, showMeasurement: true },
      { type: 'line', tool: 'pass', x1: 340, y1: 220, x2: 275, y2: 160, showMeasurement: true }
    ],
    diagram: ''
  },
  {
    id: 'd_11v11_phase',
    phase: 'Tactical',
    name: '11v11 Full-Pitch Phase of Play & Rest Defense',
    duration: 30,
    dimensions: 'Full 105x68m Pitch',
    players: '22 Players (11v11)',
    description: 'Full pitch tactical game with specific tactical constraints. Focus on offensive transitions and maintaining a strict 3-2 rest defense structure behind the ball to counter opponent breaks.',
    coachingPoints: '• Rest defense positioning: Fullback tucks inside as 3rd CB\n• Protect central passing channels when ball is in opponent box\n• High defensive line stepping up on clearances',
    pitchType: 'full',
    boardObjects: [
      { type: 'token', tool: 'gk', x: 400, y: 95, label: 'GK' },
      { type: 'token', tool: 'blue', x: 200, y: 180, label: '3' },
      { type: 'token', tool: 'blue', x: 330, y: 160, label: '4' },
      { type: 'token', tool: 'blue', x: 470, y: 160, label: '5' },
      { type: 'token', tool: 'blue', x: 600, y: 180, label: '2' },
      { type: 'token', tool: 'blue', x: 330, y: 250, label: '6' },
      { type: 'token', tool: 'blue', x: 470, y: 250, label: '8' },
      { type: 'token', tool: 'blue', x: 400, y: 320, label: '10' },
      { type: 'token', tool: 'blue', x: 210, y: 340, label: '11' },
      { type: 'token', tool: 'blue', x: 590, y: 340, label: '7' },
      { type: 'token', tool: 'blue', x: 400, y: 380, label: '9' },
      { type: 'token', tool: 'red', x: 400, y: 440, label: '4' },
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
    title: 'Carlo Ancelotti: Half-Space Cutbacks & Box Penetration',
    coach: 'Carlo Ancelotti',
    coachBadge: 'Carlo Ancelotti (Box Overload)',
    ageGroup: 'u13_u15',
    ageGroupLabel: '🔵 U13–U15 (Development)',
    category: 'Tactical',
    intensity: 'Medium',
    duration: 90,
    objectives: '• Build 3-runner box occupancy (near post, penalty spot, edge of box)\n• Rapid diagonal switches into space behind opposition fullbacks\n• Precision grounded cutbacks targeting high-conversion penalty spot zone',
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
    objectives: '• Goalkeeper steps onto ball to bait and freeze opposition front press\n• High-velocity vertical passes into central pivot feet to draw second-line press\n• Third-man combinations to bypass midfield lines and launch 4v3 attacks',
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

// Aliases for backward compatibility
SESSION_PRESETS.find(p => p.id === 'preset_klopp_heavy_metal') && (SESSION_PRESETS.push({ ...SESSION_PRESETS.find(p => p.id === 'preset_klopp_heavy_metal'), id: 'preset_high_press_433' }));
SESSION_PRESETS.find(p => p.id === 'preset_guardiola_possession') && (SESSION_PRESETS.push({ ...SESSION_PRESETS.find(p => p.id === 'preset_guardiola_possession'), id: 'preset_tikitaka_possession' }));
SESSION_PRESETS.find(p => p.id === 'preset_ancelotti_crossing') && (SESSION_PRESETS.push({ ...SESSION_PRESETS.find(p => p.id === 'preset_ancelotti_crossing'), id: 'preset_finishing_transitions' }));

// Export to window scope
if (typeof window !== 'undefined') {
  window.EQUIPMENT_PRESETS = EQUIPMENT_PRESETS;
  window.DRILL_LIBRARY = DRILL_LIBRARY;
  window.SESSION_PRESETS = SESSION_PRESETS;
  window.getLibDrill = getLibDrill;
}
