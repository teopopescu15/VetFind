/**
 * LeafletMapWeb - Map component for web only.
 * Uses Leaflet (npm) directly. Renders in a div; no iframe, no external script loading.
 */

import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import type { Company } from '../types/company.types';

export interface LeafletMapWebProps {
  center: { latitude: number; longitude: number; label?: string };
  companies: Company[];
  onClinicSelect: (id: number, name: string) => void;
  style?: { width: string; height: number; borderRadius?: number; overflow?: string };
}

export default function LeafletMapWeb({ center, companies, onClinicSelect, style }: LeafletMapWebProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onSelectRef = useRef(onClinicSelect);
  onSelectRef.current = onClinicSelect;

  useEffect(() => {
    if (Platform.OS !== 'web' || !containerRef.current) return;

    const el = containerRef.current;

    // Ensure leaflet CSS is present
    const linkId = 'leaflet-css';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const L = require('leaflet');

    const map = L.map(el, { zoomControl: true }).setView([center.latitude, center.longitude], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const isUserLocation = center.label === 'My Location' || center.label === 'Home';
    const userLayer = isUserLocation
      ? L.circleMarker([center.latitude, center.longitude], {
          radius: 7,
          color: '#2563eb',
          weight: 2,
          fillColor: '#2563eb',
          fillOpacity: 0.7,
        })
          .addTo(map)
          .bindPopup(center.label === 'Home' ? 'Home' : 'You')
      : null;

    const clinics = (companies || []).filter(
      (c) => typeof (c as any)?.latitude === 'number' && typeof (c as any)?.longitude === 'number'
    );

    const markers: any[] = [];
    clinics.forEach((c) => {
      const lat = (c as any).latitude as number;
      const lng = (c as any).longitude as number;
      const m = L.circleMarker([lat, lng], {
        radius: 7,
        color: '#ef4444',
        weight: 2,
        fillColor: '#ef4444',
        fillOpacity: 0.75,
      })
        .addTo(map)
        .bindPopup(String((c as any)?.name || 'Clinic'));

      m.on('click', () => {
        try {
          onSelectRef.current(Number((c as any)?.id), String((c as any)?.name || 'Clinic'));
        } catch {
          // ignore
        }
      });
      markers.push(m);
    });

    // Fit bounds
    if (markers.length) {
      const layers = userLayer ? [userLayer].concat(markers) : markers;
      const group = L.featureGroup(layers);
      map.fitBounds(group.getBounds().pad(0.25));
    }

    return () => {
      try {
        map.remove();
      } catch {
        // ignore
      }
    };
  }, [center.latitude, center.longitude, center.label, companies]);

  return (
    <div
      ref={containerRef}
      style={{
        width: style?.width ?? '100%',
        height: (style?.height ?? 420) as any,
        borderRadius: style?.borderRadius ?? 12,
        overflow: style?.overflow ?? 'hidden',
      }}
    />
  );
}

