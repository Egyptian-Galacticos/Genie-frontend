export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
}

export interface Company {
  id: number;
  name: string;
  email: string;
  tax_id: string;
  company_phone: string;
  commercial_registration: string;
  website: string | null;
  description: string | null;
  logo: string | null;
  address: Address;
  is_email_verified: boolean;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string;
  is_email_verified: boolean;
  status: 'active' | 'suspended' | 'pending';
  last_login_at: string | null;
  roles: string[];
  company: Company;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    expires_in: number;
  };
}
