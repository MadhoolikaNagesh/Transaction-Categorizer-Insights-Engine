import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-page.component.html'
})
export class LandingPageComponent {
  @Output() getStarted = new EventEmitter<void>();

  currentYear = new Date().getFullYear();

  onGetStarted(): void {
    this.getStarted.emit();
  }
}
