import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {

  private readonly TOKEN_KEY = 'ds_token'

  saveToken(token: string): void{
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  isLogged(): boolean{
    const token = localStorage.getItem(this.TOKEN_KEY)
    return !!token
  }

  clearToken(): void{
    localStorage.removeItem(this.TOKEN_KEY)
  }
}
