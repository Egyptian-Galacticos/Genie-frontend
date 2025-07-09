import { ISellerStatistics } from '../shared/utils/interfaces';
import { StatisticsService } from './../shared/services/statistics.service';
import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { DashboardInfoCardComponent } from '../shared/dashboard-info-card/dashboard-info-card.component';

@Component({
  selector: 'app-seller-dashboard',
  imports: [CommonModule, ChartModule, CardModule, DashboardInfoCardComponent],
  templateUrl: './seller-dashboard.component.html',
  styleUrl: './seller-dashboard.component.css',
})
export class SellerDashboardComponent implements OnInit, OnDestroy {
  statisticsService = inject(StatisticsService);
  cdr = inject(ChangeDetectorRef);

  sellerStatistics = signal<ISellerStatistics>({} as ISellerStatistics);

  // Theme change observer
  private themeObserver?: MutationObserver;

  // Chart data signals
  rfqStatusChart = signal<
    | {
        labels: string[];
        datasets: {
          data: number[];
          backgroundColor: string[];
          borderColor: string[];
          borderWidth: number;
          label?: string;
        }[];
      }
    | undefined
  >(undefined);

  quoteStatusChart = signal<
    | {
        labels: string[];
        datasets: {
          data: number[];
          backgroundColor: string[];
          borderColor: string[];
          borderWidth: number;
          label?: string;
        }[];
      }
    | undefined
  >(undefined);

  contractStatusChart = signal<
    | {
        labels: string[];
        datasets: {
          data: number[];
          backgroundColor: string[];
          borderColor: string[];
          borderWidth: number;
          label?: string;
        }[];
      }
    | undefined
  >(undefined);

  productStatusChart = signal<
    | {
        labels: string[];
        datasets: {
          data: number[];
          backgroundColor: string[];
          borderColor: string[];
          borderWidth: number;
          label?: string;
        }[];
      }
    | undefined
  >(undefined);

  valueComparisonChart = signal<
    | {
        labels: string[];
        datasets: {
          data: number[];
          backgroundColor: string[];
          borderColor: string[];
          borderWidth: number;
          label?: string;
        }[];
      }
    | undefined
  >(undefined);

  // Chart options - will be initialized in ngOnInit
  chartOptions = signal<object>({});
  barChartOptions = signal<object>({});

  // Computed properties for totals
  totalRfqCount = computed(() => this.sellerStatistics()?.rfqs?.total || 0);
  totalQuoteCount = computed(() => this.sellerStatistics()?.quotes?.total || 0);
  totalContractCount = computed(() => this.sellerStatistics()?.contracts?.total || 0);
  totalProductCount = computed(() => this.sellerStatistics()?.products?.total || 0);

  totalRfqValue = computed(() => {
    const rfqs = this.sellerStatistics()?.rfqs;
    if (!rfqs) return 0;
    return (
      (rfqs.Pending?.value || 0) + (rfqs['In Progress']?.value || 0) + (rfqs.Quoted?.value || 0)
    );
  });

  totalQuoteValue = computed(() => {
    const quotes = this.sellerStatistics()?.quotes;
    if (!quotes) return 0;
    return (quotes.sent?.value || 0) + (quotes.accepted?.value || 0);
  });

  totalContractValue = computed(() => this.sellerStatistics()?.contracts?.approved?.value || 0);

  // Theme colors based on your PrimeNG theme that adapt to light/dark mode
  private getThemeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    if (isDark) {
      return {
        primary: '#8894f1',
        secondary: '#534fdc',
        success: '#22c55e',
        info: '#3b82f6',
        warning: '#f59e0b',
        danger: '#ef4444',
        light: '#f8fafc',
        dark: '#1e293b',
        muted: '#94a3b8',
        purple: '#a855f7',
        indigo: '#6366f1',
      };
    } else {
      return {
        primary: '#636ae8',
        secondary: '#534fdc',
        success: '#22c55e',
        info: '#3b82f6',
        warning: '#f59e0b',
        danger: '#ef4444',
        light: '#f8fafc',
        dark: '#1e293b',
        muted: '#64748b',
        purple: '#a855f7',
        indigo: '#6366f1',
      };
    }
  }

  private getTextColor(): string {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDark ? '#ffffff' : '#0f172a';
  }

  private getTooltipBackgroundColor(): string {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDark ? '#1e293b' : '#ffffff';
  }

  private getBorderColor(): string {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDark ? '#475569' : '#e2e8f0';
  }

  private getGridColor(): string {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDark ? '#334155' : '#e2e8f0';
  }

  ngOnInit() {
    this.updateChartOptions(); // Initialize chart options with current theme
    this.statisticsService.getSellerStatistics({}).subscribe(response => {
      // Handle both array and single object responses
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      this.sellerStatistics.set(data || {});
      console.log(this.sellerStatistics());
      this.initializeCharts();
    });

    // Set up theme observer to refresh charts when theme changes
    this.setupThemeObserver();
  }

  ngOnDestroy() {
    // Clean up the theme observer
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
  }

  private setupThemeObserver() {
    // Observe changes to the data-theme attribute on the document element
    this.themeObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          // Theme changed, refresh chart options and reinitialize charts
          this.refreshChartsForTheme();
        }
      });
    });

    // Start observing
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  // Method to refresh charts when theme changes
  refreshChartsForTheme() {
    // Clear chart data temporarily to force re-render
    this.rfqStatusChart.set(undefined);
    this.quoteStatusChart.set(undefined);
    this.contractStatusChart.set(undefined);
    this.productStatusChart.set(undefined);
    this.valueComparisonChart.set(undefined);

    // Update chart options with new theme colors
    this.updateChartOptions();

    // Force change detection
    this.cdr.detectChanges();

    // Re-initialize charts with new options after a small delay
    setTimeout(() => {
      this.initializeCharts();
      this.cdr.detectChanges();
    }, 50);
  }

  private updateChartOptions() {
    // Update chart options to reflect current theme
    this.chartOptions.set({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            boxWidth: 12,
            font: {
              size: 12,
            },
            padding: 15,
            color: this.getTextColor(),
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: this.getTooltipBackgroundColor(),
          titleColor: this.getTextColor(),
          bodyColor: this.getTextColor(),
          borderColor: this.getBorderColor(),
          borderWidth: 1,
          callbacks: {
            label: (context: { parsed: number; raw: number; label: string }) => {
              const value = context.parsed || context.raw;
              return `${context.label}: ${value.toLocaleString()}`;
            },
          },
        },
      },
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        },
      },
    });

    this.barChartOptions.set({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            boxWidth: 12,
            font: {
              size: 12,
            },
            padding: 15,
            color: this.getTextColor(),
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: this.getTooltipBackgroundColor(),
          titleColor: this.getTextColor(),
          bodyColor: this.getTextColor(),
          borderColor: this.getBorderColor(),
          borderWidth: 1,
          callbacks: {
            label: (context: {
              parsed: { y: number };
              raw: number;
              dataset: { label: string };
            }) => {
              const value = context.parsed.y || context.raw;
              return `${context.dataset.label}: $${value.toLocaleString()}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: this.getTextColor(),
            callback: function (value: string | number) {
              return '$' + Number(value).toLocaleString();
            },
          },
          grid: {
            color: this.getGridColor(),
          },
        },
        x: {
          ticks: {
            color: this.getTextColor(),
          },
          grid: {
            color: this.getGridColor(),
          },
        },
      },
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        },
      },
    });
  }

  private initializeCharts() {
    this.initRfqStatusChart();
    this.initQuoteStatusChart();
    this.initContractStatusChart();
    this.initProductStatusChart();
    this.initValueComparisonChart();
  }

  private initRfqStatusChart() {
    const rfqs = this.sellerStatistics()?.rfqs;
    if (!rfqs) return;

    const data = [];
    const labels = [];
    const themeColors = this.getThemeColors();
    const colors = [themeColors.danger, themeColors.warning, themeColors.success];

    if (rfqs.Pending) {
      labels.push('Pending');
      data.push(rfqs.Pending.count || 0);
    }
    if (rfqs['In Progress']) {
      labels.push('In Progress');
      data.push(rfqs['In Progress'].count || 0);
    }
    if (rfqs.Quoted) {
      labels.push('Quoted');
      data.push(rfqs.Quoted.count || 0);
    }

    this.rfqStatusChart.set({
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length),
          borderWidth: 0,
        },
      ],
    });
  }

  private initQuoteStatusChart() {
    const quotes = this.sellerStatistics()?.quotes;
    if (!quotes) return;

    const data = [];
    const labels = [];
    const themeColors = this.getThemeColors();
    const colors = [themeColors.info, themeColors.success];

    if (quotes.sent) {
      labels.push('Sent');
      data.push(quotes.sent.count || 0);
    }
    if (quotes.accepted) {
      labels.push('Accepted');
      data.push(quotes.accepted.count || 0);
    }

    this.quoteStatusChart.set({
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length),
          borderWidth: 0,
        },
      ],
    });
  }

  private initContractStatusChart() {
    const contracts = this.sellerStatistics()?.contracts;
    if (!contracts) return;

    const data = [];
    const labels = [];
    const themeColors = this.getThemeColors();
    const colors = [themeColors.success];

    if (contracts.approved) {
      labels.push('Approved');
      data.push(contracts.approved.count || 0);
    }

    this.contractStatusChart.set({
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length),
          borderWidth: 0,
        },
      ],
    });
  }

  private initProductStatusChart() {
    const products = this.sellerStatistics()?.products;
    if (!products) return;

    const data = [];
    const labels = [];
    const themeColors = this.getThemeColors();
    const colors = [
      themeColors.success, // active
      themeColors.warning, // pending_approval
      themeColors.info, // approved
      themeColors.purple, // featured
      themeColors.danger, // inactive
    ];

    if (products.active) {
      labels.push('Active');
      data.push(products.active);
    }
    if (products.pending_approval) {
      labels.push('Pending Approval');
      data.push(products.pending_approval);
    }
    if (products.approved) {
      labels.push('Approved');
      data.push(products.approved);
    }
    if (products.featured) {
      labels.push('Featured');
      data.push(products.featured);
    }
    if (products.inactive) {
      labels.push('Inactive');
      data.push(products.inactive);
    }

    this.productStatusChart.set({
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length),
          borderWidth: 0,
        },
      ],
    });
  }

  private initValueComparisonChart() {
    const themeColors = this.getThemeColors();

    this.valueComparisonChart.set({
      labels: ['RFQs', 'Quotes', 'Contracts'],
      datasets: [
        {
          label: 'Total Value ($)',
          data: [this.totalRfqValue(), this.totalQuoteValue(), this.totalContractValue()],
          backgroundColor: [themeColors.primary, themeColors.info, themeColors.success],
          borderColor: [themeColors.primary, themeColors.info, themeColors.success],
          borderWidth: 1,
        },
      ],
    });
  }

  // Legacy getter methods for template compatibility
  getTotalRfqCount(): number {
    return this.totalRfqCount();
  }

  getTotalQuoteCount(): number {
    return this.totalQuoteCount();
  }

  getTotalContractCount(): number {
    return this.totalContractCount();
  }

  getTotalProductCount(): number {
    return this.totalProductCount();
  }

  getTotalRfqValue(): number {
    return this.totalRfqValue();
  }

  getTotalQuoteValue(): number {
    return this.totalQuoteValue();
  }

  getTotalContractValue(): number {
    return this.totalContractValue();
  }
}
