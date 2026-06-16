import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.errorMessage = '';
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        alert(`Đăng nhập thành công! Quyền: ${res.user.role}`);
        
        if (res.user.role === 'admin') {
          this.router.navigate(['/admin']); // Hoặc trang quản lý sản phẩm tùy bạn đặt
        } else {
          this.router.navigate(['/']); // Về trang chủ mua hàng
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Sai tài khoản hoặc mật khẩu!';
      }
    });
  }
}