// Entidad de dominio (modelo puro)
export class Account {
  constructor(
    public readonly id: number,
    public name: string,
    public balance: number,
    public description?: string,
    public readonly createdAt?: Date
  ) {}

  // Métodos de negocio
  public updateBalance(amount: number): void {
    this.balance += amount;
  }

  public canBeDeleted(): boolean {
    // Regla de negocio: solo se puede eliminar si balance es 0
    return this.balance === 0;
  }

  public get formattedBalance(): string {
    return `S/ ${this.balance.toFixed(2)}`;
  }
}
