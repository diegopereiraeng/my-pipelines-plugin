import { useState, useMemo, useCallback } from 'react'
import { RefreshCw, AlertTriangle, GitBranch, LogOut } from 'lucide-react'
import type { ExecutionFilters, PipelineExecution } from './types'
import { getExecutionType } from './utils'
import { useCurrentUser } from './hooks/useCurrentUser'
import { useProjects } from './hooks/useProjects'
import { usePipelineExecutions } from './hooks/usePipelineExecutions'
import { FilterBar } from './components/FilterBar'
import { StatsRow } from './components/StatsRow'
import { ExecutionRow } from './components/ExecutionRow'
import { SkeletonRow } from './components/SkeletonRow'
import { UserPicker } from './components/UserPicker'

function App() {
  const { email: userEmail, userId, name: userName, isIdentified, saveUser, clearUser } = useCurrentUser()

  const { orgProjects, orgs, projects, loading: projectsLoading, error: projectsError } = useProjects()

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
    filters.status,
    isIdentified ? userEmail : null
  )

  const handleFilterChange = useCallback(
    (partial: Partial<ExecutionFilters>) => setFilters(prev => ({ ...prev, ...partial })),
    []
  )

  // Client-side filter for type + search (user filtering is server-side via executorIdentifiers)
  const filteredExecutions = useMemo(() => {
    let result = executions

    if (filters.type !== 'All') {
      result = result.filter((exec: PipelineExecution) => {
        const execType = getExecutionType(exec.moduleInfo)
        if (filters.type === 'CI') return execType === 'CI' || execType === 'CI/CD'
        if (filters.type === 'CD') return execType === 'CD' || execType === 'CI/CD'
        return true
      })
    }

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (exec: PipelineExecution) =>
          exec.name?.toLowerCase().includes(q) ||
          exec.pipelineIdentifier.toLowerCase().includes(q)
      )
    }

    return result
  }, [executions, filters.type, filters.search])

  const loading = projectsLoading || execLoading
  const error = projectsError || execError

  // Show user picker when not identified
  if (!isIdentified) {
    return <UserPicker onSelect={saveUser} />
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 p-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">My Pipelines</h1>
          <span
            className="flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
            title={userId ?? ''}
          >
            {userName || userEmail}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={clearUser}
            title="Switch user"
            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent"
          >
            <LogOut className="h-3.5 w-3.5" />
            Switch
          </button>
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={refresh} className="ml-auto rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-200">
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
              {['Status','Pipeline','Org / Project','Type','Trigger','Triggered By','Started','Duration','Link'].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && executions.length === 0 && (
              <><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
            )}
            {!loading && filteredExecutions.map(exec => (
              <ExecutionRow
                key={`${exec.orgIdentifier}-${exec.projectIdentifier}-${exec.planExecutionId}`}
                execution={exec}
              />
            ))}
          </tbody>
        </table>

        {!loading && filteredExecutions.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <GitBranch className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-medium text-foreground">No pipeline executions found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
