import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';
import { AuthGuard } from './auth/auth.guard';
import { RegisterComponent } from './auth/register.component';
import { ProductListComponent } from './products/product-list.component';
import { ProductDetailComponent } from './products/product-detail.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';

//  THÊM 2 COMPONENT MỚI( ý) 
import { Payment } from './pages/payment/payment';
import { OrderSuccess } from './pages/order-success/order-success';

export const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'products', component: ProductListComponent },
  
  // 🌟 ĐÃ SỬA: Thêm /detail/ vào path để khớp 100% với URL thực tế 'products/detail/6a328b0e...' ngoài trình duyệt
  { path: 'products/detail/:id', component: ProductDetailComponent },

  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },

  //  PAYMENT FLOW (BẮT BUỘC THÊM) ( ý) 
  { path: 'payment/:orderCode', component: Payment },

  // (OPTIONAL) trang hoàn tất
  { path: 'order-success/:orderCode', component: OrderSuccess },

  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
  },

  { path: '**', redirectTo: '/products' },
<<<<<<< HEAD
];
=======
];
>>>>>>> 2b5dfcb93015d1b56c67f96d9042c06aa676b5ab
