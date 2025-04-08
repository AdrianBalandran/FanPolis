import { Component, ElementRef, Renderer2 } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-navegador',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './navegador.component.html',
  styleUrl: './navegador.component.css',
})
export class NavegadorComponent {
  searchTerm: string = '';
  searchResults: any[] = [];
  isSearching: boolean = false;
  noResults: boolean = false;
  showResults: boolean = false;
  justSearched: boolean = false; // Variable para rastrear si se acaba de realizar una búsqueda mediante el botón

  constructor(
    private databaseService: DatabaseService,
    private router: Router,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  searchPokemon() {
    if (!this.searchTerm.trim()) {
      this.showResults = false;
      return;
    }

    this.isSearching = true;
    this.noResults = false;
    this.showResults = true; // Aseguramos que los resultados se muestren al iniciar la búsqueda
    this.justSearched = true; // Marcamos que se acaba de realizar una búsqueda mediante el botón

    // Primero intentamos buscar por nombre exacto
    this.databaseService
      .getPokemonDetails(this.searchTerm.toLowerCase())
      .subscribe({
        next: (pokemon) => {
          this.searchResults = [
            {
              name: pokemon.name,
              id: pokemon.id,
              imageUrl:
                pokemon.sprites.other['official-artwork'].front_default ||
                pokemon.sprites.front_default,
            },
          ];
          this.isSearching = false;
          this.noResults = false;
        },
        error: () => {
          // Si no encontramos coincidencia exacta, buscamos similitudes
          this.findSimilarPokemons();
        },
      });
  }

  private findSimilarPokemons() {
    // Obtenemos una lista más grande para buscar coincidencias parciales
    this.databaseService.getPokemonList(100, 0).subscribe({
      next: (response) => {
        const searchTermLower = this.searchTerm.toLowerCase();

        // Filtramos los pokémon que contienen el término de búsqueda
        const filteredResults = response.results
          .filter((pokemon) => pokemon.name.includes(searchTermLower))
          .map((pokemon) => {
            const urlParts = pokemon.url.split('/');
            const id = parseInt(urlParts[urlParts.length - 2]);
            return {
              name: pokemon.name,
              id: id,
              imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
            };
          });

        this.searchResults = filteredResults;
        this.noResults = filteredResults.length === 0;
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Error al buscar pokémon similares:', err);
        this.searchResults = [];
        this.noResults = true;
        this.isSearching = false;
      },
    });
  }

  viewPokemonDetails(pokemonId: number) {
    // Necesitamos encontrar una forma de pasar el ID del Pokémon seleccionado a la página de detalles
    // Primero, navegamos a la página principal de Pokémon si no estamos ya en ella
    if (!this.router.url.includes('/pkpage')) {
      this.router.navigate(['/pkpage'], {
        queryParams: { pokemonId: pokemonId },
      });
    } else {
      // Si ya estamos en la página de Pokémon, actualizamos los parámetros de consulta
      // Añadimos un timestamp para forzar la actualización incluso si es el mismo ID
      this.router.navigate([], {
        relativeTo: this.router.routerState.root.firstChild,
        queryParams: { pokemonId: pokemonId, timestamp: new Date().getTime() },
        queryParamsHandling: 'merge',
      });
    }
    // Cerramos los resultados de búsqueda
    this.showResults = false;
    this.searchTerm = '';

    // Cerramos el menú desplegable si está abierto
    const navbarCollapse = this.el.nativeElement.querySelector('#navbarNav');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      this.renderer.removeClass(navbarCollapse, 'show');
    }
  }

  onBlur() {
    // Pequeño retraso para permitir que se procese el clic en un resultado
    setTimeout(() => {
      // No ocultamos los resultados si acabamos de realizar una búsqueda mediante el botón
      if (!this.justSearched && !this.isSearching) {
        this.showResults = false;
      }
      // Restablecemos la variable después de un tiempo para restaurar el comportamiento normal
      if (this.justSearched) {
        setTimeout(() => {
          this.justSearched = false;
        }, 3000); // Damos tiempo suficiente para que el usuario interactúe con los resultados
      }
    }, 200);
  }

  onFocus() {
    if (this.searchTerm.trim() && this.searchResults.length > 0) {
      this.showResults = true;
    }
  }

  toggleNavbar() {
    const navbarCollapse = this.el.nativeElement.querySelector('#navbarNav');
    if (navbarCollapse.classList.contains('show')) {
      this.renderer.removeClass(navbarCollapse, 'show');
    } else {
      this.renderer.addClass(navbarCollapse, 'show');
    }
  }
}
