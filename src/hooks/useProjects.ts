import { useState, useEffect, useCallback } from 'react'
import { PluginAPI } from '@harnessio/idp-plugins-sdk'
import type { Project, ProjectsApiResponse } from '../types'
import { ACCOUNT_ID, PROXY_BASE } from '../utils'

interface OrgProject {
  org: string
  projects: { identifier: string; name: string }[]
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [orgProjects, setOrgProjects] = useState<OrgProject[]>([])
  const [orgs, setOrgs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const allProjects: Project[] = []
      let page = 0
      let hasMore = true

      while (hasMore) {
        const res = await PluginAPI.proxyFetch(
          `${PROXY_BASE}/ng/api/projects?accountIdentifier=${ACCOUNT_ID}&hasModule=true&pageSize=50&pageIndex=${page}`
        )
        if (!res.ok) {
          throw new Error(`Failed to fetch projects: ${res.status}`)
        }
        const data = (await res.json()) as ProjectsApiResponse
        const content = data?.data?.content ?? []
        allProjects.push(...content)
        hasMore = content.length === 50
        page++
      }

      setProjects(allProjects)

      // Build org → projects map
      const orgMap = new Map<
        string,
        { identifier: string; name: string }[]
      >()
      for (const p of allProjects) {
        const org = p.project.orgIdentifier
        if (!orgMap.has(org)) {
          orgMap.set(org, [])
        }
        orgMap.get(org)!.push({
          identifier: p.project.identifier,
          name: p.project.name,
        })
      }

      const orgList = Array.from(orgMap.keys()).sort()
      setOrgs(orgList)
      setOrgProjects(
        orgList.map((org) => ({
          org,
          projects: orgMap.get(org)!.sort((a, b) =>
            a.name.localeCompare(b.name)
          ),
        }))
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch projects'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return { projects, orgProjects, orgs, loading, error, refetch: fetchProjects }
}
