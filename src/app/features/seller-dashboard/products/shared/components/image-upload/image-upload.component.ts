import { Component, ElementRef, inject, input, ViewChild } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-image-upload',
  imports: [DividerModule, ReactiveFormsModule],
  templateUrl: './image-upload.component.html',
})
export class ImageUploadComponent {
  messageService = inject(MessageService);

  @ViewChild('mainImageInput') mainImageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('additionalImagesInput') additionalImagesInput!: ElementRef<HTMLInputElement>;

  mainImageFile: File | null = null;
  mainImagePreview: string | null = null;
  additionalImageFiles: File[] = [];
  additionalImagePreviews: { url: string; name: string }[] = [];

  images_group = input.required<FormGroup>();

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.add('border-primary', 'bg-blue-50');
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.remove('border-primary', 'bg-blue-50');
  }

  onDrop(event: DragEvent, type: string): void {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.remove('border-primary', 'bg-blue-50');

    const files = Array.from(event.dataTransfer?.files || []);
    this.processFiles(files, type);
  }

  // File selection handlers
  onMainImageSelect(event: InputEvent): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []) as File[];
    if (files.length > 0) {
      this.processMainImage(files[0]);
    }
  }

  onAdditionalImagesSelect(event: InputEvent): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []) as File[];
    files.forEach(file => this.processAdditionalImage(file));
  }

  // File processing methods
  private processFiles(files: File[], type: string): void {
    if (type === 'main' && files.length > 0) {
      this.processMainImage(files[0]);
    } else if (type === 'additional') {
      files.forEach(file => this.processAdditionalImage(file));
    }
  }

  private processMainImage(file: File): void {
    if (!this.isValidImage(file)) return;

    this.mainImageFile = file;

    const reader = new FileReader();
    reader.onload = e => {
      this.mainImagePreview = e.target?.result as string;
      this.images_group().get('main_image')?.setValue(file);
      this.images_group().get('main_image')?.markAsTouched();
    };
    reader.readAsDataURL(file);
  }

  private processAdditionalImage(file: File): void {
    if (!this.isValidImage(file)) return;

    this.additionalImageFiles.push(file);

    const reader = new FileReader();
    reader.onload = e => {
      this.additionalImagePreviews.push({
        url: e.target?.result as string,
        name: file.name,
      });
      this.images_group().get('images')?.setValue(this.additionalImageFiles);
      this.images_group().get('images')?.markAsTouched();
    };
    reader.readAsDataURL(file);
  }

  // Remove methods
  removeMainImage(): void {
    this.mainImageFile = null;
    this.mainImagePreview = null;
    this.images_group().get('main_image')?.setValue(null);
  }

  removeAdditionalImage(index: number): void {
    this.additionalImageFiles.splice(index, 1);
    this.additionalImagePreviews.splice(index, 1);
    this.images_group().get('images')?.setValue(this.additionalImageFiles);
  }

  // Validation methods
  private isValidImage(file: File): boolean {
    if (!file.type.startsWith('image/jpeg') && !file.type.startsWith('image/png')) {
      this.showError('Please select an image file');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.showError('Image size must be less than 10MB');
      return false;
    }

    return true;
  }
  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }
}
