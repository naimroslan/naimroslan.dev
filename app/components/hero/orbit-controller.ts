import type { PerspectiveCamera, Vector3 } from "three";

/**
 * Drag is unbounded — the room spins a full 360° and beyond. The *automatic*
 * motion, though, is a gentle oscillation around the opening view, and after a
 * drag the camera eases back to it by the shortest way round.
 *
 * The reason is what the back of a cutaway looks like: a featureless shell.
 * Continuous rotation would park there half the time, so the room presents its
 * open side at rest and the spin stays available on demand.
 */
const AUTO_SWEEP_AMPLITUDE_RAD = 0.34;
const AUTO_PHASE_SPEED_RAD_S = 0.2;
const AUTO_RETURN_RATE = 1.1;
const TWO_PI = Math.PI * 2;

const DRAG_RAD_PER_PX = 0.006;
const RESUME_DELAY_MS = 2000;
const DAMPING_RATE = 10;

const POLAR_MIN_RAD = 0.72;
const POLAR_MAX_RAD = 1.28;
const POLAR_REST_RAD = 0.95;
const POLAR_RECENTER_RATE = 1.1;

/** Pointer travel before a touch gesture is classified as rotate or scroll. */
const DIRECTION_GATE_PX = 6;
/** Below this per-frame change the camera counts as settled and stops redrawing. */
const SETTLED_EPSILON_RAD = 1e-5;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** Wraps an angular difference into (-PI, PI], so the return takes the short way. */
const shortestTurn = (delta: number) => {
  const wrapped = ((delta % TWO_PI) + TWO_PI) % TWO_PI;
  return wrapped > Math.PI ? wrapped - TWO_PI : wrapped;
};

/** Frame-rate independent exponential approach. */
const damp = (current: number, target: number, rate: number, deltaSeconds: number) =>
  current + (target - current) * (1 - Math.exp(-rate * deltaSeconds));

type GestureKind = "undetermined" | "rotate" | "scroll";

export interface OrbitOptions {
  radius: number;
  target: Vector3;
  /** Opening angle, so the scene starts on its best view rather than on an axis. */
  startAzimuth?: number;
  autoRotate?: boolean;
}

export interface OrbitController {
  /** Returns whether the camera actually moved, so a settled scene can skip drawing. */
  update(deltaSeconds: number, camera: PerspectiveCamera): boolean;
  setRadius(radius: number): void;
  dispose(): void;
}

/**
 * Sweeps the camera automatically, hands control to the pointer on drag, then
 * eases back onto the sweep once the pointer has been idle.
 *
 * Deliberately not `three/examples/jsm/controls/OrbitControls`: its one-finger
 * touch rotate swallows vertical scrolling and its wheel zoom swallows page
 * scrolling, either of which would trap a visitor in the hero of a
 * single-page site.
 *
 * `touch-action: pan-y pinch-zoom` leaves vertical panning and pinch zoom to
 * the browser, so only horizontal drags arrive here. `pinch-zoom` is kept
 * explicitly: dropping it would block zooming on a full-width mobile hero.
 */
export function createOrbitController(
  element: HTMLElement,
  options: OrbitOptions,
): OrbitController {
  const { target, startAzimuth = 0, autoRotate = true } = options;

  let radius = options.radius;
  let azimuth = startAzimuth;
  let azimuthTarget = startAzimuth;
  let polar = POLAR_REST_RAD;
  let polarTarget = POLAR_REST_RAD;
  // -Infinity, not 0: zero reads as "interacted at navigation start", which
  // makes the first move depend on how fast the page loaded.
  let lastInteractionAt = -Infinity;
  let autoPhase = 0;

  let activePointerId: number | null = null;
  let gesture: GestureKind = "undetermined";
  let gateX = 0;
  let gateY = 0;
  let lastX = 0;
  let lastY = 0;
  // NaN means "nothing drawn yet". It must be treated as *moved*, never fed to
  // a comparison: Math.abs(x - NaN) is NaN and NaN > epsilon is false, which
  // froze the scene on its first frame.
  let lastRenderedAzimuth = Number.NaN;
  let lastRenderedPolar = Number.NaN;
  let dirty = true;

  element.style.touchAction = "pan-y pinch-zoom";

  const onPointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || activePointerId !== null) return;
    // Hand the drag the camera's settled angle, so grabbing mid-rotation does
    // not jump.
    azimuthTarget = azimuth;

    activePointerId = event.pointerId;
    // A mouse has no competing scroll gesture, so it rotates immediately.
    gesture = event.pointerType === "mouse" ? "rotate" : "undetermined";
    gateX = 0;
    gateY = 0;
    lastX = event.clientX;
    lastY = event.clientY;
    lastInteractionAt = performance.now();
    element.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== activePointerId || gesture === "scroll") return;

    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;

    // Until the browser commits a touch gesture to scrolling it still delivers
    // move events here. Applying them would jitter the diorama sideways during
    // a vertical flick, so classify first and apply nothing until then.
    if (gesture === "undetermined") {
      gateX += Math.abs(deltaX);
      gateY += Math.abs(deltaY);
      if (Math.max(gateX, gateY) < DIRECTION_GATE_PX) return;

      gesture = gateX > gateY ? "rotate" : "scroll";
      if (gesture === "scroll") return;
    }

    // Unbounded: drag spins the room freely through a full turn and beyond.
    azimuthTarget -= deltaX * DRAG_RAD_PER_PX;
    // Vertical belongs to the page scroller on touch, so only a mouse tilts.
    if (event.pointerType === "mouse") {
      polarTarget = clamp(
        polarTarget - deltaY * DRAG_RAD_PER_PX,
        POLAR_MIN_RAD,
        POLAR_MAX_RAD,
      );
    }
    lastInteractionAt = performance.now();
  };

  /**
   * Idempotent, and bound to `pointercancel` and `lostpointercapture` as well
   * as `pointerup`: a gesture the scroller steals mid-flight only ever reports
   * cancellation, and a drag flag left set would stop the sweep resuming.
   */
  const endGesture = (event: PointerEvent) => {
    if (event.pointerId !== activePointerId) return;

    activePointerId = null;
    gesture = "undetermined";
    lastInteractionAt = performance.now();
  };

  element.addEventListener("pointerdown", onPointerDown, { passive: true });
  element.addEventListener("pointermove", onPointerMove, { passive: true });
  element.addEventListener("pointerup", endGesture, { passive: true });
  element.addEventListener("pointercancel", endGesture, { passive: true });
  element.addEventListener("lostpointercapture", endGesture, { passive: true });

  return {
    update(deltaSeconds, camera) {
      const dragging = gesture === "rotate" && activePointerId !== null;
      const idle = performance.now() - lastInteractionAt > RESUME_DELAY_MS;

      if (autoRotate && !dragging && idle) {
        autoPhase += AUTO_PHASE_SPEED_RAD_S * deltaSeconds;
        const home = startAzimuth + Math.sin(autoPhase) * AUTO_SWEEP_AMPLITUDE_RAD;
        azimuthTarget += shortestTurn(home - azimuthTarget) * (1 - Math.exp(-AUTO_RETURN_RATE * deltaSeconds));
      }

      if (!dragging) {
        polarTarget = damp(polarTarget, POLAR_REST_RAD, POLAR_RECENTER_RATE, deltaSeconds);
      }

      azimuth = damp(azimuth, azimuthTarget, DAMPING_RATE, deltaSeconds);
      polar = damp(polar, polarTarget, DAMPING_RATE, deltaSeconds);

      const sinPolar = Math.sin(polar);
      camera.position.set(
        target.x + radius * sinPolar * Math.sin(azimuth),
        target.y + radius * Math.cos(polar),
        target.z + radius * sinPolar * Math.cos(azimuth),
      );
      camera.lookAt(target);

      const moved =
        dirty ||
        !Number.isFinite(lastRenderedAzimuth) ||
        !Number.isFinite(lastRenderedPolar) ||
        Math.abs(azimuth - lastRenderedAzimuth) > SETTLED_EPSILON_RAD ||
        Math.abs(polar - lastRenderedPolar) > SETTLED_EPSILON_RAD;

      if (moved) {
        dirty = false;
        lastRenderedAzimuth = azimuth;
        lastRenderedPolar = polar;
      }
      return moved;
    },

    setRadius(next) {
      if (next === radius) return;
      radius = next;
      // Request a frame. Writing NaN to the comparison sentinel here is what
      // wedged the movement check permanently.
      dirty = true;
    },

    dispose() {
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerup", endGesture);
      element.removeEventListener("pointercancel", endGesture);
      element.removeEventListener("lostpointercapture", endGesture);
      activePointerId = null;
    },
  };
}
