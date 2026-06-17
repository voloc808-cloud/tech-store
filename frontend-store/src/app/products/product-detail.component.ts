import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs'; 
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

  private currentId: string | null = null;
  private productsChangedHandler?: () => void;
  private routeSubscription?: Subscription; 

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cart: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  routerBack() {
    this.router.navigateByUrl('/products');
  }

  ngOnInit(): void {
    // Luồng theo dõi ID từ thanh URL realtime bằng paramMap
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      this.currentId = params.get('id');
      console.log('🔄 Trang chi tiết bắt được mã ID từ URL:', this.currentId);
      
      if (this.currentId) {
        this.load();
      } else {
        this.loading = false;
        this.error = 'Không tìm thấy mã định danh sản phẩm hợp lệ.';
      }
    });

    // Sự kiện đồng bộ khi dữ liệu hệ thống thay đổi từ bên ngoài
    this.productsChangedHandler = () => {
      if (this.currentId != null) this.load();
    };
    window.addEventListener('products:changed', this.productsChangedHandler as any);
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.productsChangedHandler) {
      window.removeEventListener('products:changed', this.productsChangedHandler as any);
    }
  }

  // Định dạng tiền tệ và chuẩn hóa mock-data kiểu dáng Shopee
  private processProductData(p: any): void {
    const rawPrice = Number(p?.price) || 0;
    this.product = {
      ...p,
      formattedPrice: rawPrice < 100000 ? (rawPrice * 25000).toLocaleString('vi-VN') + ' đ' : rawPrice.toLocaleString('vi-VN') + ' đ',
      description: p?.description ?? 'Sản phẩm công nghệ chính hãng cao cấp, phân phối độc quyền tại TechStore. Hỗ trợ trả góp 0%, bảo hành 12 tháng lỗi 1 đổi 1 trên toàn quốc.',
      specs: p?.specs ?? [
        { key: 'Thương hiệu', value: p?.brand ?? 'TechStore Elite' },
        { key: 'Màn hình', value: p?.screen ?? 'Chính xác cao' },
        { key: 'Bảo hành', value: p?.warranty ?? '12 tháng lỗi 1 đổi 1' },
      ],
      reviews: p?.reviews ?? [
        { user: 'Minh Anh', rating: 5, comment: 'Hàng đúng mô tả, dùng siêu mượt!', date: '1 ngày trước' },
        { user: 'Trần Hải', rating: 4, comment: 'Giao nhanh, đóng gói rất kỹ càng.', date: '3 ngày trước' },
      ],
    };
    this.error = null;
    this.loading = false;
    this.cdr.detectChanges();
  }

  // 🌟 ĐÃ CẬP NHẬT: Xử lý bóc tách vạn năng dữ liệu thô từ API Backend
  private load(): void {
    if (this.currentId == null) return;

    this.loading = true;
    this.error = null;
    this.product = null;

    console.log('📡 Đang gửi HttpClient request lấy chi tiết cho ID:', this.currentId);

    this.productService.getProductById(this.currentId).subscribe({
      next: (p) => {
        console.log('📦 Cục dữ liệu thô nhận được từ Backend API:', p);

        let realProduct = p;
        if (p && typeof p === 'object') {
          if (p.data) realProduct = p.data;
          else if (p.product) realProduct = p.product;
          else if (Array.isArray(p)) realProduct = p[0];
        }

        if (!realProduct || (!realProduct.price && !realProduct.name)) {
          console.warn('⚠️ Dữ liệu trống hoặc sai cấu trúc, kích hoạt mảng tổng cứu nguy...');
          this.loadFromBackup();
          return;
        }

        console.log('✅ Đã nhận thành công cục dữ liệu sản phẩm chuẩn:', realProduct);
        this.processProductData(realProduct);
      },
      error: (err) => {
        console.error('❌ API lỗi kết nối, kích hoạt mảng tổng cứu nguy...', err);
        this.loadFromBackup();
      }
    });
  }

  // 🌟 ĐÃ CẬP NHẬT: Tự động bóc tách dữ liệu mảng tổng cứu nguy khi Backend dùng object bọc
  private loadFromBackup(): void {
    this.productService.getProducts().subscribe({
      next: (backupList: any) => {
        let list = backupList;
        if (backupList && typeof backupList === 'object') {
          list = backupList.data || backupList.products || (Array.isArray(backupList) ? backupList : []);
        }

        const found = Array.isArray(list)
          ? list.find(item => item._id === this.currentId || item.id?.toString() === this.currentId)
          : null;

        if (found) {
          console.log('🎯 Đã cứu nguy giao diện thành công bằng mảng tổng:', found);
          this.processProductData(found);
        } else {
          this.error = `Sản phẩm với mã ID [${this.currentId}] không tồn tại trên hệ thống. Vui lòng kiểm tra lại!`;
          this.product = null;
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.error = 'Không thể nạp dữ liệu hệ thống. Vui lòng kiểm tra lại Backend!';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onImageError(event: any, productName: string = ''): void {
    const name = productName.toLowerCase();
    if (name.includes('iphone') || name.includes('phone')) {
      event.target.src = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500';
    } else if (name.includes('macbook') || name.includes('air') || name.includes('laptop')) {
      event.target.src = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500';
    } else {
      event.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500';
    }
  }

  changeQuantity(amount: number): void {
    const newQty = this.quantity + amount;
    if (newQty >= 1 && newQty <= (this.product?.stock || 1)) {
      this.quantity = newQty;
    }
  }

  addToCart() {
    if (!this.product || this.product.stock <= 0) return;
    const qty = Math.max(1, Math.floor(this.quantity));
    this.cart.addToCart(this.product, qty);
    
    alert(`🛒 Đã thêm thành công ${qty} sản phẩm [${this.product.name}] vào giỏ hàng!`);
    this.router.navigateByUrl('/cart');
  }
}