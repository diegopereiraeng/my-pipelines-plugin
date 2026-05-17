import { useState, useEffect } from 'react'
import { PluginAPI, usePluginContext } from '@harnessio/idp-plugins-sdk'
import type { CurrentUserResponse } from '../types'
import { ACCOUNT_ID, PROXY_BASE } from '../utils'

const CACHE_KEY = 'my-pipelines-user-email'

export function useCurrentUser() {
  const context = usePluginContext()
  const [email, setEmail] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CACHE_KEY)
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(!email)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Try to get email from context first
    const contextEmail =
      (context as unknown as Record<string, unknown>)?.userEmail as string | undefined
    if (contextEmail) {
      setEmail(contextEmail)
      setLoading(false)
      try {
        localStorage.setItem(CACHE_KEY, contextEmail)
      } catch {
        // ignore
      }
      return
    }

    // If we already have a cached email, don't re-fetch
    if (email) {
      setLoading(false)
      return
    }

    // Fallback: fetch from API
    let cancelled = false
    async function fetchUser() {
      try {
        const res = await PluginAPI.proxyFetch(
          `${PROXY_BASE}/ng/api/user/currentUser?accountIdentifier=${ACCOUNT_ID}`
        )
        if (!res.ok) {
          throw new Error(`Failed to fetch current user: ${res.status}`)
        }
        const data = (await res.json()) as CurrentUserResponse
        if (!cancelled && data?.data?.email) {
          setEmail(data.data.email)
          try {
            localStorage.setItem(CACHE_KEY, data.data.email)
          } catch {
            // ignore
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to detect user'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchUser()
    return () => {
      cancelled = true
    }
  }, [context, email])

  return { email, loading, error }
}
