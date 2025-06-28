export class StatusUtils {
  static getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'sent':
      case 'quoted':
        return 'var(--color-success-500)';
      case 'pending':
        return 'var(--color-warning-500)';
      case 'rejected':
        return 'var(--color-danger-500)';
      case 'accepted':
        return 'var(--color-success-500)';
      case 'in progress':
        return 'var(--color-info-500)';
      case 'new':
        return 'var(--color-info-600)';
      case 'approved':
        return 'var(--color-success-500)';
      case 'canceled':
        return 'var(--color-surface-500)';
      case 'seen':
        return 'var(--color-primary-500)';
      default:
        return 'var(--color-surface-500)';
    }
  }

  static getStatusTextColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'in progress':
        return 'white';
      case 'canceled':
        return 'var(--text-primary)';
      default:
        return 'white';
    }
  }

  static getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (status?.toLowerCase()) {
      case 'sent':
      case 'quoted':
      case 'accepted':
      case 'approved':
        return 'success';
      case 'pending':
        return 'warn';
      case 'rejected':
      case 'canceled':
        return 'danger';
      case 'in progress':
      case 'new':
      case 'seen':
        return 'info';
      default:
        return 'info';
    }
  }
}
