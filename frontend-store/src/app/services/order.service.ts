import { Injectable } from '@angular/core';
import { ProductService } from './product';

export interface CheckoutPayload {
  items: {
    productId: number;
    quantity: number;
    name: string;
    price: number;
  }[];
  fullName: string;
  phone: string;
  address: string;
  note?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly STORAGE_KEY = 'techstore.orders';

  constructor(private productService: ProductService) { }
  // ======================
  // READ / WRITE LOCALSTORAGE
  // ======================
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

  // ======================
  // CREATE ORDER
  // ======================
  placeOrder(payload: CheckoutPayload) {
    const orders = this.readOrders();

    const orderCode = Date.now().toString();

    const total = payload.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    const order = {
      orderCode,
      items: payload.items,
      fullName: payload.fullName,
      phone: payload.phone,
      address: payload.address,
      note: payload.note || '',
      total,

      // UPGRADE STATUS FLOW
      status: 'PENDING', // PENDING → WAITING → PAID

      paymentMethod: null,

      createdAt: new Date().toISOString(),
    };

    orders.unshift(order);
    this.writeOrders(orders);

    return order;
  }

  // ======================
  // GET ORDER
  // ======================
  getOrder(orderCode: string) {
    return this.readOrders().find(o => o.orderCode === orderCode);
  }

  // ======================
  // PAYMENT (COD / BANK HANDLING)
  // ======================

  //  COD = PAID luôn
  payOrder(orderCode: string, paymentMethod: string) {
    const orders = this.readOrders();
    const index = orders.findIndex(o => o.orderCode === orderCode);

    if (index === -1) return null;

    orders[index].paymentMethod = paymentMethod;

    if (paymentMethod === 'COD') {
      orders[index].status = 'PAID';

      this.productService.updateStock(orders[index].items);
    }

    if (paymentMethod === 'BANK') {
      orders[index].status = 'WAITING'; // CHƯA THANH TOÁN
    }

    this.writeOrders(orders);
    return orders[index];
  }

  // khi BANK chuyển khoản xong → gọi hàm này
  confirmBankPaid(orderCode: string) {
    const orders = this.readOrders();
    const index = orders.findIndex(o => o.orderCode === orderCode);

    if (index === -1) return null;

    orders[index].status = 'PAID';
    orders[index].paymentMethod = 'BANK';

    // GIẢM TỒN KHO
    this.productService.updateStock(orders[index].items);

    this.writeOrders(orders);
    return orders[index];
  }

  // ======================
  // LIST ORDERS
  // ======================
  listOrders(): any[] {
    return this.readOrders();
  }
  // ======================
  // CANCEL ORDER (ADMIN)
  // ======================
  cancelOrder(orderCode: string) {
    const orders = this.readOrders();
    const index = orders.findIndex(o => o.orderCode === orderCode);

    if (index === -1) return null;

    orders[index].status = 'CANCELLED';

    this.writeOrders(orders);
    return orders[index];
  }

}
