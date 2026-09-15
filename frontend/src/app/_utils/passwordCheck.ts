import { AbstractControl, ValidationErrors } from '@angular/forms';

export function PasswordCheck(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) return null;

  if (password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }

  return null;
}