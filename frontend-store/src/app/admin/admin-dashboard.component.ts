import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../services/product';
import { AuthService } from '../auth/auth.service';
import { AdminTabsComponent } from './admin-tabs.component';
import { AdminTab } from './admin.types';
import { OrderService } from '../services/order.service';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminTabsComponent],

  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  activeTab: AdminTab = 'products';

  // Users (register mock)
  registeredUsers: string[] = [];


  // Products CRUD
  products: any[] = [];
  loading = false;
  error: string | null = null;

  mode: 'create' | 'edit' = 'create';
  editId: number | null = null;

  form = {
    name: '',
    price: 0,
    stock: 0,
    image: null as string | null, // lưu base64 dataURL
  };

  previewImage: string | null = null;

  onImageSelected(event: Event) {
    // reset any previous error
    this.error = null;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error = 'File không đúng định dạng ảnh';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const dataUrl = typeof result === 'string' ? result : null;
      this.form.image = dataUrl;
      this.previewImage = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  // Orders
  orders: any[] = [];
  ordersLoading = false;

  constructor(
    private productService: ProductService,
    public auth: AuthService,
    public router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadProducts();

    // Lắng nghe event tab từ AdminTabsComponent
    window.addEventListener('admin:tab', (ev: any) => {
      const tab = ev?.detail as AdminTab;
      if (!tab) return;

      this.activeTab = tab;
      if (tab === 'orders' && this.orders.length === 0) {
        this.loadOrders();
      }
    });
  }



  loadProducts() {
    this.loading = true;
    this.error = null;

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message ?? 'Cannot load products';
        this.loading = false;
      },
    });
  }

  loadOrders() {
    this.ordersLoading = true;
    this.orders = [];

    this.orders = this.orderService.listOrders();
    this.ordersLoading = false;
  }

  resetForm() {
    this.mode = 'create';
    this.editId = null;
    this.previewImage = null;
    this.form = { name: '', price: 0, stock: 0, image: null };
  }

  startEdit(p: any) {
    this.mode = 'edit';
    this.editId = p.id;
    this.previewImage = p.image ?? null;
    this.form = {
      name: p.name ?? '',
      price: Number(p.price ?? 0),
      stock: Number(p.stock ?? 0),
      image: p.image ?? null,
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  submit() {
    this.error = null;

    if (!this.form.name.trim()) {
      this.error = 'Tên sản phẩm không được rỗng';
      return;
    }

    if (this.mode === 'create') {
      this.productService
        .addProduct({
          name: this.form.name.trim(),
          price: Number(this.form.price),
          stock: Number(this.form.stock),
          image: this.form.image,
        })
        .subscribe({
          next: () => {
            this.resetForm();
            this.loadProducts();
            window.dispatchEvent(new Event('products:changed'));
          },
          error: (err) => {
            this.error = err?.message ?? 'Create failed';
          },
        });
    } else {
      if (this.editId == null) return;

      this.productService
        .updateProduct({
          id: this.editId,
          name: this.form.name.trim(),
          price: Number(this.form.price),
          stock: Number(this.form.stock),
          image: this.form.image,
        })
        .subscribe({
          next: () => {
            this.resetForm();
            this.loadProducts();
            window.dispatchEvent(new Event('products:changed'));
          },
          error: (err) => {
            this.error = err?.message ?? 'Update failed';
          },
        });
    }
  }

  deleteProduct(id: number) {
    if (!confirm(`Xóa sản phẩm id=${id}?`)) return;

    this.error = null;

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        // Server mock không trả về products, nên cần reload danh sách
        this.loadProducts();
        window.dispatchEvent(new Event('products:changed'));
      },
      error: (err) => {
        this.error = err?.message ?? 'Delete failed';
      },
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}


