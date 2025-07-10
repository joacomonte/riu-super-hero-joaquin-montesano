import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { SuperHeroService } from '../../../core/services/super-hero.service';
import { SuperHero } from '../../../core/models/super-hero.model';

@Component({
  selector: 'app-hero-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="filter-container">
      <input 
        type="text" 
        [formControl]="filterControl" 
        placeholder="Filter heroes by name..."
        class="standard-input text-input">
    </div>
  `,
  styles: [`
    .filter-container {
      margin-bottom: 1rem;
    }
  `]
})
export class HeroFilterComponent {
  private superHeroService = inject(SuperHeroService);
  
  @Output() filterChanged = new EventEmitter<string>();

  filterControl = new FormControl('');
  currentFilter = signal('');

  constructor() {
    this.filterControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      const filterValue = value || '';
      this.currentFilter.set(filterValue);
      this.requestFilteredHeroes(filterValue);
    });
  }

  private requestFilteredHeroes(filter: string) {
    this.filterChanged.emit(filter);
  }

  resetFilter() {
    this.filterControl.setValue('');
  }

  getCurrentFilter(): string {
    return this.currentFilter();
  }
} 