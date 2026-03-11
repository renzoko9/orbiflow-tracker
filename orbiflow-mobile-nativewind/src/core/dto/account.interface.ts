export interface Account {
  id: number;
  name: string;
  balance: number;
  description: string | null;
  userId: number;
  createdAt: string;
}

export interface CreateAccountRequest {
  name: string;
  balance?: number;
  description?: string;
}

export interface UpdateAccountRequest {
  name?: string;
  balance?: number;
  description?: string;
}
