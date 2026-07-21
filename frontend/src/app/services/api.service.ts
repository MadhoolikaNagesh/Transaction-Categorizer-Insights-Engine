import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, TransactionFilters } from '../models/transaction.model';

const API_BASE = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  getUserId(): string {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return '';
    try {
      const user = JSON.parse(userJson);
      return user.id ? user.id.toString() : '';
    } catch {
      return '';
    }
  }

  private get authHeaders(): HttpHeaders {
    return new HttpHeaders({ 'X-User-Id': this.getUserId() });
  }

  login(username: string, password: string): Observable<{ id: number; username: string }> {
    return this.http.post<{ id: number; username: string }>(
      `${API_BASE}/auth/login`,
      { username, password }
    );
  }

  register(username: string, password: string): Observable<{ id: number; username: string; message: string }> {
    return this.http.post<{ id: number; username: string; message: string }>(
      `${API_BASE}/auth/register`,
      { username, password }
    );
  }

  getTransactions(filters: TransactionFilters = {}): Observable<Transaction[]> {
    let params = new HttpParams();
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.minAmount !== undefined) params = params.set('minAmount', filters.minAmount.toString());
    if (filters.maxAmount !== undefined) params = params.set('maxAmount', filters.maxAmount.toString());
    if (filters.category && filters.category !== 'All') params = params.set('category', filters.category);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.anomalyOnly) params = params.set('anomalyOnly', 'true');
    if (filters.bankName) params = params.set('bankName', filters.bankName);

    return this.http.get<Transaction[]>(`${API_BASE}/transactions`, {
      headers: this.authHeaders,
      params
    });
  }

  addTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(`${API_BASE}/transactions`, transaction, {
      headers: this.authHeaders.set('Content-Type', 'application/json')
    });
  }

  ingestMockFeed(bankName: string): Observable<Transaction[]> {
    return this.http.post<Transaction[]>(
      `${API_BASE}/transactions/ingest/mock?bankName=${encodeURIComponent(bankName)}`,
      null,
      { headers: this.authHeaders }
    );
  }

  clearTransactions(): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/transactions/clear`, {
      headers: this.authHeaders
    });
  }

  getStats(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${API_BASE}/transactions/stats`, {
      headers: this.authHeaders
    });
  }

  getAnomalies(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${API_BASE}/transactions/anomalies`, {
      headers: this.authHeaders
    });
  }

  sendChatMessage(message: string): Observable<{ response: string }> {
    return this.http.post<{ response: string }>(
      `${API_BASE}/chat`,
      { message },
      { headers: this.authHeaders.set('Content-Type', 'application/json') }
    );
  }

  getLinkedBanks(): Observable<string[]> {
    return this.http.get<string[]>(`${API_BASE}/transactions/linked-banks`, {
      headers: this.authHeaders
    });
  }

  unlinkBank(bankName: string): Observable<void> {
    return this.http.delete<void>(
      `${API_BASE}/transactions/unlink?bankName=${encodeURIComponent(bankName)}`,
      { headers: this.authHeaders }
    );
  }
}
