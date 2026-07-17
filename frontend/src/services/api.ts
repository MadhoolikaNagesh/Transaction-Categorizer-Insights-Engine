const API_BASE = 'http://localhost:8080/api';

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

export const apiService = {
  async getTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.minAmount !== undefined) params.append('minAmount', filters.minAmount.toString());
    if (filters.maxAmount !== undefined) params.append('maxAmount', filters.maxAmount.toString());
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.anomalyOnly) params.append('anomalyOnly', 'true');
    if (filters.bankName) params.append('bankName', filters.bankName);

    const response = await fetch(`${API_BASE}/transactions?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    return response.json();
  },

  async addTransaction(transaction: Transaction): Promise<Transaction> {
    const response = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });
    if (!response.ok) {
      throw new Error('Failed to create transaction');
    }
    return response.json();
  },

  async ingestMockFeed(bankName: string): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE}/transactions/ingest/mock?bankName=${encodeURIComponent(bankName)}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to ingest mock bank feed');
    }
    return response.json();
  },

  async clearTransactions(): Promise<void> {
    const response = await fetch(`${API_BASE}/transactions/clear`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to clear transactions');
    }
  },

  async getStats(): Promise<Record<string, number>> {
    const response = await fetch(`${API_BASE}/transactions/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    return response.json();
  },

  async getAnomalies(): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE}/transactions/anomalies`);
    if (!response.ok) {
      throw new Error('Failed to fetch anomalies');
    }
    return response.json();
  },

  async sendChatMessage(message: string): Promise<string> {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      throw new Error('Failed to send message to financial AI');
    }
    const data = await response.json();
    return data.response;
  },

  async getLinkedBanks(): Promise<string[]> {
    const response = await fetch(`${API_BASE}/transactions/linked-banks`);
    if (!response.ok) {
      throw new Error('Failed to fetch linked banks');
    }
    return response.json();
  },

  async unlinkBank(bankName: string): Promise<void> {
    const response = await fetch(`${API_BASE}/transactions/unlink?bankName=${encodeURIComponent(bankName)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to unlink bank');
    }
  },
};
