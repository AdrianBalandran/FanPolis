import { Routes } from '@angular/router';
import { PaginaprinComponent } from './paginaprin/paginaprin.component';
import { ColeccionComponent } from './coleccion/coleccion.component';
// import { FeaturesComponent } from './features/features.component';
// import { PricingComponent } from './pricing/pricing.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: PaginaprinComponent },
   { path: 'features', component: ColeccionComponent },
//   { path: 'pricing', component: PricingComponent },
  { path: '**', redirectTo: '/home' }
];
