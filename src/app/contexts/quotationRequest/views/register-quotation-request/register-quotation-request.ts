import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-quotation-request',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule,
  ],
  templateUrl: './register-quotation-request.html',
  styleUrl: './register-quotation-request.css',
})
export class RegisterQuotationRequest implements OnInit {
  ngOnInit(): void {}

  responseDeadline: string = '';
  status: string = '';
  branch: string = '';

  resetForm(): void {
    this.responseDeadline = '';
    this.status = '';
    this.branch = '';
  }

  createQuotationRequest() {
    console.log('ENTROOOOO, SOLICITUD');
  }
}
