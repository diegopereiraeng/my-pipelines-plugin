import { useState, useEffect } from 'react'
import { PluginAPI, usePluginContext } from '@harnessio/idp-plugins-sdk'
import type { CurrentUserResponse } from '../types'
import { ACCOUNT_ID, PROXY_BASE } from '../utils'

const CACHE_KEY = 'my-pipelines-user-email'
const CACHE_UUID_KEY = 'my-pipelines-user-uuid'

export function useCurrentUser() {
  const context = usePluginContext()
  const [email, setEmail] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CACHE_KEY)
    } catch {
      return null
    }
  })
  const [userId, setUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CACHE_UUID_KEY)
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(!email)
  const [error, setError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    // context.user contains { email, uuid, name, ... }
    const contextUser = (context?.user as Record<string, unknown> | null | undefined)
    const contextEmail = contextUser?.email as string | undefined
    const contextUuid = contextUser?.uuid as string | undefined
    if (contextEmail) {
      setEmail(contextEmail)
      if (contextUuid) setUserId(contextUuid)
      setLoading(false)
      try {
        localStorage.setItem(CACHE_KEY, contextEmail)
        if (contextUuid) localStorage.setItem(CACHE_UUID_KEY, contextUuid)
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
          `${PROXY_BASE}/ng/api/user/currentUser?accountIdentifier=${ACCOUNT_ID}`,
          { headers: { 'harness-account': ACCOUNT_ID } }
        )
        if (!res.ok) {
          const body = await res.text().catch(() => '')
          throw new Error(`currentUser ${res.status}: ${body.slice(0, 200)}`)
        }
        const data = (await res.json()) as CurrentUserResponse
        if (!cancelled && data?.data?.email) {
          setEmail(data.data.email)
          const uuid = data.data.uuid
          if (uuid) setUserId(uuid)
          try {
            localStorage.setItem(CACHE_KEY, data.data.email)
            if (uuid) localStorage.setItem(CACHE_UUID_KEY, uuid)
          } catch {
            // ignore
          }
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to detect user'
          setError(msg)
          setApiError(msg)
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

  const debugInfo = {
    contextUser: JSON.stringify(context?.user ?? null),
    apiError,
  }
  return { email, userId, loading, error, debugInfo }
}
