import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { SuperHeroService } from '../../../core/services/super-hero.service';
import { SuperHeroApiService } from '../../../core/services/super-hero-api.service';

import { HeroFormComponent } from './hero-form.component';

describe('HeroFormComponent', () => {
  let component: HeroFormComponent;
  let fixture: ComponentFixture<HeroFormComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockSuperHeroService: jasmine.SpyObj<SuperHeroService>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      paramMap: of({ get: () => null })
    });
    const superHeroServiceSpy = jasmine.createSpyObj('SuperHeroService', ['getHeroById', 'addHero', 'updateHero']);

    await TestBed.configureTestingModule({
      imports: [HeroFormComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: SuperHeroService, useValue: superHeroServiceSpy },
        { provide: SuperHeroApiService, useValue: jasmine.createSpyObj('SuperHeroApiService', ['getAllHeroes', 'getHeroById', 'createHero', 'updateHero', 'deleteHero']) }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroFormComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockActivatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    mockSuperHeroService = TestBed.inject(SuperHeroService) as jasmine.SpyObj<SuperHeroService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
