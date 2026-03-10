'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { getStadiums, getRooms } from '@/lib/data';
import { Stadium, Room } from '@/types';
import Link from 'next/link';
import {
  MapPin, Users, Car, Coffee, Lightbulb, ShowerHead, Building,
  Calendar, Search, Star, X, SlidersHorizontal, Map, ChevronDown,
} from 'lucide-react';

const amenityIcons: Record<string, React.ReactNode> = {
  'Parking': <Car className="w-3.5 h-3.5" />,
  'Cafeteria': <Coffee className="w-3.5 h-3.5" />,
  'Night Lighting': <Lightbulb className="w-3.5 h-3.5" />,
  'Showers': <ShowerHead className="w-3.5 h-3.5" />,
  'Changing Rooms': <Building className="w-3.5 h-3.5" />,
  'VIP Lounge': <Star className="w-3.5 h-3.5" />,
};

const ALL_AMENITIES = ['Parking', 'Cafeteria', 'Night Lighting', 'Showers', 'Changing Rooms', 'VIP Lounge'];

const PRICE_RANGES = [
  { label: 'All prices', min: 0, max: Infinity },
  { label: 'Under \u20BC60', min: 0, max: 60 },
  { label: '\u20BC60 - \u20BC80', min: 60, max: 80 },
  { label: '\u20BC80 - \u20BC100', min: 80, max: 100 },
  { label: 'Over \u20BC100', min: 100, max: Infinity },
];

// -- Stadium Map Component (multi-marker) --
function StadiumsMap({
  stadiums,
  highlightedId,
  onMarkerClick,
}: {
  stadiums: Stadium[];
  highlightedId: string | null;
  onMarkerClick: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const [isClient, setIsClient] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current || initializedRef.current || stadiums.length === 0) return;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        initializedRef.current = true;

        // Center on Baku
        const centerLat = stadiums.reduce((s, st) => s + st.latitude, 0) / stadiums.length;
        const centerLng = stadiums.reduce((s, st) => s + st.longitude, 0) / stadiums.length;

        const map = L.map(containerRef.current!, {
          center: [centerLat, centerLng],
          zoom: 12,
          scrollWheelZoom: false,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }).addTo(map);

        stadiums.forEach((stadium) => {
          const icon = L.divIcon({
            html: `<div style="
              width: 28px; height: 28px;
              background: #00ff88;
              border: 3px solid #0a0e1a;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 0 12px rgba(0,255,136,0.6);
              display: flex; align-items: center; justify-content: center;
              transition: all 0.3s;
            "><div style="
              transform: rotate(45deg);
              font-size: 10px; font-weight: 700; color: #0a0e1a;
            ">\u20BC</div></div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -28],
            className: '',
          });

          const marker = L.marker([stadium.latitude, stadium.longitude], { icon }).addTo(map);

          const popupContent = `
            <div style="
              background: #1e293b;
              color: #e2e8f0;
              padding: 10px 14px;
              border-radius: 8px;
              font-family: system-ui, sans-serif;
              border: 1px solid rgba(0,255,136,0.2);
              min-width: 160px;
              cursor: pointer;
            ">
              <div style="font-weight: 700; font-size: 14px; color: #00ff88; margin-bottom: 4px;">${stadium.name}</div>
              <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${stadium.address}</div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #00ff88; font-weight: 700; font-size: 13px;">\u20BC${stadium.price_per_hour}/hr</span>
                <span style="color: #00d4ff; font-size: 11px;">${stadium.capacity} players</span>
              </div>
            </div>
          `;
          marker.bindPopup(popupContent, {
            className: 'dark-popup',
            closeButton: false,
          });

          marker.on('click', () => {
            onMarkerClick(stadium.id);
          });

          markersRef.current[stadium.id] = marker;
        });

        // Fit bounds to show all markers
        const bounds = L.latLngBounds(stadiums.map(s => [s.latitude, s.longitude] as [number, number]));
        map.fitBounds(bounds, { padding: [40, 40] });

        mapRef.current = map;

        setTimeout(() => {
          map.invalidateSize();
          setMapLoaded(true);
        }, 100);
      } catch (error) {
        console.error('Error initializing map:', error);
        initializedRef.current = false;
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = {};
        initializedRef.current = false;
      }
    };
  }, [isClient, stadiums, onMarkerClick]);

  // Highlight marker when highlightedId changes
  useEffect(() => {
    if (!mapRef.current || !highlightedId) return;
    const marker = markersRef.current[highlightedId];
    if (marker) {
      marker.openPopup();
      mapRef.current.setView(marker.getLatLng(), 14, { animate: true });
    }
  }, [highlightedId]);

  if (!isClient) {
    return (
      <div className="bg-dark-900 rounded-xl flex items-center justify-center border border-white/10 h-[300px] md:h-[400px]">
        <div className="text-center text-slate-500">
          <Map className="w-10 h-10 mx-auto mb-2" />
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <style>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
          padding: 0;
        }
        .dark-popup .leaflet-popup-content {
          margin: 0;
        }
        .dark-popup .leaflet-popup-tip {
          background: #1e293b;
          border: 1px solid rgba(0,255,136,0.2);
        }
      `}</style>
      <div className="relative rounded-xl overflow-hidden border border-white/10 h-[300px] md:h-[400px]">
        {!mapLoaded && (
          <div className="absolute inset-0 bg-dark-900 flex items-center justify-center z-10">
            <div className="text-center text-slate-500">
              <Map className="w-10 h-10 mx-auto mb-2 animate-pulse" />
              <p className="text-sm">Loading stadiums map...</p>
            </div>
          </div>
        )}
        <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
      </div>
    </>
  );
}

// -- Main Stadiums Page --
export default function StadiumsPage() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState(0); // index into PRICE_RANGES
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Map interaction
  const [highlightedStadiumId, setHighlightedStadiumId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stadiumsData, roomsData] = await Promise.all([
          getStadiums(),
          getRooms(),
        ]);
        setStadiums(stadiumsData);
        setRooms(roomsData.filter(r => r.status === 'open'));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const districts = useMemo(() => {
    const set = new Set(stadiums.map(s => s.district));
    return Array.from(set).sort();
  }, [stadiums]);

  const getUpcomingMatchesCount = useCallback((stadiumId: string) => {
    return rooms.filter(r => r.stadium_id === stadiumId).length;
  }, [rooms]);

  const filteredStadiums = useMemo(() => {
    return stadiums.filter(stadium => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !stadium.name.toLowerCase().includes(query) &&
          !stadium.address.toLowerCase().includes(query) &&
          !stadium.district.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // District filter
      if (selectedDistrict && stadium.district !== selectedDistrict) {
        return false;
      }

      // Price range filter
      const range = PRICE_RANGES[selectedPriceRange];
      if (stadium.price_per_hour < range.min || stadium.price_per_hour > range.max) {
        return false;
      }

      // Amenities filter
      if (selectedAmenities.length > 0) {
        if (!selectedAmenities.every(a => stadium.amenities.includes(a))) {
          return false;
        }
      }

      return true;
    });
  }, [stadiums, searchQuery, selectedDistrict, selectedPriceRange, selectedAmenities]);

  const activeFilterCount =
    (selectedDistrict ? 1 : 0) +
    (selectedPriceRange > 0 ? 1 : 0) +
    selectedAmenities.length;

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedDistrict('');
    setSelectedPriceRange(0);
    setSelectedAmenities([]);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleMarkerClick = useCallback((stadiumId: string) => {
    setHighlightedStadiumId(stadiumId);
    // Scroll to the card
    const card = cardRefs.current[stadiumId];
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleCardHover = (stadiumId: string) => {
    setHighlightedStadiumId(stadiumId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 rounded-full border-2 border-neon-green/30 border-t-neon-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-gradient">
          Stadiums
        </h1>
        <p className="text-slate-400 text-lg">
          Premium football venues in Baku
        </p>
      </div>

      {/* Map Overview */}
      {stadiums.length > 0 && (
        <StadiumsMap
          stadiums={filteredStadiums.length > 0 ? filteredStadiums : stadiums}
          highlightedId={highlightedStadiumId}
          onMarkerClick={handleMarkerClick}
        />
      )}

      {/* Search & Filters Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-12 py-3"
              placeholder="Search stadiums..."
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter toggle button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 whitespace-nowrap ${
              showFilters ? 'border-neon-green/30 text-neon-green' : ''
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-neon-green text-dark-950 text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="card space-y-5 animate-slide-down">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* District filter */}
              <div>
                <label className="label">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="input py-2.5"
                >
                  <option value="">All districts</option>
                  {districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Price range filter */}
              <div>
                <label className="label">Price Range</label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(Number(e.target.value))}
                  className="input py-2.5"
                >
                  {PRICE_RANGES.map((range, i) => (
                    <option key={i} value={i}>{range.label}</option>
                  ))}
                </select>
              </div>

              {/* Amenities multi-select */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="label">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_AMENITIES.map(amenity => {
                    const selected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all duration-200
                          ${selected
                            ? 'bg-neon-green/15 text-neon-green border-neon-green/30 shadow-glow-green-sm'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-300'
                          }`}
                      >
                        {amenityIcons[amenity]}
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <div className="flex justify-end pt-2 border-t border-white/5">
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-slate-400 hover:text-neon-red transition-colors flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">
          {filteredStadiums.length} stadium{filteredStadiums.length !== 1 ? 's' : ''} found
        </span>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-neon-green hover:text-neon-green/80 transition-colors text-xs"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Stadium Cards Grid */}
      {filteredStadiums.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStadiums.map((stadium) => {
            const matchCount = getUpcomingMatchesCount(stadium.id);
            const isHighlighted = highlightedStadiumId === stadium.id;
            return (
              <div
                key={stadium.id}
                ref={(el) => { cardRefs.current[stadium.id] = el; }}
                onMouseEnter={() => handleCardHover(stadium.id)}
                onMouseLeave={() => setHighlightedStadiumId(null)}
                className={`card group transition-all duration-300 flex flex-col ${
                  isHighlighted
                    ? 'scale-[1.02] shadow-glow-green border-neon-green/30'
                    : 'hover:scale-[1.02] hover:shadow-card-hover'
                }`}
              >
                {/* Stadium Image / Header Area */}
                <div className="w-full h-40 bg-gradient-to-br from-neon-green/10 via-dark-800 to-neon-cyan/5 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  <Building className="w-14 h-14 text-neon-green/20 group-hover:text-neon-green/30 transition-colors" />

                  {/* Price badge (top-left) */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 text-sm font-heading font-bold px-3 py-1.5 rounded-lg bg-dark-950/80 text-neon-green border border-neon-green/20 backdrop-blur-sm">
                      &#8380;{stadium.price_per_hour}<span className="text-[10px] text-slate-400 font-normal">/hr</span>
                    </span>
                  </div>

                  {/* Top-right badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                    <span className="badge badge-blue text-[11px]">
                      <Users className="w-3 h-3 mr-1" />
                      {stadium.capacity} players
                    </span>
                    {matchCount > 0 && (
                      <span className="badge badge-green text-[11px]">
                        <Calendar className="w-3 h-3 mr-1" />
                        {matchCount} match{matchCount !== 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stadium Info */}
                <div className="space-y-3 flex-1 flex flex-col">
                  {/* Name & District */}
                  <div>
                    <h3 className="font-heading font-bold text-xl text-white group-hover:text-neon-green transition-colors leading-tight">
                      {stadium.name}
                    </h3>
                    <span className="text-xs text-neon-cyan/70 uppercase tracking-wider font-semibold">
                      {stadium.district}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-slate-400">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-500" />
                    <span className="text-sm leading-snug">{stadium.address}</span>
                  </div>

                  {/* Amenities */}
                  <div className="pt-3 border-t border-white/5 flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      {stadium.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full
                                     bg-white/5 text-slate-300 border border-white/5
                                     group-hover:border-neon-green/10 group-hover:bg-neon-green/5 transition-colors"
                        >
                          {amenityIcons[amenity] || <Building className="w-3 h-3" />}
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action link */}
                  <Link
                    href={`/rooms?stadium=${stadium.id}`}
                    className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-sm group/link"
                  >
                    <span className="text-slate-400 group-hover/link:text-neon-green transition-colors">
                      {matchCount > 0
                        ? `View ${matchCount} upcoming match${matchCount !== 1 ? 'es' : ''}`
                        : 'View matches at this venue'}
                    </span>
                    <span className="text-neon-green/50 group-hover/link:text-neon-green group-hover/link:translate-x-1 transition-all">
                      &rarr;
                    </span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-5">
            <MapPin className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-heading font-semibold text-slate-300 mb-2">No stadiums found</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            {searchQuery || activeFilterCount > 0
              ? 'No stadiums match your current filters. Try adjusting your search or removing some filters.'
              : 'No stadiums are available yet. Check back soon!'}
          </p>
          {(searchQuery || activeFilterCount > 0) && (
            <button
              onClick={clearAllFilters}
              className="btn-secondary"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
