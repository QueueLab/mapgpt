/**
 * Renders a location search section that displays the results of a location search.
 *
 * @param {LocationSearchSectionProps} props - The props for the location search section.
 * @param {StreamableValue<string>} [props.result] - The streamable value containing the search results.
 * @returns {JSX.Element} - The rendered location search section.
 */
'use client'

import { LocationResultSection } from '@/components/location-result-section'
import { Section } from './section'
import { ToolBadge } from './tool-badge'
import type { SearchResults } from '@/lib/types'
import { StreamableValue, useStreamableValue } from 'ai/rsc'

export type LocationSearchSectionProps = {
  result?: StreamableValue<string>
}

export function LocationSearchSection({ result }: LocationSearchSectionProps) {
  const [data, error, pending] = useStreamableValue(result)
  const locationResults: SearchResults = data ? JSON.parse(data) : undefined

  return (
    <div>
      {!pending && data ? (
        <>
          <Section size="sm" className="pt-2 pb-0">
            <ToolBadge tool="location">{`${locationResults.query}`}</ToolBadge>
          </Section>
          <Section title="Locations">
            <LocationResultSection results={locationResults.results} />
          </Section>
        </>
      ) : (
        <Section className="pt-2 pb-0">Loading location results...</Section>
      )}
    </div>
  )
}
