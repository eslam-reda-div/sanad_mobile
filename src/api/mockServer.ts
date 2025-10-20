/**
 * Simple in-memory mock server helpers for development.
 * Not for production. Replace with real API calls via `src/api/client.ts`.
 */

type User = { id: string; name: string; email: string; phone?: string; age?: number; disability?: string; location?: string; };

let mockUser: User | null = { id: 'u1', name: 'Demo User', email: 'demo@sanad.app' };

let helpers = [
  { id: 'h1', name: 'Ali', phone: '0100000001', relationship: 'Son', priority: 1 },
  { id: 'h2', name: 'Mona', phone: '0100000002', relationship: 'Daughter', priority: 2 },
];

let devices = [
  { uuid: '11111111-1111-4111-8111-111111111111', image: null, version: '1.0.0', customer_id: 'u1' },
];

let calls: any[] = [
  {
    uuid: 'c1234567-1234-4123-8123-123456789abc',
    customer_id: 'u1',
    device_id: '11111111-1111-4111-8111-111111111111',
    twilio_call_sid: 'CA1234567890abcdef1234567890abcdef',
    status: 'completed',
    initiated_at: new Date(Date.now() - 3600000).toISOString(),
    ringing_at: new Date(Date.now() - 3598000).toISOString(),
    answered_at: new Date(Date.now() - 3595000).toISOString(),
    completed_at: new Date(Date.now() - 3400000).toISOString(),
    duration_seconds: 195,
    help_requested: false,
    outcome: 'successful',
    trigger_metadata: { trigger_type: 'button_press', location: 'living_room' },
    call_metadata: { helper_name: 'Ali', helper_phone: '0100000001' },
    retry_count: 0,
  },
  {
    uuid: 'c2345678-2345-4234-8234-234567890bcd',
    customer_id: 'u1',
    device_id: '11111111-1111-4111-8111-111111111111',
    twilio_call_sid: 'CA2345678901bcdef2345678901bcdef0',
    status: 'failed',
    initiated_at: new Date(Date.now() - 7200000).toISOString(),
    ringing_at: new Date(Date.now() - 7198000).toISOString(),
    duration_seconds: 0,
    help_requested: true,
    outcome: 'no_answer',
    trigger_metadata: { trigger_type: 'emergency', location: 'bedroom' },
    error_message: 'No helper answered the call',
    retry_count: 2,
  },
  {
    uuid: 'c3456789-3456-4345-8345-3456789abcde',
    customer_id: 'u1',
    device_id: '11111111-1111-4111-8111-111111111111',
    twilio_call_sid: 'CA3456789012cdef3456789012cdef01',
    status: 'in-progress',
    initiated_at: new Date(Date.now() - 300000).toISOString(),
    ringing_at: new Date(Date.now() - 298000).toISOString(),
    answered_at: new Date(Date.now() - 295000).toISOString(),
    help_requested: true,
    trigger_metadata: { trigger_type: 'button_press', location: 'kitchen' },
    call_metadata: { helper_name: 'Mona', helper_phone: '0100000002' },
    retry_count: 0,
  },
];

export async function authLogin(email: string, password: string) {
  // accept any credentials for mock
  return { token: 'mock-token', user: mockUser };
}

export async function authRegister(payload: any) {
  const uid = 'u' + Math.random().toString(36).slice(2);
  mockUser = { 
    id: uid, 
    name: payload.name, 
    email: payload.email, 
    phone: payload.phone,
    age: payload.age,
    disability: payload.disability,
    location: payload.location,
  };
  return { token: 'mock-token', user: mockUser };
}

export async function getMe() {
  return mockUser;
}

export async function getHelpers() {
  return helpers;
}

export async function addHelper(data: any) {
  const h = { id: 'h' + Math.random().toString(36).slice(2), ...data };
  helpers.push(h);
  return h;
}

export async function updateHelper(id: string, data: any) {
  helpers = helpers.map((h) => (h.id === id ? { ...h, ...data } : h));
  return helpers.find((h) => h.id === id);
}

export async function deleteHelper(id: string) {
  helpers = helpers.filter((h) => h.id !== id);
  return { success: true };
}

export async function reorderHelpers(orderIds: string[]) {
  helpers = orderIds.map((id, idx) => {
    const found = helpers.find((h) => h.id === id);
    if (found) return { ...found, priority: idx + 1 };
    return { id, name: '', phone: '', relationship: '', priority: idx + 1 };
  });
  return { success: true };
}

export async function getDevices() {
  return devices;
}

export async function assignDevice(uuid: string) {
  const existing = devices.find((d) => d.uuid === uuid);
  if (existing) return existing;
  const device = { uuid, image: null, version: '1.0.0', customer_id: mockUser?.id || 'unknown' };
  devices.push(device);
  return device;
}

export async function deleteDevice(uuid: string) {
  devices = devices.filter((d) => d.uuid !== uuid);
  return { success: true };
}

export async function getCalls(page = 1, limit = 20) {
  return calls.slice((page - 1) * limit, page * limit);
}

export async function triggerCall() {
  const callUuid = 'c' + Math.random().toString(36).slice(2);
  const call = {
    uuid: callUuid,
    device_id: devices[0]?.uuid || '',
    status: 'initiated',
    initiated_at: new Date().toISOString(),
    twilio_call_sid: 'CA' + Math.random().toString(36).slice(2),
  };
  calls.unshift(call);
  return call;
}

export async function getHelpersCalls() {
  return [
    {
      uuid: 'hc1234567-1234-4123-8123-123456789def',
      helper_id: 'h1',
      customer_id: 'u1',
      customer_call_id: 'c1234567-1234-4123-8123-123456789abc',
      twilio_call_sid: 'CA4567890123def4567890123def012',
      reason: 'Emergency assistance needed',
      priority: 1,
      status: 'answered',
      initiated_at: new Date(Date.now() - 1800000).toISOString(),
      ringing_at: new Date(Date.now() - 1798000).toISOString(),
      answered_at: new Date(Date.now() - 1795000).toISOString(),
      completed_at: new Date(Date.now() - 1600000).toISOString(),
      duration_seconds: 195,
      accepted: true,
      response: 'on_my_way',
      call_metadata: { location: 'living_room', urgency: 'high' },
      retry_count: 0,
    },
    {
      uuid: 'hc2345678-2345-4234-8234-234567890efg',
      helper_id: 'h2',
      customer_id: 'u1',
      customer_call_id: 'c2345678-2345-4234-8234-234567890bcd',
      twilio_call_sid: 'CA5678901234efg5678901234efg123',
      reason: 'Routine check-in',
      priority: 2,
      status: 'no-answer',
      initiated_at: new Date(Date.now() - 5400000).toISOString(),
      ringing_at: new Date(Date.now() - 5398000).toISOString(),
      duration_seconds: 30,
      accepted: false,
      call_metadata: { location: 'bedroom' },
      error_message: 'Helper did not answer',
      retry_count: 1,
    },
    {
      uuid: 'hc3456789-3456-4345-8345-3456789fghi',
      helper_id: 'h1',
      customer_id: 'u1',
      customer_call_id: 'c3456789-3456-4345-8345-3456789abcde',
      twilio_call_sid: 'CA6789012345fgh6789012345fgh234',
      reason: 'Button pressed for help',
      priority: 1,
      status: 'busy',
      initiated_at: new Date(Date.now() - 900000).toISOString(),
      ringing_at: new Date(Date.now() - 898000).toISOString(),
      duration_seconds: 0,
      accepted: false,
      response: 'busy',
      call_metadata: { location: 'kitchen', trigger_type: 'button_press' },
      error_message: 'Helper was busy',
      retry_count: 0,
    },
  ];
}

export async function updateProfile(data: { name: string; phone: string; age?: number; disability?: string; location?: string; }) {
  if (!mockUser) {
    throw new Error('User not logged in');
  }
  const updatedUser: User = {
    id: mockUser.id,
    email: mockUser.email,
    name: data.name,
    phone: data.phone,
    age: data.age,
    disability: data.disability,
    location: data.location,
  };
  mockUser = updatedUser;
  return updatedUser;
}

export async function changePassword(oldPassword: string, newPassword: string) {
  // Mock validation: accept any old password for now
  if (!oldPassword || !newPassword) {
    throw new Error('Passwords are required');
  }
  // In real implementation, would verify old password and update
  return { success: true };
}
