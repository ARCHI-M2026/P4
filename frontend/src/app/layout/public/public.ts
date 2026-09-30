import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { TokenService } from '../../_services/token'

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink],
  standalone: true,
  templateUrl: './public.html',
  styleUrl: './public.css',
})
export class PublicLayout {
  public tokenService = inject(TokenService)
}
