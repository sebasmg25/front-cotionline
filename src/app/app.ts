import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './infraestructure/services/auth/auth.service'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-root',
  standalone: true, // Asegúrate de que esté marcado como standalone
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('front-cotionline');

  // Signal para manejar el estado de carga inicial de la sesión
  isCheckingSession = signal(true);

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.checkInitialSession();
  }

  private checkInitialSession(): void {
    // 1. Si no hay un token guardado, dejamos de cargar y permitimos que las rutas decidan
    if (!this.authService.isLoggedIn()) {
      this.isCheckingSession.set(false);
      return;
    }

    // 2. Si hay un token, validamos con el servidor
    this.authService.getUserSession().subscribe({
      next: (response) => {
        // Añadimos seguridad para evitar el crash si el objeto user no viene como esperamos
        const userEmail = response?.user?.email || (response as any)?.email;
        if (userEmail) {
          console.log('Sesión válida para:', userEmail);
        } else {
          console.warn('Sesión recuperada pero no se encontró el email del usuario:', response);
        }

        // Aquí los datos del usuario ya están disponibles para el resto de la app
        this.isCheckingSession.set(false);
      },
      error: (err: any) => {
        console.error('Sesión inválida o expirada:', err);
        this.authService.logout(); // Limpiamos el localStorage
        this.isCheckingSession.set(false);
      },
    });
  }
}
