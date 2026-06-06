import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  items: any[] = [];
  subtotal = 0;

  fullName = '';
  phone = '';
  address = '';
  note = '';

  placing = false;
  message: string | null = null;

  private formatVnd(amount: number): string {
    const n = Number(amount) || 0;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(n);
  }

  private validatePhone(phoneRaw: string): boolean {
    const p = phoneRaw.trim();
    // Chấp nhận: 0xxxxxxxxx hoặc +84xxxxxxxxx (9-10 số VN)
    return /^(0\d{9,10}|\+?84\d{9,10})$/.test(p.replace(/\s+/g, ''));
  }

  constructor(
    private cart: CartService,
    private order: OrderService,
    public router: Router
  ) {}

  ngOnInit(): void {
    const c = this.cart.getCart();
    this.items = c.items;
    this.subtotal = this.cart.getSubtotal();

    if (this.items.length === 0) {
      this.router.navigateByUrl('/cart');
    }
  }

  placeOrder() {
    this.message = null;

    if (!this.fullName.trim() || !this.phone.trim() || !this.address.trim()) {
      this.message = 'Vui lòng điền đầy đủ thông tin nhận hàng';
      return;
    }

    if (!this.validatePhone(this.phone)) {
      this.message = 'Số điện thoại không hợp lệ';
      return;
    }

    this.placing = true;
    try {
      const order = this.order.placeOrder({
        items: this.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          name: i.name,
          price: i.price,
        })),
        fullName: this.fullName.trim(),
        phone: this.phone.trim(),
        address: this.address.trim(),
        note: this.note.trim() || undefined,
      });

      this.cart.clear();
      this.message = `Đặt hàng thành công! Mã đơn: ${order.id}`;
    } finally {
      this.placing = false;
    }
  }

  getMoney(amount: number): string {
    return this.formatVnd(amount);
  }
}


