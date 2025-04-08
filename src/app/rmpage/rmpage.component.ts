import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavegadorComponent } from '../navegador/navegador.component';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rmpage',
  standalone: true,
  imports: [NavegadorComponent, CommonModule],
  templateUrl: './rmpage.component.html',
  styleUrl: './rmpage.component.css',
})
export class RmpageComponent implements OnInit, OnDestroy {
  audio = new Audio();
  isMuted = false;

  constructor(private titleService: Title) {
    this.titleService.setTitle('FanPolis | Rick&Morty');
    this.audio.src = '../../assets/audio/rmtheme.mp3';
    this.audio.loop = true;
  }

  ngOnInit() {
    this.audio
      .play()
      .catch((e) => console.log('Error al reproducir audio:', e));
  }

  ngOnDestroy() {
    this.audio.pause();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;
  }
}
