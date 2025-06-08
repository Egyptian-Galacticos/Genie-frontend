import { TableLazyLoadEvent } from 'primeng/table';

export interface ISellerQuote {
  id: string;
  quote: string;
  status: string;
  date: string;
  buyer: ICompany;
  product: Partial<IProduct>;
}

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
