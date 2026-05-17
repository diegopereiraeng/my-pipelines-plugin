export interface PipelineExecution {
  pipelineIdentifier: string
  name: string
  planExecutionId: string
  status: 'Running' | 'Success' | 'Failed' | 'Aborted' | 'Expired' | string
  startTs: number
  endTs?: number
  moduleInfo?: { ci?: object; cd?: object }
  executionTriggerInfo?: {
    triggerType: string
    triggeredBy: {
      identifier: string
      extraInfo?: { email?: string }
    }
  }
  orgIdentifier: string
  projectIdentifier: string
}

export interface Project {
  project: {
    identifier: string
    name: string
    orgIdentifier: string
  }
}

export interface ProjectsApiResponse {
  status: string
  data: {
    content: Project[]
    totalPages: number
    totalItems: number
  }
}

export interface ExecutionSummaryApiResponse {
  status: string
  data: {
    content: PipelineExecutionSummary[]
    totalPages: number
    totalElements: number
  }
}

export interface PipelineExecutionSummary {
  pipelineIdentifier: string
  name: string
  planExecutionId: string
  status: string
  startTs: number
  endTs?: number
  moduleInfo?: { ci?: object; cd?: object }
  executionTriggerInfo?: {
    triggerType: string
    triggeredBy: {
      identifier: string
      extraInfo?: { email?: string }
    }
  }
}

export interface ExecutionFilters {
  org: string
  project: string
  status: string
  type: string
  search: string
  viewMode: 'mine' | 'all'
}

export interface CurrentUserResponse {
  status: string
  data: {
    uuid: string
    name: string
    email: string
    defaultAccountId: string
  }
}
