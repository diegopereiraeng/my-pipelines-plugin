import { Search, User, Users } from 'lucide-react'
import type { ExecutionFilters } from '../types'

interface OrgProject {
  org: string
  projects: { identifier: string; name: string }[]
}

interface FilterBarProps {
  filters: ExecutionFilters
  onFilterChange: (filters: Partial<ExecutionFilters>) => void
  orgs: string[]
  orgProjects: OrgProject[]
  userEmail: string | null
}

export function FilterBar({
  filters,
  onFilterChange,
  orgs,
  orgProjects,
  userEmail,
}: FilterBarProps) {
  const currentOrgProjects =
    orgProjects.find((op) => op.org === filters.org)?.projects ?? []

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* My / All toggle */}
      <div className="flex items-center rounded-lg border border-border bg-background">
        <button
          onClick={() => onFilterChange({ viewMode: 'mine' })}
          className={`flex items-center gap-1.5 rounded-l-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            filters.viewMode === 'mine'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          title={userEmail ? `Showing executions triggered by ${userEmail}` : 'Showing your executions'}
        >
          <User className="h-3.5 w-3.5" />
          Mine
        </button>
        <button
          onClick={() => onFilterChange({ viewMode: 'all' })}
          className={`flex items-center gap-1.5 rounded-r-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            filters.viewMode === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          All
        </button>
      </div>

      {/* Org dropdown */}
      <select
        value={filters.org}
        onChange={(e) =>
          onFilterChange({ org: e.target.value, project: '' })
        }
        className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">All Orgs</option>
        {orgs.map((org) => (
          <option key={org} value={org}>
            {org}
          </option>
        ))}
      </select>

      {/* Project dropdown */}
      <select
        value={filters.project}
        onChange={(e) => onFilterChange({ project: e.target.value })}
        className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        disabled={!filters.org}
      >
        <option value="">All Projects</option>
        {currentOrgProjects.map((p) => (
          <option key={p.identifier} value={p.identifier}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Status dropdown */}
      <select
        value={filters.status}
        onChange={(e) => onFilterChange({ status: e.target.value })}
        className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="All">All Statuses</option>
        <option value="Running">Running</option>
        <option value="Success">Success</option>
        <option value="Failed">Failed</option>
        <option value="Aborted">Aborted</option>
      </select>

      {/* Type dropdown */}
      <select
        value={filters.type}
        onChange={(e) => onFilterChange({ type: e.target.value })}
        className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="All">All Types</option>
        <option value="CI">CI</option>
        <option value="CD">CD</option>
      </select>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search pipeline..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="rounded-lg border border-input bg-background py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
  )
}
