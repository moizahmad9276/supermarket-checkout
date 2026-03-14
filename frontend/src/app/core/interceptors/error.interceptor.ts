import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error) => {
      const message =
        error?.error?.message ||
        error?.error?.error ||
        'An unexpected error occurred';
      notification.error(typeof message === 'string' ? message : JSON.stringify(message));
      return throwError(() => error);
    })
  );
};
