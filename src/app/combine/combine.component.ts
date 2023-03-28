import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  SecurityContext,
  OnInit,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-combine',
  templateUrl: './combine.component.html',
  styleUrls: ['./combine.component.css'],
})
export class CombineComponent implements OnInit {
  title = 'image-tools';

  @ViewChild('canvasRef')
  readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly snackBar = inject(MatSnackBar);

  private readonly sanitizer = inject(DomSanitizer);

  imageUrls: SafeUrl[] = [];

  canvasSize = { w: 1540, h: 880 };

  mode = 'mode1';

  modes = ['mode1', 'mode2'];

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;

    if (!input.files) {
      this.snackBar.open('input.files is none');
      return;
    }

    if (!input.files.length) {
      this.snackBar.open('未选中文件');
      return;
    }

    if (input.files.length > 2) {
      this.snackBar.open('仅支持 2 张图片');
    }

    const first = input.files.item(0);
    if (!first) return;

    this.imageUrls.push(
      this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(first))
    );

    const second = input.files.item(1);
    if (!second) return;

    this.imageUrls.push(
      this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(second))
    );
  }

  onModelChanges() {
    localStorage.setItem(
      'image-tools:combine',
      JSON.stringify({
        mode: this.mode,
        h: this.canvasSize.h,
        w: this.canvasSize.w,
      })
    );
  }

  onPaintImages() {
    if (this.imageUrls.length !== 2) {
      this.snackBar.open('仅支持 2 张图片');
      return;
    }

    const ctx = this.canvasRef.nativeElement.getContext('2d');

    if (!ctx) return;

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = this.canvasSize.w;
    shadowCanvas.height = this.canvasSize.h;

    const shadowCtx = shadowCanvas.getContext('2d')!;

    const urls = this.imageUrls.map(
      (url) => this.sanitizer.sanitize(SecurityContext.URL, url)!
    );

    loadImage(urls[0]).subscribe((img) => {
      ctx.drawImage(img, 0, 0);

      loadImage(urls[1]).subscribe((img) => {
        shadowCtx.drawImage(img, 0, 0);

        switch (this.mode) {
          case 'mode1':
            this.paintMode1(ctx, shadowCtx);
            break;
          case 'mode2':
            this.paintMode2(ctx, shadowCtx);
            break;

          default:
            this.snackBar.open('Unknown mode: ' + this.mode);
        }
      });
    });
  }

  private paintMode1(
    ctx: CanvasRenderingContext2D,
    shadowCtx: CanvasRenderingContext2D
  ) {
    const w = this.canvasSize.w;
    const h = this.canvasSize.h;

    const r = w / h;

    let i = w;

    for (let y = 0; y < w; y++) {
      const _i = Math.round(i);
      ctx.putImageData(shadowCtx.getImageData(_i, y, w, 1), _i, y);
      i -= r;
    }
  }

  private paintMode2(
    ctx: CanvasRenderingContext2D,
    shadowCtx: CanvasRenderingContext2D
  ) {
    const w = this.canvasSize.w;
    const h = this.canvasSize.h;

    let i = w - (w - h) / 2;

    for (let y = 0; y < w; y++) {
      const _i = Math.round(i);
      ctx.putImageData(shadowCtx.getImageData(_i, y, w, 1), _i, y);
      i--;
    }
  }

  ngOnInit() {
    const cache = localStorage.getItem('image-tools:combine');

    if (!cache) return;

    const data = JSON.parse(cache);

    data.mode && (this.mode = data.mode);
    data.w && (this.canvasSize.w = data.w);
    data.h && (this.canvasSize.h = data.h);
  }
}

function loadImage(src: string) {
  return new Observable<HTMLImageElement>((subscribe) => {
    const img = new Image();
    img.onload = () => {
      subscribe.next(img);
    };
    img.src = src;
  });
}

