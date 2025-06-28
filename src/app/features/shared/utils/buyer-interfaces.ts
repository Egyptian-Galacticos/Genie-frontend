export interface IBuyerCompany {
  id: string | number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface IBuyerMedia {
  id: string | number;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  alt_text?: string;
}

export interface IBuyerRequestForQuote {
  id: string | number;
  buyer: IBuyerUser;
  seller: IBuyerUser;
  initial_product: IBuyerProduct;
  initial_quantity: number;
  shipping_country: string;
  shipping_address: string;
  buyer_message: string | null;
  status: string;
  date: string;
  updated_at: string;
  quotes: IBuyerQuote[];
}

export interface IBuyerUser {
  id: string | number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  is_email_verified: boolean;
  status: string;
  last_login_at: string | null;
  roles: string[];
  created_at: string;
  updated_at: string;
  company?: IBuyerCompany;
}

export interface IBuyerProduct {
  id: string | number;
  brand: string;
  model_number: string;
  seller_id: string | number;
  sku: string;
  name: string;
  slug: string;
  description: string;
  hs_code: string;
  price: string;
  currency: string;
  origin: string;
  specifications?: {
    material?: string;
    warranty?: string;
    certification?: string;
  };
  dimensions: {
    unit: string;
    width: number;
    height: number;
    length: number;
  };
  is_active: boolean;
  is_approved: boolean;
  is_featured: boolean;
  sample_available: boolean;
  sample_price: string;
  created_at: string;
  updated_at: string;
  category_id: number;
  media: IBuyerMedia[];
}

export interface IBuyerQuote {
  id: string | number;
  rfq_id?: string | number;
  quote_request_id?: string | number;
  seller_id: string | number;
  buyer_id: string | number;
  seller_message: string;
  status: string;
  created_at: string;
  updated_at: string;
  seller?: IBuyerUser;
  quote_items?: IBuyerQuoteItem[];
  items?: IBuyerQuoteItem[];
  total_amount?: number;
  total_price?: string | number;
  rfq?: {
    initial_quantity: number;
    shipping_country: string;
    buyer_message: string | null;
    status: string;
  };
}

export interface IBuyerQuoteItem {
  id: string | number;
  quote_id?: string | number;
  product_id: string | number;
  product_name?: string;
  product_brand?: string;
  quantity: number;
  unit_price: number | string;
  total_price?: number;
  notes: string;
  product?: Partial<IBuyerProduct>;
  subtotal?: number;
}
