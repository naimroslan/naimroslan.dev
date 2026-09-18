import type { PerspectiveCamera, Vector3 } from "three";

/**
 * The automatic motion is a bounded sweep rather than a full turntable: the
 * diorama is built to be seen from the front, and a 360° orbit would spend a
 * third of its cycle behind the laptop lid and the back of the character's
 * head, where none of the props are visible.
 */
const AUTO_SWEEP_AMPLITUDE_RAD = 0.42;
const AUTO_PHASE_SPEED_RAD_S = 0.22;
const AUTO_REJOIN_RATE = 1.6;

const DRAG_AZIMUTH_LIMIT_RAD = 1.15;
const DRAG_RAD_PER_PX = 0.006;
const RESUME_DELAY_MS = 2000;
const DAMPING_RATE = 10;

const POLAR_MIN_RAD = 0.86;
const POLAR_MAX_RAD = 1.34;
const POLAR_REST_RAD = 1.08;
const POLAR_RECENTER_RATE = 1.1;

/** Pointer travel before a touch gesture is classified as rotate or scroll. */
const DIRECTION_GATE_PX = 6;
/** Below this per-frame change the camera counts as settled and stops redrawing. */
const SETTLED_EPSILON_RAD = 1e-5;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** Frame-rate independent exponential approach. */
const damp = (current: number, target: number, rate: number, deltaSeconds: number) =>
  current + (target - current) * (1 - Math.exp(-rate * deltaSeconds));

type GestureKind = "undetermined" | "rotate" | "scroll";

export interface OrbitOptions {
  radius: number;
  target: Vector3;
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
  const { target, autoRotate = true } = options;

  let radius = options.radius;
  let azimuth = 0;
  let azimuthTarget = 0;
  let polar = POLAR_REST_RAD;
  let polarTarget = POLAR_REST_RAD;
  let autoPhase = 0;
  let autoEngaged = autoRotate;
  // -Infinity, not 0: zero reads as "interacted at navigation start", which
  // makes the sweep's first move depend on how fast the page loaded.
  let lastInteractionAt = -Infinity;

  let activePointerId: number | null = null;
  let gesture: GestureKind = "undetermined";
  let gateX = 0;
  let gateY = 0;
  let lastX = 0;
  let lastY = 0;
  let lastRenderedAzimuth = Number.NaN;
  let lastRenderedPolar = Number.NaN;

  element.style.touchAction = "pan-y pinch-zoom";

  const onPointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || activePointerId !== null) return;

    activePointerId = event.pointerId;
    // A mouse has no competing scroll gesture, so it rotates immediately.
    gesture = event.pointerType === "mouse" ? "rotate" : "undetermined";
    gateX = 0;
    gateY = 0;
    lastX = event.clientX;
    lastY = event.clientY;
    lastInteractionAt = performance.now();
    autoEngaged = false;
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

    azimuthTarget = clamp(
      azimuthTarget - deltaX * DRAG_RAD_PER_PX,
      -DRAG_AZIMUTH_LIMIT_RAD,
      DRAG_AZIMUTH_LIMIT_RAD,
    );
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
        // Seed the oscillator at the phase matching where the drag ended, so
        // handing back to the sweep has no discontinuity to smooth over.
        if (!autoEngaged) {
          autoEngaged = true;
          autoPhase = Math.asin(clamp(azimuthTarget / AUTO_SWEEP_AMPLITUDE_RAD, -1, 1));
        }
        autoPhase += AUTO_PHASE_SPEED_RAD_S * deltaSeconds;
        azimuthTarget = damp(
          azimuthTarget,
          Math.sin(autoPhase) * AUTO_SWEEP_AMPLITUDE_RAD,
          AUTO_REJOIN_RATE,
          deltaSeconds,
        );
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
        Math.abs(azimuth - lastRenderedAzimuth) > SETTLED_EPSILON_RAD ||
        Math.abs(polar - lastRenderedPolar) > SETTLED_EPSILON_RAD;
      if (moved) {
        lastRenderedAzimuth = azimuth;
        lastRenderedPolar = polar;
      }
      return moved;
    },

    setRadius(next) {
      radius = next;
      lastRenderedAzimuth = Number.NaN;
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
