export interface Transaction {
  id: number;
  externalTransactionId: string;
  account?: Account;
  amount: number;
  currency: string;
  date: string;
  description: string;
  category: string;
  merchantName?: string;
  pending: boolean;
  anomalyStatus: 'NONE' | 'DUPLICATE_SUSPECT' | 'HIGH_SPIKE' | 'OUT_OF_PATTERN' | 'HIGH_VALUE';
  anomalyDescription?: string;
  notes?: string;
  type: 'CREDIT' | 'DEBIT';
  status: 'ACTIVE' | 'REMOVED' | 'ARCHIVED';
  createdAt?: string;
  updatedAt?: string;
}

export interface Account {
  id: number;
  bankConnection: BankConnection;
  externalAccountId: string;
  name: string;
  officialName?: string;
  mask?: string;
  type: string;
  subtype: string;
  currency: string;
  currentBalance: number;
  availableBalance?: number;
  balanceLastUpdated?: string;
  status: 'ACTIVE' | 'DISABLED' | 'CLOSED';
}

export interface BankConnection {
  id: number;
  userId: number;
  institutionId: string;
  institutionName: string;
  plaidItemId: string;
  status: 'ACTIVE' | 'UNLINKED' | 'ERROR';
  lastSyncStarted?: string;
  lastSyncCompleted?: string;
  lastSyncStatus?: string;
  lastError?: string;
  createdAt?: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  category?: string;
  search?: string;
  anomalyOnly?: boolean;
  bankName?: string;
}

export interface SyncSummaryResponse {
  added: number;
  modified: number;
  removed: number;
  status: string;
}
