'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type Chat } from '@/lib/types'
import { Redis } from '@upstash/redis'
import { Index } from '@upstash/vector'
import { custom, RAGChat } from '@upstash/rag-chat'
import { aiUseChatAdapter } from '@upstash/rag-chat/nextjs'
import { getModel } from '@/lib/utils'
import { locationTool } from '@/lib/agents/tools/location'
import { updateMapPosition } from '@/components/map/mapbox-map'

// Initialize a new Redis instance with environment variables for URL and token
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
})

//When is this POST Request triggered?

// Function to get chats for a specific user
export async function getChats(userId?: string | null) {
  if (!userId) {
    return [] // Return an empty array if there is an error
  }

  try {
    // Start a Redis pipeline to batch commands
    const pipeline = redis.pipeline()
    // Get the list of chat IDs for the user, sorted in reverse order
    const chats: string[] = await redis.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true
    })

    // For each chat ID, add a command to the pipeline to get all its fields
    for (const chat of chats) {
      pipeline.hgetall(chat)
    }

    // Execute the pipeline and get the results
    const results = await pipeline.exec()

    return results as Chat[] // Return the results cast as an array of Chat objects
  } catch (error) {
    return [] // Return an empty array if there is an error
  }
}

// Function to get a specific chat by its ID
export async function getChat(id: string, userId: string = 'anonymous') {
  // Get all fields of the chat with the given ID
  const chat = await redis.hgetall<Chat>(`chat:${id}`)

  if (!chat) {
    return null // Return null if the chat is not found
  }

  return chat // Return the chat object
}

// Function to clear all chats for a specific user
export async function clearChats(
  //replace with supabase userID
  userId: string = 'anonymous'
): Promise<{ error?: string }> {
  // Get the list of chat IDs for the user, sorted in reverse order
  const chats: string[] = await redis.zrange(`user:chat:${userId}`, 0, -1)
  // Return an error message if no chats are found
  if (!chats.length) {
    return { error: 'No chats to clear' }
  }

  // Start a Redis pipeline to batch commands
  const pipeline = redis.pipeline()

  // For each chat ID, add commands to the pipeline to delete the chat and remove its reference from the sorted set
  for (const chat of chats) {
    pipeline.del(chat)
    pipeline.zrem(`user:chat:${userId}`, chat)
  }

  // Execute the pipeline
  await pipeline.exec()

  // Revalidate the path to refresh the page
  revalidatePath('/')
  // Redirect to the homepage
  redirect('/')
}

// Function to save a chat for a specific user
export async function saveChat(chat: Chat, userId: string = 'anonymous') {
  // Start a Redis pipeline to batch commands
  const pipeline = redis.pipeline()
  // Set all fields of the chat with the given ID
  pipeline.hmset(`chat:${chat.id}`, chat)
  // Add the chat ID to the sorted set with the current timestamp as the key and the chat ID as the value
  pipeline.zadd(`user:chat:${chat.userId}`, {
    score: Date.now(),
    member: `chat:${chat.id}`
  })

  // Execute the pipeline
  await pipeline.exec()
}

// Function to get a shared chat by its ID
export async function getSharedChat(id: string) {
  // Get all fields of the chat with the given ID
  const chat = await redis.hgetall<Chat>(`chat:${id}`)

  if (!chat || !chat.sharePath) {
    return null // Return null if the chat is not found or not shared
  }

  return chat // Return the shared chat object
}

// Function to share a chat for a specific user
export async function shareChat(id: string, userId: string = 'anonymous') {
  // Get all fields of the chat with the given ID
  const chat = await redis.hgetall<Chat>(`chat:${id}`)

  // Return null if the chat is not found or does not belong to the user
  if (!chat || chat.userId !== userId) {
    return null
  }

  // Create a payload with the chat data and a share path
  const payload = {
    ...chat,
    sharePath: `/share/${id}`
  }

  // Set all fields of the chat with the updated payload
  await redis.hmset(`chat:${id}`, payload)

  return payload
}

/* Initialize RAGChat
export const ragChat = new RAGChat({
  model: custom(getModel().modelId),
  debug: true // Enable debugging
})

// Function to embed data into the RAGChat context
export async function embedData(filePath: string) {
  await ragChat.context.add({
    type: 'pdf',
    fileSource: filePath,
    options: {
      metadata: {
        source: filePath
      }
    }
  })
}

// Function to handle chat requests
export async function POST(req: Request) {
  const { messages } = await req.json()
  const lastMessage = messages[messages.length - 1].content

  const response = await ragChat.chat(lastMessage, {
    streaming: true,
    history: messages
      .slice(0, -1)
      .map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content
      }))
  })

  return aiUseChatAdapter(response)
}

// Function to get chat history
export async function getChats(userId: string) {
  return ragChat.history.service.getMessages({
    sessionId: userId
  })
}

// Function to clear chat history
export async function clearChats(userId: string) {
  await ragChat.history.service.deleteMessages({ sessionId: userId })
  return { success: true }
}

// Example of how to use the chat in a Next.js API route
export async function chatHandler(req: Request) {
  if (req.method === 'POST') {
    const { message, userId } = await req.json()

    const response = await ragChat.chat(message, {
      streaming: true,
      sessionId: userId
    })

    return new Response(response.output)
  } else {
    return new Response('Method not allowed', { status: 405 })
  }
}

// Function to share a chat for a specific user
// Function to save a chat for a specific user
export async function saveChat(chat: Chat, userId: string = 'anonymous') {
  const messages = chat.messages.map(msg => ({
    role:
      msg.role === 'user' || msg.role === 'assistant' ? msg.role : 'assistant',
    content: msg.content
  }))

  for (const message of messages) {
    await ragChat.history.service.addMessage({
      sessionId: userId,
      message: message
    })
  }

  return { success: true, chatId: chat.id }
}

// Function to share a chat for a specific user
export async function shareChat(chatId: string, userId: string = 'anonymous') {
  const messages = await ragChat.history.service.getMessages({
    sessionId: userId
  })

  if (!messages || messages.length === 0) {
    return null
  }

  const sharePath = `/share/${chatId}`

  // Update the last message with the share path
  const lastMessageIndex = messages.length - 1
  const updatedLastMessage = {
    ...messages[lastMessageIndex],
    metadata: { ...messages[lastMessageIndex].metadata, sharePath }
  }

  // Update the last message in the history service
  await ragChat.history.service.addMessage({
    sessionId: userId,
    message: updatedLastMessage
  })

  // Update the messages array
  messages[lastMessageIndex] = updatedLastMessage

  return {
    id: chatId,
    userId,
    messages,
    sharePath
  }
}

// Function to get a shared chat by its ID
export async function getSharedChat(id: string) {
  const messages = await ragChat.history.service.getMessages({ sessionId: id })

  if (!messages || messages.length === 0) {
    return null
  }

  const lastMessage = messages[messages.length - 1]
  if (!lastMessage.metadata?.sharePath) {
    return null // Return null if the chat is not shared
  }

  return {
    id,
    messages,
    sharePath: lastMessage.metadata.sharePath
  }
}
  */

export async function handleLocationBasedChatInput(input: string) {
  try {
    const location = await locationTool(input)
    if (location) {
      await updateMapPosition(location.latitude, location.longitude)
    }
  } catch (error) {
    console.error('Error handling location-based chat input:', error)
  }
}
