import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { finalize, timeout } from 'rxjs/operators';
import { ProductService } from '../services/product';
import { CartService } from '../services/cart.service';
import { AuthService } from '../auth/auth.service';
import { FormsModule } from '@angular/forms';

type ProductsChangedEvent = Event;

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: any[] = [];
  allProducts: any[] = [];
  searchTerm: string = '';
  loading = false;
  error: string | null = null;

  private sub?: Subscription;
  private productsChangedHandler?: () => void;

  constructor(
    private productService: ProductService,
    public router: Router,
    private cart: CartService,
    public auth: AuthService,
  ) {}

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.products = [...this.allProducts]; // Nếu để trống thì hiện lại toàn bộ
    } else {
      const term = this.searchTerm.toLowerCase();
      this.products = this.allProducts.filter((p) => p.name.toLowerCase().includes(term));
    }
  }

  resetAndGoHome() {
    this.searchTerm = ''; // Xóa chữ trong ô tìm kiếm
    this.products = [...this.allProducts]; // Trả lại toàn bộ danh sách
    this.router.navigateByUrl('/products'); // Điều hướng về trang danh sách
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get username(): string {
    return this.auth.getCurrentUser()?.username ?? '';
  }

  get cartCount(): number {
    return this.cart.getTotalItems();
  }

  ngOnInit(): void {
    this.load();

    // Reload dữ liệu mỗi khi navigate về /products
    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        if (e.urlAfterRedirects === '/products') {
          this.load();
        }
      });

    // Reload ngay khi admin thay đổi dữ liệu
    this.productsChangedHandler = () => this.load();
    window.addEventListener('products:changed', this.productsChangedHandler as any);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.productsChangedHandler) {
      window.removeEventListener('products:changed', this.productsChangedHandler as any);
    }
  }

  goCart() {
    this.router.navigateByUrl('/cart');
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/products');
  }

  private load(): void {
    // Tránh reload trùng lặp khi đang fetch
    if (this.loading) return;

    // Kiểm tra cache (dữ liệu trong 60s)
    const cacheKey = 'techstore.products.cache.v1';
    const cacheRaw = localStorage.getItem(cacheKey);

    if (cacheRaw) {
      try {
        const cache = JSON.parse(cacheRaw) as { ts: number; data: any };
        if (cache?.data && typeof cache.ts === 'number' && Date.now() - cache.ts < 60000) {
          this.allProducts = Array.isArray(cache.data) ? cache.data : cache.data?.data;
          this.products = [...this.allProducts]; // Hiển thị tất cả khi load xong
          this.loading = false;
          this.error = null;
          return;
        }
      } catch {
        // Bỏ qua lỗi parse cache
      }
    }

    this.loading = true;
    this.error = null;

    this.productService
      .getProducts()
      .pipe(
        timeout({ each: 10000 }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: (data: any) => {
          const list = Array.isArray(data) ? data : data?.data;
          // Lưu toàn bộ vào allProducts để phục vụ tìm kiếm
          this.allProducts = Array.isArray(list) ? list : [];
          // Gán vào products để hiển thị lên grid
          this.products = [...this.allProducts];

          // Lưu vào cache
          try {
            localStorage.setItem(
              cacheKey,
              JSON.stringify({ ts: Date.now(), data: this.allProducts }),
            );
          } catch {
            // Bỏ qua nếu localStorage bị chặn
          }

          if (this.products.length === 0) {
            this.error = 'Không thấy sản phẩm nào.';
          }
        },
        error: (err: any) => {
          this.error = err?.message ?? 'Không tải được sản phẩm';
        },
      });
  }

  openDetail(id: number): void {
    this.router.navigateByUrl(`/products/${id}`);
  }

  addToCart(product: any) {
    this.cart.addToCart(product, 1);
  }
}
