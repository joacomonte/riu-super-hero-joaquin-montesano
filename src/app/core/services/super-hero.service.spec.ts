import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SuperHeroService } from './super-hero.service';
import { SuperHeroApiService } from './super-hero-api.service';
import { SuperHero } from '../models/super-hero.model';

describe('SuperHeroService', () => {
  let service: SuperHeroService;
  let apiService: jasmine.SpyObj<SuperHeroApiService>;

  const mockHeroes: SuperHero[] = [
    { id: 1, name: 'SUPERMAN', realName: 'Clark Kent', universe: 'DC' },
    { id: 2, name: 'BATMAN', realName: 'Bruce Wayne', universe: 'DC' },
    { id: 3, name: 'SPIDERMAN', realName: 'Peter Parker', universe: 'Marvel' },
  ];

  const mockHero: SuperHero = { id: 1, name: 'SUPERMAN', realName: 'Clark Kent', universe: 'DC' };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('SuperHeroApiService', [
      'getAllHeroes',
      'getHeroById',
      'getHeroesByName',
      'createHero',
      'updateHero',
      'deleteHero',
      'getHeroesPaginated'
    ]);

    TestBed.configureTestingModule({
      providers: [
        SuperHeroService,
        { provide: SuperHeroApiService, useValue: spy }
      ]
    });

    // Clear localStorage before each test
    localStorage.clear();
    
    service = TestBed.inject(SuperHeroService);
    apiService = TestBed.inject(SuperHeroApiService) as jasmine.SpyObj<SuperHeroApiService>;
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {

    it('should initialize with empty heroes list', () => {
      expect(service.heroesList()).toEqual([]);
    });

    it('should initialize with no error', () => {
      expect(service.errorMessage()).toBeNull();
    });
  });

  describe('loadHeroes', () => {
    beforeEach(() => {
      localStorage.clear();
      apiService.getAllHeroes.calls.reset();
    });
  
    it('loads from API when localStorage is empty', fakeAsync(() => {
      apiService.getAllHeroes.and.returnValue(Promise.resolve(mockHeroes));
      
      service.loadHeroes();
      tick();
      
      expect(apiService.getAllHeroes).toHaveBeenCalled();
      expect(service.heroesList()).toEqual(mockHeroes);
      expect(service.isLoading()).toBeFalse();
      expect(service.errorMessage()).toBeNull();
    }));
  
    it('loads from localStorage when available', fakeAsync(() => {
      localStorage.setItem('super-heroes', JSON.stringify(mockHeroes));
      apiService.getAllHeroes.and.returnValue(Promise.resolve([]));
      
      service.loadHeroes();
      tick();
      
      expect(service.heroesList()).toEqual(mockHeroes);
      expect(apiService.getAllHeroes).not.toHaveBeenCalled();
    }));
  
    it('handles API errors', fakeAsync(() => {
      apiService.getAllHeroes.and.returnValue(Promise.reject(new Error('API Error')));
      
      service.loadHeroes();
      tick();
      
      expect(service.errorMessage()).toBe('Failed to load heroes');
      expect(service.isLoading()).toBeFalse();
    }));
  
    it('falls back to API when localStorage fails', fakeAsync(() => {
      spyOn(localStorage, 'getItem').and.throwError('Storage error');
      apiService.getAllHeroes.and.returnValue(Promise.resolve(mockHeroes));
      
      service.loadHeroes();
      tick();
      
      expect(service.heroesList()).toEqual(mockHeroes);
    }));
  });

  describe('getHeroes', () => {
    it('signal should be unmodified', () => {
      expect(service.getHeroes()).toBe(service.heroesList);
    });
  });

  describe('getHeroById', () => {
    it('should return computed hero by id', fakeAsync(() => {
      apiService.getAllHeroes.and.returnValue(Promise.resolve(mockHeroes));
      
      service.loadHeroes();
      tick();

      const hero = service.getHeroById(1);
      expect(hero()).toEqual(mockHeroes[0]);
    }));

    it('should return undefined for non-existent hero', fakeAsync(() => {
      apiService.getAllHeroes.and.returnValue(Promise.resolve(mockHeroes));
      
      service.loadHeroes();
      tick();

      const hero = service.getHeroById(99999);
      expect(hero()).toBeUndefined();
    }));
  });

  describe('getHeroesByName', () => {
    it('should return computed heroes filtered by name', fakeAsync(() => {
      apiService.getAllHeroes.and.returnValue(Promise.resolve(mockHeroes));
      
      service.loadHeroes();
      tick();

      const heroes = service.getHeroesByName('super');
      expect(heroes()).toEqual([mockHeroes[0]]);
    }));

    it('should return empty array for non-matching name', fakeAsync(() => {
      apiService.getAllHeroes.and.returnValue(Promise.resolve(mockHeroes));
      
      service.loadHeroes();
      tick();

      const heroes = service.getHeroesByName('nonexistent');
      expect(heroes()).toEqual([]);
    }));

    it('should be case insensitive', fakeAsync(() => {
      apiService.getAllHeroes.and.returnValue(Promise.resolve(mockHeroes));
      
      service.loadHeroes();
      tick();

      const heroes = service.getHeroesByName('batman');
      expect(heroes()).toEqual([mockHeroes[1]]);
    }));
  });

  describe('getFilteredHeroes', () => {
    it('should return filtered heroes from API', fakeAsync(async () => {
      const filteredHeroes = [mockHeroes[0]];
      apiService.getHeroesByName.and.returnValue(Promise.resolve(filteredHeroes));

      const result = service.getFilteredHeroes('super');
      tick();

      expect(apiService.getHeroesByName).toHaveBeenCalledWith('super');
      expect(await result).toEqual(filteredHeroes);
    }));

    it('should handle API errors', fakeAsync(async () => {
      apiService.getHeroesByName.and.returnValue(Promise.reject(new Error('API Error')));

      const result = service.getFilteredHeroes('super');
      tick();

      expect(service.errorMessage()).toBe('Failed to filter heroes');
      expect(await result).toEqual([]);
    }));
  });

  describe('getHeroByIdFromApi', () => {
    it('should return hero by id from API', fakeAsync(async () => {
      apiService.getHeroById.and.returnValue(Promise.resolve(mockHero));

      const result = service.getHeroByIdFromApi(1);
      tick();

      expect(apiService.getHeroById).toHaveBeenCalledWith(1);
      expect(await result).toEqual(mockHero);
    }));

    it('should return null for non-existent hero', fakeAsync(async () => {
      apiService.getHeroById.and.returnValue(Promise.resolve(null));

      const result = service.getHeroByIdFromApi(999);
      tick();

      expect(await result).toBeNull();
    }));

    it('should handle API errors', fakeAsync(async () => {
      apiService.getHeroById.and.returnValue(Promise.reject(new Error('API Error')));

      const result = service.getHeroByIdFromApi(1);
      tick();

      expect(service.errorMessage()).toBe('Failed to get hero by ID');
      expect(await result).toBeNull();
    }));
  });

  describe('addHero', () => {
    it('should add hero successfully', fakeAsync(() => {
      const newHero = { name: 'NEW HERO', realName: 'New Person', universe: 'Marvel' as const };
      const createdHero = { ...newHero, id: 4 };
      
      apiService.createHero.and.returnValue(Promise.resolve(createdHero));
      apiService.getAllHeroes.and.returnValue(Promise.resolve(mockHeroes));

      service.loadHeroes();
      tick();

      service.addHero(newHero);
      tick();

      expect(apiService.createHero).toHaveBeenCalledWith(newHero);
      expect(service.heroesList()).toContain(createdHero);
      expect(service.isLoading()).toBeFalse();
    }));

    it('should handle API errors', fakeAsync(() => {
      const newHero = { name: 'NEW HERO', realName: 'New Person', universe: 'Marvel' as const };
      apiService.createHero.and.returnValue(Promise.reject(new Error('API Error')));

      service.addHero(newHero).catch(() => {});
      tick();

      expect(service.errorMessage()).toBe('Failed to add hero');
      expect(service.isLoading()).toBeFalse();
    }));
  });

  describe('updateHero', () => {
    it('should update hero successfully', fakeAsync(() => {
      const updatedHero = { ...mockHero, name: 'UPDATED SUPERMAN' };
      apiService.updateHero.and.returnValue(Promise.resolve(updatedHero));
      apiService.getAllHeroes.and.returnValue(Promise.resolve(mockHeroes));

      service.loadHeroes();
      tick();

      service.updateHero(updatedHero);
      tick();

      expect(apiService.updateHero).toHaveBeenCalledWith(updatedHero);
      expect(service.heroesList()).toContain(updatedHero);
      expect(service.isLoading()).toBeFalse();
    }));

    it('should handle API errors', fakeAsync(() => {
      const updatedHero = { ...mockHero, name: 'UPDATED SUPERMAN' };
      apiService.updateHero.and.returnValue(Promise.reject(new Error('API Error')));

      service.updateHero(updatedHero).catch(() => {});
      tick();

      expect(service.errorMessage()).toBe('Failed to update hero');
      expect(service.isLoading()).toBeFalse();
    }));
  });

  describe('deleteHero', () => {
    it('should delete hero successfully', fakeAsync(() => {
      apiService.deleteHero.and.returnValue(Promise.resolve());
      apiService.getAllHeroes.and.returnValue(Promise.resolve(mockHeroes));

      service.loadHeroes();
      tick();

      service.deleteHero(1);
      tick();

      expect(apiService.deleteHero).toHaveBeenCalledWith(1);
      expect(service.heroesList()).not.toContain(mockHeroes[0]);
      expect(service.isLoading()).toBeFalse();
    }));

    it('should handle API errors', fakeAsync(() => {
      apiService.deleteHero.and.returnValue(Promise.reject(new Error('API Error')));

      service.deleteHero(1).catch(() => {});
      tick();

      expect(service.errorMessage()).toBe('Failed to delete hero');
      expect(service.isLoading()).toBeFalse();
    }));
  });

  describe('getHeroesPaginated', () => {
    it('should return paginated heroes', fakeAsync(async () => {
      const paginatedResult = {
        heroes: mockHeroes.slice(0, 2),
        total: mockHeroes.length,
        page: 1,
        totalPages: 2
      };
      apiService.getHeroesPaginated.and.returnValue(Promise.resolve(paginatedResult));

      const result = service.getHeroesPaginated(1, 2);
      tick();

      expect(apiService.getHeroesPaginated).toHaveBeenCalledWith(1, 2);
      expect(await result).toEqual(paginatedResult);
    }));

    it('should handle API errors', fakeAsync(() => {
      apiService.getHeroesPaginated.and.returnValue(Promise.reject(new Error('API Error')));

      service.getHeroesPaginated(1, 2).catch(() => {});
      tick();

      expect(service.errorMessage()).toBe('Failed to load paginated heroes');
      expect(service.isLoading()).toBeFalse();
    }));
  });

  describe('clearError', () => {
    it('should clear error message', () => {
      service['error'].set('Test error');
      expect(service.errorMessage()).toBe('Test error');

      service.clearError();
      expect(service.errorMessage()).toBeNull();
    });
  });


  describe('LocalStorage operations', () => {
    it('should save heroes to localStorage', fakeAsync(() => {
      apiService.getAllHeroes.and.returnValue(Promise.resolve(mockHeroes));

      service.loadHeroes();
      tick();

      const stored = localStorage.getItem('super-heroes');
      expect(stored).toBe(JSON.stringify(mockHeroes));
    }));

    it('should handle localStorage save errors', fakeAsync(() => {
      spyOn(localStorage, 'setItem').and.throwError('Storage error');
      apiService.getAllHeroes.and.returnValue(Promise.resolve(mockHeroes));

      service.loadHeroes();
      tick();

      // Should not throw error and should still load heroes
      expect(service.heroesList()).toEqual(mockHeroes);
    }));

    it('should handle localStorage load errors', fakeAsync(() => {
      spyOn(localStorage, 'getItem').and.throwError('Storage error');
      apiService.getAllHeroes.and.returnValue(Promise.resolve(mockHeroes));

      service.loadHeroes();
      tick();

      expect(service.heroesList()).toEqual(mockHeroes);
    }));
  });

  describe('Loading states', () => {
    it('should set loading to true during API operations', fakeAsync(() => {
      apiService.getAllHeroes.and.returnValue(Promise.resolve(mockHeroes));

      service.loadHeroes();
      expect(service.isLoading()).toBeTrue();

      tick();
      expect(service.isLoading()).toBeFalse();
    }));

    it('should set loading to false even when API fails', fakeAsync(() => {
      apiService.getAllHeroes.and.returnValue(Promise.reject(new Error('API Error')));

      service.loadHeroes();
      expect(service.isLoading()).toBeTrue();

      tick();
      expect(service.isLoading()).toBeFalse();
    }));
  });

  describe('Signal reactivity', () => {
    it('should update heroes list signal when heroes change', fakeAsync(() => {
      apiService.getAllHeroes.and.returnValue(Promise.resolve(mockHeroes));

      service.loadHeroes();
      tick();

      expect(service.heroesList()).toEqual(mockHeroes);

      // Update heroes
      const updatedHeroes = [...mockHeroes, { id: 4, name: 'NEW HERO', realName: 'New Person', universe: 'Marvel' as const }];
      service['heroes'].set(updatedHeroes);

      expect(service.heroesList()).toEqual(updatedHeroes);
    }));
  });
}); 