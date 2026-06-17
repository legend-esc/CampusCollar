import { useState, useEffect, useCallback } from 'react';

// Rough bounding box — overridden by VITE_CAMPUS_BOUNDS env var
const DEFAULT_BOUNDS = {
  latMin: 33.0,
  latMax: 34.0,
  lngMin: -118.5,
  lngMax: -117.5,
};

function parseBounds() {
  try {
    const raw = import.meta.env.VITE_CAMPUS_BOUNDS;
    return raw ? JSON.parse(raw) : DEFAULT_BOUNDS;
  } catch {
    return DEFAULT_BOUNDS;
  }
}

function isOnCampus(lat: number, lng: number): boolean {
  const b = parseBounds();
  return lat >= b.latMin && lat <= b.latMax && lng >= b.lngMin && lng <= b.lngMax;
}

export function useGeolocation() {
  const [position, setPosition] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onCampus, setOnCampus] = useState<boolean | null>(null);
  const [watching, setWatching] = useState(false);
  const watchId = { current: -1 };

  const handlePosition = useCallback((pos: GeolocationPosition) => {
    setPosition(pos.coords);
    setOnCampus(isOnCampus(pos.coords.latitude, pos.coords.longitude));
    setError(null);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    setError(err.message);
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    setWatching(true);
    watchId.current = navigator.geolocation.watchPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      maximumAge: 30_000,
    });
  }, [handlePosition, handleError]);

  const stopWatching = useCallback(() => {
    if (watchId.current !== -1) navigator.geolocation.clearWatch(watchId.current);
    setWatching(false);
  }, []);

  const getOnce = useCallback(() => {
    navigator.geolocation?.getCurrentPosition(handlePosition, handleError);
  }, [handlePosition, handleError]);

  useEffect(() => () => stopWatching(), [stopWatching]);

  return { position, error, onCampus, watching, startWatching, stopWatching, getOnce };
}
