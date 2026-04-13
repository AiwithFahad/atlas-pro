import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from 'react';

const MapView = lazy(() => import('@/components/MapView'));
import MapSidebar from '@/components/MapSidebar';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GeoSphere — Location Intelligence Platform" },
      { name: "description", content: "Enterprise-grade interactive mapping and location intelligence. Search, route, and manage locations worldwide." },
      { property: "og:title", content: "GeoSphere — Location Intelligence Platform" },
      { property: "og:description", content: "Enterprise-grade interactive mapping and location intelligence." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Loading map...</span>
          </div>
        </div>
      }>
        <MapView />
      </Suspense>
      <MapSidebar />
    </div>
  );
}
