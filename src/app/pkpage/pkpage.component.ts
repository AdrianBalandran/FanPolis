import { Component } from '@angular/core';
import { NavegadorComponent } from "../navegador/navegador.component";
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pkpage',
  standalone: true,
  imports: [NavegadorComponent, CommonModule],
  templateUrl: './pkpage.component.html',
  styleUrl: './pkpage.component.css'
})
export class PkpageComponent {

  audio = new Audio();
  isMuted = false;

  constructor(private titleService: Title) {
    this.titleService.setTitle('FanPolis | Pokémon');
    this.audio.src = '../../assets/audio/pktheme.mp3';
    this.audio.loop = true;
  }

  ngOnInit() {
    this.audio.play().catch(e => console.log('Error al reproducir audio:', e));
  }

  ngOnDestroy() {
    this.audio.pause();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;
  }

}
