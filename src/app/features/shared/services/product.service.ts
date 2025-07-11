import { CreateProductDto } from './../utils/interfaces';
import { ApiResponse, PaginatedResponse } from './../../../core/interfaces/api.interface';
import { IProduct } from '../utils/interfaces';
import { ApiService } from './../../../core/services/api.service';
import { inject, Injectable } from '@angular/core';
import { RequestOptions } from '../../../core/interfaces/api.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiService = inject(ApiService);

  createProduct(dto: FormData) {
    return this.apiService.post<ApiResponse<IProduct>>('products', dto);
  }
  getMyProducts(RequestOptions: RequestOptions) {
    return this.apiService.get<PaginatedResponse<IProduct>>('seller/products', RequestOptions);
  }
  updateProductActiveStatus(id: number, isActive: boolean) {
    return this.apiService.patch<ApiResponse>(`/products/${id}`, { is_active: isActive });
  }
  updateProductFeaturedStatus(id: number, isFeatured: boolean) {
    return this.apiService.patch<ApiResponse>(`products/${id}`, { is_featured: isFeatured });
  }
  DeleteProduct(id: number) {
    return this.apiService.delete<ApiResponse>(`products/${id}`);
  }
  getProduct(slug: string) {
    return this.apiService.get<ApiResponse<IProduct>>(`products/${slug}`);
  }
  updateProduct(id: number, dto: FormData) {
    dto.append('_method', 'PUT');
    return this.apiService.post<ApiResponse>(`products/${id}`, dto);
  }
  getAllTags() {
    return this.apiService.get<ApiResponse<string[]>>('products/tags/all');
  }
  deleteImage(slug: string, id: number, collection: string, mediaId: number) {
    return this.apiService.delete<ApiResponse>(`products/${slug}/media/${collection}/${mediaId}`);
  }
  UploadBulk(dto: CreateProductDto[]) {
    return this.apiService.post<ApiResponse>('products/bulk-import', { products: dto });
  }
  getProductsForAdmin(RequestOptions: RequestOptions) {
    return this.apiService.get<PaginatedResponse<IProduct>>('admin/products', RequestOptions);
  }
  deleteProductForAdmin(id: number) {
    return this.apiService.delete<ApiResponse>(`admin/products/${id}`);
  }
  approveProduct(id: number) {
    return this.apiService.put<ApiResponse>(`admin/products/${id}/status`, { is_approved: true });
  }
  disproveProduct(id: number) {
    return this.apiService.put<ApiResponse>(`admin/products/${id}/status`, { is_approved: false });
  }
}
