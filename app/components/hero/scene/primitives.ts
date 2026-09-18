import {
  BoxGeometry,
  CylinderGeometry,
  EdgesGeometry,
  LineSegments,
  Mesh,
  SphereGeometry,
  Vector3,
  type Material,
} from "three";

export type Point = readonly [number, number, number];

const UP = new Vector3(0, 1, 0);

/** Low segment counts are deliberate — the facets are the look. */
const ROUND_SEGMENTS = 8;
const SPHERE_WIDTH_SEGMENTS = 12;
const SPHERE_HEIGHT_SEGMENTS = 8;

/** Only edges sharper than this get a contour, so facets stay unoutlined. */
const OUTLINE_ANGLE_DEG = 24;

export const box = (size: Point, material: Material, at: Point): Mesh => {
  const mesh = new Mesh(new BoxGeometry(...size), material);
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

/**
 * A capsule-ish cylinder spanning two points. Authoring limbs by their
 * endpoints is far easier to reason about than by position plus euler angles.
 */
export const connect = (
  from: Point,
  to: Point,
  radius: number,
  material: Material,
): Mesh => {
  const start = new Vector3(...from);
  const direction = new Vector3(...to).sub(start);
  const length = direction.length();

  const mesh = new Mesh(
    new CylinderGeometry(radius, radius, length, ROUND_SEGMENTS),
    material,
  );
  mesh.position.copy(start).addScaledVector(direction, 0.5);
  mesh.quaternion.setFromUnitVectors(UP, direction.normalize());
  return mesh;
};

/**
 * Adds a dark contour to a mesh's hard edges. This is what keeps the diorama
 * legible against a near-white page: the silhouette is drawn rather than
 * relying on lighting contrast alone. Added as a child so it inherits the
 * mesh's transform with no extra bookkeeping.
 */
export const outline = (mesh: Mesh, material: Material): Mesh => {
  mesh.add(new LineSegments(new EdgesGeometry(mesh.geometry, OUTLINE_ANGLE_DEG), material));
  return mesh;
};
