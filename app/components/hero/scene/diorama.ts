import { Group } from "three";

import { createCharacter } from "./character";
import { createChair } from "./chair";
import { createDesk, LAPTOP_SCREEN, MONITOR_SCREEN } from "./desk";
import type { MaterialLibrary } from "./palette";
import { createFloorPlant } from "./plant";
import { createScreens } from "./screens";

export interface Diorama {
  root: Group;
  /** Advances the screen animation; true when the frame needs redrawing. */
  update(elapsedSeconds: number): boolean;
}

/**
 * The whole scene: a figure at their desk. Single assembly point, so the scene
 * component and the offline preview tools build exactly the same thing.
 */
export function createDiorama(materials: MaterialLibrary): Diorama {
  const root = new Group();
  const screens = createScreens(materials, MONITOR_SCREEN, LAPTOP_SCREEN);

  root.add(
    createDesk(materials, screens),
    createChair(materials),
    createCharacter(materials),
    // Floor-standing beside the desk. Viewed from behind the figure, world -x
    // reads as frame-right, which is the side the reference puts it on.
    createFloorPlant(materials, [-1.22, 0, 0.1]),
  );

  return {
    root,
    update: (elapsedSeconds) => screens.update(elapsedSeconds),
  };
}
