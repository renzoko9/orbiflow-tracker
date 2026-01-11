// Entidad de dominio para categorías
export class Category {
  constructor(
    public readonly id: number,
    public name: string,
    public icon?: string,
    public color?: string,
    public isGlobal: boolean = false,
    public readonly createdAt?: Date,
  ) {}

  public get displayName(): string {
    return this.isGlobal ? `${this.name} (Global)` : this.name;
  }
}
