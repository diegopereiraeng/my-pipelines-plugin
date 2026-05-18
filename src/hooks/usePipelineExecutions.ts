import { useState, useEffect, useCallback, useRef } from 'react'
import { PluginAPI } from '@harnessio/idp-plugins-sdk'
import type {
  PipelineExecution,
  Project,
  ExecutionSummaryApiResponse,
} from '../types'
import { ACCOUNT_ID, PROXY_BASE } from '../utils'

const BATCH_SIZE = 5
const POLL_INTERVAL = 30_000

function last7DaysRange() {
  const now = Date.now()
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
  return { startTime: sevenDaysAgo, endTime: now }
}

async function fetchExecutionsForProject(
  org: string,
  project: string,
  statusFilter?: string
): Promise<PipelineExecution[]> {
  const { startTime, endTime } = last7DaysRange()
  let url = `${PROXY_BASE}/pipeline/api/pipelines/execution/summary?accountIdentifier=${ACCOUNT_ID}&orgIdentifier=${org}&projectIdentifier=${project}&page=0&size=10&startTime=${startTime}&endTime=${endTime}`
  if (statusFilter && statusFilter !== 'All') {
    url += `&status=${statusFilter}`
  }

  const res = await PluginAPI.proxyFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filterType: 'PipelineExecution' }),
  })

  if (!res.ok) {
    throw new Error(`Executions fetch failed for ${org}/${project}: ${res.status}`)
  }

  const data = (await res.json()) as ExecutionSummaryApiResponse
  const content = data?.data?.content ?? []

  return content.map((exec) => ({
    ...exec,
    orgIdentifier: org,
    projectIdentifier: project,
  }))
}

async function fetchInBatches(
  projectList: { org: string; project: string }[],
  statusFilter?: string
): Promise<PipelineExecution[]> {
  const allExecutions: PipelineExecution[] = []

  for (let i = 0; i < projectList.length; i += BATCH_SIZE) {
    const batch = projectList.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map((p) =>
        fetchExecutionsForProject(p.org, p.project, statusFilter)
      )
    )
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allExecutions.push(...result.value)
      }
    }
  }

  return allExecutions.sort((a, b) => b.startTs - a.startTs)
}

export function usePipelineExecutions(
  projects: Project[],
  selectedOrg: string,
  selectedProject: string,
  apiStatusFilter: string
) {
  const [executions, setExecutions] = useState<PipelineExecution[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchExecutions = useCallback(
    async (isPolling = false) => {
      if (projects.length === 0) return

      if (!isPolling) {
        setLoading(true)
      }
      setError(null)

      try {
        // Build list of org/project pairs to query
        let projectList: { org: string; project: string }[]

        if (selectedProject && selectedOrg) {
          projectList = [{ org: selectedOrg, project: selectedProject }]
        } else if (selectedOrg) {
          projectList = projects
            .filter((p) => p.project.orgIdentifier === selectedOrg)
            .map((p) => ({
              org: p.project.orgIdentifier,
              project: p.project.identifier,
            }))
        } else {
          projectList = projects.map((p) => ({
            org: p.project.orgIdentifier,
            project: p.project.identifier,
          }))
        }

        const statusParam =
          apiStatusFilter !== 'All' ? apiStatusFilter : undefined
        const results = await fetchInBatches(projectList, statusParam)
        setExecutions(results)
        setLastUpdated(new Date())
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch executions'
        )
      } finally {
        setLoading(false)
      }
    },
    [projects, selectedOrg, selectedProject, apiStatusFilter]
  )

  // Initial fetch + re-fetch on filter changes
  useEffect(() => {
    if (projects.length > 0) {
      fetchExecutions()
    }
  }, [fetchExecutions, projects.length])

  // Polling
  useEffect(() => {
    if (projects.length === 0) return

    intervalRef.current = setInterval(() => {
      fetchExecutions(true)
    }, POLL_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchExecutions, projects.length])

  const refresh = useCallback(() => {
    fetchExecutions(false)
  }, [fetchExecutions])

  return { executions, loading, error, lastUpdated, refresh }
}
