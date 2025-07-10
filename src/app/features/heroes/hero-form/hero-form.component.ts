import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SuperHeroService } from '../../../core/services/super-hero.service';
import { UppercaseDirective } from '../../../shared/directives/uppercase.directive';

@Component({
  selector: 'app-hero-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    UppercaseDirective,
  ],
  templateUrl: './hero-form.component.html',
  styleUrls: ['./hero-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private superHeroService = inject(SuperHeroService);

  heroForm!: FormGroup;
  isEditMode = signal(false);
  isSubmitting = signal(false);
  private heroId: number | null = null;

  ngOnInit() {
    this.heroForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s\-']+$/),
        ],
      ],
      realName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s\-']+$/),
        ],
      ],
      universe: [
        'Marvel',
        [Validators.required, Validators.pattern(/^(DC|Marvel|Other)$/)],
      ],
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.heroId = +id;
        const hero = this.superHeroService.getHeroById(this.heroId)();
        if (hero) {
          this.heroForm.patchValue(hero);
        }
      }
    });
  }

  async onSubmit() {
    if (this.heroForm.invalid) return;

    this.isSubmitting.set(true);

    try {
      if (this.isEditMode()) {
        await this.superHeroService.updateHero({
          ...this.heroForm.value,
          id: this.heroId,
        });
      } else {
        await this.superHeroService.addHero(this.heroForm.value);
      }
      this.router.navigate(['/heroes']);
    } catch (error) {
      console.error('Error saving hero:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
