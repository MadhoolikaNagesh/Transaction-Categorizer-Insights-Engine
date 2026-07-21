import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Bank { name: string; color: string; }

@Component({
  selector: 'app-plaid-sandbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plaid-sandbox.component.html'
})
export class PlaidSandboxComponent {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() success = new EventEmitter<string>();

  step = signal<1 | 2 | 3>(1);
  selectedBank = signal('');
  username = signal('');
  password = signal('');

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

  handleLoginSubmit(e: Event): void {
    e.preventDefault();
    if (!this.username() || !this.password()) return;
    this.step.set(3);
    setTimeout(() => {
      this.success.emit(this.selectedBank());
      this.closeModal.emit();
      this.step.set(1);
      this.selectedBank.set('');
      this.username.set('');
      this.password.set('');
    }, 3000);
  }

  onClose(): void { this.closeModal.emit(); }
  goBack(): void { this.step.set(1); }
}
