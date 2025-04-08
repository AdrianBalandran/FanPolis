import { Component } from '@angular/core';
import { NavegadorComponent } from "../navegador/navegador.component";
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { DatabaseService, PokemonListResponse } from '../database.service';
import { FormsModule } from '@angular/forms';
import { InfopokemonComponent } from '../infopokemon/infopokemon.component';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

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
  pokemonList: {name: string, url: string, id: number, imageUrl: string, stats?: any}[] = [];
  filteredPokemonList: {name: string, url: string, id: number, imageUrl: string, stats?: any}[] = [];
  allPokemonList: {name: string, url: string, id: number, imageUrl: string, stats?: any}[] = [];
  totalPokemons: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalPages: number = 0;
  loading: boolean = false;
  error: string | null = null;
  isFiltered: boolean = false;
  
  // Variable para el Pokémon seleccionado
  selectedPokemonId: number | null = null;
  
  // Variables para el panel de filtros
  showFilterPanel: boolean = false;
  activeFilters: string[] = [];
  pokemonDetails: {[key: number]: any} = {};
  
  // Variables para los tipos de Pokémon
  pokemonTypes: string[] = [];
  showTypesList: boolean = false;
  selectedType: string | null = null;

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
    this.audio.volume = 0.1;
    
    // Recuperar el estado de silencio del localStorage
    const savedMuteState = localStorage.getItem('pkpageAudioMuted');
    if (savedMuteState !== null) {
      this.isMuted = JSON.parse(savedMuteState);
      this.audio.muted = this.isMuted;
    }
    
    // Intentar reproducir el audio automáticamente
    this.audio.play().catch(e => {
      console.log('Error al reproducir audio automáticamente:', e);
      
      // Si falla la reproducción automática, intentar reproducir en el primer clic del usuario
      const handleUserInteraction = () => {
        this.audio.play().catch(err => console.log('Error al reproducir audio después de interacción:', err));
        // Eliminar los event listeners después de la primera interacción
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      };
      
      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('touchstart', handleUserInteraction);
    });
    
    this.loadPokemons();
    
    // Cargar filtros guardados del localStorage
    this.loadSavedFilters();
    
    // Cargar los tipos de Pokémon
    this.loadPokemonTypes();
    
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
    
    // Guardar el estado de silencio en localStorage
    localStorage.setItem('pkpageAudioMuted', JSON.stringify(this.isMuted));
  }

  // Método para cargar la lista de pokemones
  loadPokemons() {
    this.loading = true;
    
    // Si hay filtros activos y ya tenemos todos los pokémon cargados, solo aplicamos paginación
    if (this.isFiltered && this.allPokemonList.length > 0) {
      this.applyPagination();
      return;
    }
    
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
        
        // Si hay filtros activos, cargar todos los pokémon para aplicar filtros
        if (this.activeFilters.length > 0) {
          this.loadAllPokemonForFiltering();
        } else {
          this.filteredPokemonList = [...this.pokemonList];
          this.loading = false;
        }
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
      
      // Si estamos usando filtros y tenemos todos los pokémon cargados, solo aplicamos paginación
      if (this.isFiltered && this.allPokemonList.length > 0) {
        this.applyPagination();
      } else {
        this.loadPokemons();
      }
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
  
  // Métodos para el panel de filtros
  toggleFilterPanel() {
    this.showFilterPanel = !this.showFilterPanel;
  }
  
  // Cargar filtros guardados del localStorage
  loadSavedFilters() {
    const savedFilters = localStorage.getItem('pokemonFilters');
    if (savedFilters) {
      this.activeFilters = JSON.parse(savedFilters);
      if (this.activeFilters.length > 0) {
        this.showFilterPanel = true;
      }
    }
  }
  
  // Guardar filtros en localStorage
  saveFilters() {
    localStorage.setItem('pokemonFilters', JSON.stringify(this.activeFilters));
  }
  
  // Aplicar filtro
  applyFilter(filter: string) {
    const index = this.activeFilters.indexOf(filter);
    
    // Si el filtro ya está activo, lo quitamos
    if (index !== -1) {
      this.activeFilters.splice(index, 1);
      
      // Si estamos quitando el filtro de tipo, también reseteamos el tipo seleccionado
      if (filter === 'tipo') {
        this.selectedType = null;
        this.showTypesList = false;
      }
    } else {
      // Si es un filtro de ordenamiento (ascendente/descendente), quitamos el otro si está activo
      if (filter === 'ascendente' && this.activeFilters.includes('descendente')) {
        this.activeFilters.splice(this.activeFilters.indexOf('descendente'), 1);
      } else if (filter === 'descendente' && this.activeFilters.includes('ascendente')) {
        this.activeFilters.splice(this.activeFilters.indexOf('ascendente'), 1);
      }
      
      // Añadimos el nuevo filtro
      this.activeFilters.push(filter);
      
      // Si es el filtro de tipo, mostramos la lista de tipos
      if (filter === 'tipo') {
        this.showTypesList = true;
      }
    }
    
    // Guardar filtros en localStorage
    this.saveFilters();
    
    // Aplicar filtros
    if (this.activeFilters.length > 0) {
      // Si es la primera vez que aplicamos un filtro, cargamos todos los pokémon
      if (!this.isFiltered || this.allPokemonList.length === 0) {
        this.loadAllPokemonForFiltering();
      } else {
        // Si ya tenemos todos los pokémon cargados, solo aplicamos los filtros
        this.applyActiveFilters();
      }
    } else {
      // Si no hay filtros activos, volvemos a la carga normal de pokémon
      this.isFiltered = false;
      this.allPokemonList = [];
      this.currentPage = 1;
      this.loadPokemons();
    }
  }
  
  // Método para cargar todos los pokémon cuando se aplican filtros
  loadAllPokemonForFiltering() {
    this.loading = true;
    
    // Si ya tenemos todos los pokémon cargados, solo aplicamos los filtros
    if (this.allPokemonList.length > 0) {
      this.loadPokemonDetails();
      return;
    }
    
    // Cargar todos los pokémon (o un número suficientemente grande)
    // La API de Pokémon tiene un límite de 1000 pokémon por solicitud
    const limit = 1000;
    
    this.databaseService.getPokemonList(limit, 0).subscribe({
      next: (response: PokemonListResponse) => {
        this.totalPokemons = response.count;
        
        // Procesar los resultados para obtener el ID y la URL de la imagen
        this.allPokemonList = response.results.map(pokemon => {
          // Extraer el ID del pokemon de la URL
          const urlParts = pokemon.url.split('/');
          const id = parseInt(urlParts[urlParts.length - 2]);
          
          // Construir la URL de la imagen usando el ID
          const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
          
          return {
            name: pokemon.name,
            url: pokemon.url,
            id: id,
            imageUrl: imageUrl
          };
        });
        
        // Cargar los detalles de los pokémon para aplicar filtros
        this.loadPokemonDetails();
      },
      error: (err) => {
        this.error = 'Error al cargar todos los pokemones. Por favor, intenta de nuevo.';
        this.loading = false;
        console.error('Error al cargar todos los pokemones:', err);
      }
    });
  }
  
  // Cargar detalles de Pokémon para aplicar filtros
  loadPokemonDetails() {
    this.loading = true;
    
    // Usamos la lista completa de pokémon si estamos filtrando
    const pokemonToProcess = this.allPokemonList.length > 0 ? this.allPokemonList : this.pokemonList;
    
    // Crear un array de observables para cada Pokémon
    const detailsRequests = pokemonToProcess.map(pokemon => {
      // Si ya tenemos los detalles en caché, los usamos
      if (this.pokemonDetails[pokemon.id]) {
        return of(this.pokemonDetails[pokemon.id]);
      }
      
      // Si no, hacemos la petición
      return this.databaseService.getPokemonDetails(pokemon.id).pipe(
        catchError(error => {
          console.error(`Error al cargar detalles del Pokémon ${pokemon.id}:`, error);
          return of(null);
        })
      );
    });
    
    // Ejecutar todas las peticiones en paralelo
    forkJoin(detailsRequests).subscribe(details => {
      // Guardar los detalles en caché
      details.forEach((detail, index) => {
        if (detail) {
          const pokemonId = pokemonToProcess[index].id;
          this.pokemonDetails[pokemonId] = detail;
          
          // Añadir stats al pokemonList
          pokemonToProcess[index].stats = detail.stats.map((s: any) => ({
            name: s.stat.name,
            value: s.base_stat
          }));
        }
      });
      
      // Aplicar filtros
      this.applyActiveFilters();
      this.loading = false;
    });
  }
  
  // Cargar los tipos de Pokémon
  loadPokemonTypes() {
    this.databaseService.getPokemonTypes().subscribe({
      next: (types) => {
        this.pokemonTypes = types;
      },
      error: (err) => {
        console.error('Error al cargar los tipos de Pokémon:', err);
      }
    });
  }
  
  // Seleccionar un tipo de Pokémon
  selectPokemonType(type: string) {
    this.selectedType = type;
    this.showTypesList = false;
    
    // Aplicar filtros a todos los pokémon
    if (!this.isFiltered || this.allPokemonList.length === 0) {
      this.loadAllPokemonForFiltering();
    } else {
      // Si ya tenemos todos los pokémon cargados, solo aplicamos los filtros
      this.applyActiveFilters();
    }
  }
  
  // Aplicar filtros activos
  applyActiveFilters() {
    // Determinar qué lista usar como base para los filtros
    const sourceList = this.allPokemonList.length > 0 ? this.allPokemonList : this.pokemonList;
    
    // Clonar la lista original
    let filtered = [...sourceList];
    
    // Aplicar cada filtro activo
    this.activeFilters.forEach(filter => {
      switch (filter) {
        case 'ascendente':
          filtered.sort((a, b) => a.id - b.id);
          break;
        case 'descendente':
          filtered.sort((a, b) => b.id - a.id);
          break;
        case 'ataque':
          filtered.sort((a, b) => {
            const aAttack = a.stats?.find((s: any) => s.name === 'attack')?.value || 0;
            const bAttack = b.stats?.find((s: any) => s.name === 'attack')?.value || 0;
            return bAttack - aAttack;
          });
          break;
        case 'defensa':
          filtered.sort((a, b) => {
            const aDefense = a.stats?.find((s: any) => s.name === 'defense')?.value || 0;
            const bDefense = b.stats?.find((s: any) => s.name === 'defense')?.value || 0;
            return bDefense - aDefense;
          });
          break;
        case 'hp':
          filtered.sort((a, b) => {
            const aHP = a.stats?.find((s: any) => s.name === 'hp')?.value || 0;
            const bHP = b.stats?.find((s: any) => s.name === 'hp')?.value || 0;
            return bHP - aHP;
          });
          break;
        case 'velocidad':
          filtered.sort((a, b) => {
            const aSpeed = a.stats?.find((s: any) => s.name === 'speed')?.value || 0;
            const bSpeed = b.stats?.find((s: any) => s.name === 'speed')?.value || 0;
            return bSpeed - aSpeed;
          });
          break;
        case 'tipo':
          if (this.selectedType) {
            filtered = filtered.filter(pokemon => {
              // Verificar si el Pokémon tiene el tipo seleccionado
              const pokemonDetail = this.pokemonDetails[pokemon.id];
              if (pokemonDetail && pokemonDetail.types) {
                return pokemonDetail.types.some((t: any) => t.type.name === this.selectedType);
              }
              return false;
            });
          }
          break;
      }
    });
    
    // Marcar que estamos usando filtros si hay filtros activos
    this.isFiltered = this.activeFilters.length > 0;
    
    // Guardar la lista filtrada completa
    this.allPokemonList = filtered;
    
    // Actualizar el total de pokémon y las páginas basado en los resultados filtrados
    this.totalPokemons = filtered.length;
    this.totalPages = Math.ceil(this.totalPokemons / this.itemsPerPage);
    
    // Asegurarse de que la página actual es válida
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
    
    // Aplicar paginación a los resultados filtrados
    this.applyPagination();
  }
  
  // Aplicar paginación a los resultados filtrados
  applyPagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    // Obtener solo los pokémon de la página actual
    this.filteredPokemonList = this.allPokemonList.slice(startIndex, endIndex);
    this.loading = false;
  }
}
