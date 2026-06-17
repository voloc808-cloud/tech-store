import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reviews">
      <h3 class="title">Đánh giá sản phẩm</h3>

      <div class="summary" *ngIf="reviews.length; else empty">
        <div class="score">{{ avg.toFixed(1) }} / 5</div>
        <div class="count">{{ reviews.length }} đánh giá</div>
      </div>

      <ng-template #empty>
        <div class="empty">Chưa có đánh giá.</div>
      </ng-template>

      <div class="list" *ngIf="reviews.length">
        <div class="review" *ngFor="let r of reviews">
          <div class="top">
            <div class="user">{{ r.user }}</div>
            <div class="stars">{{ stars(r.rating) }}</div>
          </div>
          <div class="time">{{ r.date }}</div>
          <div class="body">{{ r.comment }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.reviews{margin-top:18px;background:#fff;border-radius:14px;padding:14px 16px;}
     .title{margin:0 0 12px;font-size:16px;font-weight:900;color:#2c3e50;}
     .summary{display:flex;gap:14px;align-items:baseline;margin-bottom:10px;}
     .score{font-size:26px;font-weight:1000;color:var(--primary);}
     .count{color:#7f8c8d;font-weight:800;}
     .empty{color:#7f8c8d;font-weight:800;}
     .list{display:flex;flex-direction:column;gap:12px;}
     .review{border-top:1px solid rgba(0,0,0,.06);padding-top:12px;}
     .review:first-child{border-top:none;padding-top:0;}
     .top{display:flex;justify-content:space-between;gap:10px;align-items:center;}
     .user{font-weight:1000;color:#2c3e50;}
     .stars{font-weight:1000;color:#f59e0b;letter-spacing:1px;}
     .time{font-size:12px;color:#9aa5b1;font-weight:800;margin-top:2px;}
     .body{margin-top:6px;color:#444;font-weight:700;line-height:1.35;}
    `,
  ],
})
export class ProductReviewsComponent {
  @Input() reviews: Array<{ user: string; rating: number; comment: string; date: string }> = [];

  get avg(): number {
    if (!this.reviews?.length) return 0;
    const sum = this.reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0);
    return sum / this.reviews.length;
  }

  stars(rating: number): string {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    const full = Math.round(r);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }
}

