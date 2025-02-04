import { QueryClient, onlineManager } from '@tanstack/react-query'
import { IS_PLATFORM } from 'lib/constants'
import { useState } from 'react'

// When running locally we don't need the internet
// so we can pretend we're online all the time
if (!IS_PLATFORM) {
  onlineManager.setOnline(true)
}

let queryClient: QueryClient | undefined

export function getQueryClient() {
  const _queryClient =
    queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          retry: (failureCount, error) => {
            // Don't retry on any 4xx errors
            if (
              typeof error === 'object' &&
              error !== null &&
              'code' in error &&
              typeof (error as any).code === 'number' &&
              (error as any).code >= 400 &&
              (error as any).code < 500
            ) {
              return false
            }

            if (failureCount < 3) {
              return true
            }

            return false
          },
        },
      },
    })

  // For SSG and SSR always create a new queryClient
  if (typeof window === 'undefined') return _queryClient
  // Create the queryClient once in the client
  if (!queryClient) queryClient = _queryClient

  return queryClient
}

export function useRootQueryClient() {
  const [_queryClient] = useState(() => getQueryClient())

  return _queryClient
}
