import { Controller, Get, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAccessGuard } from '@/common/jwt/access-token/jwt-access.guard';
import { User } from '@/common/decorators/user.decorator';
import { InsightsService } from '../services/insights.service';
import { InsightStatsService } from '../services/insight-stats.service';
import { InsightResponse } from '../dto/insight-response.dto';
import { InsightStatsResponse } from '../dto/insight-stats.dto';

@Controller('insights')
@UseGuards(JwtAccessGuard)
export class InsightsController {
  constructor(
    private readonly insightsService: InsightsService,
    private readonly insightStatsService: InsightStatsService,
  ) {}

  @Throttle({ default: { ttl: 60000, limit: 30 } })
  @Get('stats')
  async getStats(@User('id') userId: number): Promise<InsightStatsResponse> {
    return this.insightStatsService.getStats(userId);
  }

  @Throttle({ default: { ttl: 60000, limit: 6 } })
  @Get('monthly')
  async getMonthly(@User('id') userId: number): Promise<InsightResponse> {
    return this.insightsService.getMonthlyInsight(userId);
  }

  @Throttle({ default: { ttl: 60000, limit: 6 } })
  @Get('accounts')
  async getAccounts(@User('id') userId: number): Promise<InsightResponse> {
    return this.insightsService.getAccountsInsight(userId);
  }
}
