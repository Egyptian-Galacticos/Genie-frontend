import { TableLazyLoadEvent } from 'primeng/table';

export interface IBuyer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}

export interface ICompany {
  id: string;
  user_id: string;
  name: string;
  logo: string;
  description: string;
  website?: string;
  email: string;
  tax_id?: string;
  company_phone?: string;
  commercial_registration?: string;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
}

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

export interface CustomTableLazyLoadEvent extends TableLazyLoadEvent {
  customProperty?: string;
}

export interface dataTableColumn {
  field: string;
  header: string;
  sortableColumn?: boolean;
  filterableColumn?: boolean;
  filterType?: string;
  matchMode?: string;
  filterPlaceholder?: string;
  options?: string[];
}

/**quotation interfaces */

export interface CreateQuoteDto {
  quote_request_id: string;
  buyer_id: string;
  seller_message: string;
  quote_items?: CreateQuoteItemDto[];
}

export interface CreateQuoteItemDto {
  product_id: string;
  quantity: number;
  unit_price: number;
  notes: string;
}

export interface IRequestForQuote {
  id: string;
  quote: string;
  status: string;
  date: string;
  buyer: ICompany;
  product: Partial<IProduct>;
  quantity?: number;
  unit_price?: number;
}
