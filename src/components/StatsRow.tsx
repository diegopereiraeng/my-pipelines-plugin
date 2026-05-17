import { Activity, CheckCircle2, XCircle, BarChart3 } from 'lucide-react'
import type { PipelineExecution } from '../types'

interface StatsRowProps {
  executions: PipelineExecution[]
}

export function StatsRow({ executions }: StatsRowProps) {
  const running = executions.filter((e) => e.status === 'Running').length
  const success = executions.filter((e) => e.status === 'Success').length
  const failed = executions.filter((e) => e.status === 'Failed').length
  const total = executions.length

  const cards = [
    {
      label: 'Running',
      count: running,
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      label: 'Success',
      count: success,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
    {
      label: 'Failed',
      count: failed,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
    {
      label: 'Total',
      count: total,
      icon: BarChart3,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`flex items-center gap-3 rounded-lg border ${card.border} ${card.bg} p-3`}
        >
          <card.icon className={`h-5 w-5 ${card.color}`} />
          <div>
            <div className={`text-xl font-bold ${card.color}`}>
              {card.count}
            </div>
            <div className="text-xs text-muted-foreground">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
