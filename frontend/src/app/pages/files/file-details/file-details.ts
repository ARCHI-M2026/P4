import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FileService } from '../../../_services/file';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FileMetaDataResponse } from '../../../_interfaces/fileMetaData';

@Component({
  selector: 'app-file-details',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './file-details.html',
  styleUrl: './file-details.css',
})
export class FileDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute)
  private fileService = inject(FileService)
  private destroyRef = inject(DestroyRef)
  fileForm: FormGroup = new FormGroup({})

  fileToken: string | null = null;
  fileMetaDataResponse: FileMetaDataResponse | null = null;

  message = signal<string | null>(null);
  messageType = signal<'success' | 'error' | null>(null);

  // Spinner and flag
  isLoading = signal(false);
  isFileFound = signal(false)

  ngOnInit() {
    this.fileToken = String(this.route.snapshot.paramMap.get('id'));

    this.fileService.findByToken(this.fileToken)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (file) => {
          // Handle the retrieved file data
          console.log("file found")
          console.log(file)
          this.fileMetaDataResponse = file;
          this.isFileFound.set(true)
        },
        error: (error) => {
          // Handle the error
          console.error("Error occurred while fetching file details:", error);
        }
      });

    this.fileForm = new FormGroup({
      password: new FormControl<string>('', { nonNullable: true })
    });
  }

  downloadFile() {
    const token = this.fileToken || '';
    this.isLoading.set(true);
    this.message.set('');
    this.messageType.set('success');

    console.log(token)
    console.log(this.fileForm.value.password)

    this.fileService.downloadFile(token, this.fileForm.value).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        // next: (blob: Blob) => {
        next: (response) => {
          const link = document.createElement('a');
          link.href = response.url;
          link.download = this.fileMetaDataResponse?.originalName || 'downloaded_file';

          document.body.appendChild(link);
          link.click();
          link.remove();

          this.isLoading.set(false);
          this.message.set('Téléchargement lancé !');
          this.messageType.set('success');
        },
        error: (err) => {
          console.error('Error occurred while downloading file:', err);
          this.isLoading.set(false);

          this.message.set('');

          if (err.status === 0) {
            this.message.set('Impossible de contacter le serveur.\nVérifiez votre connexion ou réessayez plus tard.');
          } else if (err.status === 401) {
            this.message.set('Mot de passe du fichier incorrect.');
          } else {
            this.message.set('Une erreur est survenue. Merci de réessayer.');
          }

          this.messageType.set('error');
        }
      })
  }

  /***************************************************************/
  isExpired(): boolean {
    if (!this.fileMetaDataResponse) return false;
    return new Date(this.fileMetaDataResponse.expiresAt) <= new Date();
  }

  remainingDays(): number {
    if (!this.fileMetaDataResponse) return 0;

    const diffMs = new Date(this.fileMetaDataResponse.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  /*************************************/
  getExpirationLabel(): string {
    if (this.isExpired()) {
      return 'Fichier expiré';
    }

    const days = this.remainingDays();

    if (days === 0) return 'Expire aujourd\'hui';
    if (days === 1) return 'Expire demain';
    if (days === 7) return 'Expire dans 1 semaine';

    return `Expire dans ${days} jours`;
  }

  getExpirationClass(): string {
    if (this.isExpired()) {
      return 'expiration-div-danger';
    }

    const days = this.remainingDays();

    if (days === 0 || days === 1) {
      return 'expiration-div-warning';
    }

    return 'expiration-notification';
  }
}
