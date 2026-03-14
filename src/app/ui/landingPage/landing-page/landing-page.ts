import { Component } from '@angular/core';
import { Toolbar } from '../../../contexts/shared/toolbar/toolbar';
import { Login } from '../../../contexts/auth/login/login';
import { Register } from '../../../contexts/auth/register/register';
import { Functions } from '../../../contexts/shared/functions/functions';
import { Prices } from '../../../contexts/shared/prices/prices';
import { Contact } from '../../../contexts/shared/contact/contact';
import { ViewportScroller } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UpdatePlan } from '../../../contexts/updatePlan/update-plan/update-plan';

@Component({
  selector: 'app-landing-page',
  imports: [Toolbar, Functions, Contact, Register, MatDialogModule, UpdatePlan],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  constructor(private scroller: ViewportScroller, private dialog: MatDialog) {}

  onScrollToSection(anchorId: string): void {
    if (anchorId === 'home') {
      this.scroller.scrollToPosition([0, 0]);
    } else {
      this.scroller.scrollToAnchor(anchorId);
    }
  }

  showLoginDialog(): void {
    this.dialog.open(Login, {
      maxWidth: '450px',
      panelClass: 'login-dialog-panel',
    });
  }
}
