import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { RessourcesComponent } from './pages/ressources/ressources';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Jangalma — Apprendre ensemble, réussir ensemble' },
  { path: 'ressources', component: RessourcesComponent, title: 'Ressources — Jangalma' },
  // Pages pas encore construites : retour à l'accueil
  { path: '**', redirectTo: '' },
];
