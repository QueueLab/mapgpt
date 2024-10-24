import React from 'react'
import { ModeToggle } from './mode-toggle'
import { IconLogo } from './ui/icons'
import { cn } from '@/lib/utils'
import HistoryContainer from './history-container'
import { Button } from '@/components/ui/button'
import {
  Search,
  CircleUserRound,
  Map,
  CalendarDays,
  TentTree
} from 'lucide-react'
import { MapToggle } from './map-toggle'
import { ProfileToggle } from './profile-toggle'

export const Header: React.FC = async () => {
  return (
    <header className="fixed w-full p-1 md:p-2 flex justify-between items-center z-10 backdrop-blur md:backdrop-blur-none bg-background/80 md:bg-transparent">
      <div>
        <a href="/">
          <IconLogo className={cn('w-5 h-5')} />
          <span className="sr-only">Chat</span>
        </a>
      </div>

      <div className="w-1/2 gap-20 flex justify-between px-10 items-center z-10">
        <ProfileToggle />
        <MapToggle />

        <Button variant="ghost" size="icon">
          <CalendarDays className="h-[1.2rem] w-[1.2rem] transition-all rotate-0 scale-100" />
        </Button>

        <Button variant="ghost" size="icon">
          <Search className="h-[1.2rem] w-[1.2rem] transition-all rotate-0 scale-100" />
        </Button>

        <Button variant="ghost" size="icon">
          <TentTree className="h-[1.2rem] w-[1.2rem] transition-all rotate-0 scale-100" />
        </Button>
        
        <ModeToggle />

        <HistoryContainer location="header" />
      </div>
    </header>
  )
}

export default Header
