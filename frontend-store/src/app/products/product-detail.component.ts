import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: any | null = null;
  loading = false;
  error: string | null = null;
  quantity = 1;

  private currentId: number | null = null;
  private productsChangedHandler?: () => void;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cart: CartService,
    private router: Router
  ) {}

  routerBack() {
    this.router.navigateByUrl('/products');
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.currentId = id;

    this.load();

    // Reload ngay khi admin thay đổi dữ liệu
    this.productsChangedHandler = () => {
      if (this.currentId != null) this.load();
    };
    window.addEventListener('products:changed', this.productsChangedHandler as any);
  }

  ngOnDestroy(): void {
    if (this.productsChangedHandler) {
      window.removeEventListener(
        'products:changed',
        this.productsChangedHandler as any
      );
    }
  }

  private load(): void {
    if (this.currentId == null) return;

    this.loading = true;
    this.error = null;

    this.productService.getProductById(this.currentId).subscribe({
      next: (p) => {
        this.product = p;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message ?? 'Không tải được chi tiết sản phẩm';
        this.loading = false;
      },
    });
  }


  addToCart() {
    if (!this.product) return;
    const qty = Math.max(1, Math.floor(this.quantity));
    this.cart.addToCart(this.product, qty);
    this.router.navigateByUrl('/cart');
  }
}

