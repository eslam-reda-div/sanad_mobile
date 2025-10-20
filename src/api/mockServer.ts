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

let calls: any[] = [];

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
  return [];
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
