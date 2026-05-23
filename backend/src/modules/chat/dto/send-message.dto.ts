import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SendMessageRequest {
  @ApiProperty({
    description: 'Texto del mensaje. Opcional si se adjunta una imagen.',
    example: 'Gaste 20 soles en taxi',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(4000)
  content?: string;
}
