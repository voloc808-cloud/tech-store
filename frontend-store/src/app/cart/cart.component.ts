import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  items: any[] = [];
  subtotal = 0;

  constructor(public router: Router, private cart: CartService) {}

  ngOnInit(): void {
    this.refresh();
  }

  formatPrice(price: any): string {
    const rawPrice = Number(price) || 0;
    if (rawPrice < 100000) {
      return (rawPrice * 25000).toLocaleString('vi-VN') + ' đ';
    }
    return rawPrice.toLocaleString('vi-VN') + ' đ';
  }

  refresh() {
    const c = this.cart.getCart();
    this.items = c.items;
    this.subtotal = this.cart.getSubtotal();
  }

  updateQty(item: any, qty: number) {
    const q = Math.max(0, Math.floor(qty));
    this.cart.updateQuantity(item.productId, q);
    this.refresh();
  }

  remove(item: any) {
    this.cart.remove(item.productId);
    this.refresh();
  }

  checkout() {
    if (this.items.length === 0) return;
    this.router.navigateByUrl('/checkout');
  }

  clear() {
    if (!confirm('Xóa hết giỏ hàng?')) return;
    this.cart.clear();
    this.refresh();
  }
}

