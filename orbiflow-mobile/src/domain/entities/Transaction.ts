// Entidad de dominio para transacciones
export type TransactionType = 'income' | 'expense';

export class Transaction {
  constructor(
    public readonly id: number,
    public amount: number,
    public type: TransactionType,
    public description: string,
    public accountId: number,
    public categoryId: number,
    public date: Date,
    public readonly createdAt?: Date,
  ) {}

  public get formattedAmount(): string {
    const prefix = this.type === 'income' ? '+' : '-';
    return `${prefix}$${Math.abs(this.amount).toFixed(2)}`;
  }

  public isIncome(): boolean {
    return this.type === 'income';
  }

  public isExpense(): boolean {
    return this.type === 'expense';
  }

  public get formattedDate(): string {
    return this.date.toLocaleDateString();
  }
}
