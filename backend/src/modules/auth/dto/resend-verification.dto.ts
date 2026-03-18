import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendVerificationRequest {
  @ApiProperty({
    description: 'Email del usuario registrado',
    example: 'juan.perez@example.com',
  })
  @IsEmail()
  email: string;
}
