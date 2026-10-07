// Analytic ephemerides for the Lagrangian Points model. All positions are heliocentric (or geocentric for the Moon),
// ecliptic J2000, in km; angles in degrees inside, radians out where noted. Sources:
//   planets: E. M. Standish, "Keplerian Elements for Approximate Positions of the Major Planets" (JPL), valid 1800–2050
//   Moon:    J. Meeus, Astronomical Algorithms, ch. 47, main terms of the ELP-2000/82 series (truncated)
//   Earth rotation: Greenwich mean sidereal time, IAU 1982 expression
const DEG = Math.PI / 180, AU_KM = 149597870.7, J2000 = 2451545.0;
export const OBLIQUITY = 23.439291;                       // mean obliquity at J2000, degrees
export const MOON_MASS_FRACTION = 0.012150586;           // m_moon / (m_earth + m_moon)
export const SUN_OVER_EM = 328900.5596;                   // m_sun / (m_earth + m_moon)

// Keplerian elements at J2000 and their rates per Julian century: a (AU), e, I, L, long. perihelion, long. node (degrees)
const ELEMENTS = {
  mercury: [[0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593], [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081]],
  venus:   [[0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255], [0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418]],
  emb:     [[1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0], [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0]],
};
const wrap = (d) => ((d % 360) + 360) % 360;

export function julianDay(date) { return date.getTime() / 86400000 + 2440587.5; }
export function dateOfJD(jd) { return new Date((jd - 2440587.5) * 86400000); }

// heliocentric position of a planet (or the Earth–Moon barycentre) in km, ecliptic J2000
export function planet(key, jd) {
  const [e0, r] = ELEMENTS[key], T = (jd - J2000) / 36525;
  const a = e0[0] + r[0] * T, e = e0[1] + r[1] * T, I = (e0[2] + r[2] * T) * DEG, L = e0[3] + r[3] * T, w = e0[4] + r[4] * T, O = e0[5] + r[5] * T;
  const M = wrap(L - w) * DEG, omega = (w - O) * DEG, Om = O * DEG;
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 8; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  const xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const cw = Math.cos(omega), sw = Math.sin(omega), cO = Math.cos(Om), sO = Math.sin(Om), cI = Math.cos(I), sI = Math.sin(I);
  return {
    x: (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
    y: (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
    z: (sw * sI) * xp + (cw * sI) * yp,
  };
}
// scale AU → km
for (const k of Object.keys(ELEMENTS)) { /* elements stay in AU; callers use planetKm */ }
export function planetKm(key, jd) { const p = planet(key, jd); return { x: p.x * AU_KM, y: p.y * AU_KM, z: p.z * AU_KM }; }

// geocentric Moon, km, ecliptic J2000 (Meeus ch. 47 truncated; about 0.01° in longitude, tens of km in distance)
const LR = [ // D, M, M', F, Σl (1e-6 deg), Σr (1e-3 km)
  [0,0,1,0,6288774,-20905355],[2,0,-1,0,1274027,-3699111],[2,0,0,0,658314,-2955968],[0,0,2,0,213618,-569925],[0,1,0,0,-185116,48888],
  [0,0,0,2,-114332,-3149],[2,0,-2,0,58793,246158],[2,-1,-1,0,57066,-152138],[2,0,1,0,53322,-170733],[2,-1,0,0,45758,-204586],
  [0,1,-1,0,-40923,-129620],[1,0,0,0,-34720,108743],[0,1,1,0,-30383,104755],[2,0,0,-2,15327,10321],[0,0,1,2,-12528,0],
  [0,0,1,-2,10980,79661],[4,0,-1,0,10675,-34782],[0,0,3,0,10034,-23210],[4,0,-2,0,8548,-21636],[2,1,-1,0,-7888,24208],
  [2,1,0,0,-6766,30824],[1,0,-1,0,-5163,-8379],[1,1,0,0,4987,-16675],[2,-1,1,0,4036,-12831],[2,0,2,0,3994,-10445],
  [4,0,0,0,3861,-11650],[2,0,-3,0,3665,14403],[0,1,-2,0,-2689,-7003],[2,0,-1,2,-2602,0],[2,-1,-2,0,2390,10056],
  [1,0,1,0,-2348,6322],[2,-2,0,0,2236,-9884],[0,1,2,0,-2120,5751],[0,2,0,0,-2069,0],[2,-2,-1,0,2048,-4950],
  [2,0,1,-2,-1773,4130],[2,0,0,2,-1595,0],[4,-1,-1,0,1215,-3958],[0,0,2,2,-1110,0],[3,0,-1,0,-892,3258],
];
const LB = [ // D, M, M', F, Σb (1e-6 deg)
  [0,0,0,1,5128122],[0,0,1,1,280602],[0,0,1,-1,277693],[2,0,0,-1,173237],[2,0,-1,1,55413],[2,0,-1,-1,46271],[2,0,0,1,32573],
  [0,0,2,1,17198],[2,0,1,-1,9266],[0,0,2,-1,8822],[2,-1,0,-1,8216],[2,0,-2,-1,4324],[2,0,1,1,4200],[2,1,0,-1,-3359],
  [2,-1,-1,1,2463],[2,-1,0,1,2211],[2,-1,-1,-1,2065],[0,1,-1,-1,-1870],[4,0,-1,-1,1828],[0,1,0,1,-1794],[0,0,0,3,-1749],
  [0,1,-1,1,-1565],[1,0,0,1,-1491],[0,1,1,1,-1475],[0,1,1,-1,-1410],[0,1,0,-1,-1344],[1,0,0,-1,-1335],[0,0,3,1,1107],
  [4,0,0,-1,1021],[4,0,-1,1,833],
];
export function moonGeoKm(jd) {
  const T = (jd - J2000) / 36525;
  const Lp = wrap(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841);
  const D = wrap(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868) * DEG;
  const M = wrap(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T) * DEG;
  const Mp = wrap(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699) * DEG;
  const F = wrap(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000) * DEG;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  let sl = 0, sr = 0, sb = 0;
  for (const [d, m, mp, f, l, r] of LR) { const arg = d * D + m * M + mp * Mp + f * F, k = Math.abs(m) === 1 ? E : Math.abs(m) === 2 ? E * E : 1; sl += l * k * Math.sin(arg); sr += r * k * Math.cos(arg); }
  for (const [d, m, mp, f, b] of LB) { const arg = d * D + m * M + mp * Mp + f * F, k = Math.abs(m) === 1 ? E : Math.abs(m) === 2 ? E * E : 1; sb += b * k * Math.sin(arg); }
  const A1 = (119.75 + 131.849 * T) * DEG, A2 = (53.09 + 479264.290 * T) * DEG, A3 = (313.45 + 481266.484 * T) * DEG;
  sl += 3958 * Math.sin(A1) + 1962 * Math.sin(Lp * DEG - F) + 318 * Math.sin(A2);
  sb += -2235 * Math.sin(Lp * DEG) + 382 * Math.sin(A3) + 175 * Math.sin(A1 - F) + 175 * Math.sin(A1 + F) + 127 * Math.sin(Lp * DEG - Mp) - 115 * Math.sin(Lp * DEG + Mp);
  // longitude of date → J2000 (general precession in longitude, 1.3970° per century)
  const lon = (Lp + sl / 1e6 - 1.3970 * T) * DEG, lat = (sb / 1e6) * DEG, dist = 385000.56 + sr / 1000;
  return { x: dist * Math.cos(lat) * Math.cos(lon), y: dist * Math.cos(lat) * Math.sin(lon), z: dist * Math.sin(lat) };
}
// Earth from the barycentre and the Moon; the Moon in heliocentric terms is earth + moonGeo
export function earthKm(jd) {
  const b = planetKm('emb', jd), m = moonGeoKm(jd), f = MOON_MASS_FRACTION;
  return { x: b.x - f * m.x, y: b.y - f * m.y, z: b.z - f * m.z };
}
// Greenwich mean sidereal time, radians
export function gmst(jd) {
  const d = jd - J2000, T = d / 36525;
  return wrap(280.46061837 + 360.98564736629 * d + 0.000387933 * T * T - T * T * T / 38710000) * DEG;
}
// collinear Lagrange distances from the secondary, as a fraction of the primary–secondary separation (quintic, Newton)
export function collinear(mu) {
  const f1 = (g) => mu / (g * g) - (1 - mu) / ((1 - g) * (1 - g)) + 1 - mu - g;        // L1: between, g measured toward the primary
  const f2 = (g) => mu / (g * g) + (1 - mu) / ((1 + g) * (1 + g)) - 1 + mu - g;        // L2: beyond the secondary
  const solve = (f, g) => { for (let i = 0; i < 40; i++) { const h = 1e-7, d = (f(g + h) - f(g - h)) / (2 * h); g -= f(g) / d; } return g; };
  const g0 = Math.cbrt(mu / 3);
  return { l1: solve(f1, g0), l2: solve(f2, g0), l3: 1 + 7 * mu / 12 };
}
