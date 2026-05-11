export interface SpreadsheetItem {
  mail: string
  amount: string
  titularName: string
  accountNumber: string
}

export interface ProcessRequest {
  spreadsheet: SpreadsheetItem[]
}

export interface ProcessTransactionResponse {
  id: number
  transactionId: string
  status: 'AUTHORIZED' | 'COMPLETED' | 'FAILED' | 'IN_PROGRESS'
  processRequest: ProcessRequest
  createdAt: string
  updatedAt: string
}

export interface BatchDetailResponse {
  operationId: string
  status: string
  createdAt: string
  completedAt: string
  totalOperations: number
  successfulOperations: number
  failedOperations: number
  userActions?: Array<{
    userId: string
    action: string
    timestamp: string
  }>
}

export interface VerifyTransactionResponse {
  id: number
  transactionId: string
  status: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS'
  batchDetailResponse: BatchDetailResponse
  createdAt: string
  updatedAt: string
}
