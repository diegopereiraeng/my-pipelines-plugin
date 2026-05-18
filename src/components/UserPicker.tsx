import { useState } from 'react'
import { GitBranch, ArrowRight } from 'lucide-react'
import type { HarnessUser } from '../hooks/useUserSearch'

interface UserPickerProps {
  onSelect: (user: HarnessUser) => void
}

export function UserPicker({ onSelect }: UserPickerProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Enter a valid email address')
      return
    }
    const name = trimmed.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    onSelect({ uuid: '', name, email: trimmed })
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
            Enter your Harness email to see your pipeline executions.
            Saved locally — only asked once.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            placeholder="you@company.com"
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={!email.trim()}
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
