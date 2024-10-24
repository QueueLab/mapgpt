'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Map } from 'lucide-react'
import { useMapToggle, MapToggleEnum } from './map-toggle-context'

export function MapToggle() {
  const { setMapType } = useMapToggle();

  const handleMapTypeChange = (type: MapToggleEnum) => {
    setMapType(type);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Map className="h-[1.2rem] w-[1.2rem] transition-all rotate-0 scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleMapTypeChange(MapToggleEnum.FreeMode)}>
          My Maps
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleMapTypeChange(MapToggleEnum.RealTimeMode)}>
          Live
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
