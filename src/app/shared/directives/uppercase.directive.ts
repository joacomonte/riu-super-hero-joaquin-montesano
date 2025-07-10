import { Directive, ElementRef, HostListener, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appUppercase]',
  standalone: true
})
export class UppercaseDirective {
  constructor(private el: ElementRef, @Self() private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInputChange(event: Event) {
    const uppercaseValue = this.el.nativeElement.value.toUpperCase();
    this.ngControl.control?.setValue(uppercaseValue, { emitEvent: false });
  }
}