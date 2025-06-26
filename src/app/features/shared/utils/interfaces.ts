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

export interface IPriceTier {
  from_quantity: number | null;
  to_quantity: number | null;
  price: number | null;
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
