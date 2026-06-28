import { Directive, ElementRef, HostListener, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Máscara de moeda BRL para inputs de texto, integrada ao ngModel via
 * ControlValueAccessor. O valor exposto ao formulário é sempre um NÚMERO
 * (ex.: 10000), enquanto o input exibe "R$ 10.000,00".
 *
 * Abordagem "centavos": todos os dígitos digitados são tratados como centavos
 * (os dois últimos), então digitar "1000000" resulta em R$ 10.000,00.
 */
@Directive({
  selector: '[appCurrencyMask]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyMaskDirective),
      multi: true,
    },
  ],
})
export class CurrencyMaskDirective implements ControlValueAccessor {
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);

  private readonly fmt = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');

    if (!digits) {
      input.value = '';
      this.onChange(null);
      return;
    }

    const value = parseInt(digits, 10) / 100;
    input.value = this.fmt.format(value);
    this.onChange(value);
    // mantém o cursor no fim após a reformatação
    const end = input.value.length;
    input.setSelectionRange(end, end);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: number | null): void {
    this.el.nativeElement.value =
      value == null || isNaN(value) ? '' : this.fmt.format(value);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }
}
