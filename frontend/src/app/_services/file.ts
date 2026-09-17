import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { FileMetaDataResponse } from '../_interfaces/fileMetaData';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private readonly urlFile = environment.urlAPIFile

  private http = inject(HttpClient)

  getAll(): Observable<HttpResponse<FileMetaDataResponse[]>> {
     return this.http.get<FileMetaDataResponse[]>(this.urlFile, { observe: 'response' })
  }

  upload(formData: FormData): Observable<HttpResponse<FileMetaDataResponse>> {
    return this.http.post<FileMetaDataResponse>(this.urlFile, formData, { observe: 'response' })     
  }

  delete(token: string): Observable<HttpResponse<void>> {
      return this.http.delete<void>(this.urlFile + "/" + token, { observe: 'response' })
  }
}
