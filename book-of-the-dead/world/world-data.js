/* Book of the Dead World: the layout. Everything in this file is invention or editorial arrangement
   (see ledger.js for what the text actually says). Unit: royal cubit. Axis: +x east, -x west, +y up, +z south.
   The sun's path runs from the West notch (land of the living, surface) down through the Duat and out at the East gate. */
window.BOD_WORLD = {
  unit: 'cubit',
  surfaceY: 0, duatY: -140, riverY: -200,
  west: -2500, east: 2500, depth: 1400, cliffHeight: 60, skyRadius: 3000,
  // Camera targets per place: where to look, from how far, and how high the place pill sits. Editorial.
  places: {
    thebes:   { label:'Thebes',    at:[ 1510,    3,  -60], dist: 110, pill: 30, dir:[0.55, 0.5, 1] },
    west:     { label:'West',      at:[-2500,   20,    0], dist: 420, pill: 90 },
    tomb:     { label:'Tomb',      at:[-2508,    2,  -60], dist:  42, pill: 36, dir:[0.8, 0.85, 0.5] },
    rosetau:  { label:'Rosetau',   at:[-2430,  -70,  -70], dist: 200, pill: 10, dir:[0.75, 0.55, 0.9] },
    sycamore: { label:'Sycamore',  at:[-2252, -136,   20], dist:  80, pill: 30, dir:[0.7, 0.5, 0.9] },
    duat:     { label:'The Duat',  at:[    0, -120,    0], dist:3400, pill:420, dir:[0.12, 0.95, 1] },
    arits:    { label:'Arits',     at:[-1760, -130,    0], dist: 190, pill: 70, dir:[-1, 0.45, 0.45] },
    pylons:   { label:'Pylons',    at:[ -930, -118,  -30], dist: 620, pill:110, dir:[-0.75, 0.5, 0.8] },
    cities:   { label:'Councils',  at:[ -215, -135,    0], dist: 150, pill: 12, dir:[-0.8, 0.6, 0.8] },
    hall:     { label:'Hall',      at:[  115, -130,    0], dist: 210, pill: 95, dir:[-0.95, 0.72, 0.4] },
    throne:   { label:'Throne',    at:[  222, -130,    0], dist: 110, pill:170, dir:[-0.75, 0.8, 0.9] },
    lake:     { label:'Lake',      at:[  120, -138,  160], dist: 115, pill: 24, dir:[-0.35, 0.75, 0.85] },
    fields:   { label:'Field',     at:[ 1250, -138,  120], dist:1050, pill: 90, dir:[-0.55, 0.6, 0.95] },
    sky:      { label:'Sky',       at:[    0,  600,    0], dist:4200, pill:1800 },
    boat:     { label:'Boat',      at:[ -300, -198,  520], dist:  72, pill: 24, dir:[-0.9, 0.5, 0.4] },
    east:     { label:'East',      at:[ 2465, -110,    0], dist: 190, pill:130, dir:[-0.8, 0.45, 0.6] },
    aats:     { label:'Aats (Nu)', at:[ -300, -130, -540], dist:1300, pill: 40, dir:[0.02, 1.0, 0.6] }
  },
  // Editorial route in ledger order. Not a canonical itinerary. The Aats of Nu come last: another manuscript's regions, not Ani's road.
  route: ['thebes','west','tomb','rosetau','sycamore','duat','arits','pylons','cities','hall','throne','lake','fields','sky','boat','east','aats'],
  // The camera's way into each room, from the room before: waypoints the eye follows (the causeway, the door, the stair, the valley,
  // the river) so the journey moves through one continuous space. Editorial; the text gives no road.
  paths: {
    thebes:   { via: [[1900, 120, 500], [1640, 8, -30]] },
    west:     { via: [[1200, 5, -60], [-800, 5, -60], [-2300, 6, -60]] },
    tomb:     { via: [[-2470, 6, -60], [-2496, 4, -60]] },
    rosetau:  { via: [[-2508, 3, -66], [-2496, -8, -70], [-2460, -42, -70]] },
    sycamore: { via: [[-2390, -126, -70], [-2355, -134, -70], [-2310, -138, -30]] },
    duat:     { via: [[-2150, -60, 60], [-1500, 500, 400]] },
    arits:    { via: [[-2000, -80, 40], [-1930, -131, 0]] },
    pylons:   { via: [[-1490, -132, 0], [-1270, -128, 0]] },
    cities:   { via: [[-520, -132, 0], [-380, -134, 0]] },
    hall:     { via: [[-70, -133, 0], [40, -130, 0]] },
    throne:   { via: [[196, -130, 0], [208, -131, 0]] },
    lake:     { via: [[232, -122, 24], [190, -128, 120]] },
    fields:   { via: [[300, -134, 170], [760, -136, 185]] },
    sky:      { via: [[1800, -130, 100], [2090, -124, -160], [2150, -60, 100], [2150, 160, 100], [1200, 700, 200]] },
    boat:     { via: [[-1600, 420, 600], [-2470, -150, 520], [-1500, -196, 520], [-800, -197, 520]] },
    east:     { via: [[200, -196, 520], [1300, -196, 520], [2320, -192, 520], [2450, -150, 300]] },
    aats:     { via: [[2430, -112, -260], [2280, -124, -500], [1100, -126, -520]] }
  },
  // The pilgrim's road drawn faintly on the ground: the causeway to the tomb, the stair, the valley of gates to the Hall, the Field to
  // the ladder; the night river to the eastern gate and the band of the Aats. Editorial.
  road: [
    [[1700, 1, -60], [-2490, 1, -60], [-2508, 1, -66], [-2496, -8, -70], [-2460, -42, -70], [-2390, -126, -70], [-2355, -138, -70], [-2310, -138, -30], [-2250, -138, 20], [-2150, -138, 20], [-1960, -138, 0], [-1720, -138, 0], [-1490, -138, 0], [-905, -138, 0], [-520, -138, 0], [-180, -138, 0], [40, -138, 0], [120, -138, 0], [196, -138, 0], [222, -138, 0]],
    [[222, -138, 24], [190, -138, 120], [120, -138, 160], [300, -138, 170], [760, -138, 185], [1300, -138, 190], [1800, -138, 100], [2090, -138, -160], [2150, -138, 100]],
    [[-2470, -199, 520], [-300, -199, 520], [1300, -199, 520], [2320, -199, 520], [2450, -150, 300], [2470, -138, 0], [2430, -138, -260], [2280, -138, -500], [0, -138, -540]]
  ],
  // House palette: bronze and gold on the dark ground.
  palette: {
    bg: 0x0e0f12, ground: 0x2a2419, rock: 0x2c271f, slab: 0x4a3d28,
    bronze: 0x8a6830, bronzeDark: 0x5a4422, gold: 0xd0a44c, goldSoft: 0x8f6f32,
    figure: 0xb8964f, figureDark: 0x7a5f36, water: 0x16464c, green: 0x3f7a3f, grain: 0x9a8840,
    flame: 0xe0702a, flameHot: 0xffc46a, star: 0xe8e6e1,
    metal: 0x8a8d94, tintGreen: 0x2f5a35, tintYellow: 0x7a6a28, witness: 0x6fb3a0
  }
};
