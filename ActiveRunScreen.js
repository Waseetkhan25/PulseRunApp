/**
 * useAccelerometer.js
 * Throttled step-detection hook.
 *
 * Performance notes (Helio G85 / 4 GB RAM):
 *   - Default Expo Accelerometer rate is ~100 Hz. That many JS-thread callbacks
 *     causes dropped frames. We pin to 200 ms (5 Hz) — plenty for step counting.
 *   - Peak-detection uses magnitude delta + cooldown to debounce noise.
 *   - All mutable state that doesn't need a re-render lives in useRef to keep
 *     the JS reconciler workload minimal.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Accelerometer } from 'expo-sensors';

// ── Tuning constants ──────────────────────────────────────────────────────────
const POLL_INTERVAL_MS  = 200;   // 5 Hz polling rate
const STEP_THRESHOLD    = 1.2;   // resultant-magnitude delta required to register
const STEP_COOLDOWN_MS  = 400;   // minimum gap between valid steps (~150 bpm max)

/**
 * @param {boolean} isTracking - subscribe when true, unsubscribe when false
 * @returns {{ steps: number, reset: () => void }}
 */
export function useAccelerometer(isTracking) {
  const [steps, setSteps]         = useState(0);
  const lastMagnitude             = useRef(0);
  const lastStepTime              = useRef(0);
  const subscriptionRef           = useRef(null);

  /** Expose reset so ActiveRunScreen can clear on new run without re-mounting */
  const reset = useCallback(() => {
    setSteps(0);
    lastMagnitude.current = 0;
    lastStepTime.current  = 0;
  }, []);

  useEffect(() => {
    if (!isTracking) {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      return;
    }

    Accelerometer.setUpdateInterval(POLL_INTERVAL_MS);

    subscriptionRef.current = Accelerometer.addListener(({ x, y, z }) => {
      // Resultant magnitude of the 3-axis vector
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const delta     = Math.abs(magnitude - lastMagnitude.current);
      const now       = Date.now();

      if (delta > STEP_THRESHOLD && now - lastStepTime.current > STEP_COOLDOWN_MS) {
        setSteps((prev) => prev + 1);
        lastStepTime.current = now;
      }

      lastMagnitude.current = magnitude;
    });

    // Cleanup on unmount or isTracking → false
    return () => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, [isTracking]);

  return { steps, reset };
}
