import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
}

export interface PokemonImages {
  default: {
    front: string | null;
    back: string | null;
    front_female: string | null;
    back_female: string | null;
  };
  shiny: {
    front: string | null;
    back: string | null;
    front_female: string | null;
    back_female: string | null;
  };
  official_artwork: string | null;
  dream_world: string | null;
  home: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  // Cambiando a la URL de la PokeAPI pública ya que el servidor local no está configurado correctamente
  private apiUrl = 'https://pokeapi.co/api/v2';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Método para obtener la lista de pokemones con paginación
  getPokemonList(limit: number = 20, offset: number = 0): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`${this.apiUrl}/pokemon?limit=${limit}&offset=${offset}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para obtener las imágenes de un pokemon específico
  getPokemonImages(id: string): Observable<PokemonImages> {
    return this.http.get<any>(`${this.apiUrl}/pokemon/${id}`)
      .pipe(
        map(response => {
          // Transformar la respuesta de la PokeAPI al formato PokemonImages
          const sprites = response.sprites || {};
          const otherSprites = sprites.other || {};
          
          return {
            default: {
              front: sprites.front_default,
              back: sprites.back_default,
              front_female: sprites.front_female,
              back_female: sprites.back_female
            },
            shiny: {
              front: sprites.front_shiny,
              back: sprites.back_shiny,
              front_female: sprites.front_shiny_female,
              back_female: sprites.back_shiny_female
            },
            official_artwork: otherSprites['official-artwork']?.front_default || null,
            dream_world: otherSprites.dream_world?.front_default || null,
            home: otherSprites.home?.front_default || null
          };
        }),
        catchError(this.handleError)
      );
  }
  
  // Método para obtener los detalles completos de un pokemon
  getPokemonDetails(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pokemon/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Manejador de errores
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}, mensaje: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
