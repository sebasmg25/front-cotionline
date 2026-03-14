import { Routes } from '@angular/router';
import { authGuard } from './infraestructure/shared/guards/auth.guard';
import { hasBusinessGuard } from './contexts/business/guards/has-business.guard';
import { ownerOnlyGuard } from './infraestructure/shared/guards/owner-only.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/landingPage/landing-page/landing-page').then((m) => m.LandingPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./contexts/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./contexts/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'collaborators/accept/:id',
    loadComponent: () =>
      import('./contexts/collaborator/views/accept-invitation/accept-invitation').then(
        (m) => m.AcceptInvitation,
      ),
  },
  {
    path: 'collaborators/reject/:id',
    loadComponent: () =>
      import('./contexts/collaborator/views/reject-invitation/reject-invitation').then(
        (m) => m.RejectInvitation,
      ),
  },

  // --- FLUJO DE REGISTRO DE NEGOCIO ---
  {
    path: 'register-business',
    canActivate: [authGuard, ownerOnlyGuard],
    loadComponent: () =>
      import('./contexts/business/views/register-business/register-business').then(
        (m) => m.RegisterBusiness,
      ),
  },
  {
    path: 'upload-docs',
    canActivate: [authGuard, ownerOnlyGuard],
    loadComponent: () =>
      import('./contexts/business/views/upload-docs/upload-docs').then((m) => m.UploadBusinessDocs),
  },

  // --- DASHBOARD Y RUTAS PROTEGIDAS ---
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./ui/dashboard/dashboard/dashboard').then((m) => m.Dashboard),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./ui/dashboard/dashboard-summary/dashboard-summary').then(
            (m) => m.DashboardSummary,
          ),
      },

      // --- AJUSTES DE NEGOCIO ---
      {
        path: 'business/profile',
        canActivate: [ownerOnlyGuard],
        loadComponent: () =>
          import('./contexts/business/views/edit-business/edit-business').then(
            (m) => m.EditBusiness,
          ),
      },
      {
        path: 'business/docs',
        canActivate: [ownerOnlyGuard],
        loadComponent: () =>
          import('./contexts/business/views/business-docs/business-docs').then(
            (m) => m.BusinessDocs,
          ),
      },

      // --- SEDES ---
      {
        path: 'branches',
        canActivate: [hasBusinessGuard, ownerOnlyGuard],
        loadComponent: () =>
          import('./contexts/branch/views/list-branches/list-branches').then((m) => m.ListBranches),
      },
      {
        path: 'branch-register',
        canActivate: [hasBusinessGuard, ownerOnlyGuard],
        loadComponent: () =>
          import('./contexts/branch/views/register-branch/register-branch').then(
            (m) => m.RegisterBranch,
          ),
      },
      {
        path: 'branch-edit/:id',
        canActivate: [hasBusinessGuard, ownerOnlyGuard],
        loadComponent: () =>
          import('./contexts/branch/views/edit-branch/edit-branch').then((m) => m.EditBranch),
      },

      // --- SOLICITUDES (QUOTATION REQUESTS) ---
      {
        path: 'quotations',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./contexts/quotationRequest/views/dashboard-quotation/dashboard-quotation').then(
            (m) => m.DashboardQuotation,
          ),
      },
      {
        path: 'quotations/new',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./contexts/quotationRequest/views/register-quotation-request/register-quotation-request').then(
            (m) => m.RegisterQuotationRequest,
          ),
      },
      {
        path: 'quotations/edit/:id',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./contexts/quotationRequest/views/register-quotation-request/register-quotation-request').then(
            (m) => m.RegisterQuotationRequest,
          ),
      },
      {
        path: 'quotations/detail/:id',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./contexts/quotationRequest/views/view-quotation-request/view-quotation-request').then(
            (m) => m.ViewQuotationRequest,
          ),
      },
      {
        path: 'quotations/published',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./contexts/quotationRequest/views/list-quotation-requests/list-quotation-requests').then(
            (m) => m.ListQuotationRequests,
          ),
      },
      {
        path: 'quotations/drafts',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./contexts/quotationRequest/views/list-quotation-requests/list-quotation-requests').then(
            (m) => m.ListQuotationRequests,
          ),
      },
      {
        path: 'quotations/marketplace',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./contexts/quotationRequest/views/marketplace-requests/marketplace-requests').then(
            (m) => m.MarketplaceRequests,
          ),
      },

      // --- PRODUCTOS (NUEVA SECCIÓN CONTEXTUAL) ---
      {
        // Ruta para listar productos de una solicitud específica
        path: 'quotations/:quotationRequestId/products',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./contexts/product/views/list-products/list-products').then(
            (m) => m.ListProducts,
          ),
      },
      {
        // Ruta para editar un producto específico
        path: 'products/edit/:id',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./contexts/product/views/edit-product/edit-product').then((m) => m.EditProduct),
      },

      // --- COTIZACIONES Y PLAN ---
      {
        path: 'updatePlan',
        canActivate: [hasBusinessGuard, ownerOnlyGuard],
        loadComponent: () =>
          import('./contexts/updatePlan/update-plan/update-plan').then((m) => m.UpdatePlan),
      },
      {
        path: 'quotation-management',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./contexts/quotation/views/quotation-dashboard/quotation-dashboard').then(
            (m) => m.QuotationDashboard,
          ),
      },
      {
        path: 'quotation-management/respond/:requestId',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./contexts/quotation/views/quotation-response/quotation-response').then(
            (m) => m.QuotationResponse,
          ),
      },
      {
        path: 'quotation-management/edit/:quotationId',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./contexts/quotation/views/quotation-response/quotation-response').then(
            (m) => m.QuotationResponse,
          ),
      },
      {
        path: 'quotation-management/detail/:quotationId',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./contexts/quotation/views/quotation-response/quotation-response').then(
            (m) => m.QuotationResponse,
          ),
      },
      {
        path: 'quotation-management/comparison',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./contexts/quotation/views/comparison-analysis/comparison-analysis').then(
            (m) => m.ComparisonAnalysis,
          ),
      },
      {
        path: 'quotation-management/comparison/:requestId',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./contexts/quotation/views/comparison-analysis/comparison-analysis').then(
            (m) => m.ComparisonAnalysis,
          ),
      },

      // --- COLABORADORES Y NOTIFICACIONES ---
      {
        path: 'collaborators',
        canActivate: [hasBusinessGuard, ownerOnlyGuard],
        loadComponent: () =>
          import('./contexts/collaborator/views/collaborator-management/collaborator-management').then(
            (m) => m.CollaboratorManagement,
          ),
      },
      {
        path: 'notifications',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./contexts/user/views/notification-center/notification-center').then(
            (m) => m.NotificationCenter,
          ),
      },
      {
        path: 'notifications/:id',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./contexts/user/views/notification-detail/notification-detail').then(
            (m) => m.NotificationDetail,
          ),
      },

      // --- AYUDA ---
      {
        path: 'guides',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./ui/dashboard/guide-center/guide-center').then((m) => m.GuideCenter),
      },

      // --- PERFIL DE USUARIO ---
      {
        path: 'profile',
        loadComponent: () =>
          import('./contexts/user/views/edit-user/edit-user').then((m) => m.EditUser),
      },
      {
        path: 'profile/change-password',
        loadComponent: () =>
          import('./contexts/user/views/change-password/change-password').then(
            (m) => m.ChangePassword,
          ),
      },
      {
        path: 'profile/subscription',
        loadComponent: () =>
          import('./contexts/user/views/subscription-details/subscription-details').then(
            (m) => m.SubscriptionDetails,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
