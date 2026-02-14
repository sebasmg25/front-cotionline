import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Business } from '../../domain/models/business.model';
import { BusinessService } from '../../../../infraestructure/services/business/business.service';
import { UserService } from '../../../../infraestructure/services/user/user.service';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs';

@Component({
  selector: 'app-register-business',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: './register-business.html',
  styleUrl: './register-business.css',
})
export class RegisterBusiness implements OnInit {
  constructor(
    private businessService: BusinessService,
    private userService: UserService,
    private router: Router,
  ) {}
  ngOnInit(): void {}

  nit: string = '';
  name: string = '';
  description: string = '';
  address: string = '';
  businessId: string | null = null;

  resetForm(): void {
    this.nit = '';
    this.name = '';
    this.description = '';
    this.address = '';
  }

  obtenerId() {
    const userId = this.userService.getUserId();

    console.log('ID DE USUARIOOOO', userId);
  }

  registerBusiness() {
    this.userService.getUserId()?.subscribe({
      next: (response) => {
        const userId = response.user.id;
        console.log('ID RECUPERADOOOOO', userId);

        const newBusiness: Business = {
          nit: this.nit,
          name: this.name,
          description: this.description,
          address: this.address,
          userId: userId,
        };

        // El guardado debe ocurrir aquí dentro para tener acceso a newBusiness y al ID
        this.businessService.save(newBusiness).subscribe({
          next: (result: any) => {
            console.log('Negocio registrado exitosamente', result);
            console.log('ID DEL NEGOCIO', result.id);
            this.businessId = result.saveBusiness.id;
            console.log('BUSINESSIDDDDDDDDD', this.businessId);
            this.resetForm();
            this.router.navigate(['/dashboard/branch', this.businessId]);
          },
          error(err) {
            if (err) {
              console.log('Error', err.error);
            } else {
              console.log('Error del servidor', err);
            }
          },
          complete() {
            console.log('Fin');
          },
        });
      },
    });

    // Ejemplo en tu componente de registro de sede
    // this.businessService
    //   .save(newBusiness)
    //   .pipe(
    //     tap((result) => {
    //       // SOLUCIÓN: Usamos ?? null para manejar el potencial 'undefined' de result.id.
    //       // Si result.id es undefined, le asignamos 'null' para que coincida con el tipo 'string | null'.
    //       this.businessId = result.id ?? null;
    //       console.log('ID de Negocio guardado:', this.businessId);
    //     })
    //   )
    //   .subscribe({
    //     next: (result) => {
    //       console.log('Negocio registrado exitosamente (objeto Business):', result);
    //       this.resetForm();
    //       // Aquí puedes redirigir a una página que le recuerde al usuario que tiene un ID guardado
    //       this.router.navigate(['/dashboard']);
    //     },
    //     error: (err) => {
    //       console.error('Error al registrar el negocio:', err.error || err);
    //     },
    //   });
  }
}
