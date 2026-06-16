import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export type AppRole = 'admin' | 'user';

export interface AppUser {
  username: string;
  role: AppRole;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth';
  private readonly STORAGE_KEY = 'techstore.auth.user';
  private readonly TOKEN_KEY = 'techstore.auth.token';

  constructor(private http: HttpClient) {}

  // Đăng ký kết nối DB
  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, { username, password });
  }

  // Đăng nhập nhận Token thực từ DB
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, { username, password }).pipe(
      tap((res) => {
        if (res && res.token) {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(res.user));
          localStorage.setItem(this.TOKEN_KEY, res.token);
          this.mergeGuestCartToUser(res.user.username);
        }
      })
    );
  }

  // Thuật toán gộp giỏ hàng (Giữ nguyên gốc của bạn)
  private mergeGuestCartToUser(username: string): void {
    const GUEST_KEY = 'techstore.cart.guest';
    const CART_PREFIX = 'techstore.cart.'; 

    const guestRaw = sessionStorage.getItem(GUEST_KEY);
    if (!guestRaw) return;

    let guestCart: any;
    try { guestCart = JSON.parse(guestRaw); } catch { sessionStorage.removeItem(GUEST_KEY); return; }

    const userKey = `${CART_PREFIX}${username}`;
    const userRaw = localStorage.getItem(userKey);

    let userCart: any = userRaw ? JSON.parse(userRaw) : { items: [] };
    const guestItems: any[] = guestCart?.items || [];
    const items: any[] = userCart?.items || [];

    for (const gi of guestItems) {
      const idx = items.findIndex((it) => it.productId === gi.productId);
      if (idx >= 0) {
        items[idx].quantity += gi.quantity ?? 0;
      } else {
        items.push({
          productId: gi.productId,
          name: gi.name,
          price: gi.price,
          quantity: gi.quantity ?? 0,
        });
      }
    }

    localStorage.setItem(userKey, JSON.stringify({ items }));
    sessionStorage.removeItem(GUEST_KEY);
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getCurrentUser(): AppUser | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as AppUser; } catch { return null; }
  }

  isLoggedIn(): boolean { return !!this.getCurrentUser(); }

  isAdmin(): boolean {
    const u = this.getCurrentUser();
    return !!u && u.role === 'admin';
  }
}