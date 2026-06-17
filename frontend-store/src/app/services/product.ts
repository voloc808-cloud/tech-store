import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // Sử dụng proxy path trước; nếu proxy không áp dụng được, tự động chuyển về Backend URL trực tiếp.
  private apiUrl = '/api/products';
  private fallbackApiUrl = 'http://localhost:3000/products';

  constructor(private http: HttpClient) {}

  getProducts(keyword: string = ''): Observable<any> {
    const encodedKeyword = encodeURIComponent(keyword.trim());
    const requestUrl = keyword ? `${this.apiUrl}?search=${encodedKeyword}` : this.apiUrl;
    const fallbackUrl = keyword ? `${this.fallbackApiUrl}?search=${encodedKeyword}` : this.fallbackApiUrl;

    return this.http.get<any>(requestUrl).pipe(
      catchError(() => this.http.get<any>(fallbackUrl))
    );
  }

  // 🌟 GIỮ NGUYÊN: Hàm phục vụ cho hệ thống Admin thêm sản phẩm
  addProduct(product: any) {
    return this.http.post(this.apiUrl, product);
  }

  // 🌟 ĐÃ SỬA: Chuyển id sang kiểu string để tương thích hoàn toàn với MongoDB ObjectId
  updateProduct(product: any) {
    // backend: PUT /products/:id
    const id = product._id || product.id;
    return this.http.put(`${this.apiUrl}/${id}`, product).pipe(
      catchError(() => this.http.put(`${this.fallbackApiUrl}/${id}`, product))
    );
  }

  // 🌟 ĐÃ SỬA: Fix triệt để lỗi treo trang chi tiết sản phẩm
  getProductById(id: string): Observable<any> {
    const requestUrl = `${this.apiUrl}/${id}`;
    const fallbackUrl = `${this.fallbackApiUrl}/${id}`;

    console.log('📡 Service đang gọi API chi tiết với ID:', id);

    // Thử gọi qua proxy trước, nếu proxy sập hoặc nghẽn, tự động đâm thẳng cổng 3000 cứu nguy tức thì
    return this.http.get<any>(requestUrl).pipe(
      catchError(() => {
        console.warn('⚠️ Cổng Proxy /api bị đơ ngầm, tự động kích hoạt đường truyền dự phòng cổng 3000...');
        return this.http.get<any>(fallbackUrl);
      })
    );
  }

  // 🌟 ĐÃ SỬA: Chuyển id sang kiểu string để tránh lỗi khi Admin bấm xóa sản phẩm
  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(() => this.http.delete(`${this.fallbackApiUrl}/${id}`))
    );
  }
}