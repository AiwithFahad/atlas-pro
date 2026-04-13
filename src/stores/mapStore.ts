import { create } from 'zustand';

export interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
  folder: 'favorites' | 'work' | 'travel' | 'custom';
  createdAt: number;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  name: string;
}

export interface RouteResult {
  coordinates: [number, number][];
  distance: number; // meters
  duration: number; // seconds
  steps: { instruction: string; distance: number; duration: number }[];
}

export type TravelMode = 'car' | 'foot' | 'bike';
export type SidebarPanel = 'none' | 'search' | 'route' | 'places' | 'layers';

interface MapState {
  // Map
  center: [number, number];
  zoom: number;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;

  // Sidebar
  activePanel: SidebarPanel;
  setActivePanel: (panel: SidebarPanel) => void;

  // Search
  searchQuery: string;
  searchResults: { display_name: string; lat: string; lon: string; type: string }[];
  isSearching: boolean;
  setSearchQuery: (q: string) => void;
  setSearchResults: (r: any[]) => void;
  setIsSearching: (v: boolean) => void;
  selectedLocation: { lat: number; lng: number; name: string } | null;
  setSelectedLocation: (loc: { lat: number; lng: number; name: string } | null) => void;

  // Routing
  routeOrigin: RoutePoint | null;
  routeDestination: RoutePoint | null;
  routeWaypoints: RoutePoint[];
  routeResult: RouteResult | null;
  travelMode: TravelMode;
  isRouting: boolean;
  setRouteOrigin: (p: RoutePoint | null) => void;
  setRouteDestination: (p: RoutePoint | null) => void;
  setRouteWaypoints: (w: RoutePoint[]) => void;
  setRouteResult: (r: RouteResult | null) => void;
  setTravelMode: (m: TravelMode) => void;
  setIsRouting: (v: boolean) => void;
  clearRoute: () => void;

  // Markers
  markers: MapMarker[];
  addMarker: (m: MapMarker) => void;
  removeMarker: (id: string) => void;
  updateMarker: (id: string, updates: Partial<MapMarker>) => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: [40.7128, -74.006],
  zoom: 13,
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),

  activePanel: 'none',
  setActivePanel: (panel) => set((s) => ({ activePanel: s.activePanel === panel ? 'none' : panel })),

  searchQuery: '',
  searchResults: [],
  isSearching: false,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setIsSearching: (isSearching) => set({ isSearching }),
  selectedLocation: null,
  setSelectedLocation: (selectedLocation) => set({ selectedLocation }),

  routeOrigin: null,
  routeDestination: null,
  routeWaypoints: [],
  routeResult: null,
  travelMode: 'car',
  isRouting: false,
  setRouteOrigin: (routeOrigin) => set({ routeOrigin }),
  setRouteDestination: (routeDestination) => set({ routeDestination }),
  setRouteWaypoints: (routeWaypoints) => set({ routeWaypoints }),
  setRouteResult: (routeResult) => set({ routeResult }),
  setTravelMode: (travelMode) => set({ travelMode }),
  setIsRouting: (isRouting) => set({ isRouting }),
  clearRoute: () => set({ routeOrigin: null, routeDestination: null, routeWaypoints: [], routeResult: null }),

  markers: [],
  addMarker: (m) => set((s) => ({ markers: [...s.markers, m] })),
  removeMarker: (id) => set((s) => ({ markers: s.markers.filter((m) => m.id !== id) })),
  updateMarker: (id, updates) => set((s) => ({
    markers: s.markers.map((m) => m.id === id ? { ...m, ...updates } : m),
  })),
}));
