import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // Use proxy path first; if proxy/dev-server isn't applying, fall back to backend URL.
  private apiUrl = '/api/products';
  private fallbackApiUrl = 'http://localhost:3000/products';

  constructor(private http: HttpClient) {}

getProducts(keyword: string = ''): Observable<any> {
    // Nếu có từ khóa, gọi THẲNG vào localhost:3000 để né lỗi cấu hình Proxy của dev-server
    if (keyword) {
      return this.http.get<any>(`${this.fallbackApiUrl}?q=${keyword}`).pipe(
        catchError(() => this.http.get<any>(`${this.apiUrl}?q=${keyword}`))
      );
    }

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

  getProductById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  deleteProduct(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
