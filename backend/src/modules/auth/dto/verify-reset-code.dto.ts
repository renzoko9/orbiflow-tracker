import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyResetCodeRequest {
  @ApiProperty({
    description: 'Código de 6 dígitos enviado por correo',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
