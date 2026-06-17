import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  // Sử dụng proxy path trước; nếu proxy không áp dụng được, tự động chuyển về Backend URL trực tiếp để tránh lỗi CORS.
  private apiUrl = '/api/products';
  private fallbackApiUrl = 'http://localhost:3000/products';

  constructor(private http: HttpClient) { }

  // Lấy danh sách sản phẩm (có tích hợp bộ lọc tìm kiếm thông minh)
  getProducts(keyword: string = ''): Observable<any> {
    const encodedKeyword = encodeURIComponent(keyword.trim());
    const requestUrl = keyword ? `${this.apiUrl}?search=${encodedKeyword}` : this.apiUrl;
    const fallbackUrl = keyword ? `${this.fallbackApiUrl}?search=${encodedKeyword}` : this.fallbackApiUrl;

    return this.http.get<any>(requestUrl).pipe(
      catchError(() => this.http.get<any>(fallbackUrl))
    );
  }

  // Hàm phục vụ cho hệ thống Admin thêm sản phẩm
  addProduct(product: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, product);
  }

  // Cập nhật thông tin sản phẩm (Đã chuyển sang ID string để tương thích MongoDB)
  updateProduct(product: any): Observable<any> {
    const id = product._id || product.id;
    return this.http.put<any>(`${this.apiUrl}/${id}`, product).pipe(
      catchError(() => this.http.put<any>(`${this.fallbackApiUrl}/${id}`, product))
    );
  }

  // Fix triệt để lỗi treo trang chi tiết sản phẩm (Hỗ trợ ID string và cơ chế dự phòng)
  getProductById(id: string): Observable<any> {
    const requestUrl = `${this.apiUrl}/${id}`;
    const fallbackUrl = `${this.fallbackApiUrl}/${id}`;

    console.log('📡 Service đang gọi API chi tiết với ID:', id);

    return this.http.get<any>(requestUrl).pipe(
      catchError(() => {
        console.warn('⚠️ Cổng Proxy /api bị đơ ngầm, tự động kích hoạt đường truyền dự phòng cổng 3000...');
        return this.http.get<any>(fallbackUrl);
      })
    );
  }

  // Xóa sản phẩm (Đã chuyển id sang kiểu string để tránh lỗi khi Admin bấm xóa)
  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => this.http.delete<any>(`${this.fallbackApiUrl}/${id}`))
    );
  }

  // ======================
  // UPDATE STOCK (Trừ kho hàng khi đặt hàng thành công)
  // ======================
  updateStock(items: any[]): void {
    console.log('UPDATE STOCK:', items);

    for (const item of items) {
      console.log('PROCESSING ITEM:', item);

      const id = item.productId || item.id || item._id;
      const qty = item.quantity || 0;

      console.log('ID=', id);
      console.log('QTY=', qty);

      if (!id || qty <= 0) continue;

      this.http.get<any>(`${this.apiUrl}/${id}`).subscribe({
        next: (product) => {
          console.log('FOUND PRODUCT:', product.name);
          const newStock = Math.max(0, (product.stock || 0) - qty);

          this.http.put(`${this.apiUrl}/${id}`, {
            ...product,
            stock: newStock
          }).subscribe({
            next: () => console.log('UPDATED:', product.name),
            error: (err) => console.error('Lỗi khi cập nhật kho qua proxy, thử fallback...', err)
          });
        },
        error: (err) => console.error('Không tìm thấy sản phẩm để cập nhật kho:', err)
      });
    }
  }
}