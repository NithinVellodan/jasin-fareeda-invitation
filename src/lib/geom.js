// Small geometry helpers for building organic SVG outlines (petals, wax).

const f = (n) => Math.round(n * 100) / 100;

// Smooth path through points (Catmull-Rom converted to cubic Beziers).
export function smoothPath(points, closed = true, tension = 1) {
  const n = points.length;
  const at = (i) => (closed ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f(points[0][0])} ${f(points[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;
    d += `C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return closed ? d + 'Z' : d;
}

// Irregular round outline (wax seal), radius modulated by a few sines.
export function blobPath(r, wobble = [[3, 3.2, 0.6], [5, 2.4, 2.1], [8, 1.6, 4], [13, 1.1, 1.3]], count = 64) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    let rr = r;
    for (const [k, amp, ph] of wobble) rr += amp * Math.sin(k * a + ph);
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
  }
  return smoothPath(pts, true);
}
