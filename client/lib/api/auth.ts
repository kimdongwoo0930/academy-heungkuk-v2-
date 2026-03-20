import instance from './instance';
import { ApiResponse } from '@/types/api';
import { LoginRequest, LoginResponse, SignupRequest, SignupResponse } from '@/types/auth';

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await instance.post<ApiResponse<LoginResponse>>('/v1/auth/login', data);
  return res.data.data;
};

export const signup = async (data: SignupRequest): Promise<SignupResponse> => {
  const res = await instance.post<ApiResponse<SignupResponse>>('/v1/auth/signup', data);
  return res.data.data;
};
