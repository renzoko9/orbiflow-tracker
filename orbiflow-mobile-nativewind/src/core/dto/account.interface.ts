export interface Account {
  id: number;
  name: string;
  balance: string;
  description: string | null;
  icon: string;
  color: string;
  userId: number;
  createdAt: string;
}

export interface CreateAccountRequest {
  name: string;
  balance?: number;
  description?: string;
  icon?: string;
  color?: string;
}

export interface UpdateAccountRequest {
  name?: string;
  balance?: number;
  description?: string;
  icon?: string;
  color?: string;
}
