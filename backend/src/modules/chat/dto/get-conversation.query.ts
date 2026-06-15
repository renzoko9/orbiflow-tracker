import { IsInt, IsOptional, IsPositive, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetConversationQuery {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  before?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number;
}
