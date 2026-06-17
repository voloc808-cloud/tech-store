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

  // 🌟 GIỮ NGUYÊN: Các hàm CRUD phục vụ cho hệ thống Admin/Quản lý của nhóm
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