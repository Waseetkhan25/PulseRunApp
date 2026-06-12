/**
 * useLocation.js
 * GPS route-tracking hook with battery-conscious polling options.
 *
 * Performance notes:
 *   - Accuracy.Balanced uses cell-tower / WiFi assisted GPS → lower CPU/battery
 *     than Accuracy.High (pure satellite) while still accurate to ~10 m.
 *   - timeInterval + distanceInterval double-gates updates: no callback fires
 *     unless BOTH the minimum time AND minimum distance thresholds are met.
 *   - Route stored as a plain array of {lat, lng} pairs (no Animated values),
 *     so FlatList / map rendering stays lightweight.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { calculateDistance } from '../utils/calculations';

// ── Tuning constants ──────────────────────────────────────────────────────────
const LOCATION_OPTIONS = {
  accuracy: Location.Accuracy.Balanced, // balanced: cell + WiFi assist
  timeInterval: 3000,                   // no update sooner than 3 s
  distanceInterval: 5,                  // no update unless moved ≥ 5 m
};

/**
 * @param {boolean} isTracking
 * @returns {{
 *   distanceKm: number,
 *   route: Array<{lat: number, lng: number}>,
 *   permissionGranted: boolean,
 *   reset: () => void
 * }}
 */
export function useLocation(isTracking) {
  const [distanceKm, setDistanceKm]         = useState(0);
  const [route, setRoute]                   = useState([]);
  const [permissionGranted, setPermission]  = useState(false);

  const subscriptionRef = useRef(null);
  const lastCoordRef    = useRef(null); // {lat, lng} of previous GPS fix

  // ── Permission request (fires once on hook mount) ─────────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermission(status === 'granted');
    })();
  }, []);

  const reset = useCallback(() => {
    setDistanceKm(0);
    setRoute([]);
    lastCoordRef.current = null;
  }, []);

  // ── Subscription lifecycle ────────────────────────────────────────────────
  useEffect(() => {
    if (!isTracking || !permissionGranted) {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      return;
    }

    let active = true; // guard against state updates after cleanup

    (async () => {
      subscriptionRef.current = await Location.watchPositionAsync(
        LOCATION_OPTIONS,
        ({ coords }) => {
          if (!active) return;

          const point = { lat: coords.latitude, lng: coords.longitude };

          if (lastCoordRef.current) {
            const segmentKm = calculateDistance(lastCoordRef.current, point);
            // toFixed avoids floating-point accumulation drift
            setDistanceKm((d) => parseFloat((d + segmentKm).toFixed(4)));
          }

          lastCoordRef.current = point;
          setRoute((r) => [...r, point]);
        }
      );
    })();

    return () => {
      active = false;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, [isTracking, permissionGranted]);

  return { distanceKm, route, permissionGranted, reset };
}
