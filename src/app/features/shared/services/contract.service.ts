import { ApiResponse } from './../../../core/interfaces/api.interface';
import { ApiService } from './../../../core/services/api.service';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
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
    });
  }
  getContracts(): Observable<Contract[]> {
    console.log('Fetching all contracts');
    // TODO: Implement actual API call
    return of([]);
  }
}
