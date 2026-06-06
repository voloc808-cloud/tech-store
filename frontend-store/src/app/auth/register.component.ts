import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  username = '';
  password = '';
  confirm = '';
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    this.error = null;

    const u = this.username.trim();
    if (!u) {
      this.error = 'Username không được rỗng';
      return;
    }

    if (this.password.length < 4) {
      this.error = 'Password phải ít nhất 4 ký tự';
      return;
    }

    if (this.password !== this.confirm) {
      this.error = 'Password xác nhận không khớp';
      return;
    }

    try {
      this.auth.register(u, this.password);
      this.router.navigateByUrl('/login');
    } catch (e: any) {
      this.error = e?.message ?? 'Đăng ký thất bại';
    }
  }

  goLogin() {
    this.router.navigateByUrl('/login');
  }
}

