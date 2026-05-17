import { ExternalLink } from 'lucide-react'
import type { PipelineExecution } from '../types'
import {
  formatDuration,
  formatRelativeTime,
  buildExecutionUrl,
  getExecutionType,
  ACCOUNT_ID,
} from '../utils'
import { StatusBadge } from './StatusBadge'

interface ExecutionRowProps {
  execution: PipelineExecution
}

export function ExecutionRow({ execution }: ExecutionRowProps) {
  const url = buildExecutionUrl(
    ACCOUNT_ID,
    execution.orgIdentifier,
    execution.projectIdentifier,
    execution.pipelineIdentifier,
    execution.planExecutionId
  )

  const triggerType =
    execution.executionTriggerInfo?.triggerType ?? 'Unknown'
  const triggeredBy =
    execution.executionTriggerInfo?.triggeredBy?.extraInfo?.email ??
    execution.executionTriggerInfo?.triggeredBy?.identifier ??
    'Unknown'

  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <StatusBadge status={execution.status} />
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-foreground">
          {execution.name || execution.pipelineIdentifier}
        </div>
        <div className="text-xs text-muted-foreground">
          {execution.pipelineIdentifier}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-foreground">
          {execution.orgIdentifier}
        </div>
        <div className="text-xs text-muted-foreground">
          {execution.projectIdentifier}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
          {getExecutionType(execution.moduleInfo)}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {triggerType}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        <span title={triggeredBy} className="max-w-[150px] truncate block">
          {triggeredBy}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatRelativeTime(execution.startTs)}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDuration(execution.startTs, execution.endTs)}
      </td>
      <td className="px-4 py-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
        >
          View
          <ExternalLink className="h-3 w-3" />
        </a>
      </td>
    </tr>
  )
}
