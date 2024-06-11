'use client'

import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export const Mapbox: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [is3D, setIs3D] = useState(false);

  useEffect(() => {
    if (mapContainer.current) {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-v9", // Satellite style
        center: [-74.0060152, 40.7127281], // Coordinates for Mount Everest
        zoom: 12, // Closer zoom for better 3D effect
        pitch: 60, // Tilts the map for a 3D effect
        bearing: -20, // Rotates the map for a better view
        maxZoom: 15,
        attributionControl: false
      });

      // Add zoom controls
      map.addControl(new mapboxgl.NavigationControl(), "top-left");

      // Add terrain
      map.on('load', () => {
        map.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14
        });
        
        // Add the DEM source as a terrain layer with exaggerated height
        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

        // Add sky layer for background
        map.addLayer({
          'id': 'sky',
          'type': 'sky',
          'paint': {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
          }
        });
      });

      // Clean up on unmount
      return () => map.remove();
    }
  }, []);

  return (
    <div ref={mapContainer} style={{ height: '88%', width: '100%' }} className="overflow-hidden rounded-l-lg"/>
  );
}
