import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';
import { AuthGuard } from './auth/auth.guard';
import { RegisterComponent } from './auth/register.component';
import { ProductListComponent } from './products/product-list.component';
import { ProductDetailComponent } from './products/product-detail.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrdersComponent } from './orders/orders.component';

export const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailComponent },

  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'orders', component: OrdersComponent },

  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
  },

  { path: '**', redirectTo: '/products' },
];

