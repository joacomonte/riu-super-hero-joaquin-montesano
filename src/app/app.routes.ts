import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'heroes', pathMatch: 'full' },
  { 
    path: 'heroes', 
    loadComponent: () => import('./features/heroes/heroes-list/hero-list.component').then(m => m.HeroListComponent) 
  },
  { 
    path: 'hero/new', 
    loadComponent: () => import('./features/heroes/hero-form/hero-form.component').then(m => m.HeroFormComponent)
  },
  { 
    path: 'hero/edit/:id', 
    loadComponent: () => import('./features/heroes/hero-form/hero-form.component').then(m => m.HeroFormComponent)
  }
];