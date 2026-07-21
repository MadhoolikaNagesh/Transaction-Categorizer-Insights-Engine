import { Component, Input, Output, EventEmitter, OnInit, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

type MenuView = 'main' | 'unlink' | 'delete-confirm';
type FeedbackType = 'success' | 'error';

interface Feedback { type: FeedbackType; message: string; }

@Component({
  selector: 'app-account-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-menu.component.html'
})
export class AccountMenuComponent {
  @Input() linkedBanks: string[] = [];
  @Input() isLoadingBanks = false;
  @Input() currentUser: { id: number; username: string } | null = null;
  @Input() theme: 'dark' | 'light' = 'dark';
  @Output() openPlaid = new EventEmitter<void>();
  @Output() unlinkBank = new EventEmitter<string>();
  @Output() deleteAccount = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Output() themeChange = new EventEmitter<'dark' | 'light'>();

  isOpen = signal(false);
  view = signal<MenuView>('main');
  unlinkingBank = signal<string | null>(null);
  isDeleting = signal(false);
  feedback = signal<Feedback | null>(null);
  private feedbackTimeout: any;

  bankColors: Record<string, string> = {
    'Chase Bank': '#115ec3',
    'Bank of America': '#dc143c',
    'Wells Fargo': '#d31115',
    'Citi Bank': '#004b87',
  };

  constructor(private elRef: ElementRef) {}

  @HostListener('document:mousedown', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.isOpen() && !this.elRef.nativeElement.contains(e.target)) {
      this.closeMenu();
    }
  }

  toggleMenu(): void {
    this.isOpen.update(v => !v);
    this.view.set('main');
    this.feedback.set(null);
  }

  closeMenu(): void {
    this.isOpen.set(false);
    this.view.set('main');
    this.feedback.set(null);
  }

  setView(v: MenuView): void { this.view.set(v); }

  onLinkAccount(): void { this.closeMenu(); this.openPlaid.emit(); }
  onLogout(): void { this.logout.emit(); }
  onThemeChange(t: 'dark' | 'light'): void { this.themeChange.emit(t); }

  async handleUnlink(bankName: string): Promise<void> {
    this.unlinkingBank.set(bankName);
    try {
      this.unlinkBank.emit(bankName);
      this.showFeedback('success', `${bankName} unlinked successfully.`);
      this.view.set('main');
    } catch {
      this.showFeedback('error', `Failed to unlink ${bankName}.`);
    } finally {
      this.unlinkingBank.set(null);
    }
  }

  handleDeleteAccount(): void {
    this.isDeleting.set(true);
    try {
      this.deleteAccount.emit();
      this.showFeedback('success', 'All account data deleted.');
      this.view.set('main');
    } catch {
      this.showFeedback('error', 'Failed to delete account data.');
    } finally {
      this.isDeleting.set(false);
    }
  }

  showFeedback(type: FeedbackType, message: string): void {
    if (this.feedbackTimeout) clearTimeout(this.feedbackTimeout);
    this.feedback.set({ type, message });
    this.feedbackTimeout = setTimeout(() => this.feedback.set(null), 3000);
  }

  getBankColor(bank: string): string {
    return this.bankColors[bank] ?? '#6366f1';
  }

  getUserInitial(): string {
    return this.currentUser?.username?.charAt(0)?.toUpperCase() || '?';
  }

  linkedBankText(): string {
    return `${this.linkedBanks.length} bank${this.linkedBanks.length !== 1 ? 's' : ''} linked`;
  }
}
