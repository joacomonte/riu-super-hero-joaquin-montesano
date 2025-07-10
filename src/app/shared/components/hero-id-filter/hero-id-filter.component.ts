import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SuperHeroApiService } from '../../../core/services/super-hero-api.service';
import { SuperHero } from '../../../core/models/super-hero.model';

@Component({
  selector: 'app-hero-id-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="filter-container">
      <div class="input-wrapper">
        <input 
          type="number" 
          [formControl]="idControl" 
          placeholder="Enter hero ID..."
          class="standard-input number-input"
          (keyup.enter)="findHero()">
        <div class="input-icons">
          @if (isSearching()) {
            <span class="spinner-small"></span>
          } @else if (idControl.value) {
            <button 
              class="icon-btn find-icon" 
              (click)="findHero()"
              [disabled]="idControl.disabled"
              title="Find hero">
              🔍
            </button>
            <button 
              class="icon-btn clear-icon" 
              (click)="clearFilter()"
              [disabled]="idControl.disabled"
              title="Clear">
              ✕
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filter-container {
      margin-bottom: 1rem;
    }
    
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .input-icons {
      position: absolute;
      right: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      pointer-events: none;
    }
    
    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 3px;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
      pointer-events: auto;
    }
    
    .icon-btn:hover:not(:disabled) {
      background-color: rgba(0, 0, 0, 0.1);
    }
    
    .icon-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .find-icon {
      color: #007bff;
    }
    
    .clear-icon {
      color: #6c757d;
    }
    
    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid #007bff;
      border-top: 2px solid transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class HeroIdFilterComponent {
  private apiService = inject(SuperHeroApiService);
  
  @Output() foundHero = new EventEmitter<number>();
  @Output() searchStarted = new EventEmitter<void>();
  @Output() searchCompleted = new EventEmitter<void>();
  @Output() filterCleared = new EventEmitter<void>();

  idControl = new FormControl<number | null>(null);
  isSearching = signal<boolean>(false);

  async findHero() {
    const id = this.idControl.value;
    if (!id) return;

    this.isSearching.set(true);
    this.idControl.disable();
    this.searchStarted.emit();

    try {
      const hero = await this.apiService.getHeroById(id);
      if (hero) {
        this.foundHero.emit(id);
      } else {
        this.foundHero.emit(0); // Emit 0 to indicate no hero found
      }
    } catch (error) {
      console.error('Error finding hero by ID:', error);
      this.foundHero.emit(0); // Emit 0 to indicate no hero found
    } finally {
      this.isSearching.set(false);
      this.idControl.enable();
      this.searchCompleted.emit();
    }
  }

  clearFilter() {
    this.idControl.setValue(null);
    this.filterCleared.emit();
  }

  getCurrentId(): number | null {
    return this.idControl.value;
  }
} 