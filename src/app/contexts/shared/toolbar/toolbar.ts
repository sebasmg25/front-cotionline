import { Component, Output, EventEmitter } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-toolbar',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css',
})
export class Toolbar {
  @Output() scrollTo = new EventEmitter<string>();
  @Output() showLogin = new EventEmitter<void>();
  emitScroll(sectionId: string): void {
    const emissionId = sectionId === 'home' ? 'home' : sectionId;
    this.scrollTo.emit(emissionId);
  }

  emitLogin(): void {
    this.showLogin.emit();
  }
}
