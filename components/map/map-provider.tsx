'use client'

import { useSettingsStore } from '@/lib/store/settings'
import dynamic from 'next/dynamic'
import { UserCollaborationOverlay } from './user-collaboration-overlay'

const Mapbox = dynamic(
  () => import('./mapbox-map').then(mod => mod.Mapbox),
  { ssr: false, loading: () => <div className="h-full w-full bg-gray-200 animate-pulse" /> }
)

const GoogleMapComponent = dynamic(
  () => import('./google-map').then(mod => mod.GoogleMapComponent),
  { ssr: false, loading: () => <div className="h-full w-full bg-gray-200 animate-pulse" /> }
)

export function MapProvider({ position }: { position?: { latitude: number; longitude: number; } }) {
  const { mapProvider } = useSettingsStore()

  return (
    <div className="relative h-full w-full overflow-hidden">
      {mapProvider === 'google' ? (
        <GoogleMapComponent />
      ) : (
        <Mapbox position={position} />
      )}
      <UserCollaborationOverlay />
    </div>
  )
}
