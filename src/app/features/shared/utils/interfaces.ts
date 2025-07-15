import { TableLazyLoadEvent } from 'primeng/table';

/* user interfaces */
export interface IUser {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  is_email_verified: boolean;
  status: string;
  last_login_at: string | null;
  roles: string[];
  company?: ICompany | null;
  created_at: string;
  updated_at: string;
}

export interface ICompany {
  id: number;
  name: string;
  email: string;
  tax_id: string | null;
  tax_id_images: MediaResource[] | null;
  company_phone: string | null;
  commercial_registration: string | null;
  commercial_registration_images: MediaResource[] | null;
  website: string | null;
  description: string | null;
  logo: MediaResource | null;
  address: string | null;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
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
export interface IQuote {
  id: number;
  rfq_id: number;
  total_price: number;
  seller_message: string;
  conversation_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  total_amount?: number;

  seller?: IUser;
  buyer?: IUser;
  rfq?: RfqDetails;
  items?: IQuoteItem[];
  contract?: ContractDetails;
}
export interface IQuoteItem {
  id: number;
  product_id: number;
  product_name: string | null;
  product_brand: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string;
  subtotal?: number;
}
export interface IRequestForQuote {
  id: number;
  buyer?: IUser;
  seller?: IUser;
  initial_product: IProduct;
  initial_quantity: number;
  shipping_country: string;
  shipping_address: string;
  buyer_message: string;
  status: string;
  date: string; // created_at
  updated_at: string;
  quotes?: IQuote[];
}
export interface CreateQuoteDto {
  quote_request_id: number;
  buyer_id: number;
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

//products

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

export interface IProduct {
  id: number;
  brand: string;
  model_number: string;
  name: string;
  slug: string;
  description: string;
  currency: string;
  is_featured: boolean;
  is_active: boolean;
  is_approved: boolean;
  sample_available: boolean;
  sample_price: number;
  seller: string;
  main_image: MediaResource;
  images: MediaResource[];
  hs_code: string;
  sku: string;
  origin: string;
  weight: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
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

export interface excelRowData extends Partial<IProduct> {
  price_tiers: {
    [key: string]: IPriceTier;
  };
}
export interface IPriceTier {
  from_quantity: number | null;
  to_quantity: number | null;
  price: number | null;
}

export interface CreateProductDto {
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
  price_tiers: IPriceTier[] | null;
  sample_available: boolean;
  sample_price?: number;
  sku: string;
  product_tags?: string[] | null;
  weight: number;
  main_image: string;
  images?: string[];
  documents?: string[];
  specifications?: string[];
  category?: Category;
  category_id: number;
}

export interface ProductWithErrors extends CreateProductDto {
  errors?: string[];
  rowIndex?: number;
}

export interface ExcelRow {
  name?: string | number;
  description?: string | number;
  currency?: string | number;
  origin?: string | number;
  sku?: string | number;
  weight?: string | number;
  'dimensions.length'?: string | number;
  'dimensions.width'?: string | number;
  'dimensions.height'?: string | number;
  main_image?: string | number;
  brand?: string | number;
  model_number?: string | number;
  hs_code?: string | number;
  sample_available?: string | number | boolean;
  sample_price?: string | number;
  product_tags?: string | number;
  images?: string | number;
  documents?: string | number;
  specifications?: string | number;
  category_id: string | number;
  [key: string]: string | number | boolean | undefined; // For dynamic price_tiers properties
}

export interface TemplateData {
  name: string;
  description: string;
  currency: string;
  origin: string;
  sku: string;
  weight: number;
  category_id: number;
  'dimensions.length': number;
  'dimensions.width': number;
  'dimensions.height': number;
  main_image: string;
  brand: string;
  model_number: string;
  hs_code: string;
  sample_available: boolean;
  sample_price: number | string;
  tags: string;
  images: string;
  documents: string;
  specifications: string;
  // Dynamic price tier properties - supports unlimited tiers
  [key: `price_tiers.${number}.from_quantity`]: number;
  [key: `price_tiers.${number}.to_quantity`]: number;
  [key: `price_tiers.${number}.price`]: number;
}

// helper interfaces
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
}
export interface MediaResource {
  id: number;
  name: string;
  file_name: string;
  url: string;
  size: number;
  mime_type: string;
  thumbnail_url?: string;
}
export interface RfqDetails {
  initial_quantity: number;
  shipping_country: string;
  buyer_message: string;
  status: string;
}

export interface ContractDetails {
  id: number;
  contract_number: string;
  status: string;
  total_amount: number;
  contract_date: string;
  estimated_delivery: string;
}

//statistics interfaces
export interface IBuyerStatistics {
  rfqs?: {
    Pending?: {
      count?: number;
      value?: number;
    };
    'In Progress'?: {
      count?: number;
      value?: number;
    };
    Quoted?: {
      count?: number;
      value?: number;
    };
    total?: number;
  };
  quotes?: {
    sent?: {
      count?: number;
      value?: number;
    };
    accepted?: {
      count?: number;
      value?: number;
    };
    total?: number;
  };
  contracts?: {
    approved?: {
      count?: number;
      value?: number;
    };
    total?: number;
  };
}
export interface ISellerStatistics {
  rfqs?: {
    Pending?: {
      count?: number;
      value?: number;
    };
    'In Progress'?: {
      count?: number;
      value?: number;
    };
    Quoted?: {
      count?: number;
      value?: number;
    };
    total?: number;
  };
  quotes?: {
    sent?: {
      count?: number;
      value?: number;
    };
    accepted?: {
      count?: number;
      value?: number;
    };
    total?: number;
  };
  contracts?: {
    approved?: {
      count?: number;
      value?: number;
    };
    total?: number;
  };
  products?: {
    active?: number;
    pending_approval?: number;
    approved?: number;
    featured?: number;
    inactive?: number;
    total?: number;
  };
}
export interface IAdminStatistics {
  rfqs?: {
    Pending?: {
      count?: number;
      value?: number;
    };
    'In Progress'?: {
      count?: number;
      value?: number;
    };
    Quoted?: {
      count?: number;
      value?: number;
    };
    total?: number;
  };
  quotes?: {
    sent?: {
      count?: number;
      value?: number;
    };
    accepted?: {
      count?: number;
      value?: number;
    };
    total?: number;
  };
  contracts?: {
    approved?: {
      count?: number;
      value?: number;
    };
    total?: number;
  };
}

//contract interfaces
export interface CreateContract {
  quote_id: number;
  terms_and_conditions: string; // Min 50, Max 10000 characters
  estimated_delivery?: string; // ISO date string, e.g., '2025-07-15T10:00:00Z'

  shipping_address?: Address;
  billing_address?: Address;

  metadata?: Record<string, string>; // Each value max 1000 characters
}
export interface ContractItem {
  id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications: string;
  product?: IProduct;
}
export interface Contract {
  id: number;
  contract_number: string;
  status: string;
  total_amount: number;
  currency: string;
  contract_date?: string; // ISO string
  estimated_delivery?: string; // ISO string
  shipping_address?: Address;
  billing_address?: Address;
  terms_and_conditions: string;
  metadata?: Record<string, string>;
  seller_transaction_id?: string;
  buyer_transaction_id?: string;
  shipment_url?: string; // Shipment tracking URL
  created_at?: string; // ISO string
  updated_at?: string; // ISO string

  buyer?: IUser;
  seller?: IUser;
  quote?: IQuote;
  items?: ContractItem[];
}
