import { useState } from 'react';
import { Navigation, Car, Footprints, Bike, X, ArrowRight, RotateCcw, Loader2 } from 'lucide-react';
import { useMapStore, type TravelMode } from '@/stores/mapStore';
import { searchLocation, getRoute, formatDistance, formatDuration } from '@/lib/geo';

const modes: { id: TravelMode; icon: typeof Car; label: string }[] = [
  { id: 'car', icon: Car, label: 'Drive' },
  { id: 'foot', icon: Footprints, label: 'Walk' },
  { id: 'bike', icon: Bike, label: 'Bike' },
];

export default function RoutePanel() {
  const {
    routeOrigin, setRouteOrigin,
    routeDestination, setRouteDestination,
    routeResult, setRouteResult,
    travelMode, setTravelMode,
    isRouting, setIsRouting,
    clearRoute, setCenter, setZoom,
  } = useMapStore();

  const [originQuery, setOriginQuery] = useState(routeOrigin?.name || '');
  const [destQuery, setDestQuery] = useState(routeDestination?.name || '');
  const [originResults, setOriginResults] = useState<any[]>([]);
  const [destResults, setDestResults] = useState<any[]>([]);
  const [activeInput, setActiveInput] = useState<'origin' | 'dest' | null>(null);

  const handleLocationSearch = async (query: string, type: 'origin' | 'dest') => {
    if (type === 'origin') setOriginQuery(query);
    else setDestQuery(query);

    if (query.length < 2) {
      if (type === 'origin') setOriginResults([]);
      else setDestResults([]);
      return;
    }
    const results = await searchLocation(query);
    if (type === 'origin') setOriginResults(results);
    else setDestResults(results);
  };

  const selectPoint = (result: any, type: 'origin' | 'dest') => {
    const point = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      name: result.display_name.split(',')[0],
    };
    if (type === 'origin') {
      setRouteOrigin(point);
      setOriginQuery(point.name);
      setOriginResults([]);
    } else {
      setRouteDestination(point);
      setDestQuery(point.name);
      setDestResults([]);
    }
    setActiveInput(null);
  };

  const calculateRoute = async () => {
    if (!routeOrigin || !routeDestination) return;
    setIsRouting(true);
    const result = await getRoute(routeOrigin, routeDestination, travelMode);
    setRouteResult(result);
    setIsRouting(false);
    if (result && result.coordinates.length > 0) {
      const midIdx = Math.floor(result.coordinates.length / 2);
      setCenter(result.coordinates[midIdx]);
      setZoom(12);
    }
  };

  const handleClear = () => {
    clearRoute();
    setOriginQuery('');
    setDestQuery('');
    setOriginResults([]);
    setDestResults([]);
  };

  const swapPoints = () => {
    const o = routeOrigin;
    const d = routeDestination;
    setRouteOrigin(d);
    setRouteDestination(o);
    setOriginQuery(d?.name || '');
    setDestQuery(o?.name || '');
    setRouteResult(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Directions</h2>
          {(routeOrigin || routeDestination) && (
            <button onClick={handleClear} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Travel mode */}
        <div className="flex gap-1 bg-input rounded-lg p-1">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => { setTravelMode(m.id); if (routeOrigin && routeDestination) setRouteResult(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                travelMode === m.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <m.icon className="w-3.5 h-3.5" />
              {m.label}
            </button>
          ))}
        </div>

        {/* Origin/Destination inputs */}
        <div className="space-y-2 relative">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success border-2 border-background shrink-0" />
            <div className="flex-1 relative">
              <input
                value={originQuery}
                onChange={(e) => handleLocationSearch(e.target.value, 'origin')}
                onFocus={() => setActiveInput('origin')}
                placeholder="Starting point"
                className="w-full px-3 py-2 bg-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive border-2 border-background shrink-0" />
            <div className="flex-1 relative">
              <input
                value={destQuery}
                onChange={(e) => handleLocationSearch(e.target.value, 'dest')}
                onFocus={() => setActiveInput('dest')}
                placeholder="Destination"
                className="w-full px-3 py-2 bg-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {routeOrigin && routeDestination && (
            <button onClick={swapPoints} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-1 p-1 text-muted-foreground hover:text-foreground">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {activeInput && (activeInput === 'origin' ? originResults : destResults).length > 0 && (
          <div className="bg-surface rounded-lg border border-border overflow-hidden max-h-40 overflow-y-auto">
            {(activeInput === 'origin' ? originResults : destResults).map((r, i) => (
              <button
                key={i}
                onClick={() => selectPoint(r, activeInput)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent/50 transition-colors truncate text-foreground"
              >
                {r.display_name.split(',').slice(0, 2).join(',')}
              </button>
            ))}
          </div>
        )}

        {/* Calculate button */}
        {routeOrigin && routeDestination && !routeResult && (
          <button
            onClick={calculateRoute}
            disabled={isRouting}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isRouting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            {isRouting ? 'Calculating...' : 'Get Directions'}
          </button>
        )}
      </div>

      {/* Route result */}
      {routeResult && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-border">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-foreground">{formatDuration(routeResult.duration)}</span>
              <span className="text-sm text-muted-foreground">{formatDistance(routeResult.distance)}</span>
            </div>
            <div className={`mt-1 route-badge ${travelMode === 'car' ? 'route-badge-car' : travelMode === 'foot' ? 'route-badge-walk' : 'route-badge-bike'}`}>
              {modes.find(m => m.id === travelMode)?.label}
            </div>
          </div>

          <div className="p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Steps</h3>
            {routeResult.steps.filter(s => s.distance > 5).slice(0, 20).map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                </div>
                <div>
                  <p className="text-sm text-foreground capitalize">{step.instruction}</p>
                  <p className="text-xs text-muted-foreground">{formatDistance(step.distance)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
