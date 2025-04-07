import { Component } from '@angular/core';
import { NavegadorComponent } from "../navegador/navegador.component";
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { DatabaseService, PokemonListResponse } from '../database.service';
import { FormsModule } from '@angular/forms';
import { InfopokemonComponent } from '../infopokemon/infopokemon.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pkpage',
  standalone: true,
  imports: [NavegadorComponent, CommonModule, FormsModule, InfopokemonComponent],
  templateUrl: './pkpage.component.html',
  styleUrl: './pkpage.component.css'
})
export class PkpageComponent {

  audio = new Audio();
  isMuted = false;
  selectionAudio = new Audio();
  
  // Variables para la lista de pokemones
  pokemonList: {name: string, url: string, id: number, imageUrl: string}[] = [];
  totalPokemons: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalPages: number = 0;
  loading: boolean = false;
  error: string | null = null;
  
  // Variable para el Pokémon seleccionado
  selectedPokemonId: number | null = null;

  constructor(
    private titleService: Title,
    private databaseService: DatabaseService,
    private route: ActivatedRoute
  ) {
    this.titleService.setTitle('FanPolis | Pokémon');
    this.audio.src = '../../assets/audio/pktheme.mp3';
    this.audio.loop = true;
  }

  ngOnInit() {
    this.audio.play().catch(e => console.log('Error al reproducir audio:', e));
    this.loadPokemons();
    
    // Verificar si hay un ID de Pokémon en los parámetros de consulta
    this.route.queryParams.subscribe(params => {
      if (params['pokemonId']) {
        const pokemonId = parseInt(params['pokemonId']);
        if (!isNaN(pokemonId)) {
          // Seleccionar el Pokémon automáticamente
          this.selectPokemon(pokemonId);
          
          // Si el Pokémon no está en la página actual, buscar en qué página está
          const itemsPerPage = this.itemsPerPage;
          const pageNumber = Math.ceil(pokemonId / itemsPerPage);
          if (pageNumber !== this.currentPage) {
            this.currentPage = pageNumber;
            this.loadPokemons();
          }
        }
      }
    });
  }

  ngOnDestroy() {
    this.audio.pause();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;
  }

  // Método para cargar la lista de pokemones
  loadPokemons() {
    this.loading = true;
    const offset = (this.currentPage - 1) * this.itemsPerPage;
    
    this.databaseService.getPokemonList(this.itemsPerPage, offset).subscribe({
      next: (response: PokemonListResponse) => {
        this.totalPokemons = response.count;
        this.totalPages = Math.ceil(this.totalPokemons / this.itemsPerPage);
        
        // Procesar los resultados para obtener el ID y la URL de la imagen
        this.pokemonList = response.results.map(pokemon => {
          // Extraer el ID del pokemon de la URL
          const urlParts = pokemon.url.split('/');
          const id = parseInt(urlParts[urlParts.length - 2]);
          
          // Construir la URL de la imagen usando el ID
          // Usamos la imagen oficial de artwork que es de mejor calidad
          const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
          
          return {
            name: pokemon.name,
            url: pokemon.url,
            id: id,
            imageUrl: imageUrl
          };
        });
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los pokemones. Por favor, intenta de nuevo.';
        this.loading = false;
        console.error('Error al cargar pokemones:', err);
      }
    });
  }

  // Método para cambiar de página
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPokemons();
    }
  }

  // Método para ir a la página anterior
  prevPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  // Método para ir a la página siguiente
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  // Método para capitalizar la primera letra del nombre
  capitalizeFirstLetter(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  
  // Método para seleccionar un Pokémon
  selectPokemon(id: number) {
    this.selectedPokemonId = id;
    
    // Reproducir sonido de selección
    this.selectionAudio.src = '../../assets/audio/qepokemon.mp3';
    this.selectionAudio.play().catch(e => console.log('Error al reproducir audio de selección:', e));
  }
  
  // Método para cerrar el modal
  closeModal(event: MouseEvent) {
    this.selectedPokemonId = null;
  }
}
