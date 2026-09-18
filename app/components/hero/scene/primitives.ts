import {
  BoxGeometry,
  CapsuleGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Mesh,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  type Material,
} from "three";

export type Point = readonly [number, number, number];

const UP = new Vector3(0, 1, 0);

/** Segment counts are generous: the look is smooth, not faceted. */
const ROUND_SEGMENTS = 16;
const SPHERE_WIDTH_SEGMENTS = 24;
const SPHERE_HEIGHT_SEGMENTS = 16;
const CAPSULE_CAP_SEGMENTS = 8;
const ROUNDED_BOX_CURVE_SEGMENTS = 3;

export const box = (size: Point, material: Material, at: Point): Mesh => {
  const mesh = new Mesh(new BoxGeometry(...size), material);
  mesh.position.set(...at);
  return mesh;
};

/**
 * A box with rounded edges, built from an extruded rounded rectangle with a
 * bevel. `RoundedBoxGeometry` lives in three/examples/jsm, which this project
 * does not import, so this is the core-only equivalent — and it is what gives
 * the hardware and shoe parts their soft edges.
 */
export const roundedBox = (
  size: Point,
  radius: number,
  material: Material,
  at: Point,
): Mesh => {
  const [width, height, depth] = size;
  // The bevel is added outside the extruded profile, so the profile is inset by
  // it to keep the finished mesh at the requested size. Clamping against every
  // half-dimension matters: a radius near half the smallest side would collapse
  // the profile and the bevel would then overshoot the requested bounds.
  const smallestHalf = Math.min(width, height, depth) / 2;
  const bevel = Math.min(radius, smallestHalf * 0.9);
  const cornerRadius = Math.max(radius - bevel, 0.001);
  const halfWidth = width / 2 - bevel;
  const halfHeight = height / 2 - bevel;

  const shape = new Shape();
  shape.moveTo(-halfWidth + cornerRadius, -halfHeight);
  shape.lineTo(halfWidth - cornerRadius, -halfHeight);
  shape.absarc(halfWidth - cornerRadius, -halfHeight + cornerRadius, cornerRadius, -Math.PI / 2, 0);
  shape.lineTo(halfWidth, halfHeight - cornerRadius);
  shape.absarc(halfWidth - cornerRadius, halfHeight - cornerRadius, cornerRadius, 0, Math.PI / 2);
  shape.lineTo(-halfWidth + cornerRadius, halfHeight);
  shape.absarc(-halfWidth + cornerRadius, halfHeight - cornerRadius, cornerRadius, Math.PI / 2, Math.PI);
  shape.lineTo(-halfWidth, -halfHeight + cornerRadius);
  shape.absarc(-halfWidth + cornerRadius, -halfHeight + cornerRadius, cornerRadius, Math.PI, Math.PI * 1.5);

  const geometry = new ExtrudeGeometry(shape, {
    depth: depth - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: ROUNDED_BOX_CURVE_SEGMENTS,
    curveSegments: ROUNDED_BOX_CURVE_SEGMENTS * 2,
  });
  // Extrusion grows along +z from the profile plane; recentre it on the origin.
  geometry.translate(0, 0, -(depth - bevel * 2) / 2);
  geometry.computeVertexNormals();

  const mesh = new Mesh(geometry, material);
  mesh.position.set(...at);
  return mesh;
};

export const cylinder = (
  radiusTop: number,
  radiusBottom: number,
  height: number,
  material: Material,
  at: Point,
  segments = ROUND_SEGMENTS,
): Mesh => {
  const mesh = new Mesh(
    new CylinderGeometry(radiusTop, radiusBottom, height, segments),
    material,
  );
  mesh.position.set(...at);
  return mesh;
};

export const sphere = (
  radius: number,
  material: Material,
  at: Point,
  scale: Point = [1, 1, 1],
): Mesh => {
  const mesh = new Mesh(
    new SphereGeometry(radius, SPHERE_WIDTH_SEGMENTS, SPHERE_HEIGHT_SEGMENTS),
    material,
  );
  mesh.position.set(...at);
  mesh.scale.set(...scale);
  return mesh;
};

/** Upper half of a sphere — the beanie dome, the hood roll. */
export const dome = (
  radius: number,
  material: Material,
  at: Point,
  scale: Point = [1, 1, 1],
): Mesh => {
  const mesh = new Mesh(
    new SphereGeometry(
      radius,
      SPHERE_WIDTH_SEGMENTS,
      SPHERE_HEIGHT_SEGMENTS,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2,
    ),
    material,
  );
  mesh.position.set(...at);
  mesh.scale.set(...scale);
  return mesh;
};

export const cone = (
  radius: number,
  height: number,
  material: Material,
  at: Point,
  segments = ROUND_SEGMENTS,
): Mesh => {
  const mesh = new Mesh(new ConeGeometry(radius, height, segments), material);
  mesh.position.set(...at);
  return mesh;
};

/** Partial torus, for mug and headphone handles. `arc` in radians. */
export const torus = (
  radius: number,
  tube: number,
  material: Material,
  at: Point,
  arc = Math.PI * 2,
): Mesh => {
  const mesh = new Mesh(new TorusGeometry(radius, tube, 10, 20, arc), material);
  mesh.position.set(...at);
  return mesh;
};

/**
 * A rounded limb spanning two points. Authoring arms and legs by their
 * endpoints is far easier to reason about than by position plus euler angles,
 * and the capsule's caps give the soft joints the style wants.
 */
export const limb = (
  from: Point,
  to: Point,
  radius: number,
  material: Material,
): Mesh => {
  const start = new Vector3(...from);
  const direction = new Vector3(...to).sub(start);
  const span = direction.length();

  const mesh = new Mesh(
    new CapsuleGeometry(radius, Math.max(span - radius, 0.001), CAPSULE_CAP_SEGMENTS, ROUND_SEGMENTS),
    material,
  );
  mesh.position.copy(start).addScaledVector(direction, 0.5);
  mesh.quaternion.setFromUnitVectors(UP, direction.normalize());
  return mesh;
};
