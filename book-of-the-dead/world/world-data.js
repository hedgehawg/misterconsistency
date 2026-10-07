/* Book of the Dead World: the layout. Everything in this file is invention or editorial arrangement
   (see ledger.js for what the text actually says). Unit: royal cubit. Axis: +x east, -x west, +y up, +z south.
   The sun's path runs from the West notch (land of the living, surface) down through the Duat and out at the East gate. */
window.BOD_WORLD = {
  unit: 'cubit',
  surfaceY: 0, duatY: -140, riverY: -200,
  west: -2500, east: 2500, depth: 1400, cliffHeight: 60, skyRadius: 3000,
  // Camera targets per place: where to look, from how far, and how high the place pill sits. Editorial.
  places: {
    thebes:   { label:'Thebes',    at:[ 1500,    4,  -60], dist: 260, pill: 30 },
    west:     { label:'West',      at:[-2500,   20,    0], dist: 420, pill: 90 },
    tomb:     { label:'Tomb',      at:[-2508,    3,  -60], dist:  60, pill: 36 },
    rosetau:  { label:'Rosetau',   at:[-2430,  -70,  -70], dist: 240, pill: 10 },
    sycamore: { label:'Sycamore',  at:[-2250, -138,   20], dist: 110, pill: 30 },
    duat:     { label:'The Duat',  at:[    0, -120,    0], dist:3400, pill:420 },
    arits:    { label:'Arits',     at:[-1720, -130,    0], dist: 400, pill: 70 },
    pylons:   { label:'Pylons',    at:[ -905, -115,  -50], dist:1030, pill:110, dir:[0, 0.62, 1] },
    cities:   { label:'Councils',  at:[ -180, -135,    0], dist: 260, pill: 12 },
    hall:     { label:'Hall',      at:[  120, -128,    0], dist: 260, pill: 95 },
    throne:   { label:'Throne',    at:[  222, -130,    0], dist: 110, pill:170 },
    lake:     { label:'Lake',      at:[  120, -138,  160], dist: 150, pill: 24 },
    fields:   { label:'Field',     at:[ 1300, -138,  190], dist:1500, pill: 90, dir:[0.2, 0.75, 1] },
    sky:      { label:'Sky',       at:[    0,  600,    0], dist:4200, pill:1800 },
    boat:     { label:'Boat',      at:[ -300, -198,  520], dist:  90, pill: 24, dir:[1, 0.6, 0.08] },
    east:     { label:'East',      at:[ 2470,  -90,    0], dist: 240, pill:130, dir:[-0.7, 0.45, 0.6] },
    aats:     { label:'Aats (Nu)', at:[    0, -130, -540], dist:1900, pill: 40, dir:[0.02, 1.15, 0.55] }
  },
  // Editorial route in ledger order. Not a canonical itinerary. The Aats of Nu come last: another manuscript's regions, not Ani's road.
  route: ['thebes','west','tomb','rosetau','sycamore','duat','arits','pylons','cities','hall','throne','lake','fields','sky','boat','east','aats'],
  // House palette: bronze and gold on the dark ground.
  palette: {
    bg: 0x0e0f12, ground: 0x2a2419, rock: 0x2c271f, slab: 0x4a3d28,
    bronze: 0x8a6830, bronzeDark: 0x5a4422, gold: 0xd0a44c, goldSoft: 0x8f6f32,
    figure: 0xb8964f, figureDark: 0x7a5f36, water: 0x16464c, green: 0x3f7a3f, grain: 0x9a8840,
    flame: 0xe0702a, flameHot: 0xffc46a, star: 0xe8e6e1,
    metal: 0x8a8d94, tintGreen: 0x2f5a35, tintYellow: 0x7a6a28, witness: 0x6fb3a0
  }
};
