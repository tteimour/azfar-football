'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
}

// Default location: Baku city center
const DEFAULT_LAT = 40.4093;
const DEFAULT_LNG = 49.8671;

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  height = '300px',
}: LocationPickerProps) {
  const [selectedLat, setSelectedLat] = useState<number>(latitude || DEFAULT_LAT);
  const [selectedLng, setSelectedLng] = useState<number>(longitude || DEFAULT_LNG);
  const [isClient, setIsClient] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current || initializedRef.current) return;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;

        // Custom green marker using divIcon
        const greenIcon = L.divIcon({
          html: `<div style="
            width: 24px; height: 24px;
            background: #00ff88;
            border: 3px solid #0a0e1a;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 0 10px rgba(0,255,136,0.5);
          "></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 24],
          popupAnchor: [0, -24],
          className: '',
        });

        // Mark as initialized before creating map
        initializedRef.current = true;

        // Create map
        const map = L.map(containerRef.current!, {
          center: [selectedLat, selectedLng],
          zoom: 14,
        });

        // Dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }).addTo(map);

        // Add draggable marker
        const marker = L.marker([selectedLat, selectedLng], {
          icon: greenIcon,
          draggable: true,
        }).addTo(map);

        // Handle marker drag
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setSelectedLat(pos.lat);
          setSelectedLng(pos.lng);
          onLocationChange(pos.lat, pos.lng);
        });

        // Handle map click
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setSelectedLat(lat);
          setSelectedLng(lng);
          onLocationChange(lat, lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        // Force a resize after a short delay to ensure proper rendering
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

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        initializedRef.current = false;
      }
    };
  }, [isClient]); // Only depend on isClient, not on coordinates

  const handleGetCurrentLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setSelectedLat(lat);
          setSelectedLng(lng);
          onLocationChange(lat, lng);

          // Update map and marker
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lng], 14);
            markerRef.current.setLatLng([lat, lng]);
          }
        },
        (error) => {
          console.warn('Geolocation error (requires HTTPS):', error.message);
          alert('Could not get your location. On localhost, try selecting manually on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }, [onLocationChange]);

  if (!isClient) {
    return (
      <div
        className="bg-dark-900 rounded-xl flex items-center justify-center border border-white/10"
        style={{ height }}
      >
        <div className="text-center text-slate-500">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      {/* Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          Click on the map to set location
        </p>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-neon-green text-sm hover:bg-white/10 transition-all"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Use my location</span>
        </button>
      </div>

      {/* Map Container */}
      <div
        className="relative rounded-xl overflow-hidden border border-white/10"
        style={{ height }}
      >
        {/* Instruction overlay */}
        {mapLoaded && !latitude && !longitude && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] px-3 py-1.5 rounded-full bg-dark-900/90 border border-white/10 text-xs text-slate-300 backdrop-blur-sm pointer-events-none">
            Click on the map to set location
          </div>
        )}
        {/* Loading overlay */}
        {!mapLoaded && (
          <div
            className="absolute inset-0 bg-dark-900 flex items-center justify-center z-10"
          >
            <div className="text-center text-slate-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 animate-pulse" />
              <p className="text-sm">Loading map...</p>
            </div>
          </div>
        )}
        {/* Actual map container */}
        <div
          ref={containerRef}
          style={{ height: '100%', width: '100%' }}
        />
      </div>

      {/* Coordinates Display */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="font-mono">Lat: {selectedLat.toFixed(6)}</span>
        <span className="font-mono">Lng: {selectedLng.toFixed(6)}</span>
      </div>
    </div>
  );
}
