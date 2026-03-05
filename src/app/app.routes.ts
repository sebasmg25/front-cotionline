import { Routes } from '@angular/router';
import { hasBusinessGuard } from './contexts/business/guards/has-business.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/landingPage/landing-page/landing-page').then((m) => m.LandingPage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./contexts/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./ui/dashboard/dashboard/dashboard').then((m) => m.Dashboard),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./ui/dashboard/dashboard-summary/dashboard-summary').then(
            (m) => m.DashboardSummary,
          ),
      },
      {
        path: 'business/profile',
        loadComponent: () =>
          import('./contexts/business/views/edit-business/edit-business').then(
            (m) => m.EditBusiness,
          ),
      },
      {
        path: 'business/docs',
        loadComponent: () =>
          import('./contexts/business/views/business-docs/business-docs').then(
            (m) => m.BusinessDocs,
          ),
      },
      {
        path: 'branch',
        loadComponent: () =>
          import('./contexts/branch/views/register-branch/register-branch').then(
            (m) => m.RegisterBranch,
          ),
      },
      {
        path: 'branch/:businessId',
        loadComponent: () =>
          import('./contexts/branch/views/register-branch/register-branch').then(
            (m) => m.RegisterBranch,
          ),
      },
      {
        path: 'branch/edit/:id',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./contexts/branch/views/edit-branch/edit-branch').then(
            (m) => m.EditBranch,
          ),
      },
      {
        path: 'branches',
        canActivate: [hasBusinessGuard],
        loadComponent: () =>
          import('./contexts/branch/views/list-branches/list-branches').then(
            (m) => m.ListBranches,
          ),
      },
      {
        path: 'quotations',
        loadComponent: () =>
          import('./contexts/quotationRequest/views/dashboard-quotation/dashboard-quotation').then(
            (m) => m.DashboardQuotation,
          ),
      },
      {
        path: 'quotations/new',
        loadComponent: () =>
          import('./contexts/quotationRequest/views/register-quotation-request/register-quotation-request').then(
            (m) => m.RegisterQuotationRequest,
          ),
      },
      {
        path: 'quotations/detail/:id',
        loadComponent: () =>
          import('./contexts/quotationRequest/views/register-quotation-request/register-quotation-request').then(
            (m) => m.RegisterQuotationRequest,
          ), // Using register for edit for now to reuse forms
      },
      {
        path: 'quotations/published',
        loadComponent: () =>
          import('./contexts/quotationRequest/views/list-quotation-requests/list-quotation-requests').then(
            (m) => m.ListQuotationRequests,
          ),
      },
      {
        path: 'quotations/drafts',
        loadComponent: () =>
          import('./contexts/quotationRequest/views/list-quotation-requests/list-quotation-requests').then(
            (m) => m.ListQuotationRequests,
          ),
      },
      {
        path: 'updatePlan',
        loadComponent: () =>
          import('./contexts/updatePlan/update-plan/update-plan').then((m) => m.UpdatePlan),
      },
      {
        path: 'quotation-management',
        loadComponent: () =>
          import('./contexts/quotation/views/quotation-dashboard/quotation-dashboard').then(
            (m) => m.QuotationDashboard,
          ),
      },
      {
        path: 'quotation-management/respond/:requestId',
        loadComponent: () =>
          import('./contexts/quotation/views/quotation-response/quotation-response').then(
            (m) => m.QuotationResponse,
          ),
      },
      {
        path: 'quotation-management/edit/:quotationId',
        loadComponent: () =>
          import('./contexts/quotation/views/quotation-response/quotation-response').then(
            (m) => m.QuotationResponse,
          ),
      },
      {
        path: 'quotation-management/comparison',
        loadComponent: () =>
          import('./contexts/quotation/views/comparison-analysis/comparison-analysis').then(
            (m) => m.ComparisonAnalysis,
          ),
      },
      {
        path: 'collaborators',
        loadComponent: () =>
          import('./contexts/collaborator/views/collaborator-management/collaborator-management').then(
            (m) => m.CollaboratorManagement,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./contexts/user/views/edit-user/edit-user').then(
            (m) => m.EditUser,
          ),
      },
      {
        path: 'profile/change-password',
        loadComponent: () =>
          import('./contexts/user/views/change-password/change-password').then(
            (m) => m.ChangePassword,
          ),
      },
      {
        path: 'profile/notifications',
        loadComponent: () =>
          import('./contexts/user/views/notification-settings/notification-settings').then(
            (m) => m.NotificationSettings,
          ),
      },
      {
        path: 'profile/subscription',
        loadComponent: () =>
          import('./contexts/user/views/subscription-details/subscription-details').then(
            (m) => m.SubscriptionDetails,
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./contexts/user/views/notification-center/notification-center').then(
            (m) => m.NotificationCenter,
          ),
      },
      {
        path: 'guides',
        loadComponent: () =>
          import('./ui/dashboard/guide-center/guide-center').then(
            (m) => m.GuideCenter,
          ),
      },
    ]
  },
  {
    path: 'register-business',
    loadComponent: () =>
      import('./contexts/business/views/register-business/register-business').then(
        (m) => m.RegisterBusiness,
      ),
  },
  {
    path: 'upload-docs',
    loadComponent: () =>
      import('./contexts/business/views/upload-docs/upload-docs').then(
        (m) => m.UploadBusinessDocs,
      ),
  },
];
