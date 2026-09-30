import { inject } from '@angular/core/primitives/di';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../_services/token';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router)
  const tokenService = inject(TokenService)

  if(tokenService.isLogged()){
    return true
  }

  router.navigate(['/login']);
  return false
};
