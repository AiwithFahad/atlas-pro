import { Search, Navigation, MapPin, Layers, Locate, ZoomIn, ZoomOut } from 'lucide-react';
import { useMapStore, type SidebarPanel } from '@/stores/mapStore';
import SearchPanel from './SearchPanel';
import RoutePanel from './RoutePanel';
import PlacesPanel from './PlacesPanel';

const navItems: { id: SidebarPanel; icon: typeof Search; label: string }[] = [
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'route', icon: Navigation, label: 'Route' },
  { id: 'places', icon: MapPin, label: 'Places' },
];

export default function MapSidebar() {
  const activePanel = useMapStore((s) => s.activePanel);
  const setActivePanel = useMapStore((s) => s.setActivePanel);
  const setCenter = useMapStore((s) => s.setCenter);
  const setZoom = useMapStore((s) => s.setZoom);
  const zoom = useMapStore((s) => s.zoom);

  const handleLocate = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCenter([pos.coords.latitude, pos.coords.longitude]);
          setZoom(15);
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <>
      {/* Icon strip */}
      <div className="absolute left-0 top-0 bottom-0 z-[1000] w-14 glass-panel flex flex-col items-center py-4 gap-1 rounded-none border-l-0 border-t-0 border-b-0">
        <div className="mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Navigation className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePanel(item.id)}
            className={`nav-icon-btn ${activePanel === item.id ? 'active' : ''}`}
            title={item.label}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}

        <div className="mt-auto space-y-1">
          <button onClick={handleLocate} className="nav-icon-btn" title="My location">
            <Locate className="w-5 h-5" />
          </button>
          <button onClick={() => setZoom(Math.min(zoom + 1, 18))} className="nav-icon-btn" title="Zoom in">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button onClick={() => setZoom(Math.max(zoom - 1, 2))} className="nav-icon-btn" title="Zoom out">
            <ZoomOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Expandable panel */}
      {activePanel !== 'none' && (
        <div className="absolute left-14 top-0 bottom-0 z-[999] w-80 glass-panel rounded-none border-t-0 border-b-0 overflow-hidden">
          {activePanel === 'search' && <SearchPanel />}
          {activePanel === 'route' && <RoutePanel />}
          {activePanel === 'places' && <PlacesPanel />}
        </div>
      )}
    </>
  );
}
