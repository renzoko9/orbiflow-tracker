import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordRequest {
  @ApiProperty({
    description: 'Email del usuario registrado',
    example: 'juan.perez@example.com',
  })
  @IsEmail()
  email: string;
}
