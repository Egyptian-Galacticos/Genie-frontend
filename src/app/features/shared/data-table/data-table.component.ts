import { Component, input, model, output, TemplateRef } from '@angular/core';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { dataTableColumn, IRequestForQuote } from '../utils/interfaces';
import { MultiSelectModule } from 'primeng/multiselect';
import { SortMeta } from 'primeng/api';
import { RequestOptions } from '../../../core/interfaces/api.interface';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { SkeletonModule } from 'primeng/skeleton';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-data-table',
  imports: [
    TableModule,
    MultiSelectModule,
    FormsModule,
    ButtonModule,
    BadgeModule,
    SkeletonModule,
    NgTemplateOutlet,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
})
export class DataTableComponent<T = IRequestForQuote> {
  data = model.required<T[]>();
  rows = model.required<number>();
  multiSortMeta = model.required<SortMeta[]>();
  totalRecords = model.required<number>();
  cols = input.required<dataTableColumn[]>();
  dataLoading = input.required<boolean>();
  loadDataEvent = output<RequestOptions>();
  bodyTemplate = input.required<TemplateRef<unknown>>();

  loadData(event: TableLazyLoadEvent) {
    const requestOptions = this.buildRequestOptions(event);

    this.loadDataEvent.emit(requestOptions);
  }

  clear(table: Table) {
    table.clear();
  }

  private buildRequestOptions(event: TableLazyLoadEvent): RequestOptions {
    if (!event.rows) event.rows = 10;
    const options: RequestOptions = {
      params: {
        page: Math.floor((event.first || 0) / event.rows) + 1,
        size: event.rows,
      },
    };
    if (event.multiSortMeta && event.multiSortMeta.length > 0) {
      const sortFields = event.multiSortMeta.map(sort => sort.field).join(',');
      const sortOrders = event.multiSortMeta
        .map(sort => (sort.order === 1 ? 'asc' : 'desc'))
        .join(',');
      options.params = { ...options.params, sortFields, sortOrders };
    }
    if (event.filters) {
      Object.keys(event.filters).forEach(key => {
        const filter = event.filters![key];

        if (Array.isArray(filter)) {
          filter.forEach((f, index: number) => {
            if (f.value !== null && f.value !== undefined && f.value !== '' && options.params) {
              options.params[`filter_${key}_${index}`] = f.value.toString();
              options.params[`filter_${key}_${index}_mode`] = f.matchMode || 'contains';
            }
          });
        } else if (
          filter &&
          filter.value !== null &&
          filter.value !== undefined &&
          filter.value !== '' &&
          options.params
        ) {
          options.params[`filter_${key}`] = filter.value.toString();
          options.params[`filter_${key}_mode`] = filter.matchMode || 'contains';
        }
      });
    }
    if (event.globalFilter) {
      const globalFilterValue = Array.isArray(event.globalFilter)
        ? event.globalFilter.join(',')
        : event.globalFilter;

      if (globalFilterValue.trim() !== '') {
        options.params = { ...options.params, globalFilter: globalFilterValue };
      }
    }
    return options;
  }
}
