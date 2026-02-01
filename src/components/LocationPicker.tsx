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

        // Fix default marker icon
        const icon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        // Mark as initialized before creating map
        initializedRef.current = true;

        // Create map
        const map = L.map(containerRef.current!, {
          center: [selectedLat, selectedLng],
          zoom: 14,
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Add draggable marker
        const marker = L.marker([selectedLat, selectedLng], {
          icon,
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
        className="bg-gray-800 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center text-gray-400">
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
        <p className="text-sm text-gray-400">
          Click on the map or drag the marker to set location
        </p>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="flex items-center space-x-1 text-sm text-green-400 hover:text-green-300"
        >
          <Navigation className="w-4 h-4" />
          <span>Use my location</span>
        </button>
      </div>

      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden border border-gray-700" style={{ height }}>
        {/* Loading overlay */}
        {!mapLoaded && (
          <div
            className="absolute inset-0 bg-gray-800 flex items-center justify-center z-10"
          >
            <div className="text-center text-gray-400">
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
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Lat: {selectedLat.toFixed(6)}</span>
        <span>Lng: {selectedLng.toFixed(6)}</span>
      </div>
    </div>
  );
}
