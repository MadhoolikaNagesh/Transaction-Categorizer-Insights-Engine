import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Transaction, TransactionFilters } from '../../models/transaction.model';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-transaction-list',
    imports: [FormsModule],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './transaction-list.component.html'
})
export class TransactionListComponent implements OnChanges {
  @Input() transactions: Transaction[] = [];
  @Input() filters: TransactionFilters = { search: '', category: 'All', anomalyOnly: false };
  @Input() linkedBanks: string[] = [];
  @Output() filtersChange = new EventEmitter<TransactionFilters>();
  @Output() refresh = new EventEmitter<void>();
  @Output() openPlaid = new EventEmitter<void>();

  showAddForm = signal(false);
  newDesc = signal('');
  newAmount = signal('');
  newDate = signal(new Date().toISOString().split('T')[0]);
  newCategory = signal('Uncategorized');
  newType = signal<'CREDIT' | 'DEBIT'>('DEBIT');
  selectedBank = signal('');
  isSubmitting = signal(false);

  categories = ['All', 'Dining', 'Grocery', 'Transportation', 'Rent', 'Bills', 'Shopping', 'Entertainment', 'Income', 'Medical', 'Uncategorized'];
  categoriesForForm = ['Dining', 'Grocery', 'Transportation', 'Rent', 'Bills', 'Shopping', 'Entertainment', 'Income', 'Medical', 'Uncategorized'];

  constructor(private api: ApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['linkedBanks']) {
      if (this.linkedBanks.length > 0 && !this.selectedBank()) {
        this.selectedBank.set(this.linkedBanks[0]);
      }
    }
  }

  updateSearch(value: string): void {
    this.filtersChange.emit({ ...this.filters, search: value });
  }

  updateCategory(value: string): void {
    this.filtersChange.emit({ ...this.filters, category: value });
  }

  updateAnomalyOnly(checked: boolean): void {
    this.filtersChange.emit({ ...this.filters, anomalyOnly: checked });
  }

  onTypeChange(value: string): void {
    const type = value as 'CREDIT' | 'DEBIT';
    this.newType.set(type);
    if (type === 'CREDIT') {
      this.newCategory.set('Income');
    } else if (this.newCategory() === 'Income') {
      this.newCategory.set('Uncategorized');
    }
  }

  async handleAddSubmit(e: Event): Promise<void> {
    e.preventDefault();
    if (!this.newDesc() || !this.newAmount()) return;

    let bankName = 'Manual Entry';
    if (this.linkedBanks.length === 1) {
      bankName = this.linkedBanks[0];
    } else if (this.linkedBanks.length > 1) {
      bankName = this.selectedBank() || this.linkedBanks[0];
    } else {
      alert('Please link a bank feed first before adding manual transactions.');
      return;
    }

    this.isSubmitting.set(true);
    try {
      await lastValueFrom(this.api.addTransaction({
        amount: parseFloat(this.newAmount()),
        currency: 'INR',
        date: this.newDate(),
        description: this.newDesc(),
        category: this.newCategory(),
        anomalyStatus: 'NONE',
        type: this.newType()
      } as any, bankName));
      this.newDesc.set('');
      this.newAmount.set('');
      this.newCategory.set('Uncategorized');
      this.newType.set('DEBIT');
      this.showAddForm.set(false);
      this.refresh.emit();
    } catch (err) {
      let errorMessage = 'An unexpected error occurred.';
      if (err && typeof err === 'object') {
        errorMessage = (err as any).error?.message || (err as any).message || JSON.stringify(err);
      } else if (err) {
        errorMessage = String(err);
      }
      alert('Error creating transaction: ' + errorMessage);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async handleClearDatabase(): Promise<void> {
    if (window.confirm('Are you sure you want to clear the entire database? This cannot be undone.')) {
      try {
        await lastValueFrom(this.api.clearTransactions());
        this.refresh.emit();
      } catch (err) {
        alert('Error clearing transactions: ' + err);
      }
    }
  }

  isCredit(t: Transaction): boolean {
    return t.type === 'CREDIT' || (t.type === undefined && t.category === 'Income');
  }

  anomalyClass(status?: string): string {
    return status ? status.toLowerCase() : '';
  }

  anomalyLabel(status?: string): string {
    return status ? status.replace('_', ' ') : '';
  }
}
