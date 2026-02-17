import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { HttpService } from '../services/http.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const httpService = inject(HttpService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // Se il server risponde "499 Unauthorized"
      // l'utente è stato cancellato dal DB
      if (error.status === 499) {
        console.warn('Sessione non valida o utente cancellato. Logout forzato.');
        httpService.logout(); 
        router.navigate(['/login']);
      }
      
      return throwError(() => error);
    })
  );
};