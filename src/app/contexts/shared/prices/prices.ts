import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card'; // <-- Para <mat-card>
import { MatIconModule } from '@angular/material/icon'; // <-- Para <mat-icon>
import { MatButtonModule } from '@angular/material/button'; // <-- Para <button mat-flat-button>

@Component({
  selector: 'app-prices',
  standalone: true, // Asumimos que es Standalone
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './prices.html', // Asegúrate de que este archivo exista
  styleUrl: './prices.css', // Asegúrate de que este archivo exista
})
export class Prices {
  // Aquí es donde iría la lógica (ej: obtener los datos de los planes)
}
