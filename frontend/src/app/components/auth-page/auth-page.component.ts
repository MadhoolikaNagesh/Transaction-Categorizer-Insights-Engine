import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-page.component.html'
})
export class AuthPageComponent {
  @Output() authSuccess = new EventEmitter<{ id: number; username: string }>();
  @Output() backToHome = new EventEmitter<void>();

  isLogin = signal(true);
  username = signal('');
  password = signal('');
  error = signal<string | null>(null);
  isLoading = signal(false);

  constructor(private api: ApiService) {}

  setIsLogin(value: boolean): void {
    this.isLogin.set(value);
    this.error.set(null);
  }

  setUsername(value: string): void { this.username.set(value); }
  setPassword(value: string): void { this.password.set(value); }

  async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    if (!this.username().trim() || !this.password()) {
      this.error.set('Please fill in all fields.');
      return;
    }
    if (this.password().length < 6) {
      this.error.set('Password must be at least 6 characters.');
      return;
    }

    this.error.set(null);
    this.isLoading.set(true);

    try {
      if (this.isLogin()) {
        const user = await lastValueFrom(this.api.login(this.username(), this.password()));
        this.authSuccess.emit(user);
      } else {
        await lastValueFrom(this.api.register(this.username(), this.password()));
        const user = await lastValueFrom(this.api.login(this.username(), this.password()));
        this.authSuccess.emit(user);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      this.error.set(err?.error?.error || err?.message || 'Authentication failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  onBackToHome(): void {
    this.backToHome.emit();
  }
}
