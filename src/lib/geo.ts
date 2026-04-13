import type { TravelMode, RouteResult } from '@/stores/mapStore';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const OSRM_URL = 'https://router.project-osrm.org';

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

export async function searchLocation(query: string): Promise<any[]> {
  if (!query || query.length < 2) return [];

  // Check if it's coordinates (lat,lng or lat lng)
  const coordMatch = query.match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return [{
        display_name: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        lat: lat.toString(),
        lon: lng.toString(),
        type: 'coordinate',
      }];
    }
  }

  const res = await fetch(
    `${NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`,
    { headers: { 'Accept-Language': 'en' } }
  );
  if (!res.ok) return [];
  return res.json();
}

export function debouncedSearch(query: string, callback: (results: any[]) => void) {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const results = await searchLocation(query);
    callback(results);
  }, 350);
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

const OSRM_PROFILES: Record<TravelMode, string> = {
  car: 'driving',
  foot: 'foot',
  bike: 'cycling',
};

export async function getRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: TravelMode,
  waypoints: { lat: number; lng: number }[] = []
): Promise<RouteResult | null> {
  const profile = OSRM_PROFILES[mode];
  const coords = [origin, ...waypoints, destination]
    .map((p) => `${p.lng},${p.lat}`)
    .join(';');

  try {
    const res = await fetch(
      `${OSRM_URL}/route/v1/${profile}/${coords}?overview=full&geometries=geojson&steps=true`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.routes?.[0]) return null;

    const route = data.routes[0];
    const steps = route.legs.flatMap((leg: any) =>
      leg.steps.map((step: any) => ({
        instruction: step.maneuver?.type
          ? `${step.maneuver.type}${step.name ? ` onto ${step.name}` : ''}`
          : step.name || 'Continue',
        distance: step.distance,
        duration: step.duration,
      }))
    );

    return {
      coordinates: route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]),
      distance: route.distance,
      duration: route.duration,
      steps,
    };
  } catch {
    return null;
  }
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
}
