import { Injectable, signal, computed } from '@angular/core';
import { SuperHero } from '../models/super-hero.model';
import { SuperHeroApiService } from './super-hero-api.service';

@Injectable({
  providedIn: 'root',
})
export class SuperHeroService {
  private heroes = signal<SuperHero[]>([]);
  private loading = signal<boolean>(true);
  private error = signal<string | null>(null);
  private readonly STORAGE_KEY = 'super-heroes';

  // Public read-only signals
  public readonly heroesList = this.heroes.asReadonly();
  public readonly isLoading = this.loading.asReadonly();
  public readonly errorMessage = this.error.asReadonly();

  constructor(private apiService: SuperHeroApiService) {
    this.loadHeroes();
  }

  // LocalStorage helper methods
  private saveToLocalStorage(heroes: SuperHero[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(heroes));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): SuperHero[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  }

  // Load all heroes
  async loadHeroes(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      // First try to load from localStorage
      const localHeroes = this.loadFromLocalStorage();
      
      if (localHeroes.length > 0) {
        // Use local data if available
        this.heroes.set(localHeroes);
      } else {
        // Fallback to API if no local data
        const heroes = await this.apiService.getAllHeroes();
        this.heroes.set(heroes);
        this.saveToLocalStorage(heroes);
      }
    } catch (err) {
      this.error.set('Failed to load heroes');
      console.error('Error loading heroes:', err);
    } finally {
      this.loading.set(false);
    }
  }

  // GET all heroes
  getHeroes() {
    return this.heroesList;
  }

  getHeroById(id: number) {
    return computed(() => this.heroes().find((h) => h.id === id));
  }

  getHeroesByName(name: string) {
    return computed(() =>
      this.heroes().filter((h) =>
        h.name.toLowerCase().includes(name.toLowerCase())
      )
    );
  }

  async getFilteredHeroes(filter: string): Promise<SuperHero[]> {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      const heroes = await this.apiService.getHeroesByName(filter);
      return heroes;
    } catch (err) {
      this.error.set('Failed to filter heroes');
      console.error('Error filtering heroes:', err);
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  async getHeroByIdFromApi(id: number): Promise<SuperHero | null> {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      const hero = await this.apiService.getHeroById(id);
      return hero;
    } catch (err) {
      this.error.set('Failed to get hero by ID');
      console.error('Error getting hero by ID:', err);
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async addHero(hero: Omit<SuperHero, 'id'>): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      const newHero = await this.apiService.createHero(hero);
      const updatedHeroes = [...this.heroes(), newHero];
      this.heroes.set(updatedHeroes);
      this.saveToLocalStorage(updatedHeroes);
    } catch (err) {
      this.error.set('Failed to add hero');
      console.error('Error adding hero:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async updateHero(updatedHero: SuperHero): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      await this.apiService.updateHero(updatedHero);
      const updatedHeroes = this.heroes().map((hero) => (hero.id === updatedHero.id ? updatedHero : hero));
      this.heroes.set(updatedHeroes);
      this.saveToLocalStorage(updatedHeroes);
    } catch (err) {
      this.error.set('Failed to update hero');
      console.error('Error updating hero:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async deleteHero(id: number): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      await this.apiService.deleteHero(id);
      const updatedHeroes = this.heroes().filter((h) => h.id !== id);
      this.heroes.set(updatedHeroes);
      this.saveToLocalStorage(updatedHeroes);
    } catch (err) {
      this.error.set('Failed to delete hero');
      console.error('Error deleting hero:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async getHeroesPaginated(page: number = 1, limit: number = 5) {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      return await this.apiService.getHeroesPaginated(page, limit);
    } catch (err) {
      this.error.set('Failed to load paginated heroes');
      console.error('Error loading paginated heroes:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  clearError(): void {
    this.error.set(null);
  }

  clearLocalStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.heroes.set([]);
  }
}
