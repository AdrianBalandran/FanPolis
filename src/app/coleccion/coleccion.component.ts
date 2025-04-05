import { Component } from '@angular/core';
import { NavegadorComponent } from "../navegador/navegador.component";

@Component({
  selector: 'app-coleccion',
  standalone: true,
  imports: [NavegadorComponent],
  templateUrl: './coleccion.component.html',
  styleUrl: './coleccion.component.css'
})
export class ColeccionComponent {

}
