import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileService } from '../../../_services/file';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    formData.append('password', this.fileForm.get('password')?.value);
    formData.append('expiration', this.selectExpiration.value);
    formData.append('file', this.selectedFile);

    console.log(formData)
    // TODO - controle champ ?
    this.isLoading.set(true)
    this.fileService.upload(formData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        // Handle successful upload
        console.log('uploaded')
        console.log(response)
      },
      error: (err) => {
        this.isLoading.set(false);
        // Handle upload error
        console.log('error')
        console.log(err)
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

      const bytes = file.size;
      const kb = bytes / 1024;
      const mb = kb / 1024;
      const gb = mb / 1024;

      if (gb >= 1) {
        this.selectedFileSize = `${gb.toFixed(2)} Go`;
      } else if (mb >= 1) {
        this.selectedFileSize = `${mb.toFixed(2)} Mo`;
      } else {
        this.selectedFileSize = `${kb.toFixed(2)} Ko`;
      }
    }
  }

  /****************************************/

  copyLink() {

    // TODO
    const link = 'link'

    if (!link) return;

    navigator.clipboard.writeText(link)
      .then(() => {
        this.linkCopied = 'Lien copié !';
      })
      .catch(err => {
        console.error('Erreur de copie', err);
      });
  }
}
