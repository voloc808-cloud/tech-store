import { Injectable } from '@angular/core';

export type AppRole = 'admin' | 'user';

export interface AppUser {
  username: string;
  role: AppRole;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'techstore.auth.user';

  // Mock accounts (theo yêu cầu bài)
  private readonly accounts: Record<
    string,
    { password: string; role: AppRole }
  > = {
    admin: { password: 'admin123', role: 'admin' },
    user: { password: 'user123', role: 'user' },
  };

  login(username: string, password: string): AppUser {
    const u = username.trim();
    const acc = this.accounts[u];

    // 1) tài khoản mock cố định (admin/user)
    if (acc) {
      if (acc.password !== password) {
        throw new Error('Invalid username or password');
      }

      const user: AppUser = { username: u, role: acc.role };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      this.mergeGuestCartToUser(user.username);
      return user;
    }

    // 2) tài khoản user đã register
    const usersKey = 'techstore.register.users';
    const raw = localStorage.getItem(usersKey);
    const users = raw ? (JSON.parse(raw) as Record<string, string>) : {};

    const registeredPwd = users[u];
    if (!registeredPwd || registeredPwd !== password) {
      throw new Error('Invalid username or password');
    }

    const user: AppUser = { username: u, role: 'user' };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.mergeGuestCartToUser(user.username);
    return user;
  }

  private mergeGuestCartToUser(username: string): void {
    const GUEST_KEY = 'techstore.cart.guest';
    const CART_PREFIX = 'techstore.cart.'; // techstore.cart.<username>

    const guestRaw = sessionStorage.getItem(GUEST_KEY);
    if (!guestRaw) return;

    let guestCart: any;
    try {
      guestCart = JSON.parse(guestRaw);
    } catch {
      sessionStorage.removeItem(GUEST_KEY);
      return;
    }

    const userKey = `${CART_PREFIX}${username}`;
    const userRaw = localStorage.getItem(userKey);

    let userCart: any;
    try {
      userCart = userRaw ? JSON.parse(userRaw) : { items: [] };
    } catch {
      userCart = { items: [] };
    }

    const guestItems: any[] = Array.isArray(guestCart?.items)
      ? guestCart.items
      : [];

    const items: any[] = Array.isArray(userCart?.items) ? userCart.items : [];

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


  listRegisteredUsers(): string[] {
    const usersKey = 'techstore.register.users';
    const raw = localStorage.getItem(usersKey);
    const users = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    return Object.keys(users).sort();
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Register account mock (role = user)
  register(username: string, password: string): void {
    const u = username.trim();
    if (!u) throw new Error('Username không hợp lệ');
    if (password.trim().length < 4) throw new Error('Password quá ngắn');

    const usersKey = 'techstore.register.users';
    const raw = localStorage.getItem(usersKey);
    const users = raw ? (JSON.parse(raw) as Record<string, string>) : {};

    if (users[u] || this.accounts[u]) {
      throw new Error('Username đã tồn tại');
    }

    users[u] = password;
    localStorage.setItem(usersKey, JSON.stringify(users));
  }

  getCurrentUser(): AppUser | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AppUser;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  isAdmin(): boolean {
    const u = this.getCurrentUser();
    return !!u && u.role === 'admin';
  }
}

