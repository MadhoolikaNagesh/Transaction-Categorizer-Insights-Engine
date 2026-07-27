import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, LinkBankResponse, AccountDto } from '../../services/api.service';
import { SyncSummaryResponse } from '../../models/transaction.model';
import { lastValueFrom } from 'rxjs';

interface Bank { name: string; color: string; }

@Component({
  selector: 'app-plaid-sandbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plaid-sandbox.component.html',
  styleUrls: ['./plaid-sandbox.component.css']
})
export class PlaidSandboxComponent {
  private api = inject(ApiService);

  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() success = new EventEmitter<SyncSummaryResponse>();

  step = signal<1 | 2 | 3 | 4>(1); // 1: Bank List, 2: Login, 3: Account Select, 4: Success
  selectedBank = signal('');
  username = signal('');
  password = signal('');
  
  isLoading = signal(false);
  linkResponse = signal<LinkBankResponse | null>(null);
  selectedAccountIds = signal<Set<string>>(new Set());
  
  syncResult = signal<SyncSummaryResponse | null>(null);

  banks: Bank[] = [
    { name: 'Chase Bank', color: '#115ec3' },
    { name: 'Bank of America', color: '#dc143c' },
    { name: 'Wells Fargo', color: '#d31115' },
    { name: 'Citi Bank', color: '#004b87' }
  ];

  handleSelectBank(bankName: string): void {
    this.selectedBank.set(bankName);
    this.step.set(2);
  }

  async handleLoginSubmit(e: Event): Promise<void> {
    e.preventDefault();
    if (!this.username() || !this.password()) return;
    
    this.isLoading.set(true);
    try {
      const response = await lastValueFrom(this.api.linkBankMock(this.selectedBank()));
      this.linkResponse.set(response);
      
      // Auto-select all by default
      const allIds = new Set(response.accounts.map(a => a.accountId));
      this.selectedAccountIds.set(allIds);
      
      this.step.set(3);
    } catch (err) {
      console.error('Error linking bank', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleAccount(accountId: string): void {
    const current = new Set(this.selectedAccountIds());
    if (current.has(accountId)) {
      current.delete(accountId);
    } else {
      current.add(accountId);
    }
    this.selectedAccountIds.set(current);
  }

  async handleSync(): Promise<void> {
    const response = this.linkResponse();
    if (!response || this.selectedAccountIds().size === 0) return;

    this.isLoading.set(true);
    try {
      const selectedAccounts = response.accounts.filter(a => this.selectedAccountIds().has(a.accountId));
      
      const summary = await lastValueFrom(this.api.syncTransactions({
        institution: response.institution,
        item: response.item,
        accounts: selectedAccounts
      }));
      
      this.syncResult.set(summary);
      this.step.set(4);
      
      setTimeout(() => {
        this.success.emit(summary);
        this.reset();
      }, 3000);
    } catch (err) {
      console.error('Error syncing transactions', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  onClose(): void {
    this.reset();
    this.closeModal.emit();
  }

  goBack(): void {
    if (this.step() > 1 && this.step() < 4) {
      this.step.update(s => (s - 1) as any);
    }
  }

  private reset(): void {
    this.step.set(1);
    this.selectedBank.set('');
    this.username.set('');
    this.password.set('');
    this.linkResponse.set(null);
    this.syncResult.set(null);
    this.selectedAccountIds.set(new Set());
  }
}
