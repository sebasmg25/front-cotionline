import { Component } from '@angular/core';
import { Sidenav } from '../../../contexts/shared/sidenav/sidenav';

@Component({
  selector: 'app-dashboard',
  imports: [Sidenav],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {}
