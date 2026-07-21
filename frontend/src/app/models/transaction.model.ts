export interface Transaction {
  id?: number;
  amount: number;
  currency: string;
  date: string;
  description: string;
  category: string;
  merchant?: string;
  anomalyStatus?: string;
  anomalyDescription?: string;
  notes?: string;
  accountName?: string;
  bankName?: string;
  type?: 'CREDIT' | 'DEBIT';
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
