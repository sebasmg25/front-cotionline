import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // 1. Clonamos la petición para añadir el Header si el token existe
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // 2. Enviamos la petición y manejamos posibles errores de respuesta
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el backend responde 401, el token expiró o es inválido
      if (error.status === 401) {
        console.warn('Sesión expirada o no autorizada. Limpiando datos...');
        authService.logout(); // Borra el token del localStorage
        router.navigate(['/login']); // Redirige al login
      }

      // Lanzamos el error para que el servicio/componente también pueda manejarlo si quiere
      return throwError(() => error);
    }),
  );
};
