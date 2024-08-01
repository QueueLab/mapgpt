'use client'

import { useState, useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import * as turf from '@turf/turf'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { useMapToggle, MapToggleEnum } from '../map-toggle-context'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""

export const Mapbox: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [is3D, setIs3D] = useState(true)
  const [roundedArea, setRoundedArea] = useState<number | null>(null);

  const [position, setPosition] = useState({
    latitude: -74.0060152,
    longitude: 40.7127281
  })
  const {mapType} = useMapToggle();

  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      trash: true
    },
    defaultMode: 'draw_polygon'
  });

  useEffect(() => {
    if(mapType !== MapToggleEnum.RealTimeMode)
        return;

    let watchId: number | null = null
    // real time location
    if (!navigator.geolocation) {
      toast('Geolocation is not supported by your browser')
    } else {
      const success = (geoPos: GeolocationPosition) => {
        setPosition({
          latitude: geoPos.coords.latitude,
          longitude: geoPos.coords.longitude
        })
        mapType === MapToggleEnum.RealTimeMode &&map.current &&
          map.current.flyTo({
            center: [geoPos.coords.longitude, geoPos.coords.latitude],
            zoom: 12
          })
      }

      const error = (error: GeolocationPositionError) => {}
      watchId = navigator.geolocation.watchPosition(success, error)

      return () => {
        watchId && navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [mapType]);

  useEffect(() => {
    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12', // Satellite style
        center: [-74.0060152, 40.7127281], // Coordinates for Mount Everest
        zoom: 12, // Closer zoom for better 3D effect
        pitch: 60, // Tilts the map for a 3D effect
        bearing: -20, // Rotates the map for a better view
        maxZoom: 22,
        attributionControl: true
      })

      // actions
      const updateArea = (event: MapboxDraw.DrawCreateEvent | MapboxDraw.DrawUpdateEvent) => {
        const { features } = event;
        const data = draw.getAll();
        if (features && features.length > 0) {
          const polygon = features[0];
          console.log('Polygon created:', polygon);
          const area = turf.area(data);
          setRoundedArea(Math.round(area * 100) / 100);
        }
      };
      // Add zoom controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
      // Add draw controls
      map.current.addControl(draw, 'top-right');

      map.current.on('draw.create', updateArea);
      map.current.on('draw.delete', updateArea);
      map.current.on('draw.update', updateArea);
      // Add terrain
      map.current.on('load', () => {
        map.current.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14
        })

        // Add the DEM source as a terrain layer with exaggerated height
        map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })

        // Add sky layer for background
        map.current.addLayer({
          id: 'sky',
          type: 'sky',
          paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
          }
        })
      })

      // Clean up on unmount
      return () => {
        map.current?.remove()
      }
    }
  }, [])

  return (
    <div className="h-full w-full overflow-hidden rounded-l-lg">
      <div
        className="w=full h-full"
        ref={mapContainer}
      />
      <div className="absolute bottom-10 left-10 h-30 w-48 bg-white bg-opacity-80 p-3.5 text-center rounded-lg !text-black">
        <p>Draw Area</p>
        <div>
          {
            roundedArea && (
              <>
                <p>
                  <strong>{roundedArea}</strong>
                </p>
                <p>square meters</p>
              </>
            )
          }
        </div>
      </div>
    </div>
  )
}
