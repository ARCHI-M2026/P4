import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileService } from '../../../_services/file';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FileMetaDataResponse } from '../../../_interfaces/fileMetaData';

@Component({
  selector: 'app-file-upload',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.css',
})
export class FileUploadComponent implements OnInit {

  private formBuilder = inject(FormBuilder);
  private fileService = inject(FileService)
  private destroyRef = inject(DestroyRef);

  linkCopied: string | null = null;

  showForm = true;
  fileForm: FormGroup = new FormGroup({});
  submitted = false;
  message: string | null = null;
  messageType: 'success' | 'error' | null = null;

  // Selected file info
  selectedFile!: File;
  selectedFileName: string | null = null;
  selectedFileSize: string | null = null;

  uploadedFile: FileMetaDataResponse | null = null;

  // Spinner
  isLoading = signal(false);

  // Control
  selectExpiration = new FormControl<string>('7', { nonNullable: true });

  /****************************************/
  ngOnInit() {
    this.fileForm = this.formBuilder.group(
      {
        password: ['', Validators.minLength(6)]
      }
    );
  }

  get form() {
    return this.fileForm.controls;
  }

  onSubmit(): void {
    this.message = '';
    this.submitted = true;
    if (this.fileForm.invalid) {
      return;
    }

    const formData = new FormData();
    const password = this.fileForm.get('password')?.value;
    if (password) {
      formData.append('password', password);
    }
    formData.append('expiresInDays', this.selectExpiration.value);
    formData.append('file', this.selectedFile);


    this.isLoading.set(true)
    this.fileService.upload(formData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.submitted = false;

        this.uploadedFile = response.body
        this.showForm = false;

      },
      error: (err) => {
        this.message = '';
        this.isLoading.set(false);

        if (err.status === 0) {
          this.message = 'Impossible de contacter le serveur.\nVérifiez votre connexion ou réessayez plus tard.';
        } else if (err.status === 401) {
          this.message = 'Vous n\'êtes pas autorisé à accéder à cette ressource.';
        } else {
          this.message = 'Une erreur est survenue. Merci de réessayer.';
        }

        this.messageType = 'error';
      }
    });
  }

  onReset(): void {
    this.submitted = false;
    this.fileForm.reset();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.selectedFileSize = this.formatFileSize(file.size);
    }
  }

  formatFileSize(bytes: number): string {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    const gb = mb / 1024;

    if (gb >= 1) {
      return `${gb.toFixed(2)} Go`;
    } else if (mb >= 1) {
      return `${mb.toFixed(2)} Mo`;
    } else {
      return `${kb.toFixed(2)} Ko`;
    }
  }

  uploadedFileSize(): string {
    if (!this.uploadedFile) return '';
    return this.formatFileSize(this.uploadedFile.size);
  }

  /****************************************/

  generateFrontLink() {
    return `${window.location.origin}/file/${this.uploadedFile?.downloadToken}`;
  }

  copyLink() {

    const link = this.generateFrontLink();

    if (!link) return;

    navigator.clipboard.writeText(link)
      .then(() => {
        this.linkCopied = 'Lien copié !';
      })
      .catch(err => {
        console.error('Erreur de copie', err);
      });
  }

  /********************************************/
  /********************************************/

  remainingDays(): number {
    if (!this.uploadedFile) return 0;

    const diffMs = new Date(this.uploadedFile.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }
}
