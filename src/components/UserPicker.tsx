import { useState } from 'react'
import { GitBranch, ArrowRight, Loader2 } from 'lucide-react'
import { useUserSearch, type HarnessUser } from '../hooks/useUserSearch'

interface UserPickerProps {
  onSelect: (user: HarnessUser) => void
}

export function UserPicker({ onSelect }: UserPickerProps) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  // Search suggestions — silently ignored if API unavailable
  const { users, loading: searching } = useUserSearch(input)

  function pickUser(user: HarnessUser) {
    onSelect(user)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim().toLowerCase()
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Enter a valid email, e.g. you@company.com')
      return
    }
    const namePart = trimmed.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    onSelect({ uuid: '', name: namePart, email: trimmed })
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <GitBranch className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">My Pipelines</h2>
          <p className="text-sm text-muted-foreground">
            Type your name or email to get started.
            Saved locally — only asked once.
          </p>
        </div>

        <form onSubmit={handleSubmit} action="#" className="space-y-3 text-left">
          <div className="relative">
            <input
              autoFocus
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); setError('') }}
              placeholder="Type name or email…"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Suggestions from API (shown only when available) */}
          {users.length > 0 && (
            <ul className="overflow-hidden rounded-xl border border-border bg-background shadow-md divide-y divide-border">
              {users.map(user => (
                <li key={user.uuid || user.email}>
                  <button
                    type="button"
                    onClick={() => pickUser(user)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary uppercase">
                      {(user.name || user.email).charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={!input.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
