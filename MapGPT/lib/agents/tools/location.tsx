/**
 * Provides a location tool for geocoding and map toggling.
 *
 * The `locationTool` function returns an object with the following properties:
 * - `description`: A brief description of the tool's functionality.
 * - `parameters`: An object defining the input parameters for the tool, including the `query` parameter of type `string` which represents the place name or address to search for.
 * - `execute`: An asynchronous function that takes the `query` parameter, fetches geocoding data from the Mapbox API, and returns the search result. If an error occurs during the API request, it updates the UI with an error message.
 *
 * The `LocationToolProps` interface defines the required props for the location tool, including the `uiStream` and `fullResponse` values.
 */
import { createStreamableUI, createStreamableValue } from 'ai/rsc'
import { Card } from '@/components/ui/card'
import { ToolProps } from '.'
import { LocationSearchSection } from '@/components/location-search-section'

interface LocationToolProps {
  uiStream: ReturnType<typeof createStreamableUI>
  fullResponse: string
}

export const locationTool = ({
  uiStream,
  fullResponse
}: LocationToolProps) => ({
  description: 'Location tool for geocoding place names to coordinates',
  parameters: {
    query: { type: 'string', description: 'Place name or address' }
  },
  execute: async ({ query }: { query: string }) => {
    let hasError = false
    const streamResults = createStreamableValue<string>()

    // Display the search section
    uiStream.append(<LocationSearchSection result={streamResults.value} />)

    try {
      // Fetch geocoding data from Mapbox API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const searchResult = await response.json()
      streamResults.done(JSON.stringify(searchResult)) // Stream geocoding results to UI

      if (
        searchResult &&
        searchResult.features &&
        searchResult.features.length > 0
      ) {
        const coordinates = searchResult.features[0].geometry.coordinates

        return searchResult
      }
    } catch (error: any) {
      console.error('Location Search API error:', error)
      hasError = true
      fullResponse += `\nAn error occurred while searching for locations with "${query}".`

      // Update UI with error message
      uiStream.update(
        <Card className="p-4 mt-2 text-sm">
          {`An error occurred while searching for locations with "${query}".`}
        </Card>
      )

      return { error: error.message }
    }
  }
})
