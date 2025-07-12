import {
  ApiResponse,
  PaginatedResponse,
  RequestOptions,
} from './../../../core/interfaces/api.interface';
import { ApiService } from './../../../core/services/api.service';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateContract, Contract } from '../utils/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  constructor() {}
  private apiService = inject(ApiService);
  /**
   * Create a new contract
   * @param contractData - The contract data to create
   * @returns Observable<Contract> - The created contract
   */
  createContract(contractData: CreateContract): Observable<ApiResponse<Contract>> {
    console.log('Creating contract with data:', contractData);
    return this.apiService.post<ApiResponse<Contract>>('contracts', contractData);
  }

  /**
   * Get contract by ID
   * @param id - Contract ID
   * @returns Observable<Contract> - The contract
   */
  getContract(id: number): Observable<ApiResponse<Contract>> {
    return this.apiService.get<ApiResponse<Contract>>(`contracts/${id}`);
  }
  approveContract(id: number): Observable<ApiResponse<Contract>> {
    console.log('Approving contract with ID:', id);
    return this.apiService.put<ApiResponse<Contract>>(`contracts/${id}`, { status: 'approved' });
  }
  addBuyerTrxNo(id: number, trxId: string): Observable<ApiResponse<Contract>> {
    return this.apiService.put<ApiResponse<Contract>>(`contracts/${id}`, {
      buyer_transaction_id: trxId,
      status: 'pending_payment_confirmation',
    });
  }
  getContracts(requestOptions: RequestOptions): Observable<Contract[]> {
    console.log('Fetching all contracts');
    return this.apiService.get<Contract[]>('contracts', requestOptions);
  }
  getContractsForAdmin(requestOptions: RequestOptions): Observable<PaginatedResponse<Contract>> {
    console.log('Fetching contracts for admin with options:', requestOptions);
    return this.apiService.get<PaginatedResponse<Contract>>('admin/contracts', requestOptions);
  }
  rejectBuyerPayment(id: number): Observable<ApiResponse<Contract>> {
    console.log('Rejecting contract with ID:', id);
    return this.apiService.put<ApiResponse<Contract>>(`admin/contracts/${id}/status`, {
      status: 'buyer_payment_rejected',
    });
  }

  approveBuyerPayment(id: number): Observable<ApiResponse<Contract>> {
    console.log('Approving contract with ID:', id);
    return this.apiService.put<ApiResponse<Contract>>(`admin/contracts/${id}/status`, {
      status: 'in_progress',
    });
  }

  /**
   * Get contracts for seller
   * @param requestOptions Request options with pagination and filters
   * @returns Observable of paginated contracts
   */
  getContractsForSeller(requestOptions: RequestOptions): Observable<PaginatedResponse<Contract>> {
    requestOptions.params = {
      ...requestOptions.params,
      user_type: 'seller',
    };
    return this.apiService.get<PaginatedResponse<Contract>>('contracts', requestOptions);
  }

  /**
   * Get contracts for buyer
   * @param requestOptions Request options with pagination and filters
   * @returns Observable of paginated contracts
   */
  getContractsForBuyer(requestOptions: RequestOptions): Observable<PaginatedResponse<Contract>> {
    requestOptions.params = {
      ...requestOptions.params,
      user_type: 'buyer',
    };
    return this.apiService.get<PaginatedResponse<Contract>>('contracts', requestOptions);
  }

  /**
   * Mark contract as shipped (seller action)
   * @param id Contract ID
   * @param trackingLink Shipment tracking link
   * @returns Observable of API response
   */
  markAsShipped(id: number, trackingLink: string): Observable<ApiResponse<Contract>> {
    return this.apiService.put<ApiResponse<Contract>>(`contracts/${id}/ship`, {
      status: 'shipped',
      tracking_link: trackingLink,
    });
  }

  /**
   * Mark contract as completed (seller action)
   * @param id Contract ID
   * @returns Observable of API response
   */
  markAsCompleted(id: number): Observable<ApiResponse<Contract>> {
    return this.apiService.put<ApiResponse<Contract>>(`contracts/${id}`, {
      status: 'completed',
    });
  }

  /**
   * Mark contract as delivered (buyer action)
   * @param id Contract ID
   * @returns Observable of API response
   */
  markAsDelivered(id: number): Observable<ApiResponse<Contract>> {
    return this.apiService.put<ApiResponse<Contract>>(`contracts/${id}`, {
      status: 'delivered',
    });
  }

  /**
   * Mark contract as pending payment confirmation (buyer action)
   * @param id Contract ID
   * @returns Observable of API response
   */
  markAsPendingPaymentConfirmation(id: number): Observable<ApiResponse<Contract>> {
    return this.apiService.put<ApiResponse<Contract>>(`contracts/${id}`, {
      status: 'pending_payment_confirmation',
    });
  }
}
