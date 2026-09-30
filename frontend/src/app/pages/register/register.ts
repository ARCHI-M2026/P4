import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { PasswordCheck } from '../../_utils/passwordCheck'
import { ICredentials } from '../../_interfaces/credentials';
import { AuthService } from '../../_services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent implements OnInit {

  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  registerForm: FormGroup = new FormGroup({});
  submitted = false;
  message: string | null = null;
  messageType: 'success' | 'error' | null = null;
  isRegistering = false;

  // Spinner
  isLoading = signal(false);

  ngOnInit() {
    this.registerForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      },
      {
        validators: PasswordCheck
      }
    );
  }

  get form() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.message = ''
    this.submitted = true
    if (this.registerForm.invalid) {
      return;
    }


    const newUser: ICredentials = {
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value
    };

    this.isLoading.set(true)
    this.authService.register(newUser).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isLoading.set(false)
        this.message = 'Inscription réussie !'
        this.messageType = 'success'
        this.submitted = false;
      },
      error: (err) => {
        this.message = '';
        this.isLoading.set(false);

        if (err.status === 0) {
          this.message = 'Impossible de contacter le serveur.\nVérifiez votre connexion ou réessayez plus tard.';
        } else if (err.status === 400) {
          this.message = 'Email invalide ou mot de passe trop court.';
        } else if (err.status === 409) {
          this.message = 'Un compte existe déjà avec cet email.';
        } else {
          this.message = 'Une erreur est survenue. Merci de réessayer.';
        }        

        this.messageType = 'error';
      }
    })
  }





  onReset(): void {
    this.submitted = false;
    this.registerForm.reset();
  }
}
