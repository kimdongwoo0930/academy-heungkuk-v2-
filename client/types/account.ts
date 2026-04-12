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
