import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
<<<<<<< HEAD
  // Sử dụng proxy path trước; nếu proxy không áp dụng được, tự động chuyển về Backend URL trực tiếp.
=======
  // sử dụng prox.conf.js để cấu hình bất cứ request nào tới chữ "/api" sẽ được chuyển tiếp tới backend server
  // ví dụ: /api/products sẽ được chuyển tiếp tới http://localhost:3000/products
  // nếu backend server không chạy, sẽ fallback sang request trực tiếp tới http://localhost:3000/products
  // vì frontend không có quyền truy cập trực tiếp vào backend server API
  //  (CORS), nên cần phải có proxy để chuyển tiếp request
>>>>>>> 2b5dfcb93015d1b56c67f96d9042c06aa676b5ab
  private apiUrl = '/api/products';
  private fallbackApiUrl = 'http://localhost:3000/products';

  constructor(private http: HttpClient) { }

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

<<<<<<< HEAD
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
=======
  //hàm lấy chi tiết sản phẩm theo id
  // tạo request api để lấy chi tiết sản phẩm theo id
  getProductById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
>>>>>>> 2b5dfcb93015d1b56c67f96d9042c06aa676b5ab
  }

  // 🌟 ĐÃ SỬA: Chuyển id sang kiểu string để tránh lỗi khi Admin bấm xóa sản phẩm
  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(() => this.http.delete(`${this.fallbackApiUrl}/${id}`))
    );
  }
<<<<<<< HEAD
}
=======
  // ======================
  // UPDATE STOCK (NEW)
  // ======================
  updateStock(items: any[]) {

    console.log('UPDATE STOCK:', items);

    for (const item of items) {

      console.log('PROCESSING ITEM:', item);

      const id = item.productId || item.id || item._id;
      const qty = item.quantity || 0;

      console.log('ID=', id);
      console.log('QTY=', qty);

      if (!id || qty <= 0) continue;

      this.http.get<any>(`${this.apiUrl}/${id}`).subscribe(product => {

        console.log('FOUND PRODUCT:', product.name);

        const newStock = Math.max(0, (product.stock || 0) - qty);

        this.http.put(`${this.apiUrl}/${id}`, {
          ...product,
          stock: newStock
        }).subscribe(() => {
          console.log('UPDATED:', product.name);
        });

      });
    }
  }
}
>>>>>>> 2b5dfcb93015d1b56c67f96d9042c06aa676b5ab
