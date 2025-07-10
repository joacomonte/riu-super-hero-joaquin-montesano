import { Component, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";

export type FilterEvent =
  | { type: "search"; payload: number }
  | { type: "clear" };

@Component({
  selector: "app-hero-id-filter",
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
          (keyup.enter)="searchHero()"
        />
        <div class="input-icons">
          @if (idControl.value) {
          <button
            class="icon-btn find-icon"
            (click)="searchHero()"
            title="Find hero"
          >
            🔍
          </button>
          <button
            class="icon-btn clear-icon"
            (click)="clearFilter()"
            title="Clear"
          >
            ✕
          </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
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
    `,
  ],
})
export class HeroIdFilterComponent {
  @Output() filterChange = new EventEmitter<FilterEvent>();
  idControl = new FormControl<number | null>(null);

  searchHero() {
    const id = this.idControl.value;
    if (!id) return;

    this.filterChange.emit({ type: "search", payload: id });
  }

  clearFilter() {
    this.idControl.setValue(null);
    this.filterChange.emit({ type: "clear" });
  }

  getCurrentId(): number | null {
    return this.idControl.value;
  }
}
