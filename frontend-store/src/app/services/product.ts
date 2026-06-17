import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // sử dụng prox.conf.js để cấu hình bất cứ request nào tới chữ "/api" sẽ được chuyển tiếp tới backend server
  // ví dụ: /api/products sẽ được chuyển tiếp tới http://localhost:3000/products
  // nếu backend server không chạy, sẽ fallback sang request trực tiếp tới http://localhost:3000/products
  // vì frontend không có quyền truy cập trực tiếp vào backend server API
  //  (CORS), nên cần phải có proxy để chuyển tiếp request
  private apiUrl = '/api/products';
  private fallbackApiUrl = 'http://localhost:3000/products';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      catchError(() => this.http.get<any>(this.fallbackApiUrl))
    );
  }

  addProduct(product: any) {
    return this.http.post(this.apiUrl, product);
  }

  updateProduct(product: any) {
    // backend: PUT /products/:id
    return this.http.put(`${this.apiUrl}/${product.id}`, product);
  }

  //hàm lấy chi tiết sản phẩm theo id
  // tạo request api để lấy chi tiết sản phẩm theo id
  getProductById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  deleteProduct(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
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
