import { Injectable } from '@angular/core';

export interface CheckoutPayload {
  items: { productId: number; quantity: number; name: string; price: number }[];
  fullName: string;
  phone: string;
  address: string;
  note?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  // Mock: lưu đơn vào localStorage để demo
  private readonly STORAGE_KEY = 'techstore.orders';

  private readOrders(): any[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private writeOrders(orders: any[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
  }

  placeOrder(payload: CheckoutPayload) {
    const orders = this.readOrders();
    const order = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...payload,
    };
    orders.unshift(order);
    this.writeOrders(orders);
    return order;
  }

  listOrders(): any[] {
    return this.readOrders();
  }

  cancelOrder(orderId: number): void {
    const orders = this.readOrders();
    const idx = orders.findIndex((o) => Number(o.id) === Number(orderId));
    if (idx < 0) return;

    // demo: nếu chưa huỷ, set status = cancelled
    orders[idx] = {
      ...orders[idx],
      status: orders[idx]?.status === 'cancelled' ? 'cancelled' : 'cancelled',
      cancelledAt: new Date().toISOString(),
    };
    this.writeOrders(orders);
  }
}


