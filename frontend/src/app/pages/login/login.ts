import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../_services/auth';
import { ICredentials } from '../../_interfaces/credentials';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TokenService } from '../../_services/token';

@Component({
  selector: 'app-login.component',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class LoginComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService)
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  loginForm: FormGroup = new FormGroup({});
  submitted = false;
  message: string | null = null;
  messageType: 'success' | 'error' | null = null;

  // Spinner
  isLoading = signal(false);

  ngOnInit() {
    this.loginForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
      },
    );
  }

  get form() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.message = '';
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    const loginUser: ICredentials = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.isLoading.set(true)
    this.authService.login(loginUser).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (token) => {
        this.isLoading.set(false)
        this.submitted = false;
        this.tokenService.saveToken(token.access_token);
        this.router.navigate(['/files']);
      },
      error: (err) => {
        this.message = '';
        this.isLoading.set(false);

        if (err.status === 0) {
          this.message = 'Impossible de contacter le serveur.\nVérifiez votre connexion ou réessayez plus tard.';
        } else if (err.status === 401) {
          this.message = 'Email ou mot de passe incorrect.';
        } else {
          this.message = 'Une erreur est survenue. Merci de réessayer.';
        }

        this.messageType = 'error';
      }
    });
  }

  onReset(): void {
    this.submitted = false;
    this.loginForm.reset();
  }
}
