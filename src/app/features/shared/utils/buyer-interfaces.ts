export interface IBuyerCompany {
  id: string | number;
  name: string;
  email: string;
  tax_id: string;
  company_phone: string;
  commercial_registration: string | null;
  website: string;
  description: string;
  logo: string | null;
  address: {
    city: string;
    state: string;
    street: string;
    country: string;
    postal_code: string;
  };
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface IBuyerMedia {
  id: string | number;
  name: string;
  file_name: string;
  url: string;
  size: number;
  mime_type: string;
  thumbnail_url: string;
}

export interface IBuyerRequestForQuote {
  id: string | number;
  buyer: IBuyerUser;
  seller: IBuyerUser;
  initial_product: IBuyerProduct;
  initial_quantity: number;
  shipping_country: string;
  shipping_address: string | null;
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
  company: IBuyerCompany;
}

export interface IBuyerProduct {
  id: string | number;
  brand: string;
  model_number: string;
  name: string;
  slug: string;
  description: string;
  weight: string;
  currency: string;
  is_featured: boolean;
  is_active: boolean;
  is_approved: boolean;
  sample_available: boolean;
  sample_price: string;
  main_image: IBuyerMedia;
  images: IBuyerMedia[];
}

export interface IBuyerQuote {
  id: string | number;
  rfq_id: string | number;
  total_price: string | number;
  seller_message: string | null;
  conversation_id: string | number | null;
  seller: IBuyerUser;
  buyer: IBuyerUser;
  status: string;
  created_at: string;
  updated_at: string;
  rfq: {
    initial_quantity: number;
    shipping_country: string;
    buyer_message: string | null;
    status: string;
  };
  items: IBuyerQuoteItem[];
  total_amount?: number;
  quote_items?: IBuyerQuoteItem[];
}

export interface IBuyerQuoteItem {
  id: string | number;
  product_id: string | number;
  product_name: string;
  product_brand: string;
  quantity: number;
  unit_price: string | number;
  total_price: number;
  notes: string;
  subtotal?: number;
}
