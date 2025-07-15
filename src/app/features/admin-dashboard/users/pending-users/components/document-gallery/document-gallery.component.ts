import {
  Component,
  input,
  signal,
  inject,
  effect,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { GalleriaModule } from 'primeng/galleria';
import { MediaResource } from '../../../../../shared/utils/interfaces';

@Component({
  selector: 'app-document-gallery',
  templateUrl: './document-gallery.component.html',
  imports: [CommonModule, GalleriaModule],
})
export class DocumentGalleryComponent implements OnDestroy {
  images = input.required<MediaResource[]>();
  title = input<string>('Document Images');
  visible = input<boolean>(false);

  @Output() visibleChange = new EventEmitter<boolean>();

  private document = inject(DOCUMENT);
  private eventListeners: Array<{ type: string; handler: (event: Event) => void }> = [];

  activeIndex = signal<number>(0);
  fullScreenVisible = signal<boolean>(false);

  responsiveOptions = [
    { breakpoint: '1400px', numVisible: 6 },
    { breakpoint: '1200px', numVisible: 5 },
    { breakpoint: '1024px', numVisible: 4 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '640px', numVisible: 2 },
    { breakpoint: '480px', numVisible: 1 },
  ];

  constructor() {
    // Sync parent visible input to internal state
    effect(() => {
      if (this.visible()) {
        this.fullScreenVisible.set(true);
      } else {
        this.fullScreenVisible.set(false);
      }
    });
    // Handle event listeners for ESC/backdrop
    effect(() => {
      if (this.fullScreenVisible()) {
        this.setupEventListeners();
      } else {
        this.cleanupEventListeners();
      }
    });
  }

  ngOnDestroy() {
    this.cleanupEventListeners();
  }

  private setupEventListeners() {
    const handleEscape = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === 'Escape') {
        this.closeFullScreen();
      }
    };
    const handleBackdropClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (
        target.classList.contains('p-galleria-mask') ||
        target.classList.contains('p-galleria-mask-visible') ||
        target.closest('.p-galleria-mask')
      ) {
        if (!target.closest('.p-galleria-content')) {
          this.closeFullScreen();
        }
      }
    };
    this.document.addEventListener('keydown', handleEscape);
    this.document.addEventListener('click', handleBackdropClick);
    this.eventListeners.push(
      { type: 'keydown', handler: handleEscape },
      { type: 'click', handler: handleBackdropClick }
    );
  }

  private cleanupEventListeners() {
    this.eventListeners.forEach(({ type, handler }) => {
      this.document.removeEventListener(type, handler);
    });
    this.eventListeners = [];
  }

  onActiveIndexChange(index: number) {
    this.activeIndex.set(index);
  }

  openFullScreen() {
    this.fullScreenVisible.set(true);
  }

  closeFullScreen() {
    this.fullScreenVisible.set(false);
    this.visibleChange.emit(false); // Notify parent to close
  }

  onFullScreenVisibilityChange(visible: boolean) {
    this.fullScreenVisible.set(visible);
    if (!visible) {
      this.visibleChange.emit(false); // Notify parent to close
    }
  }

  onFullScreenBackdropClick(event: Event) {
    const target = event.target as HTMLElement;
    if (
      target.classList.contains('p-galleria-mask') ||
      target.classList.contains('p-galleria-mask-visible')
    ) {
      this.closeFullScreen();
    }
  }
}
