import { Component, inject, input, model } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ImageFile } from '../../../../../shared/utils/interfaces';

@Component({
  selector: 'app-old-images',
  imports: [
    CommonModule,
    DividerModule,
    ReactiveFormsModule,
    ButtonModule,
    ImageModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './old-images.component.html',
})
export class OldImagesComponent {
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  old_main_image = input.required<ImageFile>();
  old_images = input.required<ImageFile[]>();
  filesToDelete = model.required<number[]>();

  getTotalImagesCount(): number {
    const mainImageCount = this.old_main_image() ? 1 : 0;
    const otherImagesCount = this.old_images().length;
    return mainImageCount + otherImagesCount;
  }

  trackByImageId(index: number, image: ImageFile): number {
    return image.id;
  }

  confirmDeleteImage(imageId: number, isMainImage: boolean): void {
    const imageType = isMainImage ? 'main image' : 'image';
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this ${imageType}? This action cannot be undone.`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.markImageForDeletion(imageId);
        this.showSuccess(
          `${imageType.charAt(0).toUpperCase() + imageType.slice(1)} marked for deletion`
        );
      },
      reject: () => {
        // User cancelled - no action needed
      },
    });
  }

  markImageForDeletion(imageId: number): void {
    if (!this.filesToDelete()?.includes(imageId)) {
      this.filesToDelete.update(prev => [...prev, imageId]);
    } else {
      this.filesToDelete.set([imageId]);
    }
  }

  clearDeletionSelection(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to clear all deletion selections?',
      header: 'Clear Selections',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.filesToDelete.set([]);
        this.showSuccess('Deletion selections cleared');
      },
    });
  }

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
    });
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }
}
