import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../database.service';

interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: string[];
  abilities: string[];
  stats: {name: string, value: number}[];
  imageUrl: string;
  sprites: any;
  cries?: {latest: string};
}

@Component({
  selector: 'app-infopokemon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './infopokemon.component.html',
  styleUrl: './infopokemon.component.css'
})
export class InfopokemonComponent implements OnChanges {
  @Input() pokemonId: number | null = null;
  
  pokemon: PokemonDetail | null = null;
  loading: boolean = false;
  error: string | null = null;
  audioPlaying: boolean = false;
  pokemonCry: HTMLAudioElement | null = null;
  
  constructor(private databaseService: DatabaseService) {}
  
  ngOnChanges(changes: SimpleChanges): void {
    // Verificamos si el pokemonId ha cambiado o si se ha forzado una actualización
    if (changes['pokemonId']) {
      // Siempre cargar los detalles cuando se recibe un pokemonId, incluso si es el mismo valor
      if (this.pokemonId) {
        this.loadPokemonDetails(this.pokemonId);
      }
    }
  }
  
  loadPokemonDetails(id: number): void {
    this.loading = true;
    this.error = null;
    
    this.databaseService.getPokemonDetails(id)
      .subscribe({
        next: (data) => {
          this.pokemon = {
            id: data.id,
            name: data.name,
            height: data.height / 10, // Convertir a metros
            weight: data.weight / 10, // Convertir a kilogramos
            types: data.types.map((t: any) => t.type.name),
            abilities: data.abilities.map((a: any) => a.ability.name),
            stats: data.stats.map((s: any) => ({
              name: this.formatStatName(s.stat.name),
              value: s.base_stat
            })),
            imageUrl: data.sprites.other['official-artwork'].front_default,
            sprites: data.sprites,
            cries: data.cries
          };
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar los detalles del Pokémon';
          this.loading = false;
          console.error('Error al cargar detalles del Pokémon:', err);
        }
      });
  }
  
  formatStatName(statName: string): string {
    const statNames: {[key: string]: string} = {
      'hp': 'HP',
      'attack': 'Ataque',
      'defense': 'Defensa',
      'special-attack': 'Ataque Especial',
      'special-defense': 'Defensa Especial',
      'speed': 'Velocidad'
    };
    
    return statNames[statName] || statName;
  }
  
  capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  
  getTypeClass(type: string): string {
    return `type-${type}`;
  }
  
  playPokemonCry(): void {
    if (this.pokemon?.cries?.latest) {
      if (this.pokemonCry) {
        this.pokemonCry.pause();
        this.pokemonCry = null;
        this.audioPlaying = false;
      }
      
      this.pokemonCry = new Audio(this.pokemon.cries.latest);
      this.pokemonCry.play()
        .then(() => {
          this.audioPlaying = true;
          this.pokemonCry!.onended = () => {
            this.audioPlaying = false;
          };
        })
        .catch(e => {
          console.error('Error al reproducir el sonido del Pokémon:', e);
          this.audioPlaying = false;
        });
    }
  }
}
