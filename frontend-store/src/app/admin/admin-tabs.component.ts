import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { AdminTab } from './admin.types'; 

@Component({
  selector: 'app-admin-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-tabs.component.html',
  styleUrls: ['./admin-tabs.component.css'],
})
export class AdminTabsComponent {
  readonly tabs: { key: AdminTab; label: string }[] = [
    { key: 'products', label: 'Hàng hoá' },
    { key: 'orders', label: 'Đơn hàng' },
    { key: 'account', label: 'Tài khoản' },
  ];

  active: AdminTab = 'products';

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  setActive(tab: AdminTab) {
    // Chỉ dispatch lên cha; tránh lệch state giữa tab component và dashboard component.
    this.active = tab;
    window.dispatchEvent(new CustomEvent('admin:tab', { detail: tab }));
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}



