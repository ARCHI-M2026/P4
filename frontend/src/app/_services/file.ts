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
  private readonly urlDownload = environment.urlAPIDownload

  private http = inject(HttpClient)

  getAll(): Observable<HttpResponse<FileMetaDataResponse[]>> {
    return this.http.get<FileMetaDataResponse[]>(this.urlFile, { observe: 'response' })
  }

  upload(formData: FormData): Observable<HttpResponse<FileMetaDataResponse>> {
    return this.http.post<FileMetaDataResponse>(this.urlFile, formData, { observe: 'response' })
  }

  findByToken(token: string): Observable<FileMetaDataResponse> {
    return this.http.get<FileMetaDataResponse>(this.urlDownload + "/" + token);
  }

  downloadFile(token: string, body: { password?: string }): Observable<{ url: string; expiresIn: number }> {
    return this.http.post<{ url: string; expiresIn: number }>(
      `${this.urlDownload}/${token}`,
      body
    );
  }

  delete(fid: string): Observable<HttpResponse<void>> {
    return this.http.delete<void>(this.urlFile + "/" + fid, { observe: 'response' })
  }
}
