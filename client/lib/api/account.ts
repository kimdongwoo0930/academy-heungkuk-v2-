import instance from './instance';
import { ApiResponse } from '@/types/api';

export interface AccountInfo {
  id: number;
  userId: string;
  username: string;
  role: string;
  state: boolean;
  createdAt: string;
}

export interface CreateAccountRequest {
  userId: string;
  password: string;
  username: string;
}

export async function createAccount(data: CreateAccountRequest): Promise<AccountInfo> {
  const res = await instance.post<ApiResponse<AccountInfo>>('/v1/admin/accounts', data);
  return res.data.data;
}

export async function getAccounts(): Promise<AccountInfo[]> {
  const res = await instance.get<ApiResponse<AccountInfo[]>>('/v1/admin/accounts');
  return res.data.data;
}

export async function toggleAccountState(id: number): Promise<void> {
  await instance.patch(`/v1/admin/accounts/${id}/state`);
}

export async function updateAccountRole(id: number, role: string): Promise<void> {
  await instance.patch(`/v1/admin/accounts/${id}/role`, { role });
}

export async function deleteAccount(id: number): Promise<void> {
  await instance.delete(`/v1/admin/accounts/${id}`);
}
