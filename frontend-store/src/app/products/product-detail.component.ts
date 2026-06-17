import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product';
import { CartService } from '../services/cart.service';
import { ProductReviewsComponent } from './product-reviews.component';
import { ProductSpecsComponent } from './product-specs.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductReviewsComponent, ProductSpecsComponent],
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
        // Demo data để hiển thị giao diện kiểu Shopee (vì backend hiện chỉ trả id/name/price/stock/image)
        this.product = {
          ...p,
          description:
            p?.description ?? 'Sản phẩm chất lượng cao, phù hợp cho nhu cầu sử dụng hằng ngày.',
          specs:
            p?.specs ??
            [
              { key: 'Thương hiệu', value: p?.brand ?? 'DemoBrand' },
              { key: 'Màn hình', value: p?.screen ?? 'Demo Screen' },
              { key: 'Bảo hành', value: p?.warranty ?? '12 tháng' },
            ],
          reviews:
            p?.reviews ??
            [
              {
                user: 'Minh Anh',
                rating: 5,
                comment: 'Hàng đúng mô tả, dùng rất ổn!',
                date: '1 ngày trước',
              },
              {
                user: 'Trần Hải',
                rating: 4,
                comment: 'Giao nhanh, đóng gói kỹ.',
                date: '3 ngày trước',
              },
            ],
        };

        // cập nhật title trang (tối ưu UX)
        this.error = null;
        this.loading = false;
      },
      error: (err) => {
        this.error =
          err?.message ?? 'Không tải được chi tiết sản phẩm (kiểm tra backend /api/products/:id)';
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

