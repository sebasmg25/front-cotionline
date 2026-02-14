import { Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPipe } from '@angular/common'; // Necesario para formatear la moneda

// Definición de la estructura de precios para la lógica
interface PlanPrice {
  id: string;
  name: string;
  monthly: number;
  annual: number;
}

@Component({
  selector: 'app-update-plan',
  imports: [MatCardModule, MatIconModule, MatButtonModule, CurrencyPipe],
  templateUrl: './update-plan.html',
  styleUrl: './update-plan.css',
})
export class UpdatePlan {
  // Configuración de los precios base y cálculo del descuento (15%)
  private readonly PRICE_DATA: PlanPrice[] = [
    {
      id: 'basico',
      name: 'Básico',
      monthly: 20000,
      annual: this.calculateAnnualPrice(20000, 0.15),
    },
    {
      id: 'premium',
      name: 'Premium',
      monthly: 35000,
      annual: this.calculateAnnualPrice(35000, 0.15),
    },
  ];

  // Señal para rastrear el ciclo de facturación: 'mensual' o 'anual' (inicia en mensual)
  billingCycle = signal<'mensual' | 'anual'>('mensual');

  // Constante para el porcentaje de descuento
  readonly DISCOUNT_PERCENTAGE = 0.15;

  /**
   * Calcula el precio total anual aplicando un descuento.
   * @param monthlyPrice El precio mensual base.
   * @param discountRate La tasa de descuento (ej: 0.15 para 15%).
   * @returns El precio anual con el descuento aplicado, redondeado.
   */
  private calculateAnnualPrice(monthlyPrice: number, discountRate: number): number {
    const annualPriceBeforeDiscount = monthlyPrice * 12;
    // Usamos Math.round para evitar decimales en la moneda local
    return Math.round(annualPriceBeforeDiscount * (1 - discountRate));
  }

  /**
   * Obtiene el precio actual (mensual o anual) para un plan específico.
   * @param planId El identificador del plan ('basico' o 'premium').
   * @returns El precio actual.
   */
  getCurrentPrice(planId: string): number {
    const plan = this.PRICE_DATA.find((p) => p.id === planId);
    if (!plan) return 0;

    return this.billingCycle() === 'mensual' ? plan.monthly : plan.annual;
  }

  /**
   * Obtiene el precio mensual original para mostrar el ahorro anual.
   * @param planId El identificador del plan.
   * @returns El precio mensual original.
   */
  getOriginalMonthlyPrice(planId: string): number {
    const plan = this.PRICE_DATA.find((p) => p.id === planId);
    return plan ? plan.monthly : 0;
  }

  /**
   * Cambia el ciclo de facturación.
   * @param cycle El nuevo ciclo de facturación ('mensual' o 'anual').
   */
  selectBillingCycle(cycle: 'mensual' | 'anual'): void {
    this.billingCycle.set(cycle);
  }
}
