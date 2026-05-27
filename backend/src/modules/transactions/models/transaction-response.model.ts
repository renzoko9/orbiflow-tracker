import { TransactionTypeEnum } from '@Enums';

export class TransactionResponse {
  id: number;
  amount: number;
  description: string;
  type: TransactionTypeEnum;
  date: string;
  categoryName: string | null;
  accountName: string;
  photos: string[];
}

export class TransactionDetailResponse {
  id: number;
  amount: number;
  description: string;
  type: TransactionTypeEnum;
  date: string;
  category: {
    id: number;
    name: string;
    icon: string;
    color: string;
    type: TransactionTypeEnum;
  } | null;
  account: {
    id: number;
    name: string;
    balance: number;
  };
  transferGroupId: string | null;
  photos: string[];
  createdAt: string;
}

export interface MovementListResponse {
  kind: 'movement';
  id: number;
  amount: number;
  description: string;
  type: TransactionTypeEnum;
  date: string;
  category: {
    id: number;
    name: string;
    icon: string;
    color: string;
    type: TransactionTypeEnum;
  } | null;
  accountId: number;
  accountName: string;
}

export interface TransferListResponse {
  kind: 'transfer';
  transferGroupId: string;
  amount: number;
  description: string;
  date: string;
  sourceAccount: { id: number; name: string };
  destinationAccount: { id: number; name: string };
}

export type TransactionListResponse =
  | MovementListResponse
  | TransferListResponse;

export interface AccountMovementListResponse {
  kind: 'movement';
  id: number;
  amount: number;
  description: string;
  type: TransactionTypeEnum;
  date: string;
  category: {
    id: number;
    name: string;
    icon: string;
    color: string;
    type: TransactionTypeEnum;
  } | null;
  accountId: number;
  accountName: string;
  transferGroupId: string | null;
  counterpartyAccount: { id: number; name: string } | null;
}

export class TransferDetailResponse {
  transferGroupId: string;
  amount: number;
  description: string;
  date: string;
  sourceAccount: { id: number; name: string; balance: number };
  destinationAccount: { id: number; name: string; balance: number };
  createdAt: string;
}
