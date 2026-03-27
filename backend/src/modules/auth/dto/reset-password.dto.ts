import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordRequest {
  @ApiProperty({
    description: 'Código de 6 dígitos enviado por correo',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'Nueva contraseña del usuario',
    example: 'NuevaContraseña123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
