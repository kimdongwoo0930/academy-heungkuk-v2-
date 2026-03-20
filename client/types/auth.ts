export interface LoginRequest {
  userId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SignupRequest {
  userId: string;
  password: string;
  username: string;
}

export interface SignupResponse {
  id: number;
  userId: string;
  username: string;
  role: string;
  state: boolean;
}
