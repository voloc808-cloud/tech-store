import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';
import { AuthGuard } from './auth/auth.guard';
import { RegisterComponent } from './auth/register.component';
import { ProductListComponent } from './products/product-list.component';
import { ProductDetailComponent } from './products/product-detail.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';

// THÊM 2 COMPONENT MỚI CHO LUỒNG THANH TOÁN
import { Payment } from './pages/payment/payment';
import { OrderSuccess } from './pages/order-success/order-success';

export const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'products', component: ProductListComponent },
  
  // 🌟 ĐÃ SỬA: Giữ nguyên cấu trúc thêm /detail/ vào path để khớp 100% với URL thực tế ngoài trình duyệt
  { path: 'products/detail/:id', component: ProductDetailComponent },

  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },

  // LUỒNG THANH TOÁN (PAYMENT FLOW)
  { path: 'payment/:orderCode', component: Payment },

  // Trang báo hoàn tất đơn hàng thành công
  { path: 'order-success/:orderCode', component: OrderSuccess },

  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
  },

  // Đường dẫn dự phòng quay về danh sách nếu gõ sai URL
  { path: '**', redirectTo: '/products' },
];