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
  date: string;
  category: {
    id: number;
    name: string;
    icon: string;
    color: string;
    type: CategoryTypeEnum;
  } | null;
  accountId: number;
  accountName: string;
}
