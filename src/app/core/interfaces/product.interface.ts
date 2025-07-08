export interface CategoryBrief {
  name: string;
  id: number;
}

export interface SellerCompany {
  name: string;
  logo: string | null;
}

export interface Seller {
  company: SellerCompany;
}

export interface ProductImage {
  id: number;
  name: string;
  file_name: string;
  url: string;
  thumbnail_url: string;
  size: number;
  mime_type: string;
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
  name: string;
  slug: string;
  description: string;
  weight?: string;
  currency: string;
  is_featured: boolean;
  is_active: boolean;
  is_approved: boolean;
  in_wishlist?: boolean;
  sample_available: boolean;
  sample_price: string;
  category: CategoryBrief;
  tiers?: PriceTier[];
  tags?: string[];
  seller: Seller;
  main_image: ProductImage | null;
  images: ProductImage[];
}

export interface WishlistMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  has_more_pages: boolean;
}

export interface WishlistResponse {
  success: boolean;
  message: string;
  data: Product[];
  meta: WishlistMeta;
}
