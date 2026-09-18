import { Group, type Material } from "three";

import { PALETTE, type MaterialLibrary } from "./palette";
import { box, connect, cylinder, outline, sphere } from "./primitives";

/**
 * Seated, facing +z (the camera's home position). The desk module shares this
 * frame: y = 0 is the floor and the desk surface sits at DESK_SURFACE_Y.
 */
const BODY_Z = -0.62;
const SHOULDER_Y = 0.96;
const HAND_Y = 0.81;
/** Just proud of the head's front surface, so face details sit on it. */
const FACE_Z = BODY_Z + 0.126;

const UPPER_ARM_RADIUS = 0.052;
const FOREARM_RADIUS = 0.045;
const HAND_RADIUS = 0.05;

export function createCharacter(materials: MaterialLibrary, contour: Material): Group {
  const character = new Group();

  const skin = materials.get(PALETTE.skin);
  const bomber = materials.get(PALETTE.bomber);
  const hood = materials.get(PALETTE.hood);
  const hoodie = materials.get(PALETTE.hoodie);
  const chair = materials.get(PALETTE.chair);

  // --- chair, just enough to read as "seated" ---
  character.add(
    box([0.42, 0.05, 0.4], chair, [0, 0.43, BODY_Z - 0.04]),
    outline(box([0.4, 0.46, 0.06], chair, [0, 0.78, BODY_Z - 0.24]), contour),
  );

  // --- body ---
  const hips = box([0.34, 0.16, 0.30], materials.get(PALETTE.pants), [0, 0.53, BODY_Z]);

  const torso = cylinder(0.225, 0.20, 0.40, bomber, [0, 0.81, BODY_Z]);
  torso.scale.set(1, 1, 0.8);

  const shoulders = cylinder(0.215, 0.215, 0.10, bomber, [0, 0.98, BODY_Z]);
  shoulders.scale.set(1, 1, 0.8);

  character.add(outline(hips, contour), outline(torso, contour), outline(shoulders, contour));

  // --- hoodie and tee showing through the open jacket ---
  character.add(
    cylinder(0.105, 0.115, 0.08, hoodie, [0, 1.04, BODY_Z]),
    box([0.10, 0.22, 0.04], materials.get(PALETTE.tee), [0, 0.88, BODY_Z + 0.16]),
    box([0.035, 0.26, 0.04], hoodie, [-0.075, 0.87, BODY_Z + 0.16]),
    box([0.035, 0.26, 0.04], hoodie, [0.075, 0.87, BODY_Z + 0.16]),
  );

  // --- the olive hood: bunched behind the neck, two drawstring-ish drapes in front ---
  character.add(
    box([0.26, 0.16, 0.10], hood, [0, 1.02, BODY_Z - 0.16]),
    connect([-0.09, 1.04, BODY_Z + 0.17], [-0.10, 0.70, BODY_Z + 0.17], 0.028, hood),
    connect([0.09, 1.04, BODY_Z + 0.17], [0.10, 0.70, BODY_Z + 0.17], 0.028, hood),
  );

  // --- head ---
  const head = sphere(0.135, skin, [0, 1.21, BODY_Z], [1, 1.08, 0.95]);
  character.add(
    cylinder(0.055, 0.06, 0.1, skin, [0, 1.07, BODY_Z]),
    outline(head, contour),
    sphere(0.028, skin, [-0.13, 1.2, BODY_Z]),
    sphere(0.028, skin, [0.13, 1.2, BODY_Z]),
  );

  // A face, kept to the few marks that read at this scale. The eyes are
  // deliberately unlit — shaded eyes turn grey and look lifeless.
  const iris = materials.unlit(PALETTE.eye);
  const brow = materials.get(PALETTE.cap);
  character.add(
    box([0.028, 0.034, 0.012], iris, [-0.052, 1.205, FACE_Z]),
    box([0.028, 0.034, 0.012], iris, [0.052, 1.205, FACE_Z]),
    box([0.038, 0.012, 0.01], brow, [-0.052, 1.232, FACE_Z]),
    box([0.038, 0.012, 0.01], brow, [0.052, 1.232, FACE_Z]),
    box([0.022, 0.03, 0.026], materials.get(PALETTE.skinShadow), [0, 1.185, FACE_Z]),
  );

  // --- flat-topped cap, sitting low the way it does in the photo ---
  const cap = materials.get(PALETTE.cap);
  character.add(
    outline(cylinder(0.138, 0.142, 0.115, cap, [0, 1.325, BODY_Z], 12), contour),
    outline(cylinder(0.147, 0.147, 0.022, cap, [0, 1.272, BODY_Z], 12), contour),
  );

  // --- arms, resting on the desk: left hand at the laptop, right at the notebook ---
  character.add(
    connect([0.2, SHOULDER_Y, BODY_Z], [0.26, 0.8, -0.5], UPPER_ARM_RADIUS, bomber),
    connect([0.26, 0.8, -0.5], [0.12, HAND_Y, -0.22], FOREARM_RADIUS, bomber),
    sphere(HAND_RADIUS, skin, [0.1, HAND_Y, -0.18]),

    connect([-0.2, SHOULDER_Y, BODY_Z], [-0.3, 0.8, -0.5], UPPER_ARM_RADIUS, bomber),
    connect([-0.3, 0.8, -0.5], [-0.35, HAND_Y, -0.28], FOREARM_RADIUS, bomber),
    sphere(HAND_RADIUS, skin, [-0.36, HAND_Y, -0.24]),
  );

  return character;
}
