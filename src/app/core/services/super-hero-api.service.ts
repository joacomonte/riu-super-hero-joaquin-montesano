import { Injectable } from '@angular/core';
import { SuperHero } from '../models/super-hero.model';

@Injectable({
  providedIn: 'root',
})
export class SuperHeroApiService {
  // Simulate database storage
  private heroes: SuperHero[] = [
    { id: 1, name: 'SUPERMAN', realName: 'Clark Kent', universe: 'DC' },
    { id: 2, name: 'BATMAN', realName: 'Bruce Wayne', universe: 'DC' },
    { id: 3, name: 'SPIDERMAN', realName: 'Peter Parker', universe: 'Marvel' },
    { id: 4, name: 'IRON MAN', realName: 'Tony Stark', universe: 'Marvel' },
    { id: 5, name: 'THE FLASH', realName: 'Barry Allen', universe: 'DC' },
    { id: 6, name: 'WONDER WOMAN', realName: 'Diana Prince', universe: 'DC' },
    { id: 7, name: 'CAPTAIN AMERICA', realName: 'Steve Rogers', universe: 'Marvel' },
    { id: 8, name: 'THOR', realName: 'Thor Odinson', universe: 'Marvel' },
    { id: 9, name: 'BLACK WIDOW', realName: 'Natasha Romanoff', universe: 'Marvel' },
    { id: 10, name: 'AQUAMAN', realName: 'Arthur Curry', universe: 'DC' },
  ];

  // Simulate API delay
  private async simulateApiDelay(min: number = 200, max: number = 800): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }


  async getAllHeroes(): Promise<SuperHero[]> {
    await this.simulateApiDelay(300, 600);
    return [...this.heroes];
  }


  async getHeroById(id: number): Promise<SuperHero | null> {
    await this.simulateApiDelay(200, 400);
    return this.heroes.find(hero => hero.id === id) || null;
  }


  async getHeroesByName(name: string): Promise<SuperHero[]> {
    await this.simulateApiDelay(200, 500);
    const searchTerm = name.toLowerCase().trim();
    if (!searchTerm) {
      return [...this.heroes];
    }
    return this.heroes.filter(hero => 
      hero.name.toLowerCase().includes(searchTerm) ||
      hero.realName.toLowerCase().includes(searchTerm)
    );
  }

  async createHero(hero: Omit<SuperHero, 'id'>): Promise<SuperHero> {
    await this.simulateApiDelay(500, 1000);
    
    const nextId = this.heroes.length > 0 
      ? Math.max(...this.heroes.map(h => h.id)) + 1 
      : 1;
    
    const newHero: SuperHero = { ...hero, id: nextId };
    this.heroes.push(newHero);
    
    return newHero;
  }

  async updateHero(updatedHero: SuperHero): Promise<SuperHero> {
    await this.simulateApiDelay(400, 800);
    
    const index = this.heroes.findIndex(hero => hero.id === updatedHero.id);
    if (index === -1) {
      throw new Error(`Hero with id ${updatedHero.id} not found`);
    }
    
    this.heroes[index] = updatedHero;
    return updatedHero;
  }

  async deleteHero(id: number): Promise<void> {
    await this.simulateApiDelay(300, 600);
    
    const index = this.heroes.findIndex(hero => hero.id === id);
    if (index === -1) {
      throw new Error(`Hero with id ${id} not found`);
    }
    
    this.heroes.splice(index, 1);
  }

  async getHeroesPaginated(page: number = 1, limit: number = 5): Promise<{
    heroes: SuperHero[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    await this.simulateApiDelay(300, 600);
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedHeroes = this.heroes.slice(startIndex, endIndex);
    const total = this.heroes.length;
    const totalPages = Math.ceil(total / limit);
    
    return {
      heroes: paginatedHeroes,
      total,
      page,
      totalPages
    };
  }

  async getHeroesCount(): Promise<number> {
    await this.simulateApiDelay(100, 200);
    return this.heroes.length;
  }

} 