import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  constructor() {}

  handleError(error: any) {
    console.error('Error capturado:', error);
    
    let errorDetails = {
      message: 'Ocurrió un error inesperado',
      code: error.status || null,
      error: error.error || null
    };

    return throwError(() => errorDetails);
  }
}