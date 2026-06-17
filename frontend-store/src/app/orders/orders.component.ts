import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(private orderService: OrderService, public router: Router) { }

  ngOnInit(): void {
    this.loading = true;
    this.error = null;
    try {
      this.orders = this.orderService.listOrders();
    } catch (e: any) {
      this.error = e?.message ?? 'Không tải được đơn hàng';
    } finally {
      this.loading = false;
    }
  }

  formatDate(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleString('vi-VN');
    } catch {
      return iso;
    }
  }

  money(amount: number): string {
    const n = Number(amount) || 0;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(n);
  }

  orderTotal(order: any): number {
    const items = Array.isArray(order?.items) ? order.items : [];
    return items.reduce(
      (sum: number, it: any) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0),
      0
    );
  }

  cancelOrder(orderId: number) {
    this.orderService.cancelOrder(orderId.toString());
    this.orders = this.orderService.listOrders();
  }
}

