import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';

import { ICredentials } from '../_interfaces/credentials';
import { IToken } from '../_interfaces/token';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly urlLogin = environment.urlAPIAuth
  private readonly urlRegister = environment.urlAPIRegister

  private http = inject(HttpClient);

  login(credentials: ICredentials): Observable<IToken> {
    return this.http.post<IToken>(this.urlLogin, credentials)
  }

  register(credentials: ICredentials): Observable<IToken> {
    return this.http.post<IToken>(this.urlRegister, credentials)
  }
}
