/**
 * API types matching Molt Coach backend contracts
 */

export type Goal = 'fat_loss' | 'muscle_gain' | 'maintenance' | 'recomp';

export interface Coach {
  id: string;
  name: string;
  email: string;
  role: string;
  gymName: string;
  clientCount: number;
}

export interface Client {
  id: string;
  name: string;
  goal: Goal;
  startDateISO: string;
  heightCm: number;
  avatarColor: string;
}

export interface ClientsResponse {
  items: Client[];
}

export interface WeightEntry {
  id: string;
  clientId: string;
  dateISO: string;
  weightKg: number;
  note?: string | null;
  source?: string;
  createdAtISO?: string;
  isPending?: boolean; // For optimistic updates
}

export interface WeightEntriesResponse {
  items: WeightEntry[];
}

export type GirthSite = 'waist' | 'chest' | 'hip' | 'arm' | 'thigh';

export interface GirthEntry {
  id: string;
  clientId: string;
  dateISO: string;
  site: GirthSite;
  valueMm: number;
  source?: string;
  createdAtISO?: string;
}

export interface GirthEntriesResponse {
  items: GirthEntry[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  coach: Coach;
}

export interface AddWeightPayload {
  dateISO: string;
  weightKg: number;
  note?: string;
}

export interface ApiErrorBody {
  error: {
    code: 'VALIDATION_FAILED' | 'DUPLICATE_DATE' | 'INVALID_CREDENTIALS' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'SERVICE_UNAVAILABLE' | string;
    field?: string;
    message: string;
  };
}

export type RangeFilterKey = '7D' | '30D' | '90D' | 'All';
export type WeightUnit = 'kg' | 'lb';
