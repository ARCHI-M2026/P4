import { Component, inject, OnInit } from '@angular/core';
import { FileMetaDataResponse } from '../../../_interfaces/fileMetaData';
import { RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
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

  filter = 'valid';
  tagFilter = '';
  filteredFiles: FileMetaDataResponse[] = [];
  fileMetaDatas: FileMetaDataResponse[] = [];

  isMenuActionsOpen = false;
  openedMenuToken: string | null = null;

  message: string | null = null;
  messageType: 'success' | 'error' | null = null;  

  ngOnInit(){
    this.fileService.getAll()
    .subscribe({
      next: (res: HttpResponse<FileMetaDataResponse[]>) => {        
        this.fileMetaDatas = res.body || [];
        this.filterFiles();
      },
      error: (err) => {     
        this.message = '';

        if (err.status === 0) {
          this.message = 'Impossible de contacter le serveur.\nVérifiez votre connexion ou réessayez plus tard.';
        } else if (err.status === 401) {
          this.message = 'Veuillez vous connecter.';
        } else {
          this.message = 'Une erreur est survenue. Merci de réessayer.';
        }
        
        this.messageType = 'error';
      }
    });
  }


  filterFiles() {
    if (this.filter === 'expired') {
      this.filteredFiles = this.fileMetaDatas.filter(f => f.isExpired);
    } else if (this.filter === 'valid') {
      this.filteredFiles = this.fileMetaDatas.filter(f => !f.isExpired);
    } else {
      this.filteredFiles = this.fileMetaDatas;
    }

    if (this.tagFilter) {
      this.filteredFiles = this.filteredFiles.filter(f =>
        f.tags?.some((tag: string) =>
          tag.toLowerCase().includes(this.tagFilter.toLowerCase())
        )
      );
    }
  }

  deleteFile(_token: string, _event: Event): void {    
    // event.preventDefault();
    // const confirmed = window.confirm('Etes vous sur de vouloir supprimer ce fichier?');

    // if (confirmed) {
      
    //   this.fileService.delete(token)
    //     .pipe(takeUntilDestroyed(this.destroyRef))
    //     .subscribe({
    //       next: () => {                      
    //         this.message = "Fichier correctement supprimé";
    //         this.messageType = 'success';
    //         this.closeMenuActionsMobile();
    //         // List refresh
    //         this.loadFilesMetaDatas();
    //       },
    //       error: (err) => {            
    //         if (err.error && err.error.message) {
    //             this.message = err.statusText + ': ' + err.error.message;
    //           } else {
    //             this.message = err.statusText + ': ' + err.error;
    //           }
    //           this.messageType = 'error';            
    //       }
    //     });
    // }
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
