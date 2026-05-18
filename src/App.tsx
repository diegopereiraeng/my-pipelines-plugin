import { useState, useMemo, useCallback } from 'react'
import { RefreshCw, AlertTriangle, GitBranch } from 'lucide-react'
import type { ExecutionFilters, PipelineExecution } from './types'
import { getExecutionType } from './utils'
import { useCurrentUser } from './hooks/useCurrentUser'
import { useProjects } from './hooks/useProjects'
import { usePipelineExecutions } from './hooks/usePipelineExecutions'
import { FilterBar } from './components/FilterBar'
import { StatsRow } from './components/StatsRow'
import { ExecutionRow } from './components/ExecutionRow'
import { SkeletonRow } from './components/SkeletonRow'

function App() {
  const { email: userEmail, userId, loading: userLoading } = useCurrentUser()
  const {
    orgProjects,
    orgs,
    projects,
    loading: projectsLoading,
    error: projectsError,
  } = useProjects()

  const [filters, setFilters] = useState<ExecutionFilters>({
    org: '',
    project: '',
    status: 'All',
    type: 'All',
    search: '',
    viewMode: 'mine',
  })

  const {
    executions,
    loading: execLoading,
    error: execError,
    lastUpdated,
    refresh,
  } = usePipelineExecutions(
    projects,
    filters.org,
    filters.project,
    filters.status
  )

  const handleFilterChange = useCallback(
    (partial: Partial<ExecutionFilters>) => {
      setFilters((prev) => ({ ...prev, ...partial }))
    },
    []
  )

  // Client-side filtering: viewMode, type, search
  const filteredExecutions = useMemo(() => {
    let result = executions

    // Filter by "Mine" view
    if (filters.viewMode === 'mine' && (userEmail || userId)) {
      result = result.filter((exec: PipelineExecution) => {
        const tb = exec.executionTriggerInfo?.triggeredBy
        if (!tb) return false
        const trigEmail = tb.extraInfo?.email?.toLowerCase()
        const trigId = tb.identifier?.toLowerCase()
        const trigUuid = tb.uuid
        const emailLower = userEmail?.toLowerCase()
        return (
          (emailLower && (trigEmail === emailLower || trigId === emailLower)) ||
          (userId && trigUuid === userId)
        )
      })
    }

    // Filter by type
    if (filters.type !== 'All') {
      result = result.filter((exec: PipelineExecution) => {
        const execType = getExecutionType(exec.moduleInfo)
        if (filters.type === 'CI') return execType === 'CI' || execType === 'CI/CD'
        if (filters.type === 'CD') return execType === 'CD' || execType === 'CI/CD'
        return true
      })
    }

    // Filter by search
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (exec: PipelineExecution) =>
          exec.name?.toLowerCase().includes(q) ||
          exec.pipelineIdentifier.toLowerCase().includes(q)
      )
    }

    return result
  }, [executions, filters.viewMode, filters.type, filters.search, userEmail, userId])

  const loading = projectsLoading || execLoading || userLoading
  const error = projectsError || execError

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 p-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">My Pipelines</h1>
          {filters.viewMode === 'mine' && userEmail && (
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              {userEmail}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={refresh}
            className="ml-auto rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        orgs={orgs}
        orgProjects={orgProjects}
        userEmail={userEmail}
      />

      {/* Stats */}
      <StatsRow executions={filteredExecutions} />

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                Pipeline
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                Org / Project
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                Trigger
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                Triggered By
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                Started
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                Duration
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                Link
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && executions.length === 0 && (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            )}
            {!loading &&
              filteredExecutions.map((exec) => (
                <ExecutionRow
                  key={`${exec.orgIdentifier}-${exec.projectIdentifier}-${exec.planExecutionId}`}
                  execution={exec}
                />
              ))}
          </tbody>
        </table>

        {/* Empty state */}
        {!loading && filteredExecutions.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <GitBranch className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-medium text-foreground">
              No pipeline executions found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {filters.viewMode === 'mine'
                ? 'No executions triggered by you were found. Try switching to "All" or adjusting your filters.'
                : 'Try adjusting your filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
