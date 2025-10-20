// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// Customer Types
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  age?: number | null;
  location?: string | null;
  disability?: string | null;
  avatar_url?: string | null;
  avatar_full_url?: string | null;
  meta?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

// Auth Types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  age?: number;
  location?: string;
  disability?: string;
}

export interface LoginRequest {
  identifier: string; // email or phone
  password: string;
}

export interface AuthResponse {
  token: string;
  customer: Customer;
}

export interface ResetPasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

// Device Types
export interface Device {
  id: number;
  uuid: string;
  version: string;
  image_url: string;
  image_full_url?: string;
  customer_id: number;
  meta?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface AddDeviceRequest {
  uuid: string;
}

export interface UpdateDeviceRequest {
  meta: Record<string, any>;
}

// Helper Types
export interface Helper {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  location?: string | null;
  age?: number | null;
  avatar_url?: string | null;
  avatar_full_url?: string | null;
  meta?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  pivot?: {
    customer_id: number;
    helper_id: number;
    priority: number;
    notes?: string | null;
  };
}

export interface AddHelperRequest {
  name: string;
  email: string;
  phone_number: string;
  location?: string;
  age?: number;
  avatar?: File | null;
  priority?: number;
}

export interface UpdateHelperRequest {
  name?: string;
  email?: string;
  phone_number?: string;
  location?: string;
  age?: number;
  avatar?: File | null;
  priority?: number;
}

// Customer Call Types
export interface CustomerCall {
  id: number;
  uuid: string;
  customer_id: number;
  device_id: number;
  twilio_call_sid?: string | null;
  status: string;
  initiated_at?: string | null;
  ringing_at?: string | null;
  answered_at?: string | null;
  completed_at?: string | null;
  duration_seconds?: number | null;
  help_requested: boolean;
  outcome?: string | null;
  trigger_metadata?: Record<string, any> | null;
  call_metadata?: Record<string, any> | null;
  error_message?: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
  device?: Device;
  helper_calls?: HelperCall[];
}

// Helper Call Types
export interface HelperCall {
  id: number;
  uuid: string;
  helper_id: number;
  customer_id: number;
  customer_call_id: number;
  twilio_call_sid?: string | null;
  reason?: string | null;
  priority: number;
  status: string;
  initiated_at?: string | null;
  ringing_at?: string | null;
  answered_at?: string | null;
  completed_at?: string | null;
  duration_seconds?: number | null;
  accepted: boolean;
  response?: string | null;
  call_metadata?: Record<string, any> | null;
  error_message?: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
  helper?: Helper;
  customer_call?: {
    id: number;
    uuid: string;
    status: string;
  };
}

// Profile Types
export interface ProfileData {
  customer: Customer;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone_number?: string;
  age?: number;
  location?: string;
  disability?: string;
}

// Home Screen Types
export interface HomeData {
  customer: Customer & {
    helpers: Helper[];
    devices: Device[];
    customer_calls: CustomerCall[];
    helper_calls: HelperCall[];
  };
  helpers_count: number;
  devices_count: number;
  customer_calls_count: number;
  helper_calls_count: number;
}

export interface TriggerCallResponse {
  response: {
    message: string;
    customer_call_id: number;
    customer_call_uuid: string;
    status: string;
    timestamp: string;
  };
}

// List Response Types
export interface DevicesData {
  devices: Device[];
}

export interface HelpersData {
  helpers: Helper[];
}

export interface CustomerCallsData {
  customer_calls: CustomerCall[];
}

export interface HelperCallsData {
  helper_calls: HelperCall[];
}

// Error Response
export interface ErrorResponse {
  success: boolean;
  message: string;
  data?: Record<string, string[]>;
}
