import { Controller, Get, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAccessGuard } from '@/common/jwt/access-token/jwt-access.guard';
import { User } from '@/common/decorators/user.decorator';
import { InsightsService } from '../services/insights.service';
import { MonthlyInsightResponse } from '../dto/insight-response.dto';

@Controller('insights')
@UseGuards(JwtAccessGuard)
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Throttle({ default: { ttl: 60000, limit: 6 } })
  @Get('monthly')
  async getMonthly(
    @User('id') userId: number,
  ): Promise<MonthlyInsightResponse> {
    return this.insightsService.getMonthlyInsight(userId);
  }
}
