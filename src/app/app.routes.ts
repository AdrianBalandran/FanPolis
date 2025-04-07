import { Routes } from '@angular/router';
import { PaginaprinComponent } from './paginaprin/paginaprin.component';
import { ColeccionComponent } from './coleccion/coleccion.component';
import { RmpageComponent } from './rmpage/rmpage.component';
import { PkpageComponent } from './pkpage/pkpage.component';
import { InfopokemonComponent } from './infopokemon/infopokemon.component';
// import { FeaturesComponent } from './features/features.component';
// import { PricingComponent } from './pricing/pricing.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: PaginaprinComponent },
  { path: 'coleccion', component: ColeccionComponent },
  // { path: 'rampage', component: RmpageComponent},
  { path: 'pkpage', component: PkpageComponent},
  //   { path: 'pricing', component: PricingComponent },
  { path: '**', redirectTo: '/home' },
];
