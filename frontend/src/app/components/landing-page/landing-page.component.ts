import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';


@Component({
    selector: 'app-landing-page',
    imports: [],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './landing-page.component.html'
})
export class LandingPageComponent {
  @Output() getStarted = new EventEmitter<void>();

  currentYear = new Date().getFullYear();

  onGetStarted(): void {
    this.getStarted.emit();
  }
}
