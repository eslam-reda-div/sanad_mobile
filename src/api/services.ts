import api from './client';
import type {
    AddDeviceRequest,
    AddHelperRequest,
    ApiResponse,
    AuthResponse,
    CustomerCall,
    CustomerCallsData,
    Device,
    DevicesData,
    Helper,
    HelperCall,
    HelperCallsData,
    HelpersData,
    HomeData,
    LoginRequest,
    ProfileData,
    RegisterRequest,
    ResetPasswordRequest,
    TriggerCallResponse,
    UpdateDeviceRequest,
    UpdateHelperRequest,
    UpdateProfileRequest,
} from './types';

// ==================== AUTH ENDPOINTS ====================

export const authApi = {
  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/api/v1/customer/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/api/v1/customer/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await api.post('/api/v1/customer/auth/logout');
    return response.data;
  },

  deleteAccount: async (): Promise<ApiResponse<null>> => {
    const response = await api.post('/api/v1/customer/auth/delete');
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<null>> => {
    const response = await api.post('/api/v1/customer/auth/reset_password', data);
    return response.data;
  },
};

// ==================== PROFILE ENDPOINTS ====================

export const profileApi = {
  getData: async (): Promise<ApiResponse<ProfileData>> => {
    const response = await api.get('/api/v1/customer/screen/profile/data');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<ProfileData>> => {
    const response = await api.post('/api/v1/customer/screen/profile/update', data);
    return response.data;
  },

  updateAvatar: async (file: File): Promise<ApiResponse<ProfileData & { avatar_url: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/api/v1/customer/screen/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ==================== HOME ENDPOINTS ====================

export const homeApi = {
  getData: async (): Promise<ApiResponse<HomeData>> => {
    const response = await api.get('/api/v1/customer/screen/home/data');
    return response.data;
  },

  triggerCall: async (customerId: number): Promise<ApiResponse<TriggerCallResponse>> => {
    const response = await api.get(`/api/v1/customer/screen/home/trigger/call/${customerId}`);
    return response.data;
  },
};

// ==================== DEVICES ENDPOINTS ====================

export const devicesApi = {
  getData: async (): Promise<ApiResponse<DevicesData>> => {
    const response = await api.get('/api/v1/customer/screen/devices/data');
    return response.data;
  },

  getDevice: async (deviceId: number): Promise<ApiResponse<{ device: Device }>> => {
    const response = await api.get(`/api/v1/customer/screen/devices/${deviceId}`);
    return response.data;
  },

  addDevice: async (data: AddDeviceRequest): Promise<ApiResponse<{ device: Device }>> => {
    const response = await api.post('/api/v1/customer/screen/devices/add', data);
    return response.data;
  },

  updateDevice: async (deviceId: number, data: UpdateDeviceRequest): Promise<ApiResponse<{ device: Device }>> => {
    const response = await api.post(`/api/v1/customer/screen/devices/${deviceId}/update`, data);
    return response.data;
  },

  deleteDevice: async (deviceId: number): Promise<ApiResponse<{}>> => {
    const response = await api.delete(`/api/v1/customer/screen/devices/${deviceId}/delete`);
    return response.data;
  },
};

// ==================== HELPERS ENDPOINTS ====================

export const helpersApi = {
  getData: async (): Promise<ApiResponse<HelpersData>> => {
    const response = await api.get('/api/v1/customer/screen/helpers/data');
    return response.data;
  },

  getHelper: async (helperId: number): Promise<ApiResponse<{ helper: Helper }>> => {
    const response = await api.get(`/api/v1/customer/screen/helpers/${helperId}`);
    return response.data;
  },

  addHelper: async (data: AddHelperRequest): Promise<ApiResponse<{ helper: Helper }>> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone_number', data.phone_number);
    
    if (data.location) formData.append('location', data.location);
    if (data.age) formData.append('age', data.age.toString());
    if (data.priority !== undefined) formData.append('priority', data.priority.toString());
    if (data.avatar) formData.append('avatar', data.avatar);

    const response = await api.post('/api/v1/customer/screen/helpers/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateHelper: async (helperId: number, data: UpdateHelperRequest): Promise<ApiResponse<{ helper: Helper }>> => {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    if (data.phone_number) formData.append('phone_number', data.phone_number);
    if (data.location) formData.append('location', data.location);
    if (data.age) formData.append('age', data.age.toString());
    if (data.priority !== undefined) formData.append('priority', data.priority.toString());
    if (data.avatar) formData.append('avatar', data.avatar);

    const response = await api.post(`/api/v1/customer/screen/helpers/${helperId}/update`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteHelper: async (helperId: number): Promise<ApiResponse<{}>> => {
    const response = await api.delete(`/api/v1/customer/screen/helpers/${helperId}/delete`);
    return response.data;
  },
};

// ==================== CUSTOMER CALLS ENDPOINTS ====================

export const customerCallsApi = {
  getData: async (): Promise<ApiResponse<CustomerCallsData>> => {
    const response = await api.get('/api/v1/customer/screen/customer-calls/data');
    return response.data;
  },

  getCall: async (callId: number): Promise<ApiResponse<{ customer_call: CustomerCall }>> => {
    const response = await api.get(`/api/v1/customer/screen/customer-calls/${callId}`);
    return response.data;
  },

  deleteCall: async (callId: number): Promise<ApiResponse<{}>> => {
    const response = await api.delete(`/api/v1/customer/screen/customer-calls/${callId}/delete`);
    return response.data;
  },
};

// ==================== HELPER CALLS ENDPOINTS ====================

export const helperCallsApi = {
  getData: async (): Promise<ApiResponse<HelperCallsData>> => {
    const response = await api.get('/api/v1/customer/screen/helper-calls/data');
    return response.data;
  },

  getCall: async (callId: number): Promise<ApiResponse<{ helper_call: HelperCall }>> => {
    const response = await api.get(`/api/v1/customer/screen/helper-calls/${callId}`);
    return response.data;
  },

  deleteCall: async (callId: number): Promise<ApiResponse<{}>> => {
    const response = await api.delete(`/api/v1/customer/screen/helper-calls/${callId}/delete`);
    return response.data;
  },
};
