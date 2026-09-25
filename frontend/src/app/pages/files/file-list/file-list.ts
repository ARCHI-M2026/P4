import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FileMetaDataResponse } from '../../../_interfaces/fileMetaData';
import { RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FileService } from '../../../_services/file';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-file-list',
  imports: [RouterLink, DatePipe, NgClass],
  standalone: true,
  templateUrl: './file-list.html',
  styleUrl: './file-list.css',
})
export class FileListComponent implements OnInit {
  private fileService = inject(FileService)
  private destroyRef = inject(DestroyRef);

  filter = 'valid';
  filteredFiles = signal<FileMetaDataResponse[]>([]);
  fileMetaDatas = signal<FileMetaDataResponse[]>([]);

  isMenuActionsOpen = false;
  openedMenuToken: string | null = null;

  message = signal<string | null>(null);
  messageType = signal<'success' | 'error' | null>(null);

  ngOnInit() {
    this.fileService.getAll()
      .subscribe({
        next: (res: HttpResponse<FileMetaDataResponse[]>) => {
          console.log(res.body)
          this.fileMetaDatas.set(res.body || []);
          this.filterFiles();
          console.log(this.filteredFiles());
        },
        error: (err) => {
          this.message.set('');

          if (err.status === 0) {
            this.message.set('Impossible de contacter le serveur.\nVérifiez votre connexion ou réessayez plus tard.');
          } else if (err.status === 401) {
            this.message.set('Veuillez vous connecter.');
          } else {
            this.message.set('Une erreur est survenue. Merci de réessayer.');
          }

          this.messageType.set('error');
        }
      });
  }


  filterFiles() {
    const now = new Date();

    if (this.filter === 'expired') {
      this.filteredFiles.set(this.fileMetaDatas().filter(f => new Date(f.expiresAt) <= now));
    } else if (this.filter === 'valid') {
      this.filteredFiles.set(this.fileMetaDatas().filter(f => new Date(f.expiresAt) > now));
    } else {
      this.filteredFiles.set(this.fileMetaDatas());
    }
  }

  deleteFile(fid: string): void {
    const confirmed = window.confirm('Etes vous sur de vouloir supprimer ce fichier?');

    if (confirmed) {

      this.fileService.delete(fid)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.message.set("Fichier correctement supprimé");
            this.messageType.set('success');
            this.closeMenuActionsMobile();

            // Retire le fichier des deux listes sans rappeler l'API
            this.fileMetaDatas.update(files => files.filter(f => f.id !== fid));
            this.filteredFiles.update(files => files.filter(f => f.id !== fid));

          },
          error: (err) => {
            this.message.set('');

            if (err.status === 0) {
              this.message.set('Impossible de contacter le serveur.\nVérifiez votre connexion ou réessayez plus tard.');
            } else if (err.status === 401) {
              this.message.set('Veuillez vous connecter.');
            } else if (err.status === 403) {
              this.message.set('Accès refusé.');
            } else {
              this.message.set('Une erreur est survenue. Merci de réessayer.');
            }

            this.messageType.set('error');
          }
        });
    }
    console.log("delete file")
  }

  //***********************************************/
  //***********************************************/
  getExpirationLabel(isExpired: boolean, remainingDays: number): string {

    if (isExpired)
      return 'Expiré';

    if (remainingDays === 0 && !isExpired) return 'Expire aujourd\'hui';
    if (remainingDays === 1) return 'Expire demain';
    if (remainingDays === 7) return 'Expire dans 1 semaine';

    return `Expire dans ${remainingDays} jours`;
  }

  getExpirationClass(isExpired: boolean, remainingDays: number): string {

    if (isExpired)
      return 'expiration-text-danger';

    if (remainingDays === 0 || remainingDays === 1) {
      return 'expiration-text-warning';
    } else {
      return 'expiration-text-normal';
    }
  }

  //***********************************************/
  //***********************************************/
  toggleMenuActionsMobile(token: string): void {
    this.openedMenuToken = this.openedMenuToken === token ? null : token;
  }

  closeMenuActionsMobile(): void {
    this.openedMenuToken = null;
  }
}
