import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TokenService } from '../../_services/token';

@Component({
  selector: 'app-admin',
  imports: [RouterOutlet, RouterLink],
  standalone: true,
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminLayout {
  private router = inject(Router)
  private tokenService = inject(TokenService)

  isSidebarVisible = signal(false);

  toggleSidebar(): void {
    this.isSidebarVisible.update(v => !v);
  }

  logout(): void {
      this.tokenService.clearToken();      
      this.router.navigate(['/']);     
  }
}
