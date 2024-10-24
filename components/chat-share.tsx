'use client'

import { useState, useTransition } from 'react'
import { Button } from './ui/button'
import { Share } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
  DialogTitle
} from './ui/dialog'
import { shareChat } from '@/lib/actions/chat'
import { toast } from 'sonner'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { Spinner } from './ui/spinner'

interface ChatShareProps {
  chatId: string
  className?: string
}

export function ChatShare({ chatId, className }: ChatShareProps) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const { copyToClipboard } = useCopyToClipboard({ timeout: 1000 })
  const [shareUrl, setShareUrl] = useState('')

  /**
   * Handles the sharing of the chat.
   * It starts a transition, sets the dialog open, and attempts to share the chat.
   * If successful, it sets the share URL.
   * If an error occurs, it displays an error message.
   */
  const handleShare = async () => {
    startTransition(() => {
      setOpen(true)
    })
    try {
      const result = await shareChat(chatId)
      if (!result) {
        toast.error('Failed to share chat')
        return
      }

      if (!result.sharePath) {
        toast.error('Could not copy link to clipboard')
        return
      }

      const url = new URL(result.sharePath, window.location.href)
      setShareUrl(url.toString())
    } catch (error) {
      console.error('Error in shareChat:', error)
      toast.error('An error occurred while sharing the chat')
    }
  }

  /**
   * Handles the copying of the share URL to the clipboard.
   * If the share URL is available, it copies the URL and displays a success message.
   * If no share URL is available, it displays an error message.
   */
  const handleCopy = () => {
    if (shareUrl) {
      copyToClipboard(shareUrl)
      toast.success('Link copied to clipboard')
      setOpen(false)
    } else {
      toast.error('No link to copy')
    }
  }

  return (
    <div className={className}>
      <Dialog
        open={open}
        onOpenChange={open => setOpen(open)}
        aria-labelledby="share-dialog-title"
        aria-describedby="share-dialog-description"
      >
        <DialogTrigger asChild>
          <Button
            className="rounded-full"
            size="icon"
            variant={'ghost'}
            onClick={() => setOpen(true)}
          >
            <Share size={14} />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share link to search result</DialogTitle>
            <DialogDescription>
              Anyone with the link will be able to view this search result.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="items-center">
            {!shareUrl && (
              <Button onClick={handleShare} disabled={pending} size="sm">
                {pending ? <Spinner /> : 'Get link'}
              </Button>
            )}
            {shareUrl && (
              <Button onClick={handleCopy} disabled={pending} size="sm">
                {'Copy link'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
