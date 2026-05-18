import { useState, useEffect } from 'react'
import { PluginAPI } from '@harnessio/idp-plugins-sdk'
import { ACCOUNT_ID, PROXY_BASE } from '../utils'

export interface HarnessUser {
  uuid: string
  name: string
  email: string
}

interface NgUsersResponse {
  data?: {
    content?: Array<{
      user?: HarnessUser
    }>
  }
}

export function useUserSearch(query: string, enabled: boolean) {
  const [users, setUsers] = useState<HarnessUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || query.trim().length < 2) {
      setUsers([])
      return
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await PluginAPI.proxyFetch(
          `${PROXY_BASE}/ng/api/user?accountIdentifier=${ACCOUNT_ID}&searchTerm=${encodeURIComponent(query)}&pageSize=10`,
          { headers: { 'harness-account': ACCOUNT_ID } }
        )
        if (!res.ok) {
          const body = await res.text().catch(() => '')
          throw new Error(`User search failed: ${res.status} ${body.slice(0, 120)}`)
        }
        const data = (await res.json()) as NgUsersResponse
        if (!cancelled) {
          const list = (data?.data?.content ?? [])
            .map(c => c.user)
            .filter((u): u is HarnessUser => !!u?.email)
          setUsers(list)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Search failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 350)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, enabled])

  return { users, loading, error }
}
