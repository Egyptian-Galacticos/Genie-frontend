export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category[];
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  parent_id: number | null;
  level: number;
  path: string | null;
  status: string;
  icon: string;
  image_url: string | null;
  icon_url: string;
  thumbnail_url: string | null;
  seo_metadata: {
    title: string;
    robots: string;
    keywords: string;
  };
}
