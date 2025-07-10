import {
  Component,
  computed,
  signal,
  inject,
  ViewChild,
  OnInit,
  effect,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { SuperHeroService } from "../../../core/services/super-hero.service";
import { ConfirmationDialogComponent } from "../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { HeroFilterComponent } from "../../../shared/components/hero-filter/hero-filter.component";
import {
  FilterEvent,
  HeroIdFilterComponent,
} from "../../../shared/components/hero-id-filter/hero-id-filter.component";
import { SuperHero } from "../../../core/models/super-hero.model";

@Component({
  selector: "app-hero-list",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ConfirmationDialogComponent,
    HeroFilterComponent,
    HeroIdFilterComponent,
  ],
  templateUrl: "./hero-list.component.html",
  styleUrls: ["./hero-list.component.scss"],
})
export class HeroListComponent implements OnInit {
  private superHeroService = inject(SuperHeroService);

  @ViewChild("confirmationDialog")
  confirmationDialog!: ConfirmationDialogComponent;

  // Pagination Signals
  currentPage = signal(0);
  pageSize = signal(5);

  // Dialog signals
  heroToDeleteId = signal<number | null>(null);
  heroToDeleteName = signal<string>("");

  // Hero data signals
  heroes = signal<SuperHero[]>([]);
  filteredHeroes = signal<SuperHero[]>([]);

  // ID filter state
  foundHeroById = signal<SuperHero | null>(null);
  isIdSearching = signal<boolean>(false);
  isIdSearchCompleted = signal<boolean>(false);

  // Loading states
  isLoading = signal<boolean>(false);
  isDeleting = signal<boolean>(false);

  displayHeroes = computed(() => {
    const foundHero = this.foundHeroById();
    if (foundHero) {
      return [foundHero];
    }
    // If ID search was completed and no hero was found, return empty array
    if (this.isIdSearchCompleted() && this.foundHeroById() === null) {
      return [];
    }
    return this.filteredHeroes();
  });

  totalPages = computed(() => {
    const foundHero = this.foundHeroById();
    if (foundHero) {
      return 1;
    }
    return Math.ceil(this.filteredHeroes().length / this.pageSize());
  });

  paginatedHeroes = computed(() => {
    const foundHero = this.foundHeroById();
    if (foundHero) {
      return [foundHero];
    }
    // If ID search was completed and no hero was found, return empty array
    if (this.isIdSearchCompleted() && this.foundHeroById() === null) {
      return [];
    }
    const start = this.currentPage() * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredHeroes().slice(start, end);
  });

  constructor() {
    this.heroes.set([]);
    this.filteredHeroes.set([]);

    effect(() => {
      this.isLoading.set(this.superHeroService.isLoading());
    });

    effect(() => {
      const serviceHeroes = this.superHeroService.getHeroes()();
      this.heroes.set(serviceHeroes);
      this.filteredHeroes.set(serviceHeroes);
    });
  }

  ngOnInit() {
    this.superHeroService.loadHeroes().then(() => {
      const heroes = this.superHeroService.getHeroes()();
      this.heroes.set(heroes);
      this.filteredHeroes.set(heroes);
    });
  }

  nextPage() {
    this.currentPage.update((page) =>
      page + 1 < this.totalPages() ? page + 1 : page
    );
  }

  prevPage() {
    this.currentPage.update((page) => (page > 0 ? page - 1 : 0));
  }

  openDeleteDialog(id: number, name: string) {
    this.heroToDeleteId.set(id);
    this.heroToDeleteName.set(name);
    this.confirmationDialog.openDialog();
  }

  async confirmDelete() {
    const id = this.heroToDeleteId();
    if (id !== null) {
      this.isDeleting.set(true);
      try {
        await this.superHeroService.deleteHero(id);
        this.heroToDeleteId.set(null);
        this.heroToDeleteName.set("");
      } catch (error) {
        console.error("Error deleting hero:", error);
      } finally {
        this.isDeleting.set(false);
        this.currentPage.set(0);
      }
    }
  }

  cancelDelete() {
    this.heroToDeleteId.set(null);
    this.heroToDeleteName.set("");
  }

  async onFilteredHeroes(filter: string) {
    try {
      const heroes = await this.superHeroService.getFilteredHeroes(filter);
      this.filteredHeroes.set(heroes);
      this.foundHeroById.set(null);
      this.isIdSearchCompleted.set(false);
      this.currentPage.set(0);
    } catch (error) {
      console.error("Error filtering heroes:", error);
    }
  }

  async onFilterChange(event: FilterEvent) {
    switch (event.type) {
      case "search":
        this.isIdSearching.set(true);
        this.isIdSearchCompleted.set(false);
        
        const hero = await this.superHeroService.getHeroByIdFromApi(event.payload);
        
        this.foundHeroById.set(hero);
        this.isIdSearching.set(false);
        this.isIdSearchCompleted.set(true);
        
        if (hero) {
          this.currentPage.set(0);
        }
        break;
        
      case "clear":
        this.foundHeroById.set(null);
        this.isIdSearchCompleted.set(false);
        this.currentPage.set(0);
        break;
    }
  }

  clearLocalStorage() {
    this.superHeroService.clearLocalStorage();
    window.location.reload();
  }
}
