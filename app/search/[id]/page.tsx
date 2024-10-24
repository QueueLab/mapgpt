import { notFound, redirect } from 'next/navigation'
import { Chat } from '@/components/chat'
import { getChat } from '@/lib/actions/chat'
import { AI } from '@/app/actions'

export const maxDuration = 60

export interface SearchPageProps {
  params: {
    id: string
  }
}

/**
 * Generates metadata for the search page based on the chat title.
 * @param {SearchPageProps} params - The search page parameters.
 * @returns {Object} - The metadata object containing the title.
 */
export async function generateMetadata({ params }: SearchPageProps) {
  const chat = await getChat(params.id, 'anonymous')
  return {
    title: chat?.title.toString().slice(0, 50) || 'Search'
  }
}

/**
 * The main component for the search page.
 * It fetches the chat data and renders the Chat component.
 * @param {SearchPageProps} params - The search page parameters.
 * @returns {JSX.Element} - The rendered search page component.
 */
export default async function SearchPage({ params }: SearchPageProps) {
  // Replace with supabase user ID
  const userId = 'anonymous'
  const chat = await getChat(params.id, userId)

  if (!chat) {
    redirect('/')
  }

  if (chat?.userId !== userId) {
    notFound()
  }

  return (
    <AI
      initialAIState={{
        chatId: chat.id,
        messages: chat.messages
      }}
    >
      <Chat id={params.id} />
    </AI>
  )
}
