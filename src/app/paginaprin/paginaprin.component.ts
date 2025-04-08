import { Component } from '@angular/core';
import { NavegadorComponent } from '../navegador/navegador.component';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-paginaprin',
  standalone: true,
  imports: [NavegadorComponent, RouterModule],
  templateUrl: './paginaprin.component.html',
  styleUrl: './paginaprin.component.css',
})
export class PaginaprinComponent {
  constructor(private titleService: Title) {
    this.titleService.setTitle('FanPolis | Inicio');
  }
}
