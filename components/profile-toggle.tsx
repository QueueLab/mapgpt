'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { CircleUserRound } from 'lucide-react'
import { useProfileActions, ProfileActionEnum } from './profile-toggle-context'


export function ProfileToggle() {
  const { handleAction } = useProfileActions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <CircleUserRound className="h-[1.2rem] w-[1.2rem] transition-all" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => { handleAction(ProfileActionEnum.AccountSettings) }}>
          Account Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { handleAction(ProfileActionEnum.SignOut) }}>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
