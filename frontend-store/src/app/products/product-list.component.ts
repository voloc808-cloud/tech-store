import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription, Subject } from 'rxjs';
import { finalize, timeout, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { ProductService } from '../services/product';
import { CartService } from '../services/cart.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: any[] = [];
  loading = false;
  error: string | null = null;
  currentKeyword = '';

  // Quản lý luồng dữ liệu nhập vào ô tìm kiếm
  private searchSubject = new Subject<string>();
  private sub?: Subscription;
  private productsChangedHandler?: () => void;

  constructor(
    private productService: ProductService,
    public router: Router,
    private cart: CartService,
    public auth: AuthService
  ) {}

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
    // 1. KHỞI TẠO LUỒNG TÌM KIẾM THÔNG MINH (CHỐNG TREO LOADING)
    this.searchSubject.pipe(
      debounceTime(300),        // Đợi 300ms sau khi dừng gõ mới bắt đầu xử lý
      distinctUntilChanged(),   // Chỉ gọi API nếu từ khóa khác với từ khóa vừa gõ trước đó
      tap((keyword) => {
        this.loading = true;
        this.error = null;
        this.currentKeyword = keyword;
      }),
      switchMap((keyword) => 
        // switchMap sẽ tự động HỦY request cũ nếu có request mới đè lên
        this.productService.getProducts(keyword).pipe(
          timeout({ each: 10000 }),
          finalize(() => {
            this.loading = false;
          })
        )
      )
    ).subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : data?.data;
        this.products = Array.isArray(list) ? list : [];

        if (this.products.length === 0 && this.currentKeyword) {
          this.error = `Không tìm thấy sản phẩm nào phù hợp với từ khóa "${this.currentKeyword}".`;
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.name === 'TimeoutError' 
          ? 'Quá thời gian tải sản phẩm.' 
          : 'Không tải được sản phẩm';
      }
    });

    // Tải dữ liệu mặc định ban đầu
    this.load();

    // Reload dữ liệu mỗi khi điều hướng về /products
    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        if (e.urlAfterRedirects === '/products') {
          this.currentKeyword = '';
          this.load();
        }
      });

    this.productsChangedHandler = () => this.load(this.currentKeyword);
    window.addEventListener('products:changed', this.productsChangedHandler as any);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.searchSubject.complete(); // Đóng luồng tìm kiếm để tránh rò rỉ bộ nhớ
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

  // ==================== SỬA HÀM ONSEARCH: ĐẨY TỪ KHÓA VÀO LUỒNG XỬ LÝ ====================
  onSearch(event: any): void {
    const keyword = event.target.value.trim();
    
    if (keyword === '') {
      this.currentKeyword = '';
      this.load(); // Nếu xóa hết chữ, tải lại danh sách gốc (dùng cache)
    } else {
      this.searchSubject.next(keyword); // Đẩy từ khóa vào bộ lọc xử lý thông minh
    }
  }

  // Hàm tải dữ liệu mặc định (dùng cache LocalStorage)
  private load(keyword: string = ''): void {
    if (this.loading) return;

    if (!keyword) {
      const cacheKey = 'techstore.products.cache.v1';
      const cacheRaw = localStorage.getItem(cacheKey);
      if (cacheRaw) {
        try {
          const cache = JSON.parse(cacheRaw) as { ts: number; data: any };
          if (cache?.data && typeof cache.ts === 'number' && Date.now() - cache.ts < 60000) {
            this.products = Array.isArray(cache.data) ? cache.data : cache.data?.data;
            this.loading = false;
            this.error = null;
            return;
          }
        } catch {}
      }
    }

    this.loading = true;
    this.error = null;

    this.productService.getProducts(keyword).pipe(
      timeout({ each: 10000 }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : data?.data;
        this.products = Array.isArray(list) ? list : [];

        if (!keyword) {
          try {
            const cacheKey = 'techstore.products.cache.v1';
            localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: this.products }));
          } catch {}
        }

        if (this.products.length === 0) {
          this.error = 'Không thấy sản phẩm nào.';
        }
      },
      error: (err: any) => {
        this.error = 'Không tải được sản phẩm';
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