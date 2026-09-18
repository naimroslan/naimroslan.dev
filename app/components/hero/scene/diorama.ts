import { Group } from "three";

import { createCharacter } from "./character";
import { createChair } from "./chair";
import { createDesk } from "./desk";
import type { MaterialLibrary } from "./palette";

/**
 * The whole scene: a figure at their desk, free-standing. Single assembly point
 * so the scene component and the offline preview tools build the same thing.
 */
export function createDiorama(materials: MaterialLibrary): Group {
  const diorama = new Group();
  diorama.add(createDesk(materials), createChair(materials), createCharacter(materials));
  return diorama;
}
