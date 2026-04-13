import { useState, useCallback } from 'react';
import { Search, X, MapPin, Clock } from 'lucide-react';
import { useMapStore } from '@/stores/mapStore';
import { debouncedSearch } from '@/lib/geo';

export default function SearchPanel() {
  const {
    searchQuery, setSearchQuery,
    searchResults, setSearchResults,
    isSearching, setIsSearching,
    setSelectedLocation, setCenter, setZoom,
  } = useMapStore();

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    debouncedSearch(q, (results) => {
      setSearchResults(results);
      setIsSearching(false);
    });
  }, [setSearchQuery, setSearchResults, setIsSearching]);

  const handleSelect = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSelectedLocation({ lat, lng, name: result.display_name });
    setCenter([lat, lng]);
    setZoom(16);
    setSearchResults([]);
    setSearchQuery(result.display_name.split(',')[0]);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedLocation(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground mb-3">Search Location</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="City, address, or coordinates..."
            className="w-full pl-10 pr-9 py-2.5 bg-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          {searchQuery && (
            <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isSearching && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <div className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
            Searching...
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="py-1">
            {searchResults.map((r, i) => (
              <button
                key={i}
                onClick={() => handleSelect(r)}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left"
              >
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">{r.display_name.split(',')[0]}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {r.display_name.split(',').slice(1, 3).join(',')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
          <div className="p-4 text-center text-sm text-muted-foreground">No results found</div>
        )}

        {searchResults.length === 0 && searchQuery.length < 2 && (
          <div className="p-4 space-y-4">
            <p className="text-xs text-muted-foreground">Search by city, street address, landmark, or coordinates (lat, lng).</p>
            <div className="space-y-2">
              {['New York', 'Tokyo', 'London', 'Paris'].map((city) => (
                <button
                  key={city}
                  onClick={() => handleSearch(city)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
