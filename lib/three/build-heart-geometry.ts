/* =========================================================================
   Procedural anatomical heart geometry.

   There is no scanned/sourced heart model available to this build. A
   symmetric curve — even skewed afterward — still reads as the iconic
   Valentine/emoji silhouette, which is exactly what this needs to avoid.
   So the outline below is hand-authored directly as an asymmetric shape:
   one lobe bigger and lower than the other, a shallow off-centre top
   cleft rather than a sharp V-notch, and a blunter, offset apex. It's
   then extruded with a heavy bevel so the rounding gives it real
   lens-like volume rather than a flat cutout. The great vessels and
   coronary vessels are separate meshes/tubes layered on top in
   heart-scene.tsx, positioned from the same outline this returns.
   ========================================================================= */

import * as THREE from "three";

export interface HeartGeometryResult {
  geometry: THREE.BufferGeometry;
  /** The dense 2D outline this was built from, for placing vessels consistently against the same silhouette. */
  outline: THREE.Vector2[];
  depth: number;
}

/** Hand-authored asymmetric silhouette, traced clockwise from the apex up the larger lobe. */
function buildOutline(): THREE.Vector2[] {
  const shape = new THREE.Shape();

  shape.moveTo(-0.06, -1.32);
  // Up the right, larger lobe — stays wide as it climbs, so the top reads as
  // a proper shoulder rather than narrowing into a teardrop.
  shape.bezierCurveTo(0.4, -1.14, 0.86, -0.68, 0.94, -0.1);
  shape.bezierCurveTo(1.0, 0.28, 0.94, 0.5, 0.82, 0.58);
  shape.bezierCurveTo(0.68, 0.68, 0.5, 0.7, 0.36, 0.66);
  // Shallow off-centre cleft — not a sharp valentine notch.
  shape.bezierCurveTo(0.24, 0.72, 0.1, 0.76, -0.12, 0.74);
  // Down across the smaller, higher-set left lobe — still a real shoulder,
  // just tighter and lower than the right one.
  shape.bezierCurveTo(-0.42, 0.71, -0.62, 0.52, -0.66, 0.22);
  shape.bezierCurveTo(-0.7, -0.14, -0.52, -0.48, -0.29, -0.78);
  // Back in to the apex, blunter than a sharp point.
  shape.bezierCurveTo(-0.19, -0.98, -0.13, -1.18, -0.06, -1.32);
  shape.closePath();

  return shape.getPoints(120);
}

function normalizeToHeight(points: THREE.Vector2[], targetHeight: number) {
  const box = new THREE.Box2().setFromPoints(points);
  const size = new THREE.Vector2();
  box.getSize(size);
  const scale = targetHeight / size.y;
  const center = new THREE.Vector2();
  box.getCenter(center);
  return points.map((p) => new THREE.Vector2((p.x - center.x) * scale, (p.y - center.y) * scale));
}

export function buildHeartGeometry(): HeartGeometryResult {
  const outline = normalizeToHeight(buildOutline(), 2.5);

  const shape = new THREE.Shape();
  shape.moveTo(outline[0].x, outline[0].y);
  for (let i = 1; i < outline.length; i++) shape.lineTo(outline[i].x, outline[i].y);
  shape.closePath();

  const depth = 0.55;
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.42,
    bevelSize: 0.34,
    bevelSegments: 10,
    curveSegments: 1,
  });

  geometry.center();
  geometry.computeVertexNormals();

  return { geometry, outline, depth };
}

/** A handful of front-face coronary vessel paths, traced from the same outline used to build the shell.
 *  Held at a Z safely beyond the extrude's front bevel apex everywhere, so they
 *  always sit visibly proud of the surface rather than risking a sliver of
 *  self-occlusion from trying to hug the true (harder to compute) bevel curve. */
export function buildCoronaryCurves(outline: THREE.Vector2[]) {
  const frontZ = 0.82;
  const at = (fraction: number, inset: number) => {
    const i = Math.floor(fraction * outline.length) % outline.length;
    const p = outline[i];
    return new THREE.Vector3(p.x * inset, p.y * inset, frontZ);
  };

  // Left anterior descending — from the cleft straight down the front toward the apex.
  const lad = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.08, 0.55, frontZ),
    new THREE.Vector3(0.05, 0.15, frontZ),
    new THREE.Vector3(0.0, -0.25, frontZ),
    new THREE.Vector3(-0.03, -0.65, frontZ),
    new THREE.Vector3(-0.05, -1.0, frontZ),
  ]);

  // Right coronary artery — wraps the bigger lobe's outer curve.
  const rca = new THREE.CatmullRomCurve3([at(0.94, 0.72), at(0.86, 0.85), at(0.76, 0.82), at(0.66, 0.72), at(0.56, 0.58)]);

  // Circumflex — a short branch on the smaller lobe.
  const circumflex = new THREE.CatmullRomCurve3([at(0.35, 0.55), at(0.29, 0.4), at(0.23, 0.28)]);

  return [lad, rca, circumflex];
}
