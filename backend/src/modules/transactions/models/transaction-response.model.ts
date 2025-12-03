import { CategoryType } from 'src/common/enum/category-type.enum';

export class CategoryResponse {
  id: number;
  name: string;
  type: CategoryType;
}

export class AccountResponse {
  id: number;
  name: string;
  balance: number;
}

export class TransactionResponse {
  id: number;
  amount: number;
  description: string;
  type: CategoryType;
  date: string;
  category: CategoryResponse | null;
  account: AccountResponse;
  createdAt: Date;
}

export class TransactionListResponse {
  id: number;
  amount: number;
  description: string;
  type: CategoryType;
  typeName: string;
  date: string;
  categoryId: number | null;
  categoryName: string | null;
  accountId: number;
  accountName: string;
  createdAt: Date;
}
