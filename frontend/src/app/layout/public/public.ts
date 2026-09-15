import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink],
  standalone: true,
  templateUrl: './public.html',
  styleUrl: './public.css',
})
export class PublicLayout {}
