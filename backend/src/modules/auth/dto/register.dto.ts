import { IsString, MinLength } from 'class-validator';

export class RegisterRequest {
  @IsString()
  name: string;

  @IsString()
  lastname: string;

  @IsString()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
