/**
 * 계정 더미 데이터 in-memory store
 * lib/api/account.ts 함수와 시그니처 동일
 */

export interface AccountInfo {
  id: number;
  userId: string;
  username: string;
  role: string;
  state: boolean;
  createdAt: string;
}

const initialAccounts: AccountInfo[] = [
  { id: 1, userId: 'admin',     username: '관리자',   role: 'ROLE_ADMIN', state: true,  createdAt: '2026-01-01T00:00:00' },
  { id: 2, userId: 'ehddn0930', username: '동우',     role: 'ROLE_ADMIN', state: true,  createdAt: '2026-01-05T09:00:00' },
  { id: 3, userId: 'user01',    username: '김지수',   role: 'ROLE_USER',  state: true,  createdAt: '2026-02-10T10:30:00' },
  { id: 4, userId: 'user02',    username: '박성민',   role: 'ROLE_USER',  state: true,  createdAt: '2026-02-15T14:00:00' },
  { id: 5, userId: 'user03',    username: '이하늘',   role: 'ROLE_USER',  state: false, createdAt: '2026-03-01T09:00:00' },
  { id: 6, userId: 'user04',    username: '최민서',   role: 'ROLE_USER',  state: false, createdAt: '2026-03-10T11:00:00' },
];

let _accounts: AccountInfo[] = [...initialAccounts];

export async function getAccounts(): Promise<AccountInfo[]> {
  return [..._accounts];
}

export async function toggleAccountState(id: number): Promise<void> {
  _accounts = _accounts.map((a) => (a.id === id ? { ...a, state: !a.state } : a));
}

export async function updateAccountRole(id: number, role: string): Promise<void> {
  _accounts = _accounts.map((a) => (a.id === id ? { ...a, role } : a));
}

export async function deleteAccount(id: number): Promise<void> {
  _accounts = _accounts.filter((a) => a.id !== id);
}
