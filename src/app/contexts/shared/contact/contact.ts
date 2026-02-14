import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-contact',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {}
