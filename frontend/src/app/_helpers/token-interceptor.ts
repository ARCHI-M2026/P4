import { HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { TokenService } from '../_services/token';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';


export const tokenInterceptor: HttpInterceptorFn = (req, next) => {

  const tokenService = inject(TokenService)
  const router = inject(Router)

  if(tokenService.isLogged()){
    const headers = new HttpHeaders({
      Authorization: "Bearer " + tokenService.getToken()
    })

    const newReq = req.clone({headers})

    return next(newReq).pipe(
      catchError(error => {
        if(error.status === 401 && !req.url.includes('/download')){
          tokenService.clearToken()
          router.navigate(['/login'])
        }

        return throwError(() => error);
      })
    )
  }

  return next(req);
};
