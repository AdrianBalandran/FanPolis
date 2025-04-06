import { Component } from '@angular/core';
import { NavegadorComponent } from "../navegador/navegador.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-paginaprin',
  standalone: true,
  imports: [NavegadorComponent, RouterModule],
  templateUrl: './paginaprin.component.html',
  styleUrl: './paginaprin.component.css'
})
export class PaginaprinComponent {

}
