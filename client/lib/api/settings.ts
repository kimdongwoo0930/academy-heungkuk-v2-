import instance from './instance';
import { ApiResponse } from '@/types/api';

export async function getSettings(): Promise<Record<string, string>> {
  const res = await instance.get<ApiResponse<Record<string, string>>>('/v1/admin/settings');
  return res.data.data ?? {};
}

export async function saveSettings(settings: Record<string, string>): Promise<void> {
  await instance.put('/v1/admin/settings', { settings });
}
