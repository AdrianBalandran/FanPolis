import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PaginaprinComponent } from './paginaprin/paginaprin.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PaginaprinComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Fanpolis';
}
