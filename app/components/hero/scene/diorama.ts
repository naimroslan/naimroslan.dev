import { Group } from "three";

import { createCharacter } from "./character";
import { createChair } from "./chair";
import { createDesk } from "./desk";
import { createDecor } from "./decor";
import { createLoftLevel } from "./loft";
import { createRoom, ROOM } from "./room";
import type { MaterialLibrary } from "./palette";

/**
 * Places the desk nook against the cottage's left wall.
 *
 * The desk, chair and figure were authored facing +z with the desk in front of
 * them, so rotating the assembly -90° about Y puts the desk against the -x
 * wall with the figure facing into it. That leaves the camera at roughly 90° to
 * the figure's facing, which is the only arrangement that shows them *and* the
 * desk gear: from directly in front the monitor covers the whole torso, and
 * from behind you only ever see their back.
 */
const NOOK_ROTATION_Y = -Math.PI / 2;
/** Puts the desk's far edge just inside the left wall. */
const NOOK_X = ROOM.minX + 0.485;
const NOOK_Z = -0.05;

export function createDiorama(materials: MaterialLibrary): Group {
  const diorama = new Group();
  diorama.add(createRoom(materials), createDecor(materials), createLoftLevel(materials));

  const nook = new Group();
  nook.add(createDesk(materials), createChair(materials), createCharacter(materials));
  nook.rotation.y = NOOK_ROTATION_Y;
  nook.position.set(NOOK_X, 0, NOOK_Z);
  diorama.add(nook);

  return diorama;
}
