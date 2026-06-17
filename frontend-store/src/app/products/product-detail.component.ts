import { Component, OnInit, OnDestroy } from '@angular/core';
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
    private router: Router
  ) {}

  routerBack() {
    this.router.navigateByUrl('/products');
  }

  ngOnInit(): void {
    // 🌟 ĐỒNG BỘ: Luồng theo dõi ID từ thanh URL realtime bằng paramMap
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

    // Sự kiện đồng bộ khi Admin cập nhật dữ liệu từ hệ thống bên ngoài
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

  // Hàm định dạng tiền tệ và gộp dữ liệu Shopee-style lên HTML giao diện
  private processProductData(p: any): void {
    const rawPrice = Number(p?.price) || 0;
    this.product = {
      ...p,
      // Đổi tiền sang VNĐ dấu chấm hàng nghìn chuẩn giao diện
      formattedPrice: rawPrice < 100000 ? (rawPrice * 25000).toLocaleString('vi-VN') : rawPrice.toLocaleString('vi-VN'),
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
    this.loading = false; // 🔓 Tắt Loading để mở bung giao diện HTML
  }

  // 🌟 ĐÃ SỬA: Chốt chặn bọc an toàn tránh lỗi crash "Cannot read properties of undefined (reading 'price')"
  private load(): void {
    if (this.currentId == null) return;

    this.loading = true;
    this.error = null;
    this.product = null;

    console.log('📡 Đang gửi HttpClient request lấy chi tiết cho ID:', this.currentId);
    
    this.productService.getProductById(this.currentId).subscribe({
      next: (p) => {
        // 🛡️ CHỐT CHẶN 1: Nếu Backend trả về mảng [ ], tự động bốc phần tử [0] ra để xử lý cấu trúc
        const realProduct = Array.isArray(p) ? p[0] : p;

        // 🛡️ CHỐT CHẶN 2: Khử lỗi nếu object trống rỗng hoàn toàn hoặc thiếu trường dữ liệu cốt lõi
        if (!realProduct || (!realProduct.price && !realProduct.name)) {
          console.warn('⚠️ Dữ liệu trống hoặc sai cấu trúc, kích hoạt mảng tổng cứu nguy...');
          this.loadFromBackup();
          return;
        }
        
        console.log('✅ Đã nhận thành công cục dữ liệu sản phẩm chuẩn:', realProduct);
        this.processProductData(realProduct);
      },
      error: (err) => {
        console.error('❌ API lỗi kết nối hoặc nghẽn mạch, kích hoạt mảng tổng cứu nguy...');
        this.loadFromBackup();
      }
    });
  }

  // Luồng bốc mảng dữ liệu dự phòng từ LocalStorage để cứu nguy giao diện nếu API lỗi
  private loadFromBackup(): void {
    this.productService.getProducts().subscribe({
      next: (backupList: any[]) => {
        const list = Array.isArray(backupList) ? backupList : (backupList as any)?.data;
        
        // So khớp tìm kiếm sản phẩm tương thích ID dưới mảng
        const found = Array.isArray(list) 
          ? list.find(item => item._id === this.currentId || item.id?.toString() === this.currentId)
          : null;
          
        if (found) {
          console.log('🎯 Đã cứu nguy giao diện thành công bằng mảng tổng:', found);
          this.processProductData(found);
        } else {
          // 🛡️ Nếu sai lệch ID hoàn toàn và không thấy gì dưới cache, ÉP tắt LOADING và hiện lỗi trực quan
          this.error = `Sản phẩm với mã ID [${this.currentId}] không tồn tại trên hệ thống. Vui lòng kiểm tra lại!`;
          this.product = null;
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'Không thể nạp dữ liệu hệ thống. Vui lòng kiểm tra lại Backend!';
        this.loading = false;
      }
    });
  }

  // Hàm tự động nạp ảnh công nghệ sắc nét từ Unsplash khi link ảnh trong DB bị lỗi hoặc vỡ
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