import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './order-success.html',
  styleUrls: ['./order-success.css']
})

export class OrderSuccess {

  orderCode: string = '';
  order: any;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit() {
    this.orderCode = this.route.snapshot.paramMap.get('orderCode')!;
    this.order = this.orderService.getOrder(this.orderCode);
  }

  goHome() {
    this.router.navigate(['/products']);
  }

  goOrders() {
    this.router.navigate(['/checkout']);
  }
}
