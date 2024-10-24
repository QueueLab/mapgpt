import { createStreamableUI, createStreamableValue } from 'ai/rsc'
import {
  CoreMessage,
  ToolCallPart,
  ToolResultPart,
  streamText as nonexperimental_streamText
} from 'ai'
import { Section } from '@/components/section'
import { BotMessage } from '@/components/message'
import { getTools } from './tools'
import { getModel } from '../utils'
import { Mapbox } from '@/components/map/mapbox-map'

export async function researcher(
  uiStream: ReturnType<typeof createStreamableUI>,
  streamText: ReturnType<typeof createStreamableValue<string>>,
  messages: CoreMessage[],
  useSpecificModel?: boolean
) {
  let fullResponse = ''
  let hasError = false
  const answerSection = (
    <Section title="Answer">
      <BotMessage content={streamText.value} />
    </Section>
  )

  const currentDate = new Date().toLocaleString()
  const result = await nonexperimental_streamText({
    model: getModel(),
    maxTokens: 2500,
    system: `As a professional search expert, you possess the ability to search for any information on the web.
    or any information on the web.
    For each user query, utilize the search results to their fullest potential to provide additional information and assistance in your response.
    you possess the ability to search for any geographical information on earth both visually by extracting semantics of three dimensional 
    high resolution low orbit satellite imagery as well as programmatically through geographical information systems endpoints.
    Always try to return image output in your query to provide user as much contextual information as possible.
    Aim to directly address the user's question, augmenting your response with insights gleaned from the search results.
    Whenever quoting or referencing information from a specific URL, always cite the source URL explicitly.
    The retrieve tool can only be used with URLs provided by the user. URLs from search results cannot be used.
    Please match the language of the response to the user's language. Current date and time: ${currentDate}`,
    messages,
    tools: getTools({
      uiStream,
      fullResponse
    })
  })

  // Remove the spinner
  uiStream.update(null)

  // Process the response
  const toolCalls: ToolCallPart[] = []
  const toolResponses: ToolResultPart[] = []
  for await (const delta of result.fullStream) {
    switch (delta.type) {
      case 'text-delta':
        if (delta.textDelta) {
          // If the first text delta is available, add a UI section
          if (fullResponse.length === 0 && delta.textDelta.length > 0) {
            // Update the UI
            uiStream.update(answerSection)
          }

          fullResponse += delta.textDelta
          streamText.update(fullResponse)
        }
        break
      case 'tool-call':
        toolCalls.push(delta)
        break
      case 'tool-result':
        // Append the answer section if the specific model is not used
        if (!useSpecificModel && toolResponses.length === 0 && delta.result) {
          uiStream.append(answerSection)
        }
        if (!delta.result) {
          hasError = true
        }
        toolResponses.push(delta)
        break
      case 'error':
        hasError = true
        fullResponse += `\nError occurred while executing the tool`
        break
    }
  }
  messages.push({
    role: 'assistant',
    content: [{ type: 'text', text: fullResponse }, ...toolCalls]
  })

  if (toolResponses.length > 0) {
    // Add tool responses to the messages
    messages.push({ role: 'tool', content: toolResponses })
  }

  // Integrate Mapbox API for contextual information
  const mapboxData = {
    latitude: 0, // Replace with actual latitude
    longitude: 0 // Replace with actual longitude
  }
  uiStream.append(
    <Section title="Mapbox">
      <Mapbox position={mapboxData} />
    </Section>
  )

  return { result, fullResponse, hasError, toolResponses }
}
