'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
  height?: string;
}

export default function LocationMap({
  latitude,
  longitude,
  name,
  address,
  height = '200px',
}: LocationMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
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

        // Mark as initialized
        initializedRef.current = true;

        // Create map
        const map = L.map(containerRef.current!, {
          center: [latitude, longitude],
          zoom: 15,
          scrollWheelZoom: false,
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Add marker with popup
        const marker = L.marker([latitude, longitude], { icon }).addTo(map);

        if (name || address) {
          const popupContent = `
            <div style="color: #333;">
              ${name ? `<strong>${name}</strong>` : ''}
              ${address ? `<p style="margin: 4px 0 0; font-size: 12px;">${address}</p>` : ''}
            </div>
          `;
          marker.bindPopup(popupContent);
        }

        mapInstanceRef.current = map;

        // Force resize after short delay
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
        initializedRef.current = false;
      }
    };
  }, [isClient, latitude, longitude, name, address]);

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
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div className="relative rounded-lg overflow-hidden" style={{ height }}>
        {/* Loading overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center z-10">
            <div className="text-center text-gray-400">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Loading map...</p>
              {address && <p className="text-xs mt-1">{address}</p>}
            </div>
          </div>
        )}
        {/* Actual map container */}
        <div
          ref={containerRef}
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </>
  );
}
