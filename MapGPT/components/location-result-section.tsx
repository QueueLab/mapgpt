/**
 * The `LocationResultSection` component displays a list of search result items, with the ability to show all results or a limited number of results.
 *
 * @param {LocationResultSectionProps} props - The props for the component.
 * @param {SearchResultItem[]} props.results - The array of search result items to display.
 * @returns {JSX.Element} - The rendered `LocationResultSection` component.
 */
'use client'

import { useState } from 'react'
import { AvatarImage, Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CardContent, Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { SearchResultItem } from '@/lib/types'

export interface LocationResultSectionProps {
  results: SearchResultItem[]
}

export function LocationResultSection({ results }: LocationResultSectionProps) {
  const [showAllResults, setShowAllResults] = useState(false)

  const handleViewMore = () => {
    setShowAllResults(true)
  }

  const displayedResults = showAllResults ? results : results.slice(0, 3)
  const additionalResultsCount = results.length > 3 ? results.length - 3 : 0

  return (
    <div className="flex flex-wrap">
      {displayedResults.map((result: SearchResultItem, index: number) => (
        <div className="w-1/2 md:w-1/4 p-1" key={index}>
          <Link href={result.url} passHref target="_blank">
            <Card className="flex-1">
              <CardContent className="p-2">
                <p className="text-xs line-clamp-2">
                  {result.title || result.content}
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <Avatar className="h-4 w-4">
                    <AvatarImage
                      src={`https://www.google.com/s2/favicons?domain=${
                        new URL(result.url).hostname
                      }`}
                      alt={result.title}
                    />
                    <AvatarFallback>
                      {new URL(result.url).hostname[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-xs opacity-60 truncate">
                    {new URL(result.url).hostname}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      ))}
      {!showAllResults && additionalResultsCount > 0 && (
        <div className="w-1/2 md:w-1/4 p-1">
          <Card className="flex-1 flex h-full items-center justify-center">
            <CardContent className="p-2">
              <Button
                variant={'link'}
                className="text-muted-foreground"
                onClick={handleViewMore}
              >
                View {additionalResultsCount} more
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
