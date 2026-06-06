import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username = 'admin';
  password = 'admin123';
  error: string | null = null;
  loading = false;

  constructor(private auth: AuthService, public router: Router) {}


  submit() {
    this.error = null;
    this.loading = true;

    try {
      const user = this.auth.login(this.username.trim(), this.password);
      if (user.role === 'admin') {
        this.router.navigateByUrl('/admin');
      } else {
        this.router.navigateByUrl('/');
      }
    } catch (e: any) {
      this.error = e?.message ?? 'Login failed';
    } finally {
      this.loading = false;
    }
  }

  goHome() {
    this.router.navigateByUrl('/');
  }
}

