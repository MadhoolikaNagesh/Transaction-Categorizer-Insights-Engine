import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api.service';
import { Transaction, TransactionFilters } from './models/transaction.model';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { AuthPageComponent } from './components/auth-page/auth-page.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { ChatAssistantComponent } from './components/chat-assistant/chat-assistant.component';
import { PlaidSandboxComponent } from './components/plaid-sandbox/plaid-sandbox.component';
import { AccountMenuComponent } from './components/account-menu/account-menu.component';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LandingPageComponent,
    AuthPageComponent,
    DashboardComponent,
    TransactionListComponent,
    ChatAssistantComponent,
    PlaidSandboxComponent,
    AccountMenuComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  currentUser = signal<{ id: number; username: string } | null>(null);
  theme = signal<'dark' | 'light'>('dark');
  transactions = signal<Transaction[]>([]);
  filters = signal<TransactionFilters>({ search: '', category: 'All', anomalyOnly: false });
  isPlaidOpen = signal(false);
  isLoading = signal(false);
  syncMessage = signal<string | null>(null);
  linkedBanks = signal<string[]>([]);
  isLoadingBanks = signal(false);
  showAuth = signal(false);
  isChatMobileOpen = signal(false);

  constructor(private api: ApiService) {
    // Restore persisted user
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try { this.currentUser.set(JSON.parse(saved)); } catch { /* ignore */ }
    }

    // Restore persisted theme
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) this.theme.set(savedTheme);

    // Sync theme to DOM
    effect(() => {
      document.documentElement.setAttribute('data-theme', this.theme());
      localStorage.setItem('theme', this.theme());
    });
  }

  ngOnInit(): void {
    if (this.currentUser()) {
      this.loadTransactions();
      this.loadLinkedBanks();
    }
  }

  handleAuthSuccess(user: { id: number; username: string }): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUser.set(user);
    this.loadTransactions();
    this.loadLinkedBanks();
  }

  toggleChat(): void { this.isChatMobileOpen.update(v => !v); }

  handleLogout(): void {
    localStorage.removeItem('currentUser');
    this.currentUser.set(null);
    this.transactions.set([]);
    this.linkedBanks.set([]);
    this.showAuth.set(false);
  }

  async loadTransactions(): Promise<void> {
    this.isLoading.set(true);
    try {
      const data = await lastValueFrom(this.api.getTransactions(this.filters()));
      this.transactions.set(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadLinkedBanks(): Promise<void> {
    this.isLoadingBanks.set(true);
    try {
      const banks = await lastValueFrom(this.api.getLinkedBanks());
      this.linkedBanks.set(banks);
    } catch (err) {
      console.error('Error fetching linked banks:', err);
    } finally {
      this.isLoadingBanks.set(false);
    }
  }

  onFiltersChange(newFilters: TransactionFilters): void {
    this.filters.set(newFilters);
    this.loadTransactions();
  }

  async handlePlaidSuccess(bankName: string): Promise<void> {
    try {
      this.syncMessage.set(`Syncing transactions with ${bankName}...`);
      await lastValueFrom(this.api.ingestMockFeed(bankName));
      this.syncMessage.set('Sync completed! AI has auto-categorized your bank feed.');
      setTimeout(() => this.syncMessage.set(null), 4000);
      this.loadTransactions();
      this.loadLinkedBanks();
    } catch (err) {
      alert('Error during bank sync: ' + err);
      this.syncMessage.set(null);
    }
  }

  async handleUnlinkBank(bankName: string): Promise<void> {
    await lastValueFrom(this.api.unlinkBank(bankName));
    this.loadTransactions();
    this.loadLinkedBanks();
  }

  async handleDeleteAccount(): Promise<void> {
    await lastValueFrom(this.api.clearTransactions());
    this.loadTransactions();
    this.linkedBanks.set([]);
  }
}
