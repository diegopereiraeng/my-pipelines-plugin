import { getStatusColor } from '../utils'
import { Loader2 } from 'lucide-react'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = getStatusColor(status)

  const label = (() => {
    switch (status) {
      case 'Running':
        return 'Running'
      case 'Success':
        return '\u2713 Success'
      case 'Failed':
        return '\u2717 Failed'
      case 'Aborted':
        return '\u2298 Aborted'
      case 'Expired':
        return '\u2298 Expired'
      default:
        return status
    }
  })()

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {status === 'Running' && (
        <Loader2 className="h-3 w-3 animate-spin" />
      )}
      {label}
    </span>
  )
}
