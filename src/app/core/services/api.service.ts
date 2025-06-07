import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiError, RequestOptions } from '../interfaces/api.interface';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly defaultTimeout = 30000; // 30 seconds

  /**
   * Perform a GET request
   * @param endpoint API endpoint (without base URL)
   * @param options Optional request options (params, headers, timeout)
   * @returns Observable of response
   */
  get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    const httpOptions = this.buildHttpOptions(options);

    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, httpOptions).pipe(
      timeout(options?.timeout || this.defaultTimeout),
      catchError(error => this.handleError(error, 'GET', endpoint))
    );
  }

  /**
   * Perform a POST request
   * @param endpoint API endpoint (without base URL)
   * @param body Request body
   * @param options Optional request options (headers, timeout)
   * @returns Observable of response
   */
  post<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
    const httpOptions = this.buildHttpOptions(options);

    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, body, httpOptions).pipe(
      timeout(options?.timeout || this.defaultTimeout),
      catchError(error => this.handleError(error, 'POST', endpoint))
    );
  }

  /**
   * Perform a PUT request
   * @param endpoint API endpoint (without base URL)
   * @param body Request body
   * @param options Optional request options (headers, timeout)
   * @returns Observable of response
   */
  put<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
    const httpOptions = this.buildHttpOptions(options);

    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, body, httpOptions).pipe(
      timeout(options?.timeout || this.defaultTimeout),
      catchError(error => this.handleError(error, 'PUT', endpoint))
    );
  }

  /**
   * Perform a PATCH request
   * @param endpoint API endpoint (without base URL)
   * @param body Request body
   * @param options Optional request options (headers, timeout)
   * @returns Observable of response
   */
  patch<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
    const httpOptions = this.buildHttpOptions(options);

    return this.http.patch<T>(`${this.apiUrl}/${endpoint}`, body, httpOptions).pipe(
      timeout(options?.timeout || this.defaultTimeout),
      catchError(error => this.handleError(error, 'PATCH', endpoint))
    );
  }

  /**
   * Perform a DELETE request
   * @param endpoint API endpoint (without base URL)
   * @param options Optional request options (params, headers, timeout)
   * @returns Observable of response
   */
  delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    const httpOptions = this.buildHttpOptions(options);

    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, httpOptions).pipe(
      timeout(options?.timeout || this.defaultTimeout),
      catchError(error => this.handleError(error, 'DELETE', endpoint))
    );
  }

  /**
   * Build HTTP options from RequestOptions
   * @param options Request options
   * @returns HTTP options object
   */
  private buildHttpOptions(options?: RequestOptions): {
    headers?: HttpHeaders;
    params?: HttpParams;
  } {
    const httpOptions: { headers?: HttpHeaders; params?: HttpParams } = {};

    if (options?.headers) {
      httpOptions.headers = new HttpHeaders(options.headers);
    }

    if (options?.params) {
      httpOptions.params = this.toHttpParams(options.params);
    }

    return httpOptions;
  }

  /**
   * Convert params object to HttpParams
   * @param params Parameters object
   * @returns HttpParams object
   */
  private toHttpParams(params: { [key: string]: unknown }): HttpParams {
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }

  /**
   * Handle API errors with detailed error information
   * @param error HTTP error response
   * @param method HTTP method that failed
   * @param endpoint API endpoint that failed
   * @returns Observable with structured error
   */
  private handleError(
    error: HttpErrorResponse,
    method: string,
    endpoint: string
  ): Observable<never> {
    const apiError: ApiError = {
      message: this.getErrorMessage(error),
      status: error.status || 0,
      statusText: error.statusText || 'Unknown Error',
      url: `${method} ${this.apiUrl}/${endpoint}`,
      timestamp: new Date().toISOString(),
      error: error.error,
      errors: error.error?.errors || {},
    };

    return throwError(() => apiError);
  }

  /**
   * Extract meaningful error message from HTTP error
   * @param error HTTP error response
   * @returns User-friendly error message
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Network error - please check your connection';
    }

    if (error.error?.message) {
      return error.error.message;
    }

    const statusMessages: { [key: number]: string } = {
      400: 'Bad request - please check your input',
      401: 'Unauthorized - please login again',
      403: 'Forbidden - you do not have permission',
      404: 'Resource not found',
      422: 'Validation error - please check your input',
      500: 'Server error - please try again later',
      503: 'Service unavailable - please try again later',
    };

    return statusMessages[error.status] || error.message || 'An unexpected error occurred';
  }
}
