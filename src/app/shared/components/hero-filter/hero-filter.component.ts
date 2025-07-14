import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { SuperHeroService } from '../../../core/services/super-hero.service';


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
  
  @Output() filterChanged = new EventEmitter<string>();

  filterControl = new FormControl('');
  currentFilter = signal('');
  private readonly STORAGE_KEY = 'hero-name-filter';

  constructor() {
    const savedFilter = this.loadFromLocalStorage();
    if (savedFilter) {
      this.filterControl.setValue(savedFilter);
      this.currentFilter.set(savedFilter);
      setTimeout(() => this.requestFilteredHeroes(savedFilter), 0);
    }

    this.filterControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      const filterValue = value || '';
      this.currentFilter.set(filterValue);
      this.saveToLocalStorage(filterValue);
      this.requestFilteredHeroes(filterValue);
    });
  }

  private requestFilteredHeroes(filter: string) {
    this.filterChanged.emit(filter);
  }

  private saveToLocalStorage(filter: string) {
    if (filter) {
      localStorage.setItem(this.STORAGE_KEY, filter);
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private loadFromLocalStorage(): string {
    return localStorage.getItem(this.STORAGE_KEY) || '';
  }

  resetFilter() {
    this.filterControl.setValue('');
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getCurrentFilter(): string {
    return this.currentFilter();
  }
} 