import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/landingPage/landing-page/landing-page').then((m) => m.LandingPage),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./ui/dashboard/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'dashboard/business',
    loadComponent: () =>
      import('./contexts/business/views/register-business/register-business').then(
        (m) => m.RegisterBusiness,
      ),
  },
  {
    path: 'dashboard/branch', // Para el botón manual (sin ID aún)
    loadComponent: () =>
      import('./contexts/branch/views/register-branch/register-branch').then(
        (m) => m.RegisterBranch,
      ),
  },
  {
    path: 'dashboard/branch/:businessId', // Para el salto automático (con ID)
    loadComponent: () =>
      import('./contexts/branch/views/register-branch/register-branch').then(
        (m) => m.RegisterBranch,
      ),
  },
  {
    path: 'dashboard/quotationRequest',
    loadComponent: () =>
      import('./contexts/quotationRequest/views/register-quotation-request/register-quotation-request').then(
        (m) => m.RegisterQuotationRequest,
      ),
  },
  {
    path: 'dashboard/updatePlan',
    loadComponent: () =>
      import('./contexts/updatePlan/update-plan/update-plan').then((m) => m.UpdatePlan),
  },
];
