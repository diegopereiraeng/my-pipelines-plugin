import { useState } from 'react'
import { Search, User, Loader2, CheckCircle2 } from 'lucide-react'
import { useUserSearch, type HarnessUser } from '../hooks/useUserSearch'
import { usePluginContext } from '@harnessio/idp-plugins-sdk'

interface UserPickerProps {
  onSelect: (user: HarnessUser) => void
}

export function UserPicker({ onSelect }: UserPickerProps) {
  const context = usePluginContext()
  const [query, setQuery] = useState('')
  const { users, loading, error } = useUserSearch(query, context !== null)

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Who are you?</h2>
          <p className="text-sm text-muted-foreground">
            Search your Harness account to personalise the pipeline view.
            Your selection is saved locally.
          </p>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type your name or email…"
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Results */}
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        )}

        {users.length > 0 && (
          <ul className="overflow-hidden rounded-lg border border-border bg-background shadow-sm divide-y divide-border">
            {users.map(user => (
              <li key={user.uuid}>
                <button
                  onClick={() => onSelect(user)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary uppercase">
                    {user.name?.charAt(0) ?? user.email.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {query.length >= 2 && !loading && users.length === 0 && !error && (
          <p className="text-center text-sm text-muted-foreground">No users found for "{query}"</p>
        )}

        {query.length > 0 && query.length < 2 && (
          <p className="text-center text-xs text-muted-foreground">Type at least 2 characters to search</p>
        )}
      </div>
    </div>
  )
}
