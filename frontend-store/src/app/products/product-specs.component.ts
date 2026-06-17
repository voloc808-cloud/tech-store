import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-specs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="specs" *ngIf="specs.length; else none">
      <h3 class="title">Thông số kỹ thuật</h3>
      <div class="rows">
        <div class="row" *ngFor="let s of specs">
          <div class="k">{{ s.key }}</div>
          <div class="v">{{ s.value }}</div>
        </div>
      </div>
    </div>
    <ng-template #none>
      <div class="specs empty">
        <h3 class="title">Thông số kỹ thuật</h3>
        <div class="msg">Chưa có dữ liệu.</div>
      </div>
    </ng-template>
  `,
  styles: [
    `.specs{margin-top:18px;background:#fff;border-radius:14px;padding:14px 16px;}
     .specs.empty{background:#fafafa;border:1px dashed rgba(0,0,0,.12);}
     .title{margin:0 0 12px;font-size:16px;font-weight:900;color:#2c3e50;}
     .rows{display:flex;flex-direction:column;gap:10px;}
     .row{display:grid;grid-template-columns: 180px 1fr;gap:12px;}
     .k{font-weight:900;color:#7f8c8d;}
     .v{font-weight:800;color:#2c3e50;}
     .msg{color:#7f8c8d;font-weight:800;}
    `,
  ],
})
export class ProductSpecsComponent {
  @Input() specs: Array<{ key: string; value: string }> = [];
}

