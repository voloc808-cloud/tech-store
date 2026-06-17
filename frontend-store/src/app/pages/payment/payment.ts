import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './payment.html',
  styleUrls: ['./payment.css']
})
export class Payment implements OnInit {

  orderCode: string = '';
  order: any;
  paymentMethod: string = 'COD';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit() {
    this.orderCode = this.route.snapshot.paramMap.get('orderCode')!;

    this.order = this.orderService.getOrder(this.orderCode);

    console.log('ORDER:', this.order); 
  }

  confirmPayment() {

    // ======================
    // COD → đi thẳng success
    // ======================
    if (this.paymentMethod === 'COD') {
      this.orderService.payOrder(this.orderCode, 'COD');

      this.router.navigate(['/order-success', this.orderCode]);
      return;
    }

    // ======================
    // BANK → chỉ update trạng thái + ở lại trang
    // ======================
    if (this.paymentMethod === 'BANK') {
      this.orderService.payOrder(this.orderCode, 'BANK');
      // status = WAITING
      this.order = this.orderService.getOrder(this.orderCode);
      // KHÔNG navigate
      return;
    }

  }
  confirmBankPaid() {
    this.orderService.confirmBankPaid(this.order.orderCode);

    this.router.navigate(['/order-success', this.order.orderCode]);
  }
  getQrUrl() {
    const amount = this.order?.total || 0;
    const code = this.order?.orderCode || '';

    return `https://img.vietqr.io/image/bidv-5811661405-compact.png
?amount=${amount}
&addInfo=${code}
&accountName=TA%20THI%20NHU%20Y`;
  }
}
