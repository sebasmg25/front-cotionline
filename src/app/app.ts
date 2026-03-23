import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './infraestructure/services/auth/auth.service'; 

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('front-cotionline');

  // Signal para manejar el estado de carga inicial de la sesión
  isCheckingSession = signal(true);

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.checkInitialSession();
  }

  private checkInitialSession(): void {
    if (!this.authService.isLoggedIn()) {
      this.isCheckingSession.set(false);
      return;
    }
    this.authService.getUserSession().subscribe({
      next: (response) => {
        const userEmail = response?.user?.email || (response as any)?.email;
        if (userEmail) {
          if (this.router.url === '/' || this.router.url === '/login') {
            this.router.navigate(['/dashboard']);
          }
        }
        this.isCheckingSession.set(false);
      },
      error: (err: any) => {
        this.authService.logout(); 
        this.isCheckingSession.set(false);
      },
    });
  }
}
