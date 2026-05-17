export const ACCOUNT_ID = '8INL1LHjRmmrZQKdYtlvKA'
export const PROXY_BASE = '/harness'

export function formatDuration(startTs: number, endTs?: number): string {
  const end = endTs ?? Date.now()
  const diffMs = end - startTs
  if (diffMs < 0) return '0s'

  const totalSeconds = Math.floor(diffMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diffMs = now - timestamp
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return new Date(timestamp).toLocaleDateString()
}

export function getStatusColor(status: string): {
  bg: string
  text: string
  border: string
} {
  switch (status) {
    case 'Running':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
      }
    case 'Success':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
      }
    case 'Failed':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
      }
    case 'Aborted':
    case 'Expired':
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-200',
      }
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-200',
      }
  }
}

export function buildExecutionUrl(
  accountId: string,
  orgId: string,
  projectId: string,
  pipelineId: string,
  executionId: string
): string {
  return `https://app.harness.io/ng/account/${accountId}/orgs/${orgId}/projects/${projectId}/pipelines/${pipelineId}/executions/${executionId}/pipeline`
}

export function getExecutionType(moduleInfo?: {
  ci?: object
  cd?: object
}): string {
  if (!moduleInfo) return 'Unknown'
  const hasCi = moduleInfo.ci && Object.keys(moduleInfo.ci).length > 0
  const hasCd = moduleInfo.cd && Object.keys(moduleInfo.cd).length > 0
  if (hasCi && hasCd) return 'CI/CD'
  if (hasCi) return 'CI'
  if (hasCd) return 'CD'
  return 'Unknown'
}
