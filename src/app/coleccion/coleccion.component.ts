import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavegadorComponent } from '../navegador/navegador.component';
import { CommonModule } from '@angular/common';
import { InfopokemonComponent } from '../infopokemon/infopokemon.component';
import { DatabaseService } from '../database.service';
import { RouterModule } from '@angular/router';

interface FavoritePokemon {
  id: number;
  name: string;
  imageUrl: string;
  types?: string[];
}

@Component({
  selector: 'app-coleccion',
  standalone: true,
  imports: [
    NavegadorComponent,
    CommonModule,
    InfopokemonComponent,
    RouterModule,
  ],
  templateUrl: './coleccion.component.html',
  styleUrl: './coleccion.component.css',
})
export class ColeccionComponent implements OnInit, OnDestroy {
  favoritePokemons: FavoritePokemon[] = [];
  selectedPokemonId: number | null = null;
  noFavorites: boolean = false;
  private favoritesSubscription: any;

  //Audio
  audio = new Audio();
  isMuted = false;
  selectionAudio = new Audio();

  constructor(private databaseService: DatabaseService) {
    this.audio.src = '../../assets/audio/temachill.mp3';
    this.audio.loop = true;
  }

  ngOnInit(): void {
    this.audio.volume = 0.1;
    // Recuperar el estado de silencio del localStorage
    const savedMuteState = localStorage.getItem('pkpageAudioMuted');
    if (savedMuteState !== null) {
      this.isMuted = JSON.parse(savedMuteState);
      this.audio.muted = this.isMuted;
    }

    // Intentar reproducir el audio automáticamente
    this.audio.play().catch((e) => {
      console.log('Error al reproducir audio automáticamente:', e);

      // Si falla la reproducción automática, intentar reproducir en el primer clic del usuario
      const handleUserInteraction = () => {
        this.audio
          .play()
          .catch((err) =>
            console.log(
              'Error al reproducir audio después de interacción:',
              err
            )
          );
        // Eliminar los event listeners después de la primera interacción
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      };

      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('touchstart', handleUserInteraction);
    });

    this.loadFavoritePokemons();

    // Suscribirse a los cambios en favoritos
    this.favoritesSubscription =
      this.databaseService.favoritesChanged$.subscribe(() => {
        this.loadFavoritePokemons();
      });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;

    // Guardar el estado de silencio en localStorage
    localStorage.setItem('pkpageAudioMuted', JSON.stringify(this.isMuted));
  }

  ngOnDestroy(): void {
    this.audio.pause();
    // Cancelar la suscripción cuando el componente se destruye
    if (this.favoritesSubscription) {
      this.favoritesSubscription.unsubscribe();
    }
  }

  loadFavoritePokemons(): void {
    this.favoritePokemons = this.databaseService.getFavorites();
    this.noFavorites = this.favoritePokemons.length === 0;
  }

  selectPokemon(id: number): void {
    this.selectedPokemonId = id;
  }

  closeModal(event: Event): void {
    this.selectedPokemonId = null;
  }

  capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  getTypeClass(type: string): string {
    return `type-${type}`;
  }
}
