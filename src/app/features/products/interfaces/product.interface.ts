export interface MediaFile {
  id: string;
  name: string;
  file_name: string;
  url: string;
  thumbnail_url?: string;
  size: string;
  mime_type: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  slug: string;
  parent_id?: number;
  level: number;
  path?: string;
  status: string;
  icon: string;
  image: MediaFile;
  parent?: Category;
  children: Category[];
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: number;
  name: string;
  email: string;
  tax_id: string;
  company_phone: string;
  commercial_registration?: string;
  website?: string;
  description?: string;
  logo?: MediaFile;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface PriceTier {
  from_quantity: string;
  to_quantity: string;
  price: string;
}

export interface Product {
  id: number;
  brand: string;
  model_number: string;
  seller_id?: number;
  seller: {
    company: Company;
  };
  sku?: string;
  name: string;
  slug: string;
  description: string;
  hs_code?: string;
  weight?: string;
  currency: string;
  origin?: string;
  category_id?: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  tags: string[];
  specifications?: MediaFile[];
  certifications?: MediaFile[];
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  is_featured: boolean;
  is_active: boolean;
  is_approved: boolean;
  sample_available: boolean;
  sample_price: string;
  in_wishlist?: boolean;
  main_image?: MediaFile;
  images: MediaFile[];
  documents?: MediaFile[];
  media_counts?: {
    main_image: number;
    images: number;
    documents: number;
  };
  tiers?: PriceTier[];
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
  meta: {
    totalPages: number;
    limit: number;
    total: number;
    has_more_pages: boolean;
  };
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
}

export interface ProductFilters {
  search?: string;
  category_id?: number;
  brand?: string;
  price_min?: number;
  price_max?: number;
  is_featured?: boolean;
  sample_available?: boolean;
}

export interface ProductSort {
  field: 'name' | 'created_at' | 'is_featured';
  direction: 'asc' | 'desc';
}

export interface ProductsApiRequest {
  page?: number;
  size?: number;
  sortFields?: string;
  sortOrders?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface ApiFilter {
  field: string;
  value: string | number | boolean;
  mode: 'equals' | 'contains' | 'gte' | 'lte' | 'startsWith' | 'endsWith';
}

export interface ProductQuery {
  filters: ProductFilters;
  sort: ProductSort;
  page: number;
  size: number;
}

export interface WishlistRequest {
  product_id: number;
}

export interface AddToWishlistResponse {
  success: boolean;
  message: string;
  data: Product;
}

export interface RemoveFromWishlistResponse {
  success: boolean;
  message: string;
  data: null;
}
