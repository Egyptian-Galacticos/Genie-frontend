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
  quote_request_id: number;
  buyer_id: string;
  seller_message: string;
  items?: CreateQuoteItemDto[];
  rfq_id?: number;
  conversation_id?: number;
}

export interface CreateQuoteItemDto {
  product_id: number;
  quantity: number;
  unit_price: number;
  notes: string;
}

export interface IRequestForQuote {
  id: number;
  quote: string;
  status: string;
  date: string;
  buyer: ICompany;
  initial_product: Partial<IProduct>;
  quantity?: number;
  unit_price?: number;
}

//products
export interface createProductDto {
  brand?: string;
  currency: string;
  description: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  hs_code?: string;
  model_number?: string;
  name: string;
  origin: string;
  price: number;
  price_tiers:
    | {
        from_quantity: number | null;
        to_quantity: number | null;
        price: number | null;
      }[]
    | null;
  sample_available: boolean;
  sample_price?: number;
  sku: string;
  tags?: string[] | null;
  weight: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  slug: string;
  status: 'active' | 'inactive' | string;
  icon: string;
  icon_url: string;
  image_url: string;
  thumbnail_url: string;
  level: number;
  parent_id: number | null;
  parent: Category | null;
  path: string | null;
  children: Category[];
  creator: {
    id: number;
    full_name: string;
  };
  updater: {
    id: number;
    full_name: string;
  } | null;
  created_at: string;
  updated_at: string;
  seo_metadata: {
    title: string;
    description: string;
    keywords: string;
    og_title: string;
    og_description: string;
  };
}

export interface ImageFile {
  id: number;
  name: string;
  file_name: string;
  url: string;
  thumbnail_url: string;
  size: string;
  mime_type: string;
}

export interface IProduct {
  id: number;
  brand: string;
  model_number: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  currency: string;
  is_featured: boolean;
  is_active: boolean;
  is_approved: boolean;
  sample_available: boolean;
  sample_price: number;
  seller: string;
  main_image: ImageFile;
  images: ImageFile[];
  hs_code: string;
  sku: string;
  origin: string;
  weight: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  tiers: {
    from_quantity: number;
    to_quantity: number;
    price: number;
  }[];
  tags: string[];
  category: Category;
  category_id: number;
}
export interface CreateCategoryInProduct {
  id: number;
  parent_id: number;
  parent: CreateCategoryInProduct;
  name: string;
}
