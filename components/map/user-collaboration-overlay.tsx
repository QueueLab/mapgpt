'use client'

import { useEffect, useState, useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { useParams } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client'
import type { Participant } from '@/lib/types'
import {
  getUserColor,
  formatUserDisplayName,
  formatParticipantName
} from '@/lib/utils/user-collaboration'

interface UserBadgeInfo {
  id: string
  name: string
  color: string
  isCurrentUser: boolean
}

export function UserCollaborationOverlay() {
  const { user, isLoaded, isSignedIn } = useUser()
  const params = useParams()
  const chatId = typeof params?.id === 'string' ? params.id : undefined

  const [participants, setParticipants] = useState<Participant[]>([])

  // Fetch participants for current chat
  useEffect(() => {
    if (!chatId || !isSignedIn) {
      setParticipants([])
      return
    }

    let isMounted = true

    const fetchParticipants = async () => {
      try {
        const res = await fetch(`/api/chats/${chatId}/participants`)
        if (res.ok) {
          const data = await res.json()
          if (isMounted) {
            setParticipants(data.participants || [])
          }
        }
      } catch (error) {
        console.error('Error fetching chat participants for map overlay:', error)
      }
    }

    fetchParticipants()

    // Subscribe to real-time participant changes
    const supabase = getSupabaseBrowserClient()
    if (supabase) {
      const channel = supabase
        .channel(`map-participants-${chatId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_participants',
            filter: `chat_id=eq.${chatId}`
          },
          () => {
            fetchParticipants()
          }
        )
        .subscribe()

      return () => {
        isMounted = false
        supabase.removeChannel(channel)
      }
    }

    return () => {
      isMounted = false
    }
  }, [chatId, isSignedIn])

  // Build current user badge only if authorized and loaded
  const currentUserBadge = useMemo<UserBadgeInfo | null>(() => {
    if (!isLoaded || !isSignedIn || !user) return null

    const name = formatUserDisplayName(user)
    if (!name) return null

    const currentUserId = user.id || 'current_user'
    const color = getUserColor(currentUserId)
    return {
      id: currentUserId,
      name,
      color,
      isCurrentUser: true,
    }
  }, [user, isLoaded, isSignedIn])

  // Build list of user badges to display
  const userBadges = useMemo<UserBadgeInfo[]>(() => {
    const list: UserBadgeInfo[] = []

    if (currentUserBadge) {
      list.push(currentUserBadge)
    }

    participants.forEach(p => {
      // Exclude current user if already listed
      if (user?.id && p.userId === user.id) return

      const name = formatParticipantName(p)
      const color = getUserColor(p.userId)
      list.push({
        id: p.userId,
        name,
        color,
        isCurrentUser: false,
      })
    })

    return list
  }, [currentUserBadge, participants, user?.id])

  if (userBadges.length === 0) {
    return null
  }

  return (
    <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-2 pointer-events-auto select-none">
      {userBadges.map(b => (
        <div
          key={b.id}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 text-xs font-medium shadow-md transition-all hover:bg-black/75"
          title={b.isCurrentUser ? `${b.name} (You)` : b.name}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_6px_rgba(255,255,255,0.6)]"
            style={{ backgroundColor: b.color }}
          />
          <span className="truncate max-w-[120px] tracking-wide">{b.name}</span>
        </div>
      ))}
    </div>
  )
}

export default UserCollaborationOverlay
