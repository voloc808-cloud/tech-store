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
    // 1. LUỒNG TÌM KIẾM REALTIME: Bỏ qua hoàn toàn Cache LocalStorage khi đang gõ
    this.searchSubject.pipe(
      debounceTime(300),        
      distinctUntilChanged(),   
      tap((keyword) => {
        this.loading = true;
        this.error = null;
        this.currentKeyword = keyword;
      }),
      switchMap((keyword) => 
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

    this.load();

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
    this.searchSubject.complete(); 
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

  onSearch(event: any): void {
    const keyword = event.target.value.trim();
    this.currentKeyword = keyword; 
    
    if (keyword === '') {
      this.load(); 
    } else {
      this.searchSubject.next(keyword); 
    }
  }

  private load(keyword: string = ''): void {
    if (this.loading) return;

    // CHỈ sử dụng cache khi KHÔNG gõ tìm kiếm sản phẩm
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

  openDetail(id: any): void {
    this.router.navigateByUrl(`/products/${id}`);
  }

  addToCart(product: any) {
    this.cart.addToCart(product, 1);
  }

  onImageError(event: Event, productName: string = '') {
    const img = event.target as HTMLImageElement;
    if (img) {
      const name = productName.toLowerCase();
      if (name.includes('iphone') || name.includes('phone')) {
        img.src = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500';
      } else if (name.includes('macbook') || name.includes('air') || name.includes('laptop')) {
        img.src = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500';
      } else {
        img.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500';
      }
    }
  }

  formatPrice(price: any): string {
    const rawPrice = Number(price) || 0;
    if (rawPrice < 100000) {
      return (rawPrice * 25000).toLocaleString('vi-VN') + ' đ';
    }
    return rawPrice.toLocaleString('vi-VN') + ' đ';
  }
}