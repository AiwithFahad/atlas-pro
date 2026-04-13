import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '@/stores/mapStore';
import { reverseGeocode } from '@/lib/geo';
import { useTheme } from '@/hooks/use-theme';

// Fix default marker icon
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

function createColoredIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 0 3px ${color}40, 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

const primaryIcon = L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;border-radius:50%;background:oklch(0.65 0.2 250);border:3px solid white;box-shadow:0 0 0 4px oklch(0.65 0.2 250 / 30%), 0 2px 12px rgba(0,0,0,0.4);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const TILE_URLS = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
};

function MapSync() {
  const map = useMap();
  const center = useMapStore((s) => s.center);
  const zoom = useMapStore((s) => s.zoom);
  const lastCenter = useRef(center);
  const lastZoom = useRef(zoom);

  useEffect(() => {
    if (center[0] !== lastCenter.current[0] || center[1] !== lastCenter.current[1] || zoom !== lastZoom.current) {
      map.flyTo(center, zoom, { duration: 1.2 });
      lastCenter.current = center;
      lastZoom.current = zoom;
    }
  }, [center, zoom, map]);

  return null;
}

function MapClickHandler() {
  const addMarker = useMapStore((s) => s.addMarker);

  useMapEvents({
    contextmenu: async (e) => {
      const { lat, lng } = e.latlng;
      const name = await reverseGeocode(lat, lng);
      addMarker({
        id: crypto.randomUUID(),
        name: name.split(',')[0],
        lat,
        lng,
        color: '#4A9EFF',
        folder: 'custom',
        createdAt: Date.now(),
      });
    },
  });

  return null;
}

export default function MapView() {
  const center = useMapStore((s) => s.center);
  const zoom = useMapStore((s) => s.zoom);
  const markers = useMapStore((s) => s.markers);
  const selectedLocation = useMapStore((s) => s.selectedLocation);
  const routeResult = useMapStore((s) => s.routeResult);
  const routeOrigin = useMapStore((s) => s.routeOrigin);
  const routeDestination = useMapStore((s) => s.routeDestination);
  const removeMarker = useMapStore((s) => s.removeMarker);
  const { theme } = useTheme();

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-full"
      zoomControl={false}
      attributionControl={true}
    >
      <TileLayer
        key={theme}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url={TILE_URLS[theme]}
      />
      <MapSync />
      <MapClickHandler />

      {routeResult && (
        <Polyline
          positions={routeResult.coordinates}
          pathOptions={{
            color: 'oklch(0.65 0.2 250)',
            weight: 5,
            opacity: 0.85,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      )}

      {routeOrigin && (
        <Marker position={[routeOrigin.lat, routeOrigin.lng]} icon={createColoredIcon('#22c55e')}>
          <Popup>{routeOrigin.name}</Popup>
        </Marker>
      )}
      {routeDestination && (
        <Marker position={[routeDestination.lat, routeDestination.lng]} icon={createColoredIcon('#ef4444')}>
          <Popup>{routeDestination.name}</Popup>
        </Marker>
      )}

      {selectedLocation && (
        <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={primaryIcon}>
          <Popup>{selectedLocation.name}</Popup>
        </Marker>
      )}

      {markers.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]} icon={createColoredIcon(m.color)}>
          <Popup>
            <div style={{ minWidth: '120px' }}>
              <strong>{m.name}</strong>
              <br />
              <small style={{ opacity: 0.7 }}>{m.lat.toFixed(5)}, {m.lng.toFixed(5)}</small>
              <br />
              <button
                onClick={() => removeMarker(m.id)}
                style={{
                  marginTop: '6px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'oklch(0.6 0.2 25 / 30%)',
                  color: 'oklch(0.85 0.15 25)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                Remove
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
