import instance from './instance';
import { DashboardData } from '@/types/dashboard';

export async function getDashboard(): Promise<DashboardData> {
  const res = await instance.get<{ data: DashboardData }>('/v1/admin/dashboard');
  return res.data.data;
}
