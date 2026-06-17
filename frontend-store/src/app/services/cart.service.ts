import { Injectable } from '@angular/core';
import { Cart, CartItem } from '../models/cart.types';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly GUEST_KEY = 'techstore.cart.guest';
  private readonly CART_PREFIX = 'techstore.cart.'; // techstore.cart.<username>

  //ai là ng đăng nhập
  constructor(private auth: AuthService) { }

  //tạo giỏ hàng rỗng
  private emptyCart(): Cart {
    return { items: [] };
  }

  // kiểm tra đăng nhập
  private getStorageKind(): 'guest' | 'user' {
    return this.auth.isLoggedIn() ? 'user' : 'guest';
  }

  private getStorageKey(): string {
    const user = this.auth.getCurrentUser();
    if (!user) return this.GUEST_KEY;
    return `${this.CART_PREFIX}${user.username}`;
  }

  private readCart(): Cart {
    const key = this.getStorageKey();
    const storage = this.getStorageKind() === 'user' ? localStorage : sessionStorage;

    const raw = storage.getItem(key);
    if (!raw) return this.emptyCart();
    try {
      return JSON.parse(raw) as Cart;
    } catch {
      return this.emptyCart();
    }
  }

  private writeCart(cart: Cart) {
    const key = this.getStorageKey();
    const storage = this.getStorageKind() === 'user' ? localStorage : sessionStorage;
    storage.setItem(key, JSON.stringify(cart));
  }

  getCart(): Cart {
    return this.readCart();
  }

  addToCart(product: any, quantity: number = 1) {
    const cart = this.readCart();

    const productId = product.id ?? product._id;

    const idx = cart.items.findIndex((i) => i.productId === productId);

    if (idx >= 0) {
      cart.items[idx].quantity += quantity;
    } else {
      const item: CartItem = {
        productId,
        name: product.name,
        price: product.price,
        quantity,
      };
      cart.items.push(item);
    }

    this.writeCart(cart);
  }
  updateQuantity(productId: number, quantity: number) {
    const cart = this.readCart();
    const idx = cart.items.findIndex((i) => i.productId === productId);
    if (idx < 0) return;

    if (quantity <= 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
    }

    this.writeCart(cart);
  }

  remove(productId: number) {
    const cart = this.readCart();
    cart.items = cart.items.filter((i) => i.productId !== productId);
    this.writeCart(cart);
  }

  clear() {
    this.writeCart(this.emptyCart());
  }

  getTotalItems(): number {
    return this.readCart().items.reduce((sum, i) => sum + i.quantity, 0);
  }

  getSubtotal(): number {
    return this.readCart().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }
}



