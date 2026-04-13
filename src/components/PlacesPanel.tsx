import { MapPin, Trash2, Star, Briefcase, Plane, Tag } from 'lucide-react';
import { useMapStore, type MapMarker } from '@/stores/mapStore';

const folderIcons: Record<string, typeof Star> = {
  favorites: Star,
  work: Briefcase,
  travel: Plane,
  custom: Tag,
};

const folderLabels: Record<string, string> = {
  favorites: 'Favorites',
  work: 'Work',
  travel: 'Travel',
  custom: 'Custom',
};

export default function PlacesPanel() {
  const markers = useMapStore((s) => s.markers);
  const removeMarker = useMapStore((s) => s.removeMarker);
  const updateMarker = useMapStore((s) => s.updateMarker);
  const setCenter = useMapStore((s) => s.setCenter);
  const setZoom = useMapStore((s) => s.setZoom);

  const grouped = markers.reduce<Record<string, MapMarker[]>>((acc, m) => {
    if (!acc[m.folder]) acc[m.folder] = [];
    acc[m.folder].push(m);
    return acc;
  }, {});

  const goToMarker = (m: MapMarker) => {
    setCenter([m.lat, m.lng]);
    setZoom(16);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Saved Places</h2>
        <p className="text-xs text-muted-foreground mt-1">Right-click on map to add a pin</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {markers.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-accent mx-auto flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No saved places yet</p>
            <p className="text-xs text-muted-foreground mt-1">Right-click anywhere on the map to add a pin</p>
          </div>
        ) : (
          Object.entries(grouped).map(([folder, items]) => {
            const Icon = folderIcons[folder] || Tag;
            return (
              <div key={folder} className="border-b border-border last:border-0">
                <div className="px-4 py-2 flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {folderLabels[folder] || folder}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">{items.length}</span>
                </div>
                {items.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors group cursor-pointer"
                    onClick={() => goToMarker(m)}
                  >
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: m.color, boxShadow: `0 0 0 2px ${m.color}30` }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.lat.toFixed(4)}, {m.lng.toFixed(4)}</p>
                    </div>
                    <select
                      value={m.folder}
                      onChange={(e) => updateMarker(m.id, { folder: e.target.value as any })}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs bg-transparent text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer focus:outline-none"
                    >
                      <option value="favorites">★ Fav</option>
                      <option value="work">💼 Work</option>
                      <option value="travel">✈ Travel</option>
                      <option value="custom">🏷 Custom</option>
                    </select>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeMarker(m.id); }}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
