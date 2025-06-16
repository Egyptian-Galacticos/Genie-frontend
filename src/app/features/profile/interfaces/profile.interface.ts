export interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string;
  is_email_verified: boolean;
  status: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
}

export interface CompanyLogo {
  id: number;
  name: string;
  file_name: string;
  url: string;
  thumbnail_url: string;
  size: number;
  mime_type: string;
}

export interface Company {
  id: number;
  name: string;
  email: string;
  tax_id: string | null;
  company_phone: string;
  commercial_registration: string | null;
  website: string | null;
  description: string | null;
  logo: CompanyLogo | null;
  address: CompanyAddress;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  user: User;
  company: Company;
  roles: string[];
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ProfileApiResponse extends User {
  roles: string[];
  company: Company;
}

export type UserUpdateRequest = Partial<
  Pick<User, 'first_name' | 'last_name' | 'phone_number' | 'email'>
>;

export interface MessageResponse {
  success: boolean;
  message: string;
}
