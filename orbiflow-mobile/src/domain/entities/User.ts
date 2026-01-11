// Entidad de dominio para usuario
export class User {
  constructor(
    public readonly id: number,
    public email: string,
    public name: string,
    public readonly createdAt?: Date,
  ) {}

  public get initials(): string {
    return this.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
