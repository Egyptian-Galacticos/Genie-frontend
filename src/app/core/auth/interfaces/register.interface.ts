export type UserRole = 'buyer' | 'seller' | 'admin';

export interface CountryOption {
  label: string;
  value: string;
}

export interface UserRoleOption {
  label: string;
  value: 'buyer' | 'seller' | 'both';
}

export interface CompanyFormData {
  name: string;
  email: string;
  company_phone: string;
  role: 'buyer' | 'seller' | 'both';
  streetAddress: string;
  city: string;
  stateProvince: string;
  zipPostalCode: string;
  country: string;
}

export interface AdminFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone_number: string;
  commercialRegistration?: string;
  taxId?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
}

export interface RegistrationData {
  roles: string[];
  user: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone_number: string | null;
  };
  company: {
    name: string;
    email: string;
    tax_id?: string;
    company_phone: string;
    commercial_registration?: string;
    address: Address;
  };
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  data: {
    user: {
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
      created_at: string;
      updated_at: string;
      company: {
        id: number;
        name: string;
        email: string;
        tax_id: string;
        company_phone: string;
        commercial_registration: string;
        website?: string | null;
        description?: string | null;
        logo?: string | null;
        is_email_verified: boolean;
        address: Address;
      };
    };
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}
