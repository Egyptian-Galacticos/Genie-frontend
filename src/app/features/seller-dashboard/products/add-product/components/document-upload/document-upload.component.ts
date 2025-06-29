import { MessageService } from 'primeng/api';
import { Component, ElementRef, inject, input, ViewChild } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-document-upload',
  imports: [DividerModule, ReactiveFormsModule],
  templateUrl: './document-upload.component.html',
})
export class DocumentUploadComponent {
  @ViewChild('documentFiles') documentFilesInput!: ElementRef<HTMLInputElement>;
  @ViewChild('specificationFiles') specificationFilesInput!: ElementRef<HTMLInputElement>;

  private messageService = inject(MessageService);
  documents_group = input.required<FormGroup>();
  documentFiles: File[] = [];
  specificationFiles: File[] = [];

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

  // Selection Handlers

  onDocumentsSelect(event: InputEvent): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []) as File[];
    files.forEach(file => this.processDocument(file));
  }

  onSpecificationsSelect(event: InputEvent): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []) as File[];
    files.forEach(file => this.processSpecification(file));
  }

  // Processing
  private processFiles(files: File[], type: string): void {
    if (type === 'documents') {
      files.forEach(file => this.processDocument(file));
    } else if (type === 'specifications') {
      files.forEach(file => this.processSpecification(file));
    }
  }

  private processDocument(file: File): void {
    if (!this.isValidDocument(file)) return;

    this.documentFiles.push(file);
    const reader = new FileReader();
    reader.onload = () => {
      this.documents_group().get('documents')?.setValue(this.documentFiles);
      this.documents_group().get('documents')?.markAsTouched();
    };
    reader.readAsDataURL(file);
    this.showSuccess(`Document "${file.name}" added successfully`);
  }

  private processSpecification(file: File): void {
    if (!this.isValidSpecification(file)) return;

    this.specificationFiles.push(file);
    const reader = new FileReader();
    reader.onload = () => {
      this.documents_group().get('specifications')?.setValue(this.specificationFiles);
      this.documents_group().get('specifications')?.markAsTouched();
    };
    reader.readAsDataURL(file);
    this.showSuccess(`Specification "${file.name}" added successfully`);
  }

  // Validation
  private isValidDocument(file: File): boolean {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      this.showError('Please select PDF, DOC, DOCX, or TXT files only');
      return false;
    }

    if (file.size > 25 * 1024 * 1024) {
      this.showError('Document size must be less than 25MB');
      return false;
    }

    return true;
  }

  private isValidSpecification(file: File): boolean {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/pdf',
    ];

    if (!allowedTypes.includes(file.type)) {
      this.showError('Please select XLS, XLSX, CSV, or PDF files only');
      return false;
    }

    if (file.size > 25 * 1024 * 1024) {
      this.showError('Specification size must be less than 25MB');
      return false;
    }

    return true;
  }

  // remove methods
  removeDocument(index: number): void {
    const fileName = this.documentFiles[index].name;
    this.documentFiles.splice(index, 1);
    this.showSuccess(`Document "${fileName}" removed`);
  }

  removeSpecification(index: number): void {
    const fileName = this.specificationFiles[index].name;
    this.specificationFiles.splice(index, 1);
    this.showSuccess(`Specification "${fileName}" removed`);
  }

  // Utility methods
  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return 'pi pi-file-pdf';
    if (fileType.includes('word')) return 'pi pi-file-word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'pi pi-file-excel';
    if (fileType.includes('text')) return 'pi pi-file';
    return 'pi pi-file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Show Messages
  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
    });
  }
}
