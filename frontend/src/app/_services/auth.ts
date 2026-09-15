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
  private readonly url = environment.urlAPIAuth

  private http = inject(HttpClient);

  login(credentials: ICredentials): Observable<IToken> {
    return this.http.post<IToken>(this.url, credentials)
  }
}
