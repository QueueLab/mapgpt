import { retrieveSchema } from '@/lib/schema/retrieve'
import { ToolProps } from '.'
import { Card } from '@/components/ui/card'
import { SearchSkeleton } from '@/components/search-skeleton'
import { SearchResults as SearchResultsType } from '@/lib/types'
import RetrieveSection from '@/components/retrieve-section'

/**
 * The retrieveTool function handles the process of retrieving content from the web.
 * It fetches the content from the specified URL and updates the UI stream with the results.
 * @param {ToolProps} props - The properties for the tool, including the UI stream and full response.
 * @returns {Object} - The result object containing the retrieved content.
 */
export const retrieveTool = ({ uiStream, fullResponse }: ToolProps) => ({
  description: 'Retrieve content from the web',
  parameters: retrieveSchema,
  execute: async ({ url }: { url: string }) => {
    let hasError = false
    // Append the search section
    uiStream.append(<SearchSkeleton />)

    let results: SearchResultsType | undefined
    try {
      const response = await fetch(`https://r.jina.ai/${url}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-With-Generated-Alt': 'true'
        }
      })
      const json = await response.json()
      if (!json.data || json.data.length === 0) {
        hasError = true
      } else {
        results = {
          results: [
            {
              title: json.data.title,
              content: json.data.content,
              url: json.data.url
            }
          ],
          query: '',
          images: []
        }
      }
    } catch (error) {
      hasError = true
      console.error('Retrieve API error:', error)

      fullResponse += `\n${error} "${url}".`

      uiStream.update(
        <Card className="p-4 mt-2 text-sm">{`${error} "${url}".`}</Card>
      )
      return results
    }

    if (hasError || !results) {
      fullResponse += `\nAn error occurred while retrieving "${url}".`
      uiStream.update(
        <Card className="p-4 mt-2 text-sm">
          {`An error occurred while retrieving "${url}".This webiste may not be supported.`}
        </Card>
      )
      return results
    }

    uiStream.update(<RetrieveSection data={results} />)

    return results
  }
})
