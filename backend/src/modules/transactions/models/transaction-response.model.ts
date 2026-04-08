import { CategoryTypeEnum } from '@Enums';

export class TransactionResponse {
  id: number;
  amount: number;
  description: string;
  type: CategoryTypeEnum;
  date: string;
  categoryName: string | null;
  accountName: string;
}

export class TransactionListResponse {
  id: number;
  amount: number;
  description: string;
  type: CategoryTypeEnum;
  typeName: string;
  date: string;
  categoryId: number | null;
  categoryName: string | null;
  accountId: number;
  accountName: string;
  createdAt: Date;
}
