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

        // Mark as initialized
        initializedRef.current = true;

        // Create map
        const map = L.map(containerRef.current!, {
          center: [latitude, longitude],
          zoom: 15,
          scrollWheelZoom: false,
        });

        // Dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }).addTo(map);

        // Add marker with styled popup
        const marker = L.marker([latitude, longitude], { icon: greenIcon }).addTo(map);

        if (name || address) {
          const popupContent = `
            <div style="
              background: #1e293b;
              color: #e2e8f0;
              padding: 8px 12px;
              border-radius: 8px;
              font-family: system-ui, sans-serif;
              border: 1px solid rgba(255,255,255,0.1);
              min-width: 120px;
            ">
              ${name ? `<div style="font-weight: 600; font-size: 13px; color: #00ff88;">${name}</div>` : ''}
              ${address ? `<div style="font-size: 11px; margin-top: 2px; color: #94a3b8;">${address}</div>` : ''}
            </div>
          `;
          marker.bindPopup(popupContent, {
            className: 'dark-popup',
            closeButton: false,
          });
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
          border: 1px solid rgba(255,255,255,0.1);
        }
      `}</style>
      <div
        className="relative rounded-xl overflow-hidden border border-white/10"
        style={{ height }}
      >
        {/* Loading overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-dark-900 flex items-center justify-center z-10">
            <div className="text-center text-slate-500">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Loading map...</p>
              {address && <p className="text-xs mt-1 text-slate-600">{address}</p>}
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
